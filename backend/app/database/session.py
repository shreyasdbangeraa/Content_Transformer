import os
from sqlalchemy import create_engine, text, inspect
from sqlalchemy.orm import sessionmaker, Session
from app.config import settings
from app.database.models import Base
from typing import Generator

# Supabase or local SQLite/PostgreSQL
db_url = settings.DATABASE_URL
if db_url.startswith("postgres://"):
    db_url = db_url.replace("postgres://", "postgresql://", 1)

connect_args = {"check_same_thread": False} if "sqlite" in db_url else {}

engine = create_engine(
    db_url,
    connect_args=connect_args,
    pool_pre_ping=True
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def init_db():
    """Initializes the database schema and performs safe auto-migrations for new columns."""
    Base.metadata.create_all(bind=engine)
    
    # Safe auto-migration for newly added columns across tables
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
            ("confidence_score", "FLOAT DEFAULT 0.98")
        ],
        "transformations": [
            ("research_mode", "VARCHAR(50) DEFAULT 'SOURCE_AND_VERIFY'"),
            ("brand_profile_id", "VARCHAR(36)")
        ],
        "quality_scores": [
            ("research_confidence", "FLOAT DEFAULT 96.0"),
            ("safety_score", "FLOAT DEFAULT 100.0")
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
                        except Exception as e:
                            pass # Column already exists or table handles it
        
        # Ensure change_reason is TEXT in output_versions
        if "output_versions" in table_names:
            try:
                conn.execute(text("ALTER TABLE output_versions ALTER COLUMN change_reason TYPE TEXT"))
            except Exception:
                pass

def get_db() -> Generator[Session, None, None]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
