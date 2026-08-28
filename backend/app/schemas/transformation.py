from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime

class TransformationConfig(BaseModel):
    target_audience: str = Field(default="Government Officials", description="Target Audience")
    tone: str = Field(default="Formal", description="Communication Tone")
    language: str = Field(default="English", description="Target Language")
    detail_level: str = Field(default="Medium", description="Detail Level: Short, Medium, Detailed")
    communication_objective: str = Field(default="Inform & Warn", description="Primary Objective")
    content_style: str = Field(default="Corporate & Government Advisory", description="Content Style")
    custom_instructions: Optional[str] = None
    requested_formats: List[str] = Field(
        default=["executive_summary", "linkedin", "advisory", "presentation", "infographic"],
        description="List of formats to transform"
    )

class TransformationCreate(TransformationConfig):
    project_id: Optional[str] = None
    canonical_id: str

class TransformationResponse(TransformationConfig):
    id: str
    project_id: str
    canonical_id: str
    status: str
    created_at: datetime

    class Config:
        from_attributes = True
