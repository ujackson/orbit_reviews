import { useState } from 'react';
import {
  Box, Typography, alpha, Button, Chip, Divider, IconButton, Tooltip,
  Select, MenuItem, FormControl, InputLabel, Drawer, Tabs, Tab,
  TextField, Avatar, LinearProgress,
} from '@mui/material';
import {
  Close as CloseIcon,
  Add as AddIcon,
  BookmarkBorder as WatchIcon,
  PersonAdd as AssignIcon,
  OpenInNew as JiraIcon,
  ArrowUpward as UpIcon,
  ArrowDownward as DownIcon,
  FilterList as FilterIcon,
  CheckCircle as CheckIcon,
  RadioButtonUnchecked as EmptyCircle,
} from '@mui/icons-material';
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip as RTooltip, CartesianGrid,
} from 'recharts';
import { color, text } from '../../shared/tokens/design-tokens';
import { MOCK_ISSUES, MOCK_ACTIONS, severityConfig, statusConfig, actionStatusConfig, type Issue, type IssueStatus } from '../../shared/mock/issues';
import { toast } from 'sonner';

// ─── Constants ────────────────────────────────────────────────────────────────

const ttStyle = { background: '#fff', border: '1px solid #E7E9EE', borderRadius: 8, fontSize: 11 };

const trendData = [
  { d: 'Jun 10', v: 8 }, { d: 'Jun 11', v: 14 }, { d: 'Jun 12', v: 22 },
  { d: 'Jun 13', v: 31 }, { d: 'Jun 14', v: 45 }, { d: 'Jun 15', v: 61 },
  { d: 'Jun 16', v: 89 },
];

const STATUS_OPTIONS: IssueStatus[] = [
  'new', 'confirmed', 'investigating', 'action_required',
  'in_progress', 'monitoring', 'verified', 'closed', 'dismissed',
];

const TIMELINE_EVENTS = [
  { label: 'Detected', date: 'Jun 10, 2026 · 9:14 AM', done: true },
  { label: 'Confirmed', date: 'Jun 11, 2026 · 2:31 PM', done: true },
  { label: 'Assigned to Mobile Platform', date: 'Jun 11, 2026 · 3:00 PM', done: true },
  { label: 'Action started — SDK rollback', date: 'Jun 12, 2026 · 10:22 AM', done: true },
  { label: 'Action completed', date: 'Pending', done: false },
  { label: 'Monitoring started', date: 'Pending', done: false },
  { label: 'Outcome verified', date: 'Pending', done: false },
];

// ─── Severity / status chips ──────────────────────────────────────────────────

function SevChip({ severity }: { severity: Issue['severity'] }) {
  const s = severityConfig[severity];
  return (
    <Chip size="small" label={s.label}
      sx={{ height: 18, fontSize: 10, fontWeight: 700, bgcolor: s.bg, color: s.color, borderRadius: '3px', '& .MuiChip-label': { px: '6px' } }} />
  );
}

function StatusChip({ status }: { status: IssueStatus }) {
  const s = statusConfig[status];
  return (
    <Chip size="small" label={s.label}
      sx={{ height: 18, fontSize: 10, fontWeight: 600, bgcolor: s.bg, color: s.color, borderRadius: '3px', '& .MuiChip-label': { px: '6px' } }} />
  );
}

// ─── Issue Detail Drawer ──────────────────────────────────────────────────────

function IssueDetail({ issue, open, onClose }: { issue: Issue | null; open: boolean; onClose: () => void }) {
  const [tab, setTab] = useState(0);
  const [status, setStatus] = useState<IssueStatus>(issue?.status ?? 'new');
  const issueActions = MOCK_ACTIONS.filter(a => a.issueId === issue?.id);

  if (!issue) return null;
  const sv = severityConfig[issue.severity];

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: 680,
          bgcolor: '#fff',
          borderLeft: '1px solid #E7E9EE',
          display: 'flex',
          flexDirection: 'column',
        }
      }}
    >
      {/* Header */}
      <Box sx={{ px: '24px', py: '16px', borderBottom: '1px solid #E7E9EE', flexShrink: 0 }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: '12px', mb: '10px' }}>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography sx={{ fontSize: 16, fontWeight: 700, color: text.primary, letterSpacing: '-0.01em', lineHeight: 1.3, mb: '6px' }}>
              {issue.title}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <SevChip severity={issue.severity} />
              <FormControl size="small" sx={{ minWidth: 140 }}>
                <Select
                  value={status}
                  onChange={e => { setStatus(e.target.value as IssueStatus); toast.success('Status updated'); }}
                  sx={{ fontSize: 12, height: 26, '& .MuiSelect-select': { py: '3px', px: '8px' }, '& fieldset': { border: '1px solid #E7E9EE' } }}
                >
                  {STATUS_OPTIONS.map(s => (
                    <MenuItem key={s} value={s} sx={{ fontSize: 12 }}>{statusConfig[s].label}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              <Typography sx={{ fontSize: 11, color: text.tertiary }}>Owner: <strong style={{ color: text.secondary }}>{issue.owner}</strong></Typography>
              <Typography sx={{ fontSize: 11, color: text.tertiary }}>Detected: {issue.detectedDate}</Typography>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
            <Tooltip title="Watch">
              <IconButton size="small" onClick={() => toast.success('Watching this issue')} sx={{ color: text.tertiary, border: '1px solid #E7E9EE', borderRadius: '6px' }}>
                <WatchIcon sx={{ fontSize: 15 }} />
              </IconButton>
            </Tooltip>
            <Tooltip title="Assign">
              <IconButton size="small" onClick={() => toast.info('Assign dialog')} sx={{ color: text.tertiary, border: '1px solid #E7E9EE', borderRadius: '6px' }}>
                <AssignIcon sx={{ fontSize: 15 }} />
              </IconButton>
            </Tooltip>
            <Button size="small" variant="contained"
              onClick={() => { setStatus('verified'); toast.success('Issue marked as verified'); }}
              sx={{ fontSize: 11, height: 28, px: '12px', bgcolor: color.functional.primary, '&:hover': { bgcolor: color.functional.primaryHover }, textTransform: 'none', fontWeight: 600 }}>
              Mark resolved
            </Button>
            <IconButton size="small" onClick={onClose} sx={{ color: text.tertiary }}>
              <CloseIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Box>
        </Box>

        {/* Key facts strip */}
        <Box sx={{ display: 'flex', gap: '20px', p: '10px', bgcolor: '#F8F9FC', borderRadius: '6px', border: '1px solid #E7E9EE' }}>
          {[
            { label: 'Est. risk', value: issue.riskLabel, color: color.functional.error },
            { label: 'Reviews', value: issue.evidenceReviews.toString(), color: color.functional.primary },
            { label: 'Tickets', value: issue.evidenceTickets.toString(), color: color.functional.primary },
            { label: 'Users affected', value: issue.evidenceUsers > 0 ? `~${issue.evidenceUsers.toLocaleString()}` : 'Unknown', color: text.primary },
            { label: 'Age', value: issue.ageLabel, color: text.secondary },
          ].map(kf => (
            <Box key={kf.label}>
              <Typography sx={{ fontSize: 10, color: text.tertiary, mb: '2px' }}>{kf.label}</Typography>
              <Typography sx={{ fontSize: 13, fontWeight: 700, color: kf.color }}>{kf.value}</Typography>
            </Box>
          ))}
        </Box>
      </Box>

      {/* Tabs */}
      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ px: '16px', borderBottom: '1px solid #E7E9EE', flexShrink: 0, minHeight: 36, '& .MuiTab-root': { fontSize: 12, textTransform: 'none', minHeight: 36, fontWeight: 500, py: 0 }, '& .Mui-selected': { fontWeight: 700 } }}>
        <Tab label="Overview" />
        <Tab label="Evidence" />
        <Tab label={`Actions (${issueActions.length})`} />
        <Tab label="Timeline" />
        <Tab label="Impact" />
      </Tabs>

      {/* Tab content */}
      <Box sx={{ flex: 1, overflow: 'auto', '&::-webkit-scrollbar': { width: 4 } }}>

        {/* Overview tab */}
        {tab === 0 && (
          <Box sx={{ p: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>

            {/* Executive brief */}
            <Box>
              <Typography sx={{ fontSize: 10, fontWeight: 700, color: text.tertiary, textTransform: 'uppercase', letterSpacing: '0.07em', mb: '6px' }}>Executive brief</Typography>
              <Typography sx={{ fontSize: 13, color: text.secondary, lineHeight: 1.6 }}>{issue.summary}</Typography>
            </Box>

            <Divider sx={{ borderColor: '#E7E9EE' }} />

            {/* Root-cause hypothesis */}
            <Box>
              <Typography sx={{ fontSize: 10, fontWeight: 700, color: text.tertiary, textTransform: 'uppercase', letterSpacing: '0.07em', mb: '6px' }}>Root-cause hypothesis</Typography>
              <Box sx={{ p: '12px', bgcolor: alpha(color.functional.warning, 0.05), border: `1px solid ${alpha(color.functional.warning, 0.2)}`, borderRadius: '6px', borderLeft: `3px solid ${color.functional.warning}` }}>
                <Typography sx={{ fontSize: 13, color: text.secondary, lineHeight: 1.6 }}>{issue.rootCause}</Typography>
                <Typography sx={{ fontSize: 10, color: text.tertiary, mt: '6px', fontStyle: 'italic' }}>
                  Hypothesis — not yet verified by engineering. Based on review and ticket text analysis.
                </Typography>
              </Box>
            </Box>

            {/* Trend chart */}
            <Box>
              <Typography sx={{ fontSize: 10, fontWeight: 700, color: text.tertiary, textTransform: 'uppercase', letterSpacing: '0.07em', mb: '8px' }}>Evidence trend</Typography>
              <Box sx={{ border: '1px solid #E7E9EE', borderRadius: '6px', p: '12px' }}>
                <ResponsiveContainer width="100%" height={120}>
                  <AreaChart data={trendData} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
                    <CartesianGrid vertical={false} stroke="rgba(0,0,0,0.04)" />
                    <XAxis dataKey="d" tick={{ fontSize: 10, fill: '#9CA3AF' }} tickLine={false} axisLine={false} />
                    <YAxis tick={{ fontSize: 10, fill: '#9CA3AF' }} tickLine={false} axisLine={false} />
                    <RTooltip contentStyle={ttStyle} />
                    <Area type="monotone" dataKey="v" stroke={sv.color} fill={alpha(sv.color, 0.1)} strokeWidth={2} dot={false} name="Evidence count" />
                  </AreaChart>
                </ResponsiveContainer>
                <Typography sx={{ fontSize: 10, color: text.tertiary, mt: '4px', textAlign: 'right' }}>
                  {issue.trend} in {issue.trendWindow}
                </Typography>
              </Box>
            </Box>

            {/* Scope */}
            <Box>
              <Typography sx={{ fontSize: 10, fontWeight: 700, color: text.tertiary, textTransform: 'uppercase', letterSpacing: '0.07em', mb: '6px' }}>Affected scope</Typography>
              <Box sx={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {[issue.scope, issue.product].map(s => (
                  <Chip key={s} label={s} size="small" variant="outlined"
                    sx={{ fontSize: 11, height: 22, borderColor: '#E7E9EE', color: text.secondary }} />
                ))}
              </Box>
            </Box>

            {/* Recommended action */}
            <Box>
              <Typography sx={{ fontSize: 10, fontWeight: 700, color: text.tertiary, textTransform: 'uppercase', letterSpacing: '0.07em', mb: '6px' }}>Recommended next action</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: '10px', p: '12px', bgcolor: alpha(color.functional.primary, 0.04), border: `1px solid ${alpha(color.functional.primary, 0.15)}`, borderRadius: '6px' }}>
                <Typography sx={{ fontSize: 13, fontWeight: 600, color: text.primary, flex: 1 }}>{issue.nextAction}</Typography>
                <Button size="small" variant="contained" onClick={() => { toast.success('Action created'); }}
                  sx={{ fontSize: 11, height: 26, px: '12px', bgcolor: color.functional.primary, '&:hover': { bgcolor: color.functional.primaryHover }, textTransform: 'none', fontWeight: 600, flexShrink: 0 }}>
                  Create action
                </Button>
              </Box>
            </Box>

          </Box>
        )}

        {/* Evidence tab */}
        {tab === 1 && (
          <Box sx={{ p: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <Typography sx={{ fontSize: 11, color: text.tertiary }}>
              {issue.evidenceReviews} reviews · {issue.evidenceTickets} tickets · showing most recent
            </Typography>
            {[
              { type: 'Review', source: 'Google Play', text: `"App keeps logging me out every time I open it after the latest update. This is really frustrating — 1 star until fixed."`, author: 'User #4821', rating: '1★', date: 'Jun 14' },
              { type: 'Review', source: 'App Store', text: `"Can't log in on my Android phone. Works on iOS. Please fix — I use this daily for work."`, author: 'User #3102', rating: '1★', date: 'Jun 13' },
              { type: 'Ticket', source: 'Support', text: `"Since updating to v5.1.0 yesterday, I'm getting 'Authentication failed' errors on Android 13. My colleague on iOS is fine."`, author: 'Enterprise customer #0084', rating: '', date: 'Jun 12' },
              { type: 'Review', source: 'G2', text: `"Unreliable login on mobile. Works fine on desktop. The Android version has been broken since their last update."`, author: 'Verified buyer', rating: '2★', date: 'Jun 12' },
              { type: 'Ticket', source: 'Support', text: `"My whole team's Android devices are failing to authenticate. Can this be escalated?"`, author: 'Enterprise customer #0091', rating: '', date: 'Jun 11' },
            ].map((ev, i) => (
              <Box key={i} sx={{ p: '14px', border: '1px solid #E7E9EE', borderRadius: '6px', bgcolor: '#fff' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px', mb: '6px' }}>
                  <Chip size="small" label={ev.type} sx={{ height: 16, fontSize: 9, fontWeight: 700, bgcolor: ev.type === 'Review' ? alpha(color.functional.primary, 0.08) : alpha(color.functional.warning, 0.08), color: ev.type === 'Review' ? color.functional.primary : color.functional.warning, '& .MuiChip-label': { px: '5px' } }} />
                  <Typography sx={{ fontSize: 11, fontWeight: 600, color: text.secondary }}>{ev.source}</Typography>
                  {ev.rating && <Typography sx={{ fontSize: 11, color: color.functional.error, fontWeight: 700 }}>{ev.rating}</Typography>}
                  <Typography sx={{ fontSize: 11, color: text.tertiary, ml: 'auto' }}>{ev.date}</Typography>
                </Box>
                <Typography sx={{ fontSize: 12, color: text.secondary, lineHeight: 1.6, mb: '4px' }}>{ev.text}</Typography>
                <Typography sx={{ fontSize: 11, color: text.tertiary }}>{ev.author}</Typography>
              </Box>
            ))}
          </Box>
        )}

        {/* Actions tab */}
        {tab === 2 && (
          <Box sx={{ p: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography sx={{ fontSize: 12, color: text.tertiary }}>{issueActions.length} actions linked to this issue</Typography>
              <Button size="small" startIcon={<AddIcon sx={{ fontSize: 13 }} />}
                onClick={() => toast.info('New action dialog')}
                sx={{ fontSize: 11, color: color.functional.primary, border: `1px solid ${alpha(color.functional.primary, 0.3)}`, px: '10px', height: 26, textTransform: 'none' }}>
                Add action
              </Button>
            </Box>
            {issueActions.length === 0 && (
              <Box sx={{ py: '40px', textAlign: 'center' }}>
                <Typography sx={{ fontSize: 13, color: text.tertiary }}>No actions created yet</Typography>
                <Button size="small" sx={{ mt: '8px', fontSize: 12, color: color.functional.primary }} onClick={() => toast.info('New action dialog')}>
                  Create first action
                </Button>
              </Box>
            )}
            {issueActions.map(action => {
              const as = actionStatusConfig[action.status];
              return (
                <Box key={action.id} sx={{ p: '14px', border: '1px solid #E7E9EE', borderRadius: '6px', bgcolor: '#fff' }}>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px', mb: '4px' }}>
                        <Typography sx={{ fontSize: 13, fontWeight: 600, color: text.primary }}>{action.title}</Typography>
                        <Chip size="small" label={as.label} sx={{ height: 16, fontSize: 10, fontWeight: 600, bgcolor: as.bg, color: as.color, borderRadius: '3px', '& .MuiChip-label': { px: '5px' } }} />
                      </Box>
                      <Typography sx={{ fontSize: 11, color: text.tertiary, mb: '6px' }}>
                        Owner: {action.owner} · Due: {action.due}
                      </Typography>
                      <Typography sx={{ fontSize: 12, color: text.secondary }}>
                        <strong>Expected outcome:</strong> {action.outcome}
                      </Typography>
                      <Typography sx={{ fontSize: 11, color: text.tertiary, mt: '2px' }}>
                        Verification: {action.verification}
                      </Typography>
                    </Box>
                    <Button size="small" startIcon={<JiraIcon sx={{ fontSize: 12 }} />}
                      onClick={() => toast.info('Jira issue opening…')}
                      sx={{ fontSize: 10, color: text.secondary, border: '1px solid #E7E9EE', px: '8px', height: 24, textTransform: 'none', flexShrink: 0 }}>
                      Jira
                    </Button>
                  </Box>
                </Box>
              );
            })}
          </Box>
        )}

        {/* Timeline tab */}
        {tab === 3 && (
          <Box sx={{ p: '20px' }}>
            <Box sx={{ position: 'relative', pl: '24px' }}>
              {/* vertical line */}
              <Box sx={{ position: 'absolute', left: '7px', top: '6px', bottom: '6px', width: 1, bgcolor: '#E7E9EE' }} />
              {TIMELINE_EVENTS.map((ev, i) => (
                <Box key={i} sx={{ display: 'flex', alignItems: 'flex-start', gap: '12px', mb: '16px', position: 'relative' }}>
                  <Box sx={{ position: 'absolute', left: '-24px', top: '1px', bgcolor: '#fff', zIndex: 1 }}>
                    {ev.done
                      ? <CheckIcon sx={{ fontSize: 16, color: color.functional.success }} />
                      : <EmptyCircle sx={{ fontSize: 16, color: '#D1D5DB' }} />}
                  </Box>
                  <Box>
                    <Typography sx={{ fontSize: 13, fontWeight: ev.done ? 600 : 400, color: ev.done ? text.primary : text.tertiary }}>
                      {ev.label}
                    </Typography>
                    <Typography sx={{ fontSize: 11, color: text.tertiary }}>{ev.date}</Typography>
                  </Box>
                </Box>
              ))}
            </Box>
          </Box>
        )}

        {/* Impact tab */}
        {tab === 4 && (
          <Box sx={{ p: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <Box sx={{ p: '14px', border: '1px solid #E7E9EE', borderRadius: '6px', bgcolor: '#F8F9FC' }}>
              <Typography sx={{ fontSize: 12, color: text.tertiary, mb: '8px' }}>
                Impact data will populate after the corrective action is completed and a monitoring period of 7+ days has elapsed.
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {[
                  { metric: 'Before-and-after issue frequency', status: 'Pending — action not yet completed' },
                  { metric: 'Rating / sentiment change', status: 'Pending' },
                  { metric: 'Repeat complaint reduction', status: 'Pending' },
                  { metric: 'Estimated financial impact', status: `Potential upside: ${issue.riskLabel}` },
                  { metric: 'Monitoring period', status: '7 days post-fix' },
                ].map(row => (
                  <Box key={row.metric} sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Typography sx={{ fontSize: 12, color: text.secondary, flex: 1 }}>{row.metric}</Typography>
                    <Typography sx={{ fontSize: 12, color: text.tertiary, fontStyle: 'italic' }}>{row.status}</Typography>
                  </Box>
                ))}
              </Box>
            </Box>
          </Box>
        )}

      </Box>
    </Drawer>
  );
}

// ─── Issue list row ───────────────────────────────────────────────────────────

function IssueRow({ issue, onClick }: { issue: Issue; onClick: () => void }) {
  const sv = severityConfig[issue.severity];
  const st = statusConfig[issue.status];

  return (
    <Box
      onClick={onClick}
      sx={{
        display: 'flex', alignItems: 'center', gap: '0',
        borderBottom: '1px solid #F3F4F6',
        cursor: 'pointer',
        '&:hover': { bgcolor: 'rgba(0,0,0,0.015)' },
        transition: 'background 0.08s',
      }}
    >
      {/* Severity bar */}
      <Box sx={{ width: 3, alignSelf: 'stretch', bgcolor: sv.color, flexShrink: 0 }} />

      <Box sx={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, px: '16px', py: '10px', minWidth: 0 }}>
        {/* Issue title + severity */}
        <Box sx={{ flex: 2.5, minWidth: 0 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: '7px', mb: '2px' }}>
            <Typography sx={{ fontSize: 13, fontWeight: 600, color: text.primary, lineHeight: 1.3 }} noWrap>
              {issue.title}
            </Typography>
          </Box>
          <Typography sx={{ fontSize: 11, color: text.tertiary }}>
            {issue.scope} · {issue.ageLabel} old · {issue.owner}
          </Typography>
        </Box>

        {/* Severity chip */}
        <Box sx={{ flex: 0.6, display: 'flex', justifyContent: 'center' }}>
          <Chip size="small" label={sv.label}
            sx={{ height: 18, fontSize: 10, fontWeight: 700, bgcolor: sv.bg, color: sv.color, borderRadius: '3px', '& .MuiChip-label': { px: '6px' } }} />
        </Box>

        {/* Risk */}
        <Box sx={{ flex: 0.9, textAlign: 'right' }}>
          <Typography sx={{ fontSize: 12, fontWeight: 700, color: color.functional.error }}>
            ${(issue.riskAmount / 1000).toFixed(0)}K
          </Typography>
          <Typography sx={{ fontSize: 10, color: text.tertiary }}>est. risk</Typography>
        </Box>

        {/* Evidence */}
        <Box sx={{ flex: 0.8 }}>
          <Typography sx={{ fontSize: 12, color: color.functional.primary, fontWeight: 600 }}>
            {issue.evidenceReviews} reviews
          </Typography>
          <Typography sx={{ fontSize: 10, color: text.tertiary }}>{issue.evidenceTickets} tickets</Typography>
        </Box>

        {/* Trend */}
        <Box sx={{ flex: 0.55, display: 'flex', alignItems: 'center', gap: '4px' }}>
          {issue.trendDir === 'up'
            ? <UpIcon sx={{ fontSize: 12, color: ['critical', 'high'].includes(issue.severity) ? color.functional.error : color.functional.success }} />
            : <DownIcon sx={{ fontSize: 12, color: color.functional.success }} />}
          <Typography sx={{ fontSize: 12, fontWeight: 600, color: ['critical', 'high'].includes(issue.severity) && issue.trendDir === 'up' ? color.functional.error : color.functional.success }}>
            {issue.trend}
          </Typography>
        </Box>

        {/* Status */}
        <Box sx={{ flex: 0.9, display: 'flex', justifyContent: 'flex-end' }}>
          <Chip size="small" label={st.label}
            sx={{ height: 18, fontSize: 10, fontWeight: 600, bgcolor: st.bg, color: st.color, borderRadius: '3px', '& .MuiChip-label': { px: '6px' } }} />
        </Box>
      </Box>
    </Box>
  );
}

// ─── Main view ────────────────────────────────────────────────────────────────

export const IssuesView = () => {
  const [filterSeverity, setFilterSeverity] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const filtered = MOCK_ISSUES.filter(issue => {
    if (filterSeverity !== 'all' && issue.severity !== filterSeverity) return false;
    if (filterStatus !== 'all' && issue.status !== filterStatus) return false;
    return true;
  });

  const openDetail = (issue: Issue) => {
    setSelectedIssue(issue);
    setDetailOpen(true);
  };

  const criticalCount = MOCK_ISSUES.filter(i => i.severity === 'critical').length;
  const actionRequiredCount = MOCK_ISSUES.filter(i => i.status === 'action_required').length;

  return (
    <Box sx={{ flex: 1, height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden', bgcolor: '#fff' }}>

      {/* Header */}
      <Box sx={{ px: '20px', py: '12px', borderBottom: '1px solid #E7E9EE', display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
        <Box sx={{ flex: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Typography sx={{ fontSize: 14, fontWeight: 700, color: text.primary, letterSpacing: '-0.01em' }}>
              Issues
            </Typography>
            {criticalCount > 0 && (
              <Chip size="small" label={`${criticalCount} critical`}
                sx={{ height: 18, fontSize: 10, fontWeight: 700, bgcolor: 'rgba(229,72,77,0.08)', color: '#E5484D', borderRadius: '3px' }} />
            )}
            {actionRequiredCount > 0 && (
              <Chip size="small" label={`${actionRequiredCount} action required`}
                sx={{ height: 18, fontSize: 10, fontWeight: 700, bgcolor: 'rgba(229,72,77,0.06)', color: '#E5484D', borderRadius: '3px' }} />
            )}
          </Box>
          <Typography sx={{ fontSize: 11, color: text.tertiary }}>
            {MOCK_ISSUES.length} issues · {filtered.length} shown · consolidated from reviews, tickets and signals
          </Typography>
        </Box>
        <Button size="small" startIcon={<AddIcon sx={{ fontSize: 14 }} />}
          onClick={() => toast.info('Create issue dialog opening…')}
          sx={{ fontSize: 12, height: 30, px: '12px', color: color.functional.primary, border: `1px solid ${alpha(color.functional.primary, 0.3)}`, bgcolor: alpha(color.functional.primary, 0.04), textTransform: 'none' }}>
          Create issue
        </Button>
      </Box>

      {/* Filters */}
      <Box sx={{ px: '20px', py: '8px', borderBottom: '1px solid #E7E9EE', display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0, bgcolor: '#F8F9FC' }}>
        <FilterIcon sx={{ fontSize: 14, color: text.tertiary }} />
        <FormControl size="small" sx={{ minWidth: 110 }}>
          <Select value={filterSeverity} onChange={e => setFilterSeverity(e.target.value)}
            displayEmpty
            sx={{ fontSize: 12, height: 28, '& .MuiSelect-select': { py: '4px' }, '& fieldset': { border: '1px solid #E7E9EE' } }}>
            <MenuItem value="all" sx={{ fontSize: 12 }}>All severity</MenuItem>
            <MenuItem value="critical" sx={{ fontSize: 12 }}>Critical</MenuItem>
            <MenuItem value="high" sx={{ fontSize: 12 }}>High</MenuItem>
            <MenuItem value="medium" sx={{ fontSize: 12 }}>Medium</MenuItem>
            <MenuItem value="low" sx={{ fontSize: 12 }}>Low</MenuItem>
          </Select>
        </FormControl>
        <FormControl size="small" sx={{ minWidth: 130 }}>
          <Select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
            displayEmpty
            sx={{ fontSize: 12, height: 28, '& .MuiSelect-select': { py: '4px' }, '& fieldset': { border: '1px solid #E7E9EE' } }}>
            <MenuItem value="all" sx={{ fontSize: 12 }}>All status</MenuItem>
            {STATUS_OPTIONS.map(s => (
              <MenuItem key={s} value={s} sx={{ fontSize: 12 }}>{statusConfig[s].label}</MenuItem>
            ))}
          </Select>
        </FormControl>
        <Box sx={{ flex: 1 }} />
        <Typography sx={{ fontSize: 11, color: text.tertiary }}>Ranked by estimated risk</Typography>
      </Box>

      {/* Table header */}
      <Box sx={{ display: 'flex', px: '16px', py: '6px', bgcolor: '#F8F9FC', borderBottom: '1px solid #E7E9EE', flexShrink: 0, ml: '3px' }}>
        {[
          { label: 'Issue', flex: 2.5 },
          { label: 'Severity', flex: 0.6, center: true },
          { label: 'Est. risk', flex: 0.9, right: true },
          { label: 'Evidence', flex: 0.8 },
          { label: 'Trend', flex: 0.55 },
          { label: 'Status', flex: 0.9, right: true },
        ].map(col => (
          <Typography key={col.label} sx={{
            flex: col.flex, fontSize: 10, fontWeight: 700, color: text.tertiary,
            textTransform: 'uppercase', letterSpacing: '0.07em',
            textAlign: col.right ? 'right' : col.center ? 'center' : 'left',
          }}>
            {col.label}
          </Typography>
        ))}
      </Box>

      {/* Issue rows */}
      <Box sx={{ flex: 1, overflow: 'auto', '&::-webkit-scrollbar': { width: 4 } }}>
        {filtered.map(issue => (
          <IssueRow key={issue.id} issue={issue} onClick={() => openDetail(issue)} />
        ))}
        {filtered.length === 0 && (
          <Box sx={{ py: '60px', textAlign: 'center' }}>
            <Typography sx={{ fontSize: 13, color: text.tertiary }}>No issues match the current filters</Typography>
          </Box>
        )}
      </Box>

      {/* Issue detail drawer */}
      <IssueDetail
        issue={selectedIssue}
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
      />
    </Box>
  );
};
