from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
from datetime import datetime

class SourceCitation(BaseModel):
    file: str = "source.pdf"
    page: Optional[int] = 1
    section: Optional[str] = "General"
    paragraph: Optional[int] = None
    character_range: Optional[List[int]] = None

class CanonicalFact(BaseModel):
    fact_id: str
    text: str
    source: SourceCitation
    confidence: float = 0.95
    verified: bool = True

class Entity(BaseModel):
    name: str
    type: str # ORGANIZATION, PERSON, LOCATION, SYSTEM, MALWARE, CVE, DATE
    context: Optional[str] = None

class StatisticMetric(BaseModel):
    metric: str
    value: str
    context: Optional[str] = None
    source_citation: Optional[str] = None

class RiskItem(BaseModel):
    risk: str
    severity: str # LOW, MEDIUM, HIGH, CRITICAL
    impact: Optional[str] = None

class RecommendationItem(BaseModel):
    recommendation: str
    priority: str # LOW, MEDIUM, HIGH, CRITICAL
    details: Optional[str] = None

class SensitiveDataItem(BaseModel):
    type: str # EMAIL, PHONE, INTERNAL_IP, HOSTNAME, CREDENTIAL, PII
    value: str
    masked_value: str
    recommendation: str = "Redact from public/social communications"

class SensitivityReport(BaseModel):
    level: str = "low" # low, medium, high, critical
    detected_count: int = 0
    items: List[SensitiveDataItem] = []
    public_safety_advisory: str = "Safe for public dissemination once sensitive identifiers are masked."

class CanonicalAnalysisResponse(BaseModel):
    id: str
    project_id: str
    source_id: str
    title: Optional[str] = None
    document_type: str = "Incident Report"
    detected_language: str = "English"
    topic: str
    executive_summary: str
    key_facts: List[CanonicalFact] = []
    entities: List[Entity] = []
    dates: List[Dict[str, Any]] = []
    locations: List[str] = []
    statistics: List[StatisticMetric] = []
    risks: List[RiskItem] = []
    recommendations: List[RecommendationItem] = []
    key_messages: List[str] = []
    claims: List[Dict[str, Any]] = []
    sensitivity: SensitivityReport
    source_references: List[Dict[str, Any]] = []
    created_at: datetime

    class Config:
        from_attributes = True
