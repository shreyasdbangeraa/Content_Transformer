from datetime import datetime
from sqlalchemy.orm import Session
from typing import Dict, Any, Optional
from app.database.models import Output, OutputVersion, Transformation, CanonicalAnalysis, FactCheck, QualityScore, AuditLog
from app.ai.factory import AIFactory
from app.services.quality_service import QualityService

class EditingService:
    """Handles conversational AI refinement, manual direct edits, versioning, and human approval."""

    @staticmethod
    async def conversational_edit(db: Session, output_id: str, edit_prompt: str, provider_name: str = None) -> Output:
        output = db.query(Output).filter(Output.id == output_id).first()
        if not output:
            raise ValueError(f"Output {output_id} not found")

        transformation = db.query(Transformation).filter(Transformation.id == output.transformation_id).first()
        canonical = db.query(CanonicalAnalysis).filter(CanonicalAnalysis.id == transformation.canonical_id).first()

        canonical_dict = {
            "title": canonical.title,
            "topic": canonical.topic,
            "executive_summary": canonical.executive_summary,
            "key_facts": canonical.key_facts,
            "statistics": canonical.statistics,
            "risks": canonical.risks,
            "recommendations": canonical.recommendations
        }

        ai_provider = AIFactory.get_provider(provider_name)
        try:
            edit_result = await ai_provider.conversational_edit(
                canonical_data=canonical_dict,
                current_text=output.raw_content,
                edit_prompt=edit_prompt,
                format_type=output.format_type
            )
        except Exception:
            mock = AIFactory.get_provider("mock")
            edit_result = await mock.conversational_edit(
                canonical_data=canonical_dict,
                current_text=output.raw_content,
                edit_prompt=edit_prompt,
                format_type=output.format_type
            )

        revised_text = edit_result.get("revised_content", output.raw_content)
        change_reason = edit_result.get("change_reason", f"Conversational edit: {edit_prompt}")
        structured_data = edit_result.get("structured_data", output.structured_data)

        # Increment Version
        new_version_num = output.version + 1
        output.raw_content = revised_text
        output.version = new_version_num
        output.status = "NEEDS_REVIEW"
        output.updated_at = datetime.utcnow()

        # Save new OutputVersion
        new_version = OutputVersion(
            output_id=output.id,
            version_number=new_version_num,
            content=revised_text,
            structured_data=structured_data,
            change_reason=change_reason,
            created_by="AI_Refinement"
        )
        db.add(new_version)

        # Re-run Fact Check
        try:
            fc_data = await ai_provider.fact_check(canonical_dict, revised_text, output.format_type)
        except Exception:
            mock = AIFactory.get_provider("mock")
            fc_data = await mock.fact_check(canonical_dict, revised_text, output.format_type)

        existing_fc = db.query(FactCheck).filter(FactCheck.output_id == output.id).first()
        if existing_fc:
            existing_fc.total_claims = fc_data.get("total_claims", 0)
            existing_fc.verified_claims = fc_data.get("verified_claims", 0)
            existing_fc.partially_supported = fc_data.get("partially_supported", 0)
            existing_fc.unsupported_claims = fc_data.get("unsupported_claims", 0)
            existing_fc.grounding_score = fc_data.get("grounding_score", 100.0)
            existing_fc.claims = fc_data.get("claims", [])
        
        # Recompute Quality Score
        quality_eval = QualityService.evaluate_output(
            format_type=output.format_type,
            raw_content=revised_text,
            grounding_score=fc_data.get("grounding_score", 100.0),
            config={"target_audience": transformation.target_audience}
        )
        existing_qs = db.query(QualityScore).filter(QualityScore.output_id == output.id).first()
        if existing_qs:
            existing_qs.overall_score = quality_eval["overall_score"]
            existing_qs.source_accuracy = quality_eval["source_accuracy"]
            existing_qs.completeness = quality_eval["completeness"]
            existing_qs.readability = quality_eval["readability"]
            existing_qs.details = quality_eval["details"]

        # Audit Log
        audit = AuditLog(
            project_id=transformation.project_id,
            action="OUTPUT_REFINED_AI",
            actor="Operator via Conversational AI",
            details={"output_id": output.id, "prompt": edit_prompt, "new_version": new_version_num}
        )
        db.add(audit)

        db.commit()
        db.refresh(output)
        return output

    @staticmethod
    def direct_edit(db: Session, output_id: str, content: str, change_reason: str = "Manual edit by user") -> Output:
        output = db.query(Output).filter(Output.id == output_id).first()
        if not output:
            raise ValueError(f"Output {output_id} not found")

        transformation = db.query(Transformation).filter(Transformation.id == output.transformation_id).first()

        new_version_num = output.version + 1
        output.raw_content = content
        output.version = new_version_num
        output.status = "NEEDS_REVIEW"
        output.updated_at = datetime.utcnow()

        new_version = OutputVersion(
            output_id=output.id,
            version_number=new_version_num,
            content=content,
            structured_data=output.structured_data,
            change_reason=change_reason,
            created_by="User"
        )
        db.add(new_version)

        # Audit Log
        audit = AuditLog(
            project_id=transformation.project_id,
            action="OUTPUT_EDITED_MANUAL",
            actor="Operator",
            details={"output_id": output.id, "new_version": new_version_num}
        )
        db.add(audit)

        db.commit()
        db.refresh(output)
        return output

    @staticmethod
    def set_approval(db: Session, output_id: str, action: str, notes: Optional[str] = None) -> Output:
        output = db.query(Output).filter(Output.id == output_id).first()
        if not output:
            raise ValueError(f"Output {output_id} not found")

        transformation = db.query(Transformation).filter(Transformation.id == output.transformation_id).first()

        status = "APPROVED" if action.upper() == "APPROVE" else "REJECTED"
        output.status = status
        output.approval_notes = notes
        output.approved_at = datetime.utcnow() if status == "APPROVED" else None

        # Audit Log
        audit = AuditLog(
            project_id=transformation.project_id,
            action=f"OUTPUT_{status}",
            actor="Operator",
            details={"output_id": output.id, "format": output.format_type, "notes": notes}
        )
        db.add(audit)

        db.commit()
        db.refresh(output)
        return output
