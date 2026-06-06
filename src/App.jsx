import { useApp } from './context/AppContext.jsx';
import SessionStart from './components/SessionStart';
import DataUpload from './components/DataUpload';
import ValidationQueueStub from './components/ValidationQueueStub';
import DashboardStub from './components/DashboardStub';

const SCREENS = {
  SESSION_START:    SessionStart,
  DATA_UPLOAD:      DataUpload,
  VALIDATION_QUEUE: ValidationQueueStub,
  DASHBOARD:        DashboardStub,
};

export default function App() {
  const { state } = useApp();
  const Screen = SCREENS[state.currentScreen] ?? SessionStart;
  return <Screen />;
}
