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

@router.get("/{output_id}")
def get_output_detail(output_id: str, db: Session = Depends(get_db)):
    output = db.query(Output).filter(Output.id == output_id).first()
    if not output:
        raise HTTPException(status_code=404, detail="Output not found")

    fact_check = db.query(FactCheck).filter(FactCheck.output_id == output_id).first()
    quality_score = db.query(QualityScore).filter(QualityScore.output_id == output_id).first()
    versions = db.query(OutputVersion).filter(OutputVersion.output_id == output_id).order_by(OutputVersion.version_number.desc()).all()

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
        "fact_check": fact_check,
        "quality_score": quality_score,
        "versions": versions
    }

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
        return updated_output
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
        return updated_output
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
        return approved
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
        return rejected
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
