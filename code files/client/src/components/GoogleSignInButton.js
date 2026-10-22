import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import { X, UserCheck, Plus, ArrowRight, Loader2 } from 'lucide-react';

const GoogleIcon = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
    <path
      fill="#4285F4"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill="#34A853"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="#FBBC05"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
    />
    <path
      fill="#EA4335"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
    />
  </svg>
);

const GoogleSignInButton = ({
  onSuccess,
  buttonText = 'Continue with Google',
  style = {},
  className = ''
}) => {
  const { googleLogin } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [customEmail, setCustomEmail] = useState('');
  const [customName, setCustomName] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);

  const handleSelectAccount = async (account) => {
    setLoading(true);
    try {
      const data = await googleLogin(account);
      toast.success(`Signed in with Google as ${data.user.name}!`);
      setIsModalOpen(false);
      if (onSuccess) onSuccess(data);
    } catch (err) {
      const msg = err.response?.data?.message || 'Google sign in failed.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleCustomSubmit = async (e) => {
    e.preventDefault();
    if (!customEmail || !customEmail.includes('@')) {
      toast.warn('Please enter a valid Google email address.');
      return;
    }
    await handleSelectAccount({
      email: customEmail.trim(),
      name: customName.trim() || customEmail.split('@')[0],
      avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(customName || customEmail)}`,
      googleId: 'g_' + Date.now()
    });
  };

  const defaultAccounts = [
    {
      name: 'Owais Ahmad Rahmani',
      email: 'owaisarahmani@gmail.com',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
      googleId: 'google_owais_primary'
    },
    {
      name: 'Cinema Cinephile',
      email: 'cinephile.viewer@gmail.com',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
      googleId: 'google_cinephile_demo'
    }
  ];

  return (
    <>
      <button
        type="button"
        onClick={() => setIsModalOpen(true)}
        disabled={loading}
        className={`google-signin-btn ${className}`}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.65rem',
          width: '100%',
          padding: '0.72rem 1.2rem',
          borderRadius: '8px',
          background: '#ffffff',
          color: '#1f2937',
          fontWeight: 600,
          fontSize: '0.88rem',
          border: '1px solid #e5e7eb',
          cursor: 'pointer',
          transition: 'all 0.15s ease',
          boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
          ...style
        }}
      >
        <GoogleIcon />
        <span>{buttonText}</span>
      </button>

      {/* Google Account Chooser Modal */}
      {isModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.82)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10000,
            padding: '1rem'
          }}
          onClick={() => !loading && setIsModalOpen(false)}
        >
          <div
            style={{
              background: '#ffffff',
              color: '#1f2937',
              borderRadius: '16px',
              maxWidth: '420px',
              width: '100%',
              padding: '1.75rem',
              boxShadow: '0 25px 60px rgba(0, 0, 0, 0.4)',
              position: 'relative'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setIsModalOpen(false)}
              disabled={loading}
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                background: '#f3f4f6',
                border: 'none',
                color: '#6b7280',
                borderRadius: '50%',
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer'
              }}
            >
              <X size={16} />
            </button>

            {/* Google Header */}
            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
              <div style={{ display: 'inline-flex', marginBottom: '0.5rem' }}>
                <GoogleIcon size={32} />
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#111827', margin: 0 }}>
                Sign in with Google
              </h3>
              <p style={{ fontSize: '0.82rem', color: '#6b7280', marginTop: '0.25rem' }}>
                Choose an account to continue to <strong>iMovies Cinema</strong>
              </p>
            </div>

            {loading ? (
              <div style={{ textAlign: 'center', padding: '2rem 0' }}>
                <Loader2 size={32} color="#4285F4" style={{ animation: 'spin 1s linear infinite', margin: 'auto' }} />
                <p style={{ fontSize: '0.85rem', color: '#6b7280', marginTop: '0.8rem' }}>Authenticating via Google...</p>
              </div>
            ) : (
              <div>
                {/* Account list */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem' }}>
                  {defaultAccounts.map((acc, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSelectAccount(acc)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.85rem',
                        padding: '0.75rem',
                        borderRadius: '10px',
                        border: '1px solid #e5e7eb',
                        background: '#f9fafb',
                        cursor: 'pointer',
                        textAlign: 'left',
                        transition: 'background 0.15s, border-color 0.15s'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = '#f3f4f6';
                        e.currentTarget.style.borderColor = '#4285F4';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = '#f9fafb';
                        e.currentTarget.style.borderColor = '#e5e7eb';
                      }}
                    >
                      <img
                        src={acc.avatar}
                        alt={acc.name}
                        style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }}
                      />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#111827' }}>{acc.name}</div>
                        <div style={{ fontSize: '0.78rem', color: '#6b7280', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {acc.email}
                        </div>
                      </div>
                      <UserCheck size={16} color="#4285F4" />
                    </button>
                  ))}
                </div>

                {/* Custom Google Account Section */}
                {!showCustomInput ? (
                  <button
                    type="button"
                    onClick={() => setShowCustomInput(true)}
                    style={{
                      width: '100%',
                      padding: '0.65rem',
                      background: 'none',
                      border: '1px dashed #d1d5db',
                      borderRadius: '8px',
                      color: '#4285F4',
                      fontSize: '0.82rem',
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.4rem',
                      cursor: 'pointer'
                    }}
                  >
                    <Plus size={15} /> Use another Google Account
                  </button>
                ) : (
                  <form onSubmit={handleCustomSubmit} style={{ marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                    <input
                      type="text"
                      placeholder="Your Full Name (optional)"
                      value={customName}
                      onChange={(e) => setCustomName(e.target.value)}
                      style={{
                        padding: '0.6rem',
                        border: '1px solid #d1d5db',
                        borderRadius: '6px',
                        fontSize: '0.85rem'
                      }}
                    />
                    <input
                      type="email"
                      required
                      placeholder="your.email@gmail.com"
                      value={customEmail}
                      onChange={(e) => setCustomEmail(e.target.value)}
                      style={{
                        padding: '0.6rem',
                        border: '1px solid #d1d5db',
                        borderRadius: '6px',
                        fontSize: '0.85rem'
                      }}
                    />
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button
                        type="button"
                        onClick={() => setShowCustomInput(false)}
                        style={{
                          flex: 1,
                          padding: '0.6rem',
                          background: '#f3f4f6',
                          border: 'none',
                          borderRadius: '6px',
                          fontSize: '0.82rem',
                          cursor: 'pointer'
                        }}
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        style={{
                          flex: 2,
                          padding: '0.6rem',
                          background: '#4285F4',
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          fontSize: '0.82rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '0.35rem'
                        }}
                      >
                        Continue with this account <ArrowRight size={14} />
                      </button>
                    </div>
                  </form>
                )}

                <p style={{ fontSize: '0.7rem', color: '#9ca3af', textAlign: 'center', marginTop: '1.25rem', marginBottom: 0 }}>
                  To continue, Google will share your name, email address, and profile picture with iMovies.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default GoogleSignInButton;
