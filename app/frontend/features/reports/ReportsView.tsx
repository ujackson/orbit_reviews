import { useState } from 'react';
import { Box, Typography, alpha, Button, Chip, Divider, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import {
  TrendingDown as ImprovingIcon,
  TrendingUp as WorsensIcon,
  CheckCircle as VerifiedIcon,
  Schedule as PendingIcon,
  PictureAsPdf, TableChart, Share,
  ArrowForward as ArrowIcon,
} from '@mui/icons-material';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RTooltip,
  LineChart, Line,
} from 'recharts';
import { color, text } from '../../shared/tokens/design-tokens';
import { MOCK_ISSUES } from '../../shared/mock/issues';
import { toast } from 'sonner';

// ─── Mock data ────────────────────────────────────────────────────────────────

const SUMMARY_METRICS = [
  { label: 'Issues resolved',        value: '6',    sub: 'this quarter' },
  { label: 'Complaint reduction',     value: '−41%', sub: 'vs prior period' },
  { label: 'Avg detection time',      value: '3.2d', sub: 'signal → issue' },
  { label: 'Avg assignment time',     value: '4.1h', sub: 'issue → owner' },
  { label: 'Avg resolution time',     value: '8.4d', sub: 'confirmed → closed' },
  { label: 'Est. revenue protected',  value: '$52K', sub: 'Q2 2026 · est.' },
];

// Per-resolved-issue scorecard data
const RESOLVED_ISSUES = [
  {
    title: 'Texas checkout failure — payment processor timeout',
    resolvedDate: 'Apr 15, 2026',
    status: 'verified' as const,
    complaintFreqBefore: 127,
    complaintFreqAfter: 12,
    complaintChangePct: -91,
    ratingBefore: 1.6,
    ratingAfter: 4.1,
    revenueProtected: 41000,
    confidence: 'High',
    confidenceBasis: '21-day monitoring · 93% complaint reduction sustained',
    monitoringDays: 21,
  },
  {
    title: 'Support SLA breach in SMB segment (Q1 2026)',
    resolvedDate: 'Mar 1, 2026',
    status: 'verified' as const,
    complaintFreqBefore: 64,
    complaintFreqAfter: 11,
    complaintChangePct: -83,
    ratingBefore: 2.3,
    ratingAfter: 4.4,
    revenueProtected: 28000,
    confidence: 'High',
    confidenceBasis: '30-day monitoring · consistent across all SMB accounts',
    monitoringDays: 30,
  },
  {
    title: 'Mobile app crash on launch (iOS 17)',
    resolvedDate: 'Feb 10, 2026',
    status: 'verified' as const,
    complaintFreqBefore: 43,
    complaintFreqAfter: 4,
    complaintChangePct: -91,
    ratingBefore: 2.1,
    ratingAfter: 4.3,
    revenueProtected: 19000,
    confidence: 'Medium',
    confidenceBasis: '14-day monitoring · smaller sample post-fix',
    monitoringDays: 14,
  },
];

// Monitoring — action taken, awaiting full window
const MONITORING_ISSUES = [
  {
    issueId: 'i1',
    title: 'Android authentication failures after v5.1.0',
    actionTaken: 'SDK rollback deployed Jun 16',
    monitoringStart: 'Jun 16, 2026',
    windowDays: 14,
    daysElapsed: 3,
    complaintFreqBefore: 89,
    ratingBefore: 1.8,
    riskLabel: '$73K est.',
  },
];

const TREND_DATA = [
  { month: 'Jan', complaints: 184, resolved: 1 },
  { month: 'Feb', complaints: 156, resolved: 2 },
  { month: 'Mar', complaints: 132, resolved: 3 },
  { month: 'Apr', complaints: 98,  resolved: 5 },
  { month: 'May', complaints: 74,  resolved: 4 },
  { month: 'Jun', complaints: 61,  resolved: 6 },
];

const RATING_TREND = [
  { month: 'Jan', rating: 3.6 }, { month: 'Feb', rating: 3.7 },
  { month: 'Mar', rating: 3.9 }, { month: 'Apr', rating: 4.0 },
  { month: 'May', rating: 4.1 }, { month: 'Jun', rating: 4.2 },
];

const ttStyle = { background: '#fff', border: '1px solid #E7E9EE', borderRadius: 8, fontSize: 11 };

// ─── Confidence badge ─────────────────────────────────────────────────────────

function ConfidenceBadge({ level }: { level: string }) {
  const cfg = level === 'High'
    ? { color: color.functional.success, bg: alpha(color.functional.success, 0.08) }
    : { color: color.functional.warning, bg: alpha(color.functional.warning, 0.08) };
  return (
    <Chip size="small" label={`${level} confidence`}
      sx={{ height: 17, fontSize: 10, fontWeight: 600, bgcolor: cfg.bg, color: cfg.color, borderRadius: '3px', '& .MuiChip-label': { px: '5px' } }} />
  );
}

// ─── Resolution scorecard ─────────────────────────────────────────────────────

function ResolutionScorecard({ issue }: { issue: typeof RESOLVED_ISSUES[0] }) {
  const ratingColor = (r: number) => r >= 4 ? color.functional.success : r >= 3 ? color.functional.warning : color.functional.error;

  return (
    <Box sx={{ border: '1px solid #E7E9EE', borderRadius: '8px', overflow: 'hidden', bgcolor: '#fff' }}>
      {/* Header */}
      <Box sx={{ px: '16px', py: '12px', borderBottom: '1px solid #E7E9EE', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <VerifiedIcon sx={{ fontSize: 15, color: color.functional.success, flexShrink: 0 }} />
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography sx={{ fontSize: 13, fontWeight: 700, color: text.primary, lineHeight: 1.3 }} noWrap>
            {issue.title}
          </Typography>
          <Typography sx={{ fontSize: 11, color: text.tertiary }}>Resolved {issue.resolvedDate} · {issue.monitoringDays}-day monitoring window</Typography>
        </Box>
        <ConfidenceBadge level={issue.confidence} />
      </Box>

      {/* Metric grid */}
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', borderBottom: '1px solid #E7E9EE' }}>
        {/* Complaint frequency */}
        <Box sx={{ px: '16px', py: '14px', borderRight: '1px solid #E7E9EE' }}>
          <Typography sx={{ fontSize: 10, color: text.tertiary, mb: '6px', fontWeight: 500 }}>Complaint frequency</Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Typography sx={{ fontSize: 18, fontWeight: 600, color: color.functional.error, lineHeight: 1, letterSpacing: '-0.02em' }}>
              {issue.complaintFreqBefore}/wk
            </Typography>
            <ArrowIcon sx={{ fontSize: 12, color: text.tertiary }} />
            <Typography sx={{ fontSize: 18, fontWeight: 600, color: color.functional.success, lineHeight: 1, letterSpacing: '-0.02em' }}>
              {issue.complaintFreqAfter}/wk
            </Typography>
          </Box>
          <Typography sx={{ fontSize: 11, fontWeight: 700, color: color.functional.success, mt: '4px' }}>
            {issue.complaintChangePct}%
          </Typography>
        </Box>

        {/* Rating change */}
        <Box sx={{ px: '16px', py: '14px', borderRight: '1px solid #E7E9EE' }}>
          <Typography sx={{ fontSize: 10, color: text.tertiary, mb: '6px', fontWeight: 500 }}>Rating change</Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Typography sx={{ fontSize: 18, fontWeight: 600, color: ratingColor(issue.ratingBefore), lineHeight: 1, letterSpacing: '-0.02em' }}>
              {issue.ratingBefore}★
            </Typography>
            <ArrowIcon sx={{ fontSize: 12, color: text.tertiary }} />
            <Typography sx={{ fontSize: 18, fontWeight: 600, color: ratingColor(issue.ratingAfter), lineHeight: 1, letterSpacing: '-0.02em' }}>
              {issue.ratingAfter}★
            </Typography>
          </Box>
          <Typography sx={{ fontSize: 11, fontWeight: 700, color: color.functional.success, mt: '4px' }}>
            +{(issue.ratingAfter - issue.ratingBefore).toFixed(1)} pts
          </Typography>
        </Box>

        {/* Revenue protected */}
        <Box sx={{ px: '16px', py: '14px', borderRight: '1px solid #E7E9EE' }}>
          <Typography sx={{ fontSize: 10, color: text.tertiary, mb: '6px', fontWeight: 500 }}>Est. revenue protected</Typography>
          <Typography sx={{ fontSize: 18, fontWeight: 600, color: color.functional.success, lineHeight: 1, letterSpacing: '-0.02em' }}>
            ${(issue.revenueProtected / 1000).toFixed(0)}K
          </Typography>
          <Typography sx={{ fontSize: 10, color: text.tertiary, mt: '4px', fontStyle: 'italic' }}>estimate</Typography>
        </Box>

        {/* Confidence */}
        <Box sx={{ px: '16px', py: '14px' }}>
          <Typography sx={{ fontSize: 10, color: text.tertiary, mb: '6px', fontWeight: 500 }}>Confidence basis</Typography>
          <Typography sx={{ fontSize: 11, color: text.secondary, lineHeight: 1.5 }}>
            {issue.confidenceBasis}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}

// ─── Monitoring card ──────────────────────────────────────────────────────────

function MonitoringCard({ issue }: { issue: typeof MONITORING_ISSUES[0] }) {
  const pct = Math.round((issue.daysElapsed / issue.windowDays) * 100);
  return (
    <Box sx={{ border: `1px solid ${alpha(color.functional.primary, 0.25)}`, borderRadius: '8px', overflow: 'hidden', bgcolor: alpha(color.functional.primary, 0.015) }}>
      <Box sx={{ px: '16px', py: '12px', borderBottom: `1px solid ${alpha(color.functional.primary, 0.12)}`, display: 'flex', alignItems: 'center', gap: '10px' }}>
        <PendingIcon sx={{ fontSize: 15, color: color.functional.primary, flexShrink: 0 }} />
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography sx={{ fontSize: 13, fontWeight: 700, color: text.primary, lineHeight: 1.3 }} noWrap>{issue.title}</Typography>
          <Typography sx={{ fontSize: 11, color: text.tertiary }}>{issue.actionTaken} · monitoring started {issue.monitoringStart}</Typography>
        </Box>
        <Chip size="small" label="Monitoring"
          sx={{ height: 17, fontSize: 10, fontWeight: 600, bgcolor: alpha(color.functional.primary, 0.08), color: color.functional.primary, borderRadius: '3px', '& .MuiChip-label': { px: '5px' } }} />
      </Box>
      <Box sx={{ px: '16px', py: '14px', display: 'flex', gap: '32px', alignItems: 'center' }}>
        <Box>
          <Typography sx={{ fontSize: 10, color: text.tertiary, mb: '2px' }}>Before (complaints/wk)</Typography>
          <Typography sx={{ fontSize: 20, fontWeight: 600, color: color.functional.error, letterSpacing: '-0.02em' }}>{issue.complaintFreqBefore}</Typography>
        </Box>
        <Box>
          <Typography sx={{ fontSize: 10, color: text.tertiary, mb: '2px' }}>Before (rating)</Typography>
          <Typography sx={{ fontSize: 20, fontWeight: 600, color: color.functional.error, letterSpacing: '-0.02em' }}>{issue.ratingBefore}★</Typography>
        </Box>
        <Box>
          <Typography sx={{ fontSize: 10, color: text.tertiary, mb: '2px' }}>Revenue at risk</Typography>
          <Typography sx={{ fontSize: 20, fontWeight: 600, color: color.functional.error, letterSpacing: '-0.02em' }}>{issue.riskLabel}</Typography>
        </Box>
        <Box sx={{ flex: 1 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: '4px' }}>
            <Typography sx={{ fontSize: 10, color: text.tertiary }}>Monitoring window</Typography>
            <Typography sx={{ fontSize: 10, fontWeight: 600, color: color.functional.primary }}>{issue.daysElapsed} / {issue.windowDays} days</Typography>
          </Box>
          <Box sx={{ height: 4, borderRadius: 2, bgcolor: alpha(color.functional.primary, 0.12), overflow: 'hidden' }}>
            <Box sx={{ height: '100%', width: `${pct}%`, bgcolor: color.functional.primary, borderRadius: 2 }} />
          </Box>
          <Typography sx={{ fontSize: 10, color: text.tertiary, mt: '4px' }}>Impact data available after {issue.windowDays - issue.daysElapsed} more days</Typography>
        </Box>
      </Box>
    </Box>
  );
}

// ─── Impact View ──────────────────────────────────────────────────────────────

export const ImpactView = () => {
  const [shareOpen, setShareOpen] = useState(false);

  return (
    <Box sx={{ flex: 1, height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden', bgcolor: '#fff' }}>

      {/* Header */}
      <Box sx={{ px: '24px', py: '12px', borderBottom: '1px solid #E7E9EE', display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
        <Box sx={{ flex: 1 }}>
          <Typography sx={{ fontSize: 14, fontWeight: 700, color: text.primary, letterSpacing: '-0.01em' }}>Impact</Typography>
          <Typography sx={{ fontSize: 11, color: text.tertiary }}>
            Verified outcomes from issue resolution · Q2 2026 · financial figures are estimates
          </Typography>
        </Box>
        <Button size="small" startIcon={<TableChart sx={{ fontSize: 14 }} />}
          onClick={() => toast.success('Exporting to CSV…')}
          sx={{ fontSize: 11, color: text.secondary, border: '1px solid #E7E9EE', height: 28, px: '10px', textTransform: 'none' }}>
          CSV
        </Button>
        <Button size="small" startIcon={<PictureAsPdf sx={{ fontSize: 14 }} />}
          onClick={() => toast.success('Generating PDF…')}
          sx={{ fontSize: 11, color: text.secondary, border: '1px solid #E7E9EE', height: 28, px: '10px', textTransform: 'none' }}>
          PDF
        </Button>
        <Button size="small" variant="contained" startIcon={<Share sx={{ fontSize: 14 }} />}
          onClick={() => setShareOpen(true)}
          sx={{ fontSize: 11, height: 28, px: '12px', bgcolor: color.functional.primary, '&:hover': { bgcolor: color.functional.primaryHover }, textTransform: 'none', fontWeight: 600 }}>
          Share
        </Button>
      </Box>

      {/* Content */}
      <Box sx={{ flex: 1, overflow: 'auto', px: '24px', py: '20px', display: 'flex', flexDirection: 'column', gap: '28px', '&::-webkit-scrollbar': { width: 5 } }}>

        {/* Summary strip */}
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', border: '1px solid #E7E9EE', borderRadius: '8px', overflow: 'hidden' }}>
          {SUMMARY_METRICS.map((m, i) => (
            <Box key={m.label} sx={{ px: '16px', py: '14px', bgcolor: '#fff', borderRight: i < SUMMARY_METRICS.length - 1 ? '1px solid #E7E9EE' : 'none' }}>
              <Typography sx={{ fontSize: 10, color: text.tertiary, mb: '4px', fontWeight: 500 }}>{m.label}</Typography>
              <Typography sx={{ fontSize: 20, fontWeight: 600, color: color.functional.success, lineHeight: 1, letterSpacing: '-0.02em', mb: '3px' }}>
                {m.value}
              </Typography>
              <Typography sx={{ fontSize: 10, color: text.tertiary }}>{m.sub}</Typography>
            </Box>
          ))}
        </Box>

        {/* Charts */}
        <Box sx={{ display: 'flex', gap: '16px' }}>
          <Box sx={{ flex: 1, border: '1px solid #E7E9EE', borderRadius: '8px', p: '16px' }}>
            <Typography sx={{ fontSize: 12, fontWeight: 700, color: text.primary, mb: '2px' }}>Complaint volume</Typography>
            <Typography sx={{ fontSize: 10, color: text.tertiary, mb: '10px' }}>Monthly complaints vs. issues resolved</Typography>
            <ResponsiveContainer width="100%" height={140}>
              <BarChart data={TREND_DATA} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
                <CartesianGrid vertical={false} stroke="rgba(0,0,0,0.04)" />
                <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 9, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
                <RTooltip contentStyle={ttStyle} />
                <Bar key="bar-complaints" dataKey="complaints" fill={alpha(color.functional.error, 0.65)} radius={[3, 3, 0, 0]} name="Complaints" />
                <Bar key="bar-resolved" dataKey="resolved" fill={color.functional.success} radius={[3, 3, 0, 0]} name="Resolved" />
              </BarChart>
            </ResponsiveContainer>
          </Box>
          <Box sx={{ flex: 1, border: '1px solid #E7E9EE', borderRadius: '8px', p: '16px' }}>
            <Typography sx={{ fontSize: 12, fontWeight: 700, color: text.primary, mb: '2px' }}>Overall rating</Typography>
            <Typography sx={{ fontSize: 10, color: text.tertiary, mb: '10px' }}>Average across all review sources</Typography>
            <ResponsiveContainer width="100%" height={140}>
              <LineChart data={RATING_TREND} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
                <CartesianGrid vertical={false} stroke="rgba(0,0,0,0.04)" />
                <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
                <YAxis domain={[3.0, 5.0]} tick={{ fontSize: 9, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
                <RTooltip contentStyle={ttStyle} />
                <Line key="line-rating" type="monotone" dataKey="rating" stroke={color.functional.primary} strokeWidth={2} dot={{ r: 3, fill: color.functional.primary }} name="Avg rating" />
              </LineChart>
            </ResponsiveContainer>
          </Box>
        </Box>

        {/* Verified resolutions */}
        <Box>
          <Box sx={{ mb: '12px' }}>
            <Typography sx={{ fontSize: 13, fontWeight: 700, color: text.primary, mb: '2px' }}>Verified resolutions</Typography>
            <Typography sx={{ fontSize: 11, color: text.tertiary }}>
              Per-issue outcomes · complaint frequency, rating delta, and revenue impact after full monitoring period
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {RESOLVED_ISSUES.map((issue, i) => (
              <ResolutionScorecard key={i} issue={issue} />
            ))}
          </Box>
        </Box>

        {/* Monitoring */}
        {MONITORING_ISSUES.length > 0 && (
          <Box>
            <Box sx={{ mb: '12px' }}>
              <Typography sx={{ fontSize: 13, fontWeight: 700, color: text.primary, mb: '2px' }}>In monitoring</Typography>
              <Typography sx={{ fontSize: 11, color: text.tertiary }}>
                Action taken — waiting for monitoring period to complete before calculating impact
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {MONITORING_ISSUES.map((issue, i) => (
                <MonitoringCard key={i} issue={issue} />
              ))}
            </Box>
          </Box>
        )}

        {/* Open issues — no impact yet */}
        <Box>
          <Typography sx={{ fontSize: 13, fontWeight: 700, color: text.primary, mb: '3px' }}>Open issues — impact pending</Typography>
          <Typography sx={{ fontSize: 11, color: text.tertiary, mb: '10px' }}>
            No action taken yet. Impact data will populate after resolution and monitoring.
          </Typography>
          <Box sx={{ border: '1px solid #E7E9EE', borderRadius: '8px', overflow: 'hidden' }}>
            {MOCK_ISSUES.filter(i => !['verified', 'closed', 'monitoring'].includes(i.status)).map((issue, i, arr) => (
              <Box key={issue.id}>
                {i > 0 && <Divider sx={{ borderColor: '#F3F4F6' }} />}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: '12px', px: '16px', py: '10px', '&:hover': { bgcolor: 'rgba(0,0,0,0.015)' } }}>
                  <Box sx={{ width: 7, height: 7, borderRadius: '50%', bgcolor: issue.severity === 'critical' ? '#E5484D' : issue.severity === 'high' ? '#E58A17' : '#3972E6', flexShrink: 0 }} />
                  <Typography sx={{ fontSize: 13, color: text.primary, fontWeight: 500, flex: 1 }} noWrap>{issue.title}</Typography>
                  <Typography sx={{ fontSize: 11, fontWeight: 700, color: color.functional.error }}>{issue.riskLabel}</Typography>
                  <Chip size="small" label={issue.status.replace('_', ' ')}
                    sx={{ height: 17, fontSize: 10, bgcolor: 'rgba(0,0,0,0.05)', color: text.secondary, '& .MuiChip-label': { px: '5px' } }} />
                  <Typography sx={{ fontSize: 11, color: text.tertiary }}>Open {issue.ageLabel}</Typography>
                </Box>
              </Box>
            ))}
          </Box>
        </Box>

      </Box>

      {/* Share dialog */}
      <Dialog open={shareOpen} onClose={() => setShareOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontSize: 14, fontWeight: 700 }}>Share Impact Report</DialogTitle>
        <DialogContent sx={{ pt: '8px !important' }}>
          <Typography sx={{ fontSize: 13, color: text.secondary, mb: 2 }}>Share a read-only link or send via email.</Typography>
          <Box sx={{ p: '10px 12px', bgcolor: '#F8F9FC', borderRadius: '6px', border: '1px solid #E7E9EE', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography sx={{ fontSize: 11, fontFamily: 'monospace', color: text.secondary, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              https://orbit.reviews/impact/q2-2026/share/abc123
            </Typography>
            <Button size="small"
              onClick={() => { navigator.clipboard.writeText('https://orbit.reviews/impact/q2-2026/share/abc123'); toast.success('Link copied'); }}
              sx={{ fontSize: 10, textTransform: 'none', color: color.functional.primary, minWidth: 0, px: 1 }}>
              Copy
            </Button>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
          <Button onClick={() => setShareOpen(false)} sx={{ textTransform: 'none', color: text.secondary }}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

// Legacy export
export const ReportsView = ImpactView;
