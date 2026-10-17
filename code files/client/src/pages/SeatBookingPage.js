import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import io from 'socket.io-client';
import { toast } from 'react-toastify';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import SeatMap from '../components/SeatMap';
import BookingModal from '../components/BookingModal';
import { ArrowLeft, Clock, ShieldAlert, CheckCircle2 } from 'lucide-react';

const SeatBookingPage = () => {
  const { showId } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();

  const [show, setShow] = useState(null);
  const [seats, setSeats] = useState([]);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [seatPriceMap, setSeatPriceMap] = useState({});
  const [loading, setLoading] = useState(true);

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

  // Trigger Checkout
  const handleProceedToCheckout = async () => {
    if (!isAuthenticated) {
      toast.info('Please sign in to proceed with booking.');
      navigate('/login');
      return;
    }

    if (selectedSeats.length === 0) {
      toast.warn('Please select at least 1 seat.');
      return;
    }

    try {
      // Lock seats on backend
      const res = await api.post('/bookings/lock-seats', {
        showId,
        seatNumbers: selectedSeats
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
