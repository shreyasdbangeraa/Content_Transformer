import pytest
import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.database.session import Base
from app.database.models import Project, Source, CanonicalAnalysis, Transformation
from app.services.research_service import ResearchService
from app.services.canonical_service import CanonicalService
from app.generators.executive_summary import ExecutiveSummaryGenerator
from app.ai.mock_provider import MockProvider

TEST_DATABASE_URL = "sqlite:///:memory:"
engine = create_engine(TEST_DATABASE_URL, connect_args={"check_same_thread": False})
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

def test_research_modes_planning():
    claims = [
        {"claim_id": "c1", "text": "500 production servers isolated in 42 minutes"},
        {"claim_id": "c2", "text": "DarkHydra threat group leveraged CVE-2026-1082"},
        {"claim_id": "c3", "text": "Zero customer financial records exfiltrated"}
    ]

    # 1. Mode 1: SOURCE_ONLY
    plan_so = ResearchService.plan_research("NovaTech Incident", claims, "SOURCE_ONLY")
    assert plan_so["research_mode"] == "SOURCE_ONLY"
    assert len(plan_so["search_queries"]) == 0
    assert len(plan_so["questions_to_answer"]) == 0
    assert all(c["provenance"] == "PRIMARY_DOCUMENT_FACT" for c in plan_so["classified_claims"])

    # 2. Mode 2: SOURCE_AND_VERIFY
    plan_sv = ResearchService.plan_research("NovaTech Incident", claims, "SOURCE_AND_VERIFY")
    assert plan_sv["research_mode"] == "SOURCE_AND_VERIFY"
    assert 2 <= len(plan_sv["search_queries"]) <= 3

    # 3. Mode 3: DEEP_RESEARCH
    plan_dr = ResearchService.plan_research("NovaTech Incident", claims, "DEEP_RESEARCH")
    assert plan_dr["research_mode"] == "DEEP_RESEARCH"
    assert len(plan_dr["search_queries"]) >= 6
    assert len(plan_dr["questions_to_answer"]) >= 6

def test_research_modes_execution(db_session):
    project = Project(title="Research Mode Test Project", domain="Cybersecurity", research_mode="SOURCE_AND_VERIFY")
    db_session.add(project)
    db_session.commit()
    db_session.refresh(project)

    source = Source(
        project_id=project.id,
        filename="novatech_incident_report.txt",
        file_type="TXT",
        raw_text="NovaTech Systems incident report. 500 servers isolated within 42 minutes. DarkHydra ransomware attack. Zero financial vault exfiltration."
    )
    db_session.add(source)
    db_session.commit()
    db_session.refresh(source)

    # 1. Test SOURCE_ONLY
    job_so = ResearchService.execute_research_and_verification(
        db=db_session,
        project_id=project.id,
        topic="NovaTech Incident",
        canonical_facts=[{"text": "500 servers isolated"}],
        research_mode="SOURCE_ONLY",
        filename=source.filename,
        text_sample=source.raw_text
    )
    assert len(job_so.sources) == 0
    assert all(e.source_url == "" for e in job_so.evidence)
    assert len(job_so.evidence) >= 1

    # 2. Test SOURCE_AND_VERIFY
    job_sv = ResearchService.execute_research_and_verification(
        db=db_session,
        project_id=project.id,
        topic="NovaTech Incident",
        canonical_facts=[{"text": "500 servers isolated"}],
        research_mode="SOURCE_AND_VERIFY",
        filename=source.filename,
        text_sample=source.raw_text
    )
    assert 2 <= len(job_sv.sources) <= 3
    assert len(job_sv.evidence) >= 2

    # 3. Test DEEP_RESEARCH
    job_dr = ResearchService.execute_research_and_verification(
        db=db_session,
        project_id=project.id,
        topic="NovaTech Incident",
        canonical_facts=[{"text": "500 servers isolated"}],
        research_mode="DEEP_RESEARCH",
        filename=source.filename,
        text_sample=source.raw_text
    )
    assert len(job_dr.sources) >= 6
    assert len(job_dr.evidence) >= 6
    tiers = [s.source_tier for s in job_dr.sources]
    assert 1 in tiers # Gov/CERT Tier
    assert 3 in tiers # Academic Tier

@pytest.mark.asyncio
async def test_canonical_service_provenance_tagging(db_session):
    project = Project(title="Canonical Test", domain="Cybersecurity")
    db_session.add(project)
    db_session.commit()

    source = Source(
        project_id=project.id,
        filename="novatech_incident_report.txt",
        file_type="TXT",
        raw_text="NovaTech Systems incident report. 500 servers isolated in 42 minutes. DarkHydra ransomware group. Zero financial vault loss."
    )
    db_session.add(source)
    db_session.commit()

    # Ingest under SOURCE_ONLY
    canonical_so = await CanonicalService.analyze_and_store(
        db=db_session,
        project_id=project.id,
        source_id=source.id,
        research_mode="SOURCE_ONLY"
    )
    assert canonical_so.provenance_map["research_mode"] == "SOURCE_ONLY"
    assert all(f["provenance"] == "PRIMARY_SOURCE_FACT" for f in canonical_so.key_facts)
    assert "Document Scope & Provenance (Mode: SOURCE_ONLY)" in canonical_so.executive_summary

    # Ingest under DEEP_RESEARCH
    source2 = Source(
        project_id=project.id,
        filename="novatech_incident_report_2.txt",
        file_type="TXT",
        raw_text="NovaTech Systems incident report. 500 servers isolated in 42 minutes. DarkHydra ransomware group. Zero financial vault loss."
    )
    db_session.add(source2)
    db_session.commit()

    canonical_dr = await CanonicalService.analyze_and_store(
        db=db_session,
        project_id=project.id,
        source_id=source2.id,
        research_mode="DEEP_RESEARCH"
    )
    assert canonical_dr.provenance_map["research_mode"] == "DEEP_RESEARCH"
    prov_tags = [f.get("provenance") for f in canonical_dr.key_facts]
    assert "PRIMARY_SOURCE_FACT" in prov_tags
    assert "VERIFIED_EXTERNAL_FACT" in prov_tags
    assert "Deep Multi-Source Research & Intelligence Synthesis (Mode: DEEP_RESEARCH)" in canonical_dr.executive_summary

def test_executive_summary_generator_modes():
    canonical_mock = {
        "title": "NovaTech Cyber Incident",
        "topic": "NovaTech Cyber Incident",
        "executive_summary": "Initial summary content.",
        "key_facts": [{"text": "500 servers", "provenance": "PRIMARY_SOURCE_FACT"}],
        "statistics": [{"metric": "Containment", "value": "42 mins"}],
        "research_findings": [{"source_tier": 1, "source_title": "CISA Advisory", "evidence_snippet": "Corroborated IoCs"}],
        "risks": [{"risk": "Latency", "severity": "MEDIUM"}],
        "recommendations": [{"recommendation": "Enforce MFA", "priority": "CRITICAL"}]
    }

    # SOURCE_ONLY
    dossier_so = ExecutiveSummaryGenerator.render_detailed_3page_summary(canonical_mock, {"research_mode": "SOURCE_ONLY"})
    assert "CONFIDENTIAL / AIR-GAPPED SANDBOX" in dossier_so["raw_content"]
    assert "Mode 1: Source Only" in dossier_so["raw_content"]

    # SOURCE_AND_VERIFY
    dossier_sv = ExecutiveSummaryGenerator.render_detailed_3page_summary(canonical_mock, {"research_mode": "SOURCE_AND_VERIFY"})
    assert "RESTRICTED / EXECUTIVE TIER-1" in dossier_sv["raw_content"]
    assert "Mode 2: Source & Verify" in dossier_sv["raw_content"]

    # DEEP_RESEARCH
    dossier_dr = ExecutiveSummaryGenerator.render_detailed_3page_summary(canonical_mock, {"research_mode": "DEEP_RESEARCH"})
    assert "MULTI-TIER INTELLIGENCE DOSSIER / 8-TIER" in dossier_dr["raw_content"]
    assert "Mode 3: Deep Research" in dossier_dr["raw_content"]
    assert "Deep Multi-Source Comparative Matrix (8-Tier Discovery)" in dossier_dr["raw_content"]

@pytest.mark.asyncio
async def test_mock_provider_formats_differentiation():
    provider = MockProvider()
    canonical_mock = {
        "title": "NovaTech Cyber Incident",
        "topic": "NovaTech Cyber Incident",
        "executive_summary": "Initial summary content.",
        "key_facts": [{"text": "500 servers isolated in 42 minutes", "provenance": "PRIMARY_SOURCE_FACT"}],
        "statistics": [{"metric": "Containment", "value": "42 mins", "context": "Rapid response"}],
        "research_findings": [{"source_tier": 1, "source_title": "CISA Alert AA26-224A", "evidence_snippet": "Threat telemetry matches IoCs"}],
        "recommendations": [{"recommendation": "Enforce FIDO2 keys", "priority": "CRITICAL"}]
    }

    # LinkedIn in SOURCE_ONLY vs DEEP_RESEARCH
    li_so = await provider.generate_artefact(canonical_mock, "linkedin", {"research_mode": "SOURCE_ONLY"})
    assert "[Mode 1: Source Only" in li_so["raw_content"]
    assert "Confidential Air-Gapped Sandbox Mode" in li_so["raw_content"]

    li_dr = await provider.generate_artefact(canonical_mock, "linkedin", {"research_mode": "DEEP_RESEARCH"})
    assert "[Mode 3: Deep Research" in li_dr["raw_content"]
    assert "Multi-Tier Authoritative Corroboration" in li_dr["raw_content"]

    # Presentation in SOURCE_ONLY vs DEEP_RESEARCH
    deck_so = await provider.generate_artefact(canonical_mock, "presentation", {"research_mode": "SOURCE_ONLY"})
    assert "Air-Gapped Confidential Sandbox Mode" in deck_so["raw_content"]

    deck_dr = await provider.generate_artefact(canonical_mock, "presentation", {"research_mode": "DEEP_RESEARCH"})
    assert "Multi-Source Benchmark Analysis & 8-Tier Discovery" in deck_dr["raw_content"]
