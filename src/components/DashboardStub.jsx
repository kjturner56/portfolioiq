import { COLORS } from '../constants/colors';

export default function DashboardStub() {
  return (
    <div style={{ background: COLORS.BG_BASE, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ color: COLORS.TEXT_MUTED, fontSize: 14 }}>Dashboard — coming in Session 5</div>
    </div>
  );
}
