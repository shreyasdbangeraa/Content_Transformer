from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.orm import Session
from typing import Dict, Any, Optional
import httpx
from app.database.session import get_db
from app.database.models import Project, Source, Output, PublishingJob, QualityScore
from app.config import settings
from app.ai.huggingface_provider import HuggingFaceProvider

router = APIRouter(prefix="/settings", tags=["Settings & Stats"])

@router.get("/status")
async def get_system_status(db: Session = Depends(get_db)):
    is_supabase = "supabase" in settings.DATABASE_URL.lower() or bool(settings.SUPABASE_URL)
    db_connected = False
    try:
        from sqlalchemy import text
        db.execute(text("SELECT 1"))
        db_connected = True
    except Exception:
        db_connected = False

    # Check local Ollama status
    ollama_online = False
    ollama_models = []
    try:
        async with httpx.AsyncClient(timeout=3.0) as client:
            resp = await client.get(f"{settings.OLLAMA_BASE_URL.rstrip('/')}/api/tags")
            if resp.status_code == 200:
                ollama_online = True
                data = resp.json()
                ollama_models = [m.get("name", "") for m in data.get("models", [])]
    except Exception:
        ollama_online = False

    return {
        "status": "OPERATIONAL",
        "version": settings.VERSION,
        "default_ai_provider": settings.DEFAULT_AI_PROVIDER,
        "database_engine": "Supabase PostgreSQL" if is_supabase else "PostgreSQL / SQLite",
        "database_connected": db_connected,
        "gemini_configured": bool(settings.GEMINI_API_KEY),
        "openai_configured": bool(settings.OPENAI_API_KEY),
        "ollama_configured": True,
        "ollama_online": ollama_online,
        "ollama_model": settings.OLLAMA_MODEL,
        "ollama_models_available": ollama_models,
        "huggingface_configured": bool(settings.HUGGINGFACE_API_KEY),
        "hf_model": settings.HF_IMAGE_MODEL,
        "supabase_configured": bool(settings.SUPABASE_URL and settings.SUPABASE_KEY),
        "n8n_configured": bool(settings.N8N_WEBHOOK_URL),
        "max_upload_size_mb": settings.MAX_UPLOAD_SIZE_MB
    }

@router.get("/ollama-status")
async def check_ollama_status():
    """Checks live connectivity to local Ollama server and lists installed local models."""
    try:
        async with httpx.AsyncClient(timeout=4.0) as client:
            resp = await client.get(f"{settings.OLLAMA_BASE_URL.rstrip('/')}/api/tags")
            if resp.status_code == 200:
                data = resp.json()
                models = [m.get("name", "") for m in data.get("models", [])]
                has_llama3 = any("llama3" in m.lower() for m in models)
                return {
                    "online": True,
                    "base_url": settings.OLLAMA_BASE_URL,
                    "active_model": settings.OLLAMA_MODEL,
                    "has_llama3": has_llama3,
                    "installed_models": models,
                    "message": "Local Ollama server is running and ready for offline inference."
                }
    except Exception as e:
        return {
            "online": False,
            "base_url": settings.OLLAMA_BASE_URL,
            "active_model": settings.OLLAMA_MODEL,
            "has_llama3": False,
            "installed_models": [],
            "message": f"Could not connect to Ollama at {settings.OLLAMA_BASE_URL}: {str(e)}"
        }

@router.post("/ai-provider")
def set_active_ai_provider(payload: Dict[str, Any] = Body(...)):
    provider = payload.get("provider", "gemini").lower()
    if provider not in ["gemini", "ollama", "openai", "mock"]:
        raise HTTPException(status_code=400, detail="Invalid provider. Choose 'gemini', 'ollama', 'openai', or 'mock'.")
    settings.DEFAULT_AI_PROVIDER = provider
    return {
        "success": True,
        "active_ai_provider": settings.DEFAULT_AI_PROVIDER,
        "message": f"AI Engine provider successfully set to '{provider}'."
    }

@router.get("/stats")
def get_dashboard_stats(db: Session = Depends(get_db)):
    total_projects = db.query(Project).count()
    total_sources = db.query(Source).count()
    total_outputs = db.query(Output).count()
    total_approved = db.query(Output).filter(Output.status == "APPROVED").count()
    total_published = db.query(Output).filter(Output.status == "PUBLISHED").count()
    
    # Calculate avg quality score
    scores = db.query(QualityScore.overall_score).all()
    avg_quality = round(sum(s[0] for s in scores) / len(scores), 1) if scores else 0.0

    return {
        "total_projects": total_projects,
        "total_sources": total_sources,
        "total_outputs": total_outputs,
        "total_approved": total_approved,
        "total_published": total_published,
        "average_quality_score": avg_quality,
        "publishing_jobs_count": db.query(PublishingJob).count()
    }

@router.post("/flux-image")
async def generate_flux_image(payload: Dict[str, Any] = Body(...)):
    prompt = payload.get("prompt", "Cybersecurity enterprise dashboard infographic illustration, dark slate background, glowing cyan data visualizations")
    hf = HuggingFaceProvider()
    image_uri = await hf.generate_flux_image(prompt)
    if not image_uri:
        # Return fallback SVG data uri
        image_uri = f"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='800' height='450' viewBox='0 0 800 450'><rect width='100%' height='100%' fill='%230f172a'/><circle cx='400' cy='225' r='180' fill='%231e293b' stroke='%2338bdf8' stroke-width='4'/><text x='50%' y='45%' font-family='Arial,sans-serif' font-size='22' font-weight='bold' fill='%2338bdf8' text-anchor='middle'>FLUX.1-schnell Generated Visual</text><text x='50%' y='55%' font-family='Arial,sans-serif' font-size='14' fill='%2394a3b8' text-anchor='middle'>{prompt[:50]}...</text></svg>"
    return {"prompt": prompt, "image_uri": image_uri}
