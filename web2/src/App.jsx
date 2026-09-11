import { useState, useEffect } from 'react';
import UploadPortal from './components/UploadPortal.jsx';
import VerificationDashboard from './components/VerificationDashboard.jsx';
import AdminDashboard from './components/AdminDashboard.jsx';
import LoginPage from './components/LoginPage.jsx';
import { checkHealth } from './services/api.js';
import './index.css';

// ── Header ────────────────────────────────────────────────────────────────────
function Header({ backendOnline, user, onOpenLogin, onLogout }) {
  return (
    <header style={{
      borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
      padding: '1.1rem 0',
      marginBottom: '2.5rem',
      backdropFilter: 'blur(28px) saturate(190%)',
      WebkitBackdropFilter: 'blur(28px) saturate(190%)',
      position: 'sticky',
      top: 0,
      zIndex: 50,
      background: 'rgba(8, 12, 24, 0.65)',
      boxShadow: '0 4px 30px rgba(0, 0, 0, 0.5), inset 0 -1px 0 rgba(255, 255, 255, 0.04)',
    }}>
      <div className="container flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div style={{
            width: 44, height: 44, flexShrink: 0,
            background: 'linear-gradient(135deg, rgba(250, 204, 21, 0.25), rgba(202, 138, 4, 0.45))',
            border: '1px solid rgba(254, 240, 138, 0.35)',
            borderRadius: 'var(--r-md)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.375rem',
            boxShadow: '0 4px 20px rgba(234, 179, 8, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.35)',
            backdropFilter: 'blur(8px)',
          }}>🏛</div>
          <div>
            <div style={{
              fontWeight: 800, fontSize: '1.0625rem',
              letterSpacing: '-0.02em', lineHeight: 1.1,
            }}>
              <span style={{ color: 'var(--text-primary)' }}>Contract </span>
              <span className="text-gold-gradient">Vault</span>
            </div>
            <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', fontWeight: 500 }}>
              Blockchain Document Authentication
            </div>
          </div>
        </div>

        {/* Right controls & badges */}
        <div className="flex items-center gap-3">
          <div style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '0.35rem 0.85rem',
            borderRadius: 'var(--r-full)',
            background: backendOnline === true
              ? 'rgba(16,185,129,0.08)' : backendOnline === false
              ? 'rgba(239,68,68,0.08)' : 'rgba(255,255,255,0.04)',
            border: `1px solid ${backendOnline === true
              ? 'rgba(16,185,129,0.25)' : backendOnline === false
              ? 'rgba(239,68,68,0.25)' : 'rgba(255,255,255,0.06)'}`,
            fontSize: '0.75rem', fontWeight: 700,
            color: backendOnline === true ? 'var(--success-text)'
              : backendOnline === false ? 'var(--danger-text)' : 'var(--text-muted)',
            backdropFilter: 'blur(10px)',
          }}>
            <span style={{
              width: 7, height: 7, borderRadius: '50%', flexShrink: 0,
              background: backendOnline === true ? '#10b981'
                : backendOnline === false ? '#ef4444' : '#3d4460',
              animation: backendOnline === true ? 'pulse 2s ease-in-out infinite' : 'none',
            }}/>
            {backendOnline === null ? 'Connecting…' : backendOnline ? 'Live' : 'Offline'}
          </div>

          <div className="badge badge-demo">⬡ Polygon Amoy</div>

          {/* User Account / Auth Control */}
          {user ? (
            <div className="flex items-center gap-2" style={{
              padding: '0.28rem 0.75rem 0.28rem 0.9rem',
              background: user.role === 'admin'
                ? 'rgba(168, 85, 247, 0.15)'
                : 'rgba(250, 204, 21, 0.1)',
              border: `1px solid ${user.role === 'admin' ? 'rgba(192, 132, 252, 0.35)' : 'rgba(254, 240, 138, 0.3)'}`,
              borderRadius: 'var(--r-full, 9999px)',
              backdropFilter: 'blur(12px)',
              boxShadow: '0 4px 15px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.15)',
            }}>
              <span style={{ fontSize: '0.875rem' }}>{user.avatar || (user.role === 'admin' ? '👑' : '👤')}</span>
              <span style={{
                fontSize: '0.78125rem',
                fontWeight: 700,
                color: user.role === 'admin' ? '#d8b4fe' : 'var(--text-gold)',
              }}>
                {user.name}
              </span>
              <button
                onClick={onLogout}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-secondary)',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  marginLeft: 4,
                  cursor: 'pointer',
                  transition: 'color 0.2s ease',
                }}
                title="Sign Out"
              >
                (Logout)
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenLogin}
              className="btn btn-gold"
              style={{
                fontSize: '0.78125rem',
                padding: '0.45rem 1rem',
                borderRadius: 'var(--r-full, 9999px)',
              }}
            >
              🔑 Sign In
            </button>
          )}
        </div>
      </div>

      <style>{`
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }
      `}</style>
    </header>
  );
}

// ── Trust Strip ───────────────────────────────────────────────────────────────
function TrustStrip() {
  const items = [
    { icon: '🔐', label: 'SHA-256 Fingerprint' },
    { icon: '⛓',  label: 'Immutable Record'    },
    { icon: '⬡',  label: 'IPFS Storage'         },
    { icon: '⚡',  label: 'Polygon Network'      },
    { icon: '🔒',  label: 'Zero Key Exposure'   },
  ];
  return (
    <div className="flex justify-center gap-8 mt-8" style={{ flexWrap: 'wrap' }}>
      {items.map(item => (
        <div key={item.label} className="flex items-center gap-2" style={{
          fontSize: '0.8125rem', color: 'var(--text-secondary)', fontWeight: 500,
          background: 'rgba(255, 255, 255, 0.025)',
          padding: '0.35rem 0.75rem',
          borderRadius: 'var(--r-full)',
          border: '1px solid rgba(255, 255, 255, 0.05)',
          backdropFilter: 'blur(8px)',
        }}>
          <span style={{ fontSize: '0.95rem' }}>{item.icon}</span>
          <span>{item.label}</span>
        </div>
      ))}
    </div>
  );
}

// ── Hero ──────────────────────────────────────────────────────────────────────
function Hero() {
  return (
    <div className="text-center animate-fade-in-up" style={{ marginBottom: '2.5rem' }}>
      <div style={{ marginBottom: '1rem' }}>
        <span className="badge badge-gold">
          ✦ Anti-Tamper Cryptographic Verification
        </span>
      </div>

      <h1 style={{ marginBottom: '1rem' }}>
        Legal{' '}
        <span className="shimmer-text">Document Vault</span>
      </h1>

      <p style={{
        maxWidth: 540, margin: '0 auto',
        fontSize: '1.0625rem', lineHeight: 1.7,
        color: 'var(--text-secondary)',
      }}>
        Anchor your contracts, NDAs, and agreements on the Polygon blockchain.
        Prove authenticity and detect tampering — <strong style={{ color: 'var(--text-primary)', fontWeight: 700 }}>instantly and irrefutably.</strong>
      </p>

      <TrustStrip />
    </div>
  );
}

// ── Stats Bar (Frosted Glass Panel) ───────────────────────────────────────────
function StatsBar({ anchored }) {
  return (
    <div style={{
      display: 'flex',
      background: 'rgba(12, 16, 28, 0.55)',
      backdropFilter: 'blur(28px) saturate(180%)',
      WebkitBackdropFilter: 'blur(28px) saturate(180%)',
      borderRadius: 'var(--r-xl, 24px)',
      overflow: 'hidden',
      marginBottom: '1.75rem',
      border: '1px solid rgba(255, 255, 255, 0.08)',
      boxShadow: '0 16px 40px rgba(0, 0, 0, 0.45), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
    }}>
      {[
        { label: 'Documents Anchored', value: anchored, icon: '📋' },
        { label: 'Blockchain Network',  value: 'Polygon Amoy', icon: '⬡' },
        { label: 'Hash Algorithm',      value: 'SHA-256',       icon: '🔐' },
        { label: 'Storage Protocol',    value: 'IPFS / Pinata', icon: '☁' },
      ].map((stat, i) => (
        <div key={i} style={{
          flex: 1,
          background: 'transparent',
          padding: '0.9rem 1rem',
          textAlign: 'center',
          borderRight: i < 3 ? '1px solid rgba(255, 255, 255, 0.06)' : 'none',
        }}>
          <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', fontWeight: 600,
            textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>
            {stat.icon} {stat.label}
          </div>
          <div style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-gold)' }}>
            {stat.value}
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Footer ────────────────────────────────────────────────────────────────────
function Footer() {
  return (
    <footer style={{
      borderTop: '1px solid rgba(245,158,11,0.06)',
      padding: '2rem 0', marginTop: '4rem',
    }}>
      <div className="container text-center">
        <div style={{ marginBottom: '0.5rem' }}>
          <span className="shimmer-text" style={{ fontSize: '0.875rem', fontWeight: 700 }}>
            Contract Vault
          </span>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            {' '}— Blockchain Legal Authentication
          </span>
        </div>
        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
          Powered by{' '}
          <a href="https://polygon.technology" target="_blank" rel="noopener noreferrer">Polygon</a>
          {' · '}
          <a href="https://ipfs.tech" target="_blank" rel="noopener noreferrer">IPFS</a>
          {' · '}
          <a href="https://pinata.cloud" target="_blank" rel="noopener noreferrer">Pinata</a>
          {' · '}
          <a href="https://amoy.polygonscan.com" target="_blank" rel="noopener noreferrer">PolygonScan</a>
        </p>
        <p className="text-xs mt-2" style={{ color: 'var(--text-muted)' }}>
          🔒 No private keys or documents leave the server. All blockchain mechanics fully abstracted.
        </p>
      </div>
    </footer>
  );
}

// ── App ────────────────────────────────────────────────────────────────────────
export default function App() {
  const [activeTab,     setActiveTab]     = useState('upload');
  const [backendOnline, setBackendOnline] = useState(null);
  const [anchored,      setAnchored]      = useState(0);
  const [user,          setUser]          = useState(null);
  const [showLogin,     setShowLogin]     = useState(false);

  useEffect(() => {
    checkHealth().then((ok) => {
      setBackendOnline(ok);
    });
    // Poll health every 30s
    const id = setInterval(() => {
      checkHealth().then(setBackendOnline);
    }, 30000);
    return () => clearInterval(id);
  }, []);

  // Refresh anchor count from health endpoint
  useEffect(() => {
    const fetchCount = () =>
      fetch('/api/health').then(r => r.json())
        .then(d => setAnchored(d.anchored ?? 0))
        .catch(() => {});
    fetchCount();
    const id = setInterval(fetchCount, 5000);
    return () => clearInterval(id);
  }, []);

  const handleLoginSuccess = (userData) => {
    setUser(userData);
    setShowLogin(false);
    if (userData.role === 'admin') {
      setActiveTab('admin');
    }
  };

  const handleLogout = () => {
    setUser(null);
    if (activeTab === 'admin') {
      setActiveTab('upload');
    }
  };

  const handleSelectAdminTab = () => {
    if (!user || user.role !== 'admin') {
      setShowLogin(true);
    } else {
      setActiveTab('admin');
    }
  };

  return (
    <>
      {/* Background layers */}
      <div className="aurora-bg">
        <div className="aurora-orb aurora-orb-1" />
        <div className="aurora-orb aurora-orb-2" />
        <div className="aurora-orb aurora-orb-3" />
      </div>
      <div className="grid-overlay" />
      <div className="noise-overlay" />

      {/* Header with auth status */}
      <Header
        backendOnline={backendOnline}
        user={user}
        onOpenLogin={() => setShowLogin(true)}
        onLogout={handleLogout}
      />

      <main className="container" style={{ paddingBottom: '2rem' }}>
        <Hero />

        {/* Stats Bar */}
        <StatsBar anchored={anchored} />

        {/* Main App Content - Only visible if logged in */}
        {user ? (
          <>
            {/* Navigation Tabs */}
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

              <button
                id="tab-admin"
                className={`tab-btn ${activeTab === 'admin' ? 'active' : ''}`}
                onClick={handleSelectAdminTab}
                style={{
                  borderColor: activeTab === 'admin' ? 'rgba(139, 92, 246, 0.4)' : undefined,
                }}
              >
                <span>👑</span>
                <span>Admin Dashboard</span>
                {user.role === 'admin' && (
                  <span style={{
                    fontSize: '0.65rem',
                    padding: '0.1rem 0.4rem',
                    borderRadius: '9999px',
                    background: 'rgba(139, 92, 246, 0.2)',
                    color: '#c084fc',
                    marginLeft: 4,
                  }}>Active</span>
                )}
              </button>
            </div>

            {/* Backend Offline Warning */}
            {backendOnline === false && (
              <div className="alert alert-warn mb-6 animate-fade-in">
                <div className="alert-icon">⚠</div>
                <div className="alert-content">
                  <div className="alert-title">Backend Server Offline</div>
                  <p className="alert-desc">
                    Start the server:{' '}
                    <code style={{ fontFamily: 'var(--font-mono)', color: 'var(--warn-text)' }}>
                      cd backend &amp;&amp; node server.js
                    </code>
                  </p>
                </div>
              </div>
            )}

            {/* Main Tab Content */}
            {activeTab === 'upload' && (
              <UploadPortal onAnchorSuccess={() => setAnchored(a => a + 1)} />
            )}
            {activeTab === 'verify' && <VerificationDashboard />}
            {activeTab === 'admin' && user.role === 'admin' && (
              <AdminDashboard user={user} />
            )}
          </>
        ) : (
          <div className="text-center mt-8 mb-12 animate-fade-in-up" style={{
            background: 'rgba(255, 255, 255, 0.02)',
            border: '1px solid rgba(255, 255, 255, 0.05)',
            borderRadius: 'var(--r-2xl)',
            padding: '4rem 2rem',
            backdropFilter: 'blur(12px)',
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔒</div>
            <h2 style={{ fontSize: '1.75rem', color: 'var(--text-primary)', marginBottom: '1rem', fontWeight: 800 }}>
              Authentication Required
            </h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '2.5rem', maxWidth: 400, margin: '0 auto 2.5rem auto', lineHeight: 1.6 }}>
              Please sign in or create a Vault Account to upload contracts, verify documents, and access the dashboard.
            </p>
            <button
              onClick={() => setShowLogin(true)}
              className="btn btn-gold"
              style={{
                fontSize: '1rem',
                padding: '0.85rem 2.5rem',
                borderRadius: 'var(--r-full, 9999px)',
                boxShadow: '0 8px 25px rgba(234, 179, 8, 0.25)',
              }}
            >
              🔑 Sign In to Vault
            </button>
          </div>
        )}
      </main>

      {/* Login Modal */}
      {showLogin && (
        <LoginPage
          onLoginSuccess={handleLoginSuccess}
          onClose={() => setShowLogin(false)}
        />
      )}

      <Footer />
    </>
  );
}
