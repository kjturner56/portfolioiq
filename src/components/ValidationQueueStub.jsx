import { COLORS } from '../constants/colors';

export default function ValidationQueueStub() {
  return (
    <div style={{ background: COLORS.BG_BASE, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ color: COLORS.TEXT_MUTED, fontSize: 14 }}>
        Validation Queue — coming in Session 6
      </div>
    </div>
  );
}
