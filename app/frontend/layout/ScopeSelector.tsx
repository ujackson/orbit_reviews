import { useState } from 'react';
import { Box, Typography, Menu, MenuItem, Divider, alpha } from '@mui/material';
import { ExpandMore as ChevronIcon, CalendarToday as CalIcon } from '@mui/icons-material';
import { color, text, transition } from '../shared/tokens/design-tokens';

interface ScopeOption { label: string; value: string }

const SCOPES: ScopeOption[] = [
  { label: 'All scopes', value: 'all' },
  { label: 'Downtown Location', value: 'downtown' },
  { label: 'Online Experience', value: 'digital' },
  { label: 'Customer Support', value: 'support' },
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
          px: '6px', py: '3px', borderRadius: '5px', cursor: 'pointer',
          transition: `background ${transition.duration.fast}`,
          '&:hover': { bgcolor: alpha(color.neutral[900], 0.06) },
        }}
      >
        <Typography sx={{ fontSize: 12, color: text.secondary, fontWeight: 400 }}>
          {current}
        </Typography>
        <ChevronIcon sx={{ fontSize: 13, color: text.tertiary }} />
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
  const [scope, setScope] = useState('all');
  const [region, setRegion] = useState('all');
  const [dateRange, setDateRange] = useState('30d');

  return (
    <Box
      sx={{
        height: 36,
        borderBottom: '1px solid #E7E9EE',
        bgcolor: '#FFFFFF',
        display: 'flex',
        alignItems: 'center',
        px: '24px',
        gap: '2px',
        flexShrink: 0,
      }}
    >
      <Typography sx={{ fontSize: 12, color: text.tertiary, fontWeight: 500, pl: '6px' }}>
        Northstar Group
      </Typography>
      <Sep />

      <ScopeSegment label="Business scope" value={scope} options={SCOPES} onChange={setScope} />
      <Sep />

      <ScopeSegment label="Region" value={region} options={REGIONS} onChange={setRegion} />
      <Sep />

      <Box sx={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
        <CalIcon sx={{ fontSize: 12, color: text.tertiary }} />
        <ScopeSegment label="Date range" value={dateRange} options={DATE_RANGES} onChange={setDateRange} />
      </Box>

      <Box sx={{ flex: 1 }} />

      <Typography sx={{ fontSize: 11, color: text.tertiary }}>
        Updated 2 min ago
      </Typography>
    </Box>
  );
}
