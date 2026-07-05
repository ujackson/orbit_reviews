import { useState } from 'react';
import { Box, Typography, alpha, Button, Chip, Divider, Select, MenuItem, FormControl } from '@mui/material';
import { ArrowUpward, ArrowDownward, Refresh as RefreshIcon, TrendingUp, TrendingDown } from '@mui/icons-material';
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer,
  Tooltip as RTooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from 'recharts';
import { color, text, radius } from '../../shared/tokens/design-tokens';
import { SectionLabel, Dot } from '../../shared/enterprise';
import { toast } from 'sonner';

// ─── Data ─────────────────────────────────────────────────────────────────────

const RADAR_DATA = [
  { subject: 'Rating',     Orbit: 84, Intercom: 78, Zendesk: 72 },
  { subject: 'Volume',     Orbit: 92, Intercom: 85, Zendesk: 68 },
  { subject: 'Sentiment',  Orbit: 79, Intercom: 73, Zendesk: 65 },
  { subject: 'Support',    Orbit: 58, Intercom: 82, Zendesk: 74 },
  { subject: 'Onboarding', Orbit: 62, Intercom: 88, Zendesk: 71 },
  { subject: 'Mobile',     Orbit: 61, Intercom: 84, Zendesk: 67 },
];

const SENTIMENT_BAR = [
  { name: 'Orbit',     pos: 79, neg: 13, neutral: 8 },
  { name: 'Intercom',  pos: 73, neg: 18, neutral: 9 },
  { name: 'Zendesk',   pos: 65, neg: 24, neutral: 11 },
  { name: 'Freshdesk', pos: 69, neg: 21, neutral: 10 },
];

const COMPETITORS = [
  { name: 'Intercom',  rating: 4.1, volume: 32100, sentiment: 73, change: -2, themes: ['Onboarding', 'Mobile UX', 'Pricing'],  dot: '#1F8EED', opportunity: 'Mobile UX gap' },
  { name: 'Zendesk',   rating: 3.8, volume: 28400, sentiment: 65, change: -5, themes: ['Legacy UX', 'Ticketing', 'Cost'],       dot: '#03363D', opportunity: 'Legacy displacement' },
  { name: 'Freshdesk', rating: 4.0, volume: 14200, sentiment: 69, change:  1, themes: ['Value', 'Ease of use', 'SMB fit'],      dot: '#2C5CC5', opportunity: 'Enterprise upgrade' },
];

const COMPARISON_ROWS = [
  { metric: 'Average rating',     orbit: '4.2',    intercom: '4.1',    zendesk: '3.8',    winner: 'orbit'   as const, note: '+0.1 ahead of nearest competitor'     },
  { metric: 'Review volume (30d)',orbit: '48,291', intercom: '32,100', zendesk: '28,400', winner: 'orbit'   as const, note: '51% more reviews than Intercom'      },
  { metric: 'Positive sentiment', orbit: '79%',    intercom: '73%',    zendesk: '65%',    winner: 'orbit'   as const, note: '+6pp vs Intercom'                    },
  { metric: 'Negative sentiment', orbit: '13%',    intercom: '18%',    zendesk: '24%',    winner: 'orbit'   as const, note: '5pp better than Intercom'            },
  { metric: 'Onboarding praise',  orbit: '62%',    intercom: '88%',    zendesk: '71%',    winner: 'intercom' as const, note: '−26pp gap — roadmap opportunity'   },
  { metric: 'Mobile experience',  orbit: '61%',    intercom: '84%',    zendesk: '67%',    winner: 'intercom' as const, note: '−23pp gap — roadmap opportunity'   },
  { metric: 'Support satisfaction',orbit: '58%',   intercom: '82%',    zendesk: '74%',    winner: 'intercom' as const, note: '−24pp gap — resource opportunity'  },
];

const OBSERVED_INSIGHTS = [
  { text: 'Customers praise Intercom onboarding while criticising ours — guided setup is the primary gap.', direction: 'negative' as const },
  { text: 'Orbit leads in review analytics and enterprise data richness per G2 reviewers.', direction: 'positive' as const },
  { text: "Zendesk reviews cite 'legacy feel' — displacement messaging opportunity for Orbit.", direction: 'positive' as const },
  { text: 'Mobile UX gap vs Intercom (−23pp) is the most-cited competitive weakness.', direction: 'negative' as const },
];

const ttStyle = { background: '#fff', border: '1px solid #E5E7EB', borderRadius: 8, fontSize: 11 };
const COLORS = { Orbit: color.functional.primary, Intercom: '#1F8EED', Zendesk: '#03363D' };

export const CompetitorsView = () => {
  const [period, setPeriod] = useState('30d');

  return (
    <Box sx={{ flex: 1, height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden', bgcolor: '#fff' }}>

      {/* Header */}
      <Box sx={{ px: '24px', py: '12px', borderBottom: '1px solid #E5E7EB', display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
        <Box sx={{ flex: 1 }}>
          <Typography sx={{ fontSize: 14, fontWeight: 700, color: text.primary, letterSpacing: '-0.01em' }}>
            Competitors
          </Typography>
          <Typography sx={{ fontSize: 11, color: text.tertiary }}>
            Based on observed review evidence · {COMPETITORS.length} competitors tracked · {period === '30d' ? 'Last 30 days' : period === '90d' ? 'Last 90 days' : 'Last 7 days'}
          </Typography>
        </Box>
        <FormControl size="small" sx={{ width: 130 }}>
          <Select value={period} onChange={e => setPeriod(e.target.value)}
            sx={{ fontSize: 12, bgcolor: 'rgba(0,0,0,0.02)', '& .MuiSelect-select': { py: '5px' }, '& fieldset': { border: '1px solid #E5E7EB' } }}>
            <MenuItem value="7d"  sx={{ fontSize: 12 }}>Last 7 days</MenuItem>
            <MenuItem value="30d" sx={{ fontSize: 12 }}>Last 30 days</MenuItem>
            <MenuItem value="90d" sx={{ fontSize: 12 }}>Last 90 days</MenuItem>
          </Select>
        </FormControl>
        <Button size="small" startIcon={<RefreshIcon sx={{ fontSize: 14 }} />} onClick={() => toast.success('Refreshing competitive data…')}
          sx={{ fontSize: 12, height: 30, px: '12px', borderColor: '#E5E7EB', color: text.secondary, border: '1px solid #E5E7EB' }}>
          Refresh
        </Button>
      </Box>

      {/* Content */}
      <Box sx={{ flex: 1, overflow: 'auto', px: '24px', py: '20px', display: 'flex', flexDirection: 'column', gap: '24px', '&::-webkit-scrollbar': { width: 5 } }}>

        {/* Observed insights */}
        <Box>
          <SectionLabel label="Observed from review evidence" />
          <Box sx={{ border: '1px solid #E5E7EB', borderRadius: '8px', overflow: 'hidden', bgcolor: '#fff' }}>
            {OBSERVED_INSIGHTS.map((ins, i) => (
              <Box key={i} sx={{ display: 'flex', alignItems: 'flex-start', gap: '10px', px: '16px', py: '10px', borderBottom: i < OBSERVED_INSIGHTS.length - 1 ? '1px solid #E5E7EB' : 'none' }}>
                {ins.direction === 'positive'
                  ? <TrendingUp sx={{ fontSize: 14, color: color.functional.success, mt: '2px', flexShrink: 0 }} />
                  : <TrendingDown sx={{ fontSize: 14, color: color.functional.error, mt: '2px', flexShrink: 0 }} />}
                <Typography sx={{ fontSize: 12, color: text.secondary, lineHeight: 1.6 }}>{ins.text}</Typography>
              </Box>
            ))}
          </Box>
          <Typography sx={{ fontSize: 10, color: text.tertiary, mt: '6px' }}>
            These observations are derived from review evidence. They are not verified claims about competitor capabilities.
          </Typography>
        </Box>

        {/* Charts row */}
        <Box sx={{ display: 'flex', gap: '16px' }}>
          {/* Radar */}
          <Box sx={{ flex: 1.2, border: '1px solid #E5E7EB', borderRadius: '8px', p: '16px' }}>
            <Typography sx={{ fontSize: 12, fontWeight: 700, color: text.primary, mb: '3px' }}>Competitive radar</Typography>
            <Typography sx={{ fontSize: 10, color: text.tertiary, mb: '8px' }}>Score out of 100 per dimension · based on review sentiment analysis</Typography>
            <ResponsiveContainer width="100%" height={220}>
              <RadarChart data={RADAR_DATA}>
                <PolarGrid stroke="rgba(0,0,0,0.07)" />
                <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11, fill: text.tertiary }} />
                <Radar name="Orbit"    dataKey="Orbit"    stroke={COLORS.Orbit}    fill={COLORS.Orbit}    fillOpacity={0.12} strokeWidth={2} />
                <Radar name="Intercom" dataKey="Intercom" stroke={COLORS.Intercom} fill={COLORS.Intercom} fillOpacity={0.06} strokeWidth={1.5} />
                <Radar name="Zendesk"  dataKey="Zendesk"  stroke={COLORS.Zendesk}  fill={COLORS.Zendesk}  fillOpacity={0.04} strokeWidth={1} />
                <RTooltip contentStyle={ttStyle} />
              </RadarChart>
            </ResponsiveContainer>
            <Box sx={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
              {Object.entries(COLORS).map(([name, c]) => (
                <Box key={name} sx={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <Dot color={c} size={7} />
                  <Typography sx={{ fontSize: 10, color: text.tertiary }}>{name}</Typography>
                </Box>
              ))}
            </Box>
          </Box>

          {/* Sentiment bar */}
          <Box sx={{ flex: 1, border: '1px solid #E5E7EB', borderRadius: '8px', p: '16px' }}>
            <Typography sx={{ fontSize: 12, fontWeight: 700, color: text.primary, mb: '3px' }}>Sentiment distribution</Typography>
            <Typography sx={{ fontSize: 10, color: text.tertiary, mb: '8px' }}>Positive vs negative % across platforms</Typography>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={SENTIMENT_BAR} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
                <CartesianGrid vertical={false} stroke="rgba(0,0,0,0.04)" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: text.tertiary }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 9, fill: text.tertiary }} axisLine={false} tickLine={false} />
                <RTooltip contentStyle={ttStyle} />
                <Bar dataKey="pos" fill={color.functional.success} radius={[3, 3, 0, 0]} name="Positive %" />
                <Bar dataKey="neg" fill={color.functional.error}   radius={[3, 3, 0, 0]} name="Negative %" />
              </BarChart>
            </ResponsiveContainer>
          </Box>

          {/* Competitor cards */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: '10px', width: 210 }}>
            {COMPETITORS.map(c => (
              <Box key={c.name} sx={{ px: '14px', py: '12px', border: '1px solid #E5E7EB', borderRadius: '8px', bgcolor: '#fff' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px', mb: '8px' }}>
                  <Dot color={c.dot} size={8} />
                  <Typography sx={{ fontSize: 13, fontWeight: 700, color: text.primary }}>{c.name}</Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: '16px', mb: '8px' }}>
                  <Box>
                    <Typography sx={{ fontSize: 16, fontWeight: 800, color: text.primary, lineHeight: 1 }}>★ {c.rating}</Typography>
                    <Typography sx={{ fontSize: 9, color: text.tertiary }}>avg rating</Typography>
                  </Box>
                  <Box>
                    <Typography sx={{ fontSize: 16, fontWeight: 800, color: text.primary, lineHeight: 1 }}>{c.sentiment}%</Typography>
                    <Typography sx={{ fontSize: 9, color: text.tertiary }}>positive</Typography>
                  </Box>
                </Box>
                <Box sx={{ px: '8px', py: '5px', bgcolor: alpha(color.functional.success, 0.07), borderRadius: '5px', border: `1px solid ${alpha(color.functional.success, 0.15)}` }}>
                  <Typography sx={{ fontSize: 10, fontWeight: 600, color: color.functional.success }}>Opp: {c.opportunity}</Typography>
                </Box>
              </Box>
            ))}
          </Box>
        </Box>

        {/* Comparison table */}
        <Box>
          <SectionLabel label="Head-to-head comparison · based on review data" />
          <Box sx={{ border: '1px solid #E5E7EB', borderRadius: '8px', overflow: 'hidden', bgcolor: '#fff' }}>
            {/* Headers */}
            <Box sx={{ display: 'flex', px: '16px', py: '8px', bgcolor: 'rgba(0,0,0,0.025)', borderBottom: '1px solid #E5E7EB' }}>
              {['Metric', 'Orbit', 'Intercom', 'Zendesk', 'Analysis'].map((h, i) => (
                <Typography key={h} sx={{ fontSize: 10, fontWeight: 700, color: text.tertiary, textTransform: 'uppercase', letterSpacing: '0.07em', flex: i === 0 ? 1.5 : i === 4 ? 2 : 1, textAlign: i > 0 && i < 4 ? 'center' : 'left' }}>
                  {h}
                </Typography>
              ))}
            </Box>
            {COMPARISON_ROWS.map((row, i) => (
              <Box key={row.metric}>
                {i > 0 && <Divider sx={{ borderColor: '#F3F4F6' }} />}
                <Box sx={{ display: 'flex', alignItems: 'center', px: '16px', py: '10px', '&:hover': { bgcolor: 'rgba(0,0,0,0.015)' } }}>
                  <Typography sx={{ fontSize: 12, color: text.secondary, flex: 1.5 }}>{row.metric}</Typography>
                  {[
                    { val: row.orbit,    key: 'orbit',    winner: row.winner === 'orbit' },
                    { val: row.intercom, key: 'intercom', winner: row.winner === 'intercom' },
                    { val: row.zendesk,  key: 'zendesk',  winner: false },
                  ].map(({ val, key, winner }) => (
                    <Box key={key} sx={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '4px' }}>
                      {winner && <Box sx={{ width: 5, height: 5, borderRadius: '50%', bgcolor: color.functional.success }} />}
                      <Typography sx={{ fontSize: 12, fontWeight: winner ? 700 : 400, color: winner ? color.functional.success : text.secondary }}>
                        {val}
                      </Typography>
                    </Box>
                  ))}
                  <Typography sx={{ fontSize: 11, color: row.winner === 'orbit' ? color.functional.success : color.functional.warning, flex: 2, pl: '8px' }}>
                    {row.note}
                  </Typography>
                </Box>
              </Box>
            ))}
          </Box>
          <Typography sx={{ fontSize: 10, color: text.tertiary, mt: '6px' }}>
            Scores derived from review sentiment analysis across Google, G2, Capterra, Trustpilot, and App Stores. Not a verified benchmark.
          </Typography>
        </Box>

      </Box>
    </Box>
  );
};
