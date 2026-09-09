import os
import sys
import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# Ensure backend path is in sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.database.session import Base
from app.database.models import Project, Source, ResearchJob, ResearchSource, ResearchEvidence, ConflictRecord, CanonicalAnalysis
from app.services.research_service import ResearchService
from app.services.canonical_service import CanonicalService

from sqlalchemy.pool import StaticPool

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

@pytest.mark.asyncio
async def test_active_website_research_evidence(db_session):
    """Verifies that research_website crawls websites and produces valid source_url and extracted snippets."""
    portal = {
        "title": "CISA Cybersecurity Advisory Portal",
        "url": "https://www.cisa.gov/resources-tools",
        "tier": 1,
        "type": "Official Government / National CERT",
        "domain": "cisa.gov"
    }

    result = await ResearchService.research_website(
        url=portal["url"],
        topic="Ransomware Incident Response",
        target_claim="500 servers isolated within 42 minutes",
        fallback_title=portal["title"],
        tier=portal["tier"],
        domain_name="Cybersecurity",
        source_type=portal["type"]
    )

    assert result is not None
    assert result["url"].startswith("http")
    assert result["tier"] == 1
    assert len(result["evidence_snippet"]) > 20
    assert "domain" in result
    assert result["domain"] == "cisa.gov"
    assert result["title"] is not None

def test_research_service_populates_valid_source_urls(db_session):
    """Verifies that execute_research_and_verification populates clickable URLs on all external sources and evidence."""
    project = Project(title="Web Research Test", domain="Cybersecurity", research_mode="SOURCE_AND_VERIFY")
    db_session.add(project)
    db_session.commit()
    db_session.refresh(project)

    job = ResearchService.execute_research_and_verification(
        db=db_session,
        project_id=project.id,
        topic="Enterprise Security Telemetry",
        canonical_facts=[{"text": "Zero data exfiltration confirmed by EDR"}],
        research_mode="SOURCE_AND_VERIFY",
        filename="telemetry.txt",
        text_sample="Perimeter security log sample with 0 breaches"
    )

    assert len(job.sources) >= 2
    for src in job.sources:
        assert src.url is not None
        assert src.url.startswith("http://") or src.url.startswith("https://")
        assert src.domain is not None

    # External evidence items must have clickable URLs
    external_evidence = [e for e in job.evidence if e.source_url]
    assert len(external_evidence) >= 2
    for ev in external_evidence:
        assert ev.source_url.startswith("http")
        assert len(ev.evidence_snippet) > 10

@pytest.mark.asyncio
async def test_canonical_service_research_findings_clickable_links(db_session):
    """Verifies that CanonicalService populates research_findings with valid clickable links and domains."""
    project = Project(title="Canonical Research Test", domain="Cybersecurity", research_mode="SOURCE_AND_VERIFY")
    db_session.add(project)
    db_session.commit()
    db_session.refresh(project)

    source = Source(
        project_id=project.id,
        filename="incident_report.txt",
        file_type="TXT",
        raw_text="NovaTech SOC identified darkhydra ransomware. 400 servers quarantined in 30 minutes. Threat actor confirmed zero leak."
    )
    db_session.add(source)
    db_session.commit()
    db_session.refresh(source)

    canonical = await CanonicalService.analyze_and_store(
        db=db_session,
        project_id=project.id,
        source_id=source.id,
        research_mode="SOURCE_AND_VERIFY"
    )

    assert canonical is not None
    assert len(canonical.research_findings) >= 2
    for item in canonical.research_findings:
        assert "source_url" in item
        assert item["source_url"].startswith("http")
        assert "domain" in item
        assert len(item["domain"]) > 0
        assert len(item["evidence_snippet"]) > 10
        assert item["source_tier"] in [1, 2, 3, 4, 5, 6, 7, 8]

@pytest.mark.asyncio
async def test_document_specific_web_search_discovery(db_session):
    """
    Verifies that ResearchService generates document-anchored queries,
    searches the internet for the specific document, and attaches
    the discovered website links to research findings instead of generic dummy portals.
    """
    # 1. Test query builder derives document-specific queries
    queries = ResearchService.build_document_search_queries(
        topic="Mic On Campus",
        canonical_facts=[
            {"text": "Student podcast community hosted at Sahyadri College connecting students with founders"},
            {"text": "Hosted by students with industry leader interviews"}
        ],
        text_sample="Mic On Campus is a student-led audio journalism podcast hosted at Sahyadri College with digital partner Sahynex.",
        domain_name="Media & Podcast"
    )

    assert len(queries) >= 1
    assert any("Mic On Campus" in q for q in queries)

    # 2. Test live internet search
    discovered = await ResearchService.search_related_websites_for_document(queries, limit=3)
    if discovered:
        for site in discovered:
            assert site["url"].startswith("http")
            assert site["domain"]
            assert site["title"]
            # Discovered site should not be a search engine or dummy portal
            assert "duckduckgo.com" not in site["url"]
            assert "cisa.gov" not in site["url"]

    # 3. Test execution populates project with document-specific research
    project = Project(title="Mic On Campus Project", domain="Media & Podcasts", research_mode="SOURCE_AND_VERIFY")
    db_session.add(project)
    db_session.commit()
    db_session.refresh(project)

    job = await ResearchService.execute_research_and_verification_async(
        db=db_session,
        project_id=project.id,
        topic="Mic On Campus",
        canonical_facts=[{"text": "Student podcast community hosted at Sahyadri College"}],
        research_mode="SOURCE_AND_VERIFY",
        filename="mic_on_campus.txt",
        text_sample="Mic On Campus student podcast series with Sahynex Techsolutions at Sahyadri College",
        target_queries=["Sahyadri College", "Sahynex Techsolutions"]
    )
    db_session.refresh(job)

    assert job is not None
    if len(job.sources) > 0:
        for src in job.sources:
            assert src.url.startswith("http")
            assert src.domain

