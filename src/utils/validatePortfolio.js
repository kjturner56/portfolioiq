import { validateAppData } from './validateAppData';
import { SCORING_STATUS } from '../constants/fieldRequirements';

export function validatePortfolio(applications) {
  const results = applications.map(app => validateAppData(app));

  const fullyScorable      = results.filter(r => r.scoringStatus === SCORING_STATUS.FULL).length;
  const partiallyScorable  = results.filter(r => r.scoringStatus === SCORING_STATUS.PARTIAL).length;
  const unscorable         = results.filter(r => r.scoringStatus === SCORING_STATUS.UNSCORABLE).length;

  // Aggregate missing field counts across all apps
  const fieldCounts = {};
  results.forEach(r => {
    [...r.missingRequired, ...r.missingRecommended].forEach(({ field, label, reason }) => {
      if (!fieldCounts[field]) fieldCounts[field] = { field, label, reason, affectedAppCount: 0 };
      fieldCounts[field].affectedAppCount++;
    });
  });
  const missingFieldSummary = Object.values(fieldCounts).sort(
    (a, b) => b.affectedAppCount - a.affectedAppCount
  );

  const canProceed = unscorable < applications.length;

  let blockerMessage = null;
  if (!canProceed) {
    blockerMessage = 'All applications are missing required fields. Add Application Name, Lifecycle Stage, and Support Status to at least one app before running analysis.';
  }

  return {
    totalApps: applications.length,
    fullyScorable,
    partiallyScorable,
    unscorable,
    missingFieldSummary,
    canProceed,
    blockerMessage,
  };
}
