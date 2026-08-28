import os
import pymupdf
from docx import Document
from typing import Dict, Any, List, Tuple
from app.processors.sanitizer import sanitize_untrusted_text

class DocumentParser:
    """Parses various document types into unified text and structured section/page metadata."""

    @staticmethod
    def parse_pdf(file_path: str) -> Tuple[str, int, List[Dict[str, Any]]]:
        """
        Parses a PDF file using PyMuPDF and extracts page-level text.
        Returns: (full_text, page_count, pages_metadata)
        """
        doc = pymupdf.open(file_path)
        full_text_list = []
        pages_metadata = []
        
        for page_num in range(len(doc)):
            page = doc[page_num]
            text = page.get_text()
            full_text_list.append(text)
            pages_metadata.append({
                "page": page_num + 1,
                "text": text,
                "char_count": len(text)
            })
            
        doc.close()
        full_text = "\n\n".join(full_text_list)
        clean_text, threats = sanitize_untrusted_text(full_text)
        return clean_text, len(pages_metadata), pages_metadata

    @staticmethod
    def parse_docx(file_path: str) -> Tuple[str, int, List[Dict[str, Any]]]:
        """
        Parses a DOCX file using python-docx.
        Returns: (full_text, estimated_pages, paragraphs_metadata)
        """
        doc = Document(file_path)
        paragraphs = []
        full_text_list = []
        
        for idx, para in enumerate(doc.paragraphs):
            text = para.text.strip()
            if text:
                full_text_list.append(text)
                paragraphs.append({
                    "paragraph_idx": idx + 1,
                    "text": text,
                    "style": para.style.name if para.style else "Normal"
                })
                
        full_text = "\n\n".join(full_text_list)
        clean_text, threats = sanitize_untrusted_text(full_text)
        estimated_pages = max(1, len(full_text) // 2500)
        return clean_text, estimated_pages, paragraphs

    @staticmethod
    def parse_txt(file_path: str) -> Tuple[str, int, List[Dict[str, Any]]]:
        """
        Parses a plain text file.
        """
        with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
            full_text = f.read()
            
        clean_text, threats = sanitize_untrusted_text(full_text)
        estimated_pages = max(1, len(clean_text) // 2500)
        return clean_text, estimated_pages, [{"page": 1, "text": clean_text}]

    @classmethod
    def parse_file(cls, file_path: str, file_type: str) -> Dict[str, Any]:
        """
        Main routing function to parse any supported document.
        """
        ext = file_type.lower().replace(".", "")
        if ext == "pdf":
            text, pages, meta = cls.parse_pdf(file_path)
        elif ext in ["docx", "doc"]:
            text, pages, meta = cls.parse_docx(file_path)
        elif ext in ["txt", "md"]:
            text, pages, meta = cls.parse_txt(file_path)
        else:
            # Fallback text read
            text, pages, meta = cls.parse_txt(file_path)

        return {
            "text": text,
            "char_count": len(text),
            "page_count": pages,
            "metadata": meta
        }
