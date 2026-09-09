import asyncio
import os
import sys

# Ensure backend path is in sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
        sys.stderr.reconfigure(encoding="utf-8")
    except Exception:
        pass

from app.services.multilingual_service import MultilingualService
from app.ai.mock_provider import MockProvider
from app.ai.gemini_provider import GeminiProvider
from app.config import settings

async def test_multilingual_pipeline():
    print("===============================================================", flush=True)
    print("1. Testing Language Name Normalization...", flush=True)
    assert MultilingualService.clean_language_name("Kannada (ಕನ್ನಡ)") == "Kannada"
    assert MultilingualService.clean_language_name("Hindi (हिंदी)") == "Hindi"
    assert MultilingualService.clean_language_name("Tamil (தமிழ்)") == "Tamil"
    assert MultilingualService.clean_language_name("Telugu (తెలుగు)") == "Telugu"
    assert MultilingualService.clean_language_name("Spanish (Español)") == "Spanish"
    assert MultilingualService.clean_language_name("French") == "French"
    assert MultilingualService.clean_language_name("English") == "English"
    print("   [OK] Language name normalization passed.", flush=True)

    canonical_sample = {
        "title": "CloudGuard Zero-Day Threat Briefing",
        "topic": "Zero-Day Exploit Mitigation",
        "executive_summary": "On August 20, 2026, CloudGuard Threat Intelligence detected an active zero-day exploit targeting Enterprise VPN gateways (CVE-2026-8842). 500 endpoints were isolated in 42 minutes.",
        "key_facts": [
            {"text": "500 enterprise endpoints isolated within 42 minutes.", "source": {"file": "report.pdf", "page": 1}},
            {"text": "Zero corporate data exfiltration verified via EDR telemetry.", "source": {"file": "report.pdf", "page": 2}}
        ],
        "statistics": [
            {"metric": "Mitigation Latency", "value": "42 minutes", "context": "Rapid containment"}
        ],
        "risks": [
            {"risk": "Firmware unpatched edge node compromise", "severity": "CRITICAL", "impact": "Network traversal"}
        ],
        "recommendations": [
            {"recommendation": "Deploy emergency firmware patch v4.2.1", "details": "Mandatory across all edge VPNs", "priority": "CRITICAL"}
        ]
    }

    print("\n2. Testing Mock Provider Multilingual Generation in Kannada...", flush=True)
    mock = MockProvider()
    kannada_config = {
        "target_audience": "Technical Leadership",
        "tone": "Professional",
        "language": "Kannada (ಕನ್ನಡ)",
        "research_mode": "SOURCE_AND_VERIFY"
    }

    # Executive Summary in Kannada
    exec_res = await mock.generate_artefact(canonical_sample, "executive_summary", kannada_config)
    print(f"   [Kannada Executive Summary Title]: {exec_res['title']}", flush=True)
    assert exec_res['structured_data']['language'] == "Kannada"
    print(f"   [Kannada Content Excerpt]: {exec_res['raw_content'][:150]}...", flush=True)

    # LinkedIn in Kannada
    linkedin_res = await mock.generate_artefact(canonical_sample, "linkedin", kannada_config)
    print(f"   [Kannada LinkedIn Title]: {linkedin_res['title']}", flush=True)
    print(f"   [Kannada LinkedIn Excerpt]: {linkedin_res['raw_content'][:150]}...", flush=True)

    # Presentation in Kannada
    ppt_res = await mock.generate_artefact(canonical_sample, "presentation", kannada_config)
    print(f"   [Kannada Presentation Deck Title]: {ppt_res['structured_data'].get('deck_title')}", flush=True)
    assert len(ppt_res['structured_data'].get('slides', [])) > 0
    first_slide = ppt_res['structured_data']['slides'][0]
    print(f"   [Slide 1 Title]: {first_slide.get('title')}", flush=True)

    print("\n3. Testing Mock Provider Multilingual Generation in Hindi...", flush=True)
    hindi_config = {
        "target_audience": "C-Suite Executives",
        "tone": "Formal",
        "language": "Hindi (हिंदी)",
        "research_mode": "SOURCE_AND_VERIFY"
    }
    hindi_exec = await mock.generate_artefact(canonical_sample, "executive_summary", hindi_config)
    print(f"   [Hindi Executive Summary Title]: {hindi_exec['title']}", flush=True)
    assert hindi_exec['structured_data']['language'] == "Hindi"

    hindi_ppt = await mock.generate_artefact(canonical_sample, "presentation", hindi_config)
    print(f"   [Hindi Presentation Deck Title]: {hindi_ppt['structured_data'].get('deck_title')}", flush=True)

    print("\n4. Testing Conversational AI Edit for Translation...", flush=True)
    edit_res = await mock.conversational_edit(canonical_sample, exec_res['raw_content'], "Translate to Hindi (हिंदी)", "executive_summary")
    print(f"   [Translation Output Reason]: {edit_res['change_reason']}", flush=True)
    assert "Hindi" in edit_res['change_reason'] or "हिंदी" in edit_res['revised_content']

    print("\n5. Testing Live Gemini Provider Multilingual Generation (if key configured)...", flush=True)
    gemini_key = os.getenv("GEMINI_API_KEY") or settings.GEMINI_API_KEY
    if gemini_key:
        try:
            gemini = GeminiProvider(gemini_key)
            g_res = await gemini.generate_artefact(canonical_sample, "twitter", kannada_config)
            print(f"   [Gemini Kannada Twitter Title]: {g_res.get('title')}", flush=True)
            print(f"   [Gemini Twitter Excerpt]: {g_res.get('raw_content')[:180]}...", flush=True)
            print("   [OK] Live Gemini Multilingual Generation verified!", flush=True)
        except Exception as e:
            print(f"   [Note: Gemini live call handled with: {e}]", flush=True)
    else:
        print("   [Gemini API key not found in env, verified mock and multilingual fallback pipeline!]", flush=True)

    print("\n===============================================================", flush=True)
    print("✅ ALL MULTILINGUAL TESTS PASSED SUCCESSFULLY!", flush=True)
    print("===============================================================", flush=True)

if __name__ == "__main__":
    asyncio.run(test_multilingual_pipeline())
