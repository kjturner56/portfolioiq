import { FIELD_REQUIREMENTS, SCORING_STATUS } from '../constants/fieldRequirements';

const CONFIDENCE_PENALTY_PER_MISSING = 0.05;

export function validateAppData(appRecord) {
  const missingRequired = FIELD_REQUIREMENTS.REQUIRED.filter(
    ({ field }) => appRecord[field] == null || appRecord[field] === ''
  );

  const missingRecommended = FIELD_REQUIREMENTS.RECOMMENDED.filter(
    ({ field }) => appRecord[field] == null || appRecord[field] === ''
  );

  if (missingRequired.length > 0) {
    const missingLabels = missingRequired.map(f => f.label).join(', ');
    return {
      scoringStatus:        SCORING_STATUS.UNSCORABLE,
      missingRequired,
      missingRecommended,
      confidenceAdjustment: 0,
      explanation:          `Cannot score: missing required field(s): ${missingLabels}.`,
    };
  }

  const confidenceAdjustment = missingRecommended.length === 0
    ? 0
    : -(missingRecommended.length * CONFIDENCE_PENALTY_PER_MISSING);
  const scoringStatus = missingRecommended.length > 0 ? SCORING_STATUS.PARTIAL : SCORING_STATUS.FULL;

  let explanation;
  if (scoringStatus === SCORING_STATUS.FULL) {
    explanation = 'All required and recommended fields present. Full scoring available.';
  } else {
    const missingLabels = missingRecommended.map(f => f.label).join(', ');
    explanation = `Partial scoring: missing recommended field(s): ${missingLabels}. Confidence reduced by ${Math.abs(confidenceAdjustment * 100).toFixed(0)}%.`;
  }

  return {
    scoringStatus,
    missingRequired,
    missingRecommended,
    confidenceAdjustment,
    explanation,
  };
}
