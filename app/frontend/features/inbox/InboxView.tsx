import { useState } from 'react';
import {
  Box, Typography, Divider, alpha, Button, Chip, TextField,
  InputAdornment, IconButton, Tooltip, Rating, Checkbox,
  Tab, Tabs, Menu, MenuItem, Avatar, Dialog,
  DialogTitle, DialogContent, DialogActions, FormControl,
  InputLabel, Select, RadioGroup, FormControlLabel, Radio,
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  ExpandMore as ChevronDown,
  Add as AddIcon,
  Refresh as RefreshIcon,
  Send as SendIcon,
  Edit as EditIcon,
  ContentCopy as CopyIcon,
  Close as CloseIcon,
  ArrowForward,
  Flag as FlagIcon,
  OpenInNew as JiraIcon,
  PersonAdd as AssignIcon,
  Bookmark as WatchIcon,
  MoreHoriz as MoreIcon,
  KeyboardArrowDown,
} from '@mui/icons-material';
import { color, text, radius } from '../../shared/tokens/design-tokens';
import { toast } from 'sonner';
import { useNavigate } from '@/hooks/useInertiaNavigation';
import { useWorkspace } from '@/providers/WorkspaceProvider';

// ─── Types ────────────────────────────────────────────────────────────────────

type WorkflowStatus =
  | 'needs_response'
  | 'response_posted'
  | 'response_pending'
  | 'publish_failed'
  | 'escalated'
  | 'closed'
  | 'sync_delayed'
  | 'deleted_at_source';
type Sentiment = 'positive' | 'negative' | 'neutral' | 'mixed';

interface Signal { label: string }
export interface InboxReview {
  id: string;
  sourceKey: string;   // e.g. 'google', 'appstore'
  sourceName: string;  // e.g. 'Google Business'
  sourceAbbr: string;  // e.g. 'G', 'AS'
  sourceColor: string;
  rating: number;
  title: string;
  excerpt: string;
  body: string;
  author: string;
  context: string;     // product/app/location
  timestamp: string;
  status: WorkflowStatus;
  sentiment: Sentiment;
  tags: string[];      // max 2 shown, rest collapsed
  language?: string;
  translated?: boolean;
  unread?: boolean;
  assignee?: string;
  relatedCount: number;
  signals: Signal[];
  themes: string[];
  suggestedReplyBasis: string[];
  suggestedReply: string;
}

// ─── Saved views ─────────────────────────────────────────────────────────────

const SAVED_VIEWS = [
  { id: 'all',             label: 'All reviews',      count: 4821 },
  { id: 'unread',          label: 'Unread',           count: 312  },
  { id: 'needs_response',  label: 'Needs response',   count: 47   },
  { id: 'assigned_me',     label: 'Assigned to me',   count: 8    },
  { id: 'escalated',       label: 'Escalated',        count: 6    },
  { id: 'negative',        label: 'Negative',         count: 634  },
  { id: 'recently_changed',label: 'Recently changed', count: 23   },
];

// ─── Review data ──────────────────────────────────────────────────────────────

const REVIEWS: InboxReview[] = [
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
    suggestedReply: 'Hi Marcus,\n\nThank you for reporting this. We\'re aware of a login issue affecting some Android users after updating to v5.1.0, and our team is actively working on a resolution.\n\nIn the meantime, please try clearing the app cache under Settings > Apps > Orbit > Clear Cache. If the issue persists, our support team is ready to assist at support@orbit.com.\n\nWe apologize for the disruption.',
  },
  {
    id: 'r2', sourceKey: 'g2', sourceName: 'G2', sourceAbbr: 'G2', sourceColor: '#FF492C',
    rating: 5,
    title: 'Best review management platform — transformed our CX operations',
    excerpt: 'Orbit has completely transformed how we manage customer feedback across 200+ locations. The response suggestions are consistently on-brand and save hours.',
    body: 'Orbit has completely transformed how we manage customer feedback across 200+ locations. The response suggestions are consistently on-brand and the automated triage saves our team 4+ hours weekly. We went from 28% to 71% response rate in the first month.',
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
    suggestedReply: 'Thank you so much, Sarah. A 28% to 71% response rate improvement is exactly the outcome we design for, and it\'s genuinely motivating to hear it reflected in real operations.\n\nWe\'d love to feature your story — would you be open to a brief case study conversation?\n\nThank you for being part of the Orbit community.',
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
    suggestedReply: 'Hi Jennifer,\n\nWe\'re very sorry this has happened twice. Receiving a damaged product is unacceptable, and a repeat occurrence makes that worse.\n\nPlease email orders@orbit.com with your order number and we will arrange a priority replacement at no cost to you. We are also investigating our carrier packaging process.\n\nThank you for your patience.',
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
    suggestedReply: 'Thank you, David. We\'re glad the support team made a difference during onboarding.\n\nYour feedback on setup time is noted — we\'re actively working on a guided onboarding experience that should reduce ramp time significantly.\n\nDon\'t hesitate to reach out if there\'s anything we can improve for your team.',
  },
  {
    id: 'r5', sourceKey: 'playstore', sourceName: 'Google Play', sourceAbbr: 'PL', sourceColor: '#3DDC84',
    rating: 3,
    title: 'Desktop analytics superior — mobile app needs investment',
    excerpt: 'We use both Orbit and Intercom. Orbit\'s desktop analytics are far superior but the mobile experience still has significant gaps vs competitors.',
    body: 'We use both Orbit and Intercom. Orbit\'s desktop analytics are far superior and the insights features are class-leading. However the mobile app experience has significant gaps compared to Intercom\'s mobile app — speed, navigation clarity, and offline support are all noticeably behind.',
    author: 'Alex M.', context: 'Orbit Pro · Android', timestamp: 'Jun 13, 9:47 AM',
    status: 'closed', sentiment: 'neutral',
    tags: ['Mobile', 'Competitor'],
    relatedCount: 44, language: 'en',
    signals: [
      { label: '3-star rating' },
      { label: 'Competitor comparison' },
      { label: 'Mobile gap identified' },
    ],
    themes: ['Mobile experience', 'Competitor comparison'],
    suggestedReplyBasis: ['Original review', 'Approved response policy'],
    suggestedReply: 'Thank you for the detailed comparison, Alex. Honest feedback like this directly informs our roadmap.\n\nYou\'re right that desktop is where we\'ve invested most heavily. Mobile is a focus area for us and we\'d welcome the opportunity to learn more about the specific gaps your team experiences.\n\nWould you be open to a brief product call?',
  },
];

// ─── Status component ─────────────────────────────────────────────────────────

const statusMeta: Record<WorkflowStatus, { label: string; color: string; bg: string }> = {
  needs_response:    { label: 'Needs response',    color: color.functional.warning,  bg: alpha(color.functional.warning, 0.10) },
  response_posted:   { label: 'Response posted',   color: color.functional.success,  bg: alpha(color.functional.success, 0.08) },
  response_pending:  { label: 'Pending approval',  color: color.functional.info,     bg: alpha(color.functional.info, 0.08) },
  publish_failed:    { label: 'Publish failed',    color: color.functional.error,    bg: alpha(color.functional.error, 0.08) },
  escalated:         { label: 'Escalated',         color: color.functional.error,    bg: alpha(color.functional.error, 0.08) },
  closed:            { label: 'Closed',            color: text.tertiary,              bg: 'rgba(0,0,0,0.05)' },
  sync_delayed:      { label: 'Sync delayed',      color: color.functional.warning,  bg: alpha(color.functional.warning, 0.08) },
  deleted_at_source: { label: 'Deleted at source', color: text.tertiary,              bg: 'rgba(0,0,0,0.05)' },
};

function StatusBadge({ status }: { status: WorkflowStatus }) {
  const m = statusMeta[status];
  return (
    <Chip size="small" label={m.label}
      sx={{ height: 20, fontSize: 11, fontWeight: 700, bgcolor: m.bg, color: m.color, border: `1px solid ${alpha(m.color, 0.18)}`, '& .MuiChip-label': { px: '7px' } }} />
  );
}

// ─── Source badge ─────────────────────────────────────────────────────────────

function SourceBadge({ abbr, color: bg }: { abbr: string; color: string }) {
  return (
    <Box sx={{ width: 26, height: 26, borderRadius: '6px', bgcolor: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <Typography sx={{ fontSize: 9, fontWeight: 700, color: '#fff', lineHeight: 1 }}>{abbr}</Typography>
    </Box>
  );
}

// ─── Review row ───────────────────────────────────────────────────────────────

function ReviewRow({ review, selected, onSelect, onCheck, checked }: {
  review: InboxReview; selected: boolean; onSelect: () => void; onCheck: () => void; checked: boolean;
}) {
  const visibleTags = review.tags.slice(0, 2);
  const extraTags   = review.tags.length - 2;

  return (
    <Box
      onClick={onSelect}
      sx={{
        display: 'flex', alignItems: 'flex-start', gap: '10px',
        px: '14px', py: '13px', cursor: 'pointer',
        bgcolor: selected ? '#EEF2FF' : '#fff',
        borderLeft: `3px solid ${selected ? color.functional.primary : 'transparent'}`,
        borderBottom: '1px solid #E5E7EB',
        transition: 'background 0.08s',
        '&:hover': { bgcolor: selected ? '#E0E7FF' : '#F9FAFB' },
      }}
    >
      {/* Checkbox */}
      <Checkbox
        size="small"
        checked={checked}
        onChange={e => { e.stopPropagation(); onCheck(); }}
        onClick={e => e.stopPropagation()}
        sx={{ p: 0, mt: '1px', flexShrink: 0 }}
      />

      {/* Source badge */}
      <SourceBadge abbr={review.sourceAbbr} color={review.sourceColor} />

      {/* Content */}
      <Box sx={{ flex: 1, minWidth: 0 }}>
        {/* Row 1: rating + unread dot + timestamp */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px', mb: '4px' }}>
          <Rating value={review.rating} readOnly size="small" sx={{ fontSize: 12 }} />
          {review.unread && <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: color.functional.primary, flexShrink: 0 }} />}
          <Box sx={{ flex: 1 }} />
          <Typography sx={{ fontSize: 12, color: text.tertiary, fontWeight: 500, flexShrink: 0 }}>{review.timestamp}</Typography>
        </Box>

        {/* Row 2: title */}
        <Typography
          sx={{ fontSize: 14, fontWeight: review.unread ? 700 : 600, color: text.primary, lineHeight: 1.35, mb: '3px' }}
          noWrap
        >
          {review.title}
        </Typography>

        {/* Row 3: excerpt */}
        <Typography sx={{
          fontSize: 13, color: text.secondary, lineHeight: 1.5, mb: '7px',
          overflow: 'hidden', display: '-webkit-box',
          WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
        }}>
          {review.excerpt}
        </Typography>

        {/* Row 4: author + context + status + tags */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: '5px', flexWrap: 'wrap' }}>
          <Typography sx={{ fontSize: 12, fontWeight: 600, color: text.secondary }}>{review.author}</Typography>
          <Typography sx={{ fontSize: 12, color: text.tertiary }}>· {review.context}</Typography>
          <Box sx={{ flex: 1 }} />
          <StatusBadge status={review.status} />
          {visibleTags.map(tag => (
            <Chip key={tag} size="small" label={tag}
              sx={{ height: 20, fontSize: 11, bgcolor: '#F3F4F6', border: '1px solid #E5E7EB', color: text.secondary, '& .MuiChip-label': { px: '7px' } }} />
          ))}
          {extraTags > 0 && (
            <Typography sx={{ fontSize: 12, color: text.tertiary }}>+{extraTags}</Typography>
          )}
          {review.translated && (
            <Chip size="small" label="Translated"
              sx={{ height: 20, fontSize: 11, bgcolor: alpha(color.functional.info, 0.08), color: color.functional.info, border: `1px solid ${alpha(color.functional.info, 0.18)}`, '& .MuiChip-label': { px: '7px' } }} />
          )}
        </Box>
      </Box>
    </Box>
  );
}

// ─── Context panel ─────────────────────────────────────────────────────────────

function ContextPanel({ review }: { review: InboxReview | null }) {
  const [tab, setTab]         = useState(0);
  const [editing, setEditing] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [assignOpen, setAssignOpen] = useState(false);
  const [jiraOpen, setJiraOpen]     = useState(false);
  const [assignee, setAssignee]     = useState('sarah');

  if (!review) {
    return (
      <Box sx={{ width: 360, flexShrink: 0, bgcolor: '#F9FAFB', borderLeft: '1px solid #E5E7EB', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography sx={{ fontSize: 13, color: text.tertiary }}>Select a review</Typography>
      </Box>
    );
  }

  const MEMBERS = [
    { id: 'sarah', name: 'Sarah Chen', role: 'Head of CX' },
    { id: 'marcus', name: 'Marcus Thompson', role: 'CX Manager' },
    { id: 'priya', name: 'Priya Sharma', role: 'Support Lead' },
  ];

  return (
    <Box sx={{ width: 360, flexShrink: 0, bgcolor: '#F9FAFB', borderLeft: '1px solid #E5E7EB', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Review header */}
      <Box sx={{ px: '18px', py: '14px', bgcolor: '#fff', borderBottom: '1px solid #E5E7EB', flexShrink: 0 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px', mb: '4px' }}>
          <SourceBadge abbr={review.sourceAbbr} color={review.sourceColor} />
          <Rating value={review.rating} readOnly size="small" sx={{ fontSize: 12 }} />
          <StatusBadge status={review.status} />
        </Box>
        <Typography sx={{ fontSize: 13, color: text.secondary, fontWeight: 500 }}>{review.author} · {review.context} · {review.timestamp}</Typography>
      </Box>

      {/* Tabs */}
      <Tabs value={tab} onChange={(_, v) => setTab(v)}
        sx={{ px: '10px', bgcolor: '#fff', borderBottom: '1px solid #E5E7EB', flexShrink: 0,
          '& .MuiTab-root': { minHeight: 40, py: 0, fontSize: 12, px: '9px', fontWeight: 600, color: text.tertiary },
          '& .Mui-selected': { color: `${color.functional.primary} !important` },
          '& .MuiTabs-indicator': { height: 2 } }}>
        <Tab label="Summary" />
        <Tab label="Evidence" />
        <Tab label="Related" />
        <Tab label="Activity" />
      </Tabs>

      <Box sx={{ flex: 1, overflow: 'auto', '&::-webkit-scrollbar': { width: 3 }, '&::-webkit-scrollbar-thumb': { bgcolor: 'rgba(0,0,0,0.10)', borderRadius: 2 } }}>

        {/* ── Summary tab ── */}
        {tab === 0 && (
          <Box sx={{ p: '16px 18px', display: 'flex', flexDirection: 'column', gap: '16px' }}>

            {/* Issue summary */}
            <Box>
              <Typography sx={{ fontSize: 11, fontWeight: 700, color: text.tertiary, textTransform: 'uppercase', letterSpacing: '0.07em', mb: '6px' }}>Issue summary</Typography>
              <Typography sx={{ fontSize: 13, color: text.primary, lineHeight: 1.65 }}>{review.excerpt}</Typography>
            </Box>

            <Divider />

            {/* Signals */}
            <Box>
              <Typography sx={{ fontSize: 11, fontWeight: 700, color: text.tertiary, textTransform: 'uppercase', letterSpacing: '0.07em', mb: '6px' }}>Signals</Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {review.signals.map(s => (
                  <Box key={s.label} sx={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Box sx={{ width: 4, height: 4, borderRadius: '50%', bgcolor: text.tertiary, flexShrink: 0 }} />
                    <Typography sx={{ fontSize: 13, color: text.secondary }}>{s.label}</Typography>
                  </Box>
                ))}
              </Box>
            </Box>

            <Divider />

            {/* Related pattern — evidence, not confidence % */}
            {review.relatedCount > 0 && (
              <Box sx={{ px: '12px', py: '10px', bgcolor: '#fff', borderRadius: '8px', border: '1px solid #E5E7EB' }}>
                <Typography sx={{ fontSize: 12, fontWeight: 700, color: text.primary, mb: '2px' }}>
                  Strong match · {review.relatedCount} related reviews
                </Typography>
                <Typography sx={{ fontSize: 12, color: text.tertiary }}>
                  In the last 7 days · {review.sourceName}
                </Typography>
              </Box>
            )}

            {/* Themes */}
            <Box>
              <Typography sx={{ fontSize: 11, fontWeight: 700, color: text.tertiary, textTransform: 'uppercase', letterSpacing: '0.07em', mb: '6px' }}>Themes</Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                {review.themes.map(t => (
                  <Chip key={t} size="small" label={t}
                    sx={{ height: 22, fontSize: 11, bgcolor: '#fff', border: '1px solid #D1D5DB', color: text.secondary, '& .MuiChip-label': { px: '8px' } }} />
                ))}
              </Box>
            </Box>

            <Divider />

            {/* Suggested response — prominent, above secondary actions */}
            <Box sx={{ bgcolor: '#fff', borderRadius: '8px', border: '1px solid #D1D5DB', overflow: 'hidden' }}>
              <Box sx={{ px: '12px', py: '10px', borderBottom: '1px solid #E5E7EB', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography sx={{ fontSize: 13, fontWeight: 700, color: text.primary }}>Suggested response</Typography>
                {!editing && (
                  <Button size="small" onClick={() => { setEditing(true); setReplyText(review.suggestedReply); }}
                    startIcon={<EditIcon sx={{ fontSize: 13 }} />}
                    sx={{ fontSize: 12, height: 26, px: '8px', color: text.secondary }}>
                    Edit
                  </Button>
                )}
              </Box>

              {/* Grounding — no fake confidence, just provenance */}
              <Box sx={{ px: '12px', py: '7px', bgcolor: '#F9FAFB', borderBottom: '1px solid #E5E7EB' }}>
                <Typography sx={{ fontSize: 12, color: text.tertiary, fontWeight: 500 }}>
                  Based on: {review.suggestedReplyBasis.join(' · ')}
                </Typography>
              </Box>

              <Box sx={{ px: '12px', py: '10px' }}>
                {editing ? (
                  <TextField
                    value={replyText}
                    onChange={e => setReplyText(e.target.value)}
                    multiline fullWidth autoFocus minRows={5}
                    sx={{ '& .MuiInputBase-root': { fontSize: 12, lineHeight: 1.65, bgcolor: '#fff' }, '& fieldset': { borderColor: alpha(color.functional.primary, 0.35) } }}
                  />
                ) : (
                  <Typography sx={{ fontSize: 13, color: text.secondary, lineHeight: 1.65, whiteSpace: 'pre-line' }}>
                    {review.suggestedReply}
                  </Typography>
                )}

                <Box sx={{ display: 'flex', gap: '5px', mt: '10px', flexWrap: 'wrap' }}>
                  <Button size="small" variant="contained"
                    startIcon={<SendIcon sx={{ fontSize: 13 }} />}
                    onClick={() => { toast.success('Response published'); setEditing(false); }}
                    sx={{ fontSize: 12, height: 30, bgcolor: color.functional.primary, '&:hover': { bgcolor: color.functional.primaryHover } }}>
                    Publish
                  </Button>
                  <Button size="small" onClick={() => toast.success('Sent for approval')}
                    sx={{ fontSize: 11, height: 28, px: '8px', border: '1px solid rgba(0,0,0,0.12)', color: text.secondary }}>
                    For approval
                  </Button>
                  <Button size="small" onClick={() => toast.success('Regenerating…')}
                    sx={{ fontSize: 11, height: 28, px: '8px', border: '1px solid rgba(0,0,0,0.12)', color: text.secondary }}>
                    Regenerate
                  </Button>
                  <Button size="small" onClick={() => toast.success('Shortened')}
                    sx={{ fontSize: 11, height: 28, px: '8px', border: '1px solid rgba(0,0,0,0.12)', color: text.secondary }}>
                    Shorten
                  </Button>
                  {editing && (
                    <Button size="small" onClick={() => setEditing(false)}
                      sx={{ fontSize: 11, height: 28, px: '8px', color: text.tertiary }}>
                      Cancel
                    </Button>
                  )}
                </Box>
              </Box>
            </Box>

            <Divider />

            {/* Secondary actions */}
            <Box sx={{ display: 'flex', gap: '6px' }}>
              <Button size="small" variant="outlined" fullWidth onClick={() => setAssignOpen(true)}
                sx={{ fontSize: 11, height: 28, borderColor: 'rgba(0,0,0,0.14)', color: text.secondary }}>
                Assign
              </Button>
              <Button size="small" variant="outlined" fullWidth onClick={() => setJiraOpen(true)}
                sx={{ fontSize: 11, height: 28, borderColor: 'rgba(0,0,0,0.14)', color: text.secondary }}>
                Create issue
              </Button>
              <Button size="small" variant="outlined" onClick={() => toast.success('Added to watchlist')}
                sx={{ fontSize: 11, height: 28, minWidth: 0, px: '8px', borderColor: 'rgba(0,0,0,0.14)', color: text.secondary }}>
                <WatchIcon sx={{ fontSize: 14 }} />
              </Button>
            </Box>
          </Box>
        )}

        {/* ── Evidence tab ── */}
        {tab === 1 && (
          <Box sx={{ p: '14px 16px' }}>
            <Typography sx={{ fontSize: 10, fontWeight: 700, color: text.tertiary, textTransform: 'uppercase', letterSpacing: '0.07em', mb: '10px' }}>
              Full review text
            </Typography>
            <Typography sx={{ fontSize: 12, color: text.primary, lineHeight: 1.7, fontStyle: 'italic' }}>
              "{review.body}"
            </Typography>
            <Box sx={{ mt: '14px', pt: '12px', borderTop: '1px solid rgba(0,0,0,0.07)' }}>
              <Typography sx={{ fontSize: 10, fontWeight: 700, color: text.tertiary, textTransform: 'uppercase', letterSpacing: '0.07em', mb: '8px' }}>
                Source metadata
              </Typography>
              {[
                { k: 'Source',   v: review.sourceName },
                { k: 'Rating',   v: `${review.rating} / 5` },
                { k: 'Context',  v: review.context },
                { k: 'Received', v: review.timestamp },
                { k: 'Language', v: review.language ?? 'English' },
              ].map(row => (
                <Box key={row.k} sx={{ display: 'flex', py: '4px' }}>
                  <Typography sx={{ fontSize: 11, color: text.tertiary, width: 80, flexShrink: 0 }}>{row.k}</Typography>
                  <Typography sx={{ fontSize: 11, color: text.secondary }}>{row.v}</Typography>
                </Box>
              ))}
            </Box>
          </Box>
        )}

        {/* ── Related tab ── */}
        {tab === 2 && (
          <Box sx={{ p: '14px 16px' }}>
            <Box sx={{ px: '12px', py: '10px', bgcolor: '#fff', borderRadius: '7px', border: '1px solid rgba(0,0,0,0.08)', mb: '12px' }}>
              <Typography sx={{ fontSize: 12, fontWeight: 700, color: text.primary }}>
                {review.relatedCount} reviews share this pattern
              </Typography>
              <Typography sx={{ fontSize: 11, color: text.tertiary, mt: '2px' }}>in the last 7 days</Typography>
            </Box>
            {Array.from({ length: 3 }).map((_, i) => (
              <Box key={i} sx={{ py: '10px', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: '6px', mb: '4px' }}>
                  <Rating value={review.rating} readOnly size="small" sx={{ fontSize: 11 }} />
                  <Typography sx={{ fontSize: 10, color: text.tertiary }}>Jun {14 - i}</Typography>
                </Box>
                <Typography sx={{ fontSize: 11, color: text.secondary, lineHeight: 1.5 }}>
                  "{['Still cannot log in after the update. Very frustrated.', 'Login broken on Android v5.1.0. Please fix this urgently.', 'App crash immediately on opening after latest update.'][i]}"
                </Typography>
              </Box>
            ))}
          </Box>
        )}

        {/* ── Activity tab ── */}
        {tab === 3 && (
          <Box sx={{ p: '14px 16px' }}>
            <Typography sx={{ fontSize: 10, fontWeight: 700, color: text.tertiary, textTransform: 'uppercase', letterSpacing: '0.07em', mb: '10px' }}>
              Activity
            </Typography>
            {[
              { action: 'Review received', actor: 'System', time: review.timestamp },
              { action: 'Marked as needs response', actor: 'Auto-triage', time: review.timestamp },
              { action: 'Pattern detected', actor: 'System', time: 'Jun 15, 2:16 PM' },
            ].map((a, i) => (
              <Box key={i} sx={{ display: 'flex', gap: '10px', mb: '10px' }}>
                <Box sx={{ width: 1, bgcolor: 'rgba(0,0,0,0.10)', flexShrink: 0, borderRadius: 1, alignSelf: 'stretch', ml: '7px' }} />
                <Box>
                  <Typography sx={{ fontSize: 12, color: text.primary }}>{a.action}</Typography>
                  <Typography sx={{ fontSize: 10, color: text.tertiary }}>{a.actor} · {a.time}</Typography>
                </Box>
              </Box>
            ))}
          </Box>
        )}
      </Box>

      {/* Assign dialog */}
      <Dialog open={assignOpen} onClose={() => setAssignOpen(false)} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: '10px' } }}>
        <DialogTitle sx={{ fontSize: 14, fontWeight: 700 }}>Assign review</DialogTitle>
        <DialogContent sx={{ pt: '8px !important' }}>
          <RadioGroup value={assignee} onChange={e => setAssignee(e.target.value)}>
            {MEMBERS.map(m => (
              <Box key={m.id} sx={{ display: 'flex', alignItems: 'center', gap: '10px', py: '8px' }}>
                <Radio value={m.id} size="small" />
                <Avatar sx={{ width: 26, height: 26, fontSize: 10, bgcolor: alpha(color.functional.primary, 0.12), color: color.functional.primary }}>
                  {m.name.split(' ').map(n => n[0]).join('')}
                </Avatar>
                <Box>
                  <Typography sx={{ fontSize: 13, fontWeight: 500 }}>{m.name}</Typography>
                  <Typography sx={{ fontSize: 11, color: text.tertiary }}>{m.role}</Typography>
                </Box>
              </Box>
            ))}
          </RadioGroup>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={() => setAssignOpen(false)} sx={{ color: text.secondary }}>Cancel</Button>
          <Button variant="contained" onClick={() => { toast.success(`Assigned to ${MEMBERS.find(m => m.id === assignee)?.name}`); setAssignOpen(false); }}
            sx={{ bgcolor: color.functional.primary }}>Assign</Button>
        </DialogActions>
      </Dialog>

      {/* Jira dialog */}
      <Dialog open={jiraOpen} onClose={() => setJiraOpen(false)} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: '10px' } }}>
        <DialogTitle sx={{ fontSize: 14, fontWeight: 700 }}>Create Jira issue</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: '8px !important' }}>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <FormControl size="small" sx={{ flex: 1 }}>
              <InputLabel>Project</InputLabel>
              <Select defaultValue="CX" label="Project">
                {['CX', 'ENG', 'PRODUCT'].map(p => <MenuItem key={p} value={p} sx={{ fontSize: 13 }}>{p}</MenuItem>)}
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ flex: 1 }}>
              <InputLabel>Priority</InputLabel>
              <Select defaultValue="High" label="Priority">
                {['Critical', 'High', 'Medium'].map(p => <MenuItem key={p} value={p} sx={{ fontSize: 13 }}>{p}</MenuItem>)}
              </Select>
            </FormControl>
          </Box>
          <TextField label="Title" defaultValue={review.title} fullWidth size="small" />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={() => setJiraOpen(false)} sx={{ color: text.secondary }}>Cancel</Button>
          <Button variant="contained" onClick={() => { toast.success('Jira issue created'); setJiraOpen(false); }}
            sx={{ bgcolor: '#0052CC', '&:hover': { bgcolor: '#0043A8' } }}>Create</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

// ─── Bulk action bar ──────────────────────────────────────────────────────────

function BulkBar({ count, onClear }: { count: number; onClear: () => void }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px', px: '14px', py: '8px', bgcolor: alpha(color.functional.primary, 0.07), borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
      <Typography sx={{ fontSize: 12, fontWeight: 600, color: color.functional.primary }}>{count} selected</Typography>
      <Box sx={{ flex: 1 }} />
      {['Mark read', 'Assign', 'Export', 'Dismiss'].map(a => (
        <Button key={a} size="small" onClick={() => { toast.success(`${a} applied to ${count} reviews`); onClear(); }}
          sx={{ fontSize: 11, height: 26, px: '10px', border: '1px solid rgba(0,0,0,0.12)', color: text.secondary }}>
          {a}
        </Button>
      ))}
      <IconButton size="small" onClick={onClear} sx={{ color: text.tertiary }}>
        <CloseIcon sx={{ fontSize: 15 }} />
      </IconButton>
    </Box>
  );
}

// ─── Main view ────────────────────────────────────────────────────────────────

export const InboxView = ({ reviews: initialReviews }: { reviews?: InboxReview[] }) => {
  const reviews = initialReviews?.length ? initialReviews : REVIEWS;
  const [activeView, setActiveView]   = useState('all');
  const [selected, setSelected]       = useState<InboxReview | null>(reviews[0] ?? null);
  const [checked, setChecked]         = useState<Set<string>>(new Set());
  const [search, setSearch]           = useState('');

  const filtered = reviews.filter(r => {
    if (search && !r.title.toLowerCase().includes(search.toLowerCase()) && !r.author.toLowerCase().includes(search.toLowerCase())) return false;
    if (activeView === 'unread'         && !r.unread) return false;
    if (activeView === 'needs_response' && r.status !== 'needs_response') return false;
    if (activeView === 'escalated'      && r.status !== 'escalated') return false;
    if (activeView === 'negative'       && r.sentiment !== 'negative') return false;
    return true;
  });

  const toggleCheck = (id: string) => {
    setChecked(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  return (
    <Box sx={{ display: 'flex', flex: 1, height: '100%', overflow: 'hidden' }}>

      {/* ── Pane 1: Saved views (180px) ── */}
      <Box sx={{ width: 180, flexShrink: 0, bgcolor: '#FAFAFA', borderRight: '1px solid rgba(0,0,0,0.07)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <Box sx={{ px: '12px', py: '12px', borderBottom: '1px solid #E5E7EB', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography sx={{ fontSize: 13, fontWeight: 700, color: text.primary }}>Inbox</Typography>
          <Tooltip title="New saved view">
            <IconButton size="small" sx={{ color: text.tertiary }}>
              <AddIcon sx={{ fontSize: 15 }} />
            </IconButton>
          </Tooltip>
        </Box>

        <Box sx={{ flex: 1, overflow: 'auto', p: '6px 6px', '&::-webkit-scrollbar': { display: 'none' } }}>
          {SAVED_VIEWS.map(v => {
            const on = activeView === v.id;
            return (
              <Box key={v.id} onClick={() => setActiveView(v.id)}
                sx={{
                  display: 'flex', alignItems: 'center', px: '8px', py: '7px', borderRadius: '6px',
                  cursor: 'pointer', mb: '1px',
                  bgcolor: on ? '#EEF2FF' : 'transparent',
                  '&:hover': { bgcolor: on ? '#E0E7FF' : '#F3F4F6' },
                }}>
                <Typography sx={{ fontSize: 12, flex: 1, fontWeight: on ? 700 : 500, color: on ? color.functional.primary : text.secondary }}>
                  {v.label}
                </Typography>
                <Typography sx={{ fontSize: 12, color: on ? color.functional.primary : text.tertiary, fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>
                  {v.count > 999 ? `${(v.count / 1000).toFixed(1)}k` : v.count}
                </Typography>
              </Box>
            );
          })}

          <Divider sx={{ my: '8px' }} />

          <Typography sx={{ fontSize: 11, fontWeight: 700, color: text.tertiary, px: '8px', mb: '4px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Sources
          </Typography>
          {[
            { abbr: 'G', label: 'Google Business', bg: '#4285F4' },
            { abbr: 'AS', label: 'App Store', bg: '#555' },
            { abbr: 'PL', label: 'Play Store', bg: '#3DDC84' },
            { abbr: 'G2', label: 'G2', bg: '#FF492C' },
          ].map(src => (
            <Box key={src.label} sx={{ display: 'flex', alignItems: 'center', gap: '7px', px: '8px', py: '5px', borderRadius: '6px', cursor: 'pointer', '&:hover': { bgcolor: 'rgba(0,0,0,0.04)' } }}>
              <Box sx={{ width: 16, height: 16, borderRadius: '4px', bgcolor: src.bg, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Typography sx={{ fontSize: 7, fontWeight: 800, color: '#fff', lineHeight: 1 }}>{src.abbr}</Typography>
              </Box>
              <Typography sx={{ fontSize: 12, color: text.secondary, fontWeight: 500 }}>{src.label}</Typography>
            </Box>
          ))}
        </Box>
      </Box>

      {/* ── Pane 2: Review list (flex) ── */}
      <Box sx={{ flex: 1, minWidth: 0, bgcolor: '#fff', borderRight: '1px solid rgba(0,0,0,0.07)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Toolbar */}
        <Box sx={{ px: '12px', py: '8px', borderBottom: '1px solid #E5E7EB', display: 'flex', gap: '8px', alignItems: 'center', flexShrink: 0 }}>
          <TextField size="small" placeholder="Search reviews…" value={search} onChange={e => setSearch(e.target.value)}
            InputProps={{
              startAdornment: <InputAdornment position="start"><SearchIcon sx={{ fontSize: 15, color: text.tertiary }} /></InputAdornment>,
              sx: { fontSize: 13, bgcolor: '#fff', '& fieldset': { border: '1px solid #D1D5DB' }, borderRadius: '6px' },
            }}
            sx={{ flex: 1 }}
          />
          <Tooltip title="Filter">
            <IconButton size="small" sx={{ color: text.tertiary }}><FilterIcon sx={{ fontSize: 16 }} /></IconButton>
          </Tooltip>
          <Tooltip title="Refresh">
            <IconButton size="small" sx={{ color: text.tertiary }}><RefreshIcon sx={{ fontSize: 16 }} /></IconButton>
          </Tooltip>
        </Box>

        {/* Count + bulk select */}
        {checked.size > 0 ? (
          <BulkBar count={checked.size} onClear={() => setChecked(new Set())} />
        ) : (
          <Box sx={{ px: '14px', py: '7px', borderBottom: '1px solid #E5E7EB', display: 'flex', alignItems: 'center' }}>
            <Typography sx={{ fontSize: 12, color: text.tertiary, fontWeight: 600 }}>
              {filtered.length} review{filtered.length !== 1 ? 's' : ''}
            </Typography>
          </Box>
        )}

        {/* Review list */}
        <Box sx={{ flex: 1, overflow: 'auto', '&::-webkit-scrollbar': { width: 4 }, '&::-webkit-scrollbar-thumb': { bgcolor: 'rgba(0,0,0,0.10)', borderRadius: 2 } }}>
          {filtered.length === 0 ? (
            <Box sx={{ py: 8, textAlign: 'center' }}>
              <Typography sx={{ fontSize: 13, color: text.tertiary }}>No reviews match this filter</Typography>
            </Box>
          ) : (
            filtered.map(r => (
              <ReviewRow
                key={r.id}
                review={r}
                selected={selected?.id === r.id}
                onSelect={() => setSelected(r)}
                onCheck={() => toggleCheck(r.id)}
                checked={checked.has(r.id)}
              />
            ))
          )}
        </Box>
      </Box>

      {/* ── Pane 3: Context panel (340px) ── */}
      <ContextPanel review={selected} />
    </Box>
  );
};
