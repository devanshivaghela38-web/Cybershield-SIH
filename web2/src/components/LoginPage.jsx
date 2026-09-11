import { useState } from 'react';
import { loginUser, signupUser } from '../services/api.js';

export default function LoginPage({ onLoginSuccess, onClose }) {
  // Auth Mode: 'signin' | 'signup'
  const [authMode, setAuthMode] = useState('signin');
  
  // Role: 'user' | 'admin'
  const [role, setRole]         = useState('user');

  // Sign In fields
  const [username, setUsername] = useState('user');
  const [password, setPassword] = useState('user123');

  // Sign Up fields
  const [fullName, setFullName]             = useState('');
  const [signupEmail, setSignupEmail]       = useState('');
  const [signupUsername, setSignupUsername] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  // Switch role during Sign In
  const handleRoleSwitch = (newRole) => {
    setRole(newRole);
    setError(null);
    setSuccessMsg(null);
    if (newRole === 'admin') {
      setUsername('admin');
      setPassword('admin123');
    } else {
      setUsername('user');
      setPassword('user123');
    }
  };

  // Switch between Sign In and Sign Up modes
  const handleModeSwitch = (mode) => {
    setAuthMode(mode);
    setError(null);
    setSuccessMsg(null);
    if (mode === 'signup') {
      setRole('user'); // Force role to user when switching to sign up
    }
  };

  // Handle Sign In submission
  const handleSignInSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await loginUser(username, password, role);
      if (res.success && res.user) {
        onLoginSuccess(res.user);
      }
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Sign Up submission
  const handleSignUpSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (signupPassword !== confirmPassword) {
      setError('Passwords do not match. Please verify and try again.');
      return;
    }

    if (signupPassword.length < 4) {
      setError('Password must be at least 4 characters long.');
      return;
    }

    setLoading(true);
    try {
      const res = await signupUser({
        name: fullName.trim(),
        username: signupUsername.trim(),
        email: signupEmail.trim(),
        password: signupPassword,
        role: 'user', // Force role to user for sign up
      });

      if (res.success && res.user) {
        setSuccessMsg('Account created successfully! Logging you in…');
        setTimeout(() => {
          onLoginSuccess(res.user);
        }, 800);
      }
    } catch (err) {
      setError(err.message || 'Sign up failed.');
    } finally {
      setLoading(false);
    }
  };

  // Quick 1-click demo login
  const handleQuickLogin = async (quickRole) => {
    setLoading(true);
    setError(null);
    const uname = quickRole === 'admin' ? 'admin' : 'user';
    const pass  = quickRole === 'admin' ? 'admin123' : 'user123';
    try {
      const res = await loginUser(uname, pass, quickRole);
      if (res.success && res.user) {
        onLoginSuccess(res.user);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: '100%',
    padding: '0.75rem 1rem',
    background: 'rgba(255, 255, 255, 0.035)',
    border: '1px solid rgba(255, 255, 255, 0.09)',
    borderRadius: 'var(--r-md, 14px)',
    color: 'var(--text-primary)',
    fontSize: '0.875rem',
    outline: 'none',
    boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.3)',
    backdropFilter: 'blur(10px)',
    transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 1000,
      background: 'rgba(2, 4, 8, 0.78)',
      backdropFilter: 'blur(22px)',
      WebkitBackdropFilter: 'blur(22px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1.5rem',
    }}>
      <div className="animate-fade-in-up" style={{
        width: '100%',
        maxWidth: 480,
        background: 'linear-gradient(145deg, rgba(22, 28, 50, 0.75) 0%, rgba(10, 14, 28, 0.82) 100%)',
        backdropFilter: 'blur(36px) saturate(190%)',
        WebkitBackdropFilter: 'blur(36px) saturate(190%)',
        border: '1px solid rgba(255, 255, 255, 0.12)',
        borderRadius: 'var(--r-2xl, 30px)',
        padding: '2.5rem',
        boxShadow: '0 30px 80px rgba(0, 0, 0, 0.75), inset 0 1px 0 rgba(255, 255, 255, 0.2), inset 0 -1px 0 rgba(0, 0, 0, 0.4), 0 0 50px rgba(234, 179, 8, 0.06)',
        position: 'relative',
        maxHeight: '90vh',
        overflowY: 'auto',
      }}>
        {/* Top Crisp Glass Bevel Reflection */}
        <div style={{
          position: 'absolute',
          top: 0, left: '10%', right: '10%',
          height: '1px',
          background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.35), rgba(254, 240, 138, 0.5), rgba(255, 255, 255, 0.35), transparent)',
        }} />

        {/* Close Button */}
        {onClose && (
          <button
            onClick={onClose}
            style={{
              position: 'absolute',
              top: '1.25rem',
              right: '1.25rem',
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '50%',
              width: 32,
              height: 32,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-secondary)',
              fontSize: '1rem',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
            title="Close"
          >
            ✕
          </button>
        )}

        {/* Modal Header */}
        <div className="text-center mb-6">
          <div style={{
            width: 58,
            height: 58,
            margin: '0 auto 1rem',
            background: role === 'admin'
              ? 'linear-gradient(135deg, rgba(168, 85, 247, 0.3), rgba(147, 51, 234, 0.45))'
              : 'linear-gradient(135deg, rgba(250, 204, 21, 0.25), rgba(202, 138, 4, 0.4))',
            border: `1px solid ${role === 'admin' ? 'rgba(192, 132, 252, 0.4)' : 'rgba(254, 240, 138, 0.35)'}`,
            borderRadius: '18px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.75rem',
            boxShadow: role === 'admin'
              ? '0 8px 30px rgba(168, 85, 247, 0.35), inset 0 1px 0 rgba(255,255,255,0.4)'
              : '0 8px 30px rgba(234, 179, 8, 0.3), inset 0 1px 0 rgba(255,255,255,0.4)',
            backdropFilter: 'blur(12px)',
          }}>
            {role === 'admin' ? '👑' : '🏛'}
          </div>

          <h2 style={{ fontSize: '1.45rem', fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>
            {authMode === 'signin'
              ? (role === 'admin' ? 'Admin Portal Sign In' : 'Contract Vault Sign In')
              : 'Create Vault Account'}
          </h2>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: 4 }}>
            {authMode === 'signin'
              ? (role === 'admin' ? 'Access telemetry, contract registry & verification records' : 'Secure document anchoring with tamper-proof verification')
              : 'Join the decentralized anti-tamper contract verification network'}
          </p>
        </div>

        {/* Primary Glass Mode Tabs: Sign In vs Sign Up */}
        <div style={{
          display: 'flex',
          background: 'rgba(255, 255, 255, 0.035)',
          padding: 4,
          borderRadius: 'var(--r-md, 14px)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          boxShadow: 'inset 0 1px 3px rgba(0, 0, 0, 0.2)',
          marginBottom: '1.25rem',
        }}>
          <button
            type="button"
            style={{
              flex: 1,
              padding: '0.65rem 0.5rem',
              borderRadius: '10px',
              border: '1px solid ' + (authMode === 'signin' ? 'rgba(250, 204, 21, 0.35)' : 'transparent'),
              fontWeight: 800,
              fontSize: '0.8125rem',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              background: authMode === 'signin'
                ? 'linear-gradient(135deg, rgba(250, 204, 21, 0.2), rgba(202, 138, 4, 0.1))'
                : 'transparent',
              color: authMode === 'signin' ? '#fef08a' : 'var(--text-secondary)',
              boxShadow: authMode === 'signin' ? '0 4px 18px rgba(234, 179, 8, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.25)' : 'none',
            }}
            onClick={() => handleModeSwitch('signin')}
          >
            🔑 Sign In
          </button>

          <button
            type="button"
            style={{
              flex: 1,
              padding: '0.65rem 0.5rem',
              borderRadius: '10px',
              border: '1px solid ' + (authMode === 'signup' ? 'rgba(250, 204, 21, 0.35)' : 'transparent'),
              fontWeight: 800,
              fontSize: '0.8125rem',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              background: authMode === 'signup'
                ? 'linear-gradient(135deg, rgba(250, 204, 21, 0.2), rgba(202, 138, 4, 0.1))'
                : 'transparent',
              color: authMode === 'signup' ? '#fef08a' : 'var(--text-secondary)',
              boxShadow: authMode === 'signup' ? '0 4px 18px rgba(234, 179, 8, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.25)' : 'none',
            }}
            onClick={() => handleModeSwitch('signup')}
          >
            📝 Create Account
          </button>
        </div>

        {/* Role Selector Tabs (User vs Admin) - Only for Sign In */}
        {authMode === 'signin' && (
          <div style={{
            display: 'flex',
            background: 'rgba(255, 255, 255, 0.02)',
            padding: 3,
            borderRadius: '10px',
            border: '1px solid rgba(255, 255, 255, 0.05)',
            marginBottom: '1.25rem',
          }}>
            <button
              type="button"
              style={{
                flex: 1,
                padding: '0.45rem 0.5rem',
                borderRadius: '8px',
                border: 'none',
                fontWeight: 700,
                fontSize: '0.75rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                background: role === 'user' ? 'rgba(250, 204, 21, 0.12)' : 'transparent',
                color: role === 'user' ? '#fef08a' : 'var(--text-muted)',
                borderBottom: role === 'user' ? '2px solid #facc15' : 'none',
              }}
              onClick={() => handleRoleSwitch('user')}
            >
              👤 Standard User
            </button>

            <button
              type="button"
              style={{
                flex: 1,
                padding: '0.45rem 0.5rem',
                borderRadius: '8px',
                border: 'none',
                fontWeight: 700,
                fontSize: '0.75rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                background: role === 'admin' ? 'rgba(168, 85, 247, 0.15)' : 'transparent',
                color: role === 'admin' ? '#c084fc' : 'var(--text-muted)',
                borderBottom: role === 'admin' ? '2px solid #a855f7' : 'none',
              }}
              onClick={() => handleRoleSwitch('admin')}
            >
              👑 Administrator
            </button>
          </div>
        )}

        {/* Alert Messages */}
        {error && (
          <div className="alert alert-warn mb-4" style={{ padding: '0.75rem 1rem', borderRadius: '12px' }}>
            <div className="alert-icon">⚠</div>
            <div className="alert-content">
              <div className="alert-title" style={{ fontSize: '0.8125rem' }}>Authentication Notice</div>
              <p className="alert-desc" style={{ fontSize: '0.75rem' }}>{error}</p>
            </div>
          </div>
        )}

        {successMsg && (
          <div className="alert alert-success mb-4" style={{ padding: '0.75rem 1rem', borderRadius: '12px' }}>
            <div className="alert-icon">✓</div>
            <div className="alert-content">
              <p className="alert-desc" style={{ fontSize: '0.8125rem', fontWeight: 600 }}>{successMsg}</p>
            </div>
          </div>
        )}

        {/* ── FORM 1: SIGN IN ──────────────────────────────────────────────── */}
        {authMode === 'signin' && (
          <form onSubmit={handleSignInSubmit} className="flex flex-col gap-3.5">
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 6 }}>
                Username / Email
              </label>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder={role === 'admin' ? 'admin' : 'user'}
                style={inputStyle}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 6 }}>
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                style={inputStyle}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-gold w-full mt-2"
              style={{
                background: role === 'admin'
                  ? 'linear-gradient(135deg, rgba(168, 85, 247, 0.9), rgba(124, 58, 237, 0.95))'
                  : undefined,
                borderColor: role === 'admin' ? 'rgba(216, 180, 254, 0.3)' : undefined,
                color: role === 'admin' ? '#ffffff' : '#0f0a00',
                padding: '0.85rem',
                borderRadius: '14px',
                fontSize: '0.9375rem',
                boxShadow: role === 'admin'
                  ? '0 6px 25px rgba(147, 51, 234, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.3)'
                  : undefined,
              }}
            >
              {loading ? 'Authenticating…' : role === 'admin' ? '🔐 Sign In to Admin Dashboard' : '🔑 Sign In to Vault'}
            </button>
          </form>
        )}

        {/* ── FORM 2: SIGN UP (CREATE ACCOUNT) ──────────────────────────────── */}
        {authMode === 'signup' && (
          <form onSubmit={handleSignUpSubmit} className="flex flex-col gap-3">
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 5 }}>
                Full Name
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Alex Morgan"
                style={inputStyle}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 5 }}>
                  Username
                </label>
                <input
                  type="text"
                  required
                  value={signupUsername}
                  onChange={(e) => setSignupUsername(e.target.value)}
                  placeholder="e.g. alex24"
                  style={inputStyle}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 5 }}>
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={signupEmail}
                  onChange={(e) => setSignupEmail(e.target.value)}
                  placeholder="alex@company.com"
                  style={inputStyle}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 5 }}>
                  Password
                </label>
                <input
                  type="password"
                  required
                  value={signupPassword}
                  onChange={(e) => setSignupPassword(e.target.value)}
                  placeholder="••••••••"
                  style={inputStyle}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 5 }}>
                  Confirm Password
                </label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  style={inputStyle}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-gold w-full mt-2"
              style={{
                padding: '0.85rem',
                borderRadius: '14px',
                fontSize: '0.9375rem',
              }}
            >
              {loading ? 'Creating Account…' : '✨ Register Vault Account'}
            </button>
          </form>
        )}

        {/* Footer Toggle Text */}
        <div style={{ textAlign: 'center', marginTop: '1.25rem', fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
          {authMode === 'signin' ? (
            <span>
              Don't have an account yet?{' '}
              <button
                type="button"
                onClick={() => handleModeSwitch('signup')}
                style={{ background: 'transparent', border: 'none', color: '#fde047', fontWeight: 700, cursor: 'pointer', padding: 0 }}
              >
                Sign up here
              </button>
            </span>
          ) : (
            <span>
              Already registered?{' '}
              <button
                type="button"
                onClick={() => handleModeSwitch('signin')}
                style={{ background: 'transparent', border: 'none', color: '#fde047', fontWeight: 700, cursor: 'pointer', padding: 0 }}
              >
                Sign in here
              </button>
            </span>
          )}
        </div>

        {/* 1-Click Quick Demo Login Shortcuts */}
        <div style={{
          marginTop: '1.5rem',
          paddingTop: '1.25rem',
          borderTop: '1px dashed rgba(255, 255, 255, 0.1)',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>
            ⚡ 1-Click Instant Demo Access
          </div>
          <div className="flex gap-2.5">
            <button
              type="button"
              onClick={() => handleQuickLogin('user')}
              style={{
                flex: 1,
                padding: '0.55rem 0.75rem',
                borderRadius: '10px',
                background: 'rgba(250, 204, 21, 0.08)',
                border: '1px solid rgba(250, 204, 21, 0.25)',
                color: '#fef08a',
                fontSize: '0.78125rem',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                backdropFilter: 'blur(8px)',
                boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.15)',
              }}
            >
              👤 Quick User
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin('admin')}
              style={{
                flex: 1,
                padding: '0.55rem 0.75rem',
                borderRadius: '10px',
                background: 'rgba(168, 85, 247, 0.12)',
                border: '1px solid rgba(168, 85, 247, 0.3)',
                color: '#d8b4fe',
                fontSize: '0.78125rem',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                backdropFilter: 'blur(8px)',
                boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.15)',
              }}
            >
              👑 Quick Admin
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
