import { validateKey as _validateKey } from './keyValidation';
import { REQUIRED_APP_FIELDS } from '../constants/config';

const VALID_DISPOSITIONS = ['Retain', 'Modernize', 'Retire', 'Replace'];

const KNOWN_SCORE_FIELDS = [
  'technical_debt_score',
  'business_value_score',
  'security_posture_score',
];

function validateScoringResponse(response) {
  // 1. Must be a non-null, non-array object
  if (response === null || typeof response !== 'object' || Array.isArray(response)) {
    return {
      valid: false,
      error: {
        code: 'INVALID_SCORING_RESPONSE',
        message: 'Response must be a non-null object.',
        context: { field: 'response' },
      },
    };
  }

  // 2. disposition must be one of VALID_DISPOSITIONS
  if (!VALID_DISPOSITIONS.includes(response.disposition)) {
    return {
      valid: false,
      error: {
        code: 'INVALID_SCORING_RESPONSE',
        message: `disposition must be one of: ${VALID_DISPOSITIONS.join(', ')}.`,
        context: { field: 'disposition' },
      },
    };
  }

  // 3. confidence must be a finite number between 0.0 and 1.0 inclusive
  if (!Number.isFinite(response.confidence) || response.confidence < 0.0 || response.confidence > 1.0) {
    return {
      valid: false,
      error: {
        code: 'INVALID_SCORING_RESPONSE',
        message: 'confidence must be a number between 0.0 and 1.0 inclusive.',
        context: { field: 'confidence' },
      },
    };
  }

  // 4. scoring_breakdown must exist and be a non-null object
  if (
    typeof response.scoring_breakdown !== 'object' ||
    response.scoring_breakdown === null ||
    Array.isArray(response.scoring_breakdown)
  ) {
    return {
      valid: false,
      error: {
        code: 'INVALID_SCORING_RESPONSE',
        message: 'scoring_breakdown must be a non-null object.',
        context: { field: 'scoring_breakdown' },
      },
    };
  }

  // 5. Any known score fields that are present must be numbers between 0 and 100 inclusive
  for (const field of KNOWN_SCORE_FIELDS) {
    if (Object.prototype.hasOwnProperty.call(response.scoring_breakdown, field)) {
      const score = response.scoring_breakdown[field];
      if (!Number.isFinite(score) || score < 0 || score > 100) {
        return {
          valid: false,
          error: {
            code: 'INVALID_SCORING_RESPONSE',
            message: `scoring_breakdown.${field} must be a number between 0 and 100 inclusive.`,
            context: { field: `scoring_breakdown.${field}` },
          },
        };
      }
    }
  }

  // 6. uncertainty_flags must exist and be a non-null object
  if (
    response.uncertainty_flags === null ||
    response.uncertainty_flags === undefined ||
    typeof response.uncertainty_flags !== 'object' ||
    Array.isArray(response.uncertainty_flags)
  ) {
    return {
      valid: false,
      error: {
        code: 'INVALID_SCORING_RESPONSE',
        message: 'uncertainty_flags must be a non-null object.',
        context: { field: 'uncertainty_flags' },
      },
    };
  }

  // 7. uncertainty_flags.requires_human_review must be a boolean
  if (typeof response.uncertainty_flags.requires_human_review !== 'boolean') {
    return {
      valid: false,
      error: {
        code: 'INVALID_SCORING_RESPONSE',
        message: 'uncertainty_flags.requires_human_review must be a boolean.',
        context: { field: 'uncertainty_flags.requires_human_review' },
      },
    };
  }

  return { valid: true, error: null };
}

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
// exported for testing only — never import from React components
export { validateScoringResponse };
