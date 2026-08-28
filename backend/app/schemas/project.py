from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List, Dict, Any
from datetime import datetime

class ProjectBase(BaseModel):
    title: str = Field(..., description="Project title")
    description: Optional[str] = None
    organization_name: Optional[str] = "NovaTech Systems"
    domain: Optional[str] = "Cybersecurity"
    research_mode: Optional[str] = "SOURCE_AND_VERIFY" # SOURCE_ONLY, SOURCE_AND_VERIFY, DEEP_RESEARCH
    brand_profile_id: Optional[str] = None

class ProjectCreate(ProjectBase):
    pass

class ProjectUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    organization_name: Optional[str] = None
    domain: Optional[str] = None
    research_mode: Optional[str] = None
    brand_profile_id: Optional[str] = None
    status: Optional[str] = None

class ProjectResponse(ProjectBase):
    id: str
    status: str
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
