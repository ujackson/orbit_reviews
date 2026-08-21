import { useState } from 'react';
import {
  Box, Typography, Divider, alpha, Button, Chip, TextField,
  InputAdornment, IconButton, Tooltip, Rating, Checkbox,
  Tab, Tabs, Menu, MenuItem, Avatar, Dialog,
  DialogTitle, DialogContent, DialogActions, Select,
  Collapse,
} from '@mui/material';
import {
  Search as SearchIcon,
  Send as SendIcon,
  Edit as EditIcon,
  Close as CloseIcon,
  OpenInNew as JiraIcon,
  PersonAdd as AssignIcon,
  Bookmark as WatchIcon,
  MoreHoriz as MoreIcon,
  BugReport as IssueIcon,
  Add as AddIcon,
  ExpandMore as ExpandIcon,
  ExpandLess as CollapseIcon,
  ErrorOutline as RiskIcon,
  CheckCircleOutline as CheckIcon,
  PersonOutline as PersonIcon,
  FilterList as FilterIcon,
  KeyboardArrowDown,
} from '@mui/icons-material';
import { color, text, radius } from '../../shared/tokens/design-tokens';
import { toast } from 'sonner';
import { useNavigate, useWorkspacePath } from '@/hooks/useInertiaNavigation';
import { MOCK_ISSUES } from '../../shared/mock/issues';

// ─── Types ────────────────────────────────────────────────────────────────────

type WorkflowStatus =
  | 'needs_response' | 'response_posted' | 'response_pending'
  | 'publish_failed' | 'escalated' | 'closed' | 'sync_delayed' | 'deleted_at_source';
type Sentiment = 'positive' | 'negative' | 'neutral' | 'mixed';

interface Review {
  id: string;
  sourceKey: string;
  sourceName: string;
  sourceAbbr: string;
  sourceColor: string;
  rating: number;
  title: string;
  excerpt: string;
  body: string;
  author: string;
  context: string;
  timestamp: string;
  status: WorkflowStatus;
  sentiment: Sentiment;
  tags: string[];
  unread?: boolean;
  assignee?: string;
  relatedCount: number;
  signals: { label: string }[];
  themes: string[];
  suggestedReplyBasis: string[];
  suggestedReply: string;
  linkedIssueId?: string;
  riskLabel?: string;
}

// ─── Mock data ────────────────────────────────────────────────────────────────

const SAVED_VIEWS = [
  { id: 'all',             label: 'All feedback',    count: 4821 },
  { id: 'unread',          label: 'Unread',          count: 312  },
  { id: 'needs_response',  label: 'Needs response',  count: 47   },
  { id: 'assigned_me',     label: 'Assigned to me',  count: 8    },
  { id: 'escalated',       label: 'Escalated',       count: 6    },
  { id: 'negative',        label: 'Negative',        count: 634  },
  { id: 'recently_changed',label: 'Recently changed',count: 23   },
];

const REVIEWS: Review[] = [
  {
    id: 'r1', sourceKey: 'appstore', sourceName: 'App Store', sourceAbbr: 'AS', sourceColor: '#555',
    rating: 1,
    title: 'Cannot log in after updating to v5.1.0',
    excerpt: 'Since the latest update I cannot access my account. The app crashes immediately after entering credentials on my Pixel 7.',
    body: 'Since the latest update I cannot access my account. The app crashes immediately after entering my credentials on my Pixel 7 Pro. I have tried reinstalling three times. This is completely unacceptable for a paid application.',
    author: 'Marcus T.', context: 'Orbit Mobile · v5.1.0 · Android', timestamp: 'Jun 15, 2:14 PM',
    status: 'needs_response', sentiment: 'negative',
    tags: ['Authentication', 'Crash'],
    unread: true, relatedCount: 89,
    signals: [
      { label: '1-star rating' },
      { label: 'Account access blocked' },
      { label: 'Android device' },
      { label: 'App version v5.1.0' },
    ],
    themes: ['Authentication', 'Crash after login'],
    suggestedReplyBasis: ['Original review', 'Approved response policy', 'Verified product status'],
    suggestedReply: "Hi Marcus,\n\nThank you for reporting this. We're aware of a login issue affecting some Android users after updating to v5.1.0, and our team is actively working on a resolution.\n\nIn the meantime, please try clearing the app cache under Settings > Apps > Orbit > Clear Cache. If the issue persists, our support team is ready to assist at support@orbit.com.\n\nWe apologize for the disruption.",
    linkedIssueId: 'i1',
    riskLabel: '$73K estimated subscription risk',
  },
  {
    id: 'r2', sourceKey: 'g2', sourceName: 'G2', sourceAbbr: 'G2', sourceColor: '#FF492C',
    rating: 5,
    title: 'Best review management platform — transformed our CX operations',
    excerpt: "Orbit has completely transformed how we manage customer feedback across 200+ locations. The response suggestions are consistently on-brand and save hours.",
    body: "Orbit has completely transformed how we manage customer feedback across 200+ locations. The response suggestions are consistently on-brand and the automated triage saves our team 4+ hours weekly. We went from 28% to 71% response rate in the first month.",
    author: 'Sarah L.', context: 'Enterprise · 250 locations', timestamp: 'Jun 15, 10:32 AM',
    status: 'response_posted', sentiment: 'positive',
    tags: ['Workflow', 'Enterprise'],
    unread: true, relatedCount: 12,
    signals: [
      { label: '5-star rating' },
      { label: 'Response rate improvement cited' },
      { label: 'Enterprise segment' },
    ],
    themes: ['Product value', 'Workflow automation'],
    suggestedReplyBasis: ['Original review', 'Approved response policy'],
    suggestedReply: "Thank you so much, Sarah. A 28% to 71% response rate improvement is exactly the outcome we design for, and it's genuinely motivating to hear it reflected in real operations.\n\nWe'd love to feature your story — would you be open to a brief case study conversation?\n\nThank you for being part of the Orbit community.",
  },
  {
    id: 'r3', sourceKey: 'google', sourceName: 'Google Business', sourceAbbr: 'G', sourceColor: '#4285F4',
    rating: 2,
    title: 'Shipping arrived damaged for second time this month',
    excerpt: 'Second order in a row with visible packaging damage. The product inside was also affected — corner of the unit is cracked.',
    body: 'Second order in a row with visible packaging damage. The product inside was also affected this time — the corner of the device is visibly cracked. I have photos. Very disappointed in the fulfillment quality.',
    author: 'Jennifer K.', context: 'Orbit Pro · Austin, TX', timestamp: 'Jun 14, 4:05 PM',
    status: 'escalated', sentiment: 'negative',
    tags: ['Shipping', 'Packaging'],
    relatedCount: 31,
    signals: [
      { label: '2-star rating' },
      { label: 'Repeat occurrence' },
      { label: 'Physical damage to unit' },
      { label: 'Austin, TX' },
    ],
    themes: ['Shipping damage', 'Packaging quality'],
    suggestedReplyBasis: ['Original review', 'Approved response policy'],
    suggestedReply: "Hi Jennifer,\n\nWe're very sorry this has happened twice. Receiving a damaged product is unacceptable, and a repeat occurrence makes that worse.\n\nPlease email orders@orbit.com with your order number and we will arrange a priority replacement at no cost to you. We are also investigating our carrier packaging process.\n\nThank you for your patience.",
    linkedIssueId: 'i3',
    riskLabel: '$22K estimated refund exposure',
  },
  {
    id: 'r4', sourceKey: 'trustpilot', sourceName: 'Trustpilot', sourceAbbr: 'TP', sourceColor: '#00B67A',
    rating: 4,
    title: 'Powerful platform — onboarding took longer than expected',
    excerpt: 'Very happy with Orbit overall. The dashboard is incredibly powerful once set up. Onboarding took longer than expected but the support team was responsive.',
    body: 'Very happy with Orbit overall. The dashboard is incredibly powerful once you are set up. Onboarding took longer than expected — it took about 2 weeks before our full team was operational. The support team was responsive and helpful throughout, which made the difference.',
    author: 'David R.', context: 'Orbit Business · 12 locations', timestamp: 'Jun 14, 1:18 PM',
    status: 'needs_response', sentiment: 'positive',
    tags: ['Onboarding'],
    relatedCount: 28,
    signals: [
      { label: '4-star rating' },
      { label: 'Onboarding friction cited' },
      { label: 'Support praised' },
    ],
    themes: ['Onboarding experience', 'Support quality'],
    suggestedReplyBasis: ['Original review', 'Approved response policy'],
    suggestedReply: "Thank you, David. We're glad the support team made a difference during onboarding.\n\nYour feedback on setup time is noted — we're actively working on a guided onboarding experience that should reduce ramp time significantly.\n\nDon't hesitate to reach out if there's anything we can improve for your team.",
  },
  {
    id: 'r5', sourceKey: 'playstore', sourceName: 'Google Play', sourceAbbr: 'PL', sourceColor: '#3DDC84',
    rating: 3,
    title: 'Desktop analytics superior — mobile app needs investment',
    excerpt: "We use both Orbit and Intercom. Orbit's desktop analytics are far superior but the mobile experience still has significant gaps vs competitors.",
    body: "We use both Orbit and Intercom. Orbit's desktop analytics are far superior and the insights features are class-leading. However the mobile app experience has significant gaps compared to Intercom's mobile app — speed, navigation clarity, and offline support are all noticeably behind.",
    author: 'Alex M.', context: 'Orbit Pro · Android', timestamp: 'Jun 13, 9:47 AM',
    status: 'closed', sentiment: 'neutral',
    tags: ['Mobile', 'Competitor'],
    relatedCount: 44,
    signals: [
      { label: '3-star rating' },
      { label: 'Competitor comparison' },
      { label: 'Mobile gap identified' },
    ],
    themes: ['Mobile experience', 'Competitor comparison'],
    suggestedReplyBasis: ['Original review', 'Approved response policy'],
    suggestedReply: "Thank you for the detailed comparison, Alex. Honest feedback like this directly informs our roadmap.\n\nYou're right that desktop is where we've invested most heavily. Mobile is a focus area for us and we'd welcome the opportunity to learn more about the specific gaps your team experiences.\n\nWould you be open to a brief product call?",
    linkedIssueId: 'i4',
    riskLabel: '$12K estimated conversion risk',
  },
];

// ─── Status config ────────────────────────────────────────────────────────────

const statusMeta: Record<WorkflowStatus, { label: string; color: string; bg: string }> = {
  needs_response:    { label: 'Needs response',   color: color.functional.warning,  bg: alpha(color.functional.warning, 0.10) },
  response_posted:   { label: 'Response posted',  color: color.functional.success,  bg: alpha(color.functional.success, 0.08) },
  response_pending:  { label: 'Pending approval', color: color.functional.info,     bg: alpha(color.functional.info, 0.08) },
  publish_failed:    { label: 'Publish failed',   color: color.functional.error,    bg: alpha(color.functional.error, 0.08) },
  escalated:         { label: 'Escalated',        color: color.functional.error,    bg: alpha(color.functional.error, 0.08) },
  closed:            { label: 'Closed',           color: text.tertiary,              bg: 'rgba(0,0,0,0.05)' },
  sync_delayed:      { label: 'Sync delayed',     color: color.functional.warning,  bg: alpha(color.functional.warning, 0.08) },
  deleted_at_source: { label: 'Deleted at source',color: text.tertiary,             bg: 'rgba(0,0,0,0.05)' },
};

function StatusBadge({ status }: { status: WorkflowStatus }) {
  const m = statusMeta[status];
  return (
    <Chip size="small" label={m.label}
      sx={{ height: 16, fontSize: 10, fontWeight: 600, bgcolor: m.bg, color: m.color, '& .MuiChip-label': { px: '6px' } }} />
  );
}

function SourceBadge({ abbr, color: bg }: { abbr: string; color: string }) {
  return (
    <Box sx={{ width: 26, height: 26, borderRadius: '6px', bgcolor: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <Typography sx={{ fontSize: 9, fontWeight: 700, color: '#fff', lineHeight: 1 }}>{abbr}</Typography>
    </Box>
  );
}

// ─── Review row ───────────────────────────────────────────────────────────────

function ReviewRow({ review, selected, onSelect, onCheck, checked }: {
  review: Review; selected: boolean; onSelect: () => void; onCheck: () => void; checked: boolean;
}) {
  const visibleTags = review.tags.slice(0, 2);
  const extraTags   = review.tags.length - 2;

  return (
    <Box
      onClick={onSelect}
      sx={{
        display: 'flex', alignItems: 'flex-start', gap: '10px',
        px: '14px', py: '12px', cursor: 'pointer',
        bgcolor: selected ? alpha(color.functional.primary, 0.05) : '#fff',
        borderLeft: `2px solid ${selected ? color.functional.primary : 'transparent'}`,
        borderBottom: '1px solid rgba(0,0,0,0.05)',
        transition: 'background 0.08s',
        '&:hover': { bgcolor: selected ? alpha(color.functional.primary, 0.06) : 'rgba(0,0,0,0.02)' },
      }}
    >
      <Checkbox size="small" checked={checked} onChange={e => { e.stopPropagation(); onCheck(); }} onClick={e => e.stopPropagation()} sx={{ p: 0, mt: '1px', flexShrink: 0 }} />
      <SourceBadge abbr={review.sourceAbbr} color={review.sourceColor} />
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px', mb: '4px' }}>
          <Rating value={review.rating} readOnly size="small" sx={{ fontSize: 12 }} />
          {review.unread && <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: color.functional.primary, flexShrink: 0 }} />}
          <Box sx={{ flex: 1 }} />
          <Typography sx={{ fontSize: 10, color: text.tertiary, flexShrink: 0 }}>{review.timestamp}</Typography>
        </Box>
        <Typography sx={{ fontSize: 12, fontWeight: review.unread ? 700 : 600, color: text.primary, lineHeight: 1.35, mb: '3px' }} noWrap>
          {review.title}
        </Typography>
        <Typography sx={{ fontSize: 11, color: text.secondary, lineHeight: 1.5, mb: '6px', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
          {review.excerpt}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: '5px', flexWrap: 'wrap' }}>
          <Typography sx={{ fontSize: 10, color: text.tertiary }}>{review.author}</Typography>
          <Box sx={{ width: 2, height: 2, borderRadius: '50%', bgcolor: text.tertiary }} />
          <Typography sx={{ fontSize: 10, color: text.tertiary }} noWrap>{review.context}</Typography>
          <Box sx={{ flex: 1 }} />
          <StatusBadge status={review.status} />
          {visibleTags.map(t => (
            <Chip key={t} size="small" label={t} variant="outlined" sx={{ height: 14, fontSize: 9, '& .MuiChip-label': { px: '5px' }, borderColor: 'rgba(0,0,0,0.12)', color: text.tertiary }} />
          ))}
          {extraTags > 0 && <Typography sx={{ fontSize: 9, color: text.tertiary }}>+{extraTags}</Typography>}
        </Box>
      </Box>
    </Box>
  );
}

// ─── Context Panel ────────────────────────────────────────────────────────────

function ContextPanel({ review }: { review: Review | null }) {
  const navigate = useNavigate();
  const workspacePath = useWorkspacePath();

  const [tab, setTab] = useState(0);
  const [replyText, setReplyText] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [replyExpanded, setReplyExpanded] = useState(false);
  const [jiraOpen, setJiraOpen] = useState(false);
  const [assignOpen, setAssignOpen] = useState(false);
  const [addIssueOpen, setAddIssueOpen] = useState(false);

  if (!review) {
    return (
      <Box sx={{ flex: 0, width: 340, flexShrink: 0, borderLeft: '1px solid #E7E9EE', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#F8F9FC' }}>
        <Typography sx={{ fontSize: 13, color: text.tertiary }}>Select a review to view details</Typography>
      </Box>
    );
  }

  const linkedIssue = MOCK_ISSUES.find(i => i.id === review.linkedIssueId);
  const isNeedingResponse = review.status === 'needs_response' || review.status === 'escalated';

  const handlePublish = () => {
    toast.success('Response published to ' + review.sourceName);
    setIsEditing(false);
  };
  const handleSendForApproval = () => {
    toast.info('Sent for approval');
    setIsEditing(false);
  };

  return (
    <>
      {/* Jira dialog */}
      <Dialog open={jiraOpen} onClose={() => setJiraOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontSize: 14, fontWeight: 700 }}>Create Jira Issue</DialogTitle>
        <DialogContent>
          <TextField fullWidth size="small" label="Summary" defaultValue={review.title} sx={{ mb: 2, mt: 1 }} />
          <TextField fullWidth size="small" label="Project" defaultValue="SUPPORT" sx={{ mb: 2 }} />
          <TextField fullWidth size="small" label="Priority" defaultValue="High" />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
          <Button onClick={() => setJiraOpen(false)} sx={{ textTransform: 'none', color: text.secondary }}>Cancel</Button>
          <Button variant="contained" onClick={() => { toast.success('Jira issue created'); setJiraOpen(false); }}
            sx={{ textTransform: 'none', bgcolor: color.functional.primary, '&:hover': { bgcolor: color.functional.primaryHover } }}>
            Create
          </Button>
        </DialogActions>
      </Dialog>

      {/* Assign dialog */}
      <Dialog open={assignOpen} onClose={() => setAssignOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontSize: 14, fontWeight: 700 }}>Assign Review</DialogTitle>
        <DialogContent>
          <Typography sx={{ fontSize: 13, color: text.secondary, mb: 2, mt: 1 }}>Assign to a team member for review and action.</Typography>
          {['Sarah Chen', 'Tom Huang', 'Maya Patel', 'James Liu'].map(name => (
            <Box key={name} onClick={() => { toast.success(`Assigned to ${name}`); setAssignOpen(false); }}
              sx={{ display: 'flex', alignItems: 'center', gap: '10px', p: '10px', cursor: 'pointer', borderRadius: '6px', '&:hover': { bgcolor: 'rgba(0,0,0,0.04)' } }}>
              <Avatar sx={{ width: 28, height: 28, fontSize: 11, bgcolor: alpha(color.functional.primary, 0.14), color: color.functional.primary }}>
                {name.split(' ').map(n => n[0]).join('')}
              </Avatar>
              <Typography sx={{ fontSize: 13, color: text.primary }}>{name}</Typography>
            </Box>
          ))}
        </DialogContent>
      </Dialog>

      {/* Add to issue dialog */}
      <Dialog open={addIssueOpen} onClose={() => setAddIssueOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontSize: 14, fontWeight: 700 }}>Add to Issue</DialogTitle>
        <DialogContent>
          <Typography sx={{ fontSize: 13, color: text.secondary, mb: 2, mt: 1 }}>Link this feedback to an existing issue, or create a new one.</Typography>
          {MOCK_ISSUES.slice(0, 4).map(issue => (
            <Box key={issue.id} onClick={() => { toast.success(`Added to: ${issue.title}`); setAddIssueOpen(false); }}
              sx={{ display: 'flex', alignItems: 'center', gap: '10px', p: '10px', cursor: 'pointer', borderRadius: '6px', border: '1px solid #E7E9EE', mb: '6px', '&:hover': { bgcolor: 'rgba(0,0,0,0.02)' } }}>
              <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: issue.severity === 'critical' ? '#E5484D' : issue.severity === 'high' ? '#E58A17' : '#6B7280', flexShrink: 0 }} />
              <Typography sx={{ fontSize: 13, color: text.primary, flex: 1 }} noWrap>{issue.title}</Typography>
              <Typography sx={{ fontSize: 11, color: text.tertiary }}>{issue.ageLabel} old</Typography>
            </Box>
          ))}
          <Button startIcon={<AddIcon sx={{ fontSize: 13 }} />} sx={{ mt: 1, fontSize: 12, color: color.functional.primary, textTransform: 'none' }}
            onClick={() => { toast.info('Create issue dialog'); setAddIssueOpen(false); }}>
            Create new issue from this feedback
          </Button>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setAddIssueOpen(false)} sx={{ textTransform: 'none', color: text.secondary }}>Close</Button>
        </DialogActions>
      </Dialog>

      <Box sx={{ width: 340, flexShrink: 0, borderLeft: '1px solid #E7E9EE', display: 'flex', flexDirection: 'column', bgcolor: '#fff' }}>

        {/* Tabs */}
        <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ px: '12px', borderBottom: '1px solid #E7E9EE', minHeight: 36, '& .MuiTab-root': { fontSize: 11, textTransform: 'none', minHeight: 36, fontWeight: 500, py: 0, px: '10px' }, '& .Mui-selected': { fontWeight: 700 } }}>
          <Tab label="Case brief" />
          <Tab label="Evidence" />
          <Tab label={`Related (${review.relatedCount})`} />
          <Tab label="Activity" />
        </Tabs>

        <Box sx={{ flex: 1, overflow: 'auto', '&::-webkit-scrollbar': { width: 3 } }}>

          {/* ── Summary tab ──────────────────────────────────── */}
          {tab === 0 && (
            <Box sx={{ display: 'flex', flexDirection: 'column' }}>

              {/* 1. Linked issue */}
              <Box sx={{ px: '14px', py: '12px', borderBottom: '1px solid #E7E9EE' }}>
                <Typography sx={{ fontSize: 10, fontWeight: 700, color: text.tertiary, textTransform: 'uppercase', letterSpacing: '0.07em', mb: '6px' }}>
                  Linked issue
                </Typography>
                {linkedIssue ? (
                  <Box
                    onClick={() => navigate(workspacePath('insights'))}
                    sx={{ display: 'flex', alignItems: 'flex-start', gap: '8px', p: '10px', bgcolor: '#F8F9FC', border: '1px solid #E7E9EE', borderRadius: '6px', cursor: 'pointer', '&:hover': { borderColor: color.functional.primary } }}
                  >
                    <IssueIcon sx={{ fontSize: 14, color: color.functional.primary, mt: '1px', flexShrink: 0 }} />
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography sx={{ fontSize: 12, fontWeight: 600, color: text.primary, lineHeight: 1.3, mb: '2px' }} noWrap>
                        {linkedIssue.title}
                      </Typography>
                      <Typography sx={{ fontSize: 10, color: text.tertiary }}>
                        {linkedIssue.severity} · {linkedIssue.ageLabel} open · {linkedIssue.owner}
                      </Typography>
                    </Box>
                  </Box>
                ) : (
                  <Box sx={{ display: 'flex', gap: '6px' }}>
                    <Button size="small" startIcon={<AddIcon sx={{ fontSize: 12 }} />}
                      onClick={() => setAddIssueOpen(true)}
                      sx={{ fontSize: 11, color: color.functional.primary, border: `1px solid ${alpha(color.functional.primary, 0.3)}`, px: '8px', height: 24, textTransform: 'none' }}>
                      Link to issue
                    </Button>
                    <Button size="small" startIcon={<AddIcon sx={{ fontSize: 12 }} />}
                      onClick={() => toast.info('Create issue from feedback')}
                      sx={{ fontSize: 11, color: text.secondary, border: '1px solid #E7E9EE', px: '8px', height: 24, textTransform: 'none' }}>
                      Create issue
                    </Button>
                  </Box>
                )}
              </Box>

              {/* 2. Risk and urgency */}
              {(review.riskLabel || review.status === 'escalated') && (
                <Box sx={{ px: '14px', py: '10px', borderBottom: '1px solid #E7E9EE', bgcolor: alpha(color.functional.error, 0.02) }}>
                  <Typography sx={{ fontSize: 10, fontWeight: 700, color: text.tertiary, textTransform: 'uppercase', letterSpacing: '0.07em', mb: '5px' }}>
                    Risk and urgency
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <RiskIcon sx={{ fontSize: 13, color: color.functional.error }} />
                    <Typography sx={{ fontSize: 12, fontWeight: 700, color: color.functional.error }}>
                      {review.riskLabel ?? 'Escalated — needs immediate response'}
                    </Typography>
                  </Box>
                  {review.linkedIssueId && (
                    <Typography sx={{ fontSize: 11, color: text.tertiary, mt: '3px' }}>
                      Strong match · {review.relatedCount} related reviews in linked issue
                    </Typography>
                  )}
                </Box>
              )}

              {/* 3. Recommended operational action */}
              <Box sx={{ px: '14px', py: '10px', borderBottom: '1px solid #E7E9EE' }}>
                <Typography sx={{ fontSize: 10, fontWeight: 700, color: text.tertiary, textTransform: 'uppercase', letterSpacing: '0.07em', mb: '7px' }}>
                  Operational action
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  <Button size="small" startIcon={<IssueIcon sx={{ fontSize: 12 }} />}
                    onClick={() => setAddIssueOpen(true)}
                    sx={{ fontSize: 11, color: color.functional.primary, border: `1px solid ${alpha(color.functional.primary, 0.3)}`, bgcolor: alpha(color.functional.primary, 0.03), px: '8px', height: 26, textTransform: 'none', fontWeight: 600 }}>
                    Add to issue
                  </Button>
                  <Button size="small" startIcon={<AddIcon sx={{ fontSize: 12 }} />}
                    onClick={() => toast.info('Creating issue from feedback')}
                    sx={{ fontSize: 11, color: text.secondary, border: '1px solid #E7E9EE', px: '8px', height: 26, textTransform: 'none' }}>
                    Create issue
                  </Button>
                  <Button size="small" startIcon={<AssignIcon sx={{ fontSize: 12 }} />}
                    onClick={() => setAssignOpen(true)}
                    sx={{ fontSize: 11, color: text.secondary, border: '1px solid #E7E9EE', px: '8px', height: 26, textTransform: 'none' }}>
                    Assign
                  </Button>
                  <Button size="small" startIcon={<CheckIcon sx={{ fontSize: 12 }} />}
                    onClick={() => toast.success('Marked as isolated feedback')}
                    sx={{ fontSize: 11, color: text.secondary, border: '1px solid #E7E9EE', px: '8px', height: 26, textTransform: 'none' }}>
                    Isolated
                  </Button>
                </Box>
              </Box>

              {/* 4. Evidence and related feedback */}
              <Box sx={{ px: '14px', py: '10px', borderBottom: '1px solid #E7E9EE' }}>
                <Typography sx={{ fontSize: 10, fontWeight: 700, color: text.tertiary, textTransform: 'uppercase', letterSpacing: '0.07em', mb: '6px' }}>
                  Signals · {review.signals.length} detected
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: '4px', mb: '8px' }}>
                  {review.signals.map((sig, i) => (
                    <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Box sx={{ width: 4, height: 4, borderRadius: '50%', bgcolor: text.tertiary, flexShrink: 0 }} />
                      <Typography sx={{ fontSize: 12, color: text.secondary }}>{sig.label}</Typography>
                    </Box>
                  ))}
                </Box>
                <Box sx={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                  {review.themes.map(t => (
                    <Chip key={t} size="small" label={t} variant="outlined"
                      sx={{ height: 18, fontSize: 10, borderColor: '#E7E9EE', color: text.secondary, '& .MuiChip-label': { px: '5px' } }} />
                  ))}
                </Box>
              </Box>

              {/* 5. Owner and status */}
              <Box sx={{ px: '14px', py: '10px', borderBottom: '1px solid #E7E9EE' }}>
                <Typography sx={{ fontSize: 10, fontWeight: 700, color: text.tertiary, textTransform: 'uppercase', letterSpacing: '0.07em', mb: '6px' }}>
                  Owner and status
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px', mb: '6px' }}>
                  <PersonIcon sx={{ fontSize: 14, color: text.tertiary }} />
                  <Typography sx={{ fontSize: 12, color: review.assignee ? text.primary : text.tertiary }}>
                    {review.assignee ?? 'Unassigned'}
                  </Typography>
                  <Button size="small" onClick={() => setAssignOpen(true)}
                    sx={{ fontSize: 10, color: color.functional.primary, ml: 'auto', textTransform: 'none', height: 22, px: '6px' }}>
                    Assign
                  </Button>
                </Box>
                <StatusBadge status={review.status} />
                <Box sx={{ display: 'flex', gap: '4px', mt: '8px' }}>
                  <Tooltip title="Watch">
                    <IconButton size="small" onClick={() => toast.success('Watching')} sx={{ color: text.tertiary, border: '1px solid #E7E9EE', borderRadius: '6px' }}>
                      <WatchIcon sx={{ fontSize: 13 }} />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Create Jira issue">
                    <IconButton size="small" onClick={() => setJiraOpen(true)} sx={{ color: text.tertiary, border: '1px solid #E7E9EE', borderRadius: '6px' }}>
                      <JiraIcon sx={{ fontSize: 13 }} />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Box>

              {/* 6. Customer response (collapsible) */}
              <Box sx={{ px: '14px', py: '10px' }}>
                <Box
                  onClick={() => setReplyExpanded(!replyExpanded)}
                  sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', mb: replyExpanded ? '8px' : 0 }}
                >
                  <Typography sx={{ fontSize: 10, fontWeight: 700, color: text.tertiary, textTransform: 'uppercase', letterSpacing: '0.07em' }}>
                    Customer response {isNeedingResponse && <Box component="span" sx={{ color: color.functional.warning, ml: '4px' }}>· Needed</Box>}
                  </Typography>
                  {replyExpanded ? <CollapseIcon sx={{ fontSize: 14, color: text.tertiary }} /> : <ExpandIcon sx={{ fontSize: 14, color: text.tertiary }} />}
                </Box>

                <Collapse in={replyExpanded}>
                  <Box sx={{ bgcolor: '#F8F9FC', borderRadius: '6px', border: '1px solid #E7E9EE', overflow: 'hidden' }}>
                    {!isEditing ? (
                      <Box sx={{ p: '12px' }}>
                        <Typography sx={{ fontSize: 11, whiteSpace: 'pre-wrap', lineHeight: 1.6, color: text.secondary }}>
                          {review.suggestedReply}
                        </Typography>
                        <Typography sx={{ fontSize: 10, color: text.tertiary, mt: '8px', fontStyle: 'italic' }}>
                          Based on: {review.suggestedReplyBasis.join(' · ')}
                        </Typography>
                      </Box>
                    ) : (
                      <TextField
                        multiline fullWidth
                        minRows={5}
                        value={replyText || review.suggestedReply}
                        onChange={e => setReplyText(e.target.value)}
                        sx={{ '& .MuiOutlinedInput-root': { fontSize: 12, p: '12px', '& fieldset': { border: 'none' } } }}
                      />
                    )}
                    <Divider sx={{ borderColor: '#E7E9EE' }} />
                    <Box sx={{ px: '12px', py: '8px', display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap' }}>
                      {!isEditing ? (
                        <>
                          <Button size="small" variant="contained"
                            onClick={handlePublish}
                            sx={{ fontSize: 11, height: 26, px: '10px', bgcolor: color.functional.primary, '&:hover': { bgcolor: color.functional.primaryHover }, textTransform: 'none', fontWeight: 600 }}>
                            Publish
                          </Button>
                          <Button size="small" onClick={handleSendForApproval}
                            sx={{ fontSize: 11, height: 26, px: '10px', color: text.secondary, border: '1px solid #E7E9EE', textTransform: 'none' }}>
                            For approval
                          </Button>
                          <Button size="small" startIcon={<EditIcon sx={{ fontSize: 12 }} />}
                            onClick={() => { setIsEditing(true); setReplyText(review.suggestedReply); }}
                            sx={{ fontSize: 11, height: 26, px: '10px', color: text.secondary, border: '1px solid #E7E9EE', textTransform: 'none' }}>
                            Edit
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button size="small" variant="contained"
                            onClick={() => { handlePublish(); }}
                            sx={{ fontSize: 11, height: 26, px: '10px', bgcolor: color.functional.primary, '&:hover': { bgcolor: color.functional.primaryHover }, textTransform: 'none', fontWeight: 600 }}>
                            Publish
                          </Button>
                          <Button size="small" onClick={() => setIsEditing(false)}
                            sx={{ fontSize: 11, height: 26, px: '10px', color: text.secondary, border: '1px solid #E7E9EE', textTransform: 'none' }}>
                            Cancel
                          </Button>
                        </>
                      )}
                    </Box>
                  </Box>
                </Collapse>

                {!replyExpanded && isNeedingResponse && (
                  <Button size="small" onClick={() => setReplyExpanded(true)}
                    sx={{ mt: '6px', fontSize: 11, color: color.functional.primary, border: `1px solid ${alpha(color.functional.primary, 0.3)}`, px: '8px', height: 24, textTransform: 'none' }}>
                    Draft response
                  </Button>
                )}
              </Box>
            </Box>
          )}

          {/* ── Evidence tab ─────────────────────────────────── */}
          {tab === 1 && (
            <Box sx={{ p: '14px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <Box>
                <Typography sx={{ fontSize: 10, fontWeight: 700, color: text.tertiary, textTransform: 'uppercase', letterSpacing: '0.07em', mb: '6px' }}>
                  Full review text
                </Typography>
                <Typography sx={{ fontSize: 13, color: text.secondary, lineHeight: 1.7 }}>
                  {review.body}
                </Typography>
              </Box>
              <Divider sx={{ borderColor: '#E7E9EE' }} />
              <Box>
                <Typography sx={{ fontSize: 10, fontWeight: 700, color: text.tertiary, textTransform: 'uppercase', letterSpacing: '0.07em', mb: '6px' }}>
                  Source metadata
                </Typography>
                {[
                  { label: 'Source', value: review.sourceName },
                  { label: 'Author', value: review.author },
                  { label: 'Context', value: review.context },
                  { label: 'Rating', value: `${review.rating} / 5` },
                  { label: 'Posted', value: review.timestamp },
                ].map(row => (
                  <Box key={row.label} sx={{ display: 'flex', alignItems: 'center', py: '4px' }}>
                    <Typography sx={{ fontSize: 11, color: text.tertiary, width: 70 }}>{row.label}</Typography>
                    <Typography sx={{ fontSize: 12, color: text.secondary, fontWeight: 500 }}>{row.value}</Typography>
                  </Box>
                ))}
              </Box>
            </Box>
          )}

          {/* ── Related tab ───────────────────────────────────── */}
          {tab === 2 && (
            <Box sx={{ p: '14px' }}>
              <Typography sx={{ fontSize: 11, color: text.tertiary, mb: '10px' }}>
                {review.relatedCount} reviews share similar signals
              </Typography>
              {[
                { title: 'App keeps logging me out — Android', rating: 1, source: 'Google Play', date: 'Jun 14' },
                { title: 'v5.1.0 broke my login completely', rating: 1, source: 'App Store', date: 'Jun 14' },
                { title: 'Authentication error since last update', rating: 2, source: 'App Store', date: 'Jun 13' },
                { title: 'Pixel 7 login crash — update issue?', rating: 1, source: 'Google Play', date: 'Jun 13' },
              ].map((r, i) => (
                <Box key={i} sx={{ p: '10px', border: '1px solid #E7E9EE', borderRadius: '6px', mb: '6px', bgcolor: '#F8F9FC' }}>
                  <Typography sx={{ fontSize: 12, fontWeight: 600, color: text.primary, mb: '2px' }}>{r.title}</Typography>
                  <Typography sx={{ fontSize: 10, color: text.tertiary }}>{r.source} · {r.date} · {'★'.repeat(r.rating)}</Typography>
                </Box>
              ))}
            </Box>
          )}

          {/* ── Activity tab ──────────────────────────────────── */}
          {tab === 3 && (
            <Box sx={{ p: '14px' }}>
              {[
                { actor: 'System', action: 'Review imported from App Store', time: 'Jun 15, 2:14 PM' },
                { actor: 'System', action: 'Linked to issue: Android authentication failures', time: 'Jun 15, 2:15 PM' },
                { actor: 'Sarah Chen', action: 'Viewed review', time: 'Jun 15, 3:02 PM' },
                { actor: 'System', action: 'Response drafted', time: 'Jun 15, 3:02 PM' },
              ].map((ev, i) => (
                <Box key={i} sx={{ display: 'flex', gap: '10px', mb: '12px' }}>
                  <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#D1D5DB', mt: '5px', flexShrink: 0 }} />
                  <Box>
                    <Typography sx={{ fontSize: 12, color: text.primary }}>
                      <strong>{ev.actor}</strong> {ev.action}
                    </Typography>
                    <Typography sx={{ fontSize: 10, color: text.tertiary }}>{ev.time}</Typography>
                  </Box>
                </Box>
              ))}
            </Box>
          )}
        </Box>
      </Box>
    </>
  );
}

// ─── Feedback View ────────────────────────────────────────────────────────────

export const FeedbackView = () => {
  const [activeView, setActiveView]     = useState('all');
  const [selectedId, setSelectedId]     = useState<string | null>('r1');
  const [checked, setChecked]           = useState<string[]>([]);
  const [search, setSearch]             = useState('');

  const filtered = REVIEWS.filter(r => {
    if (search && !r.title.toLowerCase().includes(search.toLowerCase()) && !r.excerpt.toLowerCase().includes(search.toLowerCase())) return false;
    if (activeView === 'needs_response' && r.status !== 'needs_response') return false;
    if (activeView === 'escalated' && r.status !== 'escalated') return false;
    if (activeView === 'unread' && !r.unread) return false;
    if (activeView === 'negative' && r.sentiment !== 'negative') return false;
    return true;
  });

  const selectedReview = REVIEWS.find(r => r.id === selectedId) ?? null;

  const toggleCheck = (id: string) => setChecked(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  const allChecked  = filtered.length > 0 && filtered.every(r => checked.includes(r.id));
  const toggleAll   = () => setChecked(allChecked ? [] : filtered.map(r => r.id));

  return (
    <Box sx={{ flex: 1, height: '100%', display: 'flex', overflow: 'hidden', bgcolor: '#fff' }}>

      {/* Pane 1: Saved views */}
      <Box sx={{ width: 180, flexShrink: 0, borderRight: '1px solid #E7E9EE', display: 'flex', flexDirection: 'column', bgcolor: '#F4F5F8', overflow: 'auto' }}>
        <Box sx={{ px: '10px', py: '10px', borderBottom: '1px solid #E7E9EE' }}>
          <Typography sx={{ fontSize: 11, fontWeight: 700, color: text.tertiary, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Feedback
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: '1px', p: '6px' }}>
          {SAVED_VIEWS.map(view => {
            const on = activeView === view.id;
            return (
              <Box key={view.id} onClick={() => setActiveView(view.id)}
                sx={{
                  display: 'flex', alignItems: 'center', gap: '8px',
                  px: '8px', py: '5px', borderRadius: '5px', cursor: 'pointer',
                  bgcolor: on ? alpha(color.functional.primary, 0.08) : 'transparent',
                  color: on ? color.functional.primary : text.secondary,
                  '&:hover': { bgcolor: on ? alpha(color.functional.primary, 0.10) : 'rgba(0,0,0,0.05)' },
                }}
              >
                <Typography sx={{ fontSize: 12, fontWeight: on ? 600 : 400, flex: 1, fontFamily: 'inherit' }}>
                  {view.label}
                </Typography>
                <Typography sx={{ fontSize: 10, color: on ? color.functional.primary : text.tertiary, fontWeight: on ? 700 : 400 }}>
                  {view.count.toLocaleString()}
                </Typography>
              </Box>
            );
          })}
        </Box>
      </Box>

      {/* Pane 2: Review list */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', borderRight: '1px solid #E7E9EE', minWidth: 0 }}>
        {/* Toolbar */}
        <Box sx={{ px: '12px', py: '8px', borderBottom: '1px solid #E7E9EE', display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
          <Checkbox size="small" checked={allChecked} onChange={toggleAll} indeterminate={checked.length > 0 && !allChecked} sx={{ p: 0 }} />
          {checked.length > 0 && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Typography sx={{ fontSize: 12, color: text.secondary }}>{checked.length} selected</Typography>
              <Button size="small" sx={{ fontSize: 11, color: text.secondary, border: '1px solid #E7E9EE', height: 24, px: '8px', textTransform: 'none' }}
                onClick={() => { toast.success(`${checked.length} reviews assigned`); setChecked([]); }}>
                Assign
              </Button>
              <Button size="small" sx={{ fontSize: 11, color: text.secondary, border: '1px solid #E7E9EE', height: 24, px: '8px', textTransform: 'none' }}
                onClick={() => { toast.success('Added to issue'); setChecked([]); }}>
                Add to issue
              </Button>
            </Box>
          )}
          <Box sx={{ flex: 1 }}>
            <TextField
              size="small" placeholder="Search feedback…" value={search} onChange={e => setSearch(e.target.value)}
              InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon sx={{ fontSize: 14, color: text.tertiary }} /></InputAdornment> }}
              sx={{ '& .MuiInputBase-root': { fontSize: 12, height: 28 }, '& input': { py: '4px' }, '& fieldset': { border: '1px solid #E7E9EE' } }}
              fullWidth
            />
          </Box>
          <Tooltip title="Filter">
            <IconButton size="small" sx={{ color: text.tertiary, border: '1px solid #E7E9EE', borderRadius: '6px' }}>
              <FilterIcon sx={{ fontSize: 14 }} />
            </IconButton>
          </Tooltip>
        </Box>

        {/* Review rows */}
        <Box sx={{ flex: 1, overflow: 'auto', '&::-webkit-scrollbar': { width: 4 } }}>
          {filtered.map(review => (
            <ReviewRow
              key={review.id}
              review={review}
              selected={review.id === selectedId}
              onSelect={() => setSelectedId(review.id)}
              onCheck={() => toggleCheck(review.id)}
              checked={checked.includes(review.id)}
            />
          ))}
          {filtered.length === 0 && (
            <Box sx={{ py: '60px', textAlign: 'center' }}>
              <Typography sx={{ fontSize: 13, color: text.tertiary }}>No feedback matches this view</Typography>
            </Box>
          )}
        </Box>
      </Box>

      {/* Pane 3: Context panel */}
      <ContextPanel review={selectedReview} />
    </Box>
  );
};

// Legacy export for any remaining import
export const InboxView = FeedbackView;
