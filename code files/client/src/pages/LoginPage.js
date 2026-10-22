import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import { Film, Lock, Mail, User, ShieldCheck, Ticket } from 'lucide-react';
import GoogleSignInButton from '../components/GoogleSignInButton';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const redirectAfterLogin = (userRole) => {
    const from = location.state?.from;
    if (from) {
      navigate(from, { state: location.state, replace: true });
    } else if (userRole === 'admin') {
      navigate('/admin', { replace: true });
    } else {
      navigate('/', { replace: true });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.warn('Please enter email and password');
      return;
    }

    setLoading(true);
    try {
      const data = await login(email, password);
      toast.success(`Welcome back, ${data.user.name}!`);
      redirectAfterLogin(data.user.role);
    } catch (err) {
      const msg = err.response?.data?.message || 'Invalid email or password.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setLoading(true);
    try {
      const data = await login(demoEmail, demoPassword);
      toast.success(`Logged in as ${data.user.role === 'admin' ? 'Administrator' : 'Customer'}!`);
      redirectAfterLogin(data.user.role);
    } catch (err) {
      toast.error('Quick login failed. Make sure DB is seeded (npm run seed).');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh', padding: '2rem 1.5rem' }}>
      <div
        style={{
          background: '#121826',
          border: '1px solid var(--border-subtle)',
          borderRadius: '16px',
          width: '100%',
          maxWidth: '440px',
          padding: '2.25rem',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.6)'
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '1.6rem', fontWeight: 900 }}>
            <span className="brand-badge">🎬</span>
            <span>iMovies</span>
          </div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginTop: '0.6rem' }}>Sign In to Your Account</h2>
          <p style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Access your movie tickets and personalized bookings</p>
          {location.state?.from && (
            <div
              style={{
                marginTop: '0.75rem',
                background: 'rgba(245, 158, 11, 0.15)',
                border: '1px solid rgba(245, 158, 11, 0.3)',
                borderRadius: '8px',
                padding: '0.5rem 0.75rem',
                fontSize: '0.78rem',
                color: '#fbbf24',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                textAlign: 'left'
              }}
            >
              <Ticket size={15} flexShrink={0} />
              <span>You will be returned immediately to your cinema booking with your selected seats intact!</span>
            </div>
          )}
        </div>

        {/* Quick Demo Credentials for Mentors/Evaluators */}
        <div
          style={{
            background: '#182032',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '10px',
            padding: '0.85rem',
            marginBottom: '1.5rem',
            fontSize: '0.8rem'
          }}
        >
          <div style={{ color: '#fbbf24', fontWeight: 700, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <span>⚡ Instant Demo Credentials</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
            <button
              type="button"
              onClick={() => handleQuickLogin('user@imovies.com', 'user123')}
              className="btn-secondary"
              style={{ padding: '0.45rem', fontSize: '0.78rem', width: '100%' }}
            >
              <User size={13} /> Demo User
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin('admin@imovies.com', 'admin123')}
              className="btn-secondary"
              style={{ padding: '0.45rem', fontSize: '0.78rem', width: '100%', borderColor: 'rgba(251, 191, 36, 0.4)', color: '#fbbf24' }}
            >
              <ShieldCheck size={13} /> Demo Admin
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ fontSize: '0.82rem', fontWeight: 600, color: '#cbd5e1', display: 'block', marginBottom: '0.35rem' }}>
              Email Address
            </label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <Mail size={16} style={{ position: 'absolute', left: '0.85rem', color: '#64748b' }} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                style={{
                  width: '100%',
                  background: '#182032',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px',
                  padding: '0.75rem 0.85rem 0.75rem 2.4rem',
                  color: 'white',
                  fontSize: '0.9rem',
                  outline: 'none'
                }}
              />
            </div>
          </div>

          <div>
            <label style={{ fontSize: '0.82rem', fontWeight: 600, color: '#cbd5e1', display: 'block', marginBottom: '0.35rem' }}>
              Password
            </label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <Lock size={16} style={{ position: 'absolute', left: '0.85rem', color: '#64748b' }} />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                style={{
                  width: '100%',
                  background: '#182032',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px',
                  padding: '0.75rem 0.85rem 0.75rem 2.4rem',
                  color: 'white',
                  fontSize: '0.9rem',
                  outline: 'none'
                }}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary"
            style={{ width: '100%', padding: '0.8rem', marginTop: '0.5rem' }}
          >
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>

          {/* Google Sign In Divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', margin: '1.25rem 0' }}>
            <div style={{ flex: 1, height: '1px', background: 'rgba(255, 255, 255, 0.1)' }} />
            <span style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>or continue with</span>
            <div style={{ flex: 1, height: '1px', background: 'rgba(255, 255, 255, 0.1)' }} />
          </div>

          <GoogleSignInButton
            buttonText="Sign in with Google"
            onSuccess={(data) => redirectAfterLogin(data.user.role)}
          />
        </form>

        <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.85rem', color: '#94a3b8' }}>
          Don't have an account?{' '}
          <Link to="/register" state={location.state} style={{ color: '#e50914', fontWeight: 600 }}>
            Create Account
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
