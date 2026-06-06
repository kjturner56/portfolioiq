import { useState } from 'react';
import { COLORS } from '../constants/colors';
import NewEngagement from './SessionStart/NewEngagement';
import ResumeEngagement from './SessionStart/ResumeEngagement';
import QuickDemo from './SessionStart/QuickDemo';

const MODES = [
  {
    id:          'new',
    label:       'NEW ENGAGEMENT',
    labelColor:  COLORS.AMBER,
    title:       'Start fresh with a new client',
    desc:        'Upload client data and run AI analysis.',
    note:        'Requires an engagement key',
    Content:     NewEngagement,
  },
  {
    id:          'resume',
    label:       'RESUME ENGAGEMENT',
    labelColor:  COLORS.BLUE,
    title:       'Continue a project already in progress',
    desc:        'Import your .portfolioiq file. Key is auto-detected.',
    note:        'Key auto-detected from file',
    Content:     ResumeEngagement,
  },
  {
    id:          'demo',
    label:       'QUICK DEMO',
    labelColor:  COLORS.GREEN,
    title:       'Explore with sample data',
    desc:        'No key needed. All features available. Nothing is saved.',
    note:        'No key · No data stored',
    Content:     QuickDemo,
  },
];

export default function SessionStart() {
  const [activeMode, setActiveMode] = useState(null);

  function handleCardClick(modeId) {
    setActiveMode(prev => (prev === modeId ? null : modeId));
  }

  return (
    <div style={{ background: COLORS.BG_BASE, minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>

      {/* Logo */}
      <div style={{ textAlign: 'center', marginBottom: 48 }}>
        <div style={{ fontSize: 32, fontWeight: 800, letterSpacing: 3, color: COLORS.TEXT_PRIMARY, textTransform: 'uppercase' }}>
          PortfolioIQ
        </div>
        <div style={{ fontSize: 11, letterSpacing: 4, color: COLORS.TEXT_FAINT, textTransform: 'uppercase', marginTop: 4 }}>
          by Telority
        </div>
      </div>

      {/* Mode cards */}
      <div style={{ display: 'flex', gap: 16, width: '100%', maxWidth: 780 }}>
        {MODES.map(({ id, label, labelColor, title, desc, note, Content }) => {
          const isActive = activeMode === id;
          return (
            <div
              key={id}
              data-mode={id}
              data-active={String(isActive)}
              onClick={() => handleCardClick(id)}
              style={{
                flex: 1,
                background: COLORS.BG_SURFACE,
                border: `1px solid ${isActive ? labelColor : COLORS.BORDER_SUBTLE}`,
                borderRadius: 12,
                padding: '28px 24px',
                cursor: 'pointer',
                transition: 'border-color 0.15s',
              }}
            >
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', color: labelColor, marginBottom: 12 }}>
                {label}
              </div>
              <div style={{ fontSize: 16, fontWeight: 600, color: COLORS.TEXT_PRIMARY, marginBottom: 8 }}>
                {title}
              </div>
              <div style={{ fontSize: 12, color: COLORS.TEXT_MUTED, lineHeight: 1.5, marginBottom: 16 }}>
                {desc}
              </div>
              <div style={{ fontSize: 11, color: COLORS.TEXT_FAINT }}>
                {note}
              </div>

              {isActive && (
                <div
                  style={{ marginTop: 20, borderTop: `1px solid ${COLORS.BORDER_SUBTLE}`, paddingTop: 20 }}
                  onClick={e => e.stopPropagation()}
                >
                  <Content />
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div style={{ marginTop: 40, fontSize: 10, color: COLORS.TEXT_FAINT }}>
        PortfolioIQ v2.3 · Phase 1a
      </div>
    </div>
  );
}
