from pydantic import BaseModel, Field, ConfigDict
from typing import List, Dict, Any, Optional
from datetime import datetime

class BrandProfileBase(BaseModel):
    organization_name: str = Field(..., json_schema_extra={"example": "NovaTech Systems"})
    tone: str = Field(default="Authoritative & Reassuring", json_schema_extra={"example": "Authoritative & Reassuring"})
    terminology_rules: Dict[str, str] = Field(default_factory=dict, json_schema_extra={"example": {"ransomware": "unauthorized encryption incident"}})
    writing_style: str = Field(default="Corporate & Government Advisory", json_schema_extra={"example": "Corporate & Government Advisory"})
    target_audience_default: str = Field(default="Executive Board & Regulators", json_schema_extra={"example": "Executive Board & Regulators"})
    forbidden_terms: List[str] = Field(default_factory=list, json_schema_extra={"example": ["hacked", "panic", "disaster"]})
    communication_rules: List[str] = Field(default_factory=list, json_schema_extra={"example": ["Always cite verified timestamp", "Include IoC table in advisories"]})

class BrandProfileCreate(BrandProfileBase):
    pass

class BrandProfileUpdate(BaseModel):
    organization_name: Optional[str] = None
    tone: Optional[str] = None
    terminology_rules: Optional[Dict[str, str]] = None
    writing_style: Optional[str] = None
    target_audience_default: Optional[str] = None
    forbidden_terms: Optional[List[str]] = None
    communication_rules: Optional[List[str]] = None

class BrandProfileResponse(BrandProfileBase):
    id: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
