import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../services/api';
import { Ticket, Calendar, Clock, MapPin, AlertTriangle, XCircle, CheckCircle } from 'lucide-react';

const MyBookingsPage = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState(null);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [selectedBookingForCancel, setSelectedBookingForCancel] = useState(null);
  const [cancelReason, setCancelReason] = useState('Personal schedule conflict');

  const fetchBookings = async () => {
    try {
      const res = await api.get('/bookings/my-bookings');
      if (res.data.success) {
        setBookings(res.data.bookings);
      }
    } catch (err) {
      toast.error('Failed to load your booking history.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleCancelBooking = async () => {
    if (!selectedBookingForCancel) return;
    setCancellingId(selectedBookingForCancel._id);

    try {
      const res = await api.post(`/bookings/${selectedBookingForCancel._id}/cancel`, {
        reason: cancelReason
      });

      if (res.data.success) {
        toast.success('Booking cancelled successfully. Refund of ₹' + selectedBookingForCancel.grandTotal + ' initiated.');
        setCancelModalOpen(false);
        fetchBookings();
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to cancel booking.';
      toast.error(msg);
    } finally {
      setCancellingId(null);
    }
  };

  return (
    <div className="container" style={{ padding: '3rem 1.5rem', minHeight: '70vh' }}>
      <div style={{ marginBottom: '2.5rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 900, marginBottom: '0.4rem' }}>My Bookings & Tickets</h1>
        <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>
          Review your upcoming cinema admissions, past booking logs, and refund histories.
        </p>
      </div>

      {loading ? (
        <p style={{ color: '#94a3b8' }}>Loading bookings...</p>
      ) : bookings.length === 0 ? (
        <div
          style={{
            background: '#121826',
            borderRadius: '16px',
            padding: '4rem 2rem',
            textAlign: 'center',
            border: '1px solid var(--border-subtle)'
          }}
        >
          <Ticket size={48} color="#e50914" style={{ marginBottom: '1rem' }} />
          <h3 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '0.5rem' }}>No Bookings Yet</h3>
          <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
            You haven't reserved any movie tickets yet. Pick an upcoming show!
          </p>
          <Link to="/" className="btn-primary">
            Explore Now Showing Movies
          </Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {bookings.map((booking) => {
            const isCancelled = booking.bookingStatus === 'cancelled';
            return (
              <div
                key={booking._id}
                style={{
                  background: '#121826',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '14px',
                  padding: '1.5rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '1.5rem',
                  opacity: isCancelled ? 0.75 : 1
                }}
              >
                {/* Left Poster & Info */}
                <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center' }}>
                  <img
                    src={booking.movie?.poster}
                    alt={booking.movie?.title}
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      e.target.src = 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=600&q=80';
                    }}
                    style={{
                      width: '75px',
                      height: '105px',
                      objectFit: 'cover',
                      borderRadius: '8px',
                      filter: isCancelled ? 'grayscale(80%)' : 'none'
                    }}
                  />
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.3rem' }}>
                      <span style={{ fontSize: '0.78rem', color: '#94a3b8', fontFamily: 'monospace' }}>
                        ID: {booking.bookingId}
                      </span>
                      <span
                        style={{
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          padding: '0.2rem 0.5rem',
                          borderRadius: '4px',
                          textTransform: 'uppercase',
                          background: isCancelled ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                          color: isCancelled ? '#ef4444' : '#10b981',
                          border: `1px solid ${isCancelled ? 'rgba(239, 68, 68, 0.3)' : 'rgba(16, 185, 129, 0.3)'}`
                        }}
                      >
                        {isCancelled ? 'Cancelled (Refunded)' : 'Confirmed'}
                      </span>
                    </div>

                    <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#f8fafc', marginBottom: '0.3rem' }}>
                      {booking.movie?.title}
                    </h3>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.82rem', color: '#cbd5e1', marginBottom: '0.4rem' }}>
                      <MapPin size={13} color="#e50914" />
                      <span>{booking.theatre?.name}, {booking.theatre?.city}</span>
                    </div>

                    <div style={{ display: 'flex', gap: '1rem', fontSize: '0.8rem', color: '#94a3b8', flexWrap: 'wrap' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        <Calendar size={13} /> {new Date(booking.show?.showDate || booking.createdAt).toLocaleDateString()}
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        <Clock size={13} /> {booking.show?.showTime}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Seats & Price */}
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Seats Reserved</div>
                  <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#fbbf24', margin: '0.2rem 0' }}>
                    {booking.seats?.join(', ')}
                  </div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#fff' }}>
                    ₹{booking.grandTotal}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                    Paid via {booking.paymentMethod}
                  </div>
                </div>

                {/* Actions */}
                <div>
                  {!isCancelled && (
                    <button
                      onClick={() => {
                        setSelectedBookingForCancel(booking);
                        setCancelModalOpen(true);
                      }}
                      className="btn-secondary"
                      style={{
                        borderColor: 'rgba(239, 68, 68, 0.4)',
                        color: '#f87171',
                        padding: '0.55rem 1rem',
                        fontSize: '0.85rem'
                      }}
                    >
                      <XCircle size={15} /> Cancel Booking
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Cancellation Confirmation Modal */}
      {cancelModalOpen && selectedBookingForCancel && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.8)',
            backdropFilter: 'blur(6px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1rem'
          }}
        >
          <div
            style={{
              background: '#121826',
              border: '1px solid var(--border-subtle)',
              borderRadius: '16px',
              maxWidth: '460px',
              width: '100%',
              padding: '1.75rem'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: '#f87171', marginBottom: '0.8rem' }}>
              <AlertTriangle size={24} />
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800 }}>Confirm Ticket Cancellation</h3>
            </div>

            <p style={{ color: '#cbd5e1', fontSize: '0.88rem', lineHeight: 1.5, marginBottom: '1rem' }}>
              Are you sure you want to cancel your booking for <strong>"{selectedBookingForCancel.movie?.title}"</strong>? Your seats ({selectedBookingForCancel.seats?.join(', ')}) will be released immediately and a refund of <strong>₹{selectedBookingForCancel.grandTotal}</strong> will be processed.
            </p>

            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'block', marginBottom: '0.4rem' }}>
                Reason for cancellation:
              </label>
              <select
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                style={{
                  width: '100%',
                  background: '#182032',
                  border: '1px solid rgba(255,255,255,0.1)',
                  padding: '0.6rem',
                  borderRadius: '6px',
                  color: 'white',
                  fontSize: '0.85rem'
                }}
              >
                <option value="Personal schedule conflict">Personal schedule conflict</option>
                <option value="Booked wrong date/time">Booked wrong date/time</option>
                <option value="Change of plans with friends">Change of plans with friends</option>
                <option value="Found alternative show">Found alternative show</option>
              </select>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.8rem' }}>
              <button
                onClick={() => setCancelModalOpen(false)}
                className="btn-secondary"
                style={{ padding: '0.55rem 1rem', fontSize: '0.85rem' }}
              >
                Keep Booking
              </button>
              <button
                onClick={handleCancelBooking}
                disabled={!!cancellingId}
                className="btn-primary"
                style={{ background: '#ef4444', padding: '0.55rem 1.2rem', fontSize: '0.85rem' }}
              >
                {cancellingId ? 'Processing Refund...' : 'Confirm Cancellation'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyBookingsPage;
