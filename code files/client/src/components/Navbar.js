import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { safeStorage } from '../utils/safeStorage';
import { Film, Bell, User, LogOut, ShieldCheck, Ticket, MapPin, Menu, X, LocateFixed, Loader2 } from 'lucide-react';

const CITY_COORDINATES = {
  'Mumbai': { lat: 19.0760, lon: 72.8777 },
  'Delhi': { lat: 28.6139, lon: 77.2090 },
  'Bengaluru': { lat: 12.9716, lon: 77.5946 },
  'Hyderabad': { lat: 17.3850, lon: 78.4867 },
  'Chennai': { lat: 13.0827, lon: 80.2707 },
  'Kolkata': { lat: 22.5726, lon: 88.3639 },
  'Pune': { lat: 18.5204, lon: 73.8567 },
  'Ahmedabad': { lat: 23.0225, lon: 72.5714 },
  'Jaipur': { lat: 26.9124, lon: 75.7873 }
};

const getDistanceKm = (lat1, lon1, lat2, lon2) => {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const findClosestCity = (lat, lon) => {
  let closest = 'Mumbai';
  let minDistance = Infinity;
  for (const [cityName, coords] of Object.entries(CITY_COORDINATES)) {
    const dist = getDistanceKm(lat, lon, coords.lat, coords.lon);
    if (dist < minDistance) {
      minDistance = dist;
      closest = cityName;
    }
  }
  return { city: closest, distance: Math.round(minDistance) };
};

const Navbar = ({ selectedCity, setSelectedCity }) => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  const [cities, setCities] = useState([
    'Mumbai', 'Delhi', 'Bengaluru', 'Kolkata', 'Hyderabad', 'Chennai', 'Pune', 'Ahmedabad', 'Jaipur'
  ]);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const [locationStatus, setLocationStatus] = useState(null);

  // Restore saved city from previous session
  useEffect(() => {
    const saved = safeStorage.getItem('imovies_user_city');
    if (saved && selectedCity === 'All') {
      setSelectedCity(saved);
    }
  }, []);

  const handleDetectLocation = () => {
    setIsDetectingLocation(true);
    setLocationStatus(null);

    if (!navigator.geolocation) {
      detectViaIp();
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        try {
          const res = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`);
          const data = await res.json();
          const detectedName = data.city || data.locality || data.principalSubdivision;

          const matched = cities.find(c => c.toLowerCase() === detectedName?.toLowerCase());
          if (matched) {
            setSelectedCity(matched);
            safeStorage.setItem('imovies_user_city', matched);
            setLocationStatus(`📍 Detected: ${matched}`);
            setIsDetectingLocation(false);
            setTimeout(() => setLocationStatus(null), 4000);
            return;
          }
        } catch (e) {}

        const { city, distance } = findClosestCity(latitude, longitude);
        setSelectedCity(city);
        safeStorage.setItem('imovies_user_city', city);
        setLocationStatus(`📍 Nearest: ${city} (~${distance} km)`);
        setIsDetectingLocation(false);
        setTimeout(() => setLocationStatus(null), 4000);
      },
      (err) => {
        console.warn('GPS denied or failed, attempting IP fallback:', err.message);
        detectViaIp();
      },
      { timeout: 7000, enableHighAccuracy: true }
    );
  };

  const detectViaIp = async () => {
    try {
      const res = await fetch('https://ipapi.co/json/');
      const data = await res.json();
      if (data && data.latitude && data.longitude) {
        const matched = cities.find(c => c.toLowerCase() === data.city?.toLowerCase());
        if (matched) {
          setSelectedCity(matched);
          safeStorage.setItem('imovies_user_city', matched);
          setLocationStatus(`📍 Detected: ${matched}`);
        } else {
          const { city } = findClosestCity(data.latitude, data.longitude);
          setSelectedCity(city);
          safeStorage.setItem('imovies_user_city', city);
          setLocationStatus(`📍 Nearest: ${city}`);
        }
      } else {
        setLocationStatus('⚠️ Could not detect location');
      }
    } catch (e) {
      setLocationStatus('⚠️ Could not detect location');
    } finally {
      setIsDetectingLocation(false);
      setTimeout(() => setLocationStatus(null), 4000);
    }
  };

  useEffect(() => {
    const fetchCities = async () => {
      try {
        const res = await api.get('/theatres/cities');
        if (res.data.success && res.data.cities.length) {
          setCities(res.data.cities);
        }
      } catch (err) {}
    };
    fetchCities();
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      const fetchNotifications = async () => {
        try {
          const res = await api.get('/notifications');
          if (res.data.success) {
            setNotifications(res.data.notifications);
            setUnreadCount(res.data.unreadCount);
          }
        } catch (err) {}
      };
      fetchNotifications();
    }
  }, [isAuthenticated]);

  const handleMarkAllRead = async () => {
    try {
      await api.put('/notifications/read-all');
      setUnreadCount(0);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <nav className="navbar">
      <div className="container nav-content">
        {/* Brand */}
        <Link to="/" className="brand-logo" onClick={() => setIsMobileMenuOpen(false)}>
          <span className="brand-badge">🎬</span>
          <span>iMovies</span>
        </Link>

        {/* City Filter (Desktop) with Auto Location Detection */}
        <div className="desktop-city-picker" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', position: 'relative' }}>
          <div className="city-pill">
            <MapPin size={16} color="#e50914" />
            <select
              value={selectedCity}
              onChange={(e) => {
                setSelectedCity(e.target.value);
                if (e.target.value !== 'All') {
                  safeStorage.setItem('imovies_user_city', e.target.value);
                }
              }}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'inherit',
                outline: 'none',
                cursor: 'pointer',
                fontWeight: 600
              }}
            >
              <option value="All" style={{ background: '#121826' }}>All Cities</option>
              {cities.map((city) => (
                <option key={city} value={city} style={{ background: '#121826' }}>
                  {city}
                </option>
              ))}
            </select>
          </div>

          {/* Detect Location Button */}
          <button
            type="button"
            onClick={handleDetectLocation}
            disabled={isDetectingLocation}
            title="Detect my current location"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.42rem 0.8rem',
              background: isDetectingLocation ? 'rgba(229, 9, 20, 0.2)' : 'rgba(255, 255, 255, 0.06)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              borderRadius: '9999px',
              color: isDetectingLocation ? '#ff4d58' : '#e2e8f0',
              fontSize: '0.78rem',
              fontWeight: 600,
              cursor: isDetectingLocation ? 'wait' : 'pointer',
              transition: 'all 0.2s ease',
              whiteSpace: 'nowrap'
            }}
          >
            {isDetectingLocation ? (
              <>
                <Loader2 size={13} style={{ animation: 'spin 1s linear infinite' }} />
                <span>Detecting...</span>
              </>
            ) : (
              <>
                <LocateFixed size={13} color="#e50914" />
                <span>Detect Location</span>
              </>
            )}
          </button>

          {/* Location Detection Toast Notification */}
          {locationStatus && (
            <div
              style={{
                position: 'absolute',
                top: '46px',
                left: 0,
                background: 'rgba(18, 24, 39, 0.96)',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(229, 9, 20, 0.4)',
                padding: '0.4rem 0.85rem',
                borderRadius: '8px',
                fontSize: '0.78rem',
                fontWeight: 600,
                color: '#f8fafc',
                boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
                zIndex: 100,
                whiteSpace: 'nowrap',
                pointerEvents: 'none'
              }}
            >
              {locationStatus}
            </div>
          )}
        </div>

        {/* Desktop Navigation links */}
        <div className="nav-links">
          <Link to="/" className="nav-link">
            <Film size={18} />
            <span>Movies</span>
          </Link>

          {isAuthenticated && (
            <Link to="/my-bookings" className="nav-link">
              <Ticket size={18} />
              <span>My Tickets</span>
            </Link>
          )}

          {isAdmin && (
            <Link to="/admin" className="nav-link" style={{ color: '#fbbf24' }}>
              <ShieldCheck size={18} />
              <span>Admin Panel</span>
            </Link>
          )}

          {/* Notifications */}
          {isAuthenticated && (
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => {
                  setShowNotifications(!showNotifications);
                  if (!showNotifications && unreadCount > 0) handleMarkAllRead();
                }}
                style={{
                  background: 'rgba(255, 255, 255, 0.06)',
                  color: 'white',
                  width: '38px',
                  height: '38px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative'
                }}
              >
                <Bell size={18} />
                {unreadCount > 0 && (
                  <span
                    style={{
                      position: 'absolute',
                      top: '2px',
                      right: '2px',
                      width: '10px',
                      height: '10px',
                      borderRadius: '50%',
                      background: '#e50914',
                      boxShadow: '0 0 8px #e50914'
                    }}
                  />
                )}
              </button>

              {showNotifications && (
                <div
                  style={{
                    position: 'absolute',
                    right: 0,
                    top: '46px',
                    width: '320px',
                    background: '#182032',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: '12px',
                    padding: '1rem',
                    boxShadow: '0 16px 36px rgba(0,0,0,0.6)',
                    zIndex: 200
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.8rem', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '0.5rem' }}>
                    <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>Notifications</span>
                    <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>{notifications.length} recent</span>
                  </div>

                  <div style={{ maxHeight: '250px', overflowY: 'auto' }}>
                    {notifications.length === 0 ? (
                      <p style={{ fontSize: '0.82rem', color: '#64748b', textAlign: 'center', padding: '1rem 0' }}>
                        No new notifications
                      </p>
                    ) : (
                      notifications.map((n) => (
                        <div
                          key={n._id}
                          style={{
                            padding: '0.6rem 0',
                            borderBottom: '1px solid rgba(255,255,255,0.05)',
                            fontSize: '0.82rem'
                          }}
                        >
                          <div style={{ fontWeight: 600, color: '#f8fafc', marginBottom: '2px' }}>{n.title}</div>
                          <div style={{ color: '#94a3b8', lineHeight: 1.3 }}>{n.message}</div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* User profile dropdown or Login button */}
          {isAuthenticated ? (
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  background: 'rgba(255, 255, 255, 0.08)',
                  padding: '0.4rem 0.8rem',
                  borderRadius: '9999px',
                  color: 'white',
                  border: '1px solid var(--border-subtle)'
                }}
              >
                <img
                  src={user.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'}
                  alt={user.name}
                  style={{ width: '24px', height: '24px', borderRadius: '50%', objectFit: 'cover' }}
                />
                <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{user.name.split(' ')[0]}</span>
              </button>

              {showProfileMenu && (
                <div
                  style={{
                    position: 'absolute',
                    right: 0,
                    top: '46px',
                    width: '200px',
                    background: '#182032',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: '12px',
                    padding: '0.5rem',
                    boxShadow: '0 16px 36px rgba(0,0,0,0.6)',
                    zIndex: 200
                  }}
                >
                  <div style={{ padding: '0.6rem', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                    <div style={{ fontWeight: 700, fontSize: '0.88rem' }}>{user.name}</div>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{user.email}</div>
                  </div>
                  <Link
                    to="/my-bookings"
                    onClick={() => setShowProfileMenu(false)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      padding: '0.6rem',
                      fontSize: '0.85rem',
                      color: '#cbd5e1',
                      borderRadius: '6px'
                    }}
                  >
                    <Ticket size={16} /> My Bookings
                  </Link>
                  <button
                    onClick={() => {
                      logout();
                      setShowProfileMenu(false);
                      navigate('/');
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      padding: '0.6rem',
                      fontSize: '0.85rem',
                      color: '#f87171',
                      background: 'transparent',
                      width: '100%',
                      borderRadius: '6px',
                      textAlign: 'left'
                    }}
                  >
                    <LogOut size={16} /> Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link to="/login" className="btn-primary" style={{ padding: '0.5rem 1.1rem', fontSize: '0.85rem' }}>
              Sign In
            </Link>
          )}
        </div>

        {/* Mobile Hamburger Toggle Button */}
        <button
          className="mobile-menu-btn"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          style={{
            background: 'transparent',
            color: 'white',
            display: 'none',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '0.4rem'
          }}
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Drawer Menu */}
      {isMobileMenuOpen && (
        <div
          className="mobile-dropdown-menu"
          style={{
            background: '#121826',
            borderTop: '1px solid var(--border-subtle)',
            padding: '1.25rem 1.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem'
          }}
        >
          {/* City Selector in Mobile Menu */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>City:</span>
              <select
                value={selectedCity}
                onChange={(e) => {
                  setSelectedCity(e.target.value);
                  if (e.target.value !== 'All') {
                    safeStorage.setItem('imovies_user_city', e.target.value);
                  }
                  setIsMobileMenuOpen(false);
                }}
                style={{
                  background: '#182032',
                  border: '1px solid rgba(255,255,255,0.1)',
                  color: 'white',
                  padding: '0.4rem 0.8rem',
                  borderRadius: '6px',
                  fontSize: '0.85rem'
                }}
              >
                <option value="All">All Cities</option>
                {cities.map((city) => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
            </div>

            {/* Mobile Detect Location Button */}
            <button
              type="button"
              onClick={handleDetectLocation}
              disabled={isDetectingLocation}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                padding: '0.55rem',
                background: isDetectingLocation ? 'rgba(229, 9, 20, 0.2)' : 'rgba(255, 255, 255, 0.06)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                borderRadius: '8px',
                color: isDetectingLocation ? '#ff4d58' : '#e2e8f0',
                fontSize: '0.82rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              {isDetectingLocation ? (
                <>
                  <Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} />
                  <span>Detecting your location...</span>
                </>
              ) : (
                <>
                  <LocateFixed size={15} color="#e50914" />
                  <span>Auto-Detect Current Location</span>
                </>
              )}
            </button>

            {locationStatus && (
              <div style={{ fontSize: '0.78rem', color: '#38bdf8', fontWeight: 600, textAlign: 'center' }}>
                {locationStatus}
              </div>
            )}
          </div>

          <Link
            to="/"
            onClick={() => setIsMobileMenuOpen(false)}
            style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: '#f8fafc', fontSize: '0.95rem', fontWeight: 600 }}
          >
            <Film size={18} color="#e50914" /> Explore Movies
          </Link>

          {isAuthenticated ? (
            <>
              <Link
                to="/my-bookings"
                onClick={() => setIsMobileMenuOpen(false)}
                style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: '#f8fafc', fontSize: '0.95rem', fontWeight: 600 }}
              >
                <Ticket size={18} color="#e50914" /> My Tickets
              </Link>

              {isAdmin && (
                <Link
                  to="/admin"
                  onClick={() => setIsMobileMenuOpen(false)}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: '#fbbf24', fontSize: '0.95rem', fontWeight: 600 }}
                >
                  <ShieldCheck size={18} /> Admin Suite
                </Link>
              )}

              <button
                onClick={() => {
                  logout();
                  setIsMobileMenuOpen(false);
                  navigate('/');
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.6rem',
                  color: '#f87171',
                  background: 'transparent',
                  fontSize: '0.95rem',
                  fontWeight: 600,
                  padding: '0.5rem 0',
                  textAlign: 'left'
                }}
              >
                <LogOut size={18} /> Sign Out ({user.name.split(' ')[0]})
              </button>
            </>
          ) : (
            <Link
              to="/login"
              onClick={() => setIsMobileMenuOpen(false)}
              className="btn-primary"
              style={{ width: '100%', textAlign: 'center', marginTop: '0.5rem' }}
            >
              Sign In / Register
            </Link>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
