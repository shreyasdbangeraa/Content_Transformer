import os
from dotenv import load_dotenv
load_dotenv(override=True)

from app.ai.base import AIProvider
from app.ai.mock_provider import MockProvider
from app.ai.gemini_provider import GeminiProvider
from app.ai.openai_provider import OpenAIProvider
from app.ai.ollama_provider import OllamaProvider
from app.config import settings

class AIFactory:
    """Factory for selecting and instantiating AI providers with support for local offline AI (Ollama - Llama 3) and cloud engines."""

    @staticmethod
    def get_provider(provider_name: str = None) -> AIProvider:
        pref = (provider_name or os.getenv("AI_PROVIDER") or settings.DEFAULT_AI_PROVIDER or "gemini").lower()

        # 1. Local Offline AI (Ollama - Llama 3)
        if pref in ["ollama", "local", "llama3", "offline"]:
            return OllamaProvider(base_url=settings.OLLAMA_BASE_URL, model=settings.OLLAMA_MODEL)

        # 2. Explicit Mock
        if pref == "mock":
            return MockProvider()

        # 3. OpenAI
        if pref == "openai":
            if settings.OPENAI_API_KEY:
                return OpenAIProvider(settings.OPENAI_API_KEY)
            return MockProvider()

        # 4. Google Gemini
        if pref == "gemini":
            gemini_key = os.getenv("GEMINI_API_KEY") or settings.GEMINI_API_KEY
            if gemini_key:
                return GeminiProvider(gemini_key)
            return MockProvider()

        # 5. Default Fallback resolution
        gemini_key = os.getenv("GEMINI_API_KEY") or settings.GEMINI_API_KEY
        openai_key = os.getenv("OPENAI_API_KEY") or settings.OPENAI_API_KEY
        
        if gemini_key:
            return GeminiProvider(gemini_key)
        elif openai_key:
            return OpenAIProvider(openai_key)
        else:
            return OllamaProvider(base_url=settings.OLLAMA_BASE_URL, model=settings.OLLAMA_MODEL)
