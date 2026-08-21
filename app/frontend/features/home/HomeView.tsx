import {
  Box, Typography, Button, Chip, Avatar, Divider,
} from '@mui/material';
import {
  ArrowUpward as UpIcon,
  ArrowDownward as DownIcon,
  TrendingUp as TrendUpIcon,
  CheckCircle as CheckIcon,
  ErrorOutline as RiskIcon,
  Schedule as PendingIcon,
  EmojiEvents as TrophyIcon,
} from '@mui/icons-material';
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis,
  Tooltip as RTooltip, CartesianGrid,
} from 'recharts';
import { color, text } from '../../shared/tokens/design-tokens';
import { useNavigate, useWorkspacePath } from '@/hooks/useInertiaNavigation';
import { MOCK_ISSUES, MOCK_ACTIONS } from '../../shared/mock/issues';
import type { ReviewInsight, ReviewSourceAccount } from '@/types';

type HomeViewProps = {
  metrics?: {
    reviewCount: number;
    needsResponseCount: number;
    activeAlertCount: number;
    activeAutomationCount: number;
  };
  recentInsights?: ReviewInsight[];
  sourceAccounts?: ReviewSourceAccount[];
};

// ─── Palette shortcuts ────────────────────────────────────────────────────────
const BR   = color.functional.primary;        // brand indigo
const BRS  = color.functional.primarySoft;
const BRB  = color.functional.primaryBorder;
const OK   = color.functional.success;        // semantic green
const OKL  = color.functional.successLight;
const ER   = color.functional.error;          // semantic red
const ERL  = color.functional.errorLight;
const ERB  = color.functional.errorBorder;
const WA   = color.functional.warning;        // semantic orange
const WAL  = color.functional.warningLight;
const WAB  = color.functional.warningBorder;
const BD   = color.canvas.border;             // #E7E9EE
const BDS  = color.canvas.borderStrong;
const TXP  = text.primary;                    // #171A21
const TXS  = text.secondary;                  // #626A78
const TXT  = text.tertiary;                   // #9299A6

// ─── Mock data ────────────────────────────────────────────────────────────────

const LOCATIONS = [
  {
    id: 'l1', name: 'Mobile Platform', region: 'Engineering',
    status: 'at_risk' as const,
    topIssue: 'Android authentication failures after v5.1.0',
    revenueExposure: 73000, resolvedThisMonth: 0,
    ratingBefore: 1.8, ratingNow: 1.8,
    owner: 'Tom H.', ownerInitials: 'TH',
  },
  {
    id: 'l2', name: 'Customer Support', region: 'Operations',
    status: 'resolving' as const,
    topIssue: 'Support wait-time SLA breach — SMB segment',
    revenueExposure: 38000, resolvedThisMonth: 1,
    ratingBefore: 2.4, ratingNow: 2.9,
    owner: 'Maya P.', ownerInitials: 'MP',
  },
  {
    id: 'l3', name: 'Fulfillment', region: 'Operations',
    status: 'resolving' as const,
    topIssue: 'Shipping damage reports after carrier transition',
    revenueExposure: 22000, resolvedThisMonth: 0,
    ratingBefore: 2.1, ratingNow: 2.5,
    owner: 'James L.', ownerInitials: 'JL',
  },
  {
    id: 'l4', name: 'Product Design', region: 'Product',
    status: 'healthy' as const,
    topIssue: 'Dark mode accessibility gap on Android',
    revenueExposure: 12000, resolvedThisMonth: 2,
    ratingBefore: 3.2, ratingNow: 3.5,
    owner: 'Priya S.', ownerInitials: 'PS',
  },
  {
    id: 'l5', name: 'Billing & Finance', region: 'Revenue',
    status: 'healthy' as const,
    topIssue: 'Renewal email causing billing confusion',
    revenueExposure: 41000, resolvedThisMonth: 3,
    ratingBefore: 2.9, ratingNow: 3.6,
    owner: 'Sarah C.', ownerInitials: 'SC',
  },
  {
    id: 'l6', name: 'Checkout & Payments', region: 'Engineering',
    status: 'healthy' as const,
    topIssue: 'Texas checkout failure — fully resolved',
    revenueExposure: 0, resolvedThisMonth: 1,
    ratingBefore: 1.6, ratingNow: 4.1,
    owner: 'Tom H.', ownerInitials: 'TH',
  },
];

const LEADERBOARD = [
  { rank: 1, name: 'Billing & Finance',   resolved: 3, revenue: 41000, avgDays: 4.2, initials: 'BF' },
  { rank: 2, name: 'Product Design',      resolved: 2, revenue: 12000, avgDays: 5.8, initials: 'PD' },
  { rank: 3, name: 'Checkout & Payments', resolved: 1, revenue: 41000, avgDays: 8.3, initials: 'CP' },
];

const FINDINGS = [
  {
    id: 'f1',
    title: 'Authentication errors increased',
    body: '89 reviews mention authentication failures across Android users.',
    meta: 'High confidence · 89 evidence items',
    actionLabel: 'View evidence →',
    route: 'feedback',
    urgent: true,
  },
  {
    id: 'f2',
    title: 'Billing complaints decreased 31%',
    body: 'Complaint volume fell after the renewal email rewrite.',
    meta: 'Verified improvement',
    actionLabel: 'Open issue →',
    route: 'issues',
    urgent: false,
  },
  {
    id: 'f3',
    title: 'Dark-mode complaints up 218% in 7 days',
    body: 'Volume spike may indicate an emerging pattern to investigate.',
    meta: 'Watch · 34 evidence items',
    actionLabel: 'Create issue →',
    route: 'issues',
    urgent: false,
  },
  {
    id: 'f4',
    title: '2 assigned actions are overdue',
    body: 'The Android rollback task has been open 6 days without an update.',
    meta: 'Overdue · requires attention',
    actionLabel: 'Review actions →',
    route: 'actions',
    urgent: true,
  },
];

const statusCfg = {
  at_risk:  { label: 'At risk',   color: ER,  bg: ERL,   border: ERB,  Icon: RiskIcon    },
  resolving:{ label: 'Resolving', color: WA,  bg: WAL,   border: WAB,  Icon: PendingIcon },
  healthy:  { label: 'Healthy',   color: OK,  bg: OKL,   border: 'transparent', Icon: CheckIcon },
};

const trendData = [
  { d: 'Jun 1', rev: 38, cmp: 210 },
  { d: 'Jun 3', rev: 42, cmp: 198 },
  { d: 'Jun 5', rev: 35, cmp: 240 },
  { d: 'Jun 7', rev: 52, cmp: 196 },
  { d: 'Jun 9', rev: 58, cmp: 175 },
  { d: 'Jun 11',rev: 47, cmp: 168 },
  { d: 'Jun 13',rev: 61, cmp: 145 },
  { d: 'Jun 16',rev: 52, cmp: 131 },
];

// ─── Location card ─────────────────────────────────────────────────────────────
// Spec §10: white bg, 1px neutral border, 8–10px radius, no default shadow

function LocationCard({ loc }: { loc: typeof LOCATIONS[0] }) {
  const navigate = useNavigate();
  const workspacePath = useWorkspacePath();
  const st = statusCfg[loc.status];
  const ratingUp = loc.ratingNow > loc.ratingBefore;

  return (
    <Box
      onClick={() => navigate(workspacePath('insights'))}
      sx={{
        bgcolor: '#fff', border: `1px solid ${BD}`,
        borderRadius: '10px', p: '14px 16px',
        cursor: 'pointer',
        transition: 'box-shadow 0.12s, border-color 0.12s',
        '&:hover': {
          boxShadow: '0 1px 3px rgba(16,24,40,0.06)',
          borderColor: BDS,
        },
      }}
    >
      {/* Header row */}
      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: '8px' }}>
        <Box>
          <Typography sx={{ fontSize: 14, fontWeight: 600, color: TXP, lineHeight: 1.3, letterSpacing: '-0.005em' }}>
            {loc.name}
          </Typography>
          <Typography sx={{ fontSize: 11, color: TXT, fontWeight: 500, mt: '1px' }}>
            {loc.region}
          </Typography>
        </Box>
        {/* Small status badge — spec §10 */}
        <Box sx={{
          display: 'flex', alignItems: 'center', gap: '4px',
          px: '6px', height: 20, borderRadius: '4px',
          bgcolor: st.bg, border: `1px solid ${st.border}`,
          flexShrink: 0,
        }}>
          <st.Icon sx={{ fontSize: 10, color: st.color }} />
          <Typography sx={{ fontSize: 11, fontWeight: 600, color: st.color, lineHeight: 1 }}>
            {st.label}
          </Typography>
        </Box>
      </Box>

      {/* Issue description */}
      <Typography sx={{ fontSize: 12, color: TXS, lineHeight: 1.5, mb: '10px', minHeight: 34 }}>
        {loc.topIssue}
      </Typography>

      {/* Metrics row — plain text, not pills */}
      <Box sx={{ display: 'flex', gap: '16px', mb: '10px', flexWrap: 'wrap' }}>
        {loc.revenueExposure > 0 ? (
          <Box>
            <Typography sx={{ fontSize: 11, color: TXT, fontWeight: 500, mb: '1px' }}>Exposure</Typography>
            <Typography sx={{ fontSize: 13, fontWeight: 600, color: ER, letterSpacing: '-0.02em' }}>
              ${(loc.revenueExposure / 1000).toFixed(0)}K
            </Typography>
          </Box>
        ) : (
          <Box>
            <Typography sx={{ fontSize: 11, color: TXT, fontWeight: 500, mb: '1px' }}>Status</Typography>
            <Typography sx={{ fontSize: 12, fontWeight: 600, color: OK }}>Resolved</Typography>
          </Box>
        )}
        <Box>
          <Typography sx={{ fontSize: 11, color: TXT, fontWeight: 500, mb: '1px' }}>Rating</Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
            <Typography sx={{ fontSize: 13, fontWeight: 600, color: TXP, letterSpacing: '-0.02em' }}>
              {loc.ratingNow}★
            </Typography>
            {ratingUp
              ? <UpIcon sx={{ fontSize: 10, color: OK }} />
              : <DownIcon sx={{ fontSize: 10, color: ER }} />}
          </Box>
        </Box>
        <Box>
          <Typography sx={{ fontSize: 11, color: TXT, fontWeight: 500, mb: '1px' }}>Resolved</Typography>
          <Typography sx={{ fontSize: 13, fontWeight: 600, color: TXP, letterSpacing: '-0.02em' }}>
            {loc.resolvedThisMonth}
          </Typography>
        </Box>
      </Box>

      {/* Owner + link */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Avatar sx={{ width: 20, height: 20, fontSize: 9, fontWeight: 600 }}>
            {loc.ownerInitials}
          </Avatar>
          <Typography sx={{ fontSize: 11, color: TXT }}>{loc.owner}</Typography>
        </Box>
        <Typography
          component="button"
          onClick={e => { e.stopPropagation(); navigate(workspacePath('insights')); }}
          sx={{
            fontSize: 11, fontWeight: 600, color: BR,
            border: 'none', background: 'none', cursor: 'pointer', p: 0,
            fontFamily: 'inherit',
            '&:hover': { opacity: 0.75 },
          }}
        >
          View issue →
        </Typography>
      </Box>
    </Box>
  );
}

// ─── Finding row ──────────────────────────────────────────────────────────────
// Spec §11: rows with dividers, no nested cards, no purple decorations

function FindingRow({ finding, isLast }: { finding: typeof FINDINGS[0]; isLast: boolean }) {
  const navigate = useNavigate();
  const workspacePath = useWorkspacePath();
  const routeMap: Record<string, string> = {
    issues: 'insights',
    feedback: 'inbox',
    actions: 'alerts',
    impact: 'reports',
  };

  return (
    <Box>
      <Box sx={{ py: '12px' }}>
        <Typography sx={{
          fontSize: 13, fontWeight: 600, color: finding.urgent ? ER : TXP,
          letterSpacing: '-0.005em', mb: '3px',
        }}>
          {finding.title}
        </Typography>
        <Typography sx={{ fontSize: 12, color: TXS, lineHeight: 1.5, mb: '6px' }}>
          {finding.body}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography sx={{ fontSize: 11, color: TXT, fontWeight: 500 }}>
            {finding.meta}
          </Typography>
          <Typography
            component="button"
            onClick={() => navigate(workspacePath(routeMap[finding.route] ?? finding.route))}
            sx={{
              fontSize: 11, fontWeight: 600, color: BR,
              border: 'none', background: 'none', cursor: 'pointer', p: 0,
              fontFamily: 'inherit',
              '&:hover': { opacity: 0.75 },
            }}
          >
            {finding.actionLabel}
          </Typography>
        </Box>
      </Box>
      {!isLast && <Divider sx={{ borderColor: BD }} />}
    </Box>
  );
}

// ─── Leaderboard row ──────────────────────────────────────────────────────────

const MEDALS = ['🥇', '🥈', '🥉'];

function LeaderRow({ row, isLast }: { row: typeof LEADERBOARD[0]; isLast: boolean }) {
  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: '10px', py: '10px' }}>
        <Typography sx={{ fontSize: 15, width: 24, textAlign: 'center', flexShrink: 0 }}>
          {MEDALS[row.rank - 1]}
        </Typography>
        <Avatar sx={{ width: 28, height: 28, fontSize: 10, fontWeight: 600, flexShrink: 0 }}>
          {row.initials}
        </Avatar>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography sx={{ fontSize: 13, fontWeight: 600, color: TXP, letterSpacing: '-0.005em' }} noWrap>
            {row.name}
          </Typography>
          <Typography sx={{ fontSize: 11, color: TXT }}>
            {row.resolved} resolved · avg {row.avgDays}d
          </Typography>
        </Box>
        <Box sx={{ textAlign: 'right', flexShrink: 0 }}>
          <Typography sx={{ fontSize: 13, fontWeight: 600, color: OK }}>
            ${(row.revenue / 1000).toFixed(0)}K
          </Typography>
          <Typography sx={{ fontSize: 11, color: TXT }}>recovered</Typography>
        </Box>
      </Box>
      {!isLast && <Divider sx={{ borderColor: BD }} />}
    </Box>
  );
}

// ─── Main view ────────────────────────────────────────────────────────────────

export const OverviewView = ({ metrics }: HomeViewProps = {}) => {
  const navigate  = useNavigate();
  const workspacePath = useWorkspacePath();

  const totalRisk      = MOCK_ISSUES.reduce((s, i) => s + i.riskAmount, 0);
  const openIssues     = MOCK_ISSUES.filter(i => !['closed', 'dismissed'].includes(i.status));
  const criticalCount  = metrics?.activeAlertCount ?? openIssues.filter(i => i.severity === 'critical').length;
  const highCount      = openIssues.filter(i => i.severity === 'high').length;
  const overdueCount   = metrics?.needsResponseCount ?? MOCK_ACTIONS.filter(a => a.status === 'overdue').length;
  const openIssueCount = metrics?.reviewCount ?? openIssues.length;

  // Correct singular/plural — spec §4
  const issueWord   = criticalCount === 1 ? 'issue' : 'issues';
  const actionWord  = overdueCount === 1  ? 'action' : 'actions';

  return (
    <Box sx={{
      flex: 1, height: '100%', overflow: 'auto', bgcolor: '#F7F8FA',
      '&::-webkit-scrollbar': { width: 4 },
      '&::-webkit-scrollbar-thumb': { background: 'rgba(0,0,0,0.10)', borderRadius: 4 },
    }}>

      {/* ── Header ───────────────────────────────────────────────── */}
      {/* Spec §9: clean white, reduce padding, no emoji */}
      <Box sx={{
        px: '32px', pt: '22px', pb: '18px',
        bgcolor: '#FFFFFF', borderBottom: `1px solid ${BD}`,
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            <Typography sx={{
              fontSize: 11, fontWeight: 600, color: TXT, mb: '4px',
              textTransform: 'uppercase', letterSpacing: '0.06em',
            }}>
              Monday, June 16, 2026
            </Typography>
            <Typography sx={{
              fontSize: 28, fontWeight: 600, color: TXP,
              letterSpacing: '-0.025em', lineHeight: 1.18, mb: '4px',
            }}>
              Good morning, Sarah
            </Typography>
            <Typography sx={{ fontSize: 13, color: TXS, lineHeight: 1.5 }}>
              You have{' '}
              <Box component="span" sx={{ fontWeight: 600, color: ER }}>
                {criticalCount} critical {issueWord}
              </Box>
              {' '}and{' '}
              <Box component="span" sx={{ fontWeight: 600, color: WA }}>
                {overdueCount} overdue {actionWord}
              </Box>
              {' '}needing attention today.
            </Typography>
          </Box>
          {/* Spec §9: indigo, no shadow, 34–36px height */}
          <Button
            variant="contained"
            onClick={() => navigate(workspacePath('reports'))}
            sx={{ height: 34, fontSize: 13, fontWeight: 600, px: '14px', boxShadow: 'none', flexShrink: 0 }}
          >
            Open daily brief
          </Button>
        </Box>
      </Box>

      {/* ── KPI Strip ────────────────────────────────────────────── */}
      {/* Spec §8: one continuous neutral surface, vertical dividers, color only on the number */}
      <Box sx={{ px: '32px', pt: '16px', pb: '0' }}>
        <Box sx={{
          display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
          bgcolor: '#fff', border: `1px solid ${BD}`,
          borderRadius: '10px', mb: '20px', overflow: 'hidden',
        }}>
          {[
            {
              label: 'Revenue at risk',
              value: `$${(totalRisk / 1000).toFixed(0)}K`,
              valueColor: ER,
              sub: `${openIssueCount} open issues · estimated`,
            },
            {
              label: 'Revenue recovered',
              value: '$52K',
              valueColor: OK,
              sub: '+18% vs last quarter',
              subIcon: <TrendUpIcon sx={{ fontSize: 11, color: OK, verticalAlign: 'middle', mr: '2px' }} />,
            },
            {
              label: 'Issues open',
              value: String(openIssueCount),
              valueColor: TXP,
              sub: `${criticalCount} critical · ${highCount} high`,
            },
            {
              label: 'Overdue actions',
              value: String(overdueCount),
              valueColor: overdueCount > 0 ? WA : TXP,
              sub: overdueCount > 0 ? 'Needs attention today' : 'All on track',
            },
          ].map((kpi, i) => (
            <Box key={kpi.label} sx={{
              px: '22px', py: '18px',
              borderRight: i < 3 ? `1px solid ${BD}` : 'none',
            }}>
              <Typography sx={{ fontSize: 11, fontWeight: 600, color: TXT, mb: '6px', letterSpacing: '0.01em' }}>
                {kpi.label}
              </Typography>
              <Typography sx={{
                fontSize: 32, fontWeight: 600, color: kpi.valueColor,
                letterSpacing: '-0.035em', lineHeight: 1, mb: '4px',
                fontVariantNumeric: 'tabular-nums',
              }}>
                {kpi.value}
              </Typography>
              <Typography sx={{ fontSize: 11, color: TXT, fontWeight: 500 }}>
                {kpi.subIcon}{kpi.sub}
              </Typography>
            </Box>
          ))}
        </Box>
      </Box>

      {/* ── Main content ─────────────────────────────────────────── */}
      <Box sx={{ px: '32px', pb: '32px', display: 'flex', gap: '20px', alignItems: 'flex-start' }}>

        {/* LEFT — Location health (66%) */}
        <Box sx={{ flex: '0 0 calc(66% - 10px)', minWidth: 0 }}>

          {/* Section header */}
          <Box sx={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', mb: '10px' }}>
            <Box>
              <Typography sx={{ fontSize: 15, fontWeight: 600, color: TXP, letterSpacing: '-0.01em' }}>
                Operational health
              </Typography>
              <Typography sx={{ fontSize: 12, color: TXT, mt: '1px' }}>
                {LOCATIONS.filter(l => l.status === 'at_risk').length} at risk
                {' · '}
                {LOCATIONS.filter(l => l.status === 'resolving').length} resolving
                {' · '}
                {LOCATIONS.filter(l => l.status === 'healthy').length} healthy
              </Typography>
            </Box>
            <Button
              variant="text"
              size="small"
              onClick={() => navigate(workspacePath('insights'))}
              sx={{ fontSize: 12, color: BR, fontWeight: 600, minHeight: 'auto', py: 0, px: '4px' }}
            >
              View all issues →
            </Button>
          </Box>

          {/* 2-col grid — spec §10: flat, neutral border, 10px radius */}
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', mb: '20px' }}>
            {LOCATIONS.map(loc => (
              <LocationCard key={loc.id} loc={loc} />
            ))}
          </Box>

          {/* Leaderboard */}
          <Box sx={{
            bgcolor: '#fff', border: `1px solid ${BD}`,
            borderRadius: '10px', p: '14px 18px',
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: '7px', mb: '2px' }}>
              <TrophyIcon sx={{ fontSize: 15, color: WA }} />
              <Typography sx={{ fontSize: 14, fontWeight: 600, color: TXP, letterSpacing: '-0.01em' }}>
                Fastest resolvers this week
              </Typography>
            </Box>
            <Typography sx={{ fontSize: 12, color: TXT, mb: '4px' }}>
              Ranked by avg. resolution time · revenue recovered
            </Typography>
            {LEADERBOARD.map((row, i) => (
              <LeaderRow key={row.rank} row={row} isLast={i === LEADERBOARD.length - 1} />
            ))}
          </Box>
        </Box>

        {/* RIGHT — Findings + chart (34%) */}
        <Box sx={{ flex: '1 1 0', minWidth: 0, display: 'flex', flexDirection: 'column', gap: '16px' }}>

          {/* Latest findings — spec §11: neutral white, rows with dividers */}
          <Box sx={{
            bgcolor: '#fff', border: `1px solid ${BD}`,
            borderRadius: '10px', p: '14px 18px',
          }}>
            <Box sx={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', mb: '2px' }}>
              <Typography sx={{ fontSize: 14, fontWeight: 600, color: TXP, letterSpacing: '-0.01em' }}>
                Latest findings
              </Typography>
              <Typography sx={{ fontSize: 11, color: TXT, fontWeight: 500 }}>
                Updated 2 min ago
              </Typography>
            </Box>
            <Typography sx={{ fontSize: 11, color: TXT, mb: '4px' }}>
              Generated by Orbit
            </Typography>
            {FINDINGS.map((f, i) => (
              <FindingRow key={f.id} finding={f} isLast={i === FINDINGS.length - 1} />
            ))}
          </Box>

          {/* Revenue trend chart */}
          <Box sx={{
            bgcolor: '#fff', border: `1px solid ${BD}`,
            borderRadius: '10px', p: '14px 18px',
          }}>
            <Typography sx={{ fontSize: 14, fontWeight: 600, color: TXP, letterSpacing: '-0.01em', mb: '2px' }}>
              Revenue trend
            </Typography>
            <Typography sx={{ fontSize: 11, color: TXT, mb: '12px' }}>
              Estimated recovered ($K) vs. complaint volume
            </Typography>
            <ResponsiveContainer width="100%" height={130}>
              <AreaChart data={trendData} margin={{ top: 4, right: 0, left: -28, bottom: 0 }}>
                <defs>
                  <linearGradient id="gOK" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={OK} stopOpacity={0.15} />
                    <stop offset="100%" stopColor={OK} stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gER" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={ER} stopOpacity={0.08} />
                    <stop offset="100%" stopColor={ER} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} stroke={BD} />
                <XAxis dataKey="d" tick={{ fontSize: 9, fill: TXT }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 9, fill: TXT }} axisLine={false} tickLine={false} />
                <RTooltip
                  contentStyle={{
                    background: '#fff', border: `1px solid ${BD}`,
                    borderRadius: 8, fontSize: 11, boxShadow: '0 4px 12px rgba(16,24,40,0.08)',
                  }}
                />
                <Area key="area-rev" type="monotoneX" dataKey="rev"
                  stroke={OK} strokeWidth={2} fill="url(#gOK)" name="Revenue ($K)" dot={false} />
                <Area key="area-cmp" type="monotoneX" dataKey="cmp"
                  stroke={ER} strokeWidth={1.5} fill="url(#gER)" name="Complaints"
                  dot={false} strokeDasharray="4 2" />
              </AreaChart>
            </ResponsiveContainer>
          </Box>

        </Box>
      </Box>
    </Box>
  );
};

export const HomeView = OverviewView;
