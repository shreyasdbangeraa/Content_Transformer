import re
import asyncio
import ipaddress
from urllib.parse import urlparse, urljoin, urldefrag
import httpx
from bs4 import BeautifulSoup
from typing import Dict, Any, Tuple, List, Set, Optional
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
    # Profile 1: Compliant informative agent
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

IGNORED_EXTENSIONS = {
    ".png", ".jpg", ".jpeg", ".gif", ".webp", ".bmp", ".svg", ".ico",
    ".pdf", ".zip", ".tar", ".gz", ".rar", ".7z", ".exe", ".dmg", ".apk",
    ".mp3", ".mp4", ".wav", ".avi", ".mov", ".mkv", ".webm",
    ".css", ".js", ".json", ".xml", ".woff", ".woff2", ".ttf", ".eot"
}

PRIORITY_KEYWORDS = [
    "about", "service", "product", "feature", "solution", "company", "team",
    "overview", "pricing", "plan", "contact", "faq", "help", "doc", "guide",
    "security", "compliance", "policy", "term", "privacy", "mission", "vision",
    "case-stud", "customer", "technology", "architecture", "research", "news", "blog"
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
    """
    Enterprise URL & Multi-Page Deep Website Crawler.
    Supports single-page extraction and automated multi-page domain crawling (/about, /services, etc.)
    with SSRF defense, bot-bypass fallbacks, and structured knowledge synthesis.
    """

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

                        # Clone soup for link extraction before decomposing tags
                        raw_soup = BeautifulSoup(html_content, "html.parser")

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
                                "url": url,
                                "title": title,
                                "text": text,
                                "soup": raw_soup,
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

            title_match = re.search(r"^Title:\s*(.+)$", raw_text, re.MULTILINE)
            if title_match:
                title = title_match.group(1).strip()

            clean_body = re.sub(r"^Title:.*?\n", "", raw_text, flags=re.MULTILINE)
            clean_body = re.sub(r"^URL Source:.*?\n", "", clean_body, flags=re.MULTILINE)
            clean_body = re.sub(r"^Published Time:.*?\n", "", clean_body, flags=re.MULTILINE)
            clean_body = re.sub(r"^Markdown Content:\s*\n", "", clean_body, flags=re.MULTILINE)

            if not title:
                h1_match = re.search(r"^#\s+(.+)$", clean_body, re.MULTILINE)
                if h1_match:
                    title = h1_match.group(1).strip()
                else:
                    title = url

            return {
                "url": url,
                "title": title,
                "text": clean_body.strip(),
                "soup": None,
                "extraction_method": "reader_proxy"
            }

    @classmethod
    async def _fetch_page(cls, url: str) -> Optional[Dict[str, Any]]:
        """Fetches a single page safely with direct and reader-proxy fallbacks."""
        safe, reason = is_safe_url(url)
        if not safe:
            return None

        try:
            return await cls._fetch_direct(url)
        except Exception:
            try:
                return await cls._fetch_via_reader(url)
            except Exception:
                return None

    @classmethod
    def _extract_and_rank_internal_links(cls, soup: BeautifulSoup, base_url: str) -> List[str]:
        """Discovers, normalizes, and prioritizes internal links matching the same domain."""
        if not soup:
            return []

        parsed_base = urlparse(base_url)
        base_host = (parsed_base.netloc or "").lower()
        if base_host.startswith("www."):
            base_host = base_host[4:]

        discovered: Set[str] = set()
        ranked_links: List[Tuple[int, str]] = []

        for a_tag in soup.find_all("a", href=True):
            href = a_tag["href"].strip()
            if not href or href.startswith(("#", "javascript:", "mailto:", "tel:")):
                continue

            absolute_url = urljoin(base_url, href)
            clean_url, _ = urldefrag(absolute_url)
            clean_url = clean_url.rstrip("/")

            parsed = urlparse(clean_url)
            link_host = (parsed.netloc or "").lower()
            if link_host.startswith("www."):
                link_host = link_host[4:]

            # Keep strictly same base domain
            if link_host != base_host:
                continue

            # Skip binary and static media files
            path_lower = parsed.path.lower()
            if any(path_lower.endswith(ext) for ext in IGNORED_EXTENSIONS):
                continue

            if clean_url in discovered or clean_url == base_url.rstrip("/"):
                continue

            discovered.add(clean_url)

            # Score priority based on high-value keywords in URL path or link text
            anchor_text = a_tag.get_text(strip=True).lower()
            link_combined = f"{path_lower} {anchor_text}"

            score = 0
            for idx, kw in enumerate(PRIORITY_KEYWORDS):
                if kw in link_combined:
                    score += max(10, 50 - idx * 2)

            ranked_links.append((score, clean_url))

        # Sort highest scoring links first
        ranked_links.sort(key=lambda x: x[0], reverse=True)
        return [url for _, url in ranked_links]

    @classmethod
    async def extract_url(
        cls,
        url: str,
        crawl_subpages: bool = False,
        max_pages: int = 8
    ) -> Dict[str, Any]:
        """
        Extracts content from a URL, with optional multi-page internal crawling (e.g. /about, /services, /pricing).
        """
        is_safe, reason = is_safe_url(url)
        if not is_safe:
            raise ValueError(f"Security Alert: {reason}")

        # 1. Fetch Root / Primary URL
        root_data = await cls._fetch_page(url)
        if not root_data or not root_data.get("text", "").strip():
            raise ValueError(
                f"Unable to access {url}. The target site returned an error or anti-bot challenge. "
                f"You can copy and paste the website text directly into the 'Paste Text' tab."
            )

        crawled_pages: List[Dict[str, Any]] = [
            {
                "url": url,
                "title": root_data.get("title", url),
                "text": root_data.get("text", ""),
                "char_count": len(root_data.get("text", "")),
                "is_root": True
            }
        ]

        # 2. Multi-Page Crawl if requested or if root URL with subpages enabled
        if crawl_subpages and max_pages > 1:
            candidate_links = cls._extract_and_rank_internal_links(root_data.get("soup"), url)
            to_crawl = candidate_links[: max(1, max_pages - 1)]

            if to_crawl:
                # Crawl subpages concurrently with bounded semaphore
                sem = asyncio.Semaphore(4)

                async def _crawl_subpage(sub_url: str):
                    async with sem:
                        try:
                            sub_res = await cls._fetch_page(sub_url)
                            if sub_res and len(sub_res.get("text", "").strip()) >= 50:
                                return {
                                    "url": sub_url,
                                    "title": sub_res.get("title", sub_url),
                                    "text": sub_res.get("text", ""),
                                    "char_count": len(sub_res.get("text", "")),
                                    "is_root": False
                                }
                        except Exception:
                            pass
                        return None

                subpage_tasks = [_crawl_subpage(u) for u in to_crawl]
                subpage_results = await asyncio.gather(*subpage_tasks)
                for res in subpage_results:
                    if res:
                        crawled_pages.append(res)

        # 3. Assemble Consolidated Document Text
        if len(crawled_pages) == 1:
            raw_text = crawled_pages[0]["text"]
            title = crawled_pages[0]["title"]
        else:
            base_parsed = urlparse(url)
            domain_name = base_parsed.netloc
            title = f"{root_data.get('title', domain_name)} (Full Website Crawl: {len(crawled_pages)} Pages)"

            doc_sections = [
                f"# Full Website Ingestion: {title}",
                f"**Domain:** {domain_name} | **Total Ingested Pages:** {len(crawled_pages)}",
                f"**Crawled Pages:**\n" + "\n".join([f"- [{p['title']}]({p['url']}) ({p['char_count']} chars)" for p in crawled_pages]),
                "\n" + "=" * 80 + "\n"
            ]

            for idx, p in enumerate(crawled_pages, 1):
                page_label = "ROOT LANDING PAGE" if p.get("is_root") else f"SUBPAGE {idx}"
                doc_sections.append(
                    f"## [{idx}/{len(crawled_pages)}] {page_label}: {p['title']}\n"
                    f"**URL:** {p['url']}\n\n"
                    f"{p['text']}\n\n"
                    + "-" * 60 + "\n"
                )

            raw_text = "\n".join(doc_sections)

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
                "is_multi_page": len(crawled_pages) > 1,
                "crawled_pages_count": len(crawled_pages),
                "crawled_pages": [
                    {"url": p["url"], "title": p["title"], "char_count": p["char_count"]}
                    for p in crawled_pages
                ],
                "threats_detected": threats,
                "extraction_method": root_data.get("extraction_method", "direct_html")
            }
        }

