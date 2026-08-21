import { useState } from 'react';
import {
  Box, Typography, Divider, alpha, Chip, IconButton,
  TextField, InputAdornment, Select, MenuItem, FormControl,
} from '@mui/material';
import {
  ArrowUpward, ArrowDownward, Close as CloseIcon, Search as SearchIcon,
} from '@mui/icons-material';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip as RTooltip } from 'recharts';
import { color, text, radius } from '../../shared/tokens/design-tokens';

const mk = (v: number[]) => v.map(n => ({ v: n }));

type ThemeStatus = 'active' | 'rising' | 'declining' | 'stable';
type Sentiment = 'negative' | 'positive' | 'mixed';

interface Theme {
  id: string;
  name: string;
  reviewCount: number;
  shareOfReviews: string;
  sentiment: Sentiment;
  sentimentPct: string;
  change: string;
  changeDir: 'up' | 'down';
  isNegativeChange: boolean;
  sources: number;
  products: number;
  status: ThemeStatus;
  spark: { v: number }[];
  detail: {
    summary: string;
    evidence: string[];
    subthemes: string[];
    emergingPhrases: string[];
  };
}

const THEMES: Theme[] = [
  {
    id: 't1', name: 'Shipping damage',
    reviewCount: 1243, shareOfReviews: '2.6%',
    sentiment: 'negative', sentimentPct: '71% negative',
    change: '+38%', changeDir: 'up', isNegativeChange: true,
    sources: 4, products: 8, status: 'rising',
    spark: mk([45, 52, 48, 61, 58, 74, 78, 92, 100]),
    detail: {
      summary: 'Customers report increased packaging failures across multiple fulfilment centres. Concentrated in orders placed after Apr 14.',
      evidence: ['1,243 reviews mention damage', '8 SKUs affected', '4 fulfilment regions implicated', 'Second-order incidence rate elevated'],
      subthemes: ['Box damage', 'Product cracked on arrival', 'Packaging inadequate for weight'],
      emergingPhrases: ['crushed box', 'corner dented', 'packaging failed', 'arrived broken'],
    },
  },
  {
    id: 't2', name: 'Authentication failures',
    reviewCount: 891, shareOfReviews: '1.8%',
    sentiment: 'negative', sentimentPct: '96% negative',
    change: '+42%', changeDir: 'up', isNegativeChange: true,
    sources: 2, products: 2, status: 'rising',
    spark: mk([20, 18, 22, 35, 48, 62, 78, 88, 100]),
    detail: {
      summary: 'Login failures concentrated on Android following v5.1.0 release. OAuth token refresh regression identified.',
      evidence: ['891 reviews cite login issues', '92% on Android', 'v5.1.0 mentioned in 78% of cases', 'Engineering ticket CX-4821 raised'],
      subthemes: ['Login loop', 'App crash at credential entry', 'Token expiry issues'],
      emergingPhrases: ['can\'t log in', 'login broken', 'app crashes on signin', 'constant logout'],
    },
  },
  {
    id: 't3', name: 'Onboarding experience',
    reviewCount: 654, shareOfReviews: '1.4%',
    sentiment: 'mixed', sentimentPct: '56% positive',
    change: '−14%', changeDir: 'down', isNegativeChange: false,
    sources: 5, products: 1, status: 'declining',
    spark: mk([80, 78, 75, 72, 68, 65, 62, 58, 54]),
    detail: {
      summary: 'Overall onboarding sentiment improving following guide launch May 28. Setup time reduced in reviews.',
      evidence: ['654 reviews mention onboarding', '56% now positive (was 44%)', 'Avg setup time cited reduced', 'Support cited positively alongside'],
      subthemes: ['Initial setup', 'Team configuration', 'Integration setup', 'First value moment'],
      emergingPhrases: ['easy to set up', 'quick start', 'helpful walkthrough', 'guided setup'],
    },
  },
  {
    id: 't4', name: 'Support response times',
    reviewCount: 312, shareOfReviews: '0.6%',
    sentiment: 'negative', sentimentPct: '88% negative',
    change: '+22%', changeDir: 'up', isNegativeChange: true,
    sources: 6, products: 0, status: 'rising',
    spark: mk([30, 35, 32, 40, 42, 48, 50, 58, 62]),
    detail: {
      summary: 'Support wait times increasingly cited, especially by enterprise accounts. Reviews with this theme are 2.4× more likely to be 1-star.',
      evidence: ['312 reviews mention wait times', 'Avg cited wait: 3.8 days', 'Enterprise segment 68% of volume', '2.4× 1-star correlation'],
      subthemes: ['Ticket response delay', 'No updates on open tickets', 'Support portal issues'],
      emergingPhrases: ['still waiting', '4 days no reply', 'ticket ignored', 'no response'],
    },
  },
  {
    id: 't5', name: 'Mobile experience',
    reviewCount: 287, shareOfReviews: '0.6%',
    sentiment: 'negative', sentimentPct: '61% negative',
    change: '+11%', changeDir: 'up', isNegativeChange: true,
    sources: 2, products: 2, status: 'active',
    spark: mk([55, 52, 58, 56, 60, 58, 62, 65, 68]),
    detail: {
      summary: 'Mobile experience cited in negative comparison reviews, primarily against Intercom. Desktop reviews do not exhibit this pattern.',
      evidence: ['287 reviews mention mobile', '74% in comparison context', 'Intercom cited in 44 reviews', 'Navigation and speed most mentioned gaps'],
      subthemes: ['Navigation clarity', 'Load speed', 'Offline functionality', 'Competitor comparison'],
      emergingPhrases: ['mobile app needs work', 'desktop is great but mobile', 'much better on desktop'],
    },
  },
];

const sentimentConfig: Record<Sentiment, { label: string; color: string; bg: string }> = {
  negative: { label: 'Negative', color: color.functional.error, bg: alpha(color.functional.error, 0.08) },
  positive: { label: 'Positive', color: color.functional.success, bg: alpha(color.functional.success, 0.08) },
  mixed:    { label: 'Mixed',    color: color.functional.warning, bg: alpha(color.functional.warning, 0.08) },
};

const statusConfig: Record<ThemeStatus, { label: string; color: string }> = {
  rising:   { label: 'Rising',   color: color.functional.error },
  active:   { label: 'Active',   color: text.secondary },
  stable:   { label: 'Stable',   color: text.tertiary },
  declining:{ label: 'Declining',color: color.functional.success },
};

function ThemeDetail({ theme, onClose }: { theme: Theme; onClose: () => void }) {
  const sc = sentimentConfig[theme.sentiment];
  const changeColor = theme.isNegativeChange
    ? (theme.changeDir === 'up' ? color.functional.error : color.functional.success)
    : (theme.changeDir === 'up' ? color.functional.success : color.functional.warning);

  return (
    <Box sx={{ width: 360, flexShrink: 0, bgcolor: '#fff', borderLeft: '1px solid rgba(0,0,0,0.08)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <Box sx={{ px: '18px', py: '12px', borderBottom: '1px solid rgba(0,0,0,0.07)', display: 'flex', alignItems: 'flex-start', gap: '8px', flexShrink: 0 }}>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography sx={{ fontSize: 14, fontWeight: 600, color: text.primary, mb: '4px' }}>{theme.name}</Typography>
          <Box sx={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <Typography sx={{ fontSize: 13, fontWeight: 600, color: text.primary }}>{theme.reviewCount.toLocaleString()}</Typography>
            <Typography sx={{ fontSize: 12, color: text.tertiary }}>reviews · {theme.shareOfReviews} of total</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: '5px', mt: '3px' }}>
            {theme.changeDir === 'up' ? <ArrowUpward sx={{ fontSize: 11, color: changeColor }} /> : <ArrowDownward sx={{ fontSize: 11, color: changeColor }} />}
            <Typography sx={{ fontSize: 12, fontWeight: 600, color: changeColor }}>{theme.change} vs prior period</Typography>
            <Typography sx={{ fontSize: 11, color: text.tertiary }}>· {theme.sentimentPct}</Typography>
          </Box>
        </Box>
        <IconButton size="small" onClick={onClose}><CloseIcon sx={{ fontSize: 16, color: text.tertiary }} /></IconButton>
      </Box>

      <Box sx={{ flex: 1, overflow: 'auto', p: '14px 18px', display: 'flex', flexDirection: 'column', gap: '14px', '&::-webkit-scrollbar': { width: 3 } }}>

        {/* Trend */}
        <Box>
          <Typography sx={{ fontSize: 10, fontWeight: 600, color: text.tertiary, textTransform: 'uppercase', letterSpacing: '0.07em', mb: '8px' }}>Trend</Typography>
          <ResponsiveContainer width="100%" height={70}>
            <AreaChart data={theme.spark} margin={{ top: 2, right: 2, left: -28, bottom: 0 }}>
              <defs>
                <linearGradient id={`tg${theme.id}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={changeColor} stopOpacity={0.15} />
                  <stop offset="95%" stopColor={changeColor} stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis hide />
              <YAxis hide />
              <RTooltip contentStyle={{ fontSize: 11, borderRadius: 6, border: '1px solid rgba(0,0,0,0.09)' }} />
              <Area type="monotone" dataKey="v" stroke={changeColor} strokeWidth={2} fill={`url(#tg${theme.id})`} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </Box>

        <Divider />

        {/* Summary */}
        <Box>
          <Typography sx={{ fontSize: 10, fontWeight: 600, color: text.tertiary, textTransform: 'uppercase', letterSpacing: '0.07em', mb: '6px' }}>Summary</Typography>
          <Typography sx={{ fontSize: 12, color: text.secondary, lineHeight: 1.65 }}>{theme.detail.summary}</Typography>
        </Box>

        {/* Evidence */}
        <Box>
          <Typography sx={{ fontSize: 10, fontWeight: 600, color: text.tertiary, textTransform: 'uppercase', letterSpacing: '0.07em', mb: '6px' }}>Evidence</Typography>
          {theme.detail.evidence.map(e => (
            <Box key={e} sx={{ display: 'flex', gap: '7px', mb: '4px' }}>
              <Box sx={{ width: 4, height: 4, borderRadius: '50%', bgcolor: text.tertiary, mt: '5px', flexShrink: 0 }} />
              <Typography sx={{ fontSize: 12, color: text.secondary }}>{e}</Typography>
            </Box>
          ))}
        </Box>

        {/* Subthemes */}
        <Box>
          <Typography sx={{ fontSize: 10, fontWeight: 600, color: text.tertiary, textTransform: 'uppercase', letterSpacing: '0.07em', mb: '6px' }}>Related subthemes</Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
            {theme.detail.subthemes.map(s => (
              <Chip key={s} size="small" label={s}
                sx={{ height: 20, fontSize: 11, bgcolor: 'rgba(0,0,0,0.05)', color: text.secondary, '& .MuiChip-label': { px: '8px' } }} />
            ))}
          </Box>
        </Box>

        {/* Emerging phrases */}
        <Box>
          <Typography sx={{ fontSize: 10, fontWeight: 600, color: text.tertiary, textTransform: 'uppercase', letterSpacing: '0.07em', mb: '6px' }}>Emerging phrases</Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
            {theme.detail.emergingPhrases.map(p => (
              <Chip key={p} size="small" label={`"${p}"`}
                sx={{ height: 20, fontSize: 11, fontStyle: 'italic', bgcolor: 'rgba(0,0,0,0.03)', border: '1px solid rgba(0,0,0,0.09)', color: text.secondary, '& .MuiChip-label': { px: '8px' } }} />
            ))}
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

export const ThemesView = () => {
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Theme | null>(null);

  const filtered = THEMES.filter(t =>
    !search || t.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Box sx={{ flex: 1, height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden', bgcolor: '#fff' }}>
      {/* Header */}
      <Box sx={{ px: '24px', py: '12px', borderBottom: '1px solid rgba(0,0,0,0.07)', flexShrink: 0 }}>
        <Typography sx={{ fontSize: 14, fontWeight: 600, color: text.primary, letterSpacing: '-0.01em' }}>Themes</Typography>
        <Typography sx={{ fontSize: 11, color: text.tertiary }}>Persistent customer topics detected across all review sources</Typography>
      </Box>

      {/* Filter bar — no permanent definitional text */}
      <Box sx={{ px: '24px', py: '8px', borderBottom: '1px solid rgba(0,0,0,0.06)', bgcolor: '#F8F9FC', display: 'flex', alignItems: 'center', flexShrink: 0 }}>
        <Typography sx={{ fontSize: 11, color: text.tertiary }}>{THEMES.length} themes · ranked by review volume</Typography>
        <Box sx={{ flex: 1 }} />
        <TextField size="small" placeholder="Search themes…" value={search} onChange={e => setSearch(e.target.value)}
          InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon sx={{ fontSize: 14, color: text.tertiary }} /></InputAdornment>, sx: { fontSize: 12, bgcolor: '#fff', '& fieldset': { border: '1px solid rgba(0,0,0,0.12)' }, borderRadius: '6px' } }}
          sx={{ width: 200 }}
        />
      </Box>

      <Box sx={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* Table */}
        <Box sx={{ flex: 1, overflow: 'auto', '&::-webkit-scrollbar': { width: 5 } }}>
          {/* Column headers */}
          <Box sx={{ display: 'flex', px: '24px', py: '7px', bgcolor: 'rgba(0,0,0,0.025)', borderBottom: '1px solid rgba(0,0,0,0.07)', position: 'sticky', top: 0, zIndex: 5 }}>
            {[
              { l: 'Theme',    flex: 2 },
              { l: 'Reviews',  w: 80 },
              { l: 'Share',    w: 70 },
              { l: 'Sentiment',w: 110 },
              { l: 'Change',   w: 80 },
              { l: 'Sources',  w: 70 },
              { l: 'Products', w: 80 },
              { l: 'Status',   w: 90 },
            ].map(col => (
              <Typography key={col.l}
                sx={{ fontSize: 10, fontWeight: 600, color: text.tertiary, textTransform: 'uppercase', letterSpacing: '0.07em', flex: col.flex, width: col.w, flexShrink: col.w ? 0 : undefined }}>
                {col.l}
              </Typography>
            ))}
          </Box>

          {filtered.map(theme => {
            const sc = sentimentConfig[theme.sentiment];
            const st = statusConfig[theme.status];
            const isSelected = selected?.id === theme.id;
            const changeColor = theme.isNegativeChange
              ? (theme.changeDir === 'up' ? color.functional.error : color.functional.success)
              : (theme.changeDir === 'up' ? color.functional.success : color.functional.warning);

            return (
              <Box key={theme.id} onClick={() => setSelected(isSelected ? null : theme)}
                sx={{
                  display: 'flex', alignItems: 'center', px: '24px', py: '12px',
                  borderBottom: '1px solid rgba(0,0,0,0.05)', cursor: 'pointer',
                  bgcolor: isSelected ? alpha(color.functional.primary, 0.04) : '#fff',
                  '&:hover': { bgcolor: isSelected ? alpha(color.functional.primary, 0.05) : 'rgba(0,0,0,0.02)' },
                  transition: 'background 0.08s',
                }}>
                <Box sx={{ flex: 2, minWidth: 0, pr: '12px' }}>
                  <Typography sx={{ fontSize: 13, fontWeight: 600, color: text.primary }} noWrap>{theme.name}</Typography>
                </Box>
                <Typography sx={{ fontSize: 13, fontWeight: 600, color: text.primary, width: 80, flexShrink: 0 }}>
                  {theme.reviewCount.toLocaleString()}
                </Typography>
                <Typography sx={{ fontSize: 12, color: text.secondary, width: 70, flexShrink: 0 }}>{theme.shareOfReviews}</Typography>
                <Box sx={{ width: 110, flexShrink: 0 }}>
                  <Chip size="small" label={theme.sentimentPct}
                    sx={{ height: 16, fontSize: 10, fontWeight: 600, bgcolor: sc.bg, color: sc.color, '& .MuiChip-label': { px: '5px' } }} />
                </Box>
                <Box sx={{ width: 80, flexShrink: 0, display: 'flex', alignItems: 'center', gap: '2px' }}>
                  {theme.changeDir === 'up' ? <ArrowUpward sx={{ fontSize: 11, color: changeColor }} /> : <ArrowDownward sx={{ fontSize: 11, color: changeColor }} />}
                  <Typography sx={{ fontSize: 12, fontWeight: 600, color: changeColor }}>{theme.change}</Typography>
                </Box>
                <Typography sx={{ fontSize: 12, color: text.secondary, width: 70, flexShrink: 0 }}>{theme.sources}</Typography>
                <Typography sx={{ fontSize: 12, color: text.secondary, width: 80, flexShrink: 0 }}>{theme.products > 0 ? theme.products : '—'}</Typography>
                <Box sx={{ width: 90, flexShrink: 0 }}>
                  <Typography sx={{ fontSize: 11, fontWeight: 600, color: st.color }}>{st.label}</Typography>
                </Box>
              </Box>
            );
          })}
        </Box>

        {/* Detail */}
        {selected && <ThemeDetail theme={selected} onClose={() => setSelected(null)} />}
      </Box>
    </Box>
  );
};
