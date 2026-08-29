from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Dict, Any, Optional
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

import httpx
from datetime import datetime
from app.config import settings

@router.post("/test-webhook")
async def test_n8n_webhook(payload: Optional[Dict[str, Any]] = None):
    webhook_url = payload.get("webhook_url") if payload else None
    target = webhook_url or settings.N8N_WEBHOOK_URL
    if not target or not target.startswith("http"):
        return {"success": False, "error": "N8N_WEBHOOK_URL is not configured", "target_url": target}
    
    try:
        async with httpx.AsyncClient(timeout=15.0) as client:
            resp = await client.post(
                target,
                json={
                    "event": "test.ping",
                    "post_id": "test_ping_001",
                    "topic": "Ping Connection Test",
                    "content": "Diagnostic ping payload from AI Content Transformation Platform",
                    "timestamp": datetime.utcnow().isoformat()
                },
                headers={"Content-Type": "application/json"}
            )
            return {
                "success": resp.status_code in [200, 201, 202],
                "status_code": resp.status_code,
                "response_body": resp.text[:500],
                "target_url": target
            }
    except Exception as e:
        return {
            "success": False,
            "error": str(e),
            "target_url": target
        }
