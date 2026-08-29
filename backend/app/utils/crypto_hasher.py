import hashlib
import json
import re
from typing import Dict, Any, Union

def normalize_content_for_hashing(content: Union[str, Dict[str, Any]]) -> str:
    """
    Deterministically normalizes text or structured data before cryptographic hashing.
    - Normalizes line breaks (\r\n -> \n)
    - Strips leading/trailing whitespace on every line
    - Collapses multiple whitespace gaps
    - Encodes in canonical UTF-8
    """
    if isinstance(content, dict):
        # Deterministic JSON serialization with sorted keys
        return json.dumps(content, sort_keys=True, separators=(',', ':'), ensure_ascii=False)
    
    if not isinstance(content, str):
        content = str(content or "")

    # Normalize line breaks
    normalized = content.replace("\r\n", "\n").replace("\r", "\n")
    
    # Strip trailing whitespace on each line
    lines = [line.strip() for line in normalized.split("\n")]
    
    # Reassemble with single clean newlines
    normalized_text = "\n".join(lines).strip()
    return normalized_text

def hash_content(content: Union[str, Dict[str, Any]]) -> Dict[str, str]:
    """
    Generates a deterministic SHA-256 cryptographic digest of the provided content.
    Returns structured hash details including 0x-prefixed hex representation.
    """
    normalized = normalize_content_for_hashing(content)
    utf8_bytes = normalized.encode("utf-8")
    sha256_hex = hashlib.sha256(utf8_bytes).hexdigest()
    
    return {
        "algorithm": "SHA-256",
        "hash": f"0x{sha256_hex}",
        "raw_hex": sha256_hex,
        "byte_length": str(len(utf8_bytes))
    }
