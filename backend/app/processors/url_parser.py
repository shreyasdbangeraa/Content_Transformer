import re
import ipaddress
from urllib.parse import urlparse
import httpx
from bs4 import BeautifulSoup
from typing import Dict, Any, Tuple
from app.processors.sanitizer import sanitize_untrusted_text

BLOCKED_IP_RANGES = [
    ipaddress.ip_network("127.0.0.0/8"),
    ipaddress.ip_network("10.0.0.0/8"),
    ipaddress.ip_network("172.16.0.0/12"),
    ipaddress.ip_network("192.168.0.0/16"),
    ipaddress.ip_network("169.254.0.0/16"),
    ipaddress.ip_network("::1/128"),
    ipaddress.ip_network("fc00::/7"),
    ipaddress.ip_network("fe80::/10"),
]

def is_safe_url(url: str) -> Tuple[bool, str]:
    """Validates URL to protect against SSRF and private intranet scraping."""
    try:
        parsed = urlparse(url)
        if parsed.scheme not in ["http", "https"]:
            return False, "Invalid URL scheme. Only HTTP and HTTPS are permitted."
        
        hostname = parsed.hostname
        if not hostname:
            return False, "Missing hostname in URL."
            
        if hostname.lower() in ["localhost", "127.0.0.1", "0.0.0.0"]:
            return False, "Localhost addresses are blocked."

        # Check if IP is in private range
        try:
            ip = ipaddress.ip_address(hostname)
            for blocked in BLOCKED_IP_RANGES:
                if ip in blocked:
                    return False, f"Access to private IP address {hostname} is blocked."
        except ValueError:
            # It's a regular domain name
            pass
            
        return True, "Safe URL"
    except Exception as e:
        return False, str(e)

class URLParser:
    """Safe URL content extractor with SSRF defense and clean article text parsing."""

    @staticmethod
    async def extract_url(url: str) -> Dict[str, Any]:
        is_safe, reason = is_safe_url(url)
        if not is_safe:
            raise ValueError(f"Security Alert: {reason}")

        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36 AIContentTransformer/1.0"
        }

        async with httpx.AsyncClient(timeout=15.0, follow_redirects=True, max_redirects=3) as client:
            resp = await client.get(url, headers=headers)
            if resp.status_code != 200:
                raise ValueError(f"Failed to fetch URL. HTTP status code: {resp.status_code}")

            html_content = resp.text
            soup = BeautifulSoup(html_content, "html.parser")

            # Remove scripts, styles, forms, and navigation tags
            for tag in soup(["script", "style", "nav", "footer", "header", "aside", "form"]):
                tag.decompose()

            title = soup.title.string.strip() if soup.title and soup.title.string else url

            # Extract main article or body
            main_content = soup.find("article") or soup.find("main") or soup.find("body")
            if not main_content:
                main_content = soup

            text = main_content.get_text(separator="\n", strip=True)
            clean_text, threats = sanitize_untrusted_text(text)

            estimated_pages = max(1, len(clean_text) // 2500)

            return {
                "title": title,
                "text": clean_text,
                "char_count": len(clean_text),
                "page_count": estimated_pages,
                "metadata": {
                    "source_url": url,
                    "title": title,
                    "threats_detected": threats
                }
            }
