"""
Domain-aware high-resolution banner and imagery resolver.
Provides downloadable public HTTP image URLs for n8n automation pipelines and social media platforms.
"""

def resolve_domain_image_url(topic: str = "", summary: str = "", domain: str = "") -> str:
    """
    Returns a verified, high-resolution (1200x630) domain-matched downloadable HTTP image URL
    suitable for LinkedIn, Instagram, X/Twitter, and n8n webhook binary downloads.
    """
    combined = f"{topic} {summary} {domain}".lower()

    if any(k in combined for k in ["cyber", "darkhydra", "security", "threat", "incident", "ransomware", "malware", "vulnerability", "breach", "zero-day", "infosec", "soc"]):
        return "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=1200&h=630&q=80"
    elif any(k in combined for k in ["health", "medical", "clinical", "hospital", "patient", "disease", "vaccine", "biotech", "pharma", "who"]):
        return "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=1200&h=630&q=80"
    elif any(k in combined for k in ["finance", "economy", "market", "banking", "investment", "stock", "revenue", "fiscal", "sec", "crypto", "blockchain"]):
        return "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&h=630&q=80"
    elif any(k in combined for k in ["gov", "policy", "regulation", "compliance", "legal", "statute", "federal", "law", "advisory", "cisa"]):
        return "https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=1200&h=630&q=80"
    elif any(k in combined for k in ["energy", "climate", "solar", "renewable", "grid", "power", "carbon", "environment"]):
        return "https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?auto=format&fit=crop&w=1200&h=630&q=80"
    elif any(k in combined for k in ["education", "school", "university", "academic", "learning", "student"]):
        return "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1200&h=630&q=80"
    elif any(k in combined for k in ["leadership", "strategy", "management", "executive", "board", "enterprise", "business", "growth"]):
        return "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&h=630&q=80"
    else:
        # Default: Modern Enterprise AI & Innovation
        return "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&h=630&q=80"
