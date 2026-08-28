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
        system_instruction = """You are an expert intelligence analyst and canonical knowledge synthesizer.
Extract strictly factual, source-grounded information from the provided document into a structured JSON schema.
Never fabricate statistics, dates, names, or financial loss numbers. If unmentioned, do not invent them.
Detect any potentially sensitive data (emails, internal IPs, credentials, phone numbers)."""

        prompt = f"""Analyze the following source document ({filename}) and return ONLY valid JSON matching this schema:
{{
  "title": "Document title tailored to input",
  "document_type": "Report/Advisory/Whitepaper/Article/Briefing",
  "detected_language": "English",
  "topic": "Main topic of the document",
  "executive_summary": "Thorough 2-3 paragraph summary strictly based on the provided text",
  "key_facts": [
    {{"fact_id": "f1", "text": "Specific factual claim directly from the text", "source": {{"file": "{filename}", "page": 1, "section": "Section"}}, "confidence": 0.98, "verified": true}}
  ],
  "entities": [{{"name": "Name", "type": "ORGANIZATION/PERSON/SYSTEM/LOCATION", "context": "Role"}}],
  "dates": [{{"date": "Date string", "event": "Description"}}],
  "locations": ["Location"],
  "statistics": [{{"metric": "Name", "value": "Value", "context": "Context", "source_citation": "Page 1"}}],
  "risks": [{{"risk": "Description", "severity": "CRITICAL/HIGH/MEDIUM", "impact": "Impact"}}],
  "recommendations": [{{"recommendation": "Action", "priority": "CRITICAL/HIGH", "details": "Steps"}}],
  "key_messages": ["Key takeaway 1", "Key takeaway 2"],
  "claims": [{{"claim_id": "c1", "text": "Claim text", "source_page": 1, "verified": true}}],
  "sensitivity": {{
    "level": "low/medium/high",
    "detected_count": 0,
    "items": [{{"type": "EMAIL/PHONE/IP", "value": "Value", "masked_value": "Masked", "recommendation": "Redact"}}]
  }},
  "source_references": [{{"title": "Section", "page": 1, "excerpt": "Quote"}}]
}}

SOURCE CONTENT:
{text[:30000]}"""

        try:
            raw_json = await self._call_gemini(prompt, system_instruction)
            return clean_json_response(raw_json)
        except Exception:
            # Automatic graceful fallback to dynamic text analyzer
            return await self._fallback.analyze_document(text, filename)

    async def generate_artefact(self, canonical_data: Dict[str, Any], format_type: str, config: Dict[str, Any]) -> Dict[str, Any]:
        audience = config.get("target_audience", "General Public")
        tone = config.get("tone", "Professional")
        lang = config.get("language", "English")

        prompt = f"""You are an elite communication transformer.
Transform the following canonical facts into format: '{format_type}'.
Target Audience: {audience} | Tone: {tone} | Language: {lang}
Anti-hallucination rule: ONLY use facts and information from the provided canonical data. Do NOT generate unrelated placeholder topics.

Return valid JSON with:
{{
  "title": "Title of the artefact tailored to the topic",
  "raw_content": "Full formatted markdown text of the output tailored to the topic",
  "structured_data": {{ "format": "{format_type}" }}
}}

If format_type is 'executive_summary', raw_content MUST be an extensive, highly detailed, multi-page (minimum 3 pages / sections) comprehensive Executive Dossier containing:
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
      "speaker_notes": "Notes for the presenter"
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

CANONICAL DATA:
{json.dumps(canonical_data, indent=2)[:20000]}"""

        try:
            raw_json = await self._call_gemini(prompt)
            return clean_json_response(raw_json)
        except Exception:
            return await self._fallback.generate_artefact(canonical_data, format_type, config)

    async def fact_check(self, canonical_data: Dict[str, Any], generated_text: str, format_type: str) -> Dict[str, Any]:
        prompt = f"""You are a strict fact checker and source grounding verifier.
Break down the generated text into individual factual claims. Compare each claim against the provided canonical source facts.
Assign status: VERIFIED, PARTIALLY_SUPPORTED, UNSUPPORTED, CONTRADICTED, or OPINION_CREATIVE.

Return valid JSON:
{{
  "total_claims": 5,
  "verified_claims": 4,
  "partially_supported": 1,
  "unsupported_claims": 0,
  "contradicted_claims": 0,
  "opinion_creative": 0,
  "grounding_score": 90.0,
  "claims": [
    {{
      "claim_id": "c1",
      "text": "Claim text",
      "status": "VERIFIED",
      "source_file": "source.txt",
      "source_page": 1,
      "source_section": "Overview",
      "source_match": "Exact matching excerpt from source",
      "confidence": 0.98,
      "reasoning": "Reason"
    }}
  ]
}}

CANONICAL FACTS:
{json.dumps(canonical_data.get('key_facts', []), indent=2)}

GENERATED TEXT TO CHECK:
{generated_text}"""

        try:
            raw_json = await self._call_gemini(prompt)
            return clean_json_response(raw_json)
        except Exception:
            return await self._fallback.fact_check(canonical_data, generated_text, format_type)

    async def conversational_edit(self, canonical_data: Dict[str, Any], current_text: str, edit_prompt: str, format_type: str) -> Dict[str, Any]:
        prompt = f"""You are an expert AI editor. Revise the provided text according to the user's instruction while strictly maintaining factual grounding in the canonical data.

User Instruction: "{edit_prompt}"

Return valid JSON:
{{
  "revised_content": "Updated full markdown text",
  "change_reason": "Summary of adjustments made",
  "structured_data": {{ "edit_prompt": "{edit_prompt}" }}
}}

CANONICAL FACTS:
{json.dumps(canonical_data.get('key_facts', []), indent=2)}

CURRENT TEXT:
{current_text}"""

        try:
            raw_json = await self._call_gemini(prompt)
            return clean_json_response(raw_json)
        except Exception:
            return await self._fallback.conversational_edit(canonical_data, current_text, edit_prompt, format_type)

    async def generate_image(self, prompt: str, aspect_ratio: str = "16:9") -> Optional[str]:
        return None
