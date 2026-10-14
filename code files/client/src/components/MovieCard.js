import React from 'react';
import { Link } from 'react-router-dom';
import { Star, Clock, Ticket, Play } from 'lucide-react';

const MovieCard = ({ movie, onPlayTrailer }) => {
  return (
    <div className="movie-card">
      <div className="movie-poster-wrap">
        <img
          src={movie.poster}
          alt={movie.title}
          className="movie-poster-img"
          referrerPolicy="no-referrer"
          loading="lazy"
          onError={(e) => {
            e.target.src = 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=600&q=80';
          }}
        />
        {/* Poster dark bottom gradient for high contrast badges */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '60px',
            background: 'linear-gradient(to top, rgba(11, 15, 25, 0.9) 0%, transparent 100%)',
            pointerEvents: 'none'
          }}
        />
        <div className="rating-badge" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
          <Star size={11} fill="#fbbf24" color="#fbbf24" />
          <span>{typeof movie.rating === 'number' ? movie.rating.toFixed(1) : (movie.rating || '8.5')}</span>
          <span style={{ fontSize: '0.62rem', fontWeight: 800, background: '#f5c518', color: '#000', padding: '1px 3px', borderRadius: '2px', marginLeft: '2px' }}>IMDb</span>
        </div>
        <div className="cert-pill">{movie.certificate || 'U/A'}</div>

        {movie.trailerUrl && onPlayTrailer && (
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onPlayTrailer(movie);
            }}
            style={{
              position: 'absolute',
              top: '10px',
              left: '10px',
              background: 'rgba(11, 15, 25, 0.75)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              color: '#fff',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: '0 4px 10px rgba(0,0,0,0.5)',
              backdropFilter: 'blur(4px)',
              transition: 'transform 0.15s, background 0.15s'
            }}
            title="Watch Official Trailer"
            aria-label={`Watch trailer for ${movie.title}`}
          >
            <Play size={14} fill="#fff" style={{ marginLeft: '1px' }} />
          </button>
        )}
      </div>

      <div className="movie-info">
        <h3 className="movie-title" title={movie.title}>{movie.title}</h3>
        <p className="movie-genre">{movie.genre?.join(', ')}</p>

        <div style={{ marginTop: 'auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.85rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <Clock size={13} />
              <span>{movie.duration} mins</span>
            </div>
            <div>{movie.language?.slice(0, 2).join(' • ')}</div>
          </div>

          <Link
            to={`/movie/${movie._id}`}
            className="btn-primary"
            style={{ width: '100%', padding: '0.65rem 0', fontSize: '0.88rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.45rem' }}
          >
            <Ticket size={15} />
            Book Tickets
          </Link>
        </div>
      </div>
    </div>
  );
};

export default MovieCard;
