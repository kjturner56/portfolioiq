import { useState } from 'react';
import { COLORS } from '../../constants/colors';
import { CONFIG } from '../../constants/config';
import { useApp } from '../../context/AppContext.jsx';

export default function NewEngagement() {
  const { dispatch } = useApp();
  const [keyValue, setKeyValue]         = useState('');
  const [keyResult, setKeyResult]       = useState(null);
  const [isValidating, setIsValidating] = useState(false);

  async function handleKeyChange(e) {
    const upper = e.target.value.toUpperCase();
    setKeyValue(upper);

    if (CONFIG.KEY_FORMAT_REGEX.test(upper)) {
      setIsValidating(true);
      const { data } = await window.api.validateKey(upper);
      setIsValidating(false);
      setKeyResult(data);
    } else {
      setKeyResult(null);
    }
  }

  function handleStart() {
    if (!keyResult?.valid) return;
    dispatch({ type: 'SET_KEY',    payload: keyResult });
    dispatch({ type: 'SET_SCREEN', payload: 'DATA_UPLOAD' });
  }

  const isValid   = keyResult?.valid === true;
  const isExpired = keyResult?.expired === true;
  const isError   = keyResult && !isValid && !isExpired;

  return (
    <div>
      {/* Label */}
      <div style={{ fontSize: 10, letterSpacing: 1, color: COLORS.TEXT_MUTED, textTransform: 'uppercase', marginBottom: 6 }}>
        Engagement Key
      </div>

      {/* Input */}
      <input
        value={keyValue}
        onChange={handleKeyChange}
        placeholder="PIQ-XXXX-XXXX-XXXX-XXXX-XXXX"
        style={{
          width:        '100%',
          background:   COLORS.BG_OVERLAY,
          border:       `1px solid ${isValid ? COLORS.GREEN : isExpired ? COLORS.AMBER : isError ? COLORS.RED : COLORS.BORDER_DEFAULT}`,
          borderRadius: 6,
          padding:      '10px 14px',
          fontFamily:   'monospace',
          fontSize:     13,
          letterSpacing: 2,
          color:        COLORS.TEXT_PRIMARY,
          outline:      'none',
          boxSizing:    'border-box',
        }}
      />

      {/* Validation result */}
      {isValidating && (
        <div style={{ marginTop: 8, fontSize: 11, color: COLORS.TEXT_MUTED }}>
          Validating…
        </div>
      )}

      {isValid && (
        <div style={{ marginTop: 10, padding: '10px 14px', borderRadius: 6, background: COLORS.GREEN_DIM, border: `1px solid ${COLORS.GREEN}30`, fontSize: 11 }}>
          <div style={{ fontWeight: 700, fontSize: 10, letterSpacing: 1, textTransform: 'uppercase', color: COLORS.GREEN, marginBottom: 4 }}>
            ✓ Key Validated
          </div>
          <div style={{ color: COLORS.TEXT_SECONDARY }}>Client: {keyResult.clientName}</div>
          <div style={{ color: COLORS.TEXT_MUTED, marginTop: 2 }}>
            Expires {keyResult.expiresAt} · {keyResult.daysRemaining} days · {keyResult.appLimit} apps · {keyResult.analysisLimit} analyses
          </div>
        </div>
      )}

      {isExpired && (
        <div style={{ marginTop: 10, padding: '10px 14px', borderRadius: 6, background: COLORS.AMBER_DIM, border: `1px solid ${COLORS.AMBER}30`, fontSize: 11 }}>
          <div style={{ fontWeight: 700, fontSize: 10, letterSpacing: 1, textTransform: 'uppercase', color: COLORS.AMBER, marginBottom: 4 }}>
            ⚠ Licence Expiry
          </div>
          <div style={{ color: COLORS.TEXT_SECONDARY }}>{keyResult.error}</div>
          <div style={{ color: COLORS.TEXT_MUTED, marginTop: 2 }}>
            You can view and export this engagement. Contact Ken Turner to renew.
          </div>
        </div>
      )}

      {isError && (
        <div style={{ marginTop: 10, padding: '10px 14px', borderRadius: 6, background: COLORS.RED_DIM, border: `1px solid ${COLORS.RED}30`, fontSize: 11 }}>
          <div style={{ fontWeight: 700, fontSize: 10, letterSpacing: 1, textTransform: 'uppercase', color: COLORS.RED, marginBottom: 4 }}>
            ✕ Invalid Key
          </div>
          <div style={{ color: COLORS.TEXT_SECONDARY }}>{keyResult.error}</div>
        </div>
      )}

      {/* Start button */}
      <button
        onClick={handleStart}
        disabled={!isValid}
        aria-label="Start Engagement"
        style={{
          marginTop:     12,
          width:         '100%',
          background:    isValid ? COLORS.AMBER : COLORS.BORDER_SUBTLE,
          color:         isValid ? '#000' : COLORS.TEXT_FAINT,
          border:        'none',
          borderRadius:  6,
          padding:       10,
          fontSize:      11,
          fontWeight:    800,
          letterSpacing: 2,
          textTransform: 'uppercase',
          cursor:        isValid ? 'pointer' : 'not-allowed',
        }}
      >
        Start Engagement →
      </button>
    </div>
  );
}
