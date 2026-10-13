import React from 'react';
import { RefreshCw, Film } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[iMovies] ErrorBoundary caught error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#0B0F19',
            color: '#F8FAFC',
            padding: '2rem',
            textAlign: 'center'
          }}
        >
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              backgroundColor: 'rgba(240, 20, 47, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '1.5rem',
              border: '1px solid rgba(240, 20, 47, 0.4)',
              boxShadow: '0 0 25px rgba(240, 20, 47, 0.3)'
            }}
          >
            <Film size={32} color="#F0142F" />
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.75rem' }}>
            iMovies Cinema
          </h1>
          <p
            style={{
              color: '#9AAAC2',
              maxWidth: '460px',
              marginBottom: '1.75rem',
              fontSize: '0.92rem',
              lineHeight: 1.6
            }}
          >
            An unexpected error occurred while loading this view. Click below to refresh the cinema listings.
          </p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              background: '#F0142F',
              color: '#fff',
              border: 'none',
              padding: '0.75rem 1.6rem',
              borderRadius: '8px',
              fontWeight: 700,
              fontSize: '0.9rem',
              cursor: 'pointer',
              boxShadow: '0 4px 15px rgba(240, 20, 47, 0.4)'
            }}
          >
            <RefreshCw size={16} /> Reload Application
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
