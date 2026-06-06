import { COLORS } from '../../constants/colors';
import { useApp } from '../../context/AppContext.jsx';
import { DEMO_ENGAGEMENT } from '../../constants/demoData';

export default function QuickDemo() {
  const { dispatch } = useApp();

  function handleLaunchDemo() {
    dispatch({ type: 'LOAD_DEMO',  payload: DEMO_ENGAGEMENT });
    dispatch({ type: 'SET_SCREEN', payload: 'DASHBOARD' });
  }

  return (
    <div>
      <div style={{
        display:      'inline-block',
        background:   COLORS.GREEN_DIM,
        border:       `1px solid ${COLORS.GREEN}30`,
        color:        COLORS.GREEN,
        fontSize:     9,
        fontWeight:   700,
        letterSpacing: 1,
        textTransform: 'uppercase',
        padding:      '3px 8px',
        borderRadius: 4,
        marginBottom: 10,
      }}>
        DEMO MODE
      </div>

      <div style={{ fontSize: 11, color: COLORS.TEXT_MUTED, lineHeight: 1.6, marginBottom: 12 }}>
        Loads <strong style={{ color: COLORS.TEXT_SECONDARY }}>Nexus Global Solutions</strong> — 15 sample applications across all four dispositions (Retain, Modernize, Retire, Replace) and Gartner TIME quadrants.
      </div>

      <div style={{ fontSize: 10, color: COLORS.TEXT_FAINT, marginBottom: 14 }}>
        Exports show "DEMO MODE" watermark.
      </div>

      <button
        onClick={handleLaunchDemo}
        aria-label="Launch Demo"
        style={{
          width:         '100%',
          background:    'transparent',
          color:         COLORS.GREEN,
          border:        `1px solid ${COLORS.GREEN}44`,
          borderRadius:  6,
          padding:       10,
          fontSize:      11,
          fontWeight:    700,
          letterSpacing: 2,
          textTransform: 'uppercase',
          cursor:        'pointer',
        }}
      >
        Launch Demo →
      </button>
    </div>
  );
}
