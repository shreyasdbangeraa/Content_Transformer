import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.database.models import Base, Project, Source, Transformation, Output, OutputVersion, ContentVersionRecord
from app.utils.crypto_hasher import hash_content, normalize_content_for_hashing
from app.services.blockchain_service import BlockchainService

# Setup in-memory SQLite database for testing
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

@pytest.fixture(autouse=True)
def setup_test_db():
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)

def get_test_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()

def test_deterministic_sha256_hashing():
    """Verify that deterministic hashing normalizes line endings and whitespace identically."""
    text_1 = "Executive Briefing: Incident Report\r\n\r\n500 systems were affected.\r\nResponse time: 42 minutes."
    text_2 = "Executive Briefing: Incident Report\n\n500 systems were affected.\nResponse time: 42 minutes."
    text_3 = "Executive Briefing: Incident Report  \n\n  500 systems were affected.  \nResponse time: 42 minutes.  "
    
    hash_1 = hash_content(text_1)
    hash_2 = hash_content(text_2)
    hash_3 = hash_content(text_3)
    
    assert hash_1["algorithm"] == "SHA-256"
    assert hash_1["hash"].startswith("0x")
    assert len(hash_1["hash"]) == 66
    assert hash_1["hash"] == hash_2["hash"], "CRLF and LF must produce identical SHA-256 hashes"
    assert hash_1["hash"] == hash_3["hash"], "Trailing whitespace variations must produce identical SHA-256 hashes"

def test_tampered_content_produces_different_hash():
    """Verify that any tampering changes the cryptographic digest."""
    original = "Critical Finding: 500 systems affected."
    tampered = "Critical Finding: 50 systems affected."
    
    h_orig = hash_content(original)["hash"]
    h_tamp = hash_content(tampered)["hash"]
    
    assert h_orig != h_tamp, "Modified content must produce a distinct hash digest"

def test_version_registration_and_hash_chain():
    """Verify sequential version creation and immutable parent pointer linkage (V1 -> V2 -> V3)."""
    db = TestingSessionLocal()
    content_id = "OUTPUT-TEST-001"
    
    # 1. Register Version 1 (AI Transformation)
    v1_text = "V1: Initial executive draft regarding NovaTech security incident."
    rec_v1 = BlockchainService.register_content_version(
        db=db,
        content_id=content_id,
        content=v1_text,
        action_type="AI_TRANSFORMATION",
        version_number=1,
        version_tag="V1",
        created_by="AI_Engine"
    )
    
    assert rec_v1.version_tag == "V1"
    assert rec_v1.previous_hash == BlockchainService.GENESIS_HASH
    assert rec_v1.blockchain_status == "CONFIRMED"
    assert rec_v1.transaction_hash.startswith("0x")
    
    # 2. Register Version 2 (Human Edit)
    v2_text = "V2: Revised executive draft with verified 42-minute containment metric."
    rec_v2 = BlockchainService.register_content_version(
        db=db,
        content_id=content_id,
        content=v2_text,
        action_type="HUMAN_EDIT",
        version_number=2,
        version_tag="V2",
        created_by="User"
    )
    
    assert rec_v2.version_tag == "V2"
    assert rec_v2.previous_hash == rec_v1.content_hash, "V2 must point to V1's hash as parent"
    assert rec_v2.content_hash != rec_v1.content_hash
    
    # 3. Register Version 3 (Approved & Published)
    v3_text = "V3: Certified final release with IoC firewall signatures."
    rec_v3 = BlockchainService.register_content_version(
        db=db,
        content_id=content_id,
        content=v3_text,
        action_type="APPROVED",
        version_number=3,
        version_tag="V3",
        created_by="Compliance_Lead"
    )
    
    assert rec_v3.version_tag == "V3"
    assert rec_v3.previous_hash == rec_v2.content_hash, "V3 must point to V2's hash as parent"
    
    # 4. Verify full history retrieval
    history = BlockchainService.get_content_history(db=db, content_id=content_id)
    assert len(history) == 3
    assert history[0]["version_tag"] == "V1"
    assert history[1]["version_tag"] == "V2"
    assert history[2]["version_tag"] == "V3"
    assert history[1]["previous_hash"] == history[0]["content_hash"]
    assert history[2]["previous_hash"] == history[1]["content_hash"]
    db.close()

def test_content_verification_verified_vs_modified():
    """Verify that verification returns VERIFIED on match and MODIFIED on tampering."""
    db = TestingSessionLocal()
    content_id = "OUTPUT-VERIFY-002"
    genuine_text = "Official Security Advisory: Air-gapped backup restoration complete."
    
    # Anchor on blockchain
    BlockchainService.register_content_version(
        db=db,
        content_id=content_id,
        content=genuine_text,
        action_type="AI_TRANSFORMATION",
        version_number=1,
        version_tag="V1"
    )
    
    # Case A: Verify with genuine content -> VERIFIED
    verify_ok = BlockchainService.verify_content(
        db=db,
        content_id=content_id,
        current_content=genuine_text,
        version_tag="V1"
    )
    assert verify_ok["status"] == "VERIFIED"
    assert verify_ok["is_valid"] is True
    assert verify_ok["registered_hash"] == verify_ok["current_hash"]
    
    # Case B: Verify with tampered content -> MODIFIED
    tampered_text = "Official Security Advisory: Air-gapped backup restoration complete. [TAMPERED CONTENT INJECTION]"
    verify_tampered = BlockchainService.verify_content(
        db=db,
        content_id=content_id,
        current_content=tampered_text,
        version_tag="V1"
    )
    assert verify_tampered["status"] == "MODIFIED"
    assert verify_tampered["is_valid"] is False
    assert verify_tampered["registered_hash"] != verify_tampered["current_hash"]
    db.close()

def test_simulate_tamper_and_restore():
    """Verify hackathon demo workflow: simulate database tampering and restore verified head."""
    db = TestingSessionLocal()
    
    # Create project and output in DB
    proj = Project(title="Demo Project", domain="Cybersecurity")
    db.add(proj)
    db.flush()
    
    trans = Transformation(project_id=proj.id, canonical_id="can_123")
    db.add(trans)
    db.flush()
    
    original_text = "Clean authentic deliverable text."
    out = Output(
        transformation_id=trans.id,
        format_type="linkedin",
        raw_content=original_text,
        version=1,
        status="APPROVED"
    )
    db.add(out)
    db.flush()
    
    out_ver = OutputVersion(
        output_id=out.id,
        version_number=1,
        content=original_text,
        change_reason="Initial"
    )
    db.add(out_ver)
    db.flush()
    
    # Anchor on blockchain
    BlockchainService.register_content_version(
        db=db,
        content_id=out.id,
        content=original_text,
        action_type="APPROVED",
        version_number=1,
        version_tag="V1",
        project_id=proj.id
    )
    
    # 1. Simulate tampering
    BlockchainService.simulate_tamper(db=db, content_id=out.id)
    assert "UNAUTHORIZED DATABASE TAMPERING" in out.raw_content
    
    # Verification must now fail
    verify_tampered = BlockchainService.verify_content(db=db, content_id=out.id, current_content=out.raw_content)
    assert verify_tampered["status"] == "MODIFIED"
    
    # 2. Restore verified original
    BlockchainService.restore_original(db=db, content_id=out.id, version_tag="V1")
    assert out.raw_content == original_text
    
    # Verification must now pass
    verify_restored = BlockchainService.verify_content(db=db, content_id=out.id, current_content=out.raw_content)
    assert verify_restored["status"] == "VERIFIED"
    db.close()

def test_integrity_stats_and_network_status():
    """Verify stats aggregation and live EVM network telemetry."""
    db = TestingSessionLocal()
    stats = BlockchainService.get_integrity_stats(db=db)
    assert "total_verified" in stats
    assert "total_blockchain_records" in stats
    assert "status" in stats
    
    net_status = BlockchainService.get_network_status()
    assert net_status["status"] == "ONLINE"
    assert net_status["latest_block"] > 1000000
    assert net_status["immutable"] is True
    db.close()
