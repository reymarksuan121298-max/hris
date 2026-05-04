import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import { Mail, Lock, LogIn, AlertCircle } from 'lucide-react';
import logo from '../assets/logo.png';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      width: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--bg-primary)',
      padding: '20px',
      position: 'fixed',
      top: 0,
      left: 0,
      zIndex: 1000
    }}>
      {/* Dynamic Background elements */}
      <div style={{
        position: 'absolute',
        top: '10%',
        left: '10%',
        width: '300px',
        height: '300px',
        background: 'rgba(184, 227, 233, 0.1)',
        filter: 'blur(100px)',
        borderRadius: '50%',
        zIndex: -1
      }}></div>
      <div style={{
        position: 'absolute',
        bottom: '10%',
        right: '10%',
        width: '350px',
        height: '350px',
        background: 'rgba(79, 124, 130, 0.1)',
        filter: 'blur(100px)',
        borderRadius: '50%',
        zIndex: -1
      }}></div>

      <div className="glass-panel animate-fade-in" style={{
        width: '100%',
        maxWidth: '420px',
        padding: '40px',
        textAlign: 'center'
      }}>
        <div style={{ marginBottom: '32px' }}>
          <div style={{
            width: '80px',
            height: '80px',
            borderRadius: '16px',
            background: 'rgba(255,255,255,0.03)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px',
            boxShadow: '0 8px 16px rgba(0,0,0,0.3)',
            border: '1px solid var(--glass-border)',
            overflow: 'hidden'
          }}>
            <img src={logo} alt="SGC Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
          <h1 className="text-gradient" style={{ fontSize: '2rem', marginBottom: '8px' }}>SGC Hris</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>HR Management & Operations Gateway</p>
        </div>

        {error && (
          <div style={{
            backgroundColor: 'rgba(255, 123, 114, 0.1)',
            border: '1px solid var(--accent-red)',
            borderRadius: '12px',
            padding: '12px 16px',
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            color: 'var(--accent-red)',
            fontSize: '0.9rem',
            textAlign: 'left'
          }}>
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ textAlign: 'left' }}>
            <label style={{
              display: 'block',
              fontSize: '0.85rem',
              color: 'var(--text-secondary)',
              marginBottom: '8px',
              paddingLeft: '4px'
            }}>Email Address</label>
            <div style={{ position: 'relative' }}>
              <Mail size={18} style={{
                position: 'absolute',
                left: '16px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-secondary)'
              }} />
              <input
                type="email"
                required
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{
                  width: '100%',
                  padding: '14px 16px 14px 48px',
                  borderRadius: '12px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid var(--glass-border)',
                  color: 'var(--text-primary)',
                  fontSize: '1rem',
                  outline: 'none',
                  transition: 'all 0.2s'
                }}
                onFocus={(e) => e.target.style.borderColor = 'var(--accent-blue)'}
                onBlur={(e) => e.target.style.borderColor = 'var(--glass-border)'}
              />
            </div>
          </div>

          <div style={{ textAlign: 'left' }}>
            <label style={{
              display: 'block',
              fontSize: '0.85rem',
              color: 'var(--text-secondary)',
              marginBottom: '8px',
              paddingLeft: '4px'
            }}>Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} style={{
                position: 'absolute',
                left: '16px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-secondary)'
              }} />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{
                  width: '100%',
                  padding: '14px 16px 14px 48px',
                  borderRadius: '12px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid var(--glass-border)',
                  color: 'var(--text-primary)',
                  fontSize: '1rem',
                  outline: 'none',
                  transition: 'all 0.2s'
                }}
                onFocus={(e) => e.target.style.borderColor = 'var(--accent-blue)'}
                onBlur={(e) => e.target.style.borderColor = 'var(--glass-border)'}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              marginTop: '12px',
              padding: '14px',
              borderRadius: '12px',
              background: 'var(--accent-gradient)',
              color: '#fff',
              fontSize: '1rem',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              boxShadow: '0 4px 15px rgba(88, 166, 255, 0.2)',
              transition: 'all 0.3s',
              opacity: loading ? 0.7 : 1,
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? 'Authenticating...' : (
              <>
                <LogIn size={20} />
                <span>Access System</span>
              </>
            )}
          </button>
        </form>

        <div style={{ marginTop: '32px', borderTop: '1px solid var(--glass-border)', paddingTop: '24px' }}>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
            Designed and Developed By: <strong>Edwin Angelo Catequista</strong><br />
            Powered By : SMNR IT Group @ SGC Corporation
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
