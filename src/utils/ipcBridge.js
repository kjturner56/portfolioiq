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

  // PERMITTED FIELDS — only these may be included in Claude API prompts:
  // name, vendor, lifecycle_stage, support_status,
  // incident_count_12mo, annual_cost, active_user_count,
  // ai_disposition, technical_debt_score, business_value_score
  //
  // NEVER SEND: free text fields, employee names, email addresses,
  // custom notes, or any field not in the above list.
  // Session 2 enforces this in buildScoringPrompt().
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
