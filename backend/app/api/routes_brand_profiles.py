from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database.session import get_db
from app.database.models import BrandProfile
from app.schemas.brand_profile import BrandProfileCreate, BrandProfileUpdate, BrandProfileResponse

router = APIRouter(prefix="/brand-profiles", tags=["Brand Profiles"])

DEFAULT_SEEDS = [
    {
        "organization_name": "NovaTech Systems",
        "tone": "Authoritative & Reassuring",
        "terminology_rules": {
            "ransomware": "unauthorized encryption incident",
            "leak": "unauthorized external staging",
            "hacked": "security boundary breach",
            "victim": "affected organizational entity"
        },
        "writing_style": "Corporate & Government Advisory",
        "target_audience_default": "Executive Board & Regulators",
        "forbidden_terms": ["panic", "hacked", "catastrophic", "unrecoverable", "disaster"],
        "communication_rules": [
            "Always cite exact UTC timestamps for security milestones",
            "Include quantifiable telemetry table in executive briefs",
            "Mandate IoC reference section in threat advisories",
            "Highlight containment speed and backup integrity"
        ]
    },
    {
        "organization_name": "Aegis Financial Global",
        "tone": "Formal, Precise & Risk-Calibrated",
        "terminology_rules": {
            "outage": "service latency degradation",
            "loss": "unrealized contingency variance",
            "fine": "regulatory settlement provision"
        },
        "writing_style": "Institutional Finance & Compliance Disclosure",
        "target_audience_default": "Board Audit Committee & Institutional Investors",
        "forbidden_terms": ["bankrupt", "insolvent", "meltdown", "collapse"],
        "communication_rules": [
            "Include strict quantitative monetary variance figures",
            "Reference applicable SEC/FINRA regulatory compliance standards",
            "Cite formal audit sign-offs from internal compliance officers"
        ]
    },
    {
        "organization_name": "CarePoint Health Network",
        "tone": "Empathetic, Clinical & Transparent",
        "terminology_rules": {
            "data leak": "protected health information event",
            "glitch": "clinical system downtime"
        },
        "writing_style": "Clinical Governance & Public Health Advisory",
        "target_audience_default": "Patients, Clinical Staff & HIPAA Regulators",
        "forbidden_terms": ["fatal", "hopeless", "careless", "breached"],
        "communication_rules": [
            "Reassure patients regarding patient care continuity",
            "Strictly protect patient identity under HIPAA compliance rules",
            "Provide clear toll-free support helpline numbers"
        ]
    },
    {
        "organization_name": "National Cyber Response Directorate (CERT-In)",
        "tone": "Urgent, Prescriptive & National Security Directive",
        "terminology_rules": {
            "advisory": "national security advisory",
            "fix": "mandatory operational directive"
        },
        "writing_style": "Government Cyber Threat Intelligence",
        "target_audience_default": "Critical National Infrastructure & IT Administrators",
        "forbidden_terms": ["optional", "suggested", "maybe", "trivial"],
        "communication_rules": [
            "Include full CVE identifier, CVSS 3.1 base score, and attack vector",
            "Specify mandatory 24-hour remediation compliance deadline",
            "List comprehensive sha256 IoCs and threat actor attribution"
        ]
    },
    {
        "organization_name": "Apex Cloud Infrastructure",
        "tone": "Technical, Transparent & Reliability-Focused",
        "terminology_rules": {
            "crash": "infrastructure failover event",
            "bug": "unhandled edge condition"
        },
        "writing_style": "SRE Incident Post-Mortem & Status Communication",
        "target_audience_default": "Enterprise Cloud Customers & DevOps Engineers",
        "forbidden_terms": ["broken", "ruined", "incompetent"],
        "communication_rules": [
            "Detail Mean Time to Detect (MTTD) and Mean Time to Recovery (MTTR)",
            "Publish root-cause analysis with architectural diagrams",
            "List immediate automated regression prevention guards"
        ]
    }
]

@router.get("", response_model=List[BrandProfileResponse])
def list_brand_profiles(db: Session = Depends(get_db)):
    # Ensure all default seeds exist
    existing_names = {p.organization_name for p in db.query(BrandProfile).all()}
    for seed in DEFAULT_SEEDS:
        if seed["organization_name"] not in existing_names:
            bp = BrandProfile(
                organization_name=seed["organization_name"],
                tone=seed["tone"],
                terminology_rules=seed["terminology_rules"],
                writing_style=seed["writing_style"],
                target_audience_default=seed["target_audience_default"],
                forbidden_terms=seed["forbidden_terms"],
                communication_rules=seed["communication_rules"]
            )
            db.add(bp)
    db.commit()
    return db.query(BrandProfile).order_by(BrandProfile.created_at.desc()).all()

@router.post("", response_model=BrandProfileResponse)
def create_brand_profile(payload: BrandProfileCreate, db: Session = Depends(get_db)):
    profile = BrandProfile(
        organization_name=payload.organization_name,
        tone=payload.tone,
        terminology_rules=payload.terminology_rules,
        writing_style=payload.writing_style,
        target_audience_default=payload.target_audience_default,
        forbidden_terms=payload.forbidden_terms,
        communication_rules=payload.communication_rules
    )
    db.add(profile)
    db.commit()
    db.refresh(profile)
    return profile

@router.get("/{profile_id}", response_model=BrandProfileResponse)
def get_brand_profile(profile_id: str, db: Session = Depends(get_db)):
    profile = db.query(BrandProfile).filter(BrandProfile.id == profile_id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Brand profile not found")
    return profile

@router.put("/{profile_id}", response_model=BrandProfileResponse)
def update_brand_profile(profile_id: str, payload: BrandProfileUpdate, db: Session = Depends(get_db)):
    profile = db.query(BrandProfile).filter(BrandProfile.id == profile_id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Brand profile not found")
    
    if payload.organization_name is not None:
        profile.organization_name = payload.organization_name
    if payload.tone is not None:
        profile.tone = payload.tone
    if payload.terminology_rules is not None:
        profile.terminology_rules = payload.terminology_rules
    if payload.writing_style is not None:
        profile.writing_style = payload.writing_style
    if payload.target_audience_default is not None:
        profile.target_audience_default = payload.target_audience_default
    if payload.forbidden_terms is not None:
        profile.forbidden_terms = payload.forbidden_terms
    if payload.communication_rules is not None:
        profile.communication_rules = payload.communication_rules

    db.commit()
    db.refresh(profile)
    return profile

@router.delete("/{profile_id}")
def delete_brand_profile(profile_id: str, db: Session = Depends(get_db)):
    profile = db.query(BrandProfile).filter(BrandProfile.id == profile_id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Brand profile not found")
    db.delete(profile)
    db.commit()
    return {"message": "Brand profile deleted successfully"}
