from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Dict, Any, Optional

from app.database.session import get_db
from app.services.blockchain_service import BlockchainService
from app.schemas.blockchain import (
    ContentVerificationRequest,
    ContentVerificationResponse,
    BlockchainHistoryItem,
    BlockchainStatsResponse,
    BlockchainNetworkStatusResponse,
    TamperDemoRequest,
    RestoreDemoRequest
)

router = APIRouter(prefix="/blockchain", tags=["Blockchain Content Integrity"])

@router.post("/verify", response_model=ContentVerificationResponse)
def verify_content_integrity(
    req: ContentVerificationRequest,
    db: Session = Depends(get_db)
):
    """
    Cryptographically verify content integrity against on-chain SHA-256 registered digest.
    Returns VERIFIED or MODIFIED with full cryptographic proof.
    """
    result = BlockchainService.verify_content(
        db=db,
        content_id=req.content_id,
        current_content=req.current_content,
        version_tag=req.version_tag
    )
    return result

@router.get("/content/{content_id}/history", response_model=List[BlockchainHistoryItem])
def get_content_version_history(
    content_id: str,
    db: Session = Depends(get_db)
):
    """
    Retrieve the immutable hash-chain version history (V1 -> V2 -> V3) for an item.
    """
    return BlockchainService.get_content_history(db=db, content_id=content_id)

@router.get("/content/{content_id}/latest")
def get_latest_blockchain_record(
    content_id: str,
    db: Session = Depends(get_db)
):
    """
    Retrieve the most recent on-chain anchor record for a content item.
    """
    history = BlockchainService.get_content_history(db=db, content_id=content_id)
    if not history:
        raise HTTPException(status_code=404, detail=f"No blockchain record found for {content_id}")
    return history[-1]

@router.get("/stats", response_model=BlockchainStatsResponse)
def get_blockchain_integrity_stats(
    db: Session = Depends(get_db)
):
    """
    Retrieve system-wide content integrity and blockchain statistics.
    """
    return BlockchainService.get_integrity_stats(db=db)

@router.get("/status", response_model=BlockchainNetworkStatusResponse)
def get_blockchain_network_status():
    """
    Retrieve live EVM network telemetry, contract address, block height, and gas price.
    """
    return BlockchainService.get_network_status()

@router.post("/demo/tamper")
def simulate_content_tampering(
    req: TamperDemoRequest,
    db: Session = Depends(get_db)
):
    """
    Hackathon Demo Endpoint:
    Simulates unauthorized database modification without an on-chain signature.
    """
    try:
        return BlockchainService.simulate_tamper(
            db=db,
            content_id=req.content_id,
            tampered_text=req.tampered_text
        )
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

@router.post("/demo/restore")
def restore_verified_content(
    req: RestoreDemoRequest,
    db: Session = Depends(get_db)
):
    """
    Restores the uncorrupted verified content from version history after a tamper demo test.
    """
    try:
        return BlockchainService.restore_original(
            db=db,
            content_id=req.content_id,
            version_tag=req.version_tag
        )
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
