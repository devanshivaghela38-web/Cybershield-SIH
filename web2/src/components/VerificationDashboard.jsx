import { useState, useCallback } from 'react';
import { verifyDocument } from '../services/api.js';

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function formatDate(isoString) {
  if (!isoString) return '—';
  return new Date(isoString).toLocaleString('en-IN', {
    day: 'numeric', month: 'long', year: 'numeric',
    hour: '2-digit', minute: '2-digit', timeZoneName: 'short',
  });
}

// ── Result Components ─────────────────────────────────────────────────────────

function VerifiedAlert({ result }) {
  return (
    <div className="stagger mt-6">
      {/* ✅ GREEN — Verified authentic */}
      <div className="alert alert-success" id="verification-success-alert">
        <div className="alert-icon" style={{ fontSize: '1.5rem' }}>✓</div>
        <div className="alert-content">
          <div className="alert-title" style={{ fontSize: '1.125rem' }}>
            ✅ Document Verified — Authentic &amp; Unmodified
          </div>
          <p className="alert-desc">
            The SHA-256 fingerprint of this document perfectly matches the record
            anchored on the Polygon blockchain. This document has <strong>not</strong> been
            tampered with since it was originally anchored.
          </p>
        </div>
      </div>

      {/* Hash */}
      <div style={{ marginTop: '1.25rem' }}>
        <div className="hash-label">Verified SHA-256 Fingerprint</div>
        <div className="hash-display" style={{ borderColor: 'var(--clr-success-border)' }}>
          {result.hash}
        </div>
      </div>

      {/* Provenance Info */}
      <div className="meta-grid">
        <div className="meta-item">
          <div className="meta-item-label">Originally Anchored</div>
          <div className="meta-item-value">{formatDate(result.anchoredDate)}</div>
        </div>
        {result.anchoredBy && (
          <div className="meta-item">
            <div className="meta-item-label">Anchored By (Address)</div>
            <div className="meta-item-value mono">
              {result.anchoredBy.slice(0, 8)}…{result.anchoredBy.slice(-6)}
            </div>
          </div>
        )}
        <div className="meta-item">
          <div className="meta-item-label">Verification Status</div>
          <div className="meta-item-value" style={{ color: 'var(--clr-success-text)' }}>
            ● On-chain Confirmed
          </div>
        </div>
        <div className="meta-item">
          <div className="meta-item-label">File Name</div>
          <div className="meta-item-value">{result.filename}</div>
        </div>
      </div>
    </div>
  );
}

function TamperedAlert({ result }) {
  return (
    <div className="stagger mt-6">
      {/* 🔴 RED — Hash Mismatch / Tampered */}
      <div className="alert alert-danger" id="verification-failure-alert">
        <div className="alert-icon" style={{ fontSize: '1.5rem' }}>✕</div>
        <div className="alert-content">
          <div className="alert-title" style={{ fontSize: '1.125rem' }}>
            🚨 Hash Mismatch — Document Tampered
          </div>
          <p className="alert-desc">
            The computed SHA-256 fingerprint of this document{' '}
            <strong>does not match any record</strong> on the Polygon blockchain.
            This document may have been altered, corrupted, or was never anchored.
          </p>
        </div>
      </div>

      {/* Computed Hash */}
      <div style={{ marginTop: '1.25rem' }}>
        <div className="hash-label">Computed SHA-256 (Not Found On-Chain)</div>
        <div className="hash-display" style={{ borderColor: 'var(--clr-danger-border)' }}>
          {result.hash}
        </div>
      </div>

      {/* What to do */}
      <div className="alert alert-warn mt-4">
        <div className="alert-icon">⚠</div>
        <div className="alert-content">
          <div className="alert-title">What does this mean?</div>
          <p className="alert-desc">
            Either this document was never anchored on Polygon, it has been
            modified since anchoring, or the wrong file was uploaded.
            Contact the document issuer for the original anchored copy.
          </p>
        </div>
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function VerificationDashboard() {
  const [file, setFile]             = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [status, setStatus]         = useState('idle'); // idle | loading | verified | tampered | error
  const [result, setResult]         = useState(null);
  const [error, setError]           = useState(null);

  // ── File Handling ─────────────────────────────────────────────────────────

  const handleFile = useCallback((incoming) => {
    if (!incoming) return;
    if (!incoming.name.toLowerCase().endsWith('.pdf') && incoming.type !== 'application/pdf') {
      setError('Only PDF files are accepted for verification.');
      return;
    }
    setError(null);
    setResult(null);
    setStatus('idle');
    setFile(incoming);
  }, []);

  const onInputChange  = (e)  => handleFile(e.target.files?.[0]);
  const onDragOver     = (e)  => { e.preventDefault(); setIsDragging(true); };
  const onDragLeave    = ()   => setIsDragging(false);
  const onDrop         = (e)  => {
    e.preventDefault();
    setIsDragging(false);
    handleFile(e.dataTransfer.files?.[0]);
  };

  const openPicker = () => document.getElementById('verify-file-input').click();

  const reset = () => {
    setFile(null);
    setResult(null);
    setError(null);
    setStatus('idle');
  };

  // ── Verify ────────────────────────────────────────────────────────────────

  const handleVerify = async (e) => {
    e.preventDefault();
    if (!file) return;

    setStatus('loading');
    setError(null);
    setResult(null);

    try {
      const res = await verifyDocument(file);
      setResult(res);
      setStatus(res.verified ? 'verified' : 'tampered');
    } catch (err) {
      setError(err.message || 'Verification request failed.');
      setStatus('error');
    }
  };

  const isLoading = status === 'loading';

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="card animate-fade-in-up">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div style={{
          width: 48, height: 48,
          background: 'linear-gradient(135deg, #10b981, #059669)',
          borderRadius: 'var(--radius-md)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '1.375rem',
          boxShadow: '0 4px 16px rgba(16,185,129,0.4)',
        }}>
          🔍
        </div>
        <div>
          <h2 style={{ marginBottom: 2 }}>Verification Dashboard</h2>
          <p className="text-sm text-muted" style={{ margin: 0 }}>
            Upload a document to instantly verify its blockchain authenticity
          </p>
        </div>
        <div className="badge" style={{
          marginLeft: 'auto',
          background: 'rgba(16,185,129,0.12)',
          color: '#34d399',
          border: '1px solid rgba(16,185,129,0.3)',
        }}>
          On-chain Verify
        </div>
      </div>

      <form onSubmit={handleVerify}>
        {/* Drop Zone */}
        {!file && (
          <div
            id="verify-drop-zone"
            className={`drop-zone ${isDragging ? 'drag-over' : ''}`}
            style={isDragging ? { borderColor: '#10b981', boxShadow: '0 0 0 4px rgba(16,185,129,0.2)' } : {}}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
            onClick={openPicker}
            role="button"
            tabIndex={0}
            onKeyDown={e => e.key === 'Enter' && openPicker()}
            aria-label="Click or drag a PDF file here to verify"
          >
            <div
              className="drop-zone-icon"
              style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}
            >
              {isDragging ? '🎯' : '🔍'}
            </div>
            <div className="drop-zone-title">
              {isDragging ? 'Release to verify' : 'Drop your document to verify'}
            </div>
            <div className="drop-zone-subtitle mt-2">
              or <span style={{ color: '#34d399', fontWeight: 600 }}>browse files</span> — PDF only
            </div>
          </div>
        )}

        <input
          id="verify-file-input"
          type="file"
          accept="application/pdf,.pdf"
          onChange={onInputChange}
          style={{ display: 'none' }}
        />

        {/* File Pill */}
        {file && !isLoading && status === 'idle' && (
          <div className="file-pill animate-fade-in">
            <div className="file-pill-icon" style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}>
              📄
            </div>
            <div className="flex flex-col gap-1" style={{ flex: 1, minWidth: 0 }}>
              <span className="file-pill-name">{file.name}</span>
              <span className="file-pill-size">{formatBytes(file.size)}</span>
            </div>
            <button className="file-pill-remove" onClick={reset} title="Remove file">✕</button>
          </div>
        )}

        {file && isLoading && (
          <div className="file-pill animate-fade-in">
            <div className="file-pill-icon" style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}>
              📄
            </div>
            <div className="flex flex-col gap-1" style={{ flex: 1, minWidth: 0 }}>
              <span className="file-pill-name">{file.name}</span>
              <span className="file-pill-size">Computing fingerprint &amp; querying blockchain…</span>
            </div>
            <div className="spinner" style={{ borderTopColor: '#10b981' }} />
          </div>
        )}

        {/* Results */}
        {status === 'verified' && result && <VerifiedAlert result={result} />}
        {status === 'tampered' && result && <TamperedAlert result={result} />}

        {/* Error */}
        {status === 'error' && error && (
          <div className="alert alert-danger mt-6 animate-fade-in">
            <div className="alert-icon">✕</div>
            <div className="alert-content">
              <div className="alert-title">Verification Error</div>
              <p className="alert-desc">{error}</p>
            </div>
          </div>
        )}

        <div className="divider" />

        {/* Action Buttons */}
        {status !== 'verified' && status !== 'tampered' ? (
          <button
            id="verify-submit-btn"
            type="submit"
            className="btn btn-lg w-full"
            style={{
              background: file && !isLoading
                ? 'linear-gradient(135deg, #10b981, #059669)'
                : undefined,
              boxShadow: file && !isLoading ? '0 4px 15px rgba(16,185,129,0.4)' : undefined,
              opacity: !file || isLoading ? 0.5 : 1,
              cursor: !file || isLoading ? 'not-allowed' : 'pointer',
              color: '#fff',
            }}
            disabled={!file || isLoading}
          >
            {isLoading ? (
              <>
                <span className="spinner" />
                <span>Querying Blockchain…</span>
              </>
            ) : (
              <>
                <span>🔍</span>
                <span>Verify Authenticity</span>
              </>
            )}
          </button>
        ) : (
          <button
            id="verify-reset-btn"
            type="button"
            className="btn btn-secondary btn-lg w-full"
            onClick={reset}
          >
            <span>↩</span>
            <span>Verify Another Document</span>
          </button>
        )}

        <p className="text-xs text-center mt-4" style={{ color: 'var(--clr-text-muted)' }}>
          🔒 Verification is read-only. No transaction is sent. Your document is never stored.
        </p>
      </form>
    </div>
  );
}
