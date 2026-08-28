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
    domain = Column(String(100), default="General") # Cybersecurity, Government, Enterprise, etc.
    status = Column(String(50), default="ACTIVE") # ACTIVE, ARCHIVED, COMPLETED
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    sources = relationship("Source", back_populates="project", cascade="all, delete-orphan")
    canonical_analyses = relationship("CanonicalAnalysis", back_populates="project", cascade="all, delete-orphan")
    transformations = relationship("Transformation", back_populates="project", cascade="all, delete-orphan")
    audit_logs = relationship("AuditLog", back_populates="project", cascade="all, delete-orphan")

class Source(Base):
    __tablename__ = "sources"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    project_id = Column(String(36), ForeignKey("projects.id", ondelete="CASCADE"), nullable=False)
    filename = Column(String(255), nullable=False)
    file_type = Column(String(50), nullable=False) # pdf, docx, txt, url, text_paste, image
    file_path = Column(String(500), nullable=True)
    raw_text = Column(Text, nullable=False)
    char_count = Column(Integer, default=0)
    page_count = Column(Integer, default=1)
    meta_info = Column(JSON, default=dict)
    processing_status = Column(String(50), default="PROCESSED") # UPLOADING, PROCESSING, PROCESSED, ERROR
    created_at = Column(DateTime, default=datetime.utcnow)

    project = relationship("Project", back_populates="sources")
    canonical_analyses = relationship("CanonicalAnalysis", back_populates="source", cascade="all, delete-orphan")

class CanonicalAnalysis(Base):
    __tablename__ = "canonical_analyses"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    project_id = Column(String(36), ForeignKey("projects.id", ondelete="CASCADE"), nullable=False)
    source_id = Column(String(36), ForeignKey("sources.id", ondelete="CASCADE"), nullable=False)
    
    title = Column(String(255), nullable=True)
    document_type = Column(String(100), default="Report")
    detected_language = Column(String(50), default="English")
    topic = Column(String(255), nullable=False)
    executive_summary = Column(Text, nullable=False)
    
    # Structured Canonical Knowledge
    key_facts = Column(JSON, default=list) # [{fact_id, text, source_page, source_section, confidence}]
    entities = Column(JSON, default=list) # [{entity, type, context}]
    dates = Column(JSON, default=list) # [{date, event}]
    locations = Column(JSON, default=list)
    statistics = Column(JSON, default=list) # [{metric, value, context}]
    risks = Column(JSON, default=list) # [{risk, severity, impact}]
    recommendations = Column(JSON, default=list) # [{recommendation, priority, details}]
    key_messages = Column(JSON, default=list)
    claims = Column(JSON, default=list) # [{claim_id, text, source_citation, verified}]
    
    # Sensitive Data Report
    sensitivity = Column(JSON, default=dict) # {level: "low"|"medium"|"high", items: [{type, value, recommendation}]}
    source_references = Column(JSON, default=list)
    
    created_at = Column(DateTime, default=datetime.utcnow)

    project = relationship("Project", back_populates="canonical_analyses")
    source = relationship("Source", back_populates="canonical_analyses")
    transformations = relationship("Transformation", back_populates="canonical_analysis", cascade="all, delete-orphan")

class Transformation(Base):
    __tablename__ = "transformations"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    project_id = Column(String(36), ForeignKey("projects.id", ondelete="CASCADE"), nullable=False)
    canonical_id = Column(String(36), ForeignKey("canonical_analyses.id", ondelete="CASCADE"), nullable=False)
    
    # Configuration Controls
    target_audience = Column(String(100), default="General Public")
    tone = Column(String(100), default="Professional")
    language = Column(String(50), default="English")
    detail_level = Column(String(50), default="Medium")
    communication_objective = Column(String(100), default="Inform")
    content_style = Column(String(100), default="Corporate")
    custom_instructions = Column(Text, nullable=True)
    requested_formats = Column(JSON, default=list) # ["executive_summary", "linkedin", "advisory", "presentation", "twitter", "infographic", "video_package"]
    
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
    structured_data = Column(JSON, default=dict) # Schema-validated JSON (e.g. hook/body/CTA or slide deck)
    
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
    change_reason = Column(String(255), default="Initial generation")
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
    
    claims = Column(JSON, default=list) # [{claim, status, source_page, source_match, confidence, reason}]
    created_at = Column(DateTime, default=datetime.utcnow)

    output = relationship("Output", back_populates="fact_check")

class QualityScore(Base):
    __tablename__ = "quality_scores"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    output_id = Column(String(36), ForeignKey("outputs.id", ondelete="CASCADE"), nullable=False)
    
    overall_score = Column(Float, default=90.0) # 0 - 100
    source_accuracy = Column(Float, default=95.0)
    completeness = Column(Float, default=90.0)
    audience_fit = Column(Float, default=92.0)
    readability = Column(Float, default=88.0)
    tone_consistency = Column(Float, default=94.0)
    structure_score = Column(Float, default=90.0)
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
    doc_type = Column(String(100), default="Policy") # Policy, Brand Guidelines, Terminology, Template
    content = Column(Text, nullable=False)
    tags = Column(JSON, default=list)
    created_at = Column(DateTime, default=datetime.utcnow)

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    project_id = Column(String(36), ForeignKey("projects.id", ondelete="CASCADE"), nullable=True)
    action = Column(String(100), nullable=False) # PROJECT_CREATED, ANALYSIS_RUN, OUTPUT_GENERATED, APPROVED, PUBLISHED, EDITED
    actor = Column(String(100), default="System")
    details = Column(JSON, default=dict)
    timestamp = Column(DateTime, default=datetime.utcnow)

    project = relationship("Project", back_populates="audit_logs")
