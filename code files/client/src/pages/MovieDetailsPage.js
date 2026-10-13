import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import TrailerModal from '../components/TrailerModal';
import { Star, Clock, Calendar, MapPin, Play, UserCheck, Shield } from 'lucide-react';

const MovieDetailsPage = ({ selectedCity }) => {
  const { id } = useParams();
  const [movie, setMovie] = useState(null);
  const [theatres, setTheatres] = useState([]);
  const [selectedDate, setSelectedDate] = useState(0); // 0 = Today, 1 = Tomorrow, 2 = Day 3
  const [loading, setLoading] = useState(true);
  const [isTrailerOpen, setIsTrailerOpen] = useState(false);

  // Generate 4 consecutive dates for the date picker
  const dateOptions = [0, 1, 2, 3].map((offset) => {
    const d = new Date();
    d.setDate(d.getDate() + offset);
    return {
      offset,
      day: d.toLocaleDateString('en-US', { weekday: 'short' }),
      dateNumber: d.getDate(),
      month: d.toLocaleDateString('en-US', { month: 'short' }),
      isoString: d.toISOString().split('T')[0]
    };
  });

  // Fetch movie details
  useEffect(() => {
    const fetchMovie = async () => {
      try {
        const res = await api.get(`/movies/${id}`);
        if (res.data.success) {
          setMovie(res.data.movie);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchMovie();
  }, [id]);

  // Fetch shows grouped by theatre
  useEffect(() => {
    const fetchShows = async () => {
      setLoading(true);
      try {
        const activeDateIso = dateOptions[selectedDate].isoString;
        const res = await api.get(`/shows/movie/${id}`, {
          params: {
            date: activeDateIso,
            city: selectedCity !== 'All' ? selectedCity : undefined
          }
        });
        if (res.data.success) {
          setTheatres(res.data.theatres);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchShows();
  }, [id, selectedDate, selectedCity]);

  if (!movie) {
    return (
      <div className="container" style={{ textAlign: 'center', padding: '6rem 0' }}>
        <p style={{ color: '#94a3b8' }}>Loading movie details...</p>
      </div>
    );
  }

  return (
    <div>
      {/* Cinematic Banner Header */}
      <div
        style={{
          position: 'relative',
          minHeight: '440px',
          backgroundImage: `linear-gradient(to top, rgba(11, 15, 25, 1) 10%, rgba(11, 15, 25, 0.7) 60%, rgba(11, 15, 25, 0.9) 100%), url(${movie.banner || movie.poster})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center 20%',
          display: 'flex',
          alignItems: 'flex-end',
          paddingBottom: '3rem'
        }}
      >
        <div className="container" style={{ width: '100%' }}>
          <div style={{ display: 'flex', gap: '2.5rem', alignItems: 'flex-end', flexWrap: 'wrap' }}>
            {/* Poster */}
            <div
              style={{
                width: '200px',
                aspectRatio: '2/3',
                borderRadius: '12px',
                overflow: 'hidden',
                boxShadow: '0 20px 40px rgba(0,0,0,0.8)',
                border: '2px solid rgba(255,255,255,0.1)',
                flexShrink: 0
              }}
            >
              <img
                src={movie.poster}
                alt={movie.title}
                referrerPolicy="no-referrer"
                onError={(e) => {
                  e.target.src = 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=600&q=80';
                }}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>

            {/* Title & Metadata */}
            <div style={{ maxWidth: '750px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.6rem' }}>
                <span className="cert-pill" style={{ position: 'static' }}>{movie.certificate}</span>
                <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>{movie.language?.join(', ')}</span>
              </div>

              <h1 style={{ fontSize: '2.6rem', fontWeight: 900, marginBottom: '0.6rem', color: '#f8fafc' }}>
                {movie.title}
              </h1>

              <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '1.2rem', color: '#cbd5e1', fontSize: '0.9rem', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#fbbf24', fontWeight: 700 }}>
                  <Star size={16} fill="#fbbf24" />
                  <span>{movie.rating ? movie.rating.toFixed(1) : '8.5'}/10</span>
                  <span style={{ fontSize: '0.65rem', fontWeight: 800, background: '#f5c518', color: '#000', padding: '1px 4px', borderRadius: '3px', marginLeft: '2px' }}>IMDb</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Clock size={16} />
                  <span>{movie.duration} mins</span>
                </div>
                <div>{movie.genre?.join(' • ')}</div>
              </div>

              <p style={{ color: '#94a3b8', fontSize: '0.92rem', lineHeight: 1.6, marginBottom: '1.2rem' }}>
                {movie.description}
              </p>

              {movie.trailerUrl && (
                <button
                  type="button"
                  onClick={() => setIsTrailerOpen(true)}
                  className="btn-secondary"
                  style={{
                    padding: '0.65rem 1.25rem',
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    background: 'rgba(255, 255, 255, 0.08)',
                    backdropFilter: 'blur(8px)'
                  }}
                >
                  <Play size={14} fill="white" /> Watch Official Trailer
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Cast & Crew Bar */}
      <div style={{ background: '#121826', borderBottom: '1px solid var(--border-subtle)', padding: '1rem 0' }}>
        <div className="container" style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', fontSize: '0.85rem' }}>
          {movie.director && (
            <div>
              <span style={{ color: '#64748b' }}>Director: </span>
              <strong style={{ color: '#e2e8f0' }}>{movie.director}</strong>
            </div>
          )}
          {movie.cast && movie.cast.length > 0 && (
            <div>
              <span style={{ color: '#64748b' }}>Starring: </span>
              <strong style={{ color: '#e2e8f0' }}>{movie.cast.join(', ')}</strong>
            </div>
          )}
        </div>
      </div>

      {/* Showtime Selection Section */}
      <div className="container" style={{ marginTop: '2.5rem' }}>
        {/* Date Selector Pills */}
        <div style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '1rem' }}>Select Date</h2>
          <div style={{ display: 'flex', gap: '0.75rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
            {dateOptions.map((item) => {
              const isSelected = selectedDate === item.offset;
              return (
                <button
                  key={item.offset}
                  onClick={() => setSelectedDate(item.offset)}
                  style={{
                    background: isSelected ? 'var(--accent-red)' : '#182032',
                    color: isSelected ? '#fff' : '#cbd5e1',
                    border: `1px solid ${isSelected ? 'var(--accent-red)' : 'var(--border-subtle)'}`,
                    borderRadius: '10px',
                    padding: '0.6rem 1.2rem',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    minWidth: '75px',
                    boxShadow: isSelected ? '0 0 12px rgba(229, 9, 20, 0.4)' : 'none',
                    transition: 'all 0.2s'
                  }}
                >
                  <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', opacity: 0.8 }}>{item.day}</span>
                  <span style={{ fontSize: '1.2rem', fontWeight: 800 }}>{item.dateNumber}</span>
                  <span style={{ fontSize: '0.7rem', opacity: 0.8 }}>{item.month}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Theatres & Showtimes Grouping (BookMyShow Flow) */}
        <div>
          <h2 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '1.25rem' }}>
            Available Theatres & Showtimes
          </h2>

          {loading ? (
            <p style={{ color: '#94a3b8', padding: '2rem 0' }}>Loading available showtimes...</p>
          ) : theatres.length === 0 ? (
            <div
              style={{
                background: '#121826',
                padding: '2.5rem',
                borderRadius: '12px',
                textAlign: 'center',
                border: '1px solid var(--border-subtle)'
              }}
            >
              <p style={{ color: '#94a3b8', fontSize: '0.95rem' }}>
                No shows scheduled for the selected date {selectedCity !== 'All' ? `in ${selectedCity}` : ''}.
              </p>
              <p style={{ color: '#64748b', fontSize: '0.82rem', marginTop: '0.5rem' }}>
                Please select another date above or switch cities in the navbar.
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {theatres.map((group) => (
                <div
                  key={group.theatre._id}
                  style={{
                    background: '#121826',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: '14px',
                    padding: '1.5rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1.2rem'
                  }}
                >
                  {/* Theatre Header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.8rem' }}>
                    <div>
                      <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#f8fafc' }}>
                        {group.theatre.name}
                      </h3>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.82rem', color: '#94a3b8', marginTop: '0.2rem' }}>
                        <MapPin size={13} color="#e50914" />
                        <span>{group.theatre.location}, {group.theatre.city}</span>
                      </div>
                    </div>

                    {group.theatre.facilities && (
                      <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                        {group.theatre.facilities.slice(0, 3).map((f) => (
                          <span
                            key={f}
                            style={{
                              fontSize: '0.72rem',
                              background: 'rgba(255, 255, 255, 0.05)',
                              color: '#cbd5e1',
                              padding: '0.2rem 0.5rem',
                              borderRadius: '4px'
                            }}
                          >
                            {f}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Shows list */}
                  <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                    {group.shows.map((show) => {
                      const total = show.totalSeats || 80;
                      const available = show.availableSeatsCount ?? 80;
                      const occupancy = (total - available) / total;
                      let statusText = 'Available';
                      let statusColor = '#4ade80';
                      if (occupancy >= 0.7) {
                        statusText = 'Almost Full';
                        statusColor = '#ef4444';
                      } else if (occupancy >= 0.25) {
                        statusText = 'Filling Fast';
                        statusColor = '#fbbf24';
                      }

                      return (
                        <Link
                          key={show._id}
                          to={`/book/${show._id}`}
                          style={{
                            background: '#182032',
                            border: `1px solid ${occupancy >= 0.7 ? 'rgba(239, 68, 68, 0.4)' : 'rgba(255, 255, 255, 0.1)'}`,
                            padding: '0.75rem 1.25rem',
                            borderRadius: '8px',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '0.25rem',
                            transition: 'all 0.2s',
                            minWidth: '125px',
                            position: 'relative'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.borderColor = '#e50914';
                            e.currentTarget.style.transform = 'translateY(-2px)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.borderColor = occupancy >= 0.7 ? 'rgba(239, 68, 68, 0.4)' : 'rgba(255, 255, 255, 0.1)';
                            e.currentTarget.style.transform = 'translateY(0)';
                          }}
                        >
                          <span style={{ fontSize: '1.05rem', fontWeight: 800, color: statusColor }}>
                            {show.showTime}
                          </span>
                          <span style={{ fontSize: '0.72rem', color: '#cbd5e1', textTransform: 'uppercase', fontWeight: 600 }}>
                            {show.format} • {show.screenName}
                          </span>
                          <span style={{ fontSize: '0.68rem', color: statusColor, fontWeight: 700 }}>
                            ● {statusText}
                          </span>
                          <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>
                            From ₹{show.pricing?.standard || 180}
                          </span>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* In-App Video Trailer Modal */}
      <TrailerModal
        isOpen={isTrailerOpen}
        onClose={() => setIsTrailerOpen(false)}
        movieTitle={movie?.title}
        trailerUrl={movie?.trailerUrl}
      />
    </div>
  );
};

export default MovieDetailsPage;
