import React, { useEffect } from 'react';
import { X, ExternalLink } from 'lucide-react';

const extractYouTubeId = (url) => {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
};

const TrailerModal = ({ isOpen, onClose, movieTitle, trailerUrl }) => {
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

  if (!isOpen || !trailerUrl) return null;

  const videoId = extractYouTubeId(trailerUrl);
  const embedUrl = videoId
    ? `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1`
    : null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        backgroundColor: 'rgba(0, 0, 0, 0.88)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.25rem'
      }}
      onClick={onClose}
    >
      <div
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: '920px',
          background: 'var(--bg-panel, #121827)',
          borderRadius: '16px',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.9), 0 0 40px rgba(240, 20, 47, 0.15)',
          overflow: 'hidden'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '1rem 1.5rem',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            background: 'linear-gradient(to right, rgba(240, 20, 47, 0.1), transparent)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <span
              style={{
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                background: 'var(--accent-red, #F0142F)',
                boxShadow: '0 0 10px var(--accent-red, #F0142F)'
              }}
            />
            <h3
              style={{
                margin: 0,
                fontSize: '1.05rem',
                fontWeight: 700,
                color: 'var(--text-main, #F8FAFC)'
              }}
            >
              {movieTitle} — Official Trailer
            </h3>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <a
              href={trailerUrl}
              target="_blank"
              rel="noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                fontSize: '0.78rem',
                color: '#94a3b8',
                textDecoration: 'none',
                padding: '0.3rem 0.6rem',
                borderRadius: '6px',
                background: 'rgba(255, 255, 255, 0.05)'
              }}
              title="Open directly on YouTube"
            >
              <ExternalLink size={13} />
              <span>YouTube</span>
            </a>
            <button
              type="button"
              onClick={onClose}
              style={{
                background: 'rgba(255, 255, 255, 0.1)',
                border: 'none',
                color: '#f8fafc',
                cursor: 'pointer',
                borderRadius: '8px',
                padding: '0.4rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'background 0.2s'
              }}
              aria-label="Close trailer"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Video Player 16:9 */}
        <div
          style={{
            position: 'relative',
            paddingTop: '56.25%', // 16:9 ratio
            background: '#000'
          }}
        >
          {embedUrl ? (
            <iframe
              src={embedUrl}
              title={`${movieTitle} Official Trailer`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                border: 'none'
              }}
            />
          ) : (
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#cbd5e1',
                padding: '1.5rem'
              }}
            >
              <p style={{ marginBottom: '1rem' }}>Trailer playback is available directly on YouTube.</p>
              <a
                href={trailerUrl}
                target="_blank"
                rel="noreferrer"
                className="btn-primary"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
              >
                <ExternalLink size={16} /> Open Trailer on YouTube
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TrailerModal;
