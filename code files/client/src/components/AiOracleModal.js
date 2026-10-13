import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, X, Star, Clock, Ticket, Play, Search, Film } from 'lucide-react';

const MOOD_PRESETS = [
  { label: '🧠 Mind-Bending & Deep', query: 'mind bending sci-fi cosmic deep space mystery' },
  { label: '🔥 High-Octane Action', query: 'action blockbuster thrilling superhero fights' },
  { label: '😂 Laughs & Feel-Good', query: 'comedy hilarious fun cheerful animated' },
  { label: '😱 Spine-Chilling Horror', query: 'horror haunting scary dark ghost mystery' },
  { label: '🍿 Family & Kids Adventure', query: 'family animated adventure friendly fun' },
  { label: '🕊️ Spiritual & Inspiring', query: 'biography devotional inspiring drama true story' },
  { label: '⏱️ Under 2 Hours Quick Watch', query: 'under 2 hours short quick crisp' },
  { label: '⭐ Top IMDb Masterpieces', query: 'highest rated masterpiece award winning' }
];

const scoreMovie = (movie, query) => {
  const q = query.toLowerCase().trim();
  if (!q) return 0;

  const terms = q.split(/\s+/).filter(Boolean);
  let score = 0;

  const titleLower = (movie.title || '').toLowerCase();
  const descLower = (movie.description || '').toLowerCase();
  const genres = (movie.genre || []).map((g) => g.toLowerCase());
  const cast = (movie.cast || []).map((c) => c.toLowerCase());
  const director = (movie.director || '').toLowerCase();
  const rating = movie.rating || 7.0;
  const duration = movie.duration || 120;

  // Rating bonus
  score += rating * 4;

  // Direct title match
  if (titleLower.includes(q)) score += 60;

  // Check query terms
  terms.forEach((term) => {
    if (titleLower.includes(term)) score += 25;
    if (genres.some((g) => g.includes(term))) score += 20;
    if (descLower.includes(term)) score += 10;
    if (cast.some((c) => c.includes(term))) score += 15;
    if (director.includes(term)) score += 20;

    // Mood semantic associations
    if (term === 'sci-fi' || term === 'space' || term === 'cosmic') {
      if (genres.includes('sci-fi')) score += 30;
    }
    if (term === 'action' || term === 'superhero' || term === 'fights') {
      if (genres.includes('action')) score += 25;
    }
    if (term === 'horror' || term === 'scary' || term === 'ghost' || term === 'haunting') {
      if (genres.includes('horror') || genres.includes('thriller')) score += 30;
    }
    if (term === 'comedy' || term === 'laugh' || term === 'funny') {
      if (genres.includes('comedy')) score += 25;
    }
    if (term === 'family' || term === 'kids' || term === 'animated') {
      if (genres.includes('animation') || genres.includes('family')) score += 30;
    }
    if (term === 'drama' || term === 'spiritual' || term === 'devotional' || term === 'biography') {
      if (genres.includes('drama') || genres.includes('biography') || genres.includes('devotional')) score += 25;
    }
    if (term === 'short' || term === 'quick' || term === 'hours') {
      if (duration <= 120) score += 25;
    }
    if (term === 'masterpiece' || term === 'top' || term === 'highest') {
      if (rating >= 8.0) score += 30;
    }
  });

  return score;
};

const generateReasoning = (movie, query) => {
  const ratingText = movie.rating ? `rated ${movie.rating}/10 on IMDb` : 'critically acclaimed';
  const genreList = movie.genre?.join(', ') || 'Feature Film';
  const durationText = `${movie.duration} minutes`;

  const q = query.toLowerCase();
  if (q.includes('family') || q.includes('kids') || q.includes('animated')) {
    return `Perfect wholesome cinema for all ages (${genreList}), clocking in at a brisk ${durationText} with an impressive ${ratingText}.`;
  }
  if (q.includes('horror') || q.includes('scary') || q.includes('haunting')) {
    return `Delivers chilling atmosphere and spine-tingling suspense (${genreList}) with stellar cinematic craft and tension throughout.`;
  }
  if (q.includes('mind') || q.includes('sci-fi') || q.includes('space') || q.includes('deep')) {
    return `An epic cinematic journey with visionary storytelling, world-class direction, and an exceptional ${ratingText}.`;
  }
  if (q.includes('action') || q.includes('fights')) {
    return `Packed with relentless adrenaline, massive theatrical spectacle, and electrifying performances on premiere large screens.`;
  }
  if (q.includes('comedy') || q.includes('laugh')) {
    return `Guaranteed entertainment and infectious humor (${genreList}), delivering pure crowd-pleasing laughs on the big screen.`;
  }
  if (q.includes('short') || q.includes('quick') || q.includes('hours')) {
    return `A tightly paced ${durationText} release that packs rich storytelling without unnecessary runtime bloat.`;
  }

  return `Top-tier theatrical recommendation in ${genreList}, featuring standout performances and an official score of ${ratingText}.`;
};

const AiOracleModal = ({ isOpen, onClose, movies = [], onPlayTrailer }) => {
  const [query, setQuery] = useState('');
  const [recommendations, setRecommendations] = useState([]);
  const [activeMood, setActiveMood] = useState('🧠 Mind-Bending & Deep');

  // Run recommendation when query changes
  useEffect(() => {
    if (!movies || movies.length === 0) return;

    const targetQuery = query.trim() || 'mind bending sci-fi cosmic deep space mystery';
    const scored = movies.map((m) => {
      const score = scoreMovie(m, targetQuery);
      return {
        movie: m,
        score,
        reasoning: generateReasoning(m, targetQuery)
      };
    });

    scored.sort((a, b) => b.score - a.score);

    // Pick top 3
    const topPicks = scored.slice(0, 3);
    const maxScore = topPicks[0]?.score || 100;

    const formatted = topPicks.map((item, idx) => {
      const matchPct = Math.min(99, Math.max(78, Math.round((item.score / maxScore) * 98) - idx * 3));
      return {
        ...item,
        matchPct
      };
    });

    setRecommendations(formatted);
  }, [query, movies]);

  // Handle ESC key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSelectPreset = (preset) => {
    setActiveMood(preset.label);
    setQuery(preset.query);
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9998,
        backgroundColor: 'rgba(5, 8, 15, 0.88)',
        backdropFilter: 'blur(10px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
        overflowY: 'auto'
      }}
      onClick={onClose}
    >
      <div
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: '860px',
          maxHeight: '90vh',
          background: 'linear-gradient(145deg, #121827 0%, #0B0F19 100%)',
          borderRadius: '20px',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          boxShadow: '0 30px 80px rgba(0, 0, 0, 0.95), 0 0 50px rgba(240, 20, 47, 0.15)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div
          style={{
            padding: '1.25rem 1.75rem',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            background: 'linear-gradient(90deg, rgba(240, 20, 47, 0.15) 0%, rgba(18, 24, 39, 0.6) 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #F0142F 0%, #790B18 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 15px rgba(240, 20, 47, 0.5)'
              }}
            >
              <Sparkles size={20} color="#fff" />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: '#F8FAFC' }}>
                  CineOracle
                </h2>
                <span
                  style={{
                    background: 'rgba(240, 20, 47, 0.2)',
                    color: '#ff4d64',
                    border: '1px solid rgba(240, 20, 47, 0.4)',
                    fontSize: '0.65rem',
                    fontWeight: 800,
                    padding: '0.15rem 0.45rem',
                    borderRadius: '4px',
                    letterSpacing: '0.5px'
                  }}
                >
                  AI GUIDE
                </span>
              </div>
              <p style={{ margin: 0, fontSize: '0.8rem', color: '#94a3b8' }}>
                Personalized movie intelligence based on current theatre showtimes
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.08)',
              border: 'none',
              color: '#cbd5e1',
              cursor: 'pointer',
              borderRadius: '8px',
              padding: '0.45rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'background 0.2s'
            }}
            aria-label="Close Oracle"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Body */}
        <div style={{ padding: '1.5rem 1.75rem', overflowY: 'auto', flex: 1 }}>
          {/* Prompt Input */}
          <div style={{ position: 'relative', marginBottom: '1.25rem' }}>
            <Search
              size={18}
              style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}
            />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Tell Oracle: e.g. 'Mind-bending Nolan thriller' or 'Fun family animation with laughs'..."
              style={{
                width: '100%',
                padding: '0.85rem 3rem 0.85rem 2.8rem',
                background: 'rgba(11, 15, 25, 0.8)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                borderRadius: '12px',
                color: '#f8fafc',
                fontSize: '0.92rem',
                outline: 'none',
                boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.5)'
              }}
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                style={{
                  position: 'absolute',
                  right: '0.85rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'transparent',
                  border: 'none',
                  color: '#94a3b8',
                  cursor: 'pointer'
                }}
              >
                <X size={16} />
              </button>
            )}
          </div>

          {/* Mood Preset Chips */}
          <div style={{ marginBottom: '1.75rem' }}>
            <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.65rem' }}>
              Instant Mood Vibe Filters
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {MOOD_PRESETS.map((preset) => {
                const isSelected = activeMood === preset.label;
                return (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => handleSelectPreset(preset)}
                    style={{
                      background: isSelected ? 'var(--accent-red, #F0142F)' : 'rgba(255, 255, 255, 0.06)',
                      color: isSelected ? '#fff' : '#cbd5e1',
                      border: isSelected ? '1px solid var(--accent-red, #F0142F)' : '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '9999px',
                      padding: '0.4rem 0.85rem',
                      fontSize: '0.78rem',
                      fontWeight: isSelected ? 700 : 500,
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      boxShadow: isSelected ? '0 0 12px rgba(240, 20, 47, 0.4)' : 'none'
                    }}
                  >
                    {preset.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Oracle Recommendations List */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Film size={15} color="var(--accent-red, #F0142F)" />
                <span>Oracle's Handpicked Matches ({recommendations.length})</span>
              </div>
              <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                Screening now in cinemas
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {recommendations.map(({ movie, matchPct, reasoning }, idx) => (
                <div
                  key={movie._id || idx}
                  style={{
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: idx === 0 ? '1px solid rgba(240, 20, 47, 0.4)' : '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '14px',
                    padding: '1rem',
                    display: 'flex',
                    gap: '1.25rem',
                    alignItems: 'center',
                    boxShadow: idx === 0 ? '0 10px 25px rgba(240, 20, 47, 0.1)' : 'none',
                    position: 'relative',
                    flexWrap: 'wrap'
                  }}
                >
                  {/* Poster */}
                  <div
                    style={{
                      width: '85px',
                      aspectRatio: '2/3',
                      borderRadius: '8px',
                      overflow: 'hidden',
                      flexShrink: 0,
                      boxShadow: '0 8px 18px rgba(0,0,0,0.6)',
                      border: '1px solid rgba(255,255,255,0.1)'
                    }}
                  >
                    <img
                      src={movie.poster}
                      alt={movie.title}
                      referrerPolicy="no-referrer"
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      onError={(e) => {
                        e.target.src = 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=600&q=80';
                      }}
                    />
                  </div>

                  {/* Info Column */}
                  <div style={{ flex: 1, minWidth: '220px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.35rem', flexWrap: 'wrap' }}>
                      <span
                        style={{
                          background: idx === 0 ? 'rgba(34, 197, 94, 0.15)' : 'rgba(251, 191, 36, 0.15)',
                          color: idx === 0 ? '#4ade80' : '#fbbf24',
                          border: idx === 0 ? '1px solid rgba(34, 197, 94, 0.35)' : '1px solid rgba(251, 191, 36, 0.35)',
                          padding: '0.15rem 0.5rem',
                          borderRadius: '6px',
                          fontSize: '0.72rem',
                          fontWeight: 800
                        }}
                      >
                        {matchPct}% Match
                      </span>
                      <div
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.25rem',
                          background: '#f5c518',
                          color: '#000',
                          padding: '0.15rem 0.45rem',
                          borderRadius: '4px',
                          fontSize: '0.72rem',
                          fontWeight: 800
                        }}
                      >
                        <Star size={11} fill="#000" />
                        <span>{movie.rating ? movie.rating.toFixed(1) : '8.5'} IMDb</span>
                      </div>
                      <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                        {movie.certificate || 'U/A'}
                      </span>
                    </div>

                    <h4 style={{ margin: '0 0 0.35rem 0', fontSize: '1.1rem', fontWeight: 800, color: '#f8fafc' }}>
                      {movie.title}
                    </h4>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', fontSize: '0.78rem', color: '#94a3b8', marginBottom: '0.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        <Clock size={12} />
                        <span>{movie.duration} mins</span>
                      </div>
                      <div>{movie.genre?.slice(0, 3).join(' • ')}</div>
                    </div>

                    <p style={{ margin: 0, fontSize: '0.82rem', color: '#cbd5e1', lineHeight: 1.45, fontStyle: 'italic', background: 'rgba(0,0,0,0.25)', padding: '0.5rem 0.75rem', borderRadius: '8px', borderLeft: '3px solid var(--accent-red, #F0142F)' }}>
                      "{reasoning}"
                    </p>
                  </div>

                  {/* Actions Column */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', minWidth: '130px', alignSelf: 'center' }}>
                    <Link
                      to={`/movie/${movie._id}`}
                      onClick={onClose}
                      className="btn-primary"
                      style={{
                        padding: '0.65rem 1rem',
                        fontSize: '0.82rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.4rem',
                        textAlign: 'center',
                        textDecoration: 'none'
                      }}
                    >
                      <Ticket size={14} /> Book Tickets
                    </Link>

                    {movie.trailerUrl && (
                      <button
                        type="button"
                        onClick={() => {
                          onPlayTrailer(movie);
                        }}
                        className="btn-secondary"
                        style={{
                          padding: '0.55rem 0.85rem',
                          fontSize: '0.78rem',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '0.35rem',
                          background: 'rgba(255, 255, 255, 0.06)',
                          cursor: 'pointer'
                        }}
                      >
                        <Play size={13} fill="white" /> Trailer
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AiOracleModal;
