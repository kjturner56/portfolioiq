import { COLORS } from '../constants/colors';
import { CONFIG } from '../constants/config';

// Persistent legal disclaimer shown on every screen. Never dismissible.
export default function AdvisoryFooter() {
  return (
    <footer
      style={{
        position: 'fixed',
        left: 0,
        right: 0,
        bottom: 0,
        height: CONFIG.FOOTER_HEIGHT,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: COLORS.BG_BASE,
        borderTop: `1px solid ${COLORS.BORDER_SUBTLE}`,
        color: COLORS.TEXT_DISCLAIMER,
        fontSize: 13,
        letterSpacing: 0.2,
        padding: '0 16px',
        textAlign: 'center',
      }}
    >
      {CONFIG.DISCLAIMERS.ADVISORY_FOOTER}
    </footer>
  );
}
