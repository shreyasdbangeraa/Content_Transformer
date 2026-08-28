import httpx
import json
import sys

def test_live_gemini():
    client = httpx.Client(base_url="http://127.0.0.1:8000/api", follow_redirects=True, timeout=90.0)

    # 1. Create Project
    print("1. Creating Project...")
    r = client.post(
        "/projects",
        json={"title": "CloudGuard Zero-Day Threat Briefing", "domain": "Cybersecurity"}
    )
    assert r.status_code in [200, 201], f"Failed to create project: {r.text}"
    proj = r.json()
    project_id = proj["id"]
    print(f"   [OK] Project Created: '{proj['title']}' (ID: {project_id})")

    # 2. Ingest Source Text
    print("\n2. Ingesting Source Text Material...")
    source_text = """CRITICAL ADVISORY: On August 20, 2026, CloudGuard Threat Intelligence detected an active zero-day exploit targeting Enterprise VPN gateways (CVE-2026-8842). Over 1,200 organizations across North America and Europe were probed. The security operations team deployed an automated firewall rule patch in 25 minutes, blocking all inbound traffic from 14 malicious C2 IP addresses. Zero corporate breaches or data exfiltrations occurred. Immediate upgrade to Firmware v4.2.1 is mandatory across all enterprise edge nodes."""
    
    src_r = client.post(
        f"/sources/projects/{project_id}/text",
        json={"title": "VPN Zero-Day Exploit Advisory", "text": source_text}
    )
    assert src_r.status_code in [200, 201], f"Failed to ingest source: {src_r.text}"
    src = src_r.json()
    source_id = src["id"]
    print(f"   [OK] Source Ingested: {src['filename']} ({src['char_count']} chars)")

    # 3. Analyze with Google Gemini
    print("\n3. Triggering Deep AI Canonical Knowledge Analysis via Gemini 2.5 Flash...")
    can_r = client.post(f"/sources/{source_id}/analyze")
    assert can_r.status_code in [200, 201], f"Failed to analyze source: {can_r.text}"
    can = can_r.json()
    print(f"   [OK] Topic Identified: {can.get('topic')[:80]}")
    print(f"   [OK] Document Title: {can.get('title')[:80]}")
    print(f"   [OK] Executive Summary: {can.get('executive_summary')[:140]}...")
    print(f"   [OK] Verified Facts Extracted: {len(can.get('key_facts', []))} facts")
    for idx, f in enumerate(can.get('key_facts', [])[:3]):
        safe_fact = f.get('text', '').encode('ascii', 'replace').decode('ascii')
        print(f"        [{idx+1}] {safe_fact[:90]}")
    print(f"   [OK] Extracted Metrics: {len(can.get('statistics', []))} metrics")
    for s in can.get('statistics', [])[:2]:
        safe_ctx = str(s.get('context', '')).encode('ascii', 'replace').decode('ascii')
        print(f"        * {s.get('metric')}: {s.get('value')} ({safe_ctx[:50]})")

    # 4. Multi-Output Generation with Gemini
    print("\n4. Synthesizing Multi-Format Deliverables via Gemini (Exec Summary, LinkedIn, Advisory, PPTX Presentation)...")
    trans_r = client.post(
        f"/transformations/projects/{project_id}/transform",
        json={
            "project_id": project_id,
            "canonical_id": can["id"],
            "target_audience": "Enterprise Security Leaders & CISOs",
            "tone": "Formal & Authoritative",
            "language": "English",
            "detail_level": "Detailed",
            "communication_objective": "Inform & Remediate",
            "content_style": "Executive Briefing",
            "requested_formats": ["executive_summary", "linkedin", "advisory", "presentation"]
        }
    )
    assert trans_r.status_code in [200, 201], f"Failed transformation: {trans_r.text}"
    trans = trans_r.json()
    outputs = trans.get("outputs", [])
    print(f"\n5. Total Deliverables Generated: {len(outputs)}")
    for o in outputs:
        title = str(o.get('title', '')).encode('ascii', 'replace').decode('ascii')
        excerpt = o.get('raw_content', '')[:120].replace('\n', ' ').encode('ascii', 'replace').decode('ascii')
        print(f"   [OUTPUT] Artefact: {o['format_type'].upper()}")
        print(f"      - Title: {title}")
        print(f"      - Excerpt: {excerpt}...\n")

    # 5. Verify Project Details
    proj_r = client.get(f"/projects/{project_id}")
    assert proj_r.status_code == 200
    proj_data = proj_r.json()
    assert len(proj_data["outputs"]) == 4

    print("[SUCCESS] ALL API ENDPOINTS & GEMINI 2.5 TRANSFORMATION COMPLETED WITH 100% SUCCESS!")

if __name__ == "__main__":
    test_live_gemini()
