import re

def sanitize_linkedin_content(text: str) -> str:
    """
    Cleans, formats, and sanitizes LinkedIn thought leadership posts.
    Eliminates unnecessary blank spaces, trailing whitespace, and markdown header artifacts
    while ensuring clean, professional paragraph breaks and tight bullet lists.
    """
    if not text:
        return ""

    # 1. Normalize line breaks and remove null characters
    cleaned = text.replace("\r\n", "\n").replace("\r", "\n").strip()

    # 2. Strip code fences if model returned them
    cleaned = re.sub(r"^```[a-zA-Z]*\n?", "", cleaned)
    cleaned = re.sub(r"\n?```$", "", cleaned)

    # 3. Convert markdown headers (###, ##, #) to clean bold or plain text
    # Avoid converting hashtag lines like "#Cybersecurity #AI"
    def replace_header(match):
        header_text = match.group(1).strip()
        # If the content after # is multiple hashtags, leave it
        words = header_text.split()
        if len(words) > 1 and all(w.startswith("#") for w in words):
            return "#" + header_text
        if header_text.endswith(":"):
            return f"**{header_text}**"
        return f"**{header_text}:**"

    # Only match markdown headers with a space after the #s
    cleaned = re.sub(r"^[#]{1,6}\s+([A-Za-z0-9\u0080-\uffff].*)$", replace_header, cleaned, flags=re.MULTILINE)

    # 4. Normalize lines: strip trailing whitespace from each line
    raw_lines = [l.strip() for l in cleaned.split("\n")]

    # 5. Process sections
    # Identify whether a line is a bullet/metric/directive
    def is_bullet_item(line_text: str) -> bool:
        return bool(re.match(r"^(\*|\-|\•|\d+[\.\)]|🔹|📌|📊|🎯|💡|🚀|🛡️|1️⃣|2️⃣|3️⃣|4️⃣|5️⃣|6️⃣|7️⃣|8️⃣|9️⃣)", line_text))

    def is_hashtag_line(line_text: str) -> bool:
        words = [w for w in line_text.split() if w]
        return bool(words and all(w.startswith("#") for w in words))

    sections = []
    current_block = []

    for line in raw_lines:
        if not line:
            if current_block:
                sections.append("\n".join(current_block))
                current_block = []
            continue

        if is_hashtag_line(line):
            if current_block:
                sections.append("\n".join(current_block))
                current_block = []
            # Normalize hashtags (single spaces between tags)
            norm_tags = " ".join([h for h in line.split() if h.startswith("#")])
            sections.append(norm_tags)
            continue

        if is_bullet_item(line):
            current_block.append(line)
        else:
            if current_block and any(is_bullet_item(item) for item in current_block):
                # Transitioning from list to regular paragraph
                sections.append("\n".join(current_block))
                current_block = [line]
            else:
                current_block.append(line)

    if current_block:
        sections.append("\n".join(current_block))

    # 6. Join distinct sections with exactly one blank line (\n\n)
    final_post = "\n\n".join([s.strip() for s in sections if s.strip()])
    
    # 7. Final safety cleanup: collapse any lingering 3+ newlines to double newlines
    final_post = re.sub(r"\n{3,}", "\n\n", final_post)

    return final_post.strip()
