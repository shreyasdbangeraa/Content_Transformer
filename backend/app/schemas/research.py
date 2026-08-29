from pydantic import BaseModel, Field, ConfigDict
from typing import List, Dict, Any, Optional
from datetime import datetime

class SearchQueryItem(BaseModel):
    query: str
    target_tier: int = 1
    intent: str
    rationale: str

class ResearchQuestionItem(BaseModel):
    question: str
    priority: str = "HIGH" # CRITICAL, HIGH, MEDIUM, LOW
    claims_to_verify: List[str] = []

class FreshnessPolicy(BaseModel):
    policy: str = "CURRENT_REQUIRED" # CURRENT_REQUIRED, RECENT_PREFERRED, HISTORICAL_ACCEPTABLE, NO_EXTERNAL_FRESHNESS_REQUIREMENT
    is_temporal_request: bool = False
    freshness_threshold: str = "Strictly Current (< 48 hours for breaking events / <= 30 days for standards)"
    anti_stale_model_notice: str = "Live external search mandatory. Outdated static LLM training cutoff is prohibited from being labeled as 'latest'."
    temporal_triggers_found: List[str] = []
    max_information_age_hours: int = 48

class ClaimVerificationItem(BaseModel):
    claim: str
    priority: str = "HIGH"
    provenance: str = "PRIMARY_DOCUMENT_FACT"
    research_need: str = "RESEARCH_REQUIRED"
    reason: str

class ResearchPlanResponse(BaseModel):
    research_mode: str = "SOURCE_AND_VERIFY"
    status: str = "PLANNED"
    detected_domain: str = "General Enterprise & Multidisciplinary Document"
    detected_domain_key: str = "GENERAL"
    detected_purpose: str = "Synthesize verified operational facts, strategic insights, and structured directives from the uploaded document."
    key_topics: List[str] = []
    what_needs_research: str
    claims_requiring_verification: List[Dict[str, Any]] = []
    questions_to_answer: List[ResearchQuestionItem] = []
    search_queries: List[SearchQueryItem] = []
    preferred_sources: List[Dict[str, Any]] = []
    freshness_policy: FreshnessPolicy

class ResearchSourceResponse(BaseModel):
    id: str
    research_job_id: str
    url: Optional[str] = None
    title: str
    source_tier: int # 1..8
    source_type: str
    publisher: Optional[str] = None
    publish_date: Optional[str] = None
    reliability_score: float
    domain: Optional[str] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class ResearchEvidenceResponse(BaseModel):
    id: str
    research_job_id: str
    claim_text: str
    evidence_snippet: str
    source_title: Optional[str] = None
    source_url: Optional[str] = None
    source_tier: int = 1
    confidence: float = 0.98
    limitation_notes: Optional[str] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class ConflictRecordResponse(BaseModel):
    id: str
    research_job_id: str
    claim_a: str
    claim_b: str
    source_a_title: str
    source_b_title: str
    discrepancy_description: str
    possible_explanation: Optional[str] = None
    resolution_status: str = "HUMAN_REVIEW_REQUIRED"
    human_flag: bool = True
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class ResearchJobResponse(BaseModel):
    id: str
    project_id: str
    research_mode: str
    status: str
    research_questions: Any = None # Full Universal Section 9 plan dictionary
    search_queries: List[Dict[str, Any]] = []
    research_summary: Optional[str] = None
    sources: List[ResearchSourceResponse] = []
    evidence: List[ResearchEvidenceResponse] = []
    conflicts: List[ConflictRecordResponse] = []
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
