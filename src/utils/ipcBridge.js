import { validateKey as _validateKey } from './keyValidation';
import { REQUIRED_APP_FIELDS } from '../constants/config';

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
  // Session 2 enforces permitted field filtering inside scoreApplication().
  async callClaude(_prompt, _options) {
    return { data: null, error: 'Claude API not yet wired — implemented in Session 2.' };
  },

  async scoreApplication(_appData) {
    return {
      data: {
        disposition: 'Retain',
        scoring_breakdown: {
          technical_debt_score: 0,
          business_value_score: 0,
          security_posture_score: 0,
        },
        uncertainty_flags: {
          data_conflicts: false,
          unusual_vendor: false,
          low_data_quality: false,
          low_confidence_reason: null,
          requires_human_review: false,
        },
        replacement_suggestions: [],
        time_classification: 'Invest',
        confidence: 0,
        ai_reasoning: 'Phase 1a stub — AI scoring implemented in Session 2.',
      },
      error: null,
    };
  },

  async mapSchema(headers, _samples) {
    return {
      data: {
        mappings: [],
        unmappedColumns: headers,
        unmappedRequiredFields: [...REQUIRED_APP_FIELDS],
        canProceedToScoring: false,
      },
      error: null,
    };
  },

  async saveAnalystConfig(config) {
    try {
      const content = JSON.stringify(config, null, 2);
      const blob = new Blob([content], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'analyst_config.json';
      a.click();
      URL.revokeObjectURL(url);
      return { data: { path: 'analyst_config.json' }, error: null };
    } catch (err) {
      return { data: null, error: err.message };
    }
  },

  async loadAnalystConfig() {
    try {
      const raw = import.meta.env.VITE_ANALYST_CONFIG ?? null;
      if (!raw) return { data: null, error: null };
      return { data: JSON.parse(raw), error: null };
    } catch (err) {
      return { data: null, error: err.message };
    }
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
