// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title ContractVault
 * @author Anti-Tamper Legal & Business Contract Vault
 * @notice Anchors SHA-256 document fingerprints permanently on Polygon.
 *         Each document's hash is stored with a timestamp and the anchoring address,
 *         providing an immutable, publicly-verifiable proof of existence.
 * @dev Optimized for Polygon PoS / Amoy testnet. Uses a mapping for O(1) lookups.
 */
contract ContractVault {

    // ─── Data Structures ────────────────────────────────────────────────────

    /**
     * @notice Stores the full provenance record for an anchored document.
     * @param docHash    The SHA-256 hex string of the document (e.g., "a3f9...").
     * @param ipfsHash   The IPFS CID for the document.
     * @param timestamp  Unix timestamp (block.timestamp) at the time of anchoring.
     * @param anchoredBy The Ethereum/Polygon address that submitted the transaction.
     * @param parentHash The parent document hash (if an amendment).
     * @param validUntil Expiration timestamp (0 if perpetual).
     * @param isRevoked  Whether the document is revoked.
     * @param revocationReason Reason for revocation.
     * @param exists     Internal flag to distinguish a stored record.
     */
    struct DocumentRecord {
        string  docHash;
        string  ipfsHash;
        uint256 timestamp;
        address anchoredBy;
        string  parentHash;
        uint256 validUntil;
        bool    isRevoked;
        string  revocationReason;
        bool    exists;
    }

    // ─── State ───────────────────────────────────────────────────────────────

    /// @notice Maps a SHA-256 hex hash string to its on-chain record.
    mapping(string => DocumentRecord) private documentRegistry;

    /// @notice Total number of documents anchored (useful for analytics).
    uint256 public totalAnchored;

    /// @notice Contract owner address (for future governance/upgrades).
    address public immutable owner;

    // ─── Events ──────────────────────────────────────────────────────────────

    /**
     * @notice Emitted when a new document is successfully anchored.
     * @param docHash    The SHA-256 hash of the document.
     * @param anchoredBy The address that anchored the document.
     * @param timestamp  Block timestamp at anchoring time.
     * @param parentHash The parent document hash (if an amendment).
     */
    event DocumentAnchored(
        string  indexed docHash,
        address indexed anchoredBy,
        uint256         timestamp,
        string          parentHash
    );

    event DocumentRevoked(
        string  indexed docHash,
        address indexed revokedBy,
        uint256         timestamp,
        string          reason
    );

    // ─── Errors ───────────────────────────────────────────────────────────────

    /// @notice Reverts if a hash has already been anchored (immutability guarantee).
    error HashAlreadyAnchored(string docHash);

    /// @notice Reverts if an empty string is passed as the hash.
    error InvalidHash();

    /// @notice Reverts if unauthorized address attempts to revoke.
    error UnauthorizedRevocation();

    /// @notice Reverts if document does not exist.
    error DocumentNotFound();

    /// @notice Reverts if already revoked.
    error DocumentAlreadyRevoked();

    // ─── Constructor ─────────────────────────────────────────────────────────

    constructor() {
        owner = msg.sender;
    }

    // ─── Primary Functions ───────────────────────────────────────────────────

    /**
     * @notice Anchors a document permanently on-chain.
     * @param  _docHash The SHA-256 hexadecimal string of the document (64 chars).
     * @param  _ipfsHash The IPFS CID for the document.
     * @param  _parentHash The parent document hash (if an amendment).
     * @param  _validUntil Expiration timestamp (0 if perpetual).
     */
    function anchorDocument(string memory _docHash, string memory _ipfsHash, string memory _parentHash, uint256 _validUntil) external {
        // Input validation
        if (bytes(_docHash).length == 0) revert InvalidHash();

        // Prevent re-anchoring
        if (documentRegistry[_docHash].exists) revert HashAlreadyAnchored(_docHash);

        // Store the provenance record
        documentRegistry[_docHash] = DocumentRecord({
            docHash:          _docHash,
            ipfsHash:         _ipfsHash,
            timestamp:        block.timestamp,
            anchoredBy:       msg.sender,
            parentHash:       _parentHash,
            validUntil:       _validUntil,
            isRevoked:        false,
            revocationReason: "",
            exists:           true
        });

        // Increment global counter
        unchecked { ++totalAnchored; }

        emit DocumentAnchored(_docHash, msg.sender, block.timestamp, _parentHash);
    }

    /**
     * @notice Revokes a previously anchored document.
     * @param _docHash The SHA-256 hash of the document to revoke.
     * @param _reason The reason for revocation.
     */
    function revokeDocument(string memory _docHash, string memory _reason) external {
        DocumentRecord storage record = documentRegistry[_docHash];
        if (!record.exists) revert DocumentNotFound();
        if (record.anchoredBy != msg.sender && owner != msg.sender) revert UnauthorizedRevocation();
        if (record.isRevoked) revert DocumentAlreadyRevoked();

        record.isRevoked = true;
        record.revocationReason = _reason;

        emit DocumentRevoked(_docHash, msg.sender, block.timestamp, _reason);
    }

    /**
     * @notice Retrieves the anchoring record for a given document hash.
     */
    function verifyDocument(string memory _docHash)
        external
        view
        returns (
            bool    _exists,
            uint256 _timestamp,
            address _anchoredBy
        )
    {
        DocumentRecord storage record = documentRegistry[_docHash];
        return (record.exists, record.timestamp, record.anchoredBy);
    }

    /**
     * @notice Retrieves the full document history.
     */
    function getDocumentHistory(string memory _docHash)
        external
        view
        returns (
            bool    _isRevoked,
            uint256 _validUntil,
            string memory _revocationReason,
            string memory _parentHash
        )
    {
        DocumentRecord storage record = documentRegistry[_docHash];
        return (record.isRevoked, record.validUntil, record.revocationReason, record.parentHash);
    }

    /**
     * @notice Returns the full DocumentRecord struct for a given hash.
     */
    function getRecord(string memory _docHash)
        external
        view
        returns (DocumentRecord memory)
    {
        return documentRegistry[_docHash];
    }
}
