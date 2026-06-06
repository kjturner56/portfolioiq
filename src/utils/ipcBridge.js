import { validateKey as _validateKey } from './keyValidation';

const ipcBridge = {
  async validateKey(keyString) {
    try {
      const data = _validateKey(keyString);
      return { data, error: null };
    } catch (err) {
      return { data: null, error: err.message };
    }
  },

  async saveFile(filename, content) {
    const blob = new Blob([content], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
    return { data: { path: filename }, error: null };
  },

  async callClaude(_prompt, _options) {
    return { data: null, error: 'Claude API not yet wired — implemented in Session 2.' };
  },

  async getCredential(key) {
    const value = import.meta.env[`VITE_${key}`] ?? null;
    return {
      data:  value,
      error: value ? null : `Credential ${key} not found in .env`,
    };
  },
};

if (!window.api) {
  window.api = ipcBridge;
}

export default ipcBridge;
