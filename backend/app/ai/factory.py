import os
from dotenv import load_dotenv
load_dotenv(override=True)

from app.ai.base import AIProvider
from app.ai.mock_provider import MockProvider
from app.ai.gemini_provider import GeminiProvider
from app.ai.openai_provider import OpenAIProvider
from app.config import settings

class AIFactory:
    """Factory for selecting and instantiating AI providers with priority for live configured keys."""

    @staticmethod
    def get_provider(provider_name: str = None) -> AIProvider:
        if provider_name and provider_name.lower() == "mock":
            return MockProvider()
        elif provider_name and provider_name.lower() == "openai":
            if settings.OPENAI_API_KEY:
                return OpenAIProvider(settings.OPENAI_API_KEY)
            return MockProvider()
        elif provider_name and provider_name.lower() == "gemini":
            if settings.GEMINI_API_KEY:
                return GeminiProvider(settings.GEMINI_API_KEY)
            return MockProvider()

        # Default provider resolution
        gemini_key = os.getenv("GEMINI_API_KEY") or settings.GEMINI_API_KEY
        openai_key = os.getenv("OPENAI_API_KEY") or settings.OPENAI_API_KEY
        
        default_pref = (os.getenv("AI_PROVIDER") or settings.DEFAULT_AI_PROVIDER or "gemini").lower()
        if default_pref == "gemini" and gemini_key:
            return GeminiProvider(gemini_key)
        elif default_pref == "openai" and openai_key:
            return OpenAIProvider(openai_key)
        elif gemini_key:
            return GeminiProvider(gemini_key)
        elif openai_key:
            return OpenAIProvider(openai_key)
        else:
            return MockProvider()
