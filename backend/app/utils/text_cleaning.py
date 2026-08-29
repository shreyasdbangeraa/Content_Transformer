import re

def clean_linkedin_text(text: str) -> str:
    """
    Standardizes LinkedIn post text to guarantee flawless typography and line spacing:
    - Normalizes all line breaks (\\r\\n -> \\n)
    - Strips leading and trailing whitespace from every individual line
    - Collapses 3 or more consecutive newlines into exactly 2 newlines (one clean blank line between paragraphs)
    - Collapses redundant multiple spaces into a single space
    - Strips leading and trailing newlines from the entire post
    - Ensures clean bullet indentation without dangling empty lines
    """
    if not text:
        return ""
    # Normalize Windows CRLF to LF
    t = text.replace("\r\n", "\n").replace("\r", "\n")
    # Strip whitespace from each line
    lines = [line.strip() for line in t.split("\n")]
    t = "\n".join(lines)
    # Collapse 3 or more consecutive newlines into exactly 2 newlines (1 blank line)
    t = re.sub(r"\n{3,}", "\n\n", t)
    # Collapse redundant horizontal spaces (2 or more spaces -> 1 space)
    t = re.sub(r"[ \t]+", " ", t)
    return t.strip()
