import React, { useEffect, useState } from 'react';
import { useLocation, useParams, Link } from 'react-router-dom';
import api from '../services/api';
import DigitalTicket from '../components/DigitalTicket';
import { CheckCircle2, Film, Ticket } from 'lucide-react';

const BookingConfirmationPage = () => {
  const { id } = useParams();
  const location = useLocation();
  const [booking, setBooking] = useState(location.state?.booking || null);
  const [loading, setLoading] = useState(!booking);

  useEffect(() => {
    if (!booking) {
      const fetchBooking = async () => {
        try {
          const res = await api.get('/bookings/my-bookings');
          if (res.data.success) {
            const found = res.data.bookings.find((b) => b._id === id);
            if (found) setBooking(found);
          }
        } catch (err) {
          console.error(err);
        } finally {
          setLoading(false);
        }
      };
      fetchBooking();
    }
  }, [id, booking]);

  if (loading) {
    return (
      <div className="container" style={{ textAlign: 'center', padding: '6rem 0' }}>
        <p style={{ color: '#94a3b8' }}>Generating your cinematic digital ticket...</p>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '3rem 1.5rem', textAlign: 'center' }}>
      <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', marginBottom: '1rem', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
        <CheckCircle2 size={36} />
      </div>

      <h1 style={{ fontSize: '2.2rem', fontWeight: 900, marginBottom: '0.4rem' }}>
        Booking Confirmed!
      </h1>
      <p style={{ color: '#94a3b8', fontSize: '0.95rem', marginBottom: '2.5rem' }}>
        Your seat reservation has been recorded. Present this electronic ticket at the cinema turnstile.
      </p>

      {/* Ticket Card Component */}
      <DigitalTicket booking={booking} />

      <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '2.5rem', flexWrap: 'wrap' }}>
        <Link to="/my-bookings" className="btn-primary" style={{ padding: '0.75rem 1.5rem' }}>
          <Ticket size={18} /> View All My Bookings
        </Link>
        <Link to="/" className="btn-secondary" style={{ padding: '0.75rem 1.5rem' }}>
          <Film size={18} /> Explore More Movies
        </Link>
      </div>
    </div>
  );
};

export default BookingConfirmationPage;
