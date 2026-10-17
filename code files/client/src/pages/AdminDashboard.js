import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import api from '../services/api';
import { Film, Calendar, Building, DollarSign, Plus, Trash2, ShieldCheck, Ticket, Users } from 'lucide-react';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('movies'); // 'movies', 'theatres', 'shows', 'bookings'
  const [movies, setMovies] = useState([]);
  const [theatres, setTheatres] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [loading, setLoading] = useState(true);

  // New Movie Form State
  const [newMovie, setNewMovie] = useState({
    title: '',
    description: '',
    poster: '',
    banner: '',
    trailerUrl: '',
    genre: 'Action, Sci-Fi',
    language: 'English, Hindi',
    duration: 150,
    rating: 8.5,
    director: '',
    cast: 'Actor 1, Actor 2',
    certificate: 'U/A'
  });

  // New Theatre Form State
  const [newTheatre, setNewTheatre] = useState({
    name: '',
    city: 'Mumbai',
    location: '',
    screenName: 'Screen 1 - Dolby Atmos'
  });

  // New Show Form State
  const [newShow, setNewShow] = useState({
    movie: '',
    theatre: '',
    screenName: 'Screen 1',
    showDate: new Date().toISOString().split('T')[0],
    showTime: '06:30 PM',
    format: '2D',
    vipPrice: 350,
    premiumPrice: 250,
    standardPrice: 180
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [mRes, tRes, bRes] = await Promise.all([
        api.get('/movies?limit=50'),
        api.get('/theatres'),
        api.get('/bookings/admin/all')
      ]);

      if (mRes.data.success) {
        setMovies(mRes.data.movies);
        if (mRes.data.movies.length && !newShow.movie) {
          setNewShow((prev) => ({ ...prev, movie: mRes.data.movies[0]._id }));
        }
      }

      if (tRes.data.success) {
        setTheatres(tRes.data.theatres);
        if (tRes.data.theatres.length && !newShow.theatre) {
          setNewShow((prev) => ({ ...prev, theatre: tRes.data.theatres[0]._id }));
        }
      }

      if (bRes.data.success) {
        setBookings(bRes.data.bookings);
        setTotalRevenue(bRes.data.totalRevenue || 0);
      }
    } catch (err) {
      toast.error('Failed to load admin data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Handle Create Movie
  const handleCreateMovie = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...newMovie,
        genre: newMovie.genre.split(',').map((g) => g.trim()),
        language: newMovie.language.split(',').map((l) => l.trim()),
        cast: newMovie.cast.split(',').map((c) => c.trim()),
        duration: Number(newMovie.duration),
        rating: Number(newMovie.rating)
      };

      const res = await api.post('/movies', payload);
      if (res.data.success) {
        toast.success('Movie created successfully!');
        setNewMovie({
          title: '',
          description: '',
          poster: '',
          banner: '',
          trailerUrl: '',
          genre: 'Action, Sci-Fi',
          language: 'English, Hindi',
          duration: 150,
          rating: 8.5,
          director: '',
          cast: '',
          certificate: 'U/A'
        });
        fetchData();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create movie.');
    }
  };

  // Handle Delete Movie
  const handleDeleteMovie = async (id) => {
    if (!window.confirm('Are you sure you want to delete this movie?')) return;
    try {
      const res = await api.delete(`/movies/${id}`);
      if (res.data.success) {
        toast.success('Movie deleted successfully');
        fetchData();
      }
    } catch (err) {
      toast.error('Failed to delete movie');
    }
  };

  // Handle Create Theatre
  const handleCreateTheatre = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        name: newTheatre.name,
        city: newTheatre.city,
        location: newTheatre.location,
        screens: [{ screenName: newTheatre.screenName, totalRows: 8, seatsPerRow: 10, seatCapacity: 80 }]
      };

      const res = await api.post('/theatres', payload);
      if (res.data.success) {
        toast.success('Theatre added successfully!');
        setNewTheatre({ name: '', city: 'Mumbai', location: '', screenName: 'Screen 1 - Dolby Atmos' });
        fetchData();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add theatre.');
    }
  };

  // Handle Create Show (Auto generates 80 seats)
  const handleCreateShow = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        movie: newShow.movie,
        theatre: newShow.theatre,
        screenName: newShow.screenName,
        showDate: newShow.showDate,
        showTime: newShow.showTime,
        format: newShow.format,
        pricing: {
          vip: Number(newShow.vipPrice),
          premium: Number(newShow.premiumPrice),
          standard: Number(newShow.standardPrice)
        }
      };

      const res = await api.post('/shows', payload);
      if (res.data.success) {
        toast.success('🎉 Show scheduled with 80-seat matrix created!');
        fetchData();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to schedule show.');
    }
  };

  return (
    <div className="container" style={{ padding: '2.5rem 1.5rem', minHeight: '80vh' }}>
      {/* Title & Badge */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: '#fbbf24', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.3rem' }}>
            <ShieldCheck size={16} /> CINEMA MANAGEMENT SUITE
          </div>
          <h1 style={{ fontSize: '2rem', fontWeight: 900 }}>Admin Dashboard</h1>
        </div>
      </div>

      {/* KPI Metric Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
        <div style={{ background: '#121826', border: '1px solid var(--border-subtle)', borderRadius: '12px', padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94a3b8', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
            <span>Total Revenue</span>
            <DollarSign size={18} color="#10b981" />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#10b981' }}>₹{totalRevenue}</div>
        </div>

        <div style={{ background: '#121826', border: '1px solid var(--border-subtle)', borderRadius: '12px', padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94a3b8', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
            <span>Total Bookings</span>
            <Ticket size={18} color="#e50914" />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 900 }}>{bookings.length}</div>
        </div>

        <div style={{ background: '#121826', border: '1px solid var(--border-subtle)', borderRadius: '12px', padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94a3b8', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
            <span>Active Movies</span>
            <Film size={18} color="#06b6d4" />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 900 }}>{movies.length}</div>
        </div>

        <div style={{ background: '#121826', border: '1px solid var(--border-subtle)', borderRadius: '12px', padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94a3b8', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
            <span>Cinema Theatres</span>
            <Building size={18} color="#8b5cf6" />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 900 }}>{theatres.length}</div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.6rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.8rem', marginBottom: '2rem', overflowX: 'auto' }}>
        {[
          { id: 'movies', label: 'Movies Catalog', icon: Film },
          { id: 'theatres', label: 'Theatres', icon: Building },
          { id: 'shows', label: 'Schedule Show (80 Seats)', icon: Calendar },
          { id: 'bookings', label: 'All Customer Bookings', icon: Ticket }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                background: isActive ? 'var(--accent-red)' : '#182032',
                color: isActive ? '#fff' : '#94a3b8',
                border: `1px solid ${isActive ? 'var(--accent-red)' : 'var(--border-subtle)'}`,
                padding: '0.6rem 1.2rem',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                fontSize: '0.85rem',
                fontWeight: 600,
                whiteSpace: 'nowrap'
              }}
            >
              <Icon size={16} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab 1: Movies */}
      {activeTab === 'movies' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
          {/* Add Movie Form */}
          <div style={{ background: '#121826', border: '1px solid var(--border-subtle)', borderRadius: '14px', padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Plus size={18} color="#e50914" /> Add New Movie
            </h3>
            <form onSubmit={handleCreateMovie} style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
              <input
                type="text"
                placeholder="Title (e.g. Gladiator II)"
                value={newMovie.title}
                onChange={(e) => setNewMovie({ ...newMovie, title: e.target.value })}
                required
                style={{ background: '#182032', border: '1px solid rgba(255,255,255,0.1)', padding: '0.65rem', borderRadius: '6px', color: 'white', fontSize: '0.85rem' }}
              />
              <textarea
                placeholder="Storyline Description"
                value={newMovie.description}
                onChange={(e) => setNewMovie({ ...newMovie, description: e.target.value })}
                required
                rows={3}
                style={{ background: '#182032', border: '1px solid rgba(255,255,255,0.1)', padding: '0.65rem', borderRadius: '6px', color: 'white', fontSize: '0.85rem' }}
              />
              <input
                type="text"
                placeholder="Poster URL (https://...)"
                value={newMovie.poster}
                onChange={(e) => setNewMovie({ ...newMovie, poster: e.target.value })}
                required
                style={{ background: '#182032', border: '1px solid rgba(255,255,255,0.1)', padding: '0.65rem', borderRadius: '6px', color: 'white', fontSize: '0.85rem' }}
              />
              <input
                type="text"
                placeholder="Banner URL (optional)"
                value={newMovie.banner}
                onChange={(e) => setNewMovie({ ...newMovie, banner: e.target.value })}
                style={{ background: '#182032', border: '1px solid rgba(255,255,255,0.1)', padding: '0.65rem', borderRadius: '6px', color: 'white', fontSize: '0.85rem' }}
              />
              <input
                type="text"
                placeholder="YouTube Trailer Link"
                value={newMovie.trailerUrl}
                onChange={(e) => setNewMovie({ ...newMovie, trailerUrl: e.target.value })}
                style={{ background: '#182032', border: '1px solid rgba(255,255,255,0.1)', padding: '0.65rem', borderRadius: '6px', color: 'white', fontSize: '0.85rem' }}
              />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem' }}>
                <input
                  type="text"
                  placeholder="Genres (comma-separated)"
                  value={newMovie.genre}
                  onChange={(e) => setNewMovie({ ...newMovie, genre: e.target.value })}
                  style={{ background: '#182032', border: '1px solid rgba(255,255,255,0.1)', padding: '0.65rem', borderRadius: '6px', color: 'white', fontSize: '0.85rem' }}
                />
                <input
                  type="text"
                  placeholder="Languages"
                  value={newMovie.language}
                  onChange={(e) => setNewMovie({ ...newMovie, language: e.target.value })}
                  style={{ background: '#182032', border: '1px solid rgba(255,255,255,0.1)', padding: '0.65rem', borderRadius: '6px', color: 'white', fontSize: '0.85rem' }}
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem' }}>
                <input
                  type="number"
                  placeholder="Duration (mins)"
                  value={newMovie.duration}
                  onChange={(e) => setNewMovie({ ...newMovie, duration: e.target.value })}
                  style={{ background: '#182032', border: '1px solid rgba(255,255,255,0.1)', padding: '0.65rem', borderRadius: '6px', color: 'white', fontSize: '0.85rem' }}
                />
                <input
                  type="number"
                  step="0.1"
                  placeholder="Rating (e.g. 8.6)"
                  value={newMovie.rating}
                  onChange={(e) => setNewMovie({ ...newMovie, rating: e.target.value })}
                  style={{ background: '#182032', border: '1px solid rgba(255,255,255,0.1)', padding: '0.65rem', borderRadius: '6px', color: 'white', fontSize: '0.85rem' }}
                />
              </div>
              <button type="submit" className="btn-primary" style={{ marginTop: '0.5rem' }}>
                Add Movie to Catalog
              </button>
            </form>
          </div>

          {/* Existing Movies List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '0.5rem' }}>Catalog ({movies.length})</h3>
            {movies.map((m) => (
              <div
                key={m._id}
                style={{
                  background: '#121826',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '10px',
                  padding: '0.85rem 1rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: '1rem'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <img
                    src={m.poster}
                    alt={m.title}
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      e.target.src = 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=600&q=80';
                    }}
                    style={{ width: '40px', height: '55px', objectFit: 'cover', borderRadius: '4px' }}
                  />
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{m.title}</div>
                    <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
                      {m.genre?.join(', ')} • {m.duration} mins • ⭐ {m.rating}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => handleDeleteMovie(m._id)}
                  style={{ background: 'transparent', color: '#f87171', padding: '0.5rem' }}
                  title="Delete Movie"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 2: Theatres */}
      {activeTab === 'theatres' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
          <div style={{ background: '#121826', border: '1px solid var(--border-subtle)', borderRadius: '14px', padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '1.25rem' }}>Add Theatre Venue</h3>
            <form onSubmit={handleCreateTheatre} style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
              <input
                type="text"
                placeholder="Theatre Name (e.g. PVR IMAX: High Street Phoenix)"
                value={newTheatre.name}
                onChange={(e) => setNewTheatre({ ...newTheatre, name: e.target.value })}
                required
                style={{ background: '#182032', border: '1px solid rgba(255,255,255,0.1)', padding: '0.65rem', borderRadius: '6px', color: 'white', fontSize: '0.85rem' }}
              />
              <input
                type="text"
                placeholder="City (e.g. Patna, Gaya, Mumbai, Delhi, Bengaluru)"
                value={newTheatre.city}
                onChange={(e) => setNewTheatre({ ...newTheatre, city: e.target.value })}
                required
                style={{ background: '#182032', border: '1px solid rgba(255,255,255,0.1)', padding: '0.65rem', borderRadius: '6px', color: 'white', fontSize: '0.85rem' }}
              />
              <input
                type="text"
                placeholder="Exact Address / Location"
                value={newTheatre.location}
                onChange={(e) => setNewTheatre({ ...newTheatre, location: e.target.value })}
                required
                style={{ background: '#182032', border: '1px solid rgba(255,255,255,0.1)', padding: '0.65rem', borderRadius: '6px', color: 'white', fontSize: '0.85rem' }}
              />
              <input
                type="text"
                placeholder="Screen Name (e.g. Screen 1 - IMAX Laser)"
                value={newTheatre.screenName}
                onChange={(e) => setNewTheatre({ ...newTheatre, screenName: e.target.value })}
                style={{ background: '#182032', border: '1px solid rgba(255,255,255,0.1)', padding: '0.65rem', borderRadius: '6px', color: 'white', fontSize: '0.85rem' }}
              />
              <button type="submit" className="btn-primary" style={{ marginTop: '0.5rem' }}>
                Register Theatre
              </button>
            </form>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '0.5rem' }}>Existing Theatres ({theatres.length})</h3>
            {theatres.map((t) => (
              <div
                key={t._id}
                style={{
                  background: '#121826',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '10px',
                  padding: '1rem'
                }}
              >
                <div style={{ fontWeight: 700, fontSize: '1rem', color: '#f8fafc' }}>{t.name}</div>
                <div style={{ fontSize: '0.82rem', color: '#94a3b8', marginTop: '0.2rem' }}>
                  {t.location}, {t.city}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Shows */}
      {activeTab === 'shows' && (
        <div style={{ maxWidth: '650px', background: '#121826', border: '1px solid var(--border-subtle)', borderRadius: '14px', padding: '1.75rem', margin: '0 auto' }}>
          <h3 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '0.4rem' }}>Schedule New Movie Show</h3>
          <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginBottom: '1.5rem' }}>
            Scheduling will automatically generate an 80-seat real-time interactive matrix for this show.
          </p>

          <form onSubmit={handleCreateShow} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'block', marginBottom: '0.35rem' }}>Select Movie:</label>
              <select
                value={newShow.movie}
                onChange={(e) => setNewShow({ ...newShow, movie: e.target.value })}
                required
                style={{ width: '100%', background: '#182032', border: '1px solid rgba(255,255,255,0.1)', padding: '0.65rem', borderRadius: '6px', color: 'white', fontSize: '0.85rem' }}
              >
                {movies.map((m) => (
                  <option key={m._id} value={m._id}>{m.title}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'block', marginBottom: '0.35rem' }}>Select Theatre:</label>
              <select
                value={newShow.theatre}
                onChange={(e) => setNewShow({ ...newShow, theatre: e.target.value })}
                required
                style={{ width: '100%', background: '#182032', border: '1px solid rgba(255,255,255,0.1)', padding: '0.65rem', borderRadius: '6px', color: 'white', fontSize: '0.85rem' }}
              >
                {theatres.map((t) => (
                  <option key={t._id} value={t._id}>{t.name} ({t.city})</option>
                ))}
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem' }}>
              <div>
                <label style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'block', marginBottom: '0.35rem' }}>Show Date:</label>
                <input
                  type="date"
                  value={newShow.showDate}
                  onChange={(e) => setNewShow({ ...newShow, showDate: e.target.value })}
                  required
                  style={{ width: '100%', background: '#182032', border: '1px solid rgba(255,255,255,0.1)', padding: '0.65rem', borderRadius: '6px', color: 'white', fontSize: '0.85rem' }}
                />
              </div>
              <div>
                <label style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'block', marginBottom: '0.35rem' }}>Show Time:</label>
                <input
                  type="text"
                  placeholder="e.g. 07:15 PM"
                  value={newShow.showTime}
                  onChange={(e) => setNewShow({ ...newShow, showTime: e.target.value })}
                  required
                  style={{ width: '100%', background: '#182032', border: '1px solid rgba(255,255,255,0.1)', padding: '0.65rem', borderRadius: '6px', color: 'white', fontSize: '0.85rem' }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.8rem' }}>
              <div>
                <label style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'block', marginBottom: '0.35rem' }}>VIP (₹):</label>
                <input
                  type="number"
                  value={newShow.vipPrice}
                  onChange={(e) => setNewShow({ ...newShow, vipPrice: e.target.value })}
                  style={{ width: '100%', background: '#182032', border: '1px solid rgba(255,255,255,0.1)', padding: '0.65rem', borderRadius: '6px', color: 'white', fontSize: '0.85rem' }}
                />
              </div>
              <div>
                <label style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'block', marginBottom: '0.35rem' }}>Premium (₹):</label>
                <input
                  type="number"
                  value={newShow.premiumPrice}
                  onChange={(e) => setNewShow({ ...newShow, premiumPrice: e.target.value })}
                  style={{ width: '100%', background: '#182032', border: '1px solid rgba(255,255,255,0.1)', padding: '0.65rem', borderRadius: '6px', color: 'white', fontSize: '0.85rem' }}
                />
              </div>
              <div>
                <label style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'block', marginBottom: '0.35rem' }}>Standard (₹):</label>
                <input
                  type="number"
                  value={newShow.standardPrice}
                  onChange={(e) => setNewShow({ ...newShow, standardPrice: e.target.value })}
                  style={{ width: '100%', background: '#182032', border: '1px solid rgba(255,255,255,0.1)', padding: '0.65rem', borderRadius: '6px', color: 'white', fontSize: '0.85rem' }}
                />
              </div>
            </div>

            <button type="submit" className="btn-primary" style={{ padding: '0.8rem', marginTop: '0.5rem' }}>
              Publish Show & Initialize 80 Seats
            </button>
          </form>
        </div>
      )}

      {/* Tab 4: Bookings Log */}
      {activeTab === 'bookings' && (
        <div style={{ background: '#121826', border: '1px solid var(--border-subtle)', borderRadius: '14px', padding: '1.5rem', overflowX: 'auto' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '1rem' }}>
            Recent Platform Reservations ({bookings.length})
          </h3>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', color: '#cbd5e1' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', textAlign: 'left', color: '#94a3b8' }}>
                <th style={{ padding: '0.8rem 0.5rem' }}>Booking ID</th>
                <th style={{ padding: '0.8rem 0.5rem' }}>User</th>
                <th style={{ padding: '0.8rem 0.5rem' }}>Movie</th>
                <th style={{ padding: '0.8rem 0.5rem' }}>Seats</th>
                <th style={{ padding: '0.8rem 0.5rem' }}>Total</th>
                <th style={{ padding: '0.8rem 0.5rem' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((b) => (
                <tr key={b._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <td style={{ padding: '0.8rem 0.5rem', fontFamily: 'monospace', fontWeight: 600 }}>{b.bookingId}</td>
                  <td style={{ padding: '0.8rem 0.5rem' }}>{b.user?.name || 'Customer'}</td>
                  <td style={{ padding: '0.8rem 0.5rem', fontWeight: 600, color: '#f8fafc' }}>{b.movie?.title}</td>
                  <td style={{ padding: '0.8rem 0.5rem', color: '#fbbf24' }}>{b.seats?.join(', ')}</td>
                  <td style={{ padding: '0.8rem 0.5rem', fontWeight: 700 }}>₹{b.grandTotal}</td>
                  <td style={{ padding: '0.8rem 0.5rem' }}>
                    <span
                      style={{
                        padding: '0.2rem 0.5rem',
                        borderRadius: '4px',
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        background: b.bookingStatus === 'confirmed' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                        color: b.bookingStatus === 'confirmed' ? '#10b981' : '#ef4444'
                      }}
                    >
                      {b.bookingStatus}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
