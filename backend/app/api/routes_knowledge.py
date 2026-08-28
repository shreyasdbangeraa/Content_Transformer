from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from app.database.session import get_db
from app.database.models import KnowledgeDocument

router = APIRouter(prefix="/knowledge", tags=["Knowledge Base & RAG"])

@router.get("")
def list_knowledge_documents(db: Session = Depends(get_db)):
    docs = db.query(KnowledgeDocument).order_by(KnowledgeDocument.created_at.desc()).all()
    return docs

@router.post("")
def add_knowledge_document(payload: Dict[str, Any] = Body(...), db: Session = Depends(get_db)):
    title = payload.get("title", "Organizational Knowledge")
    content = payload.get("content", "")
    doc_type = payload.get("doc_type", "Brand Guidelines")
    tags = payload.get("tags", [])

    if not content:
        raise HTTPException(status_code=400, detail="Content cannot be empty")

    doc = KnowledgeDocument(
        title=title,
        doc_type=doc_type,
        content=content,
        tags=tags
    )
    db.add(doc)
    db.commit()
    db.refresh(doc)
    return doc

@router.delete("/{doc_id}")
def delete_knowledge_document(doc_id: str, db: Session = Depends(get_db)):
    doc = db.query(KnowledgeDocument).filter(KnowledgeDocument.id == doc_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    db.delete(doc)
    db.commit()
    return {"message": "Knowledge document removed"}
