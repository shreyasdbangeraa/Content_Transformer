import pytest
from bs4 import BeautifulSoup
from app.processors.url_parser import URLParser

def test_extract_and_rank_internal_links():
    html = """
    <html>
        <body>
            <a href="/about">About Us</a>
            <a href="/services">Our Services</a>
            <a href="/pricing">Pricing Plans</a>
            <a href="/contact-us">Contact Team</a>
            <a href="https://external.com/page">External Link</a>
            <a href="/logo.png">Logo Image</a>
            <a href="/terms">Terms of Service</a>
            <a href="#section1">Anchor</a>
        </body>
    </html>
    """
    soup = BeautifulSoup(html, "html.parser")
    base_url = "https://example.in"
    links = URLParser._extract_and_rank_internal_links(soup, base_url)
    
    assert "https://example.in/about" in links
    assert "https://example.in/services" in links
    assert "https://example.in/pricing" in links
    assert "https://external.com/page" not in links
    assert "https://example.in/logo.png" not in links
    assert len(links) >= 4

@pytest.mark.asyncio
async def test_extract_url_structure():
    # Test link discovery helper logic
    assert hasattr(URLParser, "extract_url")
