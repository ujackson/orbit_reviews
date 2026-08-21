import { useState } from 'react';
import {
  Box, Typography, Divider, alpha, Button, Chip,
  TextField, InputAdornment, IconButton, Tooltip,
  Select, FormControl, InputLabel, MenuItem, Avatar,
} from '@mui/material';
import {
  Search as SearchIcon, FilterList as FilterIcon,
  ArrowUpward, ArrowDownward, Close as CloseIcon,
  OpenInNew as JiraIcon, PersonAdd as AssignIcon,
  AccessTime as TimeIcon,
} from '@mui/icons-material';
import { color, text, radius } from '../../shared/tokens/design-tokens';
import { toast } from 'sonner';

type Severity = 'critical' | 'high' | 'medium' | 'low';
type InsightStatus = 'new' | 'investigating' | 'resolved' | 'dismissed';

interface Insight {
  id: string;
  title: string;
  severity: Severity;
  change: string;
  changeDir: 'up' | 'down';
  isNegativeChange: boolean;
  evidence: number;
  evidenceUnit: string;
  scope: string;
  firstDetected: string;
  lastUpdated: string;
  status: InsightStatus;
  owner?: string;
  detail: {
    summary: string;
    keyFacts: { label: string; value: string }[];
    primaryDriver: string;
  };
}

const INSIGHTS: Insight[] = [
  {
    id: 'i1', title: 'Authentication failures after Android v5.1.0',
    severity: 'critical', change: '+34%', changeDir: 'up', isNegativeChange: true,
    evidence: 89, evidenceUnit: 'reviews', scope: 'Android · v5.1.0',
    firstDetected: 'Jun 11', lastUpdated: '4 min ago', status: 'investigating', owner: 'Mobile Platform',
    detail: {
      summary: '1-star review volume increased sharply following the v5.1.0 Android release on Jun 10.',
      keyFacts: [
        { label: '1-star volume',   value: '+34%' },
        { label: 'Matching reviews', value: '89' },
        { label: 'Android share',   value: '92%' },
        { label: 'Affected markets', value: '4' },
      ],
      primaryDriver: 'Authentication failures after application update — OAuth token refresh regression identified by engineering.',
    },
  },
  {
    id: 'i2', title: 'Checkout complaints rising in Texas region',
    severity: 'high', change: '+61%', changeDir: 'up', isNegativeChange: true,
    evidence: 41, evidenceUnit: 'reviews', scope: 'Texas · Checkout',
    firstDetected: 'Jun 8', lastUpdated: '2h ago', status: 'investigating', owner: 'Support Ops',
    detail: {
      summary: 'Payment failure mentions surged in Texas following a regional gateway incident.',
      keyFacts: [
        { label: 'Volume increase',  value: '+61%' },
        { label: 'Matching reviews', value: '41' },
        { label: 'Region',           value: 'Texas only' },
        { label: 'Gateway status',   value: 'Partially restored' },
      ],
      primaryDriver: 'Regional payment gateway intermittent failures affecting checkout flow for Texas customers.',
    },
  },
  {
    id: 'i3', title: 'Support wait time mentioned 312 times this month',
    severity: 'high', change: '+22%', changeDir: 'up', isNegativeChange: true,
    evidence: 312, evidenceUnit: 'reviews', scope: 'Enterprise tier · All sources',
    firstDetected: 'Jun 1', lastUpdated: '1d ago', status: 'new',
    detail: {
      summary: 'Support wait time is the most-cited pain point in 1 and 2-star reviews this month.',
      keyFacts: [
        { label: 'Mentions',       value: '312' },
        { label: 'Avg cited wait', value: '3.8 days' },
        { label: 'Star correlation', value: '1–2 star, 2.4× more likely' },
        { label: 'Segment',        value: 'Enterprise' },
      ],
      primaryDriver: 'Enterprise SLA response times not meeting customer expectations. Support team capacity under-resourced.',
    },
  },
  {
    id: 'i4', title: 'Competitor comparisons mentioning dark mode gap',
    severity: 'medium', change: '+218%', changeDir: 'up', isNegativeChange: true,
    evidence: 44, evidenceUnit: 'mentions', scope: 'G2 · Capterra',
    firstDetected: 'Jun 3', lastUpdated: '6h ago', status: 'new',
    detail: {
      summary: 'Dark mode is increasingly cited in competitor comparison reviews.',
      keyFacts: [
        { label: 'Mentions',   value: '44' },
        { label: 'Growth',     value: '+218%' },
        { label: 'Context',    value: 'Competitor comparison' },
        { label: 'Competitor', value: 'Intercom, Zendesk' },
      ],
      primaryDriver: 'Intercom and Zendesk both shipped dark mode in Q1. Orbit is the only major platform without it.',
    },
  },
  {
    id: 'i5', title: 'Shipping damage reports declining after carrier change',
    severity: 'low', change: '−18%', changeDir: 'down', isNegativeChange: false,
    evidence: 31, evidenceUnit: 'reviews', scope: 'All regions',
    firstDetected: 'May 28', lastUpdated: '3d ago', status: 'resolved',
    detail: {
      summary: 'Shipping damage complaints have declined 18% following the carrier switch in late May.',
      keyFacts: [
        { label: 'Decline',    value: '−18%' },
        { label: 'Reviews',    value: '31' },
        { label: 'Change',     value: 'Carrier switch May 28' },
        { label: 'Trajectory', value: 'Continuing to decline' },
      ],
      primaryDriver: 'New carrier with improved packaging standards. Damage rate declining week-over-week.',
    },
  },
];

const severityConfig: Record<Severity, { label: string; color: string; bg: string; dot: string }> = {
  critical: { label: 'Critical', color: color.functional.error,   bg: alpha(color.functional.error, 0.08),   dot: color.functional.error },
  high:     { label: 'High',     color: color.functional.warning, bg: alpha(color.functional.warning, 0.08), dot: color.functional.warning },
  medium:   { label: 'Medium',   color: color.functional.info,    bg: alpha(color.functional.info, 0.08),    dot: color.functional.info },
  low:      { label: 'Low',      color: text.tertiary,             bg: 'rgba(0,0,0,0.05)',                    dot: color.neutral[400] },
};

const statusConfig: Record<InsightStatus, { label: string; color: string; bg: string }> = {
  new:          { label: 'New',           color: color.functional.primary, bg: alpha(color.functional.primary, 0.08) },
  investigating:{ label: 'Investigating', color: color.functional.warning, bg: alpha(color.functional.warning, 0.08) },
  resolved:     { label: 'Resolved',      color: color.functional.success, bg: alpha(color.functional.success, 0.08) },
  dismissed:    { label: 'Dismissed',     color: text.tertiary,             bg: 'rgba(0,0,0,0.05)' },
};

function InsightDetail({ insight, onClose }: { insight: Insight; onClose: () => void }) {
  const sc = severityConfig[insight.severity];
  const st = statusConfig[insight.status];

  return (
    <Box sx={{ width: 380, flexShrink: 0, bgcolor: '#fff', borderLeft: '1px solid rgba(0,0,0,0.08)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <Box sx={{ px: '18px', py: '12px', borderBottom: '1px solid rgba(0,0,0,0.07)', display: 'flex', alignItems: 'flex-start', gap: '8px', flexShrink: 0 }}>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: '6px', mb: '4px' }}>
            <Chip size="small" label={sc.label}
              sx={{ height: 16, fontSize: 10, fontWeight: 600, bgcolor: sc.bg, color: sc.color, '& .MuiChip-label': { px: '6px' } }} />
            <Chip size="small" label={st.label}
              sx={{ height: 16, fontSize: 10, fontWeight: 600, bgcolor: st.bg, color: st.color, '& .MuiChip-label': { px: '6px' } }} />
          </Box>
          <Typography sx={{ fontSize: 13, fontWeight: 600, color: text.primary, lineHeight: 1.35 }}>
            {insight.title}
          </Typography>
          <Typography sx={{ fontSize: 11, color: text.tertiary, mt: '3px' }}>
            First detected {insight.firstDetected} · Updated {insight.lastUpdated}
          </Typography>
        </Box>
        <IconButton size="small" onClick={onClose} sx={{ color: text.tertiary, mt: '-2px' }}>
          <CloseIcon sx={{ fontSize: 16 }} />
        </IconButton>
      </Box>

      <Box sx={{ flex: 1, overflow: 'auto', p: '16px 18px', display: 'flex', flexDirection: 'column', gap: '16px', '&::-webkit-scrollbar': { width: 3 } }}>

        {/* Key facts */}
        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
          {insight.detail.keyFacts.map(f => (
            <Box key={f.label} sx={{ px: '12px', py: '10px', bgcolor: 'rgba(0,0,0,0.03)', borderRadius: '7px' }}>
              <Typography sx={{ fontSize: 18, fontWeight: 600, color: text.primary, letterSpacing: '-0.02em', lineHeight: 1 }}>{f.value}</Typography>
              <Typography sx={{ fontSize: 10, color: text.tertiary, mt: '3px' }}>{f.label}</Typography>
            </Box>
          ))}
        </Box>

        <Divider />

        {/* Summary */}
        <Box>
          <Typography sx={{ fontSize: 10, fontWeight: 600, color: text.tertiary, textTransform: 'uppercase', letterSpacing: '0.07em', mb: '6px' }}>Summary</Typography>
          <Typography sx={{ fontSize: 12, color: text.secondary, lineHeight: 1.65 }}>{insight.detail.summary}</Typography>
        </Box>

        <Box>
          <Typography sx={{ fontSize: 10, fontWeight: 600, color: text.tertiary, textTransform: 'uppercase', letterSpacing: '0.07em', mb: '6px' }}>Primary driver</Typography>
          <Typography sx={{ fontSize: 12, color: text.secondary, lineHeight: 1.65 }}>{insight.detail.primaryDriver}</Typography>
        </Box>

        <Divider />

        {/* Evidence */}
        <Box sx={{ px: '12px', py: '10px', bgcolor: 'rgba(0,0,0,0.02)', borderRadius: '7px', border: '1px solid rgba(0,0,0,0.07)' }}>
          <Typography sx={{ fontSize: 12, fontWeight: 600, color: text.primary }}>
            {insight.evidence.toLocaleString()} {insight.evidenceUnit}
          </Typography>
          <Typography sx={{ fontSize: 11, color: text.tertiary }}>
            Scope: {insight.scope}
          </Typography>
        </Box>

        {/* Actions */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <Button size="small" variant="contained" fullWidth startIcon={<JiraIcon sx={{ fontSize: 14 }} />}
            onClick={() => toast.success('Jira issue created')}
            sx={{ fontSize: 12, height: 32, bgcolor: '#0052CC', '&:hover': { bgcolor: '#0043A8' } }}>
            Create Jira issue
          </Button>
          <Box sx={{ display: 'flex', gap: '6px' }}>
            <Button size="small" variant="outlined" fullWidth startIcon={<AssignIcon sx={{ fontSize: 13 }} />}
              onClick={() => toast.success('Assign dialog opening…')}
              sx={{ fontSize: 11, height: 28, borderColor: 'rgba(0,0,0,0.14)', color: text.secondary }}>
              Assign owner
            </Button>
            <Button size="small" variant="outlined" fullWidth
              onClick={() => toast.success('Added to watchlist')}
              sx={{ fontSize: 11, height: 28, borderColor: 'rgba(0,0,0,0.14)', color: text.secondary }}>
              Watch signal
            </Button>
          </Box>
        </Box>

        {/* Activity */}
        <Divider />
        <Box>
          <Typography sx={{ fontSize: 10, fontWeight: 600, color: text.tertiary, textTransform: 'uppercase', letterSpacing: '0.07em', mb: '8px' }}>Activity</Typography>
          {[
            { label: 'Detected', time: insight.firstDetected },
            { label: 'Pattern confirmed', time: `${insight.firstDetected}, +2h` },
            ...(insight.owner ? [{ label: `Assigned to ${insight.owner}`, time: 'Jun 12' }] : []),
          ].map((a, i) => (
            <Box key={i} sx={{ display: 'flex', gap: '10px', mb: '8px' }}>
              <Box sx={{ width: 5, height: 5, borderRadius: '50%', bgcolor: 'rgba(0,0,0,0.2)', mt: '5px', flexShrink: 0 }} />
              <Box>
                <Typography sx={{ fontSize: 12, color: text.secondary }}>{a.label}</Typography>
                <Typography sx={{ fontSize: 10, color: text.tertiary }}>{a.time}</Typography>
              </Box>
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  );
}

export const InsightsView = () => {
  const [search, setSearch]         = useState('');
  const [severityFilter, setSeverity] = useState('all');
  const [statusFilter, setStatus]   = useState('all');
  const [selected, setSelected]     = useState<Insight | null>(null);

  const filtered = INSIGHTS.filter(ins => {
    if (search && !ins.title.toLowerCase().includes(search.toLowerCase())) return false;
    if (severityFilter !== 'all' && ins.severity !== severityFilter) return false;
    if (statusFilter   !== 'all' && ins.status   !== statusFilter)   return false;
    return true;
  });

  return (
    <Box sx={{ flex: 1, height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden', bgcolor: '#fff' }}>
      {/* Header */}
      <Box sx={{ px: '24px', py: '12px', borderBottom: '1px solid rgba(0,0,0,0.07)', display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0, bgcolor: '#fff' }}>
        <Box sx={{ flex: 1 }}>
          <Typography sx={{ fontSize: 14, fontWeight: 600, color: text.primary, letterSpacing: '-0.01em' }}>Insights</Typography>
          <Typography sx={{ fontSize: 11, color: text.tertiary }}>Detected patterns and conclusions backed by review evidence</Typography>
        </Box>
      </Box>

      {/* Filter bar */}
      <Box sx={{ px: '24px', py: '8px', borderBottom: '1px solid rgba(0,0,0,0.07)', display: 'flex', gap: '8px', alignItems: 'center', flexShrink: 0, bgcolor: '#F8F9FC' }}>
        <TextField size="small" placeholder="Search insights…" value={search} onChange={e => setSearch(e.target.value)}
          InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon sx={{ fontSize: 15, color: text.tertiary }} /></InputAdornment>, sx: { fontSize: 12, bgcolor: '#fff', '& fieldset': { border: '1px solid rgba(0,0,0,0.12)' }, borderRadius: '6px' } }}
          sx={{ width: 260 }}
        />
        <FormControl size="small" sx={{ width: 130 }}>
          <Select value={severityFilter} onChange={e => setSeverity(e.target.value)} displayEmpty
            sx={{ fontSize: 12, bgcolor: '#fff', '& .MuiSelect-select': { py: '6px' } }}>
            <MenuItem value="all" sx={{ fontSize: 12 }}>All severities</MenuItem>
            {['critical', 'high', 'medium', 'low'].map(s => <MenuItem key={s} value={s} sx={{ fontSize: 12, textTransform: 'capitalize' }}>{s}</MenuItem>)}
          </Select>
        </FormControl>
        <FormControl size="small" sx={{ width: 140 }}>
          <Select value={statusFilter} onChange={e => setStatus(e.target.value)} displayEmpty
            sx={{ fontSize: 12, bgcolor: '#fff', '& .MuiSelect-select': { py: '6px' } }}>
            <MenuItem value="all" sx={{ fontSize: 12 }}>All statuses</MenuItem>
            {['new', 'investigating', 'resolved', 'dismissed'].map(s => <MenuItem key={s} value={s} sx={{ fontSize: 12, textTransform: 'capitalize' }}>{s}</MenuItem>)}
          </Select>
        </FormControl>
        <Typography sx={{ fontSize: 11, color: text.tertiary, ml: 'auto' }}>{filtered.length} insights</Typography>
      </Box>

      <Box sx={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* Table */}
        <Box sx={{ flex: 1, overflow: 'auto', '&::-webkit-scrollbar': { width: 5 } }}>
          {/* Column headers */}
          <Box sx={{ display: 'flex', px: '24px', py: '7px', bgcolor: 'rgba(0,0,0,0.025)', borderBottom: '1px solid rgba(0,0,0,0.07)', position: 'sticky', top: 0, zIndex: 5 }}>
            {[
              { l: 'Insight',        w: undefined, flex: 2 },
              { l: 'Severity',       w: 80 },
              { l: 'Change',         w: 70 },
              { l: 'Evidence',       w: 90 },
              { l: 'Scope',          w: 150 },
              { l: 'Detected',       w: 80 },
              { l: 'Status',         w: 110 },
              { l: 'Owner',          w: 120 },
            ].map(col => (
              <Typography key={col.l}
                sx={{ fontSize: 10, fontWeight: 600, color: text.tertiary, textTransform: 'uppercase', letterSpacing: '0.07em', flex: col.flex, width: col.w, flexShrink: col.w ? 0 : undefined }}>
                {col.l}
              </Typography>
            ))}
          </Box>

          {/* Rows */}
          {filtered.map(ins => {
            const sc = severityConfig[ins.severity];
            const st = statusConfig[ins.status];
            const isSelected = selected?.id === ins.id;
            const changeColor = ins.isNegativeChange
              ? (ins.changeDir === 'up' ? color.functional.error : color.functional.success)
              : (ins.changeDir === 'up' ? color.functional.success : color.functional.warning);

            return (
              <Box key={ins.id} onClick={() => setSelected(isSelected ? null : ins)}
                sx={{
                  display: 'flex', alignItems: 'center', px: '24px', py: '11px',
                  borderBottom: '1px solid rgba(0,0,0,0.05)', cursor: 'pointer',
                  bgcolor: isSelected ? alpha(color.functional.primary, 0.04) : '#fff',
                  '&:hover': { bgcolor: isSelected ? alpha(color.functional.primary, 0.06) : 'rgba(0,0,0,0.02)' },
                  transition: 'background 0.08s',
                }}>
                {/* Insight */}
                <Box sx={{ flex: 2, minWidth: 0, pr: '12px' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: '6px', mb: '2px' }}>
                    <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: sc.dot, flexShrink: 0 }} />
                    <Typography sx={{ fontSize: 12, fontWeight: 600, color: text.primary }} noWrap>{ins.title}</Typography>
                  </Box>
                  <Typography sx={{ fontSize: 11, color: text.tertiary }}>Updated {ins.lastUpdated}</Typography>
                </Box>
                {/* Severity */}
                <Box sx={{ width: 80, flexShrink: 0 }}>
                  <Chip size="small" label={sc.label} sx={{ height: 16, fontSize: 10, fontWeight: 600, bgcolor: sc.bg, color: sc.color, '& .MuiChip-label': { px: '5px' } }} />
                </Box>
                {/* Change */}
                <Box sx={{ width: 70, flexShrink: 0, display: 'flex', alignItems: 'center', gap: '2px' }}>
                  {ins.changeDir === 'up' ? <ArrowUpward sx={{ fontSize: 11, color: changeColor }} /> : <ArrowDownward sx={{ fontSize: 11, color: changeColor }} />}
                  <Typography sx={{ fontSize: 12, fontWeight: 600, color: changeColor }}>{ins.change}</Typography>
                </Box>
                {/* Evidence */}
                <Typography sx={{ fontSize: 12, color: text.secondary, width: 90, flexShrink: 0 }}>
                  {ins.evidence.toLocaleString()} {ins.evidenceUnit}
                </Typography>
                {/* Scope */}
                <Typography sx={{ fontSize: 11, color: text.tertiary, width: 150, flexShrink: 0 }} noWrap>{ins.scope}</Typography>
                {/* Detected */}
                <Typography sx={{ fontSize: 11, color: text.tertiary, width: 80, flexShrink: 0 }}>{ins.firstDetected}</Typography>
                {/* Status */}
                <Box sx={{ width: 110, flexShrink: 0 }}>
                  <Chip size="small" label={st.label} sx={{ height: 16, fontSize: 10, fontWeight: 600, bgcolor: st.bg, color: st.color, '& .MuiChip-label': { px: '5px' } }} />
                </Box>
                {/* Owner */}
                <Typography sx={{ fontSize: 11, color: text.tertiary, width: 120, flexShrink: 0 }} noWrap>{ins.owner ?? '—'}</Typography>
              </Box>
            );
          })}
        </Box>

        {/* Detail panel */}
        {selected && <InsightDetail insight={selected} onClose={() => setSelected(null)} />}
      </Box>
    </Box>
  );
};
