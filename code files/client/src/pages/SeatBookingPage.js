import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import io from 'socket.io-client';
import { toast } from 'react-toastify';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import SeatMap from '../components/SeatMap';
import BookingModal from '../components/BookingModal';
import GoogleSignInButton from '../components/GoogleSignInButton';
import { ArrowLeft, Clock, ShieldAlert, CheckCircle2, X, Lock, Mail, User, Sparkles, LogIn } from 'lucide-react';

const SeatBookingPage = () => {
  const { showId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, user, login, register } = useAuth();

  const [show, setShow] = useState(null);
  const [seats, setSeats] = useState([]);
  const [selectedSeats, setSelectedSeats] = useState(location.state?.selectedSeats || []);
  const [seatPriceMap, setSeatPriceMap] = useState(location.state?.seatPriceMap || {});
  const [loading, setLoading] = useState(true);

  // In-Place Auth Modal state
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState('login');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authName, setAuthName] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const autoCheckoutTriggeredRef = useRef(false);

  // 5-minute hold timer
  const [lockExpiresAt, setLockExpiresAt] = useState(null);
  const [timeLeftSeconds, setTimeLeftSeconds] = useState(null);

  // Modal & Payment states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const socketRef = useRef(null);

  // Load show details and initial seat layout
  const fetchShowAndSeats = async () => {
    try {
      const res = await api.get(`/shows/${showId}`);
      if (res.data.success) {
        setShow(res.data.show);
        setSeats(res.data.seats);
      }
    } catch (err) {
      toast.error('Failed to load show seats layout.');
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShowAndSeats();

    // Initialize Socket.IO connection for live updates
    const socketUrl = process.env.REACT_APP_SOCKET_URL || (process.env.NODE_ENV === 'production' ? window.location.origin : 'http://localhost:5000');
    const socket = io(socketUrl);
    socketRef.current = socket;

    socket.emit('join_show', showId);

    // Live Socket Listeners
    socket.on('seats_locked', (data) => {
      setSeats((prev) =>
        prev.map((s) => {
          if (data.seatNumbers.includes(s.seatNumber)) {
            return { ...s, status: 'locked' };
          }
          return s;
        })
      );
    });

    socket.on('seats_released', (data) => {
      setSeats((prev) =>
        prev.map((s) => {
          if (data.seatNumbers.includes(s.seatNumber)) {
            return { ...s, status: 'available' };
          }
          return s;
        })
      );
    });

    socket.on('seats_booked', (data) => {
      setSeats((prev) =>
        prev.map((s) => {
          if (data.seatNumbers.includes(s.seatNumber)) {
            return { ...s, status: 'booked' };
          }
          return s;
        })
      );
    });

    return () => {
      socket.emit('leave_show', showId);
      socket.disconnect();
    };
  }, [showId]);

  // Countdown timer effect
  useEffect(() => {
    if (!lockExpiresAt) return;

    const interval = setInterval(() => {
      const remaining = Math.max(0, Math.floor((new Date(lockExpiresAt) - new Date()) / 1000));
      setTimeLeftSeconds(remaining);

      if (remaining <= 0) {
        clearInterval(interval);
        toast.warn('Your seat hold session has expired. Please select again.');
        setSelectedSeats([]);
        setLockExpiresAt(null);
        setIsModalOpen(false);
        fetchShowAndSeats();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [lockExpiresAt]);

  // Toggle seat selection
  const handleToggleSeat = (seatNumber, price) => {
    if (selectedSeats.includes(seatNumber)) {
      setSelectedSeats(selectedSeats.filter((s) => s !== seatNumber));
      const newMap = { ...seatPriceMap };
      delete newMap[seatNumber];
      setSeatPriceMap(newMap);
    } else {
      if (selectedSeats.length >= 8) {
        toast.info('Maximum 8 tickets allowed per booking.');
        return;
      }
      setSelectedSeats([...selectedSeats, seatNumber]);
      setSeatPriceMap({ ...seatPriceMap, [seatNumber]: price });
    }
  };

  // Calculate selected total
  const selectedTotal = Object.values(seatPriceMap).reduce((acc, curr) => acc + curr, 0);

  // Lock seats on backend & open checkout modal
  const proceedWithLock = async (seatsToLock = selectedSeats) => {
    if (!seatsToLock || seatsToLock.length === 0) {
      toast.warn('Please select at least 1 seat.');
      return;
    }

    try {
      const res = await api.post('/bookings/lock-seats', {
        showId,
        seatNumbers: seatsToLock
      });

      if (res.data.success) {
        setLockExpiresAt(res.data.lockExpiresAt);
        setIsModalOpen(true);
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Some of the selected seats were just taken.';
      toast.error(msg);
      fetchShowAndSeats();
    }
  };

  // Auto-trigger checkout if redirected back from full login page with selected seats
  useEffect(() => {
    if (show && seats.length > 0 && location.state?.autoCheckout && isAuthenticated && selectedSeats.length > 0 && !isModalOpen && !autoCheckoutTriggeredRef.current) {
      autoCheckoutTriggeredRef.current = true;
      proceedWithLock(selectedSeats);
    }
  }, [show, seats, isAuthenticated]);

  // Trigger Checkout
  const handleProceedToCheckout = () => {
    if (selectedSeats.length === 0) {
      toast.warn('Please select at least 1 seat.');
      return;
    }

    if (!isAuthenticated) {
      setIsAuthModalOpen(true);
      return;
    }

    proceedWithLock(selectedSeats);
  };

  // Handle in-place Auth Modal Submission
  const handleAuthModalSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!authEmail || !authPassword) {
      toast.warn('Please enter email and password.');
      return;
    }
    setAuthLoading(true);
    try {
      if (authModalMode === 'login') {
        const data = await login(authEmail, authPassword);
        toast.success(`Welcome back, ${data.user.name}!`);
      } else {
        if (!authName) {
          toast.warn('Please enter your name.');
          setAuthLoading(false);
          return;
        }
        await register({ name: authName, email: authEmail, password: authPassword });
        toast.success('Account created successfully!');
      }
      setIsAuthModalOpen(false);
      proceedWithLock(selectedSeats);
    } catch (err) {
      const msg = err.response?.data?.message || 'Authentication failed. Please check credentials.';
      toast.error(msg);
    } finally {
      setAuthLoading(false);
    }
  };

  // Handle in-place Quick Demo Login
  const handleQuickModalLogin = async (demoEmail, demoPassword) => {
    setAuthLoading(true);
    try {
      const data = await login(demoEmail, demoPassword);
      toast.success(`Signed in as ${data.user.role === 'admin' ? 'Administrator' : 'Customer'}!`);
      setIsAuthModalOpen(false);
      proceedWithLock(selectedSeats);
    } catch (err) {
      toast.error('Quick login failed. Make sure DB is seeded.');
    } finally {
      setAuthLoading(false);
    }
  };

  // Close modal and release held seats
  const handleCloseModal = async () => {
    setIsModalOpen(false);
    try {
      await api.post('/bookings/release-seats', {
        showId,
        seatNumbers: selectedSeats
      });
      setLockExpiresAt(null);
    } catch (err) {
      console.error(err);
    }
  };

  // Confirm booking & payment
  const handleConfirmPayment = async (paymentData) => {
    setIsProcessing(true);
    try {
      const res = await api.post('/bookings', {
        showId,
        seatNumbers: selectedSeats,
        paymentMethod: paymentData.paymentMethod,
        cardDetails: paymentData.cardDetails,
        snacks: paymentData.snacks || []
      });

      if (res.data.success) {
        toast.success('🎉 Tickets booked successfully!');
        navigate(`/confirmation/${res.data.booking._id}`, {
          state: { booking: res.data.booking }
        });
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Payment processing failed.';
      toast.error(msg);
    } finally {
      setIsProcessing(false);
    }
  };

  if (loading || !show) {
    return (
      <div className="container" style={{ textAlign: 'center', padding: '6rem 0' }}>
        <p style={{ color: '#94a3b8' }}>Loading interactive theatre seat map...</p>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '2rem 1.5rem 6rem 1.5rem' }}>
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <button
          onClick={() => navigate(-1)}
          className="btn-secondary"
          style={{ padding: '0.5rem 0.9rem', fontSize: '0.85rem' }}
        >
          <ArrowLeft size={16} /> Back
        </button>

        <div style={{ textAlign: 'center' }}>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>{show.movie?.title}</h2>
          <p style={{ fontSize: '0.82rem', color: '#94a3b8' }}>
            {show.theatre?.name} • {show.screenName} • {new Date(show.showDate).toLocaleDateString()} at {show.showTime}
          </p>
        </div>

        {timeLeftSeconds !== null && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              background: 'rgba(245, 158, 11, 0.15)',
              color: '#fbbf24',
              padding: '0.4rem 0.8rem',
              borderRadius: '8px',
              fontSize: '0.85rem',
              fontWeight: 700,
              border: '1px solid rgba(245, 158, 11, 0.3)'
            }}
          >
            <Clock size={16} />
            <span>Hold: {Math.floor(timeLeftSeconds / 60)}:{('0' + (timeLeftSeconds % 60)).slice(-2)}</span>
          </div>
        )}
      </div>

      {/* Interactive Seat Matrix */}
      <div
        style={{
          background: '#121826',
          border: '1px solid var(--border-subtle)',
          borderRadius: '16px',
          padding: '2rem 1rem',
          boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
        }}
      >
        <SeatMap
          seats={seats}
          selectedSeats={selectedSeats}
          onToggleSeat={handleToggleSeat}
          pricing={show.pricing}
        />
      </div>

      {/* Floating Bottom Checkout Bar */}
      {selectedSeats.length > 0 && (
        <div
          style={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            background: 'rgba(11, 15, 25, 0.95)',
            backdropFilter: 'blur(16px)',
            borderTop: '1px solid var(--border-subtle)',
            padding: '1rem 0',
            zIndex: 90
          }}
        >
          <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                Seats: <strong style={{ color: '#fff' }}>{selectedSeats.join(', ')}</strong> ({selectedSeats.length} Ticket{selectedSeats.length > 1 ? 's' : ''})
              </div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#f8fafc' }}>
                ₹{selectedTotal} <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 400 }}>+ convenience fee</span>
              </div>
            </div>

            <button
              onClick={handleProceedToCheckout}
              className="btn-primary"
              style={{ padding: '0.8rem 2rem', fontSize: '1rem' }}
            >
              <CheckCircle2 size={18} />
              Proceed to Checkout
            </button>
          </div>
        </div>
      )}

      {/* In-Place Quick Sign In Modal */}
      {isAuthModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.85)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1rem'
          }}
          onClick={() => setIsAuthModalOpen(false)}
        >
          <div
            style={{
              background: '#121826',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              borderRadius: '16px',
              maxWidth: '440px',
              width: '100%',
              padding: '2rem',
              position: 'relative',
              boxShadow: '0 25px 60px rgba(0,0,0,0.9), 0 0 30px rgba(240, 20, 47, 0.2)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={() => setIsAuthModalOpen(false)}
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                background: 'rgba(255, 255, 255, 0.08)',
                border: 'none',
                color: '#94a3b8',
                borderRadius: '50%',
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer'
              }}
              title="Close and keep selected seats"
            >
              <X size={16} />
            </button>

            {/* Header */}
            <div style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '48px',
                  height: '48px',
                  borderRadius: '12px',
                  background: 'rgba(240, 20, 47, 0.15)',
                  color: '#e50914',
                  border: '1px solid rgba(240, 20, 47, 0.3)',
                  marginBottom: '0.75rem'
                }}
              >
                <LogIn size={24} />
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#f8fafc', marginBottom: '0.3rem' }}>
                {authModalMode === 'login' ? 'Sign In to Reserve' : 'Create Account to Reserve'}
              </h3>
              <p style={{ fontSize: '0.82rem', color: '#94a3b8' }}>
                Selected seats <strong style={{ color: '#fbbf24' }}>{selectedSeats.join(', ')}</strong> (₹{selectedTotal}) are saved and ready!
              </p>
            </div>

            {/* Quick 1-Click Demo Login */}
            <div
              style={{
                background: '#182032',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '10px',
                padding: '0.75rem',
                marginBottom: '1.25rem'
              }}
            >
              <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginBottom: '0.5rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                ⚡ 1-Click Instant Sign In
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                <button
                  type="button"
                  disabled={authLoading}
                  onClick={() => handleQuickModalLogin('user@imovies.com', 'user123')}
                  style={{
                    background: 'rgba(255, 255, 255, 0.06)',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    color: '#f8fafc',
                    borderRadius: '8px',
                    padding: '0.5rem 0.6rem',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.35rem'
                  }}
                >
                  <User size={13} color="#60a5fa" /> Customer
                </button>
                <button
                  type="button"
                  disabled={authLoading}
                  onClick={() => handleQuickModalLogin('admin@imovies.com', 'admin123')}
                  style={{
                    background: 'rgba(255, 255, 255, 0.06)',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    color: '#f8fafc',
                    borderRadius: '8px',
                    padding: '0.5rem 0.6rem',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.35rem'
                  }}
                >
                  <Sparkles size={13} color="#fbbf24" /> Admin
                </button>
              </div>
            </div>

            {/* Email/Password Form */}
            <form onSubmit={handleAuthModalSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {authModalMode === 'register' && (
                <div>
                  <label style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', marginBottom: '0.25rem' }}>Full Name</label>
                  <div style={{ position: 'relative' }}>
                    <User size={14} color="#64748b" style={{ position: 'absolute', top: '10px', left: '10px' }} />
                    <input
                      type="text"
                      placeholder="e.g. Rahul Sharma"
                      value={authName}
                      onChange={(e) => setAuthName(e.target.value)}
                      style={{
                        width: '100%',
                        background: '#182032',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: '6px',
                        padding: '0.55rem 0.6rem 0.55rem 2rem',
                        color: 'white',
                        fontSize: '0.85rem'
                      }}
                    />
                  </div>
                </div>
              )}

              <div>
                <label style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', marginBottom: '0.25rem' }}>Email Address</label>
                <div style={{ position: 'relative' }}>
                  <Mail size={14} color="#64748b" style={{ position: 'absolute', top: '10px', left: '10px' }} />
                  <input
                    type="email"
                    placeholder="name@example.com"
                    value={authEmail}
                    onChange={(e) => setAuthEmail(e.target.value)}
                    style={{
                      width: '100%',
                      background: '#182032',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '6px',
                      padding: '0.55rem 0.6rem 0.55rem 2rem',
                      color: 'white',
                      fontSize: '0.85rem'
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', marginBottom: '0.25rem' }}>Password</label>
                <div style={{ position: 'relative' }}>
                  <Lock size={14} color="#64748b" style={{ position: 'absolute', top: '10px', left: '10px' }} />
                  <input
                    type="password"
                    placeholder="Enter password"
                    value={authPassword}
                    onChange={(e) => setAuthPassword(e.target.value)}
                    style={{
                      width: '100%',
                      background: '#182032',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '6px',
                      padding: '0.55rem 0.6rem 0.55rem 2rem',
                      color: 'white',
                      fontSize: '0.85rem'
                    }}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={authLoading}
                className="btn-primary"
                style={{ width: '100%', padding: '0.7rem', fontSize: '0.9rem', marginTop: '0.3rem' }}
              >
                {authLoading ? 'Signing In...' : (authModalMode === 'login' ? 'Sign In & Lock Seats' : 'Register & Lock Seats')}
              </button>
            </form>

            {/* Google Sign In Option */}
            <div style={{ marginTop: '0.85rem' }}>
              <GoogleSignInButton
                buttonText="Continue with Google"
                onSuccess={() => {
                  setIsAuthModalOpen(false);
                  proceedWithLock(selectedSeats);
                }}
              />
            </div>

            {/* Mode switch & Full Login link */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem', fontSize: '0.78rem' }}>
              <button
                type="button"
                onClick={() => setAuthModalMode(authModalMode === 'login' ? 'register' : 'login')}
                style={{ background: 'none', border: 'none', color: '#e50914', cursor: 'pointer', fontWeight: 600, padding: 0 }}
              >
                {authModalMode === 'login' ? 'Need an account? Sign up' : 'Already have account? Sign in'}
              </button>

              <button
                type="button"
                onClick={() => {
                  navigate('/login', {
                    state: {
                      from: `/book/${showId}`,
                      selectedSeats,
                      seatPriceMap,
                      autoCheckout: true
                    }
                  });
                }}
                style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', textDecoration: 'underline', padding: 0 }}
              >
                Full login page →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Payment & Checkout Modal */}
      <BookingModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        show={show}
        selectedSeats={selectedSeats}
        seatPriceTotal={selectedTotal}
        onConfirmPayment={handleConfirmPayment}
        isProcessing={isProcessing}
      />
    </div>
  );
};

export default SeatBookingPage;
