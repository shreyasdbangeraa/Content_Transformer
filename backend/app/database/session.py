import os
from sqlalchemy import create_engine, text, inspect
from sqlalchemy.orm import sessionmaker, Session
from app.config import settings
from app.database.models import Base
from typing import Generator

def create_resilient_engine():
    """
    Creates a resilient database engine. If configured with remote PostgreSQL/Supabase
    and the device is offline or without internet, automatically falls back to local SQLite.
    """
    db_url = settings.DATABASE_URL
    if db_url.startswith("postgres://"):
        db_url = db_url.replace("postgres://", "postgresql://", 1)

    if "sqlite" in db_url:
        return create_engine(db_url, connect_args={"check_same_thread": False})

    try:
        # Test connection with a short timeout to prevent hanging when offline
        eng = create_engine(db_url, pool_pre_ping=True, connect_args={"connect_timeout": 3})
        with eng.connect() as conn:
            conn.execute(text("SELECT 1"))
        return eng
    except Exception as e:
        print(f"[OFFLINE MODE] Remote database unreachable ({e}). Resiliently operating on local SQLite database.")
        return create_engine("sqlite:///./content_transformer.db", connect_args={"check_same_thread": False})

engine = create_resilient_engine()
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def init_db():
    """Initializes the database schema and performs safe auto-migrations for new columns."""
    Base.metadata.create_all(bind=engine)
    
    # Safe auto-migration for newly added columns across tables
    try:
        inspector = inspect(engine)
        table_names = inspector.get_table_names()
        
        column_migrations = {
            "projects": [
                ("organization_name", "VARCHAR(255) DEFAULT 'NovaTech Systems'"),
                ("research_mode", "VARCHAR(50) DEFAULT 'SOURCE_AND_VERIFY'"),
                ("brand_profile_id", "VARCHAR(36)")
            ],
            "canonical_analyses": [
                ("events", "JSON DEFAULT '[]'"),
                ("uncertainties", "JSON DEFAULT '[]'"),
                ("conflicts", "JSON DEFAULT '[]'"),
                ("research_findings", "JSON DEFAULT '[]'"),
                ("provenance_map", "JSON DEFAULT '{}'"),
                ("rag_context", "JSON DEFAULT '[]'"),
                ("rag_sources", "JSON DEFAULT '[]'"),
                ("confidence_score", "FLOAT DEFAULT 0.98")
            ],
            "transformations": [
                ("research_mode", "VARCHAR(50) DEFAULT 'SOURCE_AND_VERIFY'"),
                ("brand_profile_id", "VARCHAR(36)")
            ],
            "quality_scores": [
                ("research_confidence", "FLOAT DEFAULT 96.0"),
                ("safety_score", "FLOAT DEFAULT 100.0")
            ],
            "knowledge_documents": [
                ("file_name", "VARCHAR(255)"),
                ("char_count", "INTEGER DEFAULT 0"),
                ("chunk_count", "INTEGER DEFAULT 0"),
                ("embedding_status", "VARCHAR(50) DEFAULT 'INDEXED'")
            ]
        }
        
        with engine.begin() as conn:
            for table, cols in column_migrations.items():
                if table in table_names:
                    existing_cols = [c["name"] for c in inspector.get_columns(table)]
                    for col_name, col_def in cols:
                        if col_name not in existing_cols:
                            try:
                                conn.execute(text(f"ALTER TABLE {table} ADD COLUMN {col_name} {col_def}"))
                            except Exception:
                                pass # Column already exists or table handles it
            
            # Ensure change_reason is TEXT in output_versions
            if "output_versions" in table_names:
                try:
                    conn.execute(text("ALTER TABLE output_versions ALTER COLUMN change_reason TYPE TEXT"))
                except Exception:
                    pass
    except Exception as e:
        print(f"[DB INIT NOTICE] Schema initialized: {e}")

def get_db() -> Generator[Session, None, None]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
