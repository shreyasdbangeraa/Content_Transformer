import math
import hashlib
import re
from typing import List, Optional
import httpx
from app.config import settings

VECTOR_DIMENSION = 384

STOP_WORDS = {
    "a", "about", "above", "after", "again", "against", "all", "am", "an", "and", "any", "are", "aren't",
    "as", "at", "be", "because", "been", "before", "being", "below", "between", "both", "but", "by",
    "can't", "cannot", "could", "couldn't", "did", "didn't", "do", "does", "doesn't", "doing", "don't",
    "down", "during", "each", "few", "for", "from", "further", "had", "hadn't", "has", "hasn't", "have",
    "haven't", "having", "he", "he'd", "he'll", "he's", "her", "here", "here's", "hers", "herself",
    "him", "himself", "his", "how", "how's", "i", "i'd", "i'll", "i'm", "i've", "if", "in", "into",
    "is", "isn't", "it", "it's", "its", "itself", "let's", "me", "more", "most", "mustn't", "my",
    "myself", "no", "nor", "not", "of", "off", "on", "once", "only", "or", "other", "ought", "our",
    "ours", "ourselves", "out", "over", "own", "same", "shan't", "she", "she'd", "she'll", "she's",
    "should", "shouldn't", "so", "some", "such", "than", "that", "that's", "the", "their", "theirs",
    "them", "themselves", "then", "there", "there's", "these", "they", "they'd", "they'll", "they're",
    "they've", "this", "those", "through", "to", "too", "under", "until", "up", "very", "was", "wasn't",
    "we", "we'd", "we'll", "we're", "we've", "were", "weren't", "what", "what's", "when", "when's",
    "where", "where's", "which", "while", "who", "who's", "whom", "why", "why's", "with", "won't",
    "would", "wouldn't", "you", "you'd", "you'll", "you're", "you've", "your", "yours", "yourself"
}

def simple_stem(word: str) -> str:
    """Lightweight suffix stripping for morphological term matching."""
    for suffix in ["ing", "ies", "ied", "ed", "tion", "tions", "ity", "ities", "ment", "ments", "ness", "s"]:
        if word.endswith(suffix) and len(word) - len(suffix) >= 3:
            return word[:-len(suffix)]
    return word

class EmbeddingService:
    """Multi-provider vector embedding and cosine similarity engine with local fallback."""

    @classmethod
    async def get_embedding(cls, text: str) -> List[float]:
        """Generates a normalized float vector for the provided text."""
        if not text or not text.strip():
            return [0.0] * VECTOR_DIMENSION

        clean_text = text.strip()

        # 1. In Local Offline Mode (Ollama), use 100% on-device deterministic vectorizer immediately
        if settings.DEFAULT_AI_PROVIDER in ["ollama", "local", "llama3", "offline"]:
            return cls._generate_local_embedding(clean_text)

        # 2. Try Gemini Embeddings if online and configured
        if settings.GEMINI_API_KEY:
            try:
                gemini_vec = await cls._get_gemini_embedding(clean_text)
                if gemini_vec:
                    return cls._normalize(gemini_vec)
            except Exception:
                pass

        # 3. Try OpenAI Embeddings if online and configured
        if settings.OPENAI_API_KEY:
            try:
                openai_vec = await cls._get_openai_embedding(clean_text)
                if openai_vec:
                    return cls._normalize(openai_vec)
            except Exception:
                pass

        # 4. Deterministic Local Vectorizer (384-dimensional Unit Vector)
        return cls._generate_local_embedding(clean_text)

    @classmethod
    async def get_embeddings_batch(cls, texts: List[str]) -> List[List[float]]:
        """Generates embeddings for a collection of text chunks."""
        embeddings = []
        for t in texts:
            emb = await cls.get_embedding(t)
            embeddings.append(emb)
        return embeddings

    @classmethod
    def cosine_similarity(cls, vec_a: List[float], vec_b: List[float]) -> float:
        """Calculates cosine similarity between two float vectors (0.0 to 1.0)."""
        if not vec_a or not vec_b or len(vec_a) != len(vec_b):
            return 0.0

        dot_product = sum(a * b for a, b in zip(vec_a, vec_b))
        norm_a = math.sqrt(sum(a * a for a in vec_a))
        norm_b = math.sqrt(sum(b * b for b in vec_b))

        if norm_a == 0.0 or norm_b == 0.0:
            return 0.0

        sim = dot_product / (norm_a * norm_b)
        return max(0.0, min(1.0, sim))

    @classmethod
    def has_content_overlap(cls, text_a: str, text_b: str) -> bool:
        """Verifies whether two texts share at least one meaningful content term or stem."""
        tokens_a = {simple_stem(t) for t in re.findall(r"\b[a-zA-Z0-9_\-\.]{3,}\b", text_a.lower()) if t not in STOP_WORDS}
        tokens_b = {simple_stem(t) for t in re.findall(r"\b[a-zA-Z0-9_\-\.]{3,}\b", text_b.lower()) if t not in STOP_WORDS}
        return bool(tokens_a.intersection(tokens_b))

    @classmethod
    def _normalize(cls, vec: List[float]) -> List[float]:
        norm = math.sqrt(sum(x * x for x in vec))
        if norm == 0.0:
            return [0.0] * len(vec)
        return [float(x / norm) for x in vec]

    @classmethod
    def _generate_local_embedding(cls, text: str) -> List[float]:
        """High-performance deterministic n-gram & token hashing vectorizer projected onto 384 dimensions."""
        raw_tokens = re.findall(r"\b[a-zA-Z0-9_\-\.]{2,}\b", text.lower())
        if not raw_tokens:
            return [0.0] * VECTOR_DIMENSION

        vector = [0.0] * VECTOR_DIMENSION
        features = {}

        content_tokens = [t for t in raw_tokens if t not in STOP_WORDS]
        for token in content_tokens:
            stem = simple_stem(token)
            features[f"w:{token}"] = features.get(f"w:{token}", 0.0) + 5.0
            features[f"s:{stem}"] = features.get(f"s:{stem}", 0.0) + 4.0

        for i in range(len(content_tokens) - 1):
            bigram = f"bi:{content_tokens[i]}_{content_tokens[i+1]}"
            features[bigram] = features.get(bigram, 0.0) + 6.0

        for term, weight in features.items():
            h = hashlib.sha256(term.encode("utf-8")).hexdigest()
            idx = int(h[:8], 16) % VECTOR_DIMENSION
            vector[idx] += weight

        return cls._normalize(vector)

    @classmethod
    async def _get_gemini_embedding(cls, text: str) -> Optional[List[float]]:
        url = f"https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:embedContent?key={settings.GEMINI_API_KEY}"
        payload = {
            "model": "models/text-embedding-004",
            "content": {"parts": [{"text": text[:2048]}]}
        }
        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.post(url, json=payload)
            if resp.status_code == 200:
                data = resp.json()
                values = data.get("embedding", {}).get("values", [])
                if values:
                    return values[:VECTOR_DIMENSION] if len(values) >= VECTOR_DIMENSION else values
        return None

    @classmethod
    async def _get_openai_embedding(cls, text: str) -> Optional[List[float]]:
        url = "https://api.openai.com/v1/embeddings"
        headers = {
            "Authorization": f"Bearer {settings.OPENAI_API_KEY}",
            "Content-Type": "application/json"
        }
        payload = {
            "input": text[:2048],
            "model": "text-embedding-3-small",
            "dimensions": VECTOR_DIMENSION
        }
        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.post(url, headers=headers, json=payload)
            if resp.status_code == 200:
                data = resp.json()
                data_list = data.get("data", [])
                if data_list:
                    return data_list[0].get("embedding", [])
        return None
