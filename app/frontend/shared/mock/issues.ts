export type IssueSeverity = 'critical' | 'high' | 'medium' | 'low';
export type IssueStatus =
  | 'new' | 'confirmed' | 'investigating' | 'action_required'
  | 'in_progress' | 'monitoring' | 'verified' | 'closed' | 'dismissed';
export type ActionStatus = 'overdue' | 'in_progress' | 'pending' | 'awaiting_approval' | 'completed' | 'monitoring';

export interface Issue {
  id: string;
  title: string;
  severity: IssueSeverity;
  riskAmount: number;
  riskLabel: string;
  evidenceReviews: number;
  evidenceTickets: number;
  evidenceUsers: number;
  scope: string;
  trend: string;
  trendDir: 'up' | 'down';
  trendWindow: string;
  owner: string;
  ageLabel: string;
  status: IssueStatus;
  nextAction: string;
  rootCause: string;
  summary: string;
  product: string; // UI compatibility: affected business scope.
  detectedDate: string;
}

export interface MockAction {
  id: string;
  title: string;
  issueId: string;
  issueTitle: string;
  product: string; // UI compatibility: affected business scope.
  owner: string;
  due: string;
  status: ActionStatus;
  outcome: string;
  verification: string;
}

// Cross-industry demo data is intentional. Orbit's domain is customer operations,
// not a single vertical: Signal -> Issue -> Action -> Outcome -> Impact.
export const MOCK_ISSUES: Issue[] = [
  {
    id: 'i1',
    title: 'Appointment wait-time complaints increasing at two clinics',
    severity: 'critical',
    riskAmount: 73000,
    riskLabel: '$73K estimated retention risk',
    evidenceReviews: 89,
    evidenceTickets: 24,
    evidenceUsers: 1240,
    scope: 'Northstar Health · Dallas clinics',
    trend: '+34%',
    trendDir: 'up',
    trendWindow: '7 days',
    owner: 'Clinic Operations',
    ageLabel: '6 days',
    status: 'investigating',
    nextAction: 'Rebalance appointment capacity',
    rootCause: 'Morning appointment demand exceeds staffed capacity after a scheduling-policy change, creating sustained delays at two clinics.',
    summary: '89 reviews and 24 service conversations mention long waits. Volume increased 34% in 7 days, concentrated at two clinics.',
    product: 'Northstar Health',
    detectedDate: 'Jun 10, 2026',
  },
  {
    id: 'i2',
    title: 'Wash-quality complaints rising at three locations',
    severity: 'high',
    riskAmount: 38000,
    riskLabel: '$38K estimated membership risk',
    evidenceReviews: 58,
    evidenceTickets: 31,
    evidenceUsers: 340,
    scope: 'Northstar Auto · North Texas',
    trend: '+22%',
    trendDir: 'up',
    trendWindow: '14 days',
    owner: 'Regional Operations',
    ageLabel: '14 days',
    status: 'action_required',
    nextAction: 'Inspect wash equipment and chemical calibration',
    rootCause: 'Complaints cluster around three sites using the same equipment configuration and chemical calibration schedule.',
    summary: 'Customers increasingly report incomplete wheel and rear-panel cleaning across reviews, refunds, and support contacts.',
    product: 'Northstar Auto',
    detectedDate: 'Jun 2, 2026',
  },
  {
    id: 'i3',
    title: 'Delivery-order accuracy improved after packaging change',
    severity: 'medium',
    riskAmount: 22000,
    riskLabel: '$22K estimated refund exposure',
    evidenceReviews: 31,
    evidenceTickets: 18,
    evidenceUsers: 290,
    scope: 'Northstar Eats · Delivery',
    trend: '−18%',
    trendDir: 'down',
    trendWindow: '30 days',
    owner: 'Restaurant Operations',
    ageLabel: '30 days',
    status: 'monitoring',
    nextAction: 'Continue monitoring packaging SOP',
    rootCause: 'Missing-item complaints were linked to inconsistent handoff packaging. A revised sealing and verification step was deployed last month.',
    summary: 'Delivery complaints declined 18% after the packaging workflow change but remain slightly above baseline.',
    product: 'Northstar Eats',
    detectedDate: 'May 17, 2026',
  },
  {
    id: 'i4',
    title: 'Move-in communication complaints emerging',
    severity: 'low',
    riskAmount: 12000,
    riskLabel: '$12K estimated reputation risk',
    evidenceReviews: 44,
    evidenceTickets: 3,
    evidenceUsers: 76,
    scope: 'Northstar Realty · Residential',
    trend: '+41%',
    trendDir: 'up',
    trendWindow: '14 days',
    owner: 'Resident Experience',
    ageLabel: '14 days',
    status: 'confirmed',
    nextAction: 'Standardize pre-move-in communication',
    rootCause: 'New residents receive inconsistent instructions about keys, utilities, parking, and move-in timing across communities.',
    summary: 'Review and email mentions of confusing move-in instructions increased 41% in 14 days across four communities.',
    product: 'Northstar Realty',
    detectedDate: 'Jun 2, 2026',
  },
  {
    id: 'i5',
    title: 'Billing questions increasing after membership renewal',
    severity: 'high',
    riskAmount: 41000,
    riskLabel: '$41K estimated churn risk',
    evidenceReviews: 37,
    evidenceTickets: 52,
    evidenceUsers: 610,
    scope: 'All business units · Billing',
    trend: '+28%',
    trendDir: 'up',
    trendWindow: '21 days',
    owner: 'Customer Operations',
    ageLabel: '21 days',
    status: 'in_progress',
    nextAction: 'Clarify renewal notices and receipts',
    rootCause: 'Renewal communications do not clearly explain price, timing, and plan changes, causing expected charges to be interpreted as unexpected fees.',
    summary: '37 reviews and 52 support contacts cite billing confusion around renewals across multiple business units.',
    product: 'Shared Services',
    detectedDate: 'May 26, 2026',
  },
];

export const MOCK_ACTIONS: MockAction[] = [
  {
    id: 'a1', title: 'Rebalance morning appointment capacity', issueId: 'i1',
    issueTitle: 'Appointment wait-time complaints increasing at two clinics', product: 'Northstar Health',
    owner: 'Maya Patel', due: 'Jun 18', status: 'overdue',
    outcome: 'Reduce median patient wait below 20 minutes',
    verification: 'Monitor wait-time signals and patient reviews for 14 days',
  },
  {
    id: 'a2', title: 'Inspect and recalibrate three wash tunnels', issueId: 'i2',
    issueTitle: 'Wash-quality complaints rising at three locations', product: 'Northstar Auto',
    owner: 'James Liu', due: 'Jun 20', status: 'in_progress',
    outcome: 'Reduce repeat wash-quality complaints by 50%',
    verification: 'Compare review/refund rate against prior 14-day baseline',
  },
  {
    id: 'a3', title: 'Continue delivery packaging verification SOP', issueId: 'i3',
    issueTitle: 'Delivery-order accuracy improved after packaging change', product: 'Northstar Eats',
    owner: 'Sarah Chen', due: 'Jun 25', status: 'monitoring',
    outcome: 'Keep missing-item complaint rate below baseline',
    verification: 'Complaint rate remains below baseline for 21 days',
  },
  {
    id: 'a4', title: 'Launch standardized move-in checklist', issueId: 'i4',
    issueTitle: 'Move-in communication complaints emerging', product: 'Northstar Realty',
    owner: 'Priya Sharma', due: 'Jul 1', status: 'pending',
    outcome: 'Reduce move-in communication complaints by 40%',
    verification: 'Review/email mentions decline across next move-in cohort',
  },
  {
    id: 'a5', title: 'Rewrite renewal notice with price and timing breakdown', issueId: 'i5',
    issueTitle: 'Billing questions increasing after membership renewal', product: 'Shared Services',
    owner: 'Tom Huang', due: 'Jun 22', status: 'awaiting_approval',
    outcome: 'Reduce renewal-related support volume by 40%',
    verification: 'Support volume remains below baseline through next renewal cohort',
  },
  {
    id: 'a6', title: 'Add appointment-delay SMS notification', issueId: 'i1',
    issueTitle: 'Appointment wait-time complaints increasing at two clinics', product: 'Northstar Health',
    owner: 'Maya Patel', due: 'Jun 16', status: 'completed',
    outcome: 'Reduce surprise and abandonment during unavoidable delays',
    verification: 'Completed — monitoring patient feedback',
  },
];

export const TOTAL_RISK = MOCK_ISSUES.reduce((s, i) => s + i.riskAmount, 0);

export const severityConfig: Record<IssueSeverity, { label: string; color: string; bg: string }> = {
  critical: { label: 'Critical', color: '#D92D3A', bg: 'rgba(217,45,58,0.08)'  },
  high:     { label: 'High',     color: '#B76E00', bg: 'rgba(183,110,0,0.08)' },
  medium:   { label: 'Medium',   color: '#3568D4', bg: 'rgba(53,104,212,0.08)' },
  low:      { label: 'Low',      color: '#667085', bg: 'rgba(102,112,133,0.08)'},
};

export const statusConfig: Record<IssueStatus, { label: string; color: string; bg: string }> = {
  new:            { label: 'New',             color: '#5B5FEF', bg: 'rgba(91,95,239,0.08)'  },
  confirmed:      { label: 'Confirmed',       color: '#3568D4', bg: 'rgba(53,104,212,0.08)' },
  investigating:  { label: 'Investigating',   color: '#B76E00', bg: 'rgba(183,110,0,0.08)' },
  action_required:{ label: 'Action required', color: '#D92D3A', bg: 'rgba(217,45,58,0.08)'  },
  in_progress:    { label: 'In progress',     color: '#07875F', bg: 'rgba(7,135,95,0.08)' },
  monitoring:     { label: 'Monitoring',      color: '#667085', bg: 'rgba(102,112,133,0.08)'},
  verified:       { label: 'Verified',        color: '#07875F', bg: 'rgba(7,135,95,0.10)' },
  closed:         { label: 'Closed',          color: '#98A2B3', bg: 'rgba(152,162,179,0.08)'},
  dismissed:      { label: 'Dismissed',       color: '#98A2B3', bg: 'rgba(152,162,179,0.06)'},
};

export const actionStatusConfig: Record<ActionStatus, { label: string; color: string; bg: string }> = {
  overdue:          { label: 'Overdue',           color: '#D92D3A', bg: 'rgba(217,45,58,0.08)'  },
  in_progress:      { label: 'In progress',       color: '#07875F', bg: 'rgba(7,135,95,0.08)' },
  pending:          { label: 'Pending',            color: '#667085', bg: 'rgba(102,112,133,0.08)'},
  awaiting_approval:{ label: 'Awaiting approval', color: '#B76E00', bg: 'rgba(183,110,0,0.08)' },
  completed:        { label: 'Completed',          color: '#07875F', bg: 'rgba(7,135,95,0.10)' },
  monitoring:       { label: 'Monitoring',         color: '#5B5FEF', bg: 'rgba(91,95,239,0.08)'  },
};
