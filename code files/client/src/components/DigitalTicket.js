import React from 'react';
import { Calendar, Clock, MapPin, Printer } from 'lucide-react';

const DigitalTicket = ({ booking }) => {
  if (!booking) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
      <div className="digital-ticket">
        <div className="ticket-notch-left" />
        <div className="ticket-notch-right" />

        {/* Ticket Header Banner */}
        <div
          style={{
            background: 'linear-gradient(135deg, #e50914, #991b1b)',
            padding: '1.25rem 1.5rem',
            color: 'white',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          <div>
            <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px', opacity: 0.9 }}>
              E-Ticket Confirmation
            </div>
            <div style={{ fontSize: '1.1rem', fontWeight: 800 }}>{booking.bookingId}</div>
          </div>
          <span
            style={{
              background: booking.bookingStatus === 'confirmed' ? '#10b981' : '#ef4444',
              color: 'white',
              fontSize: '0.75rem',
              fontWeight: 700,
              padding: '0.25rem 0.6rem',
              borderRadius: '9999px',
              textTransform: 'uppercase'
            }}
          >
            {booking.bookingStatus}
          </span>
        </div>

        {/* Ticket Details */}
        <div style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', gap: '1.2rem', marginBottom: '1.2rem' }}>
            <img
              src={booking.movie?.poster}
              alt={booking.movie?.title}
              referrerPolicy="no-referrer"
              onError={(e) => {
                e.target.src = 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=600&q=80';
              }}
              style={{ width: '80px', height: '110px', objectFit: 'cover', borderRadius: '8px' }}
            />
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#f8fafc', marginBottom: '0.25rem' }}>
                {booking.movie?.title}
              </h3>
              <p style={{ fontSize: '0.82rem', color: '#94a3b8', marginBottom: '0.5rem' }}>
                {booking.movie?.genre?.join(', ')} • {booking.movie?.certificate || 'U/A'}
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.85rem', color: '#cbd5e1' }}>
                <MapPin size={14} color="#e50914" />
                <span>{booking.theatre?.name}, {booking.theatre?.city}</span>
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', background: '#121826', padding: '1rem', borderRadius: '10px' }}>
            <div>
              <div style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase' }}>Date & Show</div>
              <div style={{ fontSize: '0.88rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.3rem', marginTop: '2px' }}>
                <Calendar size={14} color="#e50914" />
                <span>{new Date(booking.show?.showDate || booking.createdAt).toLocaleDateString()}</span>
              </div>
              <div style={{ fontSize: '0.85rem', color: '#cbd5e1', display: 'flex', alignItems: 'center', gap: '0.3rem', marginTop: '2px' }}>
                <Clock size={14} color="#e50914" />
                <span>{booking.show?.showTime}</span>
              </div>
            </div>

            <div>
              <div style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase' }}>Seats Allocated</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#fbbf24', marginTop: '2px' }}>
                {booking.seats?.join(', ')}
              </div>
              <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
                {booking.seatCount} Ticket(s)
              </div>
            </div>
          </div>

          {booking.snacks && booking.snacks.length > 0 && (
            <div
              style={{
                marginTop: '1rem',
                background: '#121826',
                border: '1px dashed rgba(251, 191, 36, 0.4)',
                borderRadius: '10px',
                padding: '0.85rem 1rem'
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '0.5rem',
                  borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                  paddingBottom: '0.35rem'
                }}
              >
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#fbbf24', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  🍿 Concession Voucher
                </div>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600 }}>
                  ₹{booking.snacksTotal || booking.snacks.reduce((acc, s) => acc + (s.price * s.count), 0)}
                </div>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                {booking.snacks.map((snack, idx) => (
                  <span
                    key={idx}
                    style={{
                      fontSize: '0.78rem',
                      background: 'rgba(251, 191, 36, 0.1)',
                      color: '#f8fafc',
                      border: '1px solid rgba(251, 191, 36, 0.25)',
                      padding: '0.2rem 0.55rem',
                      borderRadius: '6px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      fontWeight: 600
                    }}
                  >
                    <span>{snack.emoji || '🍿'}</span>
                    <span>{snack.name}</span>
                    <strong style={{ color: '#fbbf24' }}>×{snack.count}</strong>
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="ticket-divider" />

          {/* Barcode & Total Paid */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Total Paid</div>
              <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#f8fafc' }}>
                ₹{booking.grandTotal}
              </div>
            </div>

            {/* Simulated Barcode */}
            <div style={{ textAlign: 'right' }}>
              <div
                style={{
                  fontFamily: 'monospace',
                  letterSpacing: '4px',
                  fontWeight: 900,
                  fontSize: '1.1rem',
                  color: '#94a3b8'
                }}
              >
                ||| | |||| | ||| ||||
              </div>
              <div style={{ fontSize: '0.7rem', color: '#64748b' }}>SCAN AT GATE</div>
            </div>
          </div>
        </div>
      </div>

      <button
        onClick={handlePrint}
        className="btn-secondary"
        style={{ marginTop: '1.5rem', gap: '0.5rem' }}
      >
        <Printer size={16} />
        <span>Print or Save Ticket</span>
      </button>
    </div>
  );
};

export default DigitalTicket;
