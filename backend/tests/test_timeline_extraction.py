import os
import sys
import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.database.session import Base
from app.database.models import Project, Source
from app.processors.timeline_extractor import TimelineExtractor
from app.services.canonical_service import CanonicalService

TEST_DATABASE_URL = "sqlite:///:memory:"
engine = create_engine(TEST_DATABASE_URL, connect_args={"check_same_thread": False}, poolclass=StaticPool)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

@pytest.fixture(scope="function")
def db_session():
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()
        Base.metadata.drop_all(bind=engine)

def test_timeline_extractor_extracts_dates_from_proposal():
    proposal_text = """
    Mic on Campus ( MOC )
    24.08.2026
    SUBMITTED TO :
    SAHYNEX TECHSOLUTION
    SAHYADRI COLLEGE OF ENGINEERING & MANAGEMENT
    PREPARED BY:
    TEAM MIC ON CAMPUS (MOC)

    Part 1: Placements & Career
    Part 2: Entrepreneurship
    """
    dates, events = TimelineExtractor.extract_timeline(proposal_text, "proposal.pdf")

    assert len(dates) >= 3
    assert len(events) >= 3

    # Verify 24.08.2026 date is captured
    date_strs = [d["date"] for d in dates]
    assert "24.08.2026" in date_strs

    date_obj = next(d for d in dates if d["date"] == "24.08.2026")
    assert "proposal" in date_obj["event"].lower() or "submission" in date_obj["event"].lower()
    assert "sahynex" in date_obj["event"].lower()

    # Verify project phases
    assert any("part 1" in d["date"].lower() for d in dates)
    assert any("part 2" in d["date"].lower() for d in dates)

def test_timeline_extractor_incident_timestamps():
    incident_text = """
    Incident IR-2026-0812
    Date: August 12, 2026
    03:14 UTC: Perimeter intrusion alert triggered on gateway.
    03:56 UTC: Automated subnet containment achieved in 42 minutes.
    August 13, 2026: Air-gapped backup restoration verified.
    August 14, 2026: Final advisory published.
    """
    dates, events = TimelineExtractor.extract_timeline(incident_text, "incident.txt")

    date_values = [d["date"] for d in dates]
    assert "August 12, 2026" in date_values
    assert "August 13, 2026" in date_values
    assert "August 14, 2026" in date_values
    assert "03:14 UTC" in date_values
    assert "03:56 UTC" in date_values

@pytest.mark.asyncio
async def test_canonical_service_enriches_timeline(db_session):
    project = Project(title="Timeline Test Project", domain="General", research_mode="SOURCE_ONLY")
    db_session.add(project)
    db_session.commit()
    db_session.refresh(project)

    source = Source(
        project_id=project.id,
        filename="project_proposal.txt",
        file_type="TXT",
        raw_text="""
        Project Launch Proposal
        Submission Date: 15.09.2026
        Phase 1: Architecture and Prototype
        Phase 2: Production Testing
        Phase 3: General Availability Release on 01.12.2026
        """
    )
    db_session.add(source)
    db_session.commit()
    db_session.refresh(source)

    canonical = await CanonicalService.analyze_and_store(
        db=db_session,
        project_id=project.id,
        source_id=source.id,
        research_mode="SOURCE_ONLY"
    )

    assert canonical is not None
    assert len(canonical.dates) >= 2
    assert len(canonical.events) >= 2

    d_list = [d["date"] for d in canonical.dates]
    assert "15.09.2026" in d_list
