import os
import json
from sqlalchemy.orm import Session
from app.database.models import Output, Transformation, CanonicalAnalysis
from app.generators.presentation import PresentationGenerator
from app.generators.export_docx import DocxExportGenerator
from app.config import settings

class ExportService:
    """Generates downloadable file artefacts (PPTX, DOCX, TXT, JSON)."""

    @staticmethod
    def export_output(db: Session, output_id: str, export_format: str) -> str:
        output = db.query(Output).filter(Output.id == output_id).first()
        if not output:
            raise ValueError(f"Output {output_id} not found")

        fmt = export_format.lower().replace(".", "")
        safe_title = (output.title or output.format_type).replace(" ", "_").replace("/", "_")[:40]
        filename = f"{safe_title}_{output.id[:8]}.{fmt}"

        if fmt == "pptx":
            deck_data = output.structured_data if output.format_type == "presentation" else {
                "deck_title": output.title or "Executive Presentation",
                "slides": [
                    {
                        "slide_number": 1,
                        "title": output.title or "Executive Brief",
                        "subtitle": "Generated Communication Artefact",
                        "bullets": [line.strip("- *• ") for line in output.raw_content.split("\n") if line.strip()][:5],
                        "speaker_notes": "Presented via AI Content Transformer."
                    }
                ]
            }
            return PresentationGenerator.render_pptx(deck_data, filename)

        elif fmt in ["docx", "doc"]:
            return DocxExportGenerator.render_docx(
                title=output.title or f"{output.format_type.capitalize()} Brief",
                content=output.raw_content,
                output_filename=filename,
                metadata=output.structured_data
            )

        elif fmt in ["txt", "md"]:
            out_path = os.path.join(settings.EXPORT_DIR, filename)
            with open(out_path, "w", encoding="utf-8") as f:
                f.write(f"# {output.title}\n\n{output.raw_content}")
            return out_path

        elif fmt == "json":
            out_path = os.path.join(settings.EXPORT_DIR, filename)
            with open(out_path, "w", encoding="utf-8") as f:
                json.dump({
                    "id": output.id,
                    "title": output.title,
                    "format_type": output.format_type,
                    "version": output.version,
                    "status": output.status,
                    "content": output.raw_content,
                    "structured_data": output.structured_data
                }, f, indent=2)
            return out_path

        else:
            # Default TXT fallback
            out_path = os.path.join(settings.EXPORT_DIR, f"{safe_title}_{output.id[:8]}.txt")
            with open(out_path, "w", encoding="utf-8") as f:
                f.write(output.raw_content)
            return out_path
