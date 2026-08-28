from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse
import os

from app.config import settings
from app.database.session import init_db
from app.api.routes_projects import router as projects_router
from app.api.routes_sources import router as sources_router
from app.api.routes_transformations import router as transformations_router
from app.api.routes_outputs import router as outputs_router
from app.api.routes_publishing import router as publishing_router
from app.api.routes_knowledge import router as knowledge_router
from app.api.routes_settings import router as settings_router

# Initialize DB tables
init_db()

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Multimodal Enterprise Generative AI Content Transformation & Publishing Platform"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount exports static folder
os.makedirs(settings.EXPORT_DIR, exist_ok=True)
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
app.mount("/static/exports", StaticFiles(directory=settings.EXPORT_DIR), name="exports")

# Include Routers under /api prefix
app.include_router(projects_router, prefix=settings.API_PREFIX)
app.include_router(sources_router, prefix=settings.API_PREFIX)
app.include_router(transformations_router, prefix=settings.API_PREFIX)
app.include_router(outputs_router, prefix=settings.API_PREFIX)
app.include_router(publishing_router, prefix=settings.API_PREFIX)
app.include_router(knowledge_router, prefix=settings.API_PREFIX)
app.include_router(settings_router, prefix=settings.API_PREFIX)

@app.get("/")
def root():
    return {
        "app": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "status": "ONLINE",
        "docs": "/docs",
        "endpoints": {
            "projects": "/api/projects",
            "stats": "/api/settings/stats",
            "status": "/api/settings/status"
        }
    }

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content={"detail": f"Internal Server Error: {str(exc)}"}
    )
