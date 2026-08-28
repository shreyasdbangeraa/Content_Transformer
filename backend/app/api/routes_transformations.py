from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.orm import Session
from typing import Dict, Any, Optional
from app.database.session import get_db
from app.database.models import Transformation, CanonicalAnalysis, Project
from app.schemas.transformation import TransformationCreate, TransformationResponse
from app.services.transformation_service import TransformationService

router = APIRouter(prefix="/transformations", tags=["Transformations"])

@router.post("/projects/{project_id}/transform")
async def create_and_run_transformation(
    project_id: str,
    payload: TransformationCreate,
    provider: Optional[str] = None,
    db: Session = Depends(get_db)
):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    canonical = db.query(CanonicalAnalysis).filter(CanonicalAnalysis.id == payload.canonical_id).first()
    if not canonical:
        raise HTTPException(status_code=404, detail="Canonical analysis not found")

    transformation = Transformation(
        project_id=project_id,
        canonical_id=payload.canonical_id,
        target_audience=payload.target_audience,
        tone=payload.tone,
        language=payload.language,
        detail_level=payload.detail_level,
        communication_objective=payload.communication_objective,
        content_style=payload.content_style,
        custom_instructions=payload.custom_instructions,
        requested_formats=payload.requested_formats or ["executive_summary", "linkedin", "advisory", "presentation"],
        status="PROCESSING"
    )
    db.add(transformation)
    db.commit()
    db.refresh(transformation)

    try:
        outputs = await TransformationService.execute_transformation(
            db=db,
            transformation_id=transformation.id,
            provider_name=provider
        )
        return {
            "transformation": transformation,
            "outputs_count": len(outputs),
            "outputs": outputs
        }
    except Exception as e:
        transformation.status = "FAILED"
        db.commit()
        raise HTTPException(status_code=500, detail=f"Transformation execution failed: {str(e)}")

@router.get("/{transformation_id}")
def get_transformation(transformation_id: str, db: Session = Depends(get_db)):
    t = db.query(Transformation).filter(Transformation.id == transformation_id).first()
    if not t:
        raise HTTPException(status_code=404, detail="Transformation not found")
    return t
