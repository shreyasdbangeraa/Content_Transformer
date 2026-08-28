export interface SourceCitation {
  file: string
  page?: number
  section?: string
  paragraph?: number
}

export interface CanonicalFact {
  fact_id: string
  text: string
  source: SourceCitation
  confidence: number
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
  type: 'EMAIL' | 'PHONE' | 'INTERNAL_IP' | 'CREDENTIAL' | 'PII'
  value: string
  masked_value: string
  recommendation: string
}

export interface SensitivityReport {
  level: 'low' | 'medium' | 'high' | 'critical'
  detected_count: number
  items: SensitiveDataItem[]
  public_safety_advisory: string
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
  locations: string[]
  statistics: StatisticMetric[]
  risks: RiskItem[]
  recommendations: RecommendationItem[]
  key_messages: string[]
  claims: Array<{ claim_id: string; text: string; source_page?: number; verified: boolean }>
  sensitivity: SensitivityReport
  source_references: Array<{ title: string; page?: number; excerpt: string }>
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
  format_type: 'executive_summary' | 'linkedin' | 'twitter' | 'advisory' | 'presentation' | 'infographic' | 'video_package' | string
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
  target_audience: string
  tone: string
  language: string
  detail_level: string
  communication_objective: string
  content_style: string
  custom_instructions?: string
  requested_formats: string[]
  status: string
  created_at: string
}

export interface Project {
  id: string
  title: string
  description?: string
  domain: string
  status: string
  created_at: string
  updated_at: string
  sources_count?: number
  outputs_count?: number
  approved_count?: number
  published_count?: number
  sources?: Source[]
  canonical_analysis?: CanonicalAnalysis
  transformations?: Transformation[]
  outputs?: Output[]
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
