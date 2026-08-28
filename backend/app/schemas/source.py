from pydantic import BaseModel
from typing import Optional, Dict, Any
from datetime import datetime

class SourceBase(BaseModel):
    filename: str
    file_type: str # pdf, docx, txt, url, text_paste, image
    raw_text: str
    char_count: Optional[int] = 0
    page_count: Optional[int] = 1
    meta_info: Optional[Dict[str, Any]] = {}

class SourceCreate(SourceBase):
    project_id: str

class SourceProcessRequest(BaseModel):
    source_type: str # "upload", "text", "url", "demo"
    text: Optional[str] = None
    url: Optional[str] = None

class SourceResponse(SourceBase):
    id: str
    project_id: str
    processing_status: str
    created_at: datetime

    class Config:
        from_attributes = True
