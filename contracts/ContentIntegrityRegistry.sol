// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title ContentIntegrityRegistry
 * @dev Immutable, append-only on-chain cryptographic registry for GenAI Content Transformation Platform.
 * 
 * ARCHITECTURAL PRINCIPLE:
 * Strictly stores ONLY cryptographic digests (SHA-256 hashes), version identifiers, 
 * parent pointers (hash chain), timestamps, and actor tags.
 * Raw documents, full text, and sensitive organizational data are NEVER stored on-chain.
 */
contract ContentIntegrityRegistry {
    struct ContentRecord {
        bytes32 contentHash;      // SHA-256 hash of normalized content
        bytes32 previousHash;     // Parent version hash (creates hash chain V1 -> V2 -> V3)
        uint256 timestamp;        // Block timestamp
        string contentId;         // Content / Output identifier
        string versionId;         // Version tag (e.g., "V1", "V2", "V3")
        string action;            // Action type (ORIGINAL_UPLOAD, AI_TRANSFORMATION, HUMAN_EDIT, APPROVED, PUBLISHED)
        address submittedBy;      // Submitter wallet address
    }

    // Mapping: keccak256(contentId, versionId) => ContentRecord
    mapping(bytes32 => ContentRecord) private _records;
    
    // Mapping: contentId => chronological list of versionIds
    mapping(string => string[]) private _versionIndex;

    // Total registered versions counter
    uint256 public totalRecords;

    event VersionRegistered(
        string indexed contentId,
        string indexed versionId,
        bytes32 contentHash,
        bytes32 previousHash,
        string action,
        address indexed submittedBy,
        uint256 timestamp
    );

    /**
     * @notice Register a new cryptographic content version record on-chain.
     * @param contentId Unique identifier for the content item (e.g., output ID or source ID)
     * @param versionId Version tag (e.g., "V1", "V2")
     * @param contentHash SHA-256 digest of the normalized content
     * @param previousHash SHA-256 digest of the parent version (or 0x0 for initial version)
     * @param action Description of the lifecycle action that produced this version
     */
    function registerVersion(
        string memory contentId,
        string memory versionId,
        bytes32 contentHash,
        bytes32 previousHash,
        string memory action
    ) external returns (bytes32) {
        bytes32 key = keccak256(abi.encodePacked(contentId, versionId));
        require(_records[key].timestamp == 0, "Error: Version already registered and is immutable");
        require(contentHash != bytes32(0), "Error: Invalid content hash");

        ContentRecord memory record = ContentRecord({
            contentHash: contentHash,
            previousHash: previousHash,
            timestamp: block.timestamp,
            contentId: contentId,
            versionId: versionId,
            action: action,
            submittedBy: msg.sender
        });

        _records[key] = record;
        _versionIndex[contentId].push(versionId);
        totalRecords++;

        emit VersionRegistered(
            contentId,
            versionId,
            contentHash,
            previousHash,
            action,
            msg.sender,
            block.timestamp
        );

        return key;
    }

    /**
     * @notice Cryptographically verify if a content hash matches the on-chain registered record.
     * @param contentId Content identifier
     * @param versionId Version tag
     * @param currentContentHash Recomputed SHA-256 digest of the stored content
     */
    function verifyVersion(
        string memory contentId,
        string memory versionId,
        bytes32 currentContentHash
    ) external view returns (
        bool isValid,
        bytes32 registeredHash,
        bytes32 previousHash,
        uint256 timestamp,
        string memory action,
        address submittedBy
    ) {
        bytes32 key = keccak256(abi.encodePacked(contentId, versionId));
        ContentRecord memory record = _records[key];
        if (record.timestamp == 0) {
            return (false, bytes32(0), bytes32(0), 0, "", address(0));
        }
        bool matches = (record.contentHash == currentContentHash);
        return (
            matches,
            record.contentHash,
            record.previousHash,
            record.timestamp,
            record.action,
            record.submittedBy
        );
    }

    /**
     * @notice Retrieve an individual version record.
     */
    function getVersion(string memory contentId, string memory versionId) external view returns (ContentRecord memory) {
        bytes32 key = keccak256(abi.encodePacked(contentId, versionId));
        require(_records[key].timestamp != 0, "Error: Record not found");
        return _records[key];
    }

    /**
     * @notice Retrieve the full chronological hash chain history for a given content item.
     */
    function getVersionHistory(string memory contentId) external view returns (ContentRecord[] memory) {
        string[] memory versions = _versionIndex[contentId];
        ContentRecord[] memory history = new ContentRecord[](versions.length);
        for (uint256 i = 0; i < versions.length; i++) {
            bytes32 key = keccak256(abi.encodePacked(contentId, versions[i]));
            history[i] = _records[key];
        }
        return history;
    }
}
