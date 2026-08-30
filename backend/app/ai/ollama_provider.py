import json
import re
import httpx
from typing import Dict, Any, Optional
from app.ai.base import AIProvider
from app.ai.mock_provider import MockProvider
from app.config import settings

def clean_json_response(raw_text: str) -> Dict[str, Any]:
    """Clean markdown code fences and extract valid JSON."""
    text = raw_text.strip()
    if text.startswith("```"):
        text = re.sub(r"^```(?:json)?\s*", "", text)
        text = re.sub(r"\s*```$", "", text)
    text = text.strip()
    
    try:
        return json.loads(text)
    except Exception:
        match = re.search(r'(\{[\s\S]*\})', text)
        if match:
            return json.loads(match.group(1))
        raise ValueError(f"Could not parse valid JSON from Local AI (Ollama) response: {raw_text[:200]}")

class OllamaProvider(AIProvider):
    """Local Offline AI Provider (Ollama - Llama 3) for zero-data leakage enterprise privacy."""

    def __init__(self, base_url: Optional[str] = None, model: Optional[str] = None):
        self.base_url = (base_url or settings.OLLAMA_BASE_URL).rstrip("/")
        self.model = model or settings.OLLAMA_MODEL or "llama3"
        self._fallback = MockProvider()

    async def _call_ollama(self, prompt: str, system_instruction: Optional[str] = None) -> str:
        url = f"{self.base_url}/api/generate"
        payload = {
            "model": self.model,
            "prompt": prompt,
            "stream": False,
            "format": "json",
            "options": {
                "temperature": 0.2,
                "top_p": 0.9
            }
        }
        if system_instruction:
            payload["system"] = system_instruction

        async with httpx.AsyncClient(timeout=120.0) as client:
            resp = await client.post(url, json=payload)
            if resp.status_code != 200:
                raise ValueError(f"Local Ollama API error {resp.status_code}: {resp.text}")
            
            data = resp.json()
            response_text = data.get("response", "")
            if not response_text:
                raise ValueError("Empty response from Local Ollama API.")
            return response_text

    async def analyze_document(self, text: str, filename: str = "document.pdf") -> Dict[str, Any]:
        system_instruction = """You are an elite intelligence analyst and canonical knowledge synthesizer running completely offline and locally.
Extract strictly factual, source-grounded information from the provided document into a structured JSON schema.
IMPORTANT RULE: The 'executive_summary' MUST start with the exact document topic / subject name in bold right at the beginning (e.g. '**Topic: [Topic Name]** — This strategic synthesis analyzes...').
Never fabricate statistics, dates, names, or numbers.
Detect sensitive data (emails, internal IPs, credentials, phone numbers)."""

        prompt = f"""Analyze the following source document ({filename}) and return ONLY valid JSON matching this schema:
{{
  "title": "Document title tailored to input",
  "document_type": "Incident Report / Briefing / Advisory / Whitepaper",
  "detected_language": "English",
  "topic": "Main topic of the document",
  "executive_summary": "**Topic: [Exact Topic Name]**\\n\\nThorough 2-3 paragraph strategic summary strictly based on the provided text, outlining core findings, telemetry, and directives",
  "key_facts": [
    {{"fact_id": "f1", "text": "Specific factual claim directly from the text", "source": {{"file": "{filename}", "page": 1, "section": "Section"}}, "confidence": 0.98, "provenance": "PRIMARY_SOURCE_FACT", "verified": true}}
  ],
  "entities": [{{"name": "Name", "type": "ORGANIZATION/PERSON/SYSTEM/MALWARE_GROUP", "context": "Role"}}],
  "dates": [{{"date": "Date string", "event": "Description"}}],
  "events": [{{"timestamp": "Timestamp", "event": "Event description", "severity": "CRITICAL/HIGH/INFO"}}],
  "locations": ["Location"],
  "statistics": [{{"metric": "Name", "value": "Value", "context": "Context", "source_citation": "Page 1"}}],
  "risks": [{{"risk": "Description", "severity": "CRITICAL/HIGH/MEDIUM", "impact": "Impact"}}],
  "recommendations": [{{"recommendation": "Action", "priority": "CRITICAL/HIGH", "details": "Steps"}}],
  "key_messages": ["Key takeaway 1", "Key takeaway 2"],
  "uncertainties": [{{"topic": "Item", "status": "UNDER_INVESTIGATION", "details": "Details"}}],
  "claims": [{{"claim_id": "c1", "text": "Claim text", "source_page": 1, "verified": true, "provenance": "PRIMARY_SOURCE_FACT"}}],
  "sensitivity": {{
    "level": "low/medium/high",
    "detected_count": 0,
    "items": [{{"type": "EMAIL/PHONE/INTERNAL_IP", "value": "Value", "masked_value": "Masked", "recommendation": "Redact"}}]
  }},
  "source_references": [{{"title": "Section", "page": 1, "excerpt": "Quote"}}]
}}

SOURCE CONTENT:
{text[:20000]}"""

        try:
            raw_json = await self._call_ollama(prompt, system_instruction)
            return clean_json_response(raw_json)
        except Exception:
            return await self._fallback.analyze_document(text, filename)

    async def generate_artefact(self, canonical_data: Dict[str, Any], format_type: str, config: Dict[str, Any]) -> Dict[str, Any]:
        audience = config.get("target_audience", "Executive Board & Regulators")
        tone = config.get("tone", "Professional & Authoritative")
        lang = config.get("language", "English")

        prompt = f"""You are an elite communication transformer running privately on local AI (Llama 3).
Transform the following canonical facts into format: '{format_type}'.
Target Audience: {audience} | Tone: {tone} | Language: {lang}
Anti-hallucination rule: ONLY use facts and information from the provided canonical data.

Return valid JSON with:
{{
  "title": "Title of the output",
  "raw_content": "Full formatted markdown text of the output tailored to the format",
  "structured_data": {{ "format": "{format_type}" }}
}}

CANONICAL SOURCE DATA:
Topic: {canonical_data.get('topic', '')}
Executive Summary: {canonical_data.get('executive_summary', '')}
Key Facts: {json.dumps(canonical_data.get('key_facts', [])[:8])}
Metrics & Statistics: {json.dumps(canonical_data.get('statistics', [])[:6])}
Risks: {json.dumps(canonical_data.get('risks', [])[:5])}
Recommendations: {json.dumps(canonical_data.get('recommendations', [])[:5])}
RAG Organizational Context: {canonical_data.get('rag_prompt_block', '')}
"""

        if format_type == "presentation":
            prompt += """\nFormat as structured slides. The 'structured_data' MUST have a 'slides' array containing 4-5 slide objects:
{"slides": [{"slide_number": 1, "title": "Slide Title", "bullets": ["Point 1", "Point 2"], "speaker_notes": "Notes"}]}"""

        elif format_type == "linkedin":
            prompt += """\nFormat with engaging professional post hook, bullet points with emojis, hashtag block, and FLUX visual banner prompt in 'structured_data.image_prompt'."""

        elif format_type == "twitter":
            prompt += """\nFormat as a sequential X/Twitter thread. The 'structured_data' MUST have a 'tweets' array of strings:
{"tweets": ["1/5 Hook...", "2/5 Core Finding...", "3/5 Telemetry...", "4/5 Remediation...", "5/5 Takeaway..."]}"""

        elif format_type == "video_package":
            prompt += """\nFormat as a 5-scene video package. The 'structured_data' MUST have a 'scenes' array:
{"scenes": [{"scene_number": 1, "title": "Intro", "visual_prompt": "Visual description", "narration_text": "Spoken audio script", "on_screen_text": "Key stat", "duration_seconds": 12}]}"""

        elif format_type == "infographic":
            prompt += """\nFormat as an infographic visual wireframe layout with metrics, risk matrix, and visual tokens."""

        elif format_type == "advisory":
            prompt += """\nFormat as a strict security advisory with CVSS score, Indicators of Compromise (IoCs), timeline, and required mitigations."""

        try:
            raw_json = await self._call_ollama(prompt)
            data = clean_json_response(raw_json)
            if not data.get("title"):
                data["title"] = f"{canonical_data.get('topic', 'Analysis')} - {format_type.upper()}"
            if not data.get("raw_content"):
                data["raw_content"] = f"# {data['title']}\n\n" + canonical_data.get("executive_summary", "")
            return data
        except Exception:
            return await self._fallback.generate_artefact(canonical_data, format_type, config)

    async def fact_check(self, canonical_data: Dict[str, Any], generated_text: str, format_type: str) -> Dict[str, Any]:
        prompt = f"""Extract factual claims from the generated text and verify each claim strictly against the canonical facts.
Classify each claim status as one of:
- VERIFIED (exact match in canonical facts)
- PARTIALLY_SUPPORTED (partially matched)
- UNSUPPORTED (claim not found in canonical facts)
- CONTRADICTED (contradicts canonical facts)
- OPINION_CREATIVE (opinion/tone/framing)

Return JSON:
{{
  "total_claims": 5,
  "verified_claims": 5,
  "partially_supported": 0,
  "unsupported_claims": 0,
  "contradicted_claims": 0,
  "opinion_creative": 0,
  "grounding_score": 100.0,
  "claims": [
    {{
      "claim_id": "c1",
      "text": "Extracted claim",
      "status": "VERIFIED",
      "source_file": "document.pdf",
      "source_page": 1,
      "source_section": "Section",
      "source_match": "Matching text",
      "confidence": 0.98,
      "reasoning": "Reasoning",
      "provenance": "PRIMARY_SOURCE_FACT"
    }}
  ]
}}

GENERATED TEXT:
{generated_text[:10000]}

CANONICAL FACTS:
{json.dumps(canonical_data.get("key_facts", []), indent=2)[:10000]}"""

        try:
            raw_json = await self._call_ollama(prompt)
            return clean_json_response(raw_json)
        except Exception:
            return await self._fallback.fact_check(canonical_data, generated_text, format_type)

    async def conversational_edit(self, canonical_data: Dict[str, Any], current_text: str, edit_prompt: str, format_type: str) -> Dict[str, Any]:
        prompt = f"""Modify the current content according to this instruction: '{edit_prompt}'.
Maintain strict factual grounding against the canonical facts. Do NOT hallucinate new unmentioned facts.

Return JSON:
{{
  "revised_content": "Full revised markdown text",
  "change_reason": "Summary of adjustments made",
  "structured_data": {{ "format": "{format_type}" }}
}}

CURRENT CONTENT:
{current_text[:10000]}

CANONICAL FACTS:
{json.dumps(canonical_data, indent=2)[:10000]}"""

        try:
            raw_json = await self._call_ollama(prompt)
            return clean_json_response(raw_json)
        except Exception:
            return await self._fallback.conversational_edit(canonical_data, current_text, edit_prompt, format_type)

    async def generate_image(self, prompt: str, aspect_ratio: str = "16:9") -> Optional[str]:
        return None

    async def verify_fact(self, claim: str, canonical_facts: list) -> Dict[str, Any]:
        prompt = f"""Verify whether the following claim is supported by the provided canonical facts.
Return ONLY valid JSON:
{{
  "verified": true,
  "confidence": 0.95,
  "evidence": "Quoted matching fact or explanation",
  "discrepancy": null
}}

Claim: "{claim}"
Canonical Facts: {json.dumps(canonical_facts[:10])}"""

        try:
            raw_json = await self._call_ollama(prompt)
            return clean_json_response(raw_json)
        except Exception:
            return await self._fallback.verify_fact(claim, canonical_facts)

    async def generate_headline(self, summary: str) -> str:
        prompt = f"""Generate a single punchy, professional, highly factual executive headline based on this summary.
Return JSON: {{"headline": "Headline Text"}}
Summary: {summary}"""
        try:
            raw_json = await self._call_ollama(prompt)
            data = clean_json_response(raw_json)
            return data.get("headline", "Enterprise Strategic Synthesis")
        except Exception:
            return await self._fallback.generate_headline(summary)
