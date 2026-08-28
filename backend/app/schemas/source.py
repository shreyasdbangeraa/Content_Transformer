from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, Dict, Any, List
from datetime import datetime

class SourceBase(BaseModel):
    filename: str
    file_type: str
    raw_text: str
    char_count: int = 0
    page_count: int = 1
    meta_info: Dict[str, Any] = {}
    processing_status: str = "PROCESSED"

class SourceCreate(SourceBase):
    project_id: str

class SourceProcessRequest(BaseModel):
    title: Optional[str] = None
    text: Optional[str] = None
    url: Optional[str] = None
    research_mode: Optional[str] = "SOURCE_AND_VERIFY"

class SourceResponse(SourceBase):
    id: str
    project_id: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
