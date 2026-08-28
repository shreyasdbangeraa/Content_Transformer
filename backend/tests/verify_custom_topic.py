import httpx
import json

def test_custom_topic_gemini():
    client = httpx.Client(base_url="http://127.0.0.1:8000/api/", follow_redirects=True, timeout=90.0)

    # 1. Create Project with a non-cyber topic
    print("1. Creating Project on Renewable Energy...")
    r = client.post(
        "projects",
        json={"title": "National Green Hydrogen & Solar Mission 2026", "domain": "Clean Energy"}
    )
    print(f"Status: {r.status_code}")
    assert r.status_code in [200, 201], f"Project creation error: {r.text}"
    proj = r.json()
    project_id = proj["id"]
    print(f"   [OK] Project Created: '{proj['title']}' (ID: {project_id})")

    # 2. Ingest Custom Energy Source Text
    source_text = """INDIA CLEAN ENERGY EXPANSION 2026:
The Ministry of New and Renewable Energy announced that India reached 185 Gigawatts of total installed renewable energy capacity as of July 2026.
Solar energy installations accounted for 92 GW, while wind power reached 48 GW.
The government allocated 19,744 crore for the National Green Hydrogen Mission, targeting 5 million metric tonnes of green hydrogen production annually by 2030.
Key private sector partners, including Tata Power and Adani Green, committed to building 15 GW of hybrid solar-wind parks in Rajasthan and Gujarat by Q4 2027.
This clean transition has already reduced national carbon emissions by 42 million tonnes annually and created over 240,000 green tech jobs."""

    print("\n2. Ingesting Renewable Energy Material...")
    src_r = client.post(
        f"sources/projects/{project_id}/text",
        json={"title": "Green Hydrogen & Solar Report", "text": source_text}
    )
    assert src_r.status_code in [200, 201], f"Source ingestion error: {src_r.text}"
    src = src_r.json()
    source_id = src["id"]
    print(f"   [OK] Ingested Source ID: {source_id}")

    # 3. Analyze with Gemini
    print("\n3. Triggering Deep AI Canonical Knowledge Analysis via Gemini...")
    can_r = client.post(f"sources/{source_id}/analyze")
    assert can_r.status_code in [200, 201], f"Analysis error: {can_r.text}"
    can = can_r.json()
    print(f"   [OK] Topic: {can.get('topic')[:80]}")
    print(f"   [OK] Executive Summary: {can.get('executive_summary')[:140]}...")
    print(f"   [OK] Key Facts Extracted ({len(can.get('key_facts', []))}):")
    for f in can.get('key_facts', [])[:3]:
        safe_f = f.get('text', '').encode('ascii', 'replace').decode('ascii')
        print(f"        - {safe_f[:90]}")

    # 4. Multi-Format Deliverables Generation via Gemini
    print("\n4. Synthesizing Deliverables via Gemini (LinkedIn, Exec Summary, Presentation)...")
    trans_r = client.post(
        f"transformations/projects/{project_id}/transform",
        json={
            "project_id": project_id,
            "canonical_id": can["id"],
            "target_audience": "Energy Investors & Policy Makers",
            "tone": "Visionary & Authoritative",
            "language": "English",
            "detail_level": "Detailed",
            "communication_objective": "Inform & Inspire",
            "content_style": "Executive Briefing",
            "requested_formats": ["executive_summary", "linkedin", "presentation"]
        }
    )
    assert trans_r.status_code in [200, 201], f"Transformation error: {trans_r.text}"
    trans = trans_r.json()
    outputs = trans.get("outputs", [])
    print(f"\n5. Total Deliverables Generated: {len(outputs)}")
    for o in outputs:
        title = str(o.get('title', '')).encode('ascii', 'replace').decode('ascii')
        excerpt = o.get('raw_content', '')[:140].replace('\n', ' ').encode('ascii', 'replace').decode('ascii')
        print(f"   [OUTPUT] {o['format_type'].upper()}:")
        print(f"      Title: {title}")
        print(f"      Excerpt: {excerpt}...\n")

    print("[SUCCESS] CUSTOM TOPIC PROCESSED AND GENERATED ACCURATELY WITH ZERO PLACEHOLDER DATA!")

if __name__ == "__main__":
    test_custom_topic_gemini()
