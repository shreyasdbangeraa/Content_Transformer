from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List, Dict, Any
from datetime import datetime

class OutputVersionResponse(BaseModel):
    id: str
    output_id: str
    version_number: int
    content: str
    structured_data: Dict[str, Any]
    change_reason: str
    created_by: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class ConversationalEditRequest(BaseModel):
    prompt: str = Field(..., description="User modification request, e.g. 'Make it shorter and more formal for government regulators'")

class DirectEditRequest(BaseModel):
    content: str
    change_reason: Optional[str] = "Manual user edit"

class ApprovalRequest(BaseModel):
    action: str = Field(default="APPROVE", description="'APPROVE' or 'REJECT'")
    notes: Optional[str] = None

class OutputResponse(BaseModel):
    id: str
    transformation_id: str
    format_type: str # executive_summary, linkedin, twitter, advisory, presentation, infographic, video_package
    title: Optional[str] = None
    raw_content: str
    structured_data: Dict[str, Any] = {}
    version: int = 1
    status: str # DRAFT, NEEDS_REVIEW, APPROVED, REJECTED, PUBLISHED
    approval_notes: Optional[str] = None
    approved_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime
    
    # Nested relations if populated
    fact_check: Optional[Dict[str, Any]] = None
    quality_score: Optional[Dict[str, Any]] = None

    model_config = ConfigDict(from_attributes=True)
