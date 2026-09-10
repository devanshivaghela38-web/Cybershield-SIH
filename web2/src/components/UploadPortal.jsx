import { useState, useCallback } from 'react';
import { anchorDocument } from '../services/api.js';

// ── Step Definitions ──────────────────────────────────────────────────────────
const STEPS = [
  { id: 'hash',   label: 'SHA-256 Hash',   icon: '#' },
  { id: 'ipfs',   label: 'IPFS Pin',        icon: '⬡' },
  { id: 'anchor', label: 'Anchor on Chain', icon: '⛓' },
];

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function formatDate(isoString) {
  if (!isoString) return '—';
  return new Date(isoString).toLocaleString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

// ── Sub-components ────────────────────────────────────────────────────────────

function StepIndicator({ currentStep, completedSteps }) {
  return (
    <div className="steps mt-6">
      {STEPS.map((step, idx) => {
        const isCompleted = completedSteps.includes(step.id);
        const isActive    = currentStep === step.id;
        return (
          <div
            key={step.id}
            className={`step ${isCompleted ? 'completed' : ''} ${isActive ? 'active' : ''}`}
          >
            <div className="step-dot">
              {isCompleted ? '✓' : step.icon}
            </div>
            <span className="step-label">{step.label}</span>
          </div>
        );
      })}
    </div>
  );
}

function FilePill({ file, onRemove }) {
  return (
    <div className="file-pill animate-fade-in">
      <div className="file-pill-icon">📄</div>
      <div className="flex flex-col gap-1" style={{ flex: 1, minWidth: 0 }}>
        <span className="file-pill-name">{file.name}</span>
        <span className="file-pill-size">{formatBytes(file.size)}</span>
      </div>
      {onRemove && (
        <button className="file-pill-remove" onClick={onRemove} title="Remove file">
          ✕
        </button>
      )}
    </div>
  );
}

function SuccessResult({ result }) {
  return (
    <div className="stagger mt-6">
      {/* Success Alert */}
      <div className="alert alert-success">
        <div className="alert-icon">✓</div>
        <div className="alert-content">
          <div className="alert-title">Document Anchored Successfully</div>
          <p className="alert-desc">
            Your document's SHA-256 fingerprint has been permanently recorded on the
            Polygon blockchain. This serves as immutable proof of existence.
          </p>
        </div>
      </div>

      {/* Hash Display */}
      <div style={{ marginTop: '1.25rem' }}>
        <div className="hash-label">SHA-256 Fingerprint</div>
        <div className="hash-display">{result.hash}</div>
      </div>

      {/* Meta Grid */}
      <div className="meta-grid">
        {result.txHash && (
          <div className="meta-item">
            <div className="meta-item-label">Transaction Hash</div>
            <div className="meta-item-value mono">
              {result.txHash.slice(0, 10)}…{result.txHash.slice(-8)}
            </div>
          </div>
        )}
        {result.blockNumber && (
          <div className="meta-item">
            <div className="meta-item-label">Block Number</div>
            <div className="meta-item-value">{result.blockNumber.toLocaleString()}</div>
          </div>
        )}
        {result.ipfsCid && (
          <div className="meta-item">
            <div className="meta-item-label">IPFS CID</div>
            <div className="meta-item-value mono">
              {result.ipfsCid.slice(0, 12)}…{result.ipfsCid.slice(-6)}
            </div>
          </div>
        )}
        <div className="meta-item">
          <div className="meta-item-label">Anchored At</div>
          <div className="meta-item-value">{formatDate(new Date().toISOString())}</div>
        </div>
      </div>

      {/* Explorer Links */}
      <div className="flex gap-3 mt-6" style={{ flexWrap: 'wrap' }}>
        {result.explorerUrl && (
          <a
            id="polygonscan-link"
            className="explorer-link"
            href={result.explorerUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            <span>🔍</span>
            <span>View on PolygonScan</span>
            <span style={{ fontSize: '0.7em', opacity: 0.7 }}>↗</span>
          </a>
        )}
        {result.ipfsUrl && (
          <a
            id="ipfs-link"
            className="explorer-link"
            href={result.ipfsUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            <span>⬡</span>
            <span>View on IPFS</span>
            <span style={{ fontSize: '0.7em', opacity: 0.7 }}>↗</span>
          </a>
        )}
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function UploadPortal() {
  const [file, setFile]               = useState(null);
  const [isDragging, setIsDragging]   = useState(false);
  const [status, setStatus]           = useState('idle'); // idle | loading | success | error
  const [currentStep, setCurrentStep] = useState(null);
  const [completedSteps, setCompleted] = useState([]);
  const [result, setResult]           = useState(null);
  const [error, setError]             = useState(null);

  // ── File Handling ─────────────────────────────────────────────────────────

  const handleFile = useCallback((incoming) => {
    if (!incoming) return;
    if (!incoming.name.toLowerCase().endsWith('.pdf') && incoming.type !== 'application/pdf') {
      setError('Only PDF files are accepted. Please select a valid PDF.');
      return;
    }
    setError(null);
    setResult(null);
    setCompleted([]);
    setCurrentStep(null);
    setStatus('idle');
    setFile(incoming);
  }, []);

  const onInputChange = (e) => handleFile(e.target.files?.[0]);

  const onDragOver = (e) => { e.preventDefault(); setIsDragging(true); };
  const onDragLeave = ()  => setIsDragging(false);
  const onDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    handleFile(e.dataTransfer.files?.[0]);
  };

  const openPicker = () => document.getElementById('upload-portal-input').click();
  const removeFile = () => {
    setFile(null);
    setResult(null);
    setError(null);
    setStatus('idle');
    setCompleted([]);
    setCurrentStep(null);
  };

  // ── Submit ────────────────────────────────────────────────────────────────

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return;

    setStatus('loading');
    setError(null);
    setResult(null);
    setCompleted([]);

    try {
      // Simulate step progression (real steps happen inside API call)
      setCurrentStep('hash');
      await new Promise(r => setTimeout(r, 600));
      setCompleted(['hash']);

      setCurrentStep('ipfs');
      await new Promise(r => setTimeout(r, 400));

      // Real API call (hash + IPFS + anchor)
      const res = await anchorDocument(file);

      setCompleted(['hash', 'ipfs']);
      setCurrentStep('anchor');
      await new Promise(r => setTimeout(r, 300));

      setCompleted(['hash', 'ipfs', 'anchor']);
      setCurrentStep(null);
      setResult(res);
      setStatus('success');
    } catch (err) {
      setError(err.message || 'An unexpected error occurred.');
      setStatus('error');
      setCurrentStep(null);
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────

  const isLoading = status === 'loading';

  return (
    <div className="card animate-fade-in-up">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div style={{
          width: 48, height: 48,
          background: 'linear-gradient(135deg, var(--clr-accent-start), var(--clr-accent-end))',
          borderRadius: 'var(--radius-md)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '1.375rem',
          boxShadow: '0 4px 16px rgba(99,102,241,0.4)',
        }}>
          📤
        </div>
        <div>
          <h2 style={{ marginBottom: 2 }}>Upload Portal</h2>
          <p className="text-sm text-muted" style={{ margin: 0 }}>
            Anchor your NDA, contract, or legal document on Polygon
          </p>
        </div>
        <div className="badge badge-accent" style={{ marginLeft: 'auto' }}>
          SHA-256 + IPFS
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Drop Zone */}
        {!file && (
          <div
            id="upload-drop-zone"
            className={`drop-zone ${isDragging ? 'drag-over' : ''}`}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
            onClick={openPicker}
            role="button"
            tabIndex={0}
            onKeyDown={e => e.key === 'Enter' && openPicker()}
            aria-label="Click or drag a PDF file here to upload"
          >
            <div className="drop-zone-icon">{isDragging ? '🎯' : '📁'}</div>
            <div className="drop-zone-title">
              {isDragging ? 'Drop your PDF here' : 'Drag & drop your document'}
            </div>
            <div className="drop-zone-subtitle mt-2">
              or <span className="text-accent fw-600">browse files</span> — PDF only, up to 50 MB
            </div>
          </div>
        )}

        {/* Hidden file input */}
        <input
          id="upload-portal-input"
          type="file"
          accept="application/pdf,.pdf"
          onChange={onInputChange}
          style={{ display: 'none' }}
        />

        {/* Selected File Pill */}
        {file && !isLoading && status !== 'success' && (
          <FilePill file={file} onRemove={removeFile} />
        )}
        {file && (isLoading || status === 'success') && (
          <FilePill file={file} onRemove={null} />
        )}

        {/* Step Indicator (during loading) */}
        {isLoading && (
          <StepIndicator currentStep={currentStep} completedSteps={completedSteps} />
        )}

        {/* Error Alert */}
        {error && (
          <div className="alert alert-danger mt-6 animate-fade-in">
            <div className="alert-icon">✕</div>
            <div className="alert-content">
              <div className="alert-title">Operation Failed</div>
              <p className="alert-desc">{error}</p>
            </div>
          </div>
        )}

        {/* Success Result */}
        {status === 'success' && result && <SuccessResult result={result} />}

        {/* Submit / Reset Buttons */}
        <div className="divider" />
        {status !== 'success' ? (
          <button
            id="anchor-submit-btn"
            type="submit"
            className="btn btn-primary btn-lg w-full"
            disabled={!file || isLoading}
          >
            {isLoading ? (
              <>
                <span className="spinner" />
                <span>Processing…</span>
              </>
            ) : (
              <>
                <span>⛓</span>
                <span>Anchor Document on Blockchain</span>
              </>
            )}
          </button>
        ) : (
          <button
            id="anchor-reset-btn"
            type="button"
            className="btn btn-secondary btn-lg w-full"
            onClick={removeFile}
          >
            <span>↩</span>
            <span>Anchor Another Document</span>
          </button>
        )}

        {/* Privacy Note */}
        <p className="text-xs text-center mt-4" style={{ color: 'var(--clr-text-muted)' }}>
          🔒 Your document is hashed locally. Only the fingerprint is stored on-chain — never the file contents.
        </p>
      </form>
    </div>
  );
}
