export const FIELD_REQUIREMENTS = {
  REQUIRED: [
    { field: 'name',             label: 'Application Name', reason: 'Cannot score without an app name' },
    { field: 'lifecycle_stage',  label: 'Lifecycle Stage',  reason: 'Core scoring dimension' },
    { field: 'support_status',   label: 'Support Status',   reason: 'Core scoring dimension' },
  ],
  RECOMMENDED: [
    { field: 'vendor',              label: 'Vendor',                  reason: 'Improves disposition accuracy' },
    { field: 'annual_cost',         label: 'Annual Cost',             reason: 'Required for savings calculations' },
    { field: 'active_user_count',   label: 'Active Users',            reason: 'Required for utilization scoring' },
    { field: 'incident_count_12mo', label: 'Incident Count (12mo)',   reason: 'Improves risk scoring' },
  ],
  OPTIONAL: [
    { field: 'technical_debt_score',  label: 'Technical Debt Score',  reason: 'Enhances scoring if available' },
    { field: 'business_value_score',  label: 'Business Value Score',  reason: 'Enhances scoring if available' },
    { field: 'security_posture_score', label: 'Security Posture Score', reason: 'Enhances risk scoring' },
  ],
};

export const CONFIDENCE_DEFINITION = {
  FULL:    { min: 0.85, label: 'High Confidence',   description: 'All required and recommended fields present' },
  PARTIAL: { min: 0.65, label: 'Medium Confidence', description: 'All required fields present, some recommended missing' },
  LOW:     { min: 0.00, label: 'Low Confidence',    description: 'One or more recommended fields missing' },
};

export const SCORING_STATUS = {
  FULL:       'FULL',
  PARTIAL:    'PARTIAL',
  UNSCORABLE: 'UNSCORABLE',
};
