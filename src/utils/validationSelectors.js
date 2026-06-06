export function getValidationProgress(validationStates) {
  const entries = Object.values(validationStates);
  const total      = entries.length;
  const pending    = entries.filter(e => e.status === 'PENDING').length;
  const accepted   = entries.filter(e => e.status === 'ACCEPTED').length;
  const overridden = entries.filter(e => e.status === 'OVERRIDDEN').length;
  const escalated  = entries.filter(e => e.status === 'ESCALATED').length;
  const excluded   = entries.filter(e => e.status === 'EXCLUDED').length;

  const percentComplete = total === 0 ? 0 : Math.round(((total - pending) / total) * 100);
  const canExport = total > 0 && pending === 0;

  return { total, pending, accepted, overridden, escalated, excluded, percentComplete, canExport };
}

export function getUnvalidatedApps(validationStates) {
  return Object.entries(validationStates)
    .filter(([, entry]) => entry.status === 'PENDING')
    .map(([appId]) => appId);
}

export function isExportAllowed(validationStates) {
  const entries = Object.values(validationStates);
  if (entries.length === 0) return false;
  return entries.every(e => e.status !== 'PENDING');
}
