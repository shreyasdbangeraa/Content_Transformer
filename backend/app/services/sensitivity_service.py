import re
from typing import Dict, Any, List

# Regex patterns for sensitive data detection
EMAIL_REGEX = r'[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+'
PHONE_REGEX = r'(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}'
IPV4_REGEX = r'\b(?:10\.\d{1,3}\.\d{1,3}\.\d{1,3}|172\.(?:1[6-9]|2\d|3[01])\.\d{1,3}\.\d{1,3}|192\.168\.\d{1,3}\.\d{1,3})\b'
CREDENTIAL_REGEX = r'(?:password|secret|api[_-]?key|bearer|token)\s*[:=]\s*["\']?([a-zA-Z0-9_\-\.]{8,})["\']?'

class SensitivityService:
    """Detects and redacts sensitive PII, internal IP addresses, and credentials."""

    @staticmethod
    def mask_email(email: str) -> str:
        parts = email.split("@")
        if len(parts) == 2:
            name, domain = parts
            masked_name = name[:2] + "****" if len(name) > 2 else "****"
            return f"{masked_name}@{domain}"
        return "****"

    @staticmethod
    def mask_phone(phone: str) -> str:
        return re.sub(r'\d', '*', phone[:-4]) + phone[-4:] if len(phone) >= 4 else "****"

    @staticmethod
    def mask_ip(ip: str) -> str:
        parts = ip.split(".")
        if len(parts) == 4:
            return f"{parts[0]}.***.***.{parts[3]}"
        return "****"

    @classmethod
    def scan_text(cls, text: str) -> Dict[str, Any]:
        items: List[Dict[str, Any]] = []

        # Check Emails
        for match in set(re.findall(EMAIL_REGEX, text)):
            items.append({
                "type": "EMAIL",
                "value": match,
                "masked_value": cls.mask_email(match),
                "recommendation": "Redact or mask before public/social publishing."
            })

        # Check Phone numbers
        for match in set(re.findall(PHONE_REGEX, text)):
            if len(match.strip()) >= 7:
                items.append({
                    "type": "PHONE",
                    "value": match,
                    "masked_value": cls.mask_phone(match),
                    "recommendation": "Redact direct internal phone numbers from external media."
                })

        # Check Internal IP addresses
        for match in set(re.findall(IPV4_REGEX, text)):
            items.append({
                "type": "INTERNAL_IP",
                "value": match,
                "masked_value": cls.mask_ip(match),
                "recommendation": "Mask internal subnet identifiers to prevent architectural reconnaissance."
            })

        level = "low"
        if len(items) >= 3:
            level = "high"
        elif len(items) >= 1:
            level = "medium"

        return {
            "level": level,
            "detected_count": len(items),
            "items": items,
            "public_safety_advisory": f"{len(items)} sensitive item(s) detected. Ensure redactions are applied before external social publication." if items else "No sensitive identifiers detected."
        }

    @classmethod
    def apply_redactions(cls, text: str, items_to_mask: List[Dict[str, Any]]) -> str:
        redacted = text
        for item in items_to_mask:
            val = item.get("value")
            masked = item.get("masked_value")
            if val and masked:
                redacted = redacted.replace(val, masked)
        return redacted
