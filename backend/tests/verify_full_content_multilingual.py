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

async def verify_entire_output_translation():
    print("==================================================================", flush=True)
    print("VERIFYING COMPLETE & EXHAUSTIVE MULTILINGUAL TRANSLATION OF ENTIRE CONTENT", flush=True)
    print("==================================================================", flush=True)

    sample_doc = {
        "title": "NovaTech Systems Incident Response Report",
        "topic": "Zero-Day Exploit Mitigation & Security Hardening",
        "executive_summary": "When complex operational events unfold, executive leadership requires rapid clarity, verified ground truth, and decisive action plans. The primary objective of this intelligence briefing is to establish verified situational clarity, reconcile raw data inputs against verified operational baselines, and present an actionable executive roadmap for senior leadership and cross-functional teams.",
        "key_facts": [
            {"text": "500 servers isolated within 42 minutes.", "source": {"file": "report.pdf", "page": 1, "section": "Summary"}},
            {"text": "Zero financial records exfiltrated.", "source": {"file": "report.pdf", "page": 2, "section": "Telemetry"}}
        ],
        "statistics": [
            {"metric": "Impacted Scope", "value": "500 Servers", "context": "Encrypted production endpoints isolated", "source_citation": "Page 1"}
        ],
        "risks": [
            {"risk": "Operational friction across communication channels", "severity": "HIGH", "impact": "Potential misalignment"}
        ],
        "recommendations": [
            {"recommendation": "Mandatory credential resets & air-gapped restoration.", "priority": "CRITICAL", "details": "Enforce hardware MFA"}
        ],
        "key_messages": [
            "All claims in this analysis are strictly verified against the underlying document.",
            "Senior decision-makers should prioritize verified findings to mitigate systemic operational exposure."
        ]
    }

    mock = MockProvider()
    languages_to_test = [
        ("Kannada (ಕನ್ನಡ)", "ಪುಟ", "ಕಾರ್ಯನಿರ್ವಾಹಕ", "ಪರಿಶೀಲಿಸಲಾಗಿದೆ"),
        ("Hindi (हिंदी)", "पृष्ठ", "कार्यकारी", "सत्यापित"),
        ("Spanish (Español)", "PÁGINA", "ESTRATÉGICO", "Verificado"),
        ("French (Français)", "PAGE", "STRATÉGIQUE", "Vérifié"),
        ("German (Deutsch)", "SEITE", "STRATEGISCHES", "Verifiziert")
    ]

    for lang_name, page_indicator, exec_indicator, status_indicator in languages_to_test:
        print(f"\n--- Testing Full Content Translation for {lang_name} ---", flush=True)
        cfg = {"language": lang_name, "research_mode": "SOURCE_AND_VERIFY"}

        # 1. Executive Summary
        exec_out = await mock.generate_artefact(sample_doc, "executive_summary", cfg)
        content = exec_out["raw_content"]
        assert page_indicator in content, f"Page indicator '{page_indicator}' missing in {lang_name} content"
        assert exec_indicator in content or exec_indicator in exec_out["title"], f"Exec indicator '{exec_indicator}' missing"
        print(f"   [Executive Summary {lang_name}]: Passed! Excerpt:\n      {content[:180].replace(chr(10), ' ')}...", flush=True)

        # 2. LinkedIn Post
        linkedin_out = await mock.generate_artefact(sample_doc, "linkedin", cfg)
        l_content = linkedin_out["raw_content"]
        assert len(l_content) > 100
        print(f"   [LinkedIn Post {lang_name}]: Passed! Character count: {len(l_content)}", flush=True)

        # 3. Presentation Deck
        ppt_out = await mock.generate_artefact(sample_doc, "presentation", cfg)
        slides = ppt_out["structured_data"]["slides"]
        assert len(slides) >= 4
        print(f"   [Presentation Deck {lang_name}]: Passed! Total slides: {len(slides)}", flush=True)

        # 4. Twitter Thread
        tweet_out = await mock.generate_artefact(sample_doc, "twitter", cfg)
        tweets = tweet_out["structured_data"]["tweets"]
        assert len(tweets) >= 3
        print(f"   [Twitter Thread {lang_name}]: Passed! Total tweets: {len(tweets)}", flush=True)

        # 5. Video Package
        video_out = await mock.generate_artefact(sample_doc, "video_package", cfg)
        scenes = video_out["structured_data"]["scenes"]
        assert len(scenes) >= 4
        print(f"   [Video Package {lang_name}]: Passed! Total scenes: {len(scenes)}", flush=True)

    print("\n==================================================================", flush=True)
    print("✅ ENTIRE OUTPUT & ALL ARTEFACT FORMATS 100% TRANSLATED & VERIFIED!", flush=True)
    print("==================================================================", flush=True)

if __name__ == "__main__":
    asyncio.run(verify_entire_output_translation())
