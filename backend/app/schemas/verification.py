from pydantic import BaseModel, Field, ConfigDict
from typing import List, Dict, Any, Optional
from datetime import datetime

class ClaimVerification(BaseModel):
    claim_id: str
    text: str
    status: str = Field(..., description="VERIFIED, PARTIALLY_SUPPORTED, UNSUPPORTED, CONTRADICTED, OPINION_CREATIVE")
    source_file: Optional[str] = "incident_report.pdf"
    source_page: Optional[int] = 1
    source_section: Optional[str] = "General"
    source_match: Optional[str] = None
    confidence: float = 0.95
    reasoning: Optional[str] = None
    provenance: Optional[str] = "PRIMARY_SOURCE_FACT"

class FactCheckResponse(BaseModel):
    id: str
    output_id: str
    total_claims: int
    verified_claims: int
    partially_supported: int
    unsupported_claims: int
    contradicted_claims: int
    opinion_creative: int
    grounding_score: float
    claims: List[ClaimVerification] = []
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class QualityScoreResponse(BaseModel):
    id: str
    output_id: str
    overall_score: float
    source_accuracy: float
    completeness: float
    audience_fit: float
    readability: float
    tone_consistency: float
    structure_score: float
    research_confidence: float = 96.0
    safety_score: float = 100.0
    details: Dict[str, Any] = {}
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
