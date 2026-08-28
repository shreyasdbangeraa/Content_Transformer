from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional, Dict, Any
from datetime import datetime

class TransformationConfig(BaseModel):
    target_audience: str = Field(default="Executive Board & Technical Engineers", description="Target Audience")
    tone: str = Field(default="Professional & Authoritative", description="Communication Tone")
    language: str = Field(default="English", description="Target Language")
    detail_level: str = Field(default="Detailed & Comprehensive", description="Detail Level: Short, Medium, Detailed")
    communication_objective: str = Field(default="Inform & Remediate (Security Event)", description="Primary Objective")
    content_style: str = Field(default="Corporate & Government Advisory", description="Content Style")
    research_mode: str = Field(default="SOURCE_AND_VERIFY", description="SOURCE_ONLY, SOURCE_AND_VERIFY, DEEP_RESEARCH")
    brand_profile_id: Optional[str] = None
    custom_instructions: Optional[str] = None
    requested_formats: List[str] = Field(
        default=["executive_summary", "linkedin", "twitter", "advisory", "presentation", "infographic", "video_package"],
        description="List of formats to transform (all 7 supported)"
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

    model_config = ConfigDict(from_attributes=True)
