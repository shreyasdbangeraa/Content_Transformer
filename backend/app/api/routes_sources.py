import os
import uuid
import shutil
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, Body
from sqlalchemy.orm import Session
from typing import Dict, Any, Optional
from app.database.session import get_db
from app.database.models import Project, Source, AuditLog
from app.schemas.source import SourceResponse, SourceProcessRequest
from app.processors.document_parser import DocumentParser
from app.processors.url_parser import URLParser
from app.processors.sanitizer import sanitize_untrusted_text
from app.services.canonical_service import CanonicalService
from app.config import settings

router = APIRouter(prefix="/sources", tags=["Sources"])

@router.post("/projects/{project_id}/upload")
async def upload_file(
    project_id: str,
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    filename = file.filename
    ext = filename.split(".")[-1].lower() if "." in filename else "txt"
    safe_filename = f"{uuid.uuid4().hex[:8]}_{filename}"
    file_path = os.path.join(settings.UPLOAD_DIR, safe_filename)

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    try:
        parsed = DocumentParser.parse_file(file_path, ext)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to extract document: {str(e)}")

    source = Source(
        project_id=project_id,
        filename=filename,
        file_type=ext,
        file_path=file_path,
        raw_text=parsed["text"],
        char_count=parsed["char_count"],
        page_count=parsed["page_count"],
        meta_info=parsed["metadata"],
        processing_status="PROCESSED"
    )
    db.add(source)

    audit = AuditLog(
        project_id=project_id,
        action="SOURCE_UPLOADED",
        actor="Operator",
        details={"filename": filename, "file_type": ext, "char_count": parsed["char_count"]}
    )
    db.add(audit)

    db.commit()
    db.refresh(source)
    return source

@router.post("/projects/{project_id}/text")
def ingest_text_paste(
    project_id: str,
    payload: Dict[str, Any] = Body(...),
    db: Session = Depends(get_db)
):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    title = payload.get("title", "Pasted Text Source")
    raw_text = payload.get("text", "")
    if not raw_text.strip():
        raise HTTPException(status_code=400, detail="Text content cannot be empty")

    clean_text, threats = sanitize_untrusted_text(raw_text)
    estimated_pages = max(1, len(clean_text) // 2500)

    source = Source(
        project_id=project_id,
        filename=f"{title[:30]}.txt",
        file_type="text_paste",
        raw_text=clean_text,
        char_count=len(clean_text),
        page_count=estimated_pages,
        meta_info={"threats": threats, "title": title},
        processing_status="PROCESSED"
    )
    db.add(source)

    audit = AuditLog(
        project_id=project_id,
        action="SOURCE_PASTED",
        actor="Operator",
        details={"title": title, "char_count": len(clean_text)}
    )
    db.add(audit)

    db.commit()
    db.refresh(source)
    return source

@router.post("/projects/{project_id}/url")
async def ingest_url(
    project_id: str,
    payload: Dict[str, Any] = Body(...),
    db: Session = Depends(get_db)
):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    url = payload.get("url", "")
    if not url:
        raise HTTPException(status_code=400, detail="URL is required")

    try:
        parsed = await URLParser.extract_url(url)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

    source = Source(
        project_id=project_id,
        filename=f"{parsed.get('title', 'Web Article')[:40]}",
        file_type="url",
        raw_text=parsed["text"],
        char_count=parsed["char_count"],
        page_count=parsed["page_count"],
        meta_info=parsed["metadata"],
        processing_status="PROCESSED"
    )
    db.add(source)

    audit = AuditLog(
        project_id=project_id,
        action="SOURCE_URL_INGESTED",
        actor="Operator",
        details={"url": url, "char_count": parsed["char_count"]}
    )
    db.add(audit)

    db.commit()
    db.refresh(source)
    return source

@router.post("/{source_id}/analyze")
async def analyze_source(
    source_id: str,
    provider: Optional[str] = None,
    db: Session = Depends(get_db)
):
    source = db.query(Source).filter(Source.id == source_id).first()
    if not source:
        raise HTTPException(status_code=404, detail="Source not found")

    try:
        canonical = await CanonicalService.analyze_and_store(
            db=db,
            project_id=source.project_id,
            source_id=source.id,
            provider_name=provider
        )
        return canonical
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")

@router.get("/{source_id}")
def get_source(source_id: str, db: Session = Depends(get_db)):
    source = db.query(Source).filter(Source.id == source_id).first()
    if not source:
        raise HTTPException(status_code=404, detail="Source not found")
    return source
