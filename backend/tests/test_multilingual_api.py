import os
import sys
import pytest
from fastapi.testclient import TestClient

# Ensure backend path is in sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
        sys.stderr.reconfigure(encoding="utf-8")
    except Exception:
        pass

from app.main import app

client = TestClient(app)

def test_multilingual_api_flow():
    print("\n--- 1. Creating Multilingual Project ---", flush=True)
    r = client.post("/api/projects", json={
        "title": "Global Cyber Threat Advisory Project",
        "domain": "Cybersecurity",
        "organization_name": "NovaTech Global",
        "research_mode": "SOURCE_AND_VERIFY"
    })
    assert r.status_code == 200, f"Project creation failed: {r.text}"
    project = r.json()
    project_id = project["id"]

    print("--- 2. Ingesting Source Material ---", flush=True)
    src_text = "CRITICAL ADVISORY: NovaTech SOC detected CVE-2026-9901 breach attempt. 400 nodes were isolated in 30 minutes. Zero records leaked."
    r_src = client.post(f"/api/sources/projects/{project_id}/text", json={
        "title": "Incident Raw Log",
        "text": src_text
    })
    assert r_src.status_code == 200, f"Source ingestion failed: {r_src.text}"
    source = r_src.json()

    print("--- 3. Running Canonical Analysis ---", flush=True)
    r_can = client.post(f"/api/sources/{source['id']}/analyze")
    assert r_can.status_code == 200, f"Analysis failed: {r_can.text}"
    can = r_can.json()

    print("--- 4. Generating Deliverables in Kannada (ಕನ್ನಡ) ---", flush=True)
    r_trans = client.post(f"/api/transformations/projects/{project_id}/transform", json={
        "canonical_id": can["id"],
        "target_audience": "CISO & Senior Directors",
        "tone": "Formal & Authoritative",
        "language": "Kannada (ಕನ್ನಡ)",
        "detail_level": "Detailed",
        "communication_objective": "Enterprise Containment",
        "content_style": "Strategic",
        "research_mode": "SOURCE_AND_VERIFY",
        "requested_formats": ["executive_summary", "linkedin", "presentation"]
    })
    assert r_trans.status_code == 200, f"Transformation failed: {r_trans.text}"
    trans_data = r_trans.json()
    outputs = trans_data["outputs"]
    assert len(outputs) == 3

    exec_out = next(o for o in outputs if o["format_type"] == "executive_summary")
    linkedin_out = next(o for o in outputs if o["format_type"] == "linkedin")
    presentation_out = next(o for o in outputs if o["format_type"] == "presentation")

    print(f"   [Kannada Exec Summary Status]: {exec_out['status']}")
    print(f"   [Kannada LinkedIn Title]: {linkedin_out['title']}")
    print(f"   [Kannada Presentation Slides]: {len(presentation_out['structured_data'].get('slides', []))}")

    print("--- 5. Testing On-Demand Translation Route (/outputs/{output_id}/translate) ---", flush=True)
    r_translate = client.post(f"/api/outputs/{exec_out['id']}/translate", json={
        "language": "Hindi (हिंदी)"
    })
    assert r_translate.status_code == 200, f"Direct translation failed: {r_translate.text}"
    translated_out = r_translate.json()
    assert translated_out["version"] == 2
    print(f"   [Translated Version]: v{translated_out['version']}")
    print(f"   [Translated Reason]: {translated_out['versions'][0]['change_reason']}")
    assert "Hindi" in translated_out['versions'][0]['change_reason']

    print("--- 6. Testing Conversational Edit Translation ---", flush=True)
    r_chat_trans = client.post(f"/api/outputs/{linkedin_out['id']}/conversational-edit", json={
        "prompt": "Translate to Spanish (Español) for our European leadership team"
    })
    assert r_chat_trans.status_code == 200, f"Conversational translation failed: {r_chat_trans.text}"
    chat_out = r_chat_trans.json()
    assert chat_out["version"] == 2
    print(f"   [Conversational Spanish Translation Version]: v{chat_out['version']}")
    assert "Spanish" in chat_out['versions'][0]['change_reason']

    print("\n✅ API ENDPOINTS FOR MULTILINGUAL GENERATION & ON-THE-FLY TRANSLATION VERIFIED 100%!", flush=True)

if __name__ == "__main__":
    test_multilingual_api_flow()
