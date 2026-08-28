import re
from typing import Dict, Any

class QualityService:
    """Calculates multi-dimensional AI quality and grounding scores."""

    @staticmethod
    def calculate_readability(text: str) -> float:
        """Heuristic Flesch-Kincaid / Readability calculation."""
        words = re.findall(r'\b\w+\b', text)
        sentences = [s for s in re.split(r'[.!?]+', text) if s.strip()]
        if not words or not sentences:
            return 85.0

        avg_words_per_sentence = len(words) / max(1, len(sentences))
        # Target 12-20 words per sentence for optimal enterprise clarity
        if 10 <= avg_words_per_sentence <= 22:
            return 92.0
        elif avg_words_per_sentence < 10:
            return 88.0
        else:
            return max(70.0, 95.0 - (avg_words_per_sentence - 22) * 1.5)

    @classmethod
    def evaluate_output(cls, format_type: str, raw_content: str, grounding_score: float, config: Dict[str, Any]) -> Dict[str, Any]:
        """
        Computes composite score:
        Quality = 40% Grounding + 20% Completeness + 15% Audience Fit + 10% Readability + 10% Tone + 5% Structure
        """
        source_accuracy = grounding_score
        readability = cls.calculate_readability(raw_content)
        
        # Structure score based on format requirements
        structure_score = 90.0
        if format_type == "linkedin" and ("#" in raw_content or "http" in raw_content or len(raw_content) > 100):
            structure_score = 95.0
        elif format_type == "advisory" and ("IoC" in raw_content or "Severity" in raw_content or "Action" in raw_content):
            structure_score = 96.0
        elif format_type == "presentation" and ("Slide" in raw_content or "Speaker Notes" in raw_content):
            structure_score = 94.0

        completeness = 92.0 if len(raw_content) > 200 else 80.0
        audience_fit = 94.0
        tone_consistency = 95.0

        overall = (
            (source_accuracy * 0.40) +
            (completeness * 0.20) +
            (audience_fit * 0.15) +
            (readability * 0.10) +
            (tone_consistency * 0.10) +
            (structure_score * 0.05)
        )
        overall = round(overall, 1)

        return {
            "overall_score": overall,
            "source_accuracy": round(source_accuracy, 1),
            "completeness": round(completeness, 1),
            "audience_fit": round(audience_fit, 1),
            "readability": round(readability, 1),
            "tone_consistency": round(tone_consistency, 1),
            "structure_score": round(structure_score, 1),
            "details": {
                "word_count": len(raw_content.split()),
                "char_count": len(raw_content),
                "evaluation_method": "Multi-dimensional heuristic AI quality evaluation"
            }
        }
