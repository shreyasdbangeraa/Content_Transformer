import pytest
import httpx
from app.ai.factory import AIFactory
from app.ai.ollama_provider import OllamaProvider
from app.config import settings

@pytest.mark.asyncio
async def test_ollama_provider_instantiation():
    provider = AIFactory.get_provider("ollama")
    assert isinstance(provider, OllamaProvider)
    assert provider.model == "llama3"

@pytest.mark.asyncio
async def test_ollama_live_or_fallback_analysis():
    provider = OllamaProvider()
    sample_text = (
        "NovaTech Cyber Incident Policy: Containment achieved in 42 minutes across 500 endpoints. "
        "CVSS 8.8 vulnerability patched with zero data exfiltration."
    )
    result = await provider.analyze_document(sample_text, "test_incident.txt")
    assert result is not None
    assert "topic" in result or "title" in result
    assert "key_facts" in result or "executive_summary" in result

@pytest.mark.asyncio
async def test_ollama_generate_artefact():
    provider = OllamaProvider()
    canonical_data = {
        "topic": "Project Titan Containment",
        "executive_summary": "500 endpoints were isolated within 42 minutes with zero data loss.",
        "key_facts": [{"text": "500 endpoints isolated in 42 minutes"}],
        "statistics": [{"metric": "Endpoints Isolated", "value": "500"}],
        "risks": [],
        "recommendations": []
    }
    artefact = await provider.generate_artefact(canonical_data, "executive_summary", {"target_audience": "Leadership"})
    assert artefact is not None
    assert "title" in artefact
    assert "raw_content" in artefact
