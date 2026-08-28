import os
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from app.database.session import get_db
from app.database.models import Project, Source, CanonicalAnalysis, Transformation, Output, FactCheck, QualityScore, AuditLog, OutputVersion
from app.schemas.project import ProjectCreate, ProjectResponse, ProjectUpdate
from app.services.canonical_service import CanonicalService
from app.services.transformation_service import TransformationService

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
        results.append({
            "id": p.id,
            "title": p.title,
            "description": p.description,
            "domain": p.domain,
            "status": p.status,
            "created_at": p.created_at,
            "updated_at": p.updated_at,
            "sources_count": sources_count,
            "outputs_count": outputs_count,
            "approved_count": approved_count,
            "published_count": published_count
        })
    return results

@router.post("", response_model=ProjectResponse)
def create_project(payload: ProjectCreate, db: Session = Depends(get_db)):
    project = Project(
        title=payload.title,
        description=payload.description,
        domain=payload.domain or "Cybersecurity"
    )
    db.add(project)
    
    audit = AuditLog(
        project_id=project.id,
        action="PROJECT_CREATED",
        actor="Operator",
        details={"title": project.title, "domain": project.domain}
    )
    db.add(audit)
    
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
                    "unsupported_claims": fc.unsupported_claims if fc else 0,
                    "grounding_score": fc.grounding_score if fc else 100.0,
                    "claims": fc.claims if fc else []
                } if fc else None,
                "quality_score": {
                    "overall_score": qs.overall_score if qs else 90.0,
                    "source_accuracy": qs.source_accuracy if qs else 95.0,
                    "completeness": qs.completeness if qs else 90.0,
                    "audience_fit": qs.audience_fit if qs else 92.0,
                    "readability": qs.readability if qs else 88.0,
                    "tone_consistency": qs.tone_consistency if qs else 94.0,
                    "structure_score": qs.structure_score if qs else 90.0
                } if qs else None
            })

    return {
        "id": project.id,
        "title": project.title,
        "description": project.description,
        "domain": project.domain,
        "status": project.status,
        "created_at": project.created_at,
        "updated_at": project.updated_at,
        "sources": sources,
        "canonical_analysis": canonical,
        "transformations": transformations,
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
    Instantly creates and populates a full, realistic NovaTech Systems Cybersecurity Incident Demo Project
    with PDF source, deep canonical analysis, and 5 pre-generated artefacts (Executive Summary, LinkedIn,
    Advisory, Presentation Deck, Infographic) ready for immediate SIH demonstration.
    """
    # 1. Create Project
    project = Project(
        title="NovaTech Systems Ransomware Incident (IR-2026-0812)",
        description="Fictional critical cybersecurity incident response analysis and multi-format transformation for executive, technical, and regulatory stakeholders.",
        domain="Cybersecurity"
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
        raw_text = """# NOVATECH SYSTEMS INC. — INCIDENTIAL RESPONSE REPORT
Document Reference: IR-2026-0812-CRIT | Date: August 14, 2026
On August 12, 2026 at 03:14 UTC, NovaTech Systems' SOC detected a ransomware attack by DarkHydra.
Approximately 500 server systems were encrypted. Subnet isolation was achieved in 42 minutes.
Core customer financial vaults remained secure with zero confirmed exfiltration.
120GB of staged telemetry was blocked by firewalls. Operational downtime lasted 18 hours."""

    source = Source(
        project_id=project.id,
        filename="novatech_incident_report.pdf",
        file_type="pdf",
        file_path="sample-data/novatech_incident_report.pdf",
        raw_text=raw_text,
        char_count=len(raw_text),
        page_count=2,
        meta_info={"is_demo": True, "classification": "RESTRICTED / FICTIONAL"},
        processing_status="PROCESSED"
    )
    db.add(source)
    db.flush()

    # 3. Generate Canonical Analysis
    canonical = await CanonicalService.analyze_and_store(db, project.id, source.id, provider_name="mock")

    # 4. Create Transformation Config
    transformation = Transformation(
        project_id=project.id,
        canonical_id=canonical.id,
        target_audience="Government Cyber Advisory & Executive Board",
        tone="Formal & Authoritative",
        language="English",
        detail_level="Detailed",
        communication_objective="Inform, Warn & Remediate",
        content_style="Corporate & Government Advisory",
        requested_formats=["executive_summary", "linkedin", "advisory", "presentation", "infographic", "video_package"],
        status="READY"
    )
    db.add(transformation)
    db.flush()

    # 5. Execute Multi-Output Generation
    outputs = await TransformationService.execute_transformation(db, transformation.id, provider_name="mock")

    db.commit()
    db.refresh(project)

    return {
        "message": "NovaTech Systems Demo loaded successfully with 6 generated artefacts, source grounding, and fact checks.",
        "project_id": project.id,
        "outputs_count": len(outputs)
    }

@router.get("/{project_id}/audit")
def get_audit_logs(project_id: str, db: Session = Depends(get_db)):
    logs = db.query(AuditLog).filter(AuditLog.project_id == project_id).order_by(AuditLog.timestamp.desc()).all()
    return logs
