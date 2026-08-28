"""
Clean all Supabase / PostgreSQL database tables to start with a fresh slate.
"""
from app.database.session import engine, init_db
from sqlalchemy import text, inspect

def clean_database():
    print("Ensuring database schema exists...")
    init_db()
    
    inspector = inspect(engine)
    existing_tables = inspector.get_table_names()
    print(f"Found existing tables in Supabase: {existing_tables}")
    
    # Tables in reverse dependency order
    priority_order = [
        "feedback",
        "fact_checks",
        "quality_scores",
        "output_versions",
        "outputs",
        "transformations",
        "canonical_analyses",
        "conflict_records",
        "research_evidence",
        "research_sources",
        "research_jobs",
        "sources",
        "projects",
        "knowledge_documents",
        "knowledge_items",
        "publishing_jobs",
        "audit_logs",
        "brand_profiles"
    ]
    
    for t in priority_order:
        if t in existing_tables:
            try:
                with engine.begin() as conn:
                    result = conn.execute(text(f'DELETE FROM "{t}"'))
                    print(f"  [OK] Cleaned table: {t} ({result.rowcount} rows deleted)")
            except Exception as e:
                print(f"  [ERROR] Error cleaning {t}: {e}")
                
    # Also clean any other tables found
    for t in existing_tables:
        if t not in priority_order and not t.startswith("spatial_ref_sys"):
            try:
                with engine.begin() as conn:
                    result = conn.execute(text(f'DELETE FROM "{t}"'))
                    print(f"  [OK] Cleaned extra table: {t} ({result.rowcount} rows deleted)")
            except Exception as e:
                print(f"  [SKIP] Skipped table {t}: {e}")
                
    print("\nAll Supabase database tables have been completely cleaned and reset to a fresh slate!")

if __name__ == "__main__":
    clean_database()
