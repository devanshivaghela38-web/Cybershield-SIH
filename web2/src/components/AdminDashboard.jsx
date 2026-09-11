import { useState, useEffect } from 'react';
import { fetchAdminMetrics, fetchAdminDocuments, deleteAdminDocument } from '../services/api.js';

function formatBytes(bytes) {
  if (!bytes) return '0 B';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1048576).toFixed(2)} MB`;
}

function formatDate(isoString) {
  if (!isoString) return '—';
  return new Date(isoString).toLocaleString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit', second: '2-digit'
  });
}

export default function AdminDashboard({ user }) {
  const [metrics, setMetrics]     = useState(null);
  const [documents, setDocuments] = useState([]);
  const [search, setSearch]       = useState('');
  const [loading, setLoading]     = useState(true);
  const [copiedHash, setCopiedHash] = useState(null);
  const [notice, setNotice]       = useState(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const [m, d] = await Promise.all([
        fetchAdminMetrics().catch(() => null),
        fetchAdminDocuments().catch(() => ({ documents: [] })),
      ]);
      setMetrics(m);
      setDocuments(d.documents || []);
    } catch (err) {
      console.error('Failed to load admin dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 10000); // Auto-refresh telemetry every 10s
    return () => clearInterval(interval);
  }, []);

  const handleCopy = (hash) => {
    navigator.clipboard.writeText(hash);
    setCopiedHash(hash);
    setTimeout(() => setCopiedHash(null), 2000);
  };

  const handleDelete = async (hash, filename) => {
    if (!window.confirm(`Are you sure you want to remove the record for "${filename}" from the registry?`)) {
      return;
    }
    try {
      await deleteAdminDocument(hash);
      setNotice(`Successfully removed "${filename}" from active registry.`);
      setTimeout(() => setNotice(null), 4000);
      loadData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleExportJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(documents, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `contract_vault_audit_log_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const filteredDocs = documents.filter(doc =>
    doc.filename.toLowerCase().includes(search.toLowerCase()) ||
    doc.hash.toLowerCase().includes(search.toLowerCase()) ||
    (doc.txHash && doc.txHash.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="animate-fade-in stagger">
      {/* Admin Header Banner (Frosted Glass) */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.12) 0%, rgba(14, 19, 36, 0.65) 50%, rgba(250, 204, 21, 0.04) 100%)',
        backdropFilter: 'blur(28px) saturate(180%)',
        WebkitBackdropFilter: 'blur(28px) saturate(180%)',
        border: '1px solid rgba(255, 255, 255, 0.10)',
        borderRadius: 'var(--r-2xl, 28px)',
        padding: '2rem 2.25rem',
        marginBottom: '2rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1.25rem',
        boxShadow: '0 24px 60px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.15)',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Top Bevel Highlight */}
        <div style={{
          position: 'absolute',
          top: 0, left: 0, right: 0, height: 1,
          background: 'linear-gradient(90deg, transparent, rgba(192, 132, 252, 0.4) 30%, rgba(254, 240, 138, 0.3) 70%, transparent)',
        }} />

        <div className="flex items-center gap-4">
          <div style={{
            width: 56, height: 56,
            background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.35), rgba(124, 58, 237, 0.5))',
            border: '1px solid rgba(192, 132, 252, 0.4)',
            borderRadius: '16px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.75rem',
            boxShadow: '0 8px 25px rgba(147, 51, 234, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.3)',
            backdropFilter: 'blur(10px)',
          }}>👑</div>
          <div>
            <div className="flex items-center gap-2.5">
              <h2 style={{ fontSize: '1.45rem', fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>
                System Administration Vault
              </h2>
              <span className="badge" style={{
                background: 'rgba(168, 85, 247, 0.15)',
                color: '#d8b4fe',
                border: '1px solid rgba(168, 85, 247, 0.35)',
                fontSize: '0.6875rem',
                backdropFilter: 'blur(8px)',
              }}>ADMIN MODE</span>
            </div>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: 3 }}>
              Logged in as <strong style={{ color: 'var(--text-primary)' }}>{user?.name || 'Administrator'}</strong> ({user?.email})
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={loadData}
            className="btn btn-secondary"
            style={{ fontSize: '0.8125rem', padding: '0.55rem 1.1rem', borderRadius: '12px' }}
          >
            🔄 Refresh Telemetry
          </button>
          <button
            onClick={handleExportJSON}
            className="btn btn-gold"
            style={{ fontSize: '0.8125rem', padding: '0.55rem 1.1rem', borderRadius: '12px' }}
          >
            📥 Export Audit Log (JSON)
          </button>
        </div>
      </div>

      {/* Notice Banner */}
      {notice && (
        <div className="alert alert-success mb-6">
          <div className="alert-icon">✓</div>
          <div className="alert-content">
            <div className="alert-title">Admin Action Executed</div>
            <p className="alert-desc">{notice}</p>
          </div>
        </div>
      )}

      {/* Telemetry Cards Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '1.25rem',
        marginBottom: '2rem',
      }}>
        <div className="card" style={{ padding: '1.25rem' }}>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', marginBottom: 6 }}>
            📋 Total Anchored Contracts
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 900, color: 'var(--text-gold)' }}>
            {loading ? '…' : metrics?.totalAnchored ?? documents.length}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: 4 }}>
            Immutable records on chain
          </div>
        </div>

        <div className="card" style={{ padding: '1.25rem' }}>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', marginBottom: 6 }}>
            💾 Total Storage Consumed
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#c084fc' }}>
            {loading ? '…' : metrics?.totalStorageFormatted ?? formatBytes(documents.reduce((a, b) => a + (b.fileSizeBytes || 0), 0))}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: 4 }}>
            IPFS Pinata Gateway
          </div>
        </div>

        <div className="card" style={{ padding: '1.25rem' }}>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', marginBottom: 6 }}>
            ⚡ Polygon Network Status
          </div>
          <div style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--success-text)' }} className="flex items-center gap-2">
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981', display: 'inline-block' }} />
            Amoy Testnet
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: 4 }}>
            Block confirmations active
          </div>
        </div>

        <div className="card" style={{ padding: '1.25rem' }}>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', marginBottom: 6 }}>
            🔒 Security Protocol
          </div>
          <div style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            SHA-256 Fingerprint
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: 4 }}>
            Zero-Knowledge key isolation
          </div>
        </div>
      </div>

      {/* Contract Audit Table */}
      <div className="card" style={{ padding: '1.75rem' }}>
        <div className="flex justify-between items-center mb-6" style={{ flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              Anchored Document Audit Registry
            </h3>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
              Complete ledger of verified SHA-256 hashes and on-chain block receipts
            </p>
          </div>

          <div style={{ minWidth: 280 }}>
            <input
              type="text"
              placeholder="🔍 Search by name, hash, or TX…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: '100%',
                padding: '0.7rem 1.1rem',
                background: 'rgba(255, 255, 255, 0.035)',
                border: '1px solid rgba(255, 255, 255, 0.09)',
                borderRadius: 'var(--r-md, 14px)',
                color: 'var(--text-primary)',
                fontSize: '0.8125rem',
                outline: 'none',
                boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.3)',
                backdropFilter: 'blur(10px)',
              }}
            />
          </div>
        </div>

        {filteredDocs.length === 0 ? (
          <div className="text-center" style={{ padding: '3.5rem 1rem', color: 'var(--text-muted)' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>📂</div>
            <p style={{ fontWeight: 700, fontSize: '0.9375rem', color: 'var(--text-secondary)' }}>No contract records found</p>
            <p style={{ fontSize: '0.8125rem', marginTop: 4 }}>
              {search ? 'Try clearing your search query' : 'Upload and anchor a document to populate the audit registry'}
            </p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{
              width: '100%',
              borderCollapse: 'separate',
              borderSpacing: '0 0.6rem',
              fontSize: '0.8125rem',
            }}>
              <thead>
                <tr style={{ color: 'var(--text-muted)', textAlign: 'left', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  <th style={{ padding: '0.75rem 1rem', fontWeight: 700 }}>Document Name</th>
                  <th style={{ padding: '0.75rem 1rem', fontWeight: 700 }}>SHA-256 Fingerprint</th>
                  <th style={{ padding: '0.75rem 1rem', fontWeight: 700 }}>Block / TX</th>
                  <th style={{ padding: '0.75rem 1rem', fontWeight: 700 }}>Anchored Date</th>
                  <th style={{ padding: '0.75rem 1rem', fontWeight: 700, textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredDocs.map((doc, idx) => (
                  <tr key={idx} style={{
                    background: 'rgba(255, 255, 255, 0.025)',
                    border: '1px solid rgba(255, 255, 255, 0.05)',
                    borderRadius: '12px',
                    transition: 'all 0.2s ease',
                    boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.05)',
                  }}>
                    <td style={{ padding: '0.85rem 1rem', borderRadius: '8px 0 0 8px', fontWeight: 700, color: 'var(--text-primary)' }}>
                      <div className="flex items-center gap-2">
                        <span>📄</span>
                        <span>{doc.filename}</span>
                      </div>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 500 }}>
                        {formatBytes(doc.fileSizeBytes)}
                      </span>
                    </td>

                    <td style={{ padding: '0.85rem 1rem', fontFamily: 'var(--font-mono)' }}>
                      <span style={{ color: 'var(--text-gold)', fontWeight: 600 }}>
                        {doc.hash.slice(0, 10)}…{doc.hash.slice(-8)}
                      </span>
                    </td>

                    <td style={{ padding: '0.85rem 1rem' }}>
                      {doc.blockNumber && (
                        <div style={{ fontWeight: 700, color: 'var(--violet-400)' }}>
                          #{doc.blockNumber.toLocaleString()}
                        </div>
                      )}
                      {doc.txHash && (
                        <a
                          href={doc.explorerUrl || `https://amoy.polygonscan.com/tx/${doc.txHash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}
                        >
                          {doc.txHash.slice(0, 8)}…↗
                        </a>
                      )}
                    </td>

                    <td style={{ padding: '0.85rem 1rem', color: 'var(--text-secondary)' }}>
                      {formatDate(doc.anchoredDate)}
                    </td>

                    <td style={{ padding: '0.85rem 1rem', borderRadius: '0 8px 8px 0', textAlign: 'right' }}>
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleCopy(doc.hash)}
                          className="btn btn-secondary"
                          style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem' }}
                          title="Copy Full SHA-256 Hash"
                        >
                          {copiedHash === doc.hash ? '✓ Copied' : '📋 Copy'}
                        </button>

                        <button
                          onClick={() => handleDelete(doc.hash, doc.filename)}
                          style={{
                            padding: '0.35rem 0.65rem',
                            fontSize: '0.75rem',
                            borderRadius: '6px',
                            border: '1px solid rgba(239, 68, 68, 0.3)',
                            background: 'rgba(239, 68, 68, 0.1)',
                            color: 'var(--danger-text)',
                            fontWeight: 700,
                            cursor: 'pointer',
                          }}
                          title="Revoke / Audit Entry"
                        >
                          🗑 Revoke
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
