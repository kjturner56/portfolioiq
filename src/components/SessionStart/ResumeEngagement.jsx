import { useRef, useState } from 'react';
import { COLORS } from '../../constants/colors';
import { CONFIG } from '../../constants/config';
import { useApp } from '../../context/AppContext.jsx';

export default function ResumeEngagement() {
  const { dispatch }                    = useApp();
  const fileInputRef                    = useRef(null);
  const [isDragging, setIsDragging]     = useState(false);
  const [fileError, setFileError]       = useState(null);

  async function processFile(file) {
    setFileError(null);
    let data;
    try {
      const text = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload  = e => resolve(e.target.result);
        reader.onerror = reject;
        reader.readAsText(file);
      });
      data = JSON.parse(text);
    } catch {
      setFileError('Invalid file format — this does not appear to be a PortfolioIQ engagement file.');
      return;
    }

    const version = data?.metadata?.portfolioiq_version;
    if (!CONFIG.SUPPORTED_VERSIONS.includes(version)) {
      setFileError(`Unsupported file version: ${version ?? 'unknown'}. Please update PortfolioIQ.`);
      return;
    }

    dispatch({ type: 'RESTORE_ENGAGEMENT', payload: data });
    dispatch({ type: 'SET_SCREEN',         payload: 'VALIDATION_QUEUE' });
  }

  function handleFileInput(e) {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  }

  function handleDrop(e) {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  }

  return (
    <div>
      <div
        onDragEnter={() => setIsDragging(true)}
        onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        style={{
          border:       `1px dashed ${isDragging ? COLORS.BLUE : COLORS.BORDER_DEFAULT}`,
          borderRadius: 8,
          padding:      24,
          textAlign:    'center',
          cursor:       'pointer',
          background:   isDragging ? COLORS.BLUE_DIM : 'transparent',
          transition:   'border-color 0.15s, background 0.15s',
        }}
      >
        <div style={{ fontSize: 24, color: COLORS.BORDER_DEFAULT, marginBottom: 8 }}>⇩</div>
        <div style={{ fontSize: 11, color: COLORS.TEXT_MUTED }}>Drop .portfolioiq file here</div>
        <div style={{ fontSize: 10, color: COLORS.TEXT_FAINT, marginTop: 4 }}>or click to browse</div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept=".portfolioiq,.json"
        onChange={handleFileInput}
        style={{ display: 'none' }}
      />

      {fileError && (
        <div style={{ marginTop: 10, padding: '10px 14px', borderRadius: 6, background: COLORS.RED_DIM, border: `1px solid ${COLORS.RED}30`, fontSize: 11, color: COLORS.RED }}>
          {fileError}
        </div>
      )}
    </div>
  );
}
