export interface SourceCitation {
  file: string
  page?: number
  section?: string
  paragraph?: number
  character_range?: number[]
}

export type ProvenanceTag =
  | 'PRIMARY_SOURCE_FACT'
  | 'VERIFIED_EXTERNAL_FACT'
  | 'USER_CONTEXT'
  | 'INFERENCE'
  | 'RECOMMENDATION'
  | 'UNSUPPORTED_CLAIM'
  | 'CONFLICTING_CLAIM'

export interface CanonicalFact {
  fact_id: string
  text: string
  source: SourceCitation
  confidence: number
  provenance: ProvenanceTag
  verified: boolean
}

export interface Entity {
  name: string
  type: string
  context?: string
}

export interface StatisticMetric {
  metric: string
  value: string
  context?: string
  source_citation?: string
}

export interface RiskItem {
  risk: string
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  impact?: string
}

export interface RecommendationItem {
  recommendation: string
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  details?: string
}

export interface SensitiveDataItem {
  type: 'EMAIL' | 'PHONE' | 'INTERNAL_IP' | 'INTERNAL_HOSTNAME' | 'CREDENTIAL' | 'AUTH_TOKEN' | 'CLOUD_KEY' | 'PII' | string
  value: string
  masked_value: string
  recommendation: string
  severity?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' | string
}

export interface SensitivityReport {
  level: 'low' | 'medium' | 'high' | 'critical'
  detected_count: number
  items: SensitiveDataItem[]
  public_safety_advisory: string
}

export interface ConflictItem {
  conflict_id?: string
  claim_a: string
  claim_b: string
  source_a_title: string
  source_b_title: string
  discrepancy_description: string
  possible_explanation?: string
  human_flag: boolean
}

export interface UncertaintyItem {
  topic: string
  status: 'UNDER_INVESTIGATION' | 'UNCONFIRMED' | 'PARTIAL_DATA' | string
  details: string
}

export interface ResearchEvidenceItem {
  claim_text: string
  evidence_snippet: string
  source_title: string
  source_url?: string
  source_tier: number
  confidence: number
}

export interface TimelineEvent {
  timestamp: string
  event: string
  severity?: string
}

export interface CanonicalAnalysis {
  id: string
  project_id: string
  source_id: string
  title?: string
  document_type: string
  detected_language: string
  topic: string
  executive_summary: string
  key_facts: CanonicalFact[]
  entities: Entity[]
  dates: Array<{ date: string; event: string }>
  events?: TimelineEvent[]
  locations: string[]
  statistics: StatisticMetric[]
  risks: RiskItem[]
  recommendations: RecommendationItem[]
  key_messages: string[]
  research_findings?: ResearchEvidenceItem[]
  uncertainties?: UncertaintyItem[]
  conflicts?: ConflictItem[]
  claims: Array<{ claim_id: string; text: string; source_page?: number; verified: boolean; provenance?: string }>
  sensitivity: SensitivityReport
  source_references: Array<{ title: string; page?: number; excerpt: string }>
  rag_context?: any[]
  rag_sources?: string[]
  provenance_map?: Record<string, any>
  confidence_score?: number
  created_at: string
}

export interface Source {
  id: string
  project_id: string
  filename: string
  file_type: string
  raw_text: string
  char_count: number
  page_count: number
  meta_info: Record<string, any>
  processing_status: string
  created_at: string
}

export interface ResearchSource {
  id: string
  research_job_id: string
  url?: string
  title: string
  source_tier: number
  source_type: string
  publisher?: string
  publish_date?: string
  reliability_score: number
  domain?: string
  created_at: string
}

export interface ResearchEvidence {
  id: string
  research_job_id: string
  claim_text: string
  evidence_snippet: string
  source_title?: string
  source_url?: string
  source_tier: number
  confidence: number
  limitation_notes?: string
  created_at: string
}

export interface ConflictRecord {
  id: string
  research_job_id: string
  claim_a: string
  claim_b: string
  source_a_title: string
  source_b_title: string
  discrepancy_description: string
  possible_explanation?: string
  resolution_status: string
  human_flag: boolean
  created_at: string
}

export interface ResearchJob {
  id: string
  project_id: string
  research_mode: 'SOURCE_ONLY' | 'SOURCE_AND_VERIFY' | 'DEEP_RESEARCH' | string
  status: string
  research_questions?: ResearchPlan | any
  search_queries: Array<{ query: string; target_tier: number; intent?: string }>
  research_summary?: string
  sources?: ResearchSource[]
  evidence?: ResearchEvidence[]
  conflicts?: ConflictRecord[]
  created_at: string
}

export interface BrandProfile {
  id: string
  organization_name: string
  tone: string
  terminology_rules: Record<string, string>
  writing_style: string
  target_audience_default: string
  forbidden_terms: string[]
  communication_rules: string[]
  created_at: string
}

export interface ClaimVerification {
  claim_id: string
  text: string
  status: 'VERIFIED' | 'PARTIALLY_SUPPORTED' | 'UNSUPPORTED' | 'CONTRADICTED' | 'OPINION_CREATIVE'
  source_file?: string
  source_page?: number
  source_section?: string
  source_match?: string
  confidence: number
  reasoning?: string
  provenance?: ProvenanceTag | string
}

export interface FactCheck {
  id: string
  output_id: string
  total_claims: number
  verified_claims: number
  partially_supported: number
  unsupported_claims: number
  contradicted_claims: number
  opinion_creative: number
  grounding_score: number
  claims: ClaimVerification[]
  created_at: string
}

export interface QualityScore {
  id: string
  output_id: string
  overall_score: number
  source_accuracy: number
  completeness: number
  audience_fit: number
  readability: number
  tone_consistency: number
  structure_score: number
  research_confidence: number
  safety_score: number
  details: Record<string, any>
  created_at: string
}

export interface OutputVersion {
  id: string
  output_id: string
  version_number: number
  content: string
  structured_data: Record<string, any>
  change_reason: string
  created_by: string
  created_at: string
}

export interface Output {
  id: string
  transformation_id: string
  format_type:
    | 'executive_summary'
    | 'linkedin'
    | 'twitter'
    | 'advisory'
    | 'presentation'
    | 'infographic'
    | 'video_package'
    | string
  title?: string
  raw_content: string
  structured_data: Record<string, any>
  version: number
  status: 'DRAFT' | 'NEEDS_REVIEW' | 'APPROVED' | 'REJECTED' | 'PUBLISHED'
  approval_notes?: string
  approved_at?: string
  created_at: string
  updated_at: string
  fact_check?: FactCheck
  quality_score?: QualityScore
  versions?: OutputVersion[]
}

export interface Transformation {
  id: string
  project_id: string
  canonical_id: string
  brand_profile_id?: string
  target_audience: string
  tone: string
  language: string
  detail_level: string
  communication_objective: string
  content_style: string
  research_mode: string
  custom_instructions?: string
  requested_formats: string[]
  status: string
  created_at: string
}

export interface Project {
  id: string
  title: string
  description?: string
  organization_name?: string
  domain: string
  research_mode?: string
  brand_profile_id?: string
  status: string
  created_at: string
  updated_at: string
  sources_count?: number
  outputs_count?: number
  approved_count?: number
  published_count?: number
  conflicts_count?: number
  sources?: Source[]
  canonical_analysis?: CanonicalAnalysis
  transformations?: Transformation[]
  research_jobs?: ResearchJob[]
  conflicts?: ConflictRecord[]
  outputs?: Output[]
}

export interface FreshnessPolicy {
  policy: 'CURRENT_REQUIRED' | 'RECENT_PREFERRED' | 'HISTORICAL_ACCEPTABLE' | 'NO_EXTERNAL_FRESHNESS_REQUIREMENT' | string
  is_temporal_request: boolean
  freshness_threshold: string
  anti_stale_model_notice: string
  temporal_triggers_found: string[]
  max_information_age_hours: number
}

export interface ClaimVerificationItem {
  claim: string
  priority: 'HIGH' | 'MEDIUM' | 'LOW' | string
  provenance: 'PRIMARY_DOCUMENT_FACT' | 'EXTERNAL_VERIFIED_FACT' | 'INFERENCE' | string
  research_need: 'RESEARCH_REQUIRED' | 'RESEARCH_RECOMMENDED' | 'NO_RESEARCH_REQUIRED' | string
  reason: string
}

export interface ResearchPlan {
  research_mode: string
  status: string
  detected_domain: string
  detected_domain_key: string
  detected_purpose: string
  key_topics: string[]
  what_needs_research: string
  claims_requiring_verification: ClaimVerificationItem[]
  questions_to_answer: Array<{ question: string; priority: string; claims_to_verify: string[] }>
  search_queries: Array<{ query: string; target_tier: number; intent: string; rationale: string }>
  preferred_sources: Array<{ tier: number; tier_name: string; domains: string[]; priority: string }>
  freshness_policy: FreshnessPolicy
}



export interface DashboardStats {
  total_projects: number
  total_sources: number
  total_outputs: number
  total_approved: number
  total_published: number
  average_quality_score: number
  publishing_jobs_count: number
}

export interface PublishingJob {
  id: string
  output_id: string
  platform: string
  webhook_url?: string
  payload: Record<string, any>
  scheduled_at?: string
  published_at?: string
  status: string
  response_data: Record<string, any>
  created_at: string
}

