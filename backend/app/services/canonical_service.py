from sqlalchemy.orm import Session
from typing import Dict, Any
from app.database.models import CanonicalAnalysis, Source, AuditLog
from app.ai.factory import AIFactory
from app.services.sensitivity_service import SensitivityService

class CanonicalService:
    """Orchestrates deep AI document analysis and canonical structured knowledge creation."""

    @staticmethod
    async def analyze_and_store(db: Session, project_id: str, source_id: str, provider_name: str = None) -> CanonicalAnalysis:
        source = db.query(Source).filter(Source.id == source_id, Source.project_id == project_id).first()
        if not source:
            raise ValueError(f"Source {source_id} not found for project {project_id}")

        ai_provider = AIFactory.get_provider(provider_name)
        
        # 1. AI Analysis
        analysis_data = await ai_provider.analyze_document(source.raw_text, filename=source.filename)
        
        # 2. Augment with deterministic Sensitivity scan
        sens_scan = SensitivityService.scan_text(source.raw_text)
        if sens_scan.get("detected_count", 0) > 0:
            analysis_data["sensitivity"] = sens_scan

        # 3. Create or update CanonicalAnalysis in DB
        canonical = CanonicalAnalysis(
            project_id=project_id,
            source_id=source_id,
            title=analysis_data.get("title", source.filename),
            document_type=analysis_data.get("document_type", "Incident Report"),
            detected_language=analysis_data.get("detected_language", "English"),
            topic=analysis_data.get("topic", "General Topic"),
            executive_summary=analysis_data.get("executive_summary", ""),
            key_facts=analysis_data.get("key_facts", []),
            entities=analysis_data.get("entities", []),
            dates=analysis_data.get("dates", []),
            locations=analysis_data.get("locations", []),
            statistics=analysis_data.get("statistics", []),
            risks=analysis_data.get("risks", []),
            recommendations=analysis_data.get("recommendations", []),
            key_messages=analysis_data.get("key_messages", []),
            claims=analysis_data.get("claims", []),
            sensitivity=analysis_data.get("sensitivity", {}),
            source_references=analysis_data.get("source_references", [])
        )
        db.add(canonical)
        
        # Audit Log
        audit = AuditLog(
            project_id=project_id,
            action="CANONICAL_ANALYSIS_GENERATED",
            actor="AI Engine",
            details={"source_filename": source.filename, "facts_extracted": len(canonical.key_facts)}
        )
        db.add(audit)
        
        db.commit()
        db.refresh(canonical)
        return canonical
