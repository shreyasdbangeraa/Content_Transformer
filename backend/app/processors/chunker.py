import re
from typing import List, Dict, Any

class RecursiveTextChunker:
    """Intelligent text splitter preserving paragraph and sentence boundaries with configurable overlap."""

    def __init__(self, chunk_size: int = 600, chunk_overlap: int = 100):
        self.chunk_size = max(100, chunk_size)
        self.chunk_overlap = max(0, min(chunk_overlap, self.chunk_size // 2))
        self.separators = ["\n\n", "\n", ". ", "? ", "! ", "; ", ", ", " "]

    def chunk_text(self, text: str) -> List[Dict[str, Any]]:
        """Splits raw text into indexed chunks with boundary awareness and overlap."""
        if not text or not text.strip():
            return []

        cleaned = text.strip()
        raw_splits = self._split_text(cleaned, self.separators)
        
        chunks = []
        current_chunk = []
        current_length = 0
        chunk_index = 0

        for segment in raw_splits:
            segment_len = len(segment)
            if current_length + segment_len > self.chunk_size and current_chunk:
                combined_text = "".join(current_chunk).strip()
                if combined_text:
                    chunks.append({
                        "index": chunk_index,
                        "text": combined_text,
                        "char_count": len(combined_text),
                        "word_count": len(combined_text.split())
                    })
                    chunk_index += 1

                # Retain overlap from end of current chunk
                overlap_text = []
                overlap_len = 0
                for item in reversed(current_chunk):
                    if overlap_len + len(item) <= self.chunk_overlap:
                        overlap_text.insert(0, item)
                        overlap_len += len(item)
                    else:
                        break

                current_chunk = overlap_text
                current_length = overlap_len

            current_chunk.append(segment)
            current_length += segment_len

        # Append final remaining chunk
        if current_chunk:
            final_text = "".join(current_chunk).strip()
            if final_text:
                chunks.append({
                    "index": chunk_index,
                    "text": final_text,
                    "char_count": len(final_text),
                    "word_count": len(final_text.split())
                })

        return chunks

    def _split_text(self, text: str, separators: List[str]) -> List[str]:
        """Recursively decomposes text using hierarchal punctuation separators."""
        if not separators:
            return [text]

        sep = separators[0]
        remaining_seps = separators[1:]

        if sep not in text:
            return self._split_text(text, remaining_seps)

        parts = text.split(sep)
        splits = []
        for i, part in enumerate(parts):
            if not part:
                continue
            token = part if i == len(parts) - 1 else part + sep
            if len(token) > self.chunk_size and remaining_seps:
                splits.extend(self._split_text(token, remaining_seps))
            else:
                splits.append(token)

        return splits
