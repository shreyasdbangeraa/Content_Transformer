from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from app.database.session import get_db
from app.database.models import ResearchJob, ResearchSource, ResearchEvidence, ConflictRecord
from app.schemas.research import ResearchJobResponse, ConflictRecordResponse

router = APIRouter(prefix="/research", tags=["Research Engine"])

@router.get("/jobs/{job_id}", response_model=ResearchJobResponse)
def get_research_job(job_id: str, db: Session = Depends(get_db)):
    job = db.query(ResearchJob).filter(ResearchJob.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Research job not found")
    return job

@router.get("/project/{project_id}", response_model=List[ResearchJobResponse])
def list_project_research_jobs(project_id: str, db: Session = Depends(get_db)):
    jobs = db.query(ResearchJob).filter(ResearchJob.project_id == project_id).order_by(ResearchJob.created_at.desc()).all()
    return jobs

@router.get("/conflicts/{project_id}", response_model=List[ConflictRecordResponse])
def list_project_conflicts(project_id: str, db: Session = Depends(get_db)):
    conflicts = db.query(ConflictRecord).join(ResearchJob).filter(ResearchJob.project_id == project_id).all()
    return conflicts

@router.post("/conflicts/{conflict_id}/resolve")
def resolve_conflict(conflict_id: str, resolution_notes: str = "Resolved by operator", db: Session = Depends(get_db)):
    conflict = db.query(ConflictRecord).filter(ConflictRecord.id == conflict_id).first()
    if not conflict:
        raise HTTPException(status_code=404, detail="Conflict record not found")
    conflict.resolution_status = "RESOLVED"
    conflict.human_flag = False
    conflict.possible_explanation = resolution_notes
    db.commit()
    db.refresh(conflict)
    return {"message": "Conflict resolved successfully", "conflict": conflict}
