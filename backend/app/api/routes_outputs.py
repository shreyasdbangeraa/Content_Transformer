import os
from fastapi import APIRouter, Depends, HTTPException, Body
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from typing import Dict, Any, Optional
from app.database.session import get_db
from app.database.models import Output, OutputVersion, FactCheck, QualityScore
from app.schemas.output import ConversationalEditRequest, DirectEditRequest, ApprovalRequest
from app.services.editing_service import EditingService
from app.services.export_service import ExportService

router = APIRouter(prefix="/outputs", tags=["Outputs"])

def format_output_response(output: Output, db: Session) -> Dict[str, Any]:
    fact_check = db.query(FactCheck).filter(FactCheck.output_id == output.id).first()
    quality_score = db.query(QualityScore).filter(QualityScore.output_id == output.id).first()
    versions = db.query(OutputVersion).filter(OutputVersion.output_id == output.id).order_by(OutputVersion.version_number.desc()).all()

    return {
        "id": output.id,
        "transformation_id": output.transformation_id,
        "format_type": output.format_type,
        "title": output.title,
        "raw_content": output.raw_content,
        "structured_data": output.structured_data,
        "version": output.version,
        "status": output.status,
        "approval_notes": output.approval_notes,
        "approved_at": output.approved_at,
        "created_at": output.created_at,
        "updated_at": output.updated_at,
        "fact_check": {
            "id": fact_check.id,
            "output_id": fact_check.output_id,
            "total_claims": fact_check.total_claims,
            "verified_claims": fact_check.verified_claims,
            "partially_supported": fact_check.partially_supported,
            "unsupported_claims": fact_check.unsupported_claims,
            "contradicted_claims": fact_check.contradicted_claims,
            "opinion_creative": fact_check.opinion_creative,
            "grounding_score": fact_check.grounding_score,
            "claims": fact_check.claims
        } if fact_check else None,
        "quality_score": {
            "id": quality_score.id,
            "output_id": quality_score.output_id,
            "overall_score": quality_score.overall_score,
            "source_accuracy": quality_score.source_accuracy,
            "completeness": quality_score.completeness,
            "audience_fit": quality_score.audience_fit,
            "readability": quality_score.readability,
            "tone_consistency": quality_score.tone_consistency,
            "structure_score": quality_score.structure_score,
            "research_confidence": quality_score.research_confidence,
            "safety_score": quality_score.safety_score,
            "details": quality_score.details
        } if quality_score else None,
        "versions": [
            {
                "id": v.id,
                "output_id": v.output_id,
                "version_number": v.version_number,
                "content": v.content,
                "structured_data": v.structured_data,
                "change_reason": v.change_reason,
                "created_by": v.created_by,
                "created_at": v.created_at
            }
            for v in versions
        ]
    }

@router.get("/{output_id}")
def get_output_detail(output_id: str, db: Session = Depends(get_db)):
    output = db.query(Output).filter(Output.id == output_id).first()
    if not output:
        raise HTTPException(status_code=404, detail="Output not found")
    return format_output_response(output, db)

@router.post("/{output_id}/conversational-edit")
async def conversational_edit(
    output_id: str,
    payload: ConversationalEditRequest,
    provider: Optional[str] = None,
    db: Session = Depends(get_db)
):
    try:
        updated_output = await EditingService.conversational_edit(
            db=db,
            output_id=output_id,
            edit_prompt=payload.prompt,
            provider_name=provider
        )
        return format_output_response(updated_output, db)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Conversational edit failed: {str(e)}")

@router.post("/{output_id}/direct-edit")
def direct_edit(
    output_id: str,
    payload: DirectEditRequest,
    db: Session = Depends(get_db)
):
    try:
        updated_output = EditingService.direct_edit(
            db=db,
            output_id=output_id,
            content=payload.content,
            change_reason=payload.change_reason or "Manual edit"
        )
        return format_output_response(updated_output, db)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Direct edit failed: {str(e)}")

@router.post("/{output_id}/approve")
def approve_output(
    output_id: str,
    payload: Optional[ApprovalRequest] = None,
    db: Session = Depends(get_db)
):
    notes = payload.notes if payload else "Approved by operator"
    try:
        approved = EditingService.set_approval(db, output_id, action="APPROVE", notes=notes)
        return format_output_response(approved, db)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/{output_id}/reject")
def reject_output(
    output_id: str,
    payload: Optional[ApprovalRequest] = None,
    db: Session = Depends(get_db)
):
    notes = payload.notes if payload else "Rejected by operator"
    try:
        rejected = EditingService.set_approval(db, output_id, action="REJECT", notes=notes)
        return format_output_response(rejected, db)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{output_id}/export/{export_format}")
def export_file(
    output_id: str,
    export_format: str,
    db: Session = Depends(get_db)
):
    try:
        file_path = ExportService.export_output(db, output_id, export_format)
        if not os.path.exists(file_path):
            raise HTTPException(status_code=404, detail="Exported file could not be found")
        
        filename = os.path.basename(file_path)
        media_types = {
            "pptx": "application/vnd.openxmlformats-officedocument.presentationml.presentation",
            "docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "txt": "text/plain",
            "json": "application/json"
        }
        media_type = media_types.get(export_format.lower(), "application/octet-stream")
        return FileResponse(path=file_path, filename=filename, media_type=media_type)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Export failed: {str(e)}")

@router.get("/{output_id}/versions")
def list_versions(output_id: str, db: Session = Depends(get_db)):
    versions = db.query(OutputVersion).filter(OutputVersion.output_id == output_id).order_by(OutputVersion.version_number.desc()).all()
    return versions
