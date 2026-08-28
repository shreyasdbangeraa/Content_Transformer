from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, Dict, Any
from datetime import datetime

class PublishRequest(BaseModel):
    platform: str = Field(default="n8n", description="Target platform: n8n, linkedin, twitter, instagram, webhook")
    webhook_url: Optional[str] = None
    scheduled_at: Optional[datetime] = None
    custom_metadata: Optional[Dict[str, Any]] = None

class PublishingJobResponse(BaseModel):
    id: str
    output_id: str
    platform: str
    webhook_url: Optional[str]
    payload: Dict[str, Any]
    scheduled_at: Optional[datetime]
    published_at: Optional[datetime]
    status: str # SCHEDULED, PUBLISHED, FAILED
    response_data: Dict[str, Any]
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class N8nWebhookPayload(BaseModel):
    event: str = "content.approved_for_publishing"
    project_id: str
    output_id: str
    format_type: str
    platform: str
    title: Optional[str]
    content: str
    structured_data: Dict[str, Any]
    scheduled_at: Optional[str]
    approved_by: str = "Operator"
    quality_score: float
    grounding_score: float
    timestamp: str
