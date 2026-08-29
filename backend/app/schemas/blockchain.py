from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any

class ContentVerificationRequest(BaseModel):
    content_id: str
    current_content: str
    version_tag: Optional[str] = None

class ContentVerificationResponse(BaseModel):
    status: str # VERIFIED, MODIFIED, UNREGISTERED
    is_valid: bool
    message: str
    content_id: str
    version_tag: Optional[str] = None
    version_number: Optional[int] = None
    registered_hash: Optional[str] = None
    current_hash: str
    previous_hash: Optional[str] = None
    algorithm: str = "SHA-256"
    action_type: Optional[str] = None
    blockchain_status: Optional[str] = None
    blockchain_network: Optional[str] = None
    transaction_hash: Optional[str] = None
    block_number: Optional[int] = None
    contract_address: Optional[str] = None
    wallet_address: Optional[str] = None
    registered_at: Optional[str] = None
    verification_timestamp: str

class BlockchainHistoryItem(BaseModel):
    id: str
    content_id: str
    version_number: int
    version_tag: str
    parent_version_id: Optional[str] = None
    content_hash: str
    previous_hash: str
    hash_algorithm: str = "SHA-256"
    action_type: str
    created_by: str
    blockchain_status: str
    blockchain_network: str
    transaction_hash: Optional[str] = None
    block_number: Optional[int] = None
    wallet_address: Optional[str] = None
    contract_address: Optional[str] = None
    gas_used: Optional[int] = None
    created_at: Optional[str] = None

class BlockchainStatsResponse(BaseModel):
    total_verified: int
    total_blockchain_records: int
    modified_alerts: int
    pending_transactions: int
    blockchain_network: str
    contract_address: str
    mode: str
    status: str

class BlockchainNetworkStatusResponse(BaseModel):
    network: str
    mode: str
    contract_address: str
    latest_block: int
    gas_price_gwei: float
    status: str
    evm_compatibility: str
    hash_algorithm: str
    immutable: bool

class TamperDemoRequest(BaseModel):
    content_id: str
    tampered_text: Optional[str] = None

class RestoreDemoRequest(BaseModel):
    content_id: str
    version_tag: Optional[str] = None
