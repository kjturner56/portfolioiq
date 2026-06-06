import { COLORS } from '../constants/colors';

export default function SessionStart() {
  return (
    <div style={{ background: COLORS.BG_BASE, minHeight: '100vh' }}>
      <div style={{ textAlign: 'center', paddingTop: 120 }}>
        <div style={{ fontSize: 32, fontWeight: 800, letterSpacing: 3, color: COLORS.TEXT_PRIMARY, textTransform: 'uppercase' }}>
          PortfolioIQ
        </div>
      </div>
    </div>
  );
}
