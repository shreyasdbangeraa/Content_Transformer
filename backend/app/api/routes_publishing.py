from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from app.database.session import get_db
from app.database.models import PublishingJob, Output
from app.schemas.publishing import PublishRequest, PublishingJobResponse
from app.services.publishing_service import PublishingService

router = APIRouter(prefix="/publishing", tags=["Publishing & n8n"])

@router.post("/outputs/{output_id}/publish", response_model=PublishingJobResponse)
async def publish_output_to_n8n(
    output_id: str,
    payload: PublishRequest,
    db: Session = Depends(get_db)
):
    try:
        job = await PublishingService.publish_output(
            db=db,
            output_id=output_id,
            platform=payload.platform,
            webhook_url=payload.webhook_url,
            scheduled_at=payload.scheduled_at
        )
        return job
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/jobs", response_model=List[PublishingJobResponse])
def list_publishing_jobs(db: Session = Depends(get_db)):
    jobs = db.query(PublishingJob).order_by(PublishingJob.created_at.desc()).all()
    return jobs
