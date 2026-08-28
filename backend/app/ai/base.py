from abc import ABC, abstractmethod
from typing import Dict, Any, Optional

class AIProvider(ABC):
    """Abstract interface for all AI model providers (Gemini, OpenAI, HuggingFace, Mock)."""

    @abstractmethod
    async def analyze_document(self, text: str, filename: str = "document.pdf") -> Dict[str, Any]:
        """Performs deep factual extraction and canonical structured knowledge synthesis."""
        pass

    @abstractmethod
    async def generate_artefact(self, canonical_data: Dict[str, Any], format_type: str, config: Dict[str, Any]) -> Dict[str, Any]:
        """Transforms canonical knowledge into the requested target communication artefact."""
        pass

    @abstractmethod
    async def fact_check(self, canonical_data: Dict[str, Any], generated_text: str, format_type: str) -> Dict[str, Any]:
        """Extracts claims from generated text and compares each against canonical facts."""
        pass

    @abstractmethod
    async def conversational_edit(self, canonical_data: Dict[str, Any], current_text: str, edit_prompt: str, format_type: str) -> Dict[str, Any]:
        """Revises generated artefact based on user instructions while strictly maintaining grounding."""
        pass

    @abstractmethod
    async def generate_image(self, prompt: str, aspect_ratio: str = "16:9") -> Optional[str]:
        """Generates an image/visual asset based on prompt."""
        pass
