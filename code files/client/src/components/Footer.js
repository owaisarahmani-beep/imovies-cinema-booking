import React from 'react';
import { Film, Heart } from 'lucide-react';

const Footer = () => {
  return (
    <footer style={{ background: '#070a12', borderTop: '1px solid rgba(255, 255, 255, 0.06)', padding: '3rem 0 2rem 0', marginTop: '5rem' }}>
      <div className="container" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.4rem', fontWeight: 800 }}>
              <span className="brand-badge" style={{ fontSize: '0.9rem', padding: '0.2rem 0.4rem' }}>🎬</span>
              <span>iMovies</span>
            </div>
            <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginTop: '0.4rem', maxWidth: '380px' }}>
              Movie ticket booking made simple. Real-time seating, immersive cinema experiences, and instant digital ticketing.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '2rem', fontSize: '0.88rem', color: '#cbd5e1' }}>
            <span>Privacy Policy</span>
            <span>Terms of Service</span>
            <span>Support & FAQ</span>
          </div>
        </div>

        <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.05)', paddingTop: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', fontSize: '0.8rem', color: '#64748b' }}>
          <div>
            © {new Date().getFullYear()} IMovies Cinema Platform. Developed for SmartBridge Full Stack MERN Internship.
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            Built with modern MERN Stack & Socket.IO
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
