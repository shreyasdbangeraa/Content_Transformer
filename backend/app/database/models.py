import uuid
from datetime import datetime
from sqlalchemy import Column, String, Text, Integer, Float, Boolean, DateTime, ForeignKey, JSON
from sqlalchemy.orm import declarative_base, relationship

Base = declarative_base()

def generate_uuid():
    return str(uuid.uuid4())

class Project(Base):
    __tablename__ = "projects"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    organization_name = Column(String(255), default="NovaTech Systems")
    domain = Column(String(100), default="Cybersecurity") # Cybersecurity, Government, Enterprise, Leadership, Public Sector
    research_mode = Column(String(50), default="SOURCE_AND_VERIFY") # SOURCE_ONLY, SOURCE_AND_VERIFY, DEEP_RESEARCH
    brand_profile_id = Column(String(36), nullable=True)
    status = Column(String(50), default="ACTIVE") # ACTIVE, ARCHIVED, COMPLETED
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    sources = relationship("Source", back_populates="project", cascade="all, delete-orphan")
    canonical_analyses = relationship("CanonicalAnalysis", back_populates="project", cascade="all, delete-orphan")
    transformations = relationship("Transformation", back_populates="project", cascade="all, delete-orphan")
    research_jobs = relationship("ResearchJob", back_populates="project", cascade="all, delete-orphan")
    audit_logs = relationship("AuditLog", back_populates="project", cascade="all, delete-orphan")
    content_version_records = relationship("ContentVersionRecord", back_populates="project", cascade="all, delete-orphan")

class Source(Base):
    __tablename__ = "sources"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    project_id = Column(String(36), ForeignKey("projects.id", ondelete="CASCADE"), nullable=False)
    filename = Column(String(255), nullable=False)
    file_type = Column(String(50), nullable=False) # pdf, docx, txt, url, text_paste, image, video
    file_path = Column(String(500), nullable=True)
    raw_text = Column(Text, nullable=False)
    char_count = Column(Integer, default=0)
    page_count = Column(Integer, default=1)
    meta_info = Column(JSON, default=dict)
    processing_status = Column(String(50), default="PROCESSED") # UPLOADING, PROCESSING, PROCESSED, ERROR
    created_at = Column(DateTime, default=datetime.utcnow)

    project = relationship("Project", back_populates="sources")
    canonical_analyses = relationship("CanonicalAnalysis", back_populates="source", cascade="all, delete-orphan")

class BrandProfile(Base):
    __tablename__ = "brand_profiles"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    organization_name = Column(String(255), nullable=False)
    tone = Column(String(100), default="Authoritative & Reassuring")
    terminology_rules = Column(JSON, default=dict) # e.g. {"ransomware": "unauthorized encryption incident"}
    writing_style = Column(String(100), default="Corporate & Government Advisory")
    target_audience_default = Column(String(100), default="Executive Board & Regulators")
    forbidden_terms = Column(JSON, default=list) # Blacklisted words e.g. ["hacked", "panic"]
    communication_rules = Column(JSON, default=list) # ["Always cite verified timestamp", "Include IoC table in advisories"]
    created_at = Column(DateTime, default=datetime.utcnow)

class ResearchJob(Base):
    __tablename__ = "research_jobs"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    project_id = Column(String(36), ForeignKey("projects.id", ondelete="CASCADE"), nullable=False)
    research_mode = Column(String(50), default="SOURCE_AND_VERIFY") # SOURCE_ONLY, SOURCE_AND_VERIFY, DEEP_RESEARCH
    status = Column(String(50), default="COMPLETED") # QUEUED, RESEARCHING, COMPLETED, FAILED
    research_questions = Column(JSON, default=list) # List of research questions
    search_queries = Column(JSON, default=list) # List of executed search queries
    research_summary = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    project = relationship("Project", back_populates="research_jobs")
    sources = relationship("ResearchSource", back_populates="research_job", cascade="all, delete-orphan")
    evidence = relationship("ResearchEvidence", back_populates="research_job", cascade="all, delete-orphan")
    conflicts = relationship("ConflictRecord", back_populates="research_job", cascade="all, delete-orphan")

class ResearchSource(Base):
    __tablename__ = "research_sources"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    research_job_id = Column(String(36), ForeignKey("research_jobs.id", ondelete="CASCADE"), nullable=False)
    url = Column(String(500), nullable=True)
    title = Column(String(255), nullable=False)
    source_tier = Column(Integer, default=1) # 1: Gov, 2: Org, 3: Primary Research, 4: Standards, 5: Institutions, 6: Journalism, 7: Secondary, 8: Web
    source_type = Column(String(100), default="Official Organization")
    publisher = Column(String(255), nullable=True)
    publish_date = Column(String(50), nullable=True)
    reliability_score = Column(Float, default=0.95)
    domain = Column(String(100), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    research_job = relationship("ResearchJob", back_populates="sources")

class ResearchEvidence(Base):
    __tablename__ = "research_evidence"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    research_job_id = Column(String(36), ForeignKey("research_jobs.id", ondelete="CASCADE"), nullable=False)
    claim_text = Column(Text, nullable=False)
    evidence_snippet = Column(Text, nullable=False)
    source_id = Column(String(36), nullable=True)
    source_title = Column(String(255), nullable=True)
    source_url = Column(String(500), nullable=True)
    source_tier = Column(Integer, default=1)
    confidence = Column(Float, default=0.98)
    limitation_notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    research_job = relationship("ResearchJob", back_populates="evidence")

class ConflictRecord(Base):
    __tablename__ = "conflict_records"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    research_job_id = Column(String(36), ForeignKey("research_jobs.id", ondelete="CASCADE"), nullable=False)
    claim_a = Column(Text, nullable=False) # e.g. "500 systems affected"
    claim_b = Column(Text, nullable=False) # e.g. "530 systems affected"
    source_a_title = Column(String(255), default="Primary Incident Report (NovaTech IR-2026)")
    source_b_title = Column(String(255), default="External Security Blog Analysis")
    discrepancy_description = Column(Text, nullable=False)
    possible_explanation = Column(Text, nullable=True)
    resolution_status = Column(String(50), default="HUMAN_REVIEW_REQUIRED") # HUMAN_REVIEW_REQUIRED, RESOLVED, DISMISSED
    human_flag = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    research_job = relationship("ResearchJob", back_populates="conflicts")

class CanonicalAnalysis(Base):
    __tablename__ = "canonical_analyses"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    project_id = Column(String(36), ForeignKey("projects.id", ondelete="CASCADE"), nullable=False)
    source_id = Column(String(36), ForeignKey("sources.id", ondelete="CASCADE"), nullable=False)
    
    title = Column(String(255), nullable=True)
    document_type = Column(String(100), default="Incident Report")
    detected_language = Column(String(50), default="English")
    topic = Column(String(255), nullable=False)
    executive_summary = Column(Text, nullable=False)
    
    # Structured Canonical Knowledge with Provenance
    key_facts = Column(JSON, default=list) # [{fact_id, text, source, confidence, provenance, verified}]
    entities = Column(JSON, default=list) # [{name, type, context}]
    dates = Column(JSON, default=list) # [{date, event}]
    events = Column(JSON, default=list) # [{timestamp, event, severity}]
    locations = Column(JSON, default=list)
    statistics = Column(JSON, default=list) # [{metric, value, context, source_citation}]
    risks = Column(JSON, default=list) # [{risk, severity, impact}]
    recommendations = Column(JSON, default=list) # [{recommendation, priority, details}]
    key_messages = Column(JSON, default=list)
    research_findings = Column(JSON, default=list) # External evidence findings
    uncertainties = Column(JSON, default=list) # Items under investigation or with partial data
    conflicts = Column(JSON, default=list) # Detected discrepancies across sources
    claims = Column(JSON, default=list) # [{claim_id, text, source_page, verified, provenance}]
    
    # Sensitive Data Report
    sensitivity = Column(JSON, default=dict) # {level: "low"|"medium"|"high", items: [{type, value, masked_value, recommendation}]}
    source_references = Column(JSON, default=list)
    provenance_map = Column(JSON, default=dict)
    rag_context = Column(JSON, default=list) # [{chunk_id, doc_title, doc_type, text, similarity}]
    rag_sources = Column(JSON, default=list) # List of referenced knowledge documents
    confidence_score = Column(Float, default=0.98)
    
    created_at = Column(DateTime, default=datetime.utcnow)

    project = relationship("Project", back_populates="canonical_analyses")
    source = relationship("Source", back_populates="canonical_analyses")
    transformations = relationship("Transformation", back_populates="canonical_analysis", cascade="all, delete-orphan")

class Transformation(Base):
    __tablename__ = "transformations"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    project_id = Column(String(36), ForeignKey("projects.id", ondelete="CASCADE"), nullable=False)
    canonical_id = Column(String(36), ForeignKey("canonical_analyses.id", ondelete="CASCADE"), nullable=False)
    brand_profile_id = Column(String(36), nullable=True)
    
    # Configuration Controls
    target_audience = Column(String(100), default="General Public")
    tone = Column(String(100), default="Professional")
    language = Column(String(50), default="English")
    detail_level = Column(String(50), default="Medium")
    communication_objective = Column(String(100), default="Inform")
    content_style = Column(String(100), default="Corporate")
    research_mode = Column(String(50), default="SOURCE_AND_VERIFY")
    custom_instructions = Column(Text, nullable=True)
    requested_formats = Column(JSON, default=list) # ["executive_summary", "linkedin", "twitter", "advisory", "presentation", "infographic", "video_package"]
    
    status = Column(String(50), default="READY") # READY, GENERATING, COMPLETED, FAILED
    created_at = Column(DateTime, default=datetime.utcnow)

    project = relationship("Project", back_populates="transformations")
    canonical_analysis = relationship("CanonicalAnalysis", back_populates="transformations")
    outputs = relationship("Output", back_populates="transformation", cascade="all, delete-orphan")

class Output(Base):
    __tablename__ = "outputs"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    transformation_id = Column(String(36), ForeignKey("transformations.id", ondelete="CASCADE"), nullable=False)
    format_type = Column(String(100), nullable=False) # executive_summary, linkedin, twitter, advisory, presentation, infographic, video_package
    title = Column(String(255), nullable=True)
    
    raw_content = Column(Text, nullable=False)
    structured_data = Column(JSON, default=dict) # Schema-validated JSON (hook/body/CTA, slide deck, video scenes, etc.)
    
    version = Column(Integer, default=1)
    status = Column(String(50), default="NEEDS_REVIEW") # DRAFT, NEEDS_REVIEW, APPROVED, REJECTED, PUBLISHED
    approval_notes = Column(Text, nullable=True)
    approved_at = Column(DateTime, nullable=True)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    transformation = relationship("Transformation", back_populates="outputs")
    versions = relationship("OutputVersion", back_populates="output", cascade="all, delete-orphan")
    fact_check = relationship("FactCheck", back_populates="output", uselist=False, cascade="all, delete-orphan")
    quality_score = relationship("QualityScore", back_populates="output", uselist=False, cascade="all, delete-orphan")
    publishing_jobs = relationship("PublishingJob", back_populates="output", cascade="all, delete-orphan")

class OutputVersion(Base):
    __tablename__ = "output_versions"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    output_id = Column(String(36), ForeignKey("outputs.id", ondelete="CASCADE"), nullable=False)
    version_number = Column(Integer, nullable=False)
    content = Column(Text, nullable=False)
    structured_data = Column(JSON, default=dict)
    change_reason = Column(Text, default="Initial generation")
    created_by = Column(String(100), default="AI") # "AI", "User", "AI_Refinement"
    created_at = Column(DateTime, default=datetime.utcnow)

    output = relationship("Output", back_populates="versions")

class FactCheck(Base):
    __tablename__ = "fact_checks"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    output_id = Column(String(36), ForeignKey("outputs.id", ondelete="CASCADE"), nullable=False)
    
    total_claims = Column(Integer, default=0)
    verified_claims = Column(Integer, default=0)
    partially_supported = Column(Integer, default=0)
    unsupported_claims = Column(Integer, default=0)
    contradicted_claims = Column(Integer, default=0)
    opinion_creative = Column(Integer, default=0)
    grounding_score = Column(Float, default=100.0)
    
    claims = Column(JSON, default=list) # [{claim_id, text, status, source_file, source_page, source_section, source_match, confidence, reasoning, provenance}]
    created_at = Column(DateTime, default=datetime.utcnow)

    output = relationship("Output", back_populates="fact_check")

class QualityScore(Base):
    __tablename__ = "quality_scores"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    output_id = Column(String(36), ForeignKey("outputs.id", ondelete="CASCADE"), nullable=False)
    
    overall_score = Column(Float, default=92.0) # 0 - 100
    source_accuracy = Column(Float, default=95.0)
    completeness = Column(Float, default=90.0)
    audience_fit = Column(Float, default=92.0)
    readability = Column(Float, default=88.0)
    tone_consistency = Column(Float, default=94.0)
    structure_score = Column(Float, default=90.0)
    research_confidence = Column(Float, default=96.0)
    safety_score = Column(Float, default=100.0)
    details = Column(JSON, default=dict)
    
    created_at = Column(DateTime, default=datetime.utcnow)

    output = relationship("Output", back_populates="quality_score")

class PublishingJob(Base):
    __tablename__ = "publishing_jobs"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    output_id = Column(String(36), ForeignKey("outputs.id", ondelete="CASCADE"), nullable=False)
    platform = Column(String(50), nullable=False) # linkedin, twitter, instagram, webhook, n8n
    webhook_url = Column(String(500), nullable=True)
    payload = Column(JSON, default=dict)
    scheduled_at = Column(DateTime, nullable=True)
    published_at = Column(DateTime, nullable=True)
    status = Column(String(50), default="SCHEDULED") # SCHEDULED, PUBLISHED, FAILED, CANCELLED
    response_data = Column(JSON, default=dict)
    created_at = Column(DateTime, default=datetime.utcnow)

    output = relationship("Output", back_populates="publishing_jobs")

class KnowledgeDocument(Base):
    __tablename__ = "knowledge_documents"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    title = Column(String(255), nullable=False)
    doc_type = Column(String(100), default="Policy") # Policy, Brand Guidelines, Terminology, Template, Research Paper, Internal Document
    content = Column(Text, nullable=False)
    file_name = Column(String(255), nullable=True)
    tags = Column(JSON, default=list)
    char_count = Column(Integer, default=0)
    chunk_count = Column(Integer, default=0)
    embedding_status = Column(String(50), default="INDEXED") # INDEXED, PENDING, FAILED
    created_at = Column(DateTime, default=datetime.utcnow)

    chunks = relationship("KnowledgeChunk", back_populates="document", cascade="all, delete-orphan")

class KnowledgeChunk(Base):
    __tablename__ = "knowledge_chunks"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    document_id = Column(String(36), ForeignKey("knowledge_documents.id", ondelete="CASCADE"), nullable=False)
    chunk_index = Column(Integer, nullable=False, default=0)
    content = Column(Text, nullable=False)
    embedding = Column(JSON, default=list) # 384-dimensional normalized float vector
    char_count = Column(Integer, default=0)
    word_count = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)

    document = relationship("KnowledgeDocument", back_populates="chunks")

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    project_id = Column(String(36), ForeignKey("projects.id", ondelete="CASCADE"), nullable=True)
    action = Column(String(100), nullable=False) # SOURCE_UPLOADED, SOURCE_PROCESSED, RESEARCH_STARTED, RESEARCH_COMPLETED, CANONICAL_CREATED, OUTPUT_GENERATED, CLAIMS_VERIFIED, QUALITY_COMPLETED, OUTPUT_EDITED, OUTPUT_APPROVED, OUTPUT_REJECTED, OUTPUT_EXPORTED, PUBLISH_STARTED, PUBLISH_COMPLETED, PUBLISH_FAILED, BLOCKCHAIN_REGISTERED, BLOCKCHAIN_VERIFIED
    actor = Column(String(100), default="System")
    details = Column(JSON, default=dict)
    timestamp = Column(DateTime, default=datetime.utcnow)

    project = relationship("Project", back_populates="audit_logs")

class ContentVersionRecord(Base):
    __tablename__ = "content_version_records"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    content_id = Column(String(100), nullable=False, index=True) # Refers to Output.id or Source.id
    project_id = Column(String(36), ForeignKey("projects.id", ondelete="CASCADE"), nullable=True)
    
    version_number = Column(Integer, nullable=False, default=1)
    version_tag = Column(String(50), nullable=False, default="V1") # "V1", "V2", "V3"
    parent_version_id = Column(String(100), nullable=True) # Previous version ID or tag
    
    content_location = Column(String(255), default="database:outputs:raw_content")
    content_hash = Column(String(66), nullable=False, index=True) # 0x... or 64-char SHA256 hex
    previous_hash = Column(String(66), default="0x0000000000000000000000000000000000000000000000000000000000000000")
    hash_algorithm = Column(String(50), default="SHA-256")
    
    action_type = Column(String(100), nullable=False) # ORIGINAL_UPLOAD, AI_TRANSFORMATION, HUMAN_EDIT, AI_REFINEMENT, APPROVED, PUBLISHED
    created_by = Column(String(100), default="AI_Engine")
    
    # Blockchain Anchor Details
    blockchain_status = Column(String(50), default="CONFIRMED") # CONFIRMED, PENDING, FAILED
    blockchain_network = Column(String(100), default="Ethereum Sepolia Testnet")
    transaction_hash = Column(String(100), nullable=True) # 0x...
    block_number = Column(Integer, nullable=True)
    wallet_address = Column(String(100), nullable=True)
    contract_address = Column(String(100), nullable=True)
    gas_used = Column(Integer, default=42100)
    
    # Snapshot of metadata & verified status
    metadata_snapshot = Column(JSON, default=dict)
    
    created_at = Column(DateTime, default=datetime.utcnow)

    project = relationship("Project", back_populates="content_version_records")

