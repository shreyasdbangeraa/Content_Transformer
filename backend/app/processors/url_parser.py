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

# Multiple client profiles to maximize compatibility across CDN & WAF policies
REQUEST_PROFILES = [
    # Profile 1: Compliant informative agent (satisfies Wikipedia, ArXiv, Wikimedia & API requirements)
    {
        "User-Agent": "ContentTransformer/1.0 (Windows NT 10.0; Win64; x64; +https://github.com/ContentTransformer; content-reader@transformer.ai) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
        "Accept-Encoding": "gzip, deflate, br",
    },
    # Profile 2: Standard Desktop Chrome
    {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
        "Sec-Ch-Ua": '"Chromium";v="124", "Google Chrome";v="124", "Not-A.Brand";v="99"',
        "Sec-Ch-Ua-Mobile": "?0",
        "Sec-Ch-Ua-Platform": '"Windows"',
        "Sec-Fetch-Dest": "document",
        "Sec-Fetch-Mode": "navigate",
        "Sec-Fetch-Site": "none",
        "Sec-Fetch-User": "?1",
        "Upgrade-Insecure-Requests": "1",
    },
    # Profile 3: Standard macOS Safari
    {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4.1 Safari/605.1.15",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
    }
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
    """Safe URL content extractor with SSRF defense, anti-bot bypass, and markdown fallback."""

    @classmethod
    async def _fetch_direct(cls, url: str) -> Dict[str, Any]:
        """Direct browser-like fetch trying multiple compatible client profiles."""
        last_status = None
        async with httpx.AsyncClient(
            timeout=15.0,
            follow_redirects=True,
            max_redirects=5,
            verify=False
        ) as client:
            for profile in REQUEST_PROFILES:
                try:
                    resp = await client.get(url, headers=profile)
                    last_status = resp.status_code
                    if resp.status_code == 200 and len(resp.text.strip()) > 50:
                        html_content = resp.text
                        soup = BeautifulSoup(html_content, "html.parser")

                        # Remove non-content elements
                        for tag in soup(["script", "style", "nav", "footer", "header", "aside", "form", "svg", "noscript", "iframe"]):
                            tag.decompose()

                        # Extract title
                        title = None
                        if soup.title and soup.title.string:
                            title = soup.title.string.strip()
                        if not title:
                            og_title = soup.find("meta", property="og:title")
                            if og_title and og_title.get("content"):
                                title = og_title["content"].strip()
                        if not title:
                            h1 = soup.find("h1")
                            if h1:
                                title = h1.get_text(strip=True)
                        if not title:
                            title = url

                        # Extract main article or body content
                        main_content = (
                            soup.find("article")
                            or soup.find("main")
                            or soup.find(attrs={"role": "main"})
                            or soup.find(class_=re.compile(r"article|content|post-body|entry-content", re.I))
                            or soup.find("body")
                            or soup
                        )

                        text = main_content.get_text(separator="\n", strip=True)
                        if len(text.strip()) < 50:
                            text = soup.get_text(separator="\n", strip=True)

                        if len(text.strip()) >= 50:
                            return {
                                "title": title,
                                "text": text,
                                "extraction_method": "direct_html"
                            }
                except Exception:
                    continue

        raise ValueError(f"Direct fetch failed with status {last_status or 'error'}")

    @classmethod
    async def _fetch_via_reader(cls, url: str) -> Dict[str, Any]:
        """Fallback to Jina AI Reader proxy for Cloudflare / 403-protected articles."""
        jina_url = f"https://r.jina.ai/{url}"
        headers = {
            "Accept": "text/html,application/json,text/plain",
            "User-Agent": "ContentTransformer/1.0"
        }
        async with httpx.AsyncClient(timeout=25.0, follow_redirects=True) as client:
            resp = await client.get(jina_url, headers=headers)
            if resp.status_code != 200 or not resp.text.strip():
                raise ValueError(f"Reader proxy returned HTTP {resp.status_code}")

            raw_text = resp.text
            title = None

            # Extract title from Jina markdown metadata (e.g. 'Title: XYZ')
            title_match = re.search(r"^Title:\s*(.+)$", raw_text, re.MULTILINE)
            if title_match:
                title = title_match.group(1).strip()

            # Clean markdown header metadata
            clean_body = re.sub(r"^Title:.*?\n", "", raw_text, flags=re.MULTILINE)
            clean_body = re.sub(r"^URL Source:.*?\n", "", clean_body, flags=re.MULTILINE)
            clean_body = re.sub(r"^Published Time:.*?\n", "", clean_body, flags=re.MULTILINE)
            clean_body = re.sub(r"^Markdown Content:\s*\n", "", clean_body, flags=re.MULTILINE)

            if not title:
                # Try finding first markdown heading
                h1_match = re.search(r"^#\s+(.+)$", clean_body, re.MULTILINE)
                if h1_match:
                    title = h1_match.group(1).strip()
                else:
                    title = url

            return {
                "title": title,
                "text": clean_body.strip(),
                "extraction_method": "reader_proxy"
            }

    @classmethod
    async def extract_url(cls, url: str) -> Dict[str, Any]:
        is_safe, reason = is_safe_url(url)
        if not is_safe:
            raise ValueError(f"Security Alert: {reason}")

        extracted = None
        last_error = None

        # Attempt 1: Direct multi-profile fetch
        try:
            extracted = await cls._fetch_direct(url)
        except Exception as direct_err:
            last_error = direct_err

        # Attempt 2: If direct fetch failed (403, 401, 503, anti-bot), use reader proxy
        if not extracted or not extracted.get("text", "").strip():
            try:
                extracted = await cls._fetch_via_reader(url)
            except Exception as reader_err:
                raise ValueError(
                    f"Unable to access {url}. The target site returned 403 Forbidden or is protected by anti-bot verification. "
                    f"You can copy and paste the article text directly into the 'Paste Text' tab."
                )

        raw_text = extracted.get("text", "")
        title = extracted.get("title") or url
        clean_text, threats = sanitize_untrusted_text(raw_text)

        estimated_pages = max(1, len(clean_text) // 2500)

        return {
            "title": title,
            "text": clean_text,
            "char_count": len(clean_text),
            "page_count": estimated_pages,
            "metadata": {
                "source_url": url,
                "title": title,
                "threats_detected": threats,
                "extraction_method": extracted.get("extraction_method", "direct_html")
            }
        }
