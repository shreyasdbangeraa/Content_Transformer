import os
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

    def __init__(self, api_key: Optional[str] = None, model: Optional[str] = None):
        self.api_key = api_key or settings.GEMINI_API_KEY
        self.model = model or os.getenv("GEMINI_MODEL") or "gemini-2.5-flash"
        self._fallback = MockProvider()

    async def _call_gemini(self, prompt: str, system_instruction: Optional[str] = None) -> str:
        if not self.api_key:
            raise ValueError("GEMINI_API_KEY is not configured.")

        models_to_try = [self.model, "gemini-2.5-flash", "gemini-2.5-pro", "gemini-flash-latest", "gemini-3.5-flash", "gemini-3.8-flash"]
        # deduplicate while preserving order
        unique_models = list(dict.fromkeys(models_to_try))

        last_error = None
        for model_name in unique_models:
            url = f"https://generativelanguage.googleapis.com/v1beta/models/{model_name}:generateContent?key={self.api_key}"
            payload = {
                "contents": [{"parts": [{"text": prompt}]}],
                "generationConfig": {
                    "temperature": 0.2,
                    "responseMimeType": "application/json"
                }
            }
            if system_instruction:
                payload["systemInstruction"] = {"parts": [{"text": system_instruction}]}

            try:
                async with httpx.AsyncClient(timeout=35.0) as client:
                    resp = await client.post(url, json=payload)
                    if resp.status_code == 200:
                        data = resp.json()
                        candidates = data.get("candidates", [])
                        if candidates:
                            parts = candidates[0].get("content", {}).get("parts", [])
                            if parts:
                                return parts[0].get("text", "")
                    last_error = f"Gemini API ({model_name}) error {resp.status_code}: {resp.text}"
            except Exception as e:
                last_error = f"Gemini API ({model_name}) connection error: {str(e)}"

        raise ValueError(last_error or "Empty response from Gemini API.")

    async def analyze_document(self, text: str, filename: str = "document.pdf") -> Dict[str, Any]:
        system_instruction = """You are an elite intelligence analyst and canonical knowledge synthesizer.
Extract strictly factual, source-grounded information from the provided document into a structured JSON schema.
IMPORTANT RULE 1: Extract an exhaustive catalog of 10 to 15+ granular key facts covering root cause, systems, telemetry metrics, timelines, impacts, and directives with exact page and section source attribution.
IMPORTANT RULE 2: The 'executive_summary' MUST start with the exact document topic / subject name in bold right at the beginning (e.g. '**Topic: [Topic Name]** — This strategic synthesis analyzes...').
IMPORTANT RULE 3: Accurately identify ALL specific named organizations, companies, universities, or institutions mentioned in the document and generate 2-4 word precise internet search queries targeting their official websites.
IMPORTANT RULE 4: Extract ALL explicit calendar dates, submission deadlines, timestamps, project phases, and roadmap milestones from the document into both 'dates' and 'events'. Do not omit proposal submission dates, incident timestamps, or phased delivery schedules.
Never fabricate statistics, dates, names, or numbers.
Detect sensitive data (emails, internal IPs, credentials, phone numbers)."""

        prompt = f"""Analyze the following source document ({filename}) and return ONLY valid JSON matching this schema:
{{
  "title": "Document title tailored to input",
  "document_type": "Incident Report / Briefing / Advisory / Whitepaper / Proposal",
  "detected_language": "English",
  "topic": "Main topic of the document",
  "executive_summary": "**Topic: [Exact Topic Name]**\\n\\nThorough 2-3 paragraph strategic summary strictly based on the provided text, outlining core findings, telemetry, and directives",
  "key_facts": [
    {{"fact_id": "fact_001", "text": "Specific factual assertion from text", "source": {{"file": "{filename}", "page": 1, "section": "Executive Summary", "paragraph": 1}}, "confidence": 0.98, "provenance": "PRIMARY_SOURCE_FACT", "verified": true}}
  ],
  "entities": [{{"name": "Specific Name (e.g. Sahynex Techsolution, Sahyadri College)", "type": "ORGANIZATION/PERSON/SYSTEM/PROJECT", "context": "Role in document"}}],
  "target_search_queries": ["Concise 2-4 word search queries targeting official websites of the specific organizations mentioned (e.g. 'Sahynex Techsolution website', 'Sahyadri College of Engineering')"],
  "primary_organizations": ["Specific organization / company / institution names"],
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
        except Exception as e:
            print(f"[GeminiProvider] Warning: Gemini API failed ({e}), falling back to offline parser")
            return await self._fallback.analyze_document(text, filename)

    async def generate_artefact(self, canonical_data: Dict[str, Any], format_type: str, config: Dict[str, Any]) -> Dict[str, Any]:
        from app.services.multilingual_service import MultilingualService
        audience = config.get("target_audience", "Executive Board & Regulators")
        tone = config.get("tone", "Professional & Authoritative")
        lang = MultilingualService.clean_language_name(config.get("language", "English"))
        research_mode = config.get("research_mode", "SOURCE_AND_VERIFY")

        language_directive = ""
        if not MultilingualService.is_english(lang):
            language_directive = f"""
===================================================================
CRITICAL MULTILINGUAL REQUIREMENT:
The user has requested the output language to be: '{lang}'.
You MUST generate ALL contents (including Title, Section Headings, Table Column Headers & Values, Bullet Points, Slide Titles & Bullet Points & Speaker Notes, Tweets, Video Narration, Hashtags, and Action Directives) entirely in '{lang}'.
DO NOT generate in English. Do NOT mix English headings with {lang} body.
Everything must be in natural, professional, high-fidelity {lang}.
===================================================================
"""

        prompt = f"""You are a world-class professional content transformation specialist.
Your mission is: TRANSFORM THE CONTENT, NOT THE FACTS.
Make the source clearer, concise, engaging, and perfectly tailored for the target format: '{format_type}'.

PRIMARY RULES:
1. SOURCE FIRST: The provided canonical data is the single source of truth. Every important statement must be traceable to the source.
2. NO HALLUCINATIONS: Do NOT invent verification percentages, confidence ratings, risk classifications, governance frameworks, executive approvals, audit fingerprints, blockchain records, air-gapped backups, compliance conclusions, or fake telemetry.
3. FORBIDDEN JARGON: NEVER use artificial corporate jargon such as:
   - "canonical synthesis", "primary source telemetry", "aggregate evidence grounding score", "discrepancy radar"
   - "operational resilience", "unassailable Single Source of Truth", "enterprise governance", "technical containment"
   - "telemetry benchmarking", "audit fingerprint", "cryptographically certified transformations", "immutable audit log"
   - "executive sign-off", "air-gapped backup validation", "Tier 1/2/5 classifications"
   Unless the source document is specifically about cybersecurity/IT containment, these concepts MUST NEVER APPEAR.
4. TONE & READABILITY: Human, professional, readable, natural, and directly usable by real stakeholders.
Target Audience: {audience} | Tone: {tone} | Target Language: {lang}
{language_directive}

FORMAT-SPECIFIC SPECIFICATIONS:

- IF format_type == 'linkedin':
  Target length: 150–250 words.
  Structure:
  1. Hook: Strong opening about the problem or gap (e.g. classroom vs industry gap).
  2. Initiative: Briefly introduce the initiative.
  3. Content Breakdown: What it will cover (e.g. Placements & Career in Episodes 1–6, Entrepreneurship in Episodes 7–10).
  4. Practical Value: Why it matters for the audience.
  5. Collaboration: Support or collaboration requested.
  6. Closing CTA: Natural, human question/call to action + 3-5 relevant hashtags.
  Do NOT include risk matrices, evidence scores, telemetry, or internal verification notes.
  structured_data MUST contain:
  {{
    "format": "linkedin",
    "language": "{lang}",
    "hook": "Opening hook",
    "body": "Clean body text",
    "call_to_action": "Closing question",
    "hashtags": ["#Tag1", "#Tag2"]
  }}

- IF format_type == 'presentation':
  Create a clean, visual story across 5 to 7 slides maximum.
  Slide 1: Title & Initiative overview
  Slide 2: The Problem (Classroom learning vs real-world experience)
  Slide 3: The Solution (Format, guests, mentors, alumni)
  Slide 4: Content Roadmap (Episode / Theme structure, e.g. Ep 1-6 Career, Ep 7-10 Entrepreneurship)
  Slide 5: Expected Outcomes (Preparation, skills, mindset)
  Slide 6: Support Required (Recording space, equipment, promotion, guidance)
  Slide 7: Closing Takeaway ("Real conversation. Real experience. Real learning.")
  RULES: Bullet points ONLY (max 3-4 bullets per slide). Short and punchy. NO long paragraphs. Put extra context in speaker_notes.
  structured_data MUST contain:
  {{
    "format": "presentation",
    "deck_title": "Title in {lang}",
    "language": "{lang}",
    "slides": [
      {{
        "slide_number": 1,
        "title": "Slide Title in {lang}",
        "subtitle": "Subtitle in {lang}",
        "bullets": ["Point 1 in {lang}", "Point 2 in {lang}", "Point 3 in {lang}"],
        "speaker_notes": "Speaker notes in {lang}"
      }}
    ]
  }}

- IF format_type == 'infographic':
  Visual-first blueprint with minimal text and a clear visual flow.
  Structure:
  1. Header: Initiative Title & Core Purpose
  2. The Gap: Visual flow (Classroom Learning -> The Gap -> Real-World Experience)
  3. The Solution: Core mechanism & guest types
  4. Content Structure: Breakdown (e.g. 10 Episodes: 6 Placements & Career / 4 Entrepreneurship)
  5. Expected Impact: Key readiness & skill outcomes
  6. Support Needed: Space | Equipment | Guests | Guidance | Promotion
  Keep text minimal. No giant ASCII boxes or enterprise risk matrices.
  structured_data MUST contain:
  {{
    "format": "infographic",
    "language": "{lang}",
    "infographic_title": "Title",
    "sections": [
      {{"title": "The Gap", "points": ["Classroom vs Industry"]}},
      {{"title": "The Solution", "points": ["Student-led Conversations"]}},
      {{"title": "Content Structure", "points": ["6 Career Episodes", "4 Entrepreneurship Episodes"]}},
      {{"title": "Expected Impact", "points": ["Career Readiness", "Workplace Skills"]}},
      {{"title": "Support Needed", "points": ["Space, Equipment, Promotion"]}}
    ]
  }}

- IF format_type == 'video_package':
  A compelling 45–60 second storytelling script across ~5 scenes.
  Scene 1 (10s): The Gap (Classroom to Career)
  Scene 2 (10s): The Initiative (Introduce project)
  Scene 3 (12s): What Students Will Hear (Placement tips, founder stories, practical lessons)
  Scene 4 (12s): 10-Episode Roadmap (Career & Entrepreneurship split)
  Scene 5 (10s): The Ask & Closing ("Real conversation. Real experience. Real learning.")
  Narration must sound natural and human. No telemetry or governance jargon.
  structured_data MUST contain:
  {{
    "format": "video_package",
    "language": "{lang}",
    "title": "Video Title in {lang}",
    "target_duration_seconds": 60,
    "aspect_ratio": "16:9",
    "scenes": [
      {{
        "scene_number": 1,
        "duration_seconds": 10,
        "visual_description": "Visual direction",
        "on_screen_text": "Short headline",
        "narration": "Natural voiceover script",
        "subtitle": "Subtitle text"
      }}
    ]
  }}

- IF format_type == 'executive_summary':
  EXCLUSIVE SUMMARY: Comprehensive, high-signal, detailed factual summary of the source document (450–700 words).
  PURPOSE: UNDERSTAND ("What is this document about, and what are the most important things I need to know?").
  Allows someone to understand the document thoroughly without reading the original document.
  STRICT RULES:
  * Provide a detailed, in-depth breakdown of all components, facts, numbers, requirements, and outcomes from the source document.
  * Primarily summarize facts. NO speculative analysis, unsolicited recommendations, or corporate buzzwords.
  * NO invented risks, governance frameworks, or fake telemetry.
  STRUCTURE:
  ## 1. Overview & Strategic Purpose
  Detailed explanation covering: What the document is about, who created it, who it is addressed to, main purpose, and core mission.
  ## 2. Core Problem & Context
  In-depth explanation of the background, gaps, specific questions, or practical challenges addressed in the document.
  ## 3. Key Numbers, Scope & Structural Facts
  Comprehensive summary of all quantitative metrics, dates, episode/participant counts, audience tiers, and budget categories from source.
  ## 4. Main Components & Detailed Structure
  Thorough breakdown of all structural divisions, phases, tracks, or individual modules (e.g. complete episode-by-episode breakdown with individual titles and descriptions, or detailed operational phases).
  ## 5. Selection Criteria / Framework (if applicable)
  Specific criteria, qualifications, or governing principles outlined in the source (e.g., guest selection criteria, participant prerequisites).
  ## 6. Operational Requirements & Partner Support
  Detailed breakdown of all required resources, physical space, hardware/equipment, network access, administrative coordination, and partner support requested.
  ## 7. Concrete Expected Outcomes
  Specific educational, operational, or business outcomes and impact the document intends to achieve according to its own stated goals.
  ## 8. Bottom Line
  Authoritative 2–3 sentence concluding takeaway summarizing overall meaning.
  structured_data MUST contain:
  {{
    "format": "exclusive_summary",
    "language": "{lang}",
    "title": "Exclusive Summary - Title in {lang}",
    "word_count": 550,
    "sections": ["Overview & Strategic Purpose", "Core Problem & Context", "Key Numbers, Scope & Structural Facts", "Main Components & Detailed Structure", "Operational Requirements & Partner Support", "Concrete Expected Outcomes", "Bottom Line"]
  }}

- IF format_type == 'advisory':
  EXECUTIVE ADVISORY: Decision-support brief (400–700 words).
  PURPOSE: DECIDE ("What does this information mean, what should I pay attention to, and what should I consider doing?").
  Helps a decision-maker understand implications, risks, and recommended actions.
  STRICT RULES:
  * Analyze rather than simply summarize.
  * Clearly distinguish:
      Finding: [Source-derived fact]
      Implication: [Analytical observation]
      Recommendation: [Actionable guidance]
  * Surface meaningful risks/uncertainties without inventing fake compliance frameworks.
  STRUCTURE:
  ## 1. Executive Assessment
  Concise analytical assessment answering: What is happening? Why does it matter? What is the overall situation?
  ## 2. Key Findings
  Decision-relevant findings from source (important facts, notable gaps, constraints, opportunities, dependencies).
  ## 3. Implications
  Explain what findings mean for decisions. Clearly separated from source facts (e.g. "- **Implication:** ...").
  ## 4. Risks & Considerations
  Meaningful risks or uncertainties from source or legitimate analytical observations (e.g. "- **Consideration:** ...").
  ## 5. Recommendations
  Actionable, practical, specific guidance connected to findings (e.g. "1. **Recommendation:** ...").
  ## 6. Decision Points & Next Steps
  What needs approval, clarification, validation, sequencing (e.g. checkboxes / milestones).
  ## 7. Advisory Conclusion
  Decision-oriented takeaway: "What should the decision-maker take away from this?"
  structured_data MUST contain:
  {{
    "format": "advisory",
    "language": "{lang}",
    "title": "Executive Advisory - Title in {lang}",
    "word_count": 500,
    "sections": ["Executive Assessment", "Key Findings", "Implications", "Risks & Considerations", "Recommendations", "Decision Points & Next Steps", "Advisory Conclusion"]
  }}

- IF format_type == 'twitter':
  Maximum 4 posts in a clean thread.
  Post 1: Introduce the problem and the initiative.
  Post 2: Explain the structure (e.g. 10 episodes: 6 career, 4 startups).
  Post 3: The practical value for students and target audience.
  Post 4: Support requested and closing call to action.
  structured_data MUST contain:
  {{
    "format": "twitter",
    "language": "{lang}",
    "mode": "thread",
    "tweet_count": 4,
    "tweets": [
      {{"index": 1, "text": "Post 1 text in {lang}"}},
      {{"index": 2, "text": "Post 2 text in {lang}"}},
      {{"index": 3, "text": "Post 3 text in {lang}"}},
      {{"index": 4, "text": "Post 4 text in {lang}"}}
    ]
  }}

Return ONLY valid JSON:
{{
  "title": "Output Title in {lang}",
  "raw_content": "Clean, beautifully formatted markdown text tailored to the format without AI meta-commentary",
  "structured_data": {{ ... }}
}}

CANONICAL DATA:
{json.dumps(canonical_data, indent=2)[:20000]}"""

        try:
            raw_json = await self._call_gemini(prompt)
            data = clean_json_response(raw_json)
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
