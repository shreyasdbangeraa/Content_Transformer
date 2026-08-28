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
        raise ValueError(f"Could not parse valid JSON from AI response: {raw_text[:200]}")

class GeminiProvider(AIProvider):
    """Google Gemini AI Provider with structured JSON output and graceful dynamic fallback."""

    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or settings.GEMINI_API_KEY
        self.model = "gemini-2.5-flash"
        self.base_url = f"https://generativelanguage.googleapis.com/v1beta/models/{self.model}:generateContent"
        self._fallback = MockProvider()

    async def _call_gemini(self, prompt: str, system_instruction: Optional[str] = None) -> str:
        if not self.api_key:
            raise ValueError("GEMINI_API_KEY is not configured.")

        url = f"{self.base_url}?key={self.api_key}"
        payload = {
            "contents": [{"parts": [{"text": prompt}]}],
            "generationConfig": {
                "temperature": 0.2,
                "responseMimeType": "application/json"
            }
        }
        if system_instruction:
            payload["systemInstruction"] = {"parts": [{"text": system_instruction}]}

        async with httpx.AsyncClient(timeout=60.0) as client:
            resp = await client.post(url, json=payload)
            if resp.status_code != 200:
                raise ValueError(f"Gemini API error {resp.status_code}: {resp.text}")
            
            data = resp.json()
            candidates = data.get("candidates", [])
            if not candidates:
                raise ValueError("Empty response from Gemini API.")
            return candidates[0]["content"]["parts"][0]["text"]

    async def analyze_document(self, text: str, filename: str = "document.pdf") -> Dict[str, Any]:
        system_instruction = """You are an elite intelligence analyst and canonical knowledge synthesizer.
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
{text[:30000]}"""

        try:
            raw_json = await self._call_gemini(prompt, system_instruction)
            return clean_json_response(raw_json)
        except Exception:
            return await self._fallback.analyze_document(text, filename)

    async def generate_artefact(self, canonical_data: Dict[str, Any], format_type: str, config: Dict[str, Any]) -> Dict[str, Any]:
        audience = config.get("target_audience", "Executive Board & Regulators")
        tone = config.get("tone", "Professional & Authoritative")
        lang = config.get("language", "English")

        prompt = f"""You are an elite communication transformer.
Transform the following canonical facts into format: '{format_type}'.
Target Audience: {audience} | Tone: {tone} | Language: {lang}
Anti-hallucination rule: ONLY use facts and information from the provided canonical data.

Return valid JSON with:
{{
  "title": "Title of the output",
  "raw_content": "Full formatted markdown text of the output tailored to the format",
  "structured_data": {{ "format": "{format_type}" }}
}}

If format_type is 'executive_summary', raw_content MUST be an extensive, multi-page (minimum 3 pages / sections) comprehensive Executive Dossier containing:
- "## 📄 PAGE 1 OF 3: STRATEGIC CONTEXT & QUANTIFIED SCORECARD" (Overview, Core Mission, Quantified Scorecard Table, Strategic Messages)
- "## 📄 PAGE 2 OF 3: IN-DEPTH OPERATIONAL ANALYSIS & RISK MATRIX" (Milestones, Detailed Evidence Base with Page Citations, Entity Impact Mapping Table, Enterprise Risk Matrix)
- "## 📄 PAGE 3 OF 3: PHASED ACTION ROADMAP & GOVERNANCE DIRECTIVES" (3-Phased Implementation Roadmap: Immediate/Medium/Long-term, Governance Directives, Executive Sign-off Ledger)

If format_type is 'presentation', structured_data MUST contain:
{{
  "format": "presentation",
  "deck_title": "Deck Title",
  "slides": [
    {{
      "slide_number": 1,
      "title": "Slide Title",
      "subtitle": "Subtitle",
      "bullets": ["Point 1", "Point 2", "Point 3"],
      "speaker_notes": "Notes for presenter"
    }}
  ]
}}

If format_type is 'linkedin', structured_data SHOULD contain:
{{
  "format": "linkedin",
  "hook": "Opening hook line",
  "body": "Body paragraphs with bullet takeaways",
  "call_to_action": "CTA question",
  "hashtags": ["#Tag1", "#Tag2"]
}}

If format_type is 'twitter', structured_data SHOULD contain:
{{
  "format": "twitter",
  "mode": "thread",
  "tweet_count": 4,
  "tweets": [{{"index": 1, "text": "Tweet text"}}]
}}

If format_type is 'video_package', structured_data SHOULD contain:
{{
  "format": "video_package",
  "title": "Video title",
  "target_duration_seconds": 60,
  "aspect_ratio": "16:9",
  "scenes": [
    {{
      "scene_number": 1,
      "duration_seconds": 10,
      "visual_description": "Visual details",
      "on_screen_text": "Text on screen",
      "narration": "Voiceover audio script",
      "subtitle": "Caption"
    }}
  ]
}}

CANONICAL DATA:
{json.dumps(canonical_data, indent=2)[:20000]}"""

        try:
            raw_json = await self._call_gemini(prompt)
            return clean_json_response(raw_json)
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
            raw_json = await self._call_gemini(prompt)
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
            raw_json = await self._call_gemini(prompt)
            return clean_json_response(raw_json)
        except Exception:
            return await self._fallback.conversational_edit(canonical_data, current_text, edit_prompt, format_type)

    async def generate_image(self, prompt: str, aspect_ratio: str = "16:9") -> Optional[str]:
        return None
