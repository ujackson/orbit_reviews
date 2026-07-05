import { useState } from 'react';
import {
  Box, Typography, Divider, alpha, Button, Chip,
  Menu, MenuItem, IconButton, Tooltip,
} from '@mui/material';
import {
  ArrowUpward as UpIcon,
  ArrowDownward as DownIcon,
  MoreHoriz as MoreIcon,
  TrendingUp, TrendingDown,
  BookmarkBorder as WatchIcon,
  PersonAdd as AssignIcon,
  Close as DismissIcon,
} from '@mui/icons-material';
import {
  ResponsiveContainer, ComposedChart, Area, Line,
  XAxis, YAxis, Tooltip as RTooltip, CartesianGrid,
} from 'recharts';
import { color, text, radius } from '../../shared/tokens/design-tokens';
import { useNavigate, useWorkspacePath } from '@/hooks/useInertiaNavigation';
import { toast } from 'sonner';

// ─── Types ───────────────────────────────────────────────────────────────────

type ChangeDir   = 'up' | 'down';
type ChangeStatus = 'new' | 'investigating' | 'monitoring' | 'resolved' | 'dismissed';

interface WhatChanged {
  id: string;
  direction: ChangeDir;
  description: string;
  magnitude: string;
  scope: string;
  window: string;
  evidenceCount: number;
  evidenceUnit: string;
  status: ChangeStatus;
  owner?: string;
  isNegative: boolean;  // negative direction is bad (login failures up = bad)
}

// ─── Mock data ────────────────────────────────────────────────────────────────

const METRICS = [
  { label: 'Overall rating',    value: '4.21', delta: '+0.08', sub: 'vs prior 30 days',  good: true },
  { label: 'Review volume',     value: '48,291', delta: '+18.2%', sub: 'vs prior period', good: true },
  { label: 'Needs response',    value: '47',   delta: '12 overdue', sub: '',              good: false, action: 'inbox' },
  { label: 'Active alerts',     value: '3',    delta: '1 critical', sub: '',              good: false, action: 'alerts' },
];

const CHANGES: WhatChanged[] = [
  {
    id: 'c1',
    direction: 'up', description: 'Android authentication complaints after v5.1.0',
    magnitude: '+34%', scope: 'Android · v5.1.0',
    window: '7 days', evidenceCount: 89, evidenceUnit: 'reviews',
    status: 'investigating', owner: 'Mobile Platform', isNegative: true,
  },
  {
    id: 'c2',
    direction: 'down', description: 'Shipping damage reports declined after carrier change',
    magnitude: '−18%', scope: 'All regions',
    window: '30 days', evidenceCount: 31, evidenceUnit: 'reviews',
    status: 'monitoring', isNegative: false,
  },
  {
    id: 'c3',
    direction: 'up', description: 'Support satisfaction improved across G2 and Trustpilot',
    magnitude: '+11%', scope: 'G2 · Trustpilot',
    window: '30 days', evidenceCount: 214, evidenceUnit: 'reviews',
    status: 'monitoring', isNegative: false,
  },
  {
    id: 'c4',
    direction: 'up', description: 'Competitor comparisons increasingly mention dark mode gap',
    magnitude: '+218%', scope: 'G2 · Capterra',
    window: '14 days', evidenceCount: 44, evidenceUnit: 'mentions',
    status: 'new', isNegative: true,
  },
  {
    id: 'c5',
    direction: 'up', description: 'Support wait time complaints increasing in enterprise segment',
    magnitude: '+22%', scope: 'Enterprise tier',
    window: '14 days', evidenceCount: 58, evidenceUnit: 'reviews',
    status: 'new', owner: 'Support Ops', isNegative: true,
  },
];

const trendData = [
  { d: 'Jun 1', rating: 3.8, volume: 210 }, { d: 'Jun 3', rating: 3.9, volume: 245 },
  { d: 'Jun 5', rating: 3.7, volume: 198 }, { d: 'Jun 7', rating: 4.0, volume: 312 },
  { d: 'Jun 9', rating: 4.1, volume: 287 }, { d: 'Jun 11', rating: 3.9, volume: 340 },
  { d: 'Jun 13', rating: 4.2, volume: 295 }, { d: 'Jun 15', rating: 4.3, volume: 378 },
  { d: 'Jun 16', rating: 4.2, volume: 362 },
];

const SOURCE_HEALTH = [
  { name: 'Google Business', status: 'Healthy',  last: '1 min ago',  records: '18,420' },
  { name: 'App Store',       status: 'Warning',  last: '3 min ago',  records: '11,203' },
  { name: 'Google Play',     status: 'Healthy',  last: '3 min ago',  records: '8,940'  },
  { name: 'G2',              status: 'Healthy',  last: '5 min ago',  records: '4,210'  },
  { name: 'Trustpilot',      status: 'Healthy',  last: '2 min ago',  records: '3,180'  },
];

const EMERGING = [
  { theme: 'Dark mode gap', reviews: 44,  change: '+218%', trend: 'up'   as const },
  { theme: 'Checkout speed', reviews: 87, change: '+34%',  trend: 'up'   as const },
  { theme: 'Onboarding',    reviews: 312, change: '−14%',  trend: 'down' as const },
];

const statusConfig: Record<ChangeStatus, { label: string; bg: string; fg: string }> = {
  new:          { label: 'New',           bg: alpha(color.functional.primary, 0.08), fg: color.functional.primary },
  investigating:{ label: 'Investigating', bg: alpha(color.functional.warning, 0.10), fg: color.functional.warning },
  monitoring:   { label: 'Monitoring',    bg: alpha(color.neutral[900], 0.07),        fg: text.secondary },
  resolved:     { label: 'Resolved',      bg: alpha(color.functional.success, 0.08), fg: color.functional.success },
  dismissed:    { label: 'Dismissed',     bg: alpha(color.neutral[900], 0.05),        fg: text.tertiary },
};

const ttStyle = { background: '#fff', border: '1px solid rgba(0,0,0,0.09)', borderRadius: 8, fontSize: 11 };

// ─── Metric strip ─────────────────────────────────────────────────────────────

function MetricStrip() {
  const navigate = useNavigate();
  const workspacePath = useWorkspacePath();
  return (
    <Box sx={{ display: 'flex', borderBottom: '1px solid rgba(0,0,0,0.07)' }}>
      {METRICS.map((m, i) => (
        <Box
          key={m.label}
          onClick={() => m.action ? navigate(workspacePath(m.action)) : undefined}
          sx={{
            flex: 1, px: '28px', py: '18px',
            borderRight: i < METRICS.length - 1 ? '1px solid rgba(0,0,0,0.07)' : 'none',
            cursor: m.action ? 'pointer' : 'default',
            '&:hover': m.action ? { bgcolor: 'rgba(0,0,0,0.02)' } : {},
            transition: 'background 0.1s',
          }}
        >
          <Typography sx={{ fontSize: 12, color: text.tertiary, mb: '6px', fontWeight: 700 }}>
            {m.label}
          </Typography>
          <Typography sx={{ fontSize: 24, fontWeight: 800, color: text.primary, lineHeight: 1, mb: '5px' }}>
            {m.value}
          </Typography>
          <Typography sx={{ fontSize: 12, fontWeight: 700, color: m.good ? color.functional.success : color.functional.error }}>
            {m.delta}
            {m.sub && <Box component="span" sx={{ color: text.tertiary, fontWeight: 500, ml: '5px' }}>{m.sub}</Box>}
          </Typography>
        </Box>
      ))}
    </Box>
  );
}

// ─── What Changed row ─────────────────────────────────────────────────────────
// Row itself is clickable → navigate to insights.
// Hover reveals secondary icon actions. One context-sensitive CTA when needed.

function ChangeRow({ change, onDismiss }: { change: WhatChanged; onDismiss: (id: string) => void }) {
  const navigate = useNavigate();
  const workspacePath = useWorkspacePath();
  const [menuEl, setMenuEl] = useState<null | HTMLElement>(null);
  const [hovered, setHovered] = useState(false);

  const dirColor = change.isNegative
    ? (change.direction === 'up' ? color.functional.error : color.functional.success)
    : (change.direction === 'up' ? color.functional.success : color.functional.warning);

  const DirIcon = change.direction === 'up' ? UpIcon : DownIcon;
  const sc = statusConfig[change.status];

  // Context-sensitive primary action — only shown for unacknowledged critical changes
  const showCTA = change.status === 'new' && change.isNegative;

  return (
    <Box
      onClick={() => navigate(workspacePath('insights'))}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      sx={{
        display: 'flex', alignItems: 'center', gap: '12px',
        px: '20px', py: '11px',
        borderBottom: '1px solid rgba(0,0,0,0.05)',
        cursor: 'pointer',
        bgcolor: hovered ? 'rgba(0,0,0,0.018)' : 'transparent',
        transition: 'background 0.08s',
      }}
    >
      {/* Direction indicator */}
      <Box sx={{
        width: 22, height: 22, borderRadius: '50%', flexShrink: 0,
        bgcolor: alpha(dirColor, 0.10),
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <DirIcon sx={{ fontSize: 12, color: dirColor }} />
      </Box>

      {/* Main content */}
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Box sx={{ display: 'flex', alignItems: 'baseline', gap: '7px', mb: '3px', flexWrap: 'wrap' }}>
          <Typography sx={{ fontSize: 13, fontWeight: 600, color: text.primary, lineHeight: 1.3 }}>
            {change.description}
          </Typography>
          <Chip size="small" label={sc.label}
            sx={{ height: 20, fontSize: 11, fontWeight: 700, bgcolor: sc.bg, color: sc.fg, border: `1px solid ${alpha(sc.fg, 0.16)}`, '& .MuiChip-label': { px: '7px' } }} />
        </Box>
        {/* Evidence metadata — text, not pills */}
        <Typography sx={{ fontSize: 12, color: text.tertiary, fontWeight: 500, lineHeight: 1.2 }}>
          <Box component="span" sx={{ fontWeight: 700, color: dirColor }}>{change.magnitude}</Box>
          {' · '}{change.scope}{' · '}{change.window}
          {' · '}
          <Box component="span" sx={{ color: color.functional.primary, fontWeight: 600 }}>
            {change.evidenceCount.toLocaleString()} {change.evidenceUnit}
          </Box>
          {change.owner && <Box component="span"> · {change.owner}</Box>}
        </Typography>
      </Box>

      {/* Actions — only visible on hover, prevent row click propagation */}
      <Box
        onClick={e => e.stopPropagation()}
        sx={{ display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0, opacity: hovered ? 1 : 0, transition: 'opacity 0.12s' }}
      >
        {showCTA && (
          <Button size="small"
            onClick={e => { e.stopPropagation(); navigate(workspacePath('insights')); }}
            sx={{ fontSize: 11, height: 24, px: '10px', color: color.functional.primary, border: `1px solid ${alpha(color.functional.primary, 0.3)}`, bgcolor: alpha(color.functional.primary, 0.05), '&:hover': { bgcolor: alpha(color.functional.primary, 0.10) } }}>
            Investigate
          </Button>
        )}
        <Tooltip title="Watch">
          <IconButton size="small" onClick={e => { e.stopPropagation(); toast.success('Added to watchlist'); }}
            sx={{ color: text.tertiary, '&:hover': { color: text.primary } }}>
            <WatchIcon sx={{ fontSize: 15 }} />
          </IconButton>
        </Tooltip>
        <Tooltip title="Assign owner">
          <IconButton size="small" onClick={e => { e.stopPropagation(); toast.success('Assign dialog opening…'); }}
            sx={{ color: text.tertiary, '&:hover': { color: text.primary } }}>
            <AssignIcon sx={{ fontSize: 15 }} />
          </IconButton>
        </Tooltip>
        <Tooltip title="More">
          <IconButton size="small" onClick={e => { e.stopPropagation(); setMenuEl(e.currentTarget); }}
            sx={{ color: text.tertiary, '&:hover': { color: text.primary } }}>
            <MoreIcon sx={{ fontSize: 15 }} />
          </IconButton>
        </Tooltip>
        <Menu anchorEl={menuEl} open={Boolean(menuEl)} onClose={() => setMenuEl(null)} PaperProps={{ sx: { minWidth: 160 } }}>
          <MenuItem onClick={() => { toast.success('Action created'); setMenuEl(null); }} sx={{ fontSize: 13 }}>Create action</MenuItem>
          <Divider />
          <MenuItem onClick={() => { onDismiss(change.id); setMenuEl(null); }} sx={{ fontSize: 13, color: text.tertiary }}>Dismiss</MenuItem>
        </Menu>
      </Box>
    </Box>
  );
}

// ─── Main view ────────────────────────────────────────────────────────────────

export const HomeView = () => {
  const navigate = useNavigate();
  const workspacePath = useWorkspacePath();

  const [changes, setChanges] = useState(CHANGES);
  const dismiss = (id: string) => setChanges(prev => prev.filter(c => c.id !== id));

  return (
    <Box sx={{
      flex: 1, height: '100%', overflow: 'auto', bgcolor: '#fff',
      '&::-webkit-scrollbar': { width: 5 },
      '&::-webkit-scrollbar-thumb': { bgcolor: 'rgba(0,0,0,0.12)', borderRadius: 3 },
    }}>

      {/* 4-metric strip */}
      <MetricStrip />

      <Box sx={{ display: 'flex', height: 'calc(100% - 88px)', overflow: 'hidden' }}>

        {/* Left: What Changed (dominant) */}
        <Box sx={{ flex: 1, borderRight: '1px solid rgba(0,0,0,0.07)', overflow: 'auto', '&::-webkit-scrollbar': { width: 4 } }}>
          {/* Section header */}
          <Box sx={{ px: '20px', py: '12px', borderBottom: '1px solid rgba(0,0,0,0.07)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, bgcolor: '#fff', zIndex: 5 }}>
            <Box>
              <Typography sx={{ fontSize: 13, fontWeight: 700, color: text.primary, letterSpacing: '-0.01em' }}>
                What changed
              </Typography>
              <Typography sx={{ fontSize: 12, color: text.tertiary, fontWeight: 500 }}>
                Ranked by magnitude · Last 30 days
              </Typography>
            </Box>
            <Button size="small" onClick={() => navigate(workspacePath('insights'))}
              sx={{ fontSize: 11, color: color.functional.primary, height: 26, px: '10px' }}>
              View all insights →
            </Button>
          </Box>

          {changes.length === 0 ? (
            <Box sx={{ py: 8, textAlign: 'center' }}>
              <Typography sx={{ fontSize: 13, color: text.tertiary }}>No changes detected in this period</Typography>
            </Box>
          ) : (
            changes.map(c => <ChangeRow key={c.id} change={c} onDismiss={dismiss} />)
          )}
        </Box>

        {/* Right: Secondary surfaces */}
        <Box sx={{ width: 320, flexShrink: 0, overflow: 'auto', bgcolor: '#FAFAFA', '&::-webkit-scrollbar': { width: 4 } }}>

          {/* Rating + volume trend */}
          <Box sx={{ px: '16px', pt: '14px', pb: '12px', borderBottom: '1px solid rgba(0,0,0,0.07)' }}>
            <Typography sx={{ fontSize: 11, fontWeight: 700, color: text.secondary, mb: '10px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Rating · Volume
            </Typography>
            <ResponsiveContainer width="100%" height={110}>
              <ComposedChart data={trendData} margin={{ top: 2, right: 4, left: -28, bottom: 0 }}>
                <CartesianGrid vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="d" tick={{ fontSize: 11, fill: text.tertiary, fontWeight: 500 }} tickLine={false} axisLine={false} interval={2} />
                <YAxis yAxisId="r" domain={[3.4, 4.6]} tick={{ fontSize: 11, fill: text.tertiary, fontWeight: 500 }} tickLine={false} axisLine={false} />
                <YAxis yAxisId="v" orientation="right" tick={{ fontSize: 11, fill: text.tertiary, fontWeight: 500 }} tickLine={false} axisLine={false} />
                <RTooltip contentStyle={ttStyle} />
                <Area yAxisId="v" type="monotone" dataKey="volume" fill="rgba(94,106,210,0.07)" stroke="rgba(94,106,210,0.35)" strokeWidth={1} dot={false} name="Volume" />
                <Line yAxisId="r" type="monotone" dataKey="rating" stroke={color.functional.primary} strokeWidth={2} dot={false} name="Rating" />
              </ComposedChart>
            </ResponsiveContainer>
          </Box>

          {/* Source health */}
          <Box sx={{ px: '16px', pt: '12px', pb: '6px', borderBottom: '1px solid rgba(0,0,0,0.07)' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: '8px' }}>
              <Typography sx={{ fontSize: 11, fontWeight: 700, color: text.secondary, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Source health</Typography>
              <Typography onClick={() => navigate(workspacePath('connections'))} sx={{ fontSize: 11, color: color.functional.primary, cursor: 'pointer', fontWeight: 600, '&:hover': { textDecoration: 'underline' } }}>
                Manage →
              </Typography>
            </Box>
            {SOURCE_HEALTH.map(src => (
              <Box key={src.name} sx={{ display: 'flex', alignItems: 'center', gap: '8px', py: '5px' }}>
                <Box sx={{
                  width: 7, height: 7, borderRadius: '50%', flexShrink: 0,
                  bgcolor: src.status === 'Healthy' ? color.functional.success : color.functional.warning,
                }} />
                <Typography sx={{ fontSize: 12, color: text.primary, flex: 1 }}>{src.name}</Typography>
                <Typography sx={{ fontSize: 12, color: text.tertiary, fontWeight: 500 }}>{src.last}</Typography>
              </Box>
            ))}
          </Box>

          {/* Response operations */}
          <Box sx={{ px: '16px', pt: '12px', pb: '12px', borderBottom: '1px solid rgba(0,0,0,0.07)' }}>
            <Typography sx={{ fontSize: 11, fontWeight: 700, color: text.secondary, mb: '10px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Response operations
            </Typography>
            {[
              { label: 'Needs response', value: 47, bad: true, route: 'inbox' },
              { label: 'Overdue (>48h)',  value: 12, bad: true, route: 'inbox' },
              { label: 'Responded today', value: 31, bad: false, route: 'inbox' },
              { label: 'Response rate',  value: '64%', bad: false, route: null },
            ].map(row => (
              <Box key={row.label} sx={{ display: 'flex', alignItems: 'center', py: '4px' }}>
                <Typography sx={{ fontSize: 12, color: text.secondary, flex: 1 }}>{row.label}</Typography>
                <Typography
                  onClick={() => row.route ? navigate(workspacePath(row.route)) : undefined}
                  sx={{ fontSize: 12, fontWeight: 700, color: row.bad ? color.functional.error : text.primary, cursor: row.route ? 'pointer' : 'default', '&:hover': row.route ? { textDecoration: 'underline' } : {} }}
                >
                  {row.value}
                </Typography>
              </Box>
            ))}
          </Box>

          {/* Emerging themes */}
          <Box sx={{ px: '16px', pt: '12px', pb: '14px' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: '8px' }}>
              <Typography sx={{ fontSize: 11, fontWeight: 700, color: text.secondary, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Emerging themes</Typography>
              <Typography onClick={() => navigate(workspacePath('themes'))} sx={{ fontSize: 11, color: color.functional.primary, cursor: 'pointer', fontWeight: 600, '&:hover': { textDecoration: 'underline' } }}>
                All →
              </Typography>
            </Box>
            {EMERGING.map(t => (
              <Box key={t.theme} onClick={() => navigate(workspacePath('themes'))}
                sx={{ display: 'flex', alignItems: 'center', gap: '8px', py: '5px', cursor: 'pointer', '&:hover': { opacity: 0.8 } }}>
                {t.trend === 'up'
                  ? <TrendingUp sx={{ fontSize: 13, color: color.functional.error }} />
                  : <TrendingDown sx={{ fontSize: 13, color: color.functional.success }} />}
                <Typography sx={{ fontSize: 12, color: text.primary, flex: 1 }}>{t.theme}</Typography>
                <Typography sx={{ fontSize: 12, color: text.tertiary, fontWeight: 600 }}>{t.reviews}</Typography>
                <Typography sx={{ fontSize: 11, fontWeight: 600, color: t.trend === 'up' ? color.functional.error : color.functional.success }}>{t.change}</Typography>
              </Box>
            ))}
          </Box>

        </Box>
      </Box>
    </Box>
  );
};
