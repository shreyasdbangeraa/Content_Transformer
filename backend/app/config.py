import os
from dotenv import load_dotenv

# Load .env file explicitly
load_dotenv(override=True)

from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional

class Settings(BaseSettings):
    PROJECT_NAME: str = "AI Content Transformer"
    VERSION: str = "1.0.0"
    API_PREFIX: str = "/api"
    
    # Database / Supabase
    SUPABASE_URL: Optional[str] = os.getenv("SUPABASE_URL", "")
    SUPABASE_KEY: Optional[str] = os.getenv("SUPABASE_KEY", "")
    SUPABASE_SERVICE_ROLE_KEY: Optional[str] = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./content_transformer.db")
    
    # AI Providers
    DEFAULT_AI_PROVIDER: str = os.getenv("AI_PROVIDER", "gemini") # "gemini", "openai", "mock"
    GEMINI_API_KEY: Optional[str] = os.getenv("GEMINI_API_KEY", "")
    OPENAI_API_KEY: Optional[str] = os.getenv("OPENAI_API_KEY", "")
    HUGGINGFACE_API_KEY: Optional[str] = os.getenv("HUGGINGFACE_API_KEY", "")
    HF_IMAGE_MODEL: str = os.getenv("HF_IMAGE_MODEL", "black-forest-labs/FLUX.1-schnell")
    
    # n8n Integration
    N8N_WEBHOOK_URL: Optional[str] = os.getenv("N8N_WEBHOOK_URL", "")
    N8N_WEBHOOK_SECRET: Optional[str] = os.getenv("N8N_WEBHOOK_SECRET", "")
    
    # Storage / Uploads
    UPLOAD_DIR: str = os.getenv("UPLOAD_DIR", "./uploads")
    EXPORT_DIR: str = os.getenv("EXPORT_DIR", "./exports")
    MAX_UPLOAD_SIZE_MB: int = int(os.getenv("MAX_UPLOAD_SIZE_MB", "25"))
    
    # Security & CORS
    CORS_ORIGINS: list[str] = ["*"]
    
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

settings = Settings()

os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
os.makedirs(settings.EXPORT_DIR, exist_ok=True)
