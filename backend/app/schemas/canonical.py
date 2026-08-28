from pydantic import BaseModel, Field, ConfigDict
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
    confidence: float = 0.98
    provenance: str = "PRIMARY_SOURCE_FACT" # PRIMARY_SOURCE_FACT, VERIFIED_EXTERNAL_FACT, INFERENCE, USER_CONTEXT, RECOMMENDATION
    verified: bool = True

class Entity(BaseModel):
    name: str
    type: str # ORGANIZATION, PERSON, LOCATION, SYSTEM, MALWARE_GROUP, CVE, DATE
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

class ConflictItem(BaseModel):
    conflict_id: Optional[str] = None
    claim_a: str
    claim_b: str
    source_a_title: str
    source_b_title: str
    discrepancy_description: str
    possible_explanation: Optional[str] = None
    human_flag: bool = True

class UncertaintyItem(BaseModel):
    topic: str
    status: str = "UNDER_INVESTIGATION" # UNDER_INVESTIGATION, UNCONFIRMED, PARTIAL_DATA
    details: str

class ResearchEvidenceItem(BaseModel):
    claim_text: str
    evidence_snippet: str
    source_title: str
    source_url: Optional[str] = None
    source_tier: int = 1
    confidence: float = 0.95

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
    events: List[Dict[str, Any]] = []
    locations: List[str] = []
    statistics: List[StatisticMetric] = []
    risks: List[RiskItem] = []
    recommendations: List[RecommendationItem] = []
    key_messages: List[str] = []
    research_findings: List[Dict[str, Any]] = []
    uncertainties: List[Dict[str, Any]] = []
    conflicts: List[Dict[str, Any]] = []
    claims: List[Dict[str, Any]] = []
    sensitivity: SensitivityReport
    source_references: List[Dict[str, Any]] = []
    provenance_map: Dict[str, Any] = {}
    confidence_score: float = 0.98
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
