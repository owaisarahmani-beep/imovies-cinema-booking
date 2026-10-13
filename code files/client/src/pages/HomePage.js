import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import MovieCard from '../components/MovieCard';
import TrailerModal from '../components/TrailerModal';
import AiOracleModal from '../components/AiOracleModal';
import { Search, Play, Sparkles, Filter, AlertCircle, RotateCcw, X, Star, Clock, Ticket, ChevronLeft, ChevronRight } from 'lucide-react';

const HomePage = ({ selectedCity }) => {
  const [movies, setMovies] = useState([]);
  const [featuredMovie, setFeaturedMovie] = useState(null);
  const [genres, setGenres] = useState(['All']);
  const [languages, setLanguages] = useState(['All']);
  const [selectedGenre, setSelectedGenre] = useState('All');
  const [selectedLanguage, setSelectedLanguage] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  // In-App Trailer Modal & AI Oracle State
  const [activeTrailerMovie, setActiveTrailerMovie] = useState(null);
  const [isOracleOpen, setIsOracleOpen] = useState(false);

  // Hero Spotlight Carousel State
  const [currentSlide, setCurrentSlide] = useState(0);
  const [touchStartX, setTouchStartX] = useState(null);
  const [touchEndX, setTouchEndX] = useState(null);

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedGenre('All');
    setSelectedLanguage('All');
  };

  const hasActiveFilters = searchQuery.trim() !== '' || selectedGenre !== 'All' || selectedLanguage !== 'All';

  // Get top featured movies for the hero carousel (up to 6 spotlight titles)
  const spotlightMovies = movies.length > 0 ? movies.slice(0, 6) : (featuredMovie ? [featuredMovie] : []);
  const activeMovie = spotlightMovies[currentSlide] || featuredMovie || movies[0];

  // Auto-play timer for hero carousel: smoothly cycles every 4.5 seconds
  useEffect(() => {
    if (spotlightMovies.length <= 1) return;

    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % spotlightMovies.length);
    }, 4500);

    return () => clearInterval(timer);
  }, [spotlightMovies.length, currentSlide]);

  const nextSlide = () => {
    if (spotlightMovies.length <= 1) return;
    setCurrentSlide((prev) => (prev + 1) % spotlightMovies.length);
  };

  const prevSlide = () => {
    if (spotlightMovies.length <= 1) return;
    setCurrentSlide((prev) => (prev - 1 + spotlightMovies.length) % spotlightMovies.length);
  };

  // Swipable touch handlers
  const handleTouchStart = (e) => {
    setTouchStartX(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e) => {
    setTouchEndX(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (touchStartX === null || touchEndX === null) return;
    const distance = touchStartX - touchEndX;
    if (distance > 50) {
      nextSlide();
    } else if (distance < -50) {
      prevSlide();
    }
    setTouchStartX(null);
    setTouchEndX(null);
  };

  // Fetch filter metadata (unique genres and languages)
  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const res = await api.get('/movies/filters/metadata');
        if (res.data.success) {
          if (res.data.genres) setGenres(['All', ...res.data.genres]);
          if (res.data.languages) setLanguages(['All', ...res.data.languages]);
        }
      } catch (err) {
        console.error('Metadata fetch error:', err);
      }
    };
    fetchMetadata();
  }, []);

  // Fetch movies with filters
  useEffect(() => {
    const fetchMovies = async () => {
      setLoading(true);
      try {
        const params = { limit: 50 };
        if (searchQuery) params.search = searchQuery;
        if (selectedGenre !== 'All') params.genre = selectedGenre;
        if (selectedLanguage !== 'All') params.language = selectedLanguage;

        const res = await api.get('/movies', { params });
        if (res.data.success) {
          setMovies(res.data.movies);
          if (!featuredMovie && res.data.movies.length > 0) {
            setFeaturedMovie(res.data.movies[0]);
          }
        }
      } catch (err) {
        console.error('Movie fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    const delayDebounceFn = setTimeout(() => {
      fetchMovies();
    }, 250);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, selectedGenre, selectedLanguage]);

  return (
    <div>
      {/* Cinematic Hero Spotlight Banner Carousel */}
      {activeMovie && (
        <div
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          style={{
            position: 'relative',
            minHeight: '520px',
            display: 'flex',
            alignItems: 'center',
            backgroundImage: `linear-gradient(90deg, rgba(11, 15, 25, 0.96) 0%, rgba(11, 15, 25, 0.85) 38%, rgba(11, 15, 25, 0.25) 75%, rgba(11, 15, 25, 0.65) 100%), linear-gradient(0deg, #0b0f19 0%, transparent 40%), url(${activeMovie.banner || activeMovie.poster})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center top',
            borderBottom: '1px solid var(--border-subtle)',
            padding: '3.5rem 0 4rem 0',
            transition: 'background-image 0.6s ease-in-out',
            overflow: 'hidden'
          }}
        >
          {/* Previous / Next Arrow Controls */}
          {spotlightMovies.length > 1 && (
            <>
              <button
                type="button"
                onClick={prevSlide}
                className="hero-nav-btn prev"
                aria-label="Previous movie"
              >
                <ChevronLeft size={24} />
              </button>
              <button
                type="button"
                onClick={nextSlide}
                className="hero-nav-btn next"
                aria-label="Next movie"
              >
                <ChevronRight size={24} />
              </button>
            </>
          )}

          <div className="container" style={{ width: '100%', position: 'relative', zIndex: 2 }}>
            <div style={{ maxWidth: '660px' }}>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  background: 'rgba(240, 20, 47, 0.18)',
                  color: '#ff4d58',
                  padding: '0.35rem 0.85rem',
                  borderRadius: '9999px',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  marginBottom: '1rem',
                  border: '1px solid rgba(240, 20, 47, 0.35)',
                  boxShadow: '0 0 16px rgba(240, 20, 47, 0.2)'
                }}
              >
                <Sparkles size={14} /> SPOTLIGHT CINEMA {spotlightMovies.length > 1 ? `• ${currentSlide + 1}/${spotlightMovies.length}` : ''}
              </div>

              <h1 style={{ fontSize: '3rem', fontWeight: 900, lineHeight: 1.1, marginBottom: '0.9rem', color: '#f8fafc', letterSpacing: '-0.5px' }}>
                {activeMovie.title}
              </h1>

              {/* Rich Movie Meta Badges */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap', marginBottom: '1.1rem' }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', background: 'rgba(251, 191, 36, 0.15)', color: '#fbbf24', border: '1px solid rgba(251, 191, 36, 0.35)', padding: '0.25rem 0.65rem', borderRadius: '6px', fontSize: '0.82rem', fontWeight: 700 }}>
                  <Star size={13} fill="#fbbf24" color="#fbbf24" />
                  <span>{activeMovie.rating ? activeMovie.rating.toFixed(1) : '8.5'}</span>
                </div>
                <div style={{ background: 'rgba(255, 255, 255, 0.08)', border: '1px solid rgba(255, 255, 255, 0.15)', color: '#f8fafc', padding: '0.25rem 0.65rem', borderRadius: '6px', fontSize: '0.78rem', fontWeight: 700 }}>
                  {activeMovie.certificate || 'U/A'}
                </div>
                {activeMovie.duration && (
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', background: 'rgba(255, 255, 255, 0.08)', border: '1px solid rgba(255, 255, 255, 0.15)', color: '#cbd5e1', padding: '0.25rem 0.65rem', borderRadius: '6px', fontSize: '0.78rem', fontWeight: 600 }}>
                    <Clock size={13} />
                    <span>{activeMovie.duration} mins</span>
                  </div>
                )}
                {activeMovie.genre && activeMovie.genre.length > 0 && (
                  <div style={{ color: '#94a3b8', fontSize: '0.82rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <span>•</span>
                    <span>{activeMovie.genre.slice(0, 3).join(' • ')}</span>
                  </div>
                )}
              </div>

              <p style={{ color: '#cbd5e1', fontSize: '0.96rem', lineHeight: 1.6, marginBottom: '1.6rem', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                {activeMovie.description}
              </p>

              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                <Link to={`/movie/${activeMovie._id}`} className="btn-primary" style={{ padding: '0.85rem 1.85rem', fontSize: '0.95rem' }}>
                  <Ticket size={17} />
                  Book Tickets Now
                </Link>
                {activeMovie.trailerUrl && (
                  <button
                    type="button"
                    onClick={() => setActiveTrailerMovie(activeMovie)}
                    className="btn-secondary"
                    style={{
                      padding: '0.85rem 1.6rem',
                      fontSize: '0.95rem',
                      background: 'rgba(255, 255, 255, 0.08)',
                      backdropFilter: 'blur(8px)',
                      cursor: 'pointer',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}
                  >
                    <Play size={16} fill="white" />
                    Watch Trailer
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Dots Indicator for Carousel */}
          {spotlightMovies.length > 1 && (
            <div className="hero-dots-container">
              {spotlightMovies.map((m, idx) => (
                <button
                  key={m._id || idx}
                  type="button"
                  onClick={() => setCurrentSlide(idx)}
                  className={`hero-dot ${idx === currentSlide ? 'active' : 'inactive'}`}
                  aria-label={`Go to slide ${idx + 1}: ${m.title}`}
                />
              ))}
            </div>
          )}

          {/* Subtle bottom gradient fade to body */}
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '80px', background: 'linear-gradient(to top, var(--bg-main) 0%, transparent 100%)', pointerEvents: 'none' }} />
        </div>
      )}

      {/* Main Movie Discovery Container */}
      <div className="container" style={{ marginTop: '2.5rem' }}>
        {/* Search & Filter Toolbar */}
        <div
          style={{
            background: 'rgba(18, 24, 39, 0.85)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '16px',
            padding: '1.4rem 1.6rem',
            marginBottom: '2.5rem',
            boxShadow: '0 12px 36px rgba(0, 0, 0, 0.35)',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.1rem'
          }}
        >
          {/* Active Filters Bar */}
          {hasActiveFilters && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.82rem', color: 'var(--accent-red)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <Filter size={13} /> Active filters applied
              </span>
              <button
                type="button"
                onClick={handleClearFilters}
                style={{
                  background: 'rgba(240, 20, 47, 0.12)',
                  border: '1px solid rgba(240, 20, 47, 0.3)',
                  color: 'var(--accent-red-hover)',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  borderRadius: '6px',
                  padding: '0.25rem 0.65rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem'
                }}
              >
                <RotateCcw size={12} /> Reset All Filters
              </button>
            </div>
          )}

          {/* Search Box */}
          <div className="search-box-wrap">
            <Search size={18} style={{ position: 'absolute', left: '1rem', color: '#94a3b8' }} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search movies by title, actors, director..."
              style={{
                width: '100%',
                background: 'transparent',
                border: 'none',
                color: 'white',
                padding: searchQuery ? '0.85rem 2.4rem 0.85rem 2.8rem' : '0.85rem 1rem 0.85rem 2.8rem',
                fontSize: '0.92rem',
                outline: 'none'
              }}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                style={{
                  position: 'absolute',
                  right: '0.8rem',
                  background: 'none',
                  border: 'none',
                  color: '#94a3b8',
                  cursor: 'pointer',
                  padding: '0.2rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                aria-label="Clear search"
              >
                <X size={16} />
              </button>
            )}
          </div>

          {/* Genre Filter Pills */}
          <div className="filter-scroll-row">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.85rem', color: '#94a3b8', marginRight: '0.5rem', flexShrink: 0 }}>
              <Filter size={15} /> Genre:
            </div>
            {genres.map((genre) => (
              <button
                key={genre}
                className={`filter-pill ${selectedGenre === genre ? 'active' : ''}`}
                onClick={() => setSelectedGenre(genre)}
              >
                {genre}
              </button>
            ))}
          </div>

          {/* Language Filter Pills */}
          {languages.length > 2 && (
            <div className="filter-scroll-row">
              <div style={{ fontSize: '0.85rem', color: '#94a3b8', marginRight: '0.5rem', flexShrink: 0 }}>
                Language:
              </div>
              {languages.map((lang) => (
                <button
                  key={lang}
                  className={`filter-pill ${selectedLanguage === lang ? 'active' : ''}`}
                  onClick={() => setSelectedLanguage(lang)}
                >
                  {lang}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Section Heading */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.3rem' }}>
              <div style={{ width: '4px', height: '22px', background: 'var(--accent-red)', borderRadius: '2px' }} />
              <h2 style={{ fontSize: '1.65rem', fontWeight: 800, letterSpacing: '-0.3px', margin: 0 }}>Now Showing in Cinemas</h2>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', margin: 0, paddingLeft: '0.85rem' }}>
              {selectedCity !== 'All' ? `Featuring premiere screens across ${selectedCity}` : 'Explore blockbuster releases near you'}
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={() => setIsOracleOpen(true)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.45rem',
                background: 'linear-gradient(135deg, rgba(240, 20, 47, 0.25) 0%, rgba(18, 24, 39, 0.95) 100%)',
                color: '#f8fafc',
                border: '1px solid rgba(240, 20, 47, 0.45)',
                padding: '0.42rem 0.9rem',
                borderRadius: '8px',
                fontSize: '0.82rem',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 4px 15px rgba(240, 20, 47, 0.2)',
                transition: 'all 0.2s ease'
              }}
              title="Get personalized recommendations from AI Cinema Oracle"
            >
              <Sparkles size={14} color="#fbbf24" />
              <span>Ask AI Oracle</span>
            </button>
            <span style={{ fontSize: '0.82rem', color: '#94a3b8', background: 'rgba(255, 255, 255, 0.05)', padding: '0.35rem 0.8rem', borderRadius: '9999px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
              {movies.length} Releases Available
            </span>
          </div>
        </div>

        {/* Movie Grid */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '4rem 0', color: '#94a3b8' }}>
            <p>Loading cinema listings...</p>
          </div>
        ) : movies.length === 0 ? (
          <div
            style={{
              textAlign: 'center',
              padding: '4rem 1rem',
              background: 'var(--bg-surface)',
              borderRadius: '14px',
              border: '1px solid var(--border-subtle)'
            }}
          >
            <AlertCircle size={40} color="var(--accent-red)" style={{ marginBottom: '1rem' }} />
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.4rem' }}>No Movies Found</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginBottom: hasActiveFilters ? '1.5rem' : '0' }}>
              {hasActiveFilters
                ? 'No cinema listings match your search or filter criteria.'
                : 'No movies are currently scheduled.'}
            </p>
            {hasActiveFilters && (
              <button
                onClick={handleClearFilters}
                className="btn-primary"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.65rem 1.4rem',
                  fontSize: '0.88rem',
                  cursor: 'pointer'
                }}
              >
                <RotateCcw size={15} /> Clear All Filters
              </button>
            )}
          </div>
        ) : (
          <div className="grid-movies">
            {movies.map((movie) => (
              <MovieCard key={movie._id} movie={movie} onPlayTrailer={setActiveTrailerMovie} />
            ))}
          </div>
        )}
      </div>

      {/* Floating AI Cinema Oracle Action Button */}
      <button
        type="button"
        onClick={() => setIsOracleOpen(true)}
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          zIndex: 900,
          background: 'linear-gradient(135deg, #F0142F 0%, #990B1E 100%)',
          color: '#ffffff',
          border: '1px solid rgba(255, 255, 255, 0.25)',
          borderRadius: '9999px',
          padding: '0.75rem 1.25rem',
          fontSize: '0.88rem',
          fontWeight: 800,
          display: 'flex',
          alignItems: 'center',
          gap: '0.55rem',
          cursor: 'pointer',
          boxShadow: '0 10px 25px rgba(240, 20, 47, 0.45), 0 0 20px rgba(240, 20, 47, 0.3)',
          transition: 'all 0.2s ease',
          backdropFilter: 'blur(10px)'
        }}
        title="Open AI Cinema Oracle"
        aria-label="Open AI Cinema Oracle"
      >
        <Sparkles size={17} color="#fbbf24" />
        <span>Ask AI Oracle</span>
      </button>

      {/* In-App Video Trailer Modal */}
      <TrailerModal
        isOpen={!!activeTrailerMovie}
        onClose={() => setActiveTrailerMovie(null)}
        movieTitle={activeTrailerMovie?.title}
        trailerUrl={activeTrailerMovie?.trailerUrl}
      />

      {/* AI Cinema Oracle Modal */}
      <AiOracleModal
        isOpen={isOracleOpen}
        onClose={() => setIsOracleOpen(false)}
        movies={movies}
        onPlayTrailer={(m) => {
          setIsOracleOpen(false);
          setActiveTrailerMovie(m);
        }}
      />
    </div>
  );
};

export default HomePage;
