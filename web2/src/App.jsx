import { useState, useEffect } from 'react';
import UploadPortal from './components/UploadPortal.jsx';
import VerificationDashboard from './components/VerificationDashboard.jsx';
import { checkHealth } from './services/api.js';
import './index.css';

// ── Header ────────────────────────────────────────────────────────────────────

function Header({ backendOnline }) {
  return (
    <header style={{
      borderBottom: '1px solid var(--clr-border-subtle)',
      padding: '1rem 0',
      marginBottom: '2.5rem',
    }}>
      <div className="container flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div style={{
            width: 44, height: 44,
            background: 'linear-gradient(135deg, var(--clr-accent-start), var(--clr-accent-end))',
            borderRadius: 'var(--radius-md)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.375rem',
            boxShadow: '0 4px 16px rgba(99,102,241,0.4)',
            flexShrink: 0,
          }}>
            🏛
          </div>
          <div>
            <div style={{
              fontWeight: 800,
              fontSize: '1.0625rem',
              background: 'linear-gradient(135deg, var(--clr-text-primary), var(--clr-text-accent))',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              letterSpacing: '-0.01em',
            }}>
              Contract Vault
            </div>
            <div style={{ fontSize: '0.6875rem', color: 'var(--clr-text-muted)', fontWeight: 500 }}>
              Blockchain Document Authentication
            </div>
          </div>
        </div>

        {/* Right badges */}
        <div className="flex items-center gap-3">
          {/* Backend Status */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '0.25rem 0.75rem',
            borderRadius: 'var(--radius-full)',
            background: backendOnline === true
              ? 'rgba(16,185,129,0.1)'
              : backendOnline === false
                ? 'rgba(239,68,68,0.1)'
                : 'rgba(255,255,255,0.04)',
            border: `1px solid ${backendOnline === true
              ? 'rgba(16,185,129,0.3)'
              : backendOnline === false
                ? 'rgba(239,68,68,0.3)'
                : 'var(--clr-border)'}`,
            fontSize: '0.75rem', fontWeight: 600,
            color: backendOnline === true
              ? 'var(--clr-success-text)'
              : backendOnline === false
                ? 'var(--clr-danger-text)'
                : 'var(--clr-text-muted)',
          }}>
            <span style={{
              width: 7, height: 7,
              borderRadius: '50%',
              background: backendOnline === true ? '#10b981'
                : backendOnline === false ? '#ef4444' : '#4a5568',
              animation: backendOnline === true ? 'statusPulse 2s ease-in-out infinite' : 'none',
            }} />
            {backendOnline === null ? 'Connecting…' : backendOnline ? 'Backend Online' : 'Backend Offline'}
          </div>

          {/* Polygon badge */}
          <div className="badge badge-accent" style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <span style={{ fontSize: '0.9em' }}>⬡</span>
            Polygon Amoy
          </div>
        </div>
      </div>

      <style>{`
        @keyframes statusPulse {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.4; }
        }
      `}</style>
    </header>
  );
}

// ── Hero Section ──────────────────────────────────────────────────────────────

function Hero() {
  return (
    <div className="text-center mb-10 animate-fade-in-up">
      <div className="badge badge-accent mb-4" style={{ display: 'inline-flex' }}>
        Anti-Tamper Cryptographic Verification
      </div>
      <h1 style={{ marginBottom: '0.75rem' }}>
        Legal{' '}
        <span style={{
          background: 'linear-gradient(135deg, var(--clr-accent-start), var(--clr-accent-end))',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
        }}>
          Document Vault
        </span>
      </h1>
      <p style={{ maxWidth: 560, margin: '0 auto', fontSize: '1rem' }}>
        Anchor your contracts, NDAs, and legal documents on the Polygon blockchain.
        Prove authenticity and detect tampering — instantly and irrefutably.
      </p>

      {/* Trust Indicators */}
      <div className="flex justify-center gap-8 mt-6" style={{ flexWrap: 'wrap' }}>
        {[
          { icon: '🔐', label: 'SHA-256 Fingerprint' },
          { icon: '⛓',  label: 'Immutable Blockchain' },
          { icon: '⬡',  label: 'IPFS Decentralized Storage' },
          { icon: '⚡',  label: 'Polygon Network' },
        ].map(item => (
          <div key={item.label} className="flex items-center gap-2" style={{
            fontSize: '0.8125rem',
            color: 'var(--clr-text-secondary)',
          }}>
            <span>{item.icon}</span>
            <span>{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Footer ────────────────────────────────────────────────────────────────────

function Footer() {
  return (
    <footer style={{
      borderTop: '1px solid var(--clr-border-subtle)',
      padding: '2rem 0',
      marginTop: '4rem',
    }}>
      <div className="container text-center">
        <p className="text-xs" style={{ color: 'var(--clr-text-muted)' }}>
          Contract Vault — Powered by Polygon · IPFS · SHA-256 ·{' '}
          <a
            href="https://amoy.polygonscan.com"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: 'var(--clr-text-accent)' }}
          >
            PolygonScan
          </a>
          {' '}·{' '}
          <a
            href="https://pinata.cloud"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: 'var(--clr-text-accent)' }}
          >
            Pinata IPFS
          </a>
        </p>
        <p className="text-xs mt-2" style={{ color: 'var(--clr-text-muted)' }}>
          No private keys or documents leave your server. Blockchain mechanics are fully abstracted.
        </p>
      </div>
    </footer>
  );
}

// ── App ────────────────────────────────────────────────────────────────────────

export default function App() {
  const [activeTab, setActiveTab]       = useState('upload');
  const [backendOnline, setBackendOnline] = useState(null); // null=checking, true, false

  // Ping backend health on mount
  useEffect(() => {
    checkHealth().then(setBackendOnline);
  }, []);

  return (
    <>
      <Header backendOnline={backendOnline} />

      <main className="container" style={{ paddingBottom: '2rem' }}>
        <Hero />

        {/* Tab Navigation */}
        <div className="tab-list mb-6">
          <button
            id="tab-upload"
            className={`tab-btn ${activeTab === 'upload' ? 'active' : ''}`}
            onClick={() => setActiveTab('upload')}
          >
            <span>📤</span>
            <span>Upload &amp; Anchor</span>
          </button>
          <button
            id="tab-verify"
            className={`tab-btn ${activeTab === 'verify' ? 'active' : ''}`}
            onClick={() => setActiveTab('verify')}
          >
            <span>🔍</span>
            <span>Verify Authenticity</span>
          </button>
        </div>

        {/* Backend Offline Warning */}
        {backendOnline === false && (
          <div className="alert alert-warn mb-6 animate-fade-in">
            <div className="alert-icon">⚠</div>
            <div className="alert-content">
              <div className="alert-title">Backend Server Offline</div>
              <p className="alert-desc">
                The hashing API is not reachable. Please start the backend:{' '}
                <code style={{ fontFamily: 'var(--font-mono)' }}>
                  cd backend &amp;&amp; node server.js
                </code>
              </p>
            </div>
          </div>
        )}

        {/* Active Tab Content */}
        {activeTab === 'upload' && <UploadPortal />}
        {activeTab === 'verify' && <VerificationDashboard />}
      </main>

      <Footer />
    </>
  );
}
