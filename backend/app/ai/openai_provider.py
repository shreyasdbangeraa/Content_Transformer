import json
import httpx
from typing import Dict, Any, Optional
from app.ai.base import AIProvider
from app.config import settings

class OpenAIProvider(AIProvider):
    """OpenAI GPT-4o / GPT-4o-mini Provider with JSON Schema Mode."""

    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or settings.OPENAI_API_KEY
        self.base_url = "https://api.openai.com/v1/chat/completions"

    async def _call_openai(self, system_prompt: str, user_prompt: str) -> str:
        if not self.api_key:
            raise ValueError("OPENAI_API_KEY is not configured.")

        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
        payload = {
            "model": "gpt-4o-mini",
            "response_format": {"type": "json_object"},
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            "temperature": 0.2
        }

        async with httpx.AsyncClient(timeout=45.0) as client:
            resp = await client.post(self.base_url, headers=headers, json=payload)
            if resp.status_code != 200:
                raise ValueError(f"OpenAI API error {resp.status_code}: {resp.text}")
            data = resp.json()
            return data["choices"][0]["message"]["content"]

    async def analyze_document(self, text: str, filename: str = "document.pdf") -> Dict[str, Any]:
        sys = "You are an intelligence analyst. Extract strictly verified canonical facts into JSON. Detect sensitive data."
        user = f"Analyze source '{filename}' and return JSON with title, topic, executive_summary, key_facts, entities, statistics, risks, recommendations, sensitivity:\n\n{text[:20000]}"
        raw = await self._call_openai(sys, user)
        return json.loads(raw)

    async def generate_artefact(self, canonical_data: Dict[str, Any], format_type: str, config: Dict[str, Any]) -> Dict[str, Any]:
        sys = f"You are a communication specialist. Generate format '{format_type}' using strictly canonical facts. Output JSON with title, raw_content, structured_data."
        user = f"Config: {json.dumps(config)}\nData: {json.dumps(canonical_data)[:15000]}"
        raw = await self._call_openai(sys, user)
        return json.loads(raw)

    async def fact_check(self, canonical_data: Dict[str, Any], generated_text: str, format_type: str) -> Dict[str, Any]:
        sys = "You are a fact checker. Verify generated claims against canonical facts. Output JSON with claims, status (VERIFIED/UNSUPPORTED), grounding_score."
        user = f"Canonical facts: {json.dumps(canonical_data.get('key_facts', []))}\nText: {generated_text}"
        raw = await self._call_openai(sys, user)
        return json.loads(raw)

    async def conversational_edit(self, canonical_data: Dict[str, Any], current_text: str, edit_prompt: str, format_type: str) -> Dict[str, Any]:
        sys = "You are an editor. Revise the text per user instruction while keeping source grounding. Output JSON with revised_content, change_reason."
        user = f"Instruction: {edit_prompt}\nCurrent text: {current_text}"
        raw = await self._call_openai(sys, user)
        return json.loads(raw)

    async def generate_image(self, prompt: str, aspect_ratio: str = "16:9") -> Optional[str]:
        return None
