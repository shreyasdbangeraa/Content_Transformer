import os
import uuid
import shutil
from fastapi import APIRouter, Depends, HTTPException, Body, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import List, Dict, Any, Optional
from app.database.session import get_db
from app.database.models import KnowledgeDocument, KnowledgeChunk
from app.processors.document_parser import DocumentParser
from app.services.rag_service import RAGService
from app.config import settings

router = APIRouter(prefix="/knowledge", tags=["Knowledge Base & RAG"])

@router.get("")
def list_knowledge_documents(db: Session = Depends(get_db)):
    """List all knowledge documents with chunk counts and vectorized status."""
    docs = db.query(KnowledgeDocument).order_by(KnowledgeDocument.created_at.desc()).all()
    results = []
    for d in docs:
        results.append({
            "id": d.id,
            "title": d.title,
            "doc_type": d.doc_type,
            "content": d.content,
            "file_name": d.file_name,
            "tags": d.tags or [],
            "char_count": d.char_count,
            "chunk_count": d.chunk_count,
            "embedding_status": d.embedding_status,
            "created_at": d.created_at
        })
    return results

@router.post("")
async def add_knowledge_document(
    payload: Dict[str, Any] = Body(...),
    db: Session = Depends(get_db)
):
    """Ingest a text document, automatically chunking and vectorizing into PGVector / SQLite."""
    title = payload.get("title", "Organizational Knowledge")
    content = payload.get("content", "")
    doc_type = payload.get("doc_type", "Brand Guidelines")
    tags = payload.get("tags", [])

    if not content or not content.strip():
        raise HTTPException(status_code=400, detail="Content cannot be empty")

    try:
        doc = await RAGService.ingest_document(
            db=db,
            title=title,
            content=content,
            doc_type=doc_type,
            tags=tags
        )
        return doc
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Knowledge ingestion failed: {str(e)}")

@router.post("/upload")
async def upload_knowledge_file(
    file: UploadFile = File(...),
    title: Optional[str] = Form(None),
    doc_type: str = Form("Policy"),
    tags: Optional[str] = Form(""),
    db: Session = Depends(get_db)
):
    """Upload a file (PDF, DOCX, TXT), extract text, chunk, vectorize and store in Knowledge Base."""
    filename = file.filename
    ext = filename.split(".")[-1].lower() if "." in filename else "txt"
    safe_filename = f"kb_{uuid.uuid4().hex[:8]}_{filename}"
    file_path = os.path.join(settings.UPLOAD_DIR, safe_filename)

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    try:
        parsed = DocumentParser.parse_file(file_path, ext)
        extracted_text = parsed.get("text", "")
        doc_title = title.strip() if title else parsed.get("title") or filename

        tag_list = [t.strip() for t in tags.split(",") if t.strip()] if tags else []

        doc = await RAGService.ingest_document(
            db=db,
            title=doc_title,
            content=extracted_text,
            doc_type=doc_type,
            tags=tag_list,
            file_name=filename
        )
        return doc
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to process and index knowledge document: {str(e)}")

@router.post("/search")
async def semantic_search_knowledge(
    payload: Dict[str, Any] = Body(...),
    db: Session = Depends(get_db)
):
    """Perform vector cosine similarity search across all indexed knowledge chunks."""
    query = payload.get("query", "")
    top_k = int(payload.get("top_k", 5))
    min_similarity = float(payload.get("min_similarity", 0.20))
    doc_type = payload.get("doc_type")

    if not query.strip():
        raise HTTPException(status_code=400, detail="Search query is required")

    try:
        results = await RAGService.semantic_search(
            db=db,
            query=query,
            top_k=top_k,
            min_similarity=min_similarity,
            doc_type=doc_type
        )
        return {
            "query": query,
            "total_matches": len(results),
            "matches": results
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Semantic search failed: {str(e)}")

@router.post("/seed")
async def seed_enterprise_knowledge(db: Session = Depends(get_db)):
    """Seed standard enterprise brand voice, security redaction, and compliance standards."""
    try:
        created = await RAGService.seed_default_enterprise_knowledge(db)
        return {
            "message": f"Successfully seeded {len(created)} enterprise knowledge policies.",
            "seeded_count": len(created)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Seeding failed: {str(e)}")

@router.get("/{doc_id}/chunks")
def get_document_chunks(doc_id: str, db: Session = Depends(get_db)):
    """Retrieve indexed vector chunks for a specific document."""
    doc = db.query(KnowledgeDocument).filter(KnowledgeDocument.id == doc_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")

    chunks = db.query(KnowledgeChunk).filter(KnowledgeChunk.document_id == doc_id).order_by(KnowledgeChunk.chunk_index.asc()).all()
    return {
        "document_id": doc.id,
        "title": doc.title,
        "doc_type": doc.doc_type,
        "total_chunks": len(chunks),
        "chunks": [
            {
                "chunk_id": c.id,
                "chunk_index": c.chunk_index,
                "content": c.content,
                "char_count": c.char_count,
                "word_count": c.word_count,
                "has_embedding": bool(c.embedding and len(c.embedding) > 0)
            }
            for c in chunks
        ]
    }

@router.delete("/{doc_id}")
def delete_knowledge_document(doc_id: str, db: Session = Depends(get_db)):
    """Remove knowledge document and associated vector chunks."""
    doc = db.query(KnowledgeDocument).filter(KnowledgeDocument.id == doc_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    db.delete(doc)
    db.commit()
    return {"message": "Knowledge document and vector chunks removed"}
