import os
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from app.database.session import get_db
from app.database.models import (
    Project, Source, CanonicalAnalysis, Transformation, Output,
    FactCheck, QualityScore, AuditLog, OutputVersion,
    ResearchJob, ResearchSource, ResearchEvidence, ConflictRecord, BrandProfile
)
from app.schemas.project import ProjectCreate, ProjectResponse, ProjectUpdate
from app.services.canonical_service import CanonicalService
from app.services.transformation_service import TransformationService
from app.services.research_service import ResearchService

router = APIRouter(prefix="/projects", tags=["Projects"])

@router.get("", response_model=List[Dict[str, Any]])
def list_projects(db: Session = Depends(get_db)):
    projects = db.query(Project).order_by(Project.created_at.desc()).all()
    results = []
    for p in projects:
        sources_count = db.query(Source).filter(Source.project_id == p.id).count()
        outputs_count = db.query(Output).join(Transformation).filter(Transformation.project_id == p.id).count()
        approved_count = db.query(Output).join(Transformation).filter(Transformation.project_id == p.id, Output.status == "APPROVED").count()
        published_count = db.query(Output).join(Transformation).filter(Transformation.project_id == p.id, Output.status == "PUBLISHED").count()
        conflicts_count = db.query(ConflictRecord).join(ResearchJob).filter(ResearchJob.project_id == p.id).count()
        
        results.append({
            "id": p.id,
            "title": p.title,
            "description": p.description,
            "organization_name": p.organization_name,
            "domain": p.domain,
            "research_mode": p.research_mode,
            "brand_profile_id": p.brand_profile_id,
            "status": p.status,
            "created_at": p.created_at,
            "updated_at": p.updated_at,
            "sources_count": sources_count,
            "outputs_count": outputs_count,
            "approved_count": approved_count,
            "published_count": published_count,
            "conflicts_count": conflicts_count
        })
    return results

@router.post("", response_model=ProjectResponse)
def create_project(payload: ProjectCreate, db: Session = Depends(get_db)):
    project = Project(
        title=payload.title,
        description=payload.description,
        organization_name=payload.organization_name or "Acme Operations",
        domain=payload.domain or "Auto-Detect",
        research_mode=payload.research_mode or "SOURCE_AND_VERIFY",
        brand_profile_id=payload.brand_profile_id
    )
    db.add(project)
    
    audit = AuditLog(
        project_id=project.id,
        action="PROJECT_CREATED",
        actor="Operator",
        details={
            "title": project.title,
            "domain": project.domain,
            "research_mode": project.research_mode,
            "organization": project.organization_name
        }
    )
    db.add(audit)
    
    db.commit()
    db.refresh(project)
    return project

@router.patch("/{project_id}", response_model=ProjectResponse)
def update_project(project_id: str, payload: ProjectUpdate, db: Session = Depends(get_db)):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    if payload.title is not None:
        project.title = payload.title
    if payload.description is not None:
        project.description = payload.description
    if payload.organization_name is not None:
        project.organization_name = payload.organization_name
    if payload.domain is not None:
        project.domain = payload.domain
    if payload.research_mode is not None:
        project.research_mode = payload.research_mode
    if payload.status is not None:
        project.status = payload.status

    db.commit()
    db.refresh(project)
    return project

@router.get("/{project_id}")
def get_project_detail(project_id: str, db: Session = Depends(get_db)):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    sources = db.query(Source).filter(Source.project_id == project_id).all()
    canonical = db.query(CanonicalAnalysis).filter(CanonicalAnalysis.project_id == project_id).order_by(CanonicalAnalysis.created_at.desc()).first()
    transformations = db.query(Transformation).filter(Transformation.project_id == project_id).all()
    research_jobs = db.query(ResearchJob).filter(ResearchJob.project_id == project_id).all()
    conflicts = db.query(ConflictRecord).join(ResearchJob).filter(ResearchJob.project_id == project_id).all()
    
    outputs_data = []
    for t in transformations:
        outs = db.query(Output).filter(Output.transformation_id == t.id).all()
        for o in outs:
            fc = db.query(FactCheck).filter(FactCheck.output_id == o.id).first()
            qs = db.query(QualityScore).filter(QualityScore.output_id == o.id).first()
            outputs_data.append({
                "id": o.id,
                "transformation_id": o.transformation_id,
                "format_type": o.format_type,
                "title": o.title,
                "raw_content": o.raw_content,
                "structured_data": o.structured_data,
                "version": o.version,
                "status": o.status,
                "approval_notes": o.approval_notes,
                "approved_at": o.approved_at,
                "created_at": o.created_at,
                "updated_at": o.updated_at,
                "fact_check": {
                    "total_claims": fc.total_claims if fc else 0,
                    "verified_claims": fc.verified_claims if fc else 0,
                    "partially_supported": fc.partially_supported if fc else 0,
                    "unsupported_claims": fc.unsupported_claims if fc else 0,
                    "contradicted_claims": fc.contradicted_claims if fc else 0,
                    "opinion_creative": fc.opinion_creative if fc else 0,
                    "grounding_score": fc.grounding_score if fc else 100.0,
                    "claims": fc.claims if fc else []
                } if fc else None,
                "quality_score": {
                    "overall_score": qs.overall_score if qs else 92.0,
                    "source_accuracy": qs.source_accuracy if qs else 95.0,
                    "completeness": qs.completeness if qs else 90.0,
                    "audience_fit": qs.audience_fit if qs else 92.0,
                    "readability": qs.readability if qs else 88.0,
                    "tone_consistency": qs.tone_consistency if qs else 94.0,
                    "structure_score": qs.structure_score if qs else 90.0,
                    "research_confidence": qs.research_confidence if qs else 96.0,
                    "safety_score": qs.safety_score if qs else 100.0
                } if qs else None
            })

    return {
        "id": project.id,
        "title": project.title,
        "description": project.description,
        "organization_name": project.organization_name,
        "domain": project.domain,
        "research_mode": project.research_mode,
        "brand_profile_id": project.brand_profile_id,
        "status": project.status,
        "created_at": project.created_at,
        "updated_at": project.updated_at,
        "sources": sources,
        "canonical_analysis": canonical,
        "transformations": transformations,
        "research_jobs": research_jobs,
        "conflicts": conflicts,
        "outputs": outputs_data
    }

@router.delete("/{project_id}")
def delete_project(project_id: str, db: Session = Depends(get_db)):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    db.delete(project)
    db.commit()
    return {"message": "Project deleted successfully"}

@router.post("/demo/novatech", tags=["Demo"])
async def load_novatech_demo(db: Session = Depends(get_db)):
    """
    Instantly creates and populates a complete, realistic NovaTech Systems Cybersecurity Incident Demo Project
    with PDF source, deep canonical analysis with provenance, 8-tier research evidence, conflict detection,
    and all 7 pre-generated communication formats ready for immediate SIH demonstration.
    """
    # 1. Create Project
    project = Project(
        title="NovaTech Systems Ransomware Incident (IR-2026-0812)",
        description="Critical cybersecurity incident response analysis and multi-format transformation for executive, technical, and regulatory stakeholders.",
        organization_name="NovaTech Systems",
        domain="Cybersecurity",
        research_mode="SOURCE_AND_VERIFY"
    )
    db.add(project)
    db.flush()

    # 2. Add Source
    candidates = [
        os.path.abspath("sample-data/novatech_incident_report.txt"),
        os.path.abspath("../sample-data/novatech_incident_report.txt"),
        os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), "sample-data", "novatech_incident_report.txt")
    ]
    raw_text = ""
    for c in candidates:
        if os.path.exists(c):
            with open(c, "r", encoding="utf-8") as f:
                raw_text = f.read()
                break
    
    if not raw_text:
        raw_text = """# NOVATECH SYSTEMS INCIDENT REPORT IR-2026-0812
Date: August 12, 2026 | Severity: Critical CVSS 9.4 | Classification: Restricted
Summary: On August 12, 2026 at 03:14 UTC, NovaTech SOC detected ransomware activity attributed to DarkHydra exploiting legacy VPN gateway host vpn-edge02.novatech-internal.net (IP: 10.240.12.88). Approximately 500 server systems were encrypted. Automated network micro-segmentation contained the blast radius in 42 minutes, ensuring core customer financial records vault remained secure with zero exfiltration. Backup restoration and FIDO2 MFA enforcement are underway."""

    source = Source(
        project_id=project.id,
        filename="novatech_incident_investigation_report.pdf",
        file_type="pdf",
        raw_text=raw_text,
        char_count=len(raw_text),
        page_count=3,
        processing_status="PROCESSED"
    )
    db.add(source)
    db.flush()

    # 3. Canonical Analysis & Research
    canonical = await CanonicalService.analyze_and_store(
        db=db,
        project_id=project.id,
        source_id=source.id,
        provider_name="mock",
        research_mode="SOURCE_AND_VERIFY"
    )

    # 4. Create Transformation for ALL 7 Formats
    transformation = Transformation(
        project_id=project.id,
        canonical_id=canonical.id,
        target_audience="Executive Board & Technical Engineers",
        tone="Professional & Authoritative",
        language="English",
        detail_level="Detailed & Comprehensive",
        communication_objective="Inform & Remediate (Security Event)",
        content_style="Corporate & Government Advisory",
        research_mode="SOURCE_AND_VERIFY",
        requested_formats=[
            "executive_summary",
            "linkedin",
            "twitter",
            "advisory",
            "presentation",
            "infographic",
            "video_package"
        ]
    )
    db.add(transformation)
    db.flush()

    # 5. Execute Multi-Format Transformation
    outputs = await TransformationService.execute_transformation(
        db=db,
        transformation_id=transformation.id,
        provider_name="mock"
    )

    return {
        "status": "SUCCESS",
        "message": "NovaTech Systems Incident Transformation loaded with all 7 formats and evidence grounding.",
        "project_id": project.id,
        "canonical_id": canonical.id,
        "transformation_id": transformation.id,
        "outputs_count": len(outputs),
        "formats_generated": [o.format_type for o in outputs]
    }
