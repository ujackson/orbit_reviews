import { useState } from 'react';
import { Box, Typography, Menu, MenuItem, Divider, alpha } from '@mui/material';
import { ExpandMore as ChevronIcon, CalendarToday as CalIcon } from '@mui/icons-material';
import { color, text, transition } from '@/shared/tokens/design-tokens';

interface ScopeOption { label: string; value: string }

const BRANDS: ScopeOption[] = [
  { label: 'All brands', value: 'all' },
  { label: 'Orbit Mobile', value: 'mobile' },
  { label: 'Orbit Consumer', value: 'consumer' },
  { label: 'Orbit Enterprise', value: 'enterprise' },
];
const REGIONS: ScopeOption[] = [
  { label: 'All regions', value: 'all' },
  { label: 'North America', value: 'na' },
  { label: 'Europe', value: 'eu' },
  { label: 'Asia Pacific', value: 'apac' },
];
const DATE_RANGES: ScopeOption[] = [
  { label: 'Last 7 days', value: '7d' },
  { label: 'Last 30 days', value: '30d' },
  { label: 'Last 90 days', value: '90d' },
  { label: 'Last 12 months', value: '12m' },
  { label: 'Custom…', value: 'custom' },
];

function ScopeSegment({
  label, value, options, onChange,
}: {
  label: string; value: string; options: ScopeOption[]; onChange: (v: string) => void;
}) {
  const [anchor, setAnchor] = useState<null | HTMLElement>(null);
  const current = options.find(o => o.value === value)?.label ?? value;

  return (
    <>
      <Box
        onClick={e => setAnchor(e.currentTarget)}
        sx={{
          display: 'flex', alignItems: 'center', gap: '3px',
          px: '7px', py: '4px', borderRadius: '6px', cursor: 'pointer',
          transition: `background ${transition.duration.fast}`,
          '&:hover': { bgcolor: alpha(color.neutral[900], 0.06) },
        }}
      >
        <Typography sx={{ fontSize: 12, color: text.secondary, fontWeight: 600 }}>
          {current}
        </Typography>
        <ChevronIcon sx={{ fontSize: 14, color: text.tertiary }} />
      </Box>
      <Menu
        anchorEl={anchor}
        open={Boolean(anchor)}
        onClose={() => setAnchor(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        PaperProps={{ sx: { mt: 0.5, minWidth: 180 } }}
      >
        <Typography sx={{ px: '12px', py: '6px', fontSize: 10, fontWeight: 700, color: text.tertiary, textTransform: 'uppercase', letterSpacing: '0.07em' }}>
          {label}
        </Typography>
        <Divider />
        {options.map(opt => (
          <MenuItem
            key={opt.value}
            selected={opt.value === value}
            onClick={() => { onChange(opt.value); setAnchor(null); }}
            sx={{ fontSize: 13, fontWeight: opt.value === value ? 600 : 400 }}
          >
            {opt.label}
          </MenuItem>
        ))}
      </Menu>
    </>
  );
}

function Sep() {
  return (
    <Typography sx={{ fontSize: 12, color: text.tertiary, userSelect: 'none', px: '2px' }}>/</Typography>
  );
}

export function ScopeSelector() {
  const [brand, setBrand] = useState('all');
  const [region, setRegion] = useState('all');
  const [dateRange, setDateRange] = useState('30d');

  return (
    <Box
      sx={{
        height: 40,
        borderBottom: '1px solid #E5E7EB',
        bgcolor: '#fff',
        display: 'flex',
        alignItems: 'center',
        px: '24px',
        gap: '2px',
        flexShrink: 0,
      }}
    >
      {/* Workspace (non-clickable, links to switcher) */}
      <Typography sx={{ fontSize: 12, color: text.secondary, fontWeight: 600, pl: '6px' }}>
        Acme Corp
      </Typography>
      <Sep />

      <ScopeSegment label="Brand / Product" value={brand} options={BRANDS} onChange={setBrand} />
      <Sep />

      <ScopeSegment label="Region" value={region} options={REGIONS} onChange={setRegion} />
      <Sep />

      <Box sx={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
        <CalIcon sx={{ fontSize: 13, color: text.tertiary }} />
        <ScopeSegment label="Date range" value={dateRange} options={DATE_RANGES} onChange={setDateRange} />
      </Box>

      <Box sx={{ flex: 1 }} />

      <Typography sx={{ fontSize: 12, color: text.tertiary, fontWeight: 500 }}>
        Updated 2 min ago
      </Typography>
    </Box>
  );
}
