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
     * @param hash       The SHA-256 hex string of the document (e.g., "a3f9...").
     * @param timestamp  Unix timestamp (block.timestamp) at the time of anchoring.
     * @param anchoredBy The Ethereum/Polygon address that submitted the transaction.
     * @param exists     Internal flag to distinguish a stored record from an empty mapping slot.
     */
    struct DocumentRecord {
        string  hash;
        uint256 timestamp;
        address anchoredBy;
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
     * @param hash       The SHA-256 hash of the document.
     * @param anchoredBy The address that anchored the document.
     * @param timestamp  Block timestamp at anchoring time.
     */
    event DocumentAnchored(
        string  indexed hash,
        address indexed anchoredBy,
        uint256         timestamp
    );

    // ─── Errors ───────────────────────────────────────────────────────────────

    /// @notice Reverts if a hash has already been anchored (immutability guarantee).
    error HashAlreadyAnchored(string hash);

    /// @notice Reverts if an empty string is passed as the hash.
    error InvalidHash();

    // ─── Constructor ─────────────────────────────────────────────────────────

    constructor() {
        owner = msg.sender;
    }

    // ─── Primary Functions ───────────────────────────────────────────────────

    /**
     * @notice Anchors a document's SHA-256 hash permanently on-chain.
     * @dev    Reverts if the hash is empty or has already been anchored.
     *         Each hash can only be anchored once — guaranteeing immutability.
     * @param  _hash The SHA-256 hexadecimal string of the document (64 chars).
     */
    function anchorDocument(string memory _hash) external {
        // Input validation
        if (bytes(_hash).length == 0) revert InvalidHash();

        // Prevent re-anchoring — once anchored, a document's record is immutable
        if (documentRegistry[_hash].exists) revert HashAlreadyAnchored(_hash);

        // Store the provenance record
        documentRegistry[_hash] = DocumentRecord({
            hash:       _hash,
            timestamp:  block.timestamp,
            anchoredBy: msg.sender,
            exists:     true
        });

        // Increment global counter
        unchecked { ++totalAnchored; }

        // Emit on-chain event (indexable by The Graph or Alchemy)
        emit DocumentAnchored(_hash, msg.sender, block.timestamp);
    }

    /**
     * @notice Retrieves the anchoring record for a given document hash.
     * @dev    Returns zeroed values if the hash has not been anchored.
     *         Check `_exists` before trusting other return values.
     * @param  _hash The SHA-256 hexadecimal string to look up.
     * @return _exists     True if this hash has been anchored.
     * @return _timestamp  Unix timestamp of anchoring (0 if not found).
     * @return _anchoredBy Address that anchored the document (zero address if not found).
     */
    function verifyDocument(string memory _hash)
        external
        view
        returns (
            bool    _exists,
            uint256 _timestamp,
            address _anchoredBy
        )
    {
        DocumentRecord storage record = documentRegistry[_hash];
        return (record.exists, record.timestamp, record.anchoredBy);
    }

    /**
     * @notice Returns the full DocumentRecord struct for a given hash.
     * @dev    Useful for external integrations that need all fields at once.
     * @param  _hash The SHA-256 hexadecimal string to look up.
     * @return The full DocumentRecord (fields are zero-valued if not anchored).
     */
    function getRecord(string memory _hash)
        external
        view
        returns (DocumentRecord memory)
    {
        return documentRegistry[_hash];
    }
}
