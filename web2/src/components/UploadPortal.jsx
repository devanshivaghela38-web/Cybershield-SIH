import { useState, useCallback } from 'react';
import { anchorDocument, downloadSealedPdf } from '../services/api.js';

const STEPS = [
  { id: 'hash',   label: 'SHA-256 Hash',    icon: '#' },
  { id: 'ipfs',   label: 'IPFS Upload',     icon: '⬡' },
  { id: 'anchor', label: 'Blockchain Anchor', icon: '⛓' },
];

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1048576).toFixed(2)} MB`;
}

function formatDate(isoString) {
  if (!isoString) return '—';
  return new Date(isoString).toLocaleString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

function StepIndicator({ currentStep, completedSteps }) {
  return (
    <div className="steps mt-6">
      {STEPS.map((step) => {
        const done   = completedSteps.includes(step.id);
        const active = currentStep === step.id;
        return (
          <div key={step.id} className={`step ${done ? 'completed' : ''} ${active ? 'active' : ''}`}>
            <div className="step-dot">{done ? '✓' : step.icon}</div>
            <span className="step-label">{step.label}</span>
          </div>
        );
      })}
    </div>
  );
}

function FilePill({ file, onRemove, loading }) {
  return (
    <div className="file-pill animate-fade-in">
      <div className="file-pill-icon">📄</div>
      <div className="flex flex-col" style={{ flex: 1, minWidth: 0, gap: 2 }}>
        <span className="file-pill-name">{file.name}</span>
        <span className="file-pill-size">
          {formatBytes(file.size)}
          {loading && ' · Computing fingerprint…'}
        </span>
      </div>
      {onRemove && !loading && (
        <button className="file-pill-remove" onClick={onRemove} title="Remove">✕</button>
      )}
      {loading && (
        <div className="spinner spinner-light" style={{
          borderColor: 'rgba(245,158,11,0.2)',
          borderTopColor: 'var(--gold-400)',
          marginLeft: 'auto',
        }} />
      )}
    </div>
  );
}

function SuccessResult({ result, file }) {
  return (
    <div className="stagger mt-6">
      {/* ✅ Success Alert */}
      <div className="alert alert-success">
        <div className="alert-icon">✓</div>
        <div className="alert-content">
          <div className="alert-title">Document Anchored Successfully</div>
          <p className="alert-desc">
            Your document's SHA-256 fingerprint has been permanently recorded.
            This serves as immutable, cryptographic proof of existence and authenticity.
          </p>
        </div>
      </div>

      {/* Hash */}
      <div style={{ marginTop: '1.25rem' }}>
        <div className="hash-label">SHA-256 Fingerprint (On-Chain)</div>
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
            <div className="meta-item-value" style={{ color: 'var(--text-gold)' }}>
              #{result.blockNumber.toLocaleString()}
            </div>
          </div>
        )}
        {result.ipfsCid && (
          <div className="meta-item">
            <div className="meta-item-label">IPFS CID</div>
            <div className="meta-item-value mono">
              {result.ipfsCid.slice(0, 14)}…
            </div>
          </div>
        )}
        <div className="meta-item">
          <div className="meta-item-label">Anchored At</div>
          <div className="meta-item-value">{formatDate(result.anchoredDate)}</div>
        </div>
        <div className="meta-item">
          <div className="meta-item-label">File</div>
          <div className="meta-item-value">{result.filename}</div>
        </div>
        <div className="meta-item">
          <div className="meta-item-label">Network</div>
          <div className="meta-item-value" style={{ color: 'var(--violet-400)' }}>
            ⬡ Polygon Amoy
          </div>
        </div>
      </div>

      {/* Explorer Links */}
      <div className="flex gap-3 mt-6" style={{ flexWrap: 'wrap' }}>
        {result.explorerUrl && (
          <a id="polygonscan-link" className="explorer-link"
            href={result.explorerUrl} target="_blank" rel="noopener noreferrer">
            <span>🔍</span><span>View on PolygonScan</span>
            <span style={{ fontSize: '0.7em', opacity: 0.6 }}>↗</span>
          </a>
        )}
        {result.ipfsUrl && (
          <a id="ipfs-link" className="explorer-link"
            href={result.ipfsUrl} target="_blank" rel="noopener noreferrer">
            <span>⬡</span><span>View on IPFS</span>
            <span style={{ fontSize: '0.7em', opacity: 0.6 }}>↗</span>
          </a>
        )}
      </div>

      <button id="download-sealed-btn" type="button"
        className="btn btn-primary btn-lg w-full mt-6" 
        onClick={() => downloadSealedPdf(file, result.hash)}
        style={{
            background: 'linear-gradient(135deg, #10b981, #059669)',
            border: 'none',
            boxShadow: '0 4px 15px rgba(16, 185, 129, 0.3)'
        }}>
        <span>📥</span><span>Download Sealed PDF (with QR)</span>
      </button>
    </div>
  );
}

export default function UploadPortal({ onAnchorSuccess }) {
  const [file, setFile]                = useState(null);
  const [isDragging, setIsDragging]    = useState(false);
  const [status, setStatus]            = useState('idle');
  const [currentStep, setCurrentStep]  = useState(null);
  const [completedSteps, setCompleted] = useState([]);
  const [result, setResult]            = useState(null);
  const [error, setError]              = useState(null);

  // Lifecycle Options
  const [isAmendment, setIsAmendment] = useState(false);
  const [parentHash, setParentHash] = useState('');
  const [hasExpiration, setHasExpiration] = useState(false);
  const [validUntilDate, setValidUntilDate] = useState('');

  const handleFile = useCallback((f) => {
    if (!f) return;
    if (!f.name.toLowerCase().endsWith('.pdf') && f.type !== 'application/pdf') {
      setError('Only PDF files are accepted.');
      return;
    }
    setError(null); setResult(null); setCompleted([]);
    setCurrentStep(null); setStatus('idle'); setFile(f);
  }, []);

  const onInputChange = (e) => handleFile(e.target.files?.[0]);
  const onDragOver    = (e) => { e.preventDefault(); setIsDragging(true); };
  const onDragLeave   = ()  => setIsDragging(false);
  const onDrop        = (e) => { e.preventDefault(); setIsDragging(false); handleFile(e.dataTransfer.files?.[0]); };
  const openPicker    = ()  => document.getElementById('upload-portal-input').click();
  const reset         = ()  => {
    setFile(null); setResult(null); setError(null);
    setStatus('idle'); setCompleted([]); setCurrentStep(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return;
    setStatus('loading'); setError(null); setResult(null); setCompleted([]);

    try {
      setCurrentStep('hash');
      await new Promise(r => setTimeout(r, 700));
      setCompleted(['hash']);
      setCurrentStep('ipfs');
      await new Promise(r => setTimeout(r, 500));
      setCompleted(['hash','ipfs']);
      setCurrentStep('anchor');

      const validUntilTimestamp = hasExpiration && validUntilDate 
        ? Math.floor(new Date(validUntilDate).getTime() / 1000) 
        : 0;

      const res = await anchorDocument(file, isAmendment ? parentHash : "", validUntilTimestamp);

      setCompleted(['hash','ipfs','anchor']);
      setCurrentStep(null);
      setResult(res);
      setStatus('success');
      onAnchorSuccess?.();
    } catch (err) {
      setError(err.message || 'An unexpected error occurred.');
      setStatus('error');
      setCurrentStep(null);
    }
  };

  const isLoading = status === 'loading';

  return (
    <div className="card animate-fade-in-up">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div style={{
          width: 48, height: 48, flexShrink: 0,
          background: 'linear-gradient(135deg, #b45309, #d97706, #f59e0b)',
          borderRadius: 'var(--r-md)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '1.375rem',
          boxShadow: '0 4px 20px rgba(245,158,11,0.4)',
        }}>📤</div>
        <div>
          <h2 style={{ marginBottom: 3 }}>Upload Portal</h2>
          <p className="text-sm text-muted" style={{ margin: 0 }}>
            Anchor your NDA, contract, or agreement on Polygon
          </p>
        </div>
        <div className="badge badge-gold" style={{ marginLeft: 'auto' }}>SHA-256 + IPFS</div>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Drop Zone */}
        {!file && (
          <div
            id="upload-drop-zone"
            className={`drop-zone ${isDragging ? 'drag-over' : ''}`}
            onDragOver={onDragOver} onDragLeave={onDragLeave} onDrop={onDrop}
            onClick={openPicker} role="button" tabIndex={0}
            onKeyDown={e => e.key === 'Enter' && openPicker()}
            aria-label="Drop or click to upload a PDF"
          >
            <div className="drop-zone-icon">{isDragging ? '🎯' : '📁'}</div>
            <div className="drop-zone-title">
              {isDragging ? 'Release to upload' : 'Drag & drop your document'}
            </div>
            <div className="drop-zone-subtitle mt-2">
              or <span className="text-gold fw-700">browse files</span> — PDF only, up to 50 MB
            </div>
          </div>
        )}

        <input id="upload-portal-input" type="file"
          accept="application/pdf,.pdf" onChange={onInputChange} style={{ display: 'none' }} />

        {/* File Pill */}
        {file && status !== 'success' && <FilePill file={file} onRemove={status === 'idle' || status === 'error' ? reset : null} loading={isLoading} />}
        {file && status === 'success'  && <FilePill file={file} onRemove={null} loading={false} />}

        {/* Lifecycle Options (Only visible if file selected and not yet anchored) */}
        {file && status !== 'success' && (
          <div className="lifecycle-options mt-6 animate-fade-in" style={{
            background: 'var(--bg-glass)', border: '1px solid var(--border-light)',
            padding: '1.25rem', borderRadius: 'var(--r-md)'
          }}>
            <div className="flex gap-4" style={{ flexWrap: 'wrap' }}>
              <div style={{ flex: 1, minWidth: '200px' }}>
                <label className="flex items-center gap-2 mb-2 cursor-pointer">
                  <input type="checkbox" checked={isAmendment} onChange={e => setIsAmendment(e.target.checked)} disabled={isLoading} />
                  <span className="fw-600 text-sm">Is this an Amendment?</span>
                </label>
                {isAmendment && (
                  <input type="text" className="input mt-2" placeholder="Parent Document Hash (0x...)"
                    value={parentHash} onChange={e => setParentHash(e.target.value)} disabled={isLoading}
                    style={{ background: 'var(--bg-dark)', width: '100%' }} />
                )}
              </div>
              <div style={{ flex: 1, minWidth: '200px' }}>
                <label className="flex items-center gap-2 mb-2 cursor-pointer">
                  <input type="checkbox" checked={hasExpiration} onChange={e => setHasExpiration(e.target.checked)} disabled={isLoading} />
                  <span className="fw-600 text-sm">Set Expiration Date</span>
                </label>
                {hasExpiration && (
                  <input type="date" className="input mt-2"
                    value={validUntilDate} onChange={e => setValidUntilDate(e.target.value)} disabled={isLoading}
                    style={{ background: 'var(--bg-dark)', width: '100%' }} />
                )}
              </div>
            </div>
          </div>
        )}

        {/* Steps */}
        {isLoading && <StepIndicator currentStep={currentStep} completedSteps={completedSteps} />}

        {/* Error */}
        {error && (
          <div className="alert alert-danger mt-6 animate-fade-in">
            <div className="alert-icon">✕</div>
            <div className="alert-content">
              <div className="alert-title">Operation Failed</div>
              <p className="alert-desc">{error}</p>
            </div>
          </div>
        )}

        {/* Success */}
        {status === 'success' && result && <SuccessResult result={result} file={file} />}

        <div className="divider" />

        {/* Action */}
        {status !== 'success' ? (
          <button id="anchor-submit-btn" type="submit"
            className="btn btn-primary btn-lg w-full" disabled={!file || isLoading}>
            {isLoading
              ? <><span className="spinner" /><span>Processing…</span></>
              : <><span>⛓</span><span>Anchor Document on Blockchain</span></>
            }
          </button>
        ) : (
          <button id="anchor-reset-btn" type="button"
            className="btn btn-secondary btn-lg w-full" onClick={reset}>
            <span>↩</span><span>Anchor Another Document</span>
          </button>
        )}

        <p className="text-xs text-center mt-4" style={{ color: 'var(--text-muted)' }}>
          🔒 Only the cryptographic fingerprint is stored on-chain — never the file contents.
        </p>
      </form>
    </div>
  );
}
