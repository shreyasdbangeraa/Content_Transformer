import re
from typing import Dict, Any, List

# Regex patterns for comprehensive sensitive data detection
EMAIL_REGEX = r'[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+'
PHONE_REGEX = r'(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}'
IPV4_REGEX = r'\b(?:10\.\d{1,3}\.\d{1,3}\.\d{1,3}|172\.(?:1[6-9]|2\d|3[01])\.\d{1,3}\.\d{1,3}|192\.168\.\d{1,3}\.\d{1,3})\b'
INTERNAL_HOST_REGEX = r'\b(?:[a-zA-Z0-9_-]+\.)+(?:internal|local|corp|lan|novatech-internal\.net)\b'
CREDENTIAL_REGEX = r'(?:password|secret|api[_-]?key|bearer|token|auth)\s*[:=]\s*["\']?([a-zA-Z0-9_\-\.]{8,})["\']?'
JWT_TOKEN_REGEX = r'\beyJ[a-zA-Z0-9_-]{10,}\.[a-zA-Z0-9_-]{10,}\.[a-zA-Z0-9_-]{10,}\b'
AWS_KEY_REGEX = r'\bAKIA[0-9A-Z]{16}\b'

class SensitivityService:
    """Detects and redacts sensitive PII, internal IP addresses, hostnames, and credentials."""

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

    @staticmethod
    def mask_host(host: str) -> str:
        parts = host.split(".")
        if len(parts) >= 2:
            return f"{parts[0][:3]}***.{parts[-1]}"
        return "****"

    @staticmethod
    def mask_secret(secret: str) -> str:
        if len(secret) > 6:
            return f"{secret[:3]}****{secret[-3:]}"
        return "********"

    @classmethod
    def scan_text(cls, text: str) -> Dict[str, Any]:
        items: List[Dict[str, Any]] = []
        seen_values = set()

        # 1. Check Emails
        for match in set(re.findall(EMAIL_REGEX, text)):
            if match not in seen_values:
                seen_values.add(match)
                items.append({
                    "type": "EMAIL",
                    "value": match,
                    "masked_value": cls.mask_email(match),
                    "severity": "MEDIUM",
                    "recommendation": "Mask direct personnel email before external publication to prevent spear-phishing."
                })

        # 2. Check Phone numbers
        for match in set(re.findall(PHONE_REGEX, text)):
            if len(match.strip()) >= 7 and match not in seen_values:
                seen_values.add(match)
                items.append({
                    "type": "PHONE",
                    "value": match,
                    "masked_value": cls.mask_phone(match),
                    "severity": "MEDIUM",
                    "recommendation": "Redact direct internal phone numbers from external media."
                })

        # 3. Check Internal IP addresses
        for match in set(re.findall(IPV4_REGEX, text)):
            if match not in seen_values:
                seen_values.add(match)
                items.append({
                    "type": "INTERNAL_IP",
                    "value": match,
                    "masked_value": cls.mask_ip(match),
                    "severity": "HIGH",
                    "recommendation": "Mask internal subnet identifiers to prevent architectural reconnaissance."
                })

        # 4. Check Internal Hostnames
        for match in set(re.findall(INTERNAL_HOST_REGEX, text, re.IGNORECASE)):
            if match not in seen_values:
                seen_values.add(match)
                items.append({
                    "type": "INTERNAL_HOSTNAME",
                    "value": match,
                    "masked_value": cls.mask_host(match),
                    "severity": "HIGH",
                    "recommendation": "Redact internal gateway hostnames to obscure perimeter infrastructure."
                })

        # 5. Check API Keys & Passwords
        for match in set(re.findall(CREDENTIAL_REGEX, text, re.IGNORECASE)):
            if match not in seen_values:
                seen_values.add(match)
                items.append({
                    "type": "CREDENTIAL",
                    "value": match,
                    "masked_value": cls.mask_secret(match),
                    "severity": "CRITICAL",
                    "recommendation": "Revoke and redact immediately. Secret exposure in production is prohibited."
                })

        # 6. Check JWT / Bearer Tokens
        for match in set(re.findall(JWT_TOKEN_REGEX, text)):
            if match not in seen_values:
                seen_values.add(match)
                items.append({
                    "type": "AUTH_TOKEN",
                    "value": match,
                    "masked_value": cls.mask_secret(match),
                    "severity": "CRITICAL",
                    "recommendation": "Redact authentication token to prevent unauthorized session replay."
                })

        # 7. Check AWS Keys
        for match in set(re.findall(AWS_KEY_REGEX, text)):
            if match not in seen_values:
                seen_values.add(match)
                items.append({
                    "type": "CLOUD_KEY",
                    "value": match,
                    "masked_value": cls.mask_secret(match),
                    "severity": "CRITICAL",
                    "recommendation": "Redact cloud access key identifier."
                })

        level = "low"
        if any(item.get("severity") == "CRITICAL" for item in items) or len(items) >= 3:
            level = "high"
        elif len(items) >= 1:
            level = "medium"

        return {
            "level": level,
            "detected_count": len(items),
            "items": items,
            "public_safety_advisory": f"{len(items)} sensitive identifier(s) detected. Apply redactions before external publishing." if items else "No high-risk sensitive data detected. Safe for public release."
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
