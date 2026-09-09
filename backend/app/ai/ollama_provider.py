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
IMPORTANT RULE 1: Extract an exhaustive catalog of 10 to 15+ granular key facts covering root cause, systems, telemetry metrics, timelines, impacts, and directives with exact page and section source attribution.
IMPORTANT RULE 2: The 'executive_summary' MUST start with the exact document topic / subject name in bold right at the beginning (e.g. '**Topic: [Topic Name]** — This strategic synthesis analyzes...').
IMPORTANT RULE 3: Extract ALL explicit calendar dates, submission deadlines, timestamps, project phases, and roadmap milestones from the document into both 'dates' and 'events'. Do not omit proposal submission dates or phased schedules.
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
    {{"fact_id": "fact_001", "text": "Specific factual claim directly from the text", "source": {{"file": "{filename}", "page": 1, "section": "Executive Summary", "paragraph": 1}}, "confidence": 0.98, "provenance": "PRIMARY_SOURCE_FACT", "verified": true}}
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
        from app.services.multilingual_service import MultilingualService
        audience = config.get("target_audience", "Executive Board & Regulators")
        tone = config.get("tone", "Professional & Authoritative")
        lang = MultilingualService.clean_language_name(config.get("language", "English"))

        lang_instruction = f"CRITICAL: Output Language is '{lang}'. You MUST write all titles, headings, bullet points, narrative, slides, and scripts entirely in '{lang}'." if not MultilingualService.is_english(lang) else ""

        prompt = f"""You are an elite communication transformer running privately on local AI (Llama 3).
Transform the following canonical facts into format: '{format_type}'.
Target Audience: {audience} | Tone: {tone} | Target Language: {lang}
{lang_instruction}
Anti-hallucination rule: ONLY use facts and information from the provided canonical data.

Return valid JSON with:
{{
  "title": "Title of the output in {lang}",
  "raw_content": "Full formatted markdown text of the output in {lang} tailored to the format",
  "structured_data": {{ "format": "{format_type}", "language": "{lang}" }}
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
            prompt += f"""\nFormat as structured slides (5-7 slides max). Each slide must have punchy bullet points ONLY (NO long paragraphs) and practical speaker notes.
The 'structured_data' MUST have a 'slides' array:
{{"slides": [{{"slide_number": 1, "title": "Slide Title", "bullets": ["Punchy bullet 1", "Punchy bullet 2"], "speaker_notes": "Context for the presenter"}}]}}"""

        elif format_type == "linkedin":
            prompt += f"""\nFormat as an engaging, authentic LinkedIn post (150-250 words total).
Tone: Professional, direct, human, and conversational.
Structure:
1. Hook (1-2 punchy lines highlighting the real core problem/vision)
2. What the initiative is
3. Core pillars or structure from the source document
4. Practical value / impact
5. Collaboration / call to action
DO NOT write fake telemetry, corporate governance slogans, or robotic filler."""

        elif format_type == "twitter":
            prompt += f"""\nFormat as a concise X/Twitter thread (maximum 4 posts). Each post must be punchy, self-contained, and natural.
The 'structured_data' MUST have a 'tweets' array of strings:
{{"tweets": ["1/ Hook addressing the core topic...", "2/ What this initiative or document solves...", "3/ The key breakdown or roadmap...", "4/ Impact and call to action..."]}}"""

        elif format_type == "video_package":
            prompt += f"""\nFormat as a 45-60 second storytelling video script across ~5 scenes.
The narration MUST be natural, conversational, and spoken-word ready.
The 'structured_data' MUST have a 'scenes' array:
{{"scenes": [{{"scene_number": 1, "title": "Scene Title", "visual_prompt": "Clear visual description", "narration_text": "Natural spoken voiceover", "on_screen_text": "Short punchy text", "duration_seconds": 12}}]}}"""

        elif format_type == "infographic":
            prompt += f"""\nFormat as a visual-first infographic outline with minimal text and high visual impact:
1. Header / Core Problem
2. Proposed Solution
3. Core Structure / Key Pillars
4. Expected Outcomes
5. Support & Partnership Requirements"""

        elif format_type == "executive_summary":
            prompt += f"""\nFormat as an EXCLUSIVE SUMMARY in {lang} (450-700 words).
PURPOSE: UNDERSTAND ("What is this document about, and what are the most important things I need to know?").
Allows someone to understand the document thoroughly without reading the original document.
Structure:
## 1. Overview & Strategic Purpose (document subject, author, recipient, core mission)
## 2. Core Problem & Context (background, student questions, practical challenges)
## 3. Key Numbers, Scope & Structural Facts (quantitative metrics, dates, episode counts, audience tiers, budget lines)
## 4. Main Components & Detailed Structure (complete breakdown of episodes/tracks with titles and descriptions, or phases)
## 5. Guest Selection Framework & Core Principle (criteria, guiding motto, guest profiles if applicable)
## 6. Operational Requirements & Partner Support (equipment, facilities, network access, administrative coordination)
## 7. Concrete Expected Outcomes (specific educational and operational outcomes)
## 8. Bottom Line (2-3 sentences summarizing overall meaning)
STRICT: Comprehensive factual summary ONLY. Do NOT include speculative analysis, unsolicited recommendations, or invented risks."""

        elif format_type == "advisory":
            prompt += f"""\nFormat as an EXECUTIVE ADVISORY in {lang} (400-700 words).
PURPOSE: DECIDE ("What does this information mean, what should I pay attention to, and what should I consider doing?").
Structure:
## 1. Executive Assessment (Analytical assessment: What is happening? Why it matters? Overall situation)
## 2. Key Findings (Decision-relevant facts, gaps, constraints, dependencies)
## 3. Implications (Analytical observations: "- **Implication:** ...")
## 4. Risks & Considerations (Meaningful uncertainties: "- **Consideration:** ...")
## 5. Recommendations (Practical actionable steps: "1. **Recommendation:** ...")
## 6. Decision Points & Next Steps (Milestones and approvals needed)
## 7. Advisory Conclusion (Decision takeaway)
STRICT: Decision-support analysis. Clearly separate Findings, Implications, and Recommendations."""

        try:
            raw_json = await self._call_ollama(prompt)
            data = clean_json_response(raw_json)
            if not data.get("title"):
                data["title"] = f"{canonical_data.get('topic', 'Analysis')} - {format_type.upper()}"
            if not data.get("raw_content"):
                data["raw_content"] = f"# {data['title']}\n\n" + canonical_data.get("executive_summary", "")
            return await MultilingualService.localize_artefact(data, lang, format_type)
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
