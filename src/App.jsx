import { useApp } from './context/AppContext.jsx';
import { COLORS } from './constants/colors';
import { CONFIG } from './constants/config';
import SessionStart from './components/SessionStart';
import DataUpload from './components/DataUpload';
import ValidationQueueStub from './components/ValidationQueueStub';
import DashboardStub from './components/DashboardStub';
import AdvisoryFooter from './components/AdvisoryFooter';

const SCREENS = {
  SESSION_START:    SessionStart,
  DATA_UPLOAD:      DataUpload,
  VALIDATION_QUEUE: ValidationQueueStub,
  DASHBOARD:        DashboardStub,
};

export default function App() {
  const { state } = useApp();
  const Screen = SCREENS[state.currentScreen] ?? SessionStart;
  return (
    <div style={{ background: COLORS.BG_BASE, paddingBottom: CONFIG.FOOTER_HEIGHT }}>
      <Screen />
      <AdvisoryFooter />
    </div>
  );
}
