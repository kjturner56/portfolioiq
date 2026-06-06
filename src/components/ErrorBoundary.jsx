import React from 'react';
import { COLORS } from '../constants/colors';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        background: COLORS.BG_BASE,
        padding: '40px',
      }}>
        <div style={{
          background: COLORS.BG_SURFACE,
          border: `1px solid ${COLORS.RED}`,
          borderRadius: '12px',
          padding: '32px 40px',
          maxWidth: '480px',
          width: '100%',
          textAlign: 'center',
        }}>
          <div style={{ color: COLORS.RED, fontSize: '18px', fontWeight: 700, marginBottom: '12px' }}>
            Something went wrong
          </div>
          <div style={{
            color: COLORS.TEXT_MUTED,
            fontSize: '12px',
            fontFamily: 'monospace',
            marginBottom: '24px',
            wordBreak: 'break-word',
          }}>
            {this.state.error?.message ?? 'Unknown error'}
          </div>
          <button
            onClick={() => window.location.reload()}
            style={{
              background: COLORS.AMBER,
              color: '#000',
              border: 'none',
              borderRadius: '6px',
              padding: '10px 24px',
              fontSize: '11px',
              fontWeight: 800,
              letterSpacing: '2px',
              textTransform: 'uppercase',
              cursor: 'pointer',
            }}
          >
            Reload
          </button>
        </div>
      </div>
    );
  }
}
