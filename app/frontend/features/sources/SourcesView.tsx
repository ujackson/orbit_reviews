import { useState } from 'react';
import {
  Box, Typography, Divider, alpha, Chip, Button, IconButton, Tooltip,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField,
} from '@mui/material';
import {
  Add as AddIcon, Sync as SyncIcon, Settings as SettingsIcon,
  Warning as WarnIcon, CheckCircle as OkIcon, Error as ErrIcon,
  Schedule as DelayIcon,
} from '@mui/icons-material';
import { color, text, radius } from '../../shared/tokens/design-tokens';
import { toast } from 'sonner';

type SyncStatus = 'healthy' | 'syncing' | 'delayed' | 'action_required' | 'disconnected';

interface SourceAccount {
  id: string;
  name: string;
  status: SyncStatus;
  lastSync: string;
  latestReview: string;
  recordsSynced: number;
  syncFrequency: string;
  error?: string;
  rateLimited?: boolean;
}

interface SourceProvider {
  id: string;
  name: string;
  category: string;
  accounts: SourceAccount[];
}

const PROVIDERS: SourceProvider[] = [
  {
    id: 'google', name: 'Google Business Profile', category: 'Business Reviews',
    accounts: [
      { id: 'g-us', name: 'US Retail Locations', status: 'healthy', lastSync: '1 min ago', latestReview: 'Jun 16, 2:31 PM', recordsSynced: 18420, syncFrequency: 'Real-time' },
      { id: 'g-ca', name: 'Canada Retail Locations', status: 'delayed', lastSync: '3h ago', latestReview: 'Jun 16, 9:14 AM', recordsSynced: 2140, syncFrequency: 'Every 30 min', error: 'Sync delayed — API rate limit reached. Retrying in 22 min.' },
    ],
  },
  {
    id: 'appstore', name: 'Apple App Store', category: 'App Reviews',
    accounts: [
      { id: 'as-mobile', name: 'Orbit Mobile', status: 'healthy', lastSync: '3 min ago', latestReview: 'Jun 16, 2:14 PM', recordsSynced: 11203, syncFrequency: 'Every 15 min' },
      { id: 'as-consumer', name: 'Orbit Consumer', status: 'action_required', lastSync: '48h ago', latestReview: 'Jun 14, 8:03 AM', recordsSynced: 4210, syncFrequency: 'Every 15 min', error: 'Authentication expired. Re-authenticate in App Store Connect to resume.' },
    ],
  },
  {
    id: 'playstore', name: 'Google Play', category: 'App Reviews',
    accounts: [
      { id: 'pl-mobile', name: 'Orbit Mobile (Android)', status: 'healthy', lastSync: '3 min ago', latestReview: 'Jun 16, 1:52 PM', recordsSynced: 8940, syncFrequency: 'Every 15 min' },
    ],
  },
  {
    id: 'g2', name: 'G2', category: 'SaaS Reviews',
    accounts: [
      { id: 'g2-main', name: 'Orbit Reviews', status: 'healthy', lastSync: '5 min ago', latestReview: 'Jun 16, 12:18 PM', recordsSynced: 4210, syncFrequency: 'Every hour' },
    ],
  },
  {
    id: 'trustpilot', name: 'Trustpilot', category: 'SaaS Reviews',
    accounts: [
      { id: 'tp-main', name: 'orbit.reviews', status: 'syncing', lastSync: 'Syncing now…', latestReview: 'Jun 16, 11:34 AM', recordsSynced: 3180, syncFrequency: 'Every hour' },
    ],
  },
];

const AVAILABLE = [
  { name: 'Capterra', category: 'SaaS Reviews' },
  { name: 'Yelp', category: 'Business Reviews' },
  { name: 'Tripadvisor', category: 'Business Reviews' },
  { name: 'Amazon', category: 'Ecommerce' },
  { name: 'Shopify', category: 'Ecommerce' },
  { name: 'Yotpo', category: 'Ecommerce' },
  { name: 'Bazaarvoice', category: 'Ecommerce' },
];

const statusMeta: Record<SyncStatus, { label: string; icon: React.ReactNode; color: string }> = {
  healthy:         { label: 'Healthy',         icon: <OkIcon sx={{ fontSize: 13, color: color.functional.success }} />, color: color.functional.success },
  syncing:         { label: 'Syncing',         icon: <SyncIcon sx={{ fontSize: 13, color: color.functional.info }} />, color: color.functional.info },
  delayed:         { label: 'Delayed',         icon: <DelayIcon sx={{ fontSize: 13, color: color.functional.warning }} />, color: color.functional.warning },
  action_required: { label: 'Action required', icon: <WarnIcon sx={{ fontSize: 13, color: color.functional.error }} />, color: color.functional.error },
  disconnected:    { label: 'Disconnected',    icon: <ErrIcon sx={{ fontSize: 13, color: text.tertiary }} />, color: text.tertiary },
};

function AccountRow({ account }: { account: SourceAccount }) {
  const sm = statusMeta[account.status];
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', px: '20px', py: '10px', borderBottom: '1px solid rgba(0,0,0,0.05)', gap: '12px', '&:hover': { bgcolor: 'rgba(0,0,0,0.02)' } }}>
      <Box sx={{ width: 24, flexShrink: 0 }} /> {/* indent */}
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography sx={{ fontSize: 12, fontWeight: 500, color: text.primary }}>{account.name}</Typography>
        {account.error && (
          <Typography sx={{ fontSize: 11, color: account.status === 'action_required' ? color.functional.error : color.functional.warning, mt: '2px', lineHeight: 1.4 }}>
            {account.error}
          </Typography>
        )}
        {account.rateLimited && <Typography sx={{ fontSize: 11, color: color.functional.warning }}>Rate limited</Typography>}
      </Box>
      {/* Status */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: '5px', width: 140, flexShrink: 0 }}>
        {sm.icon}
        <Typography sx={{ fontSize: 11, fontWeight: 500, color: sm.color }}>{sm.label}</Typography>
      </Box>
      {/* Last sync */}
      <Typography sx={{ fontSize: 11, color: text.tertiary, width: 120, flexShrink: 0 }}>{account.lastSync}</Typography>
      {/* Latest review */}
      <Typography sx={{ fontSize: 11, color: text.tertiary, width: 160, flexShrink: 0 }}>{account.latestReview}</Typography>
      {/* Records */}
      <Typography sx={{ fontSize: 12, fontWeight: 500, color: text.secondary, width: 90, flexShrink: 0, textAlign: 'right' }}>
        {account.recordsSynced.toLocaleString()}
      </Typography>
      {/* Frequency */}
      <Typography sx={{ fontSize: 11, color: text.tertiary, width: 110, flexShrink: 0, textAlign: 'right' }}>{account.syncFrequency}</Typography>
      {/* Actions */}
      <Box sx={{ display: 'flex', gap: '2px', flexShrink: 0 }}>
        {account.status === 'action_required' ? (
          <Button size="small" variant="contained"
            onClick={() => toast.success('Redirecting to authentication…')}
            sx={{ fontSize: 10, height: 24, px: '8px', bgcolor: color.functional.error, '&:hover': { bgcolor: '#B91C1C' } }}>
            Fix now
          </Button>
        ) : (
          <Tooltip title="Force sync">
            <IconButton size="small" onClick={() => toast.success('Sync triggered')} sx={{ color: text.tertiary }}>
              <SyncIcon sx={{ fontSize: 14 }} />
            </IconButton>
          </Tooltip>
        )}
        <Tooltip title="Settings">
          <IconButton size="small" onClick={() => toast.info('Source settings')} sx={{ color: text.tertiary }}>
            <SettingsIcon sx={{ fontSize: 14 }} />
          </IconButton>
        </Tooltip>
      </Box>
    </Box>
  );
}

function ProviderSection({ provider }: { provider: SourceProvider }) {
  return (
    <Box sx={{ mb: '1px' }}>
      {/* Provider header */}
      <Box sx={{ display: 'flex', alignItems: 'center', px: '20px', py: '9px', bgcolor: 'rgba(0,0,0,0.02)', borderBottom: '1px solid rgba(0,0,0,0.06)', borderTop: '1px solid rgba(0,0,0,0.04)', gap: '12px' }}>
        <Typography sx={{ fontSize: 12, fontWeight: 700, color: text.primary, flex: 1 }}>{provider.name}</Typography>
        <Chip size="small" label={provider.category}
          sx={{ height: 16, fontSize: 10, bgcolor: 'rgba(0,0,0,0.05)', color: text.tertiary, '& .MuiChip-label': { px: '6px' } }} />
        <Button size="small" onClick={() => toast.success(`New ${provider.name} account setup`)}
          startIcon={<AddIcon sx={{ fontSize: 13 }} />}
          sx={{ fontSize: 10, height: 24, px: '8px', color: text.secondary, border: '1px solid rgba(0,0,0,0.12)' }}>
          Add account
        </Button>
      </Box>
      {/* Accounts */}
      {provider.accounts.map(account => <AccountRow key={account.id} account={account} />)}
    </Box>
  );
}

export const SourcesView = () => {
  const [connectOpen, setConnectOpen] = useState(false);
  const [connectTarget, setConnectTarget] = useState('');

  const totalConnected = PROVIDERS.reduce((s, p) => s + p.accounts.length, 0);
  const actionRequired = PROVIDERS.flatMap(p => p.accounts).filter(a => a.status === 'action_required' || a.status === 'disconnected').length;

  return (
    <Box sx={{ flex: 1, height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden', bgcolor: '#fff' }}>
      {/* Header */}
      <Box sx={{ px: '24px', py: '12px', borderBottom: '1px solid rgba(0,0,0,0.07)', display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
        <Box sx={{ flex: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Typography sx={{ fontSize: 14, fontWeight: 700, color: text.primary, letterSpacing: '-0.01em' }}>Sources</Typography>
            {actionRequired > 0 && (
              <Chip size="small" label={`${actionRequired} need attention`}
                sx={{ height: 16, fontSize: 10, fontWeight: 700, bgcolor: alpha(color.functional.error, 0.09), color: color.functional.error, '& .MuiChip-label': { px: '6px' } }} />
            )}
          </Box>
          <Typography sx={{ fontSize: 11, color: text.tertiary }}>
            {totalConnected} connected accounts · {AVAILABLE.length} available to connect
          </Typography>
        </Box>
        <Button size="small" variant="outlined" startIcon={<AddIcon sx={{ fontSize: 14 }} />}
          onClick={() => setConnectOpen(true)}
          sx={{ fontSize: 12, height: 30, px: '12px', borderColor: 'rgba(0,0,0,0.15)', color: text.secondary }}>
          Connect source
        </Button>
      </Box>

      {/* Column headers */}
      <Box sx={{ display: 'flex', alignItems: 'center', px: '20px', py: '7px', bgcolor: 'rgba(0,0,0,0.025)', borderBottom: '1px solid rgba(0,0,0,0.07)', flexShrink: 0, gap: '12px' }}>
        <Box sx={{ width: 24, flexShrink: 0 }} />
        <Typography sx={{ fontSize: 10, fontWeight: 700, color: text.tertiary, textTransform: 'uppercase', letterSpacing: '0.07em', flex: 1 }}>Account</Typography>
        <Typography sx={{ fontSize: 10, fontWeight: 700, color: text.tertiary, textTransform: 'uppercase', letterSpacing: '0.07em', width: 140, flexShrink: 0 }}>Status</Typography>
        <Typography sx={{ fontSize: 10, fontWeight: 700, color: text.tertiary, textTransform: 'uppercase', letterSpacing: '0.07em', width: 120, flexShrink: 0 }}>Last sync</Typography>
        <Typography sx={{ fontSize: 10, fontWeight: 700, color: text.tertiary, textTransform: 'uppercase', letterSpacing: '0.07em', width: 160, flexShrink: 0 }}>Latest review</Typography>
        <Typography sx={{ fontSize: 10, fontWeight: 700, color: text.tertiary, textTransform: 'uppercase', letterSpacing: '0.07em', width: 90, flexShrink: 0, textAlign: 'right' }}>Records</Typography>
        <Typography sx={{ fontSize: 10, fontWeight: 700, color: text.tertiary, textTransform: 'uppercase', letterSpacing: '0.07em', width: 110, flexShrink: 0, textAlign: 'right' }}>Frequency</Typography>
        <Box sx={{ width: 60, flexShrink: 0 }} />
      </Box>

      {/* Provider list */}
      <Box sx={{ flex: 1, overflow: 'auto', '&::-webkit-scrollbar': { width: 5 } }}>
        {PROVIDERS.map(p => <ProviderSection key={p.id} provider={p} />)}

        {/* Available section */}
        <Box sx={{ px: '20px', py: '12px', borderTop: '1px solid rgba(0,0,0,0.07)', mt: '4px' }}>
          <Typography sx={{ fontSize: 11, fontWeight: 700, color: text.tertiary, textTransform: 'uppercase', letterSpacing: '0.07em', mb: '10px' }}>
            Available to connect
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {AVAILABLE.map(src => (
              <Box key={src.name}
                onClick={() => { setConnectTarget(src.name); setConnectOpen(true); }}
                sx={{ display: 'flex', alignItems: 'center', gap: '8px', px: '12px', py: '7px', border: '1px solid rgba(0,0,0,0.10)', borderRadius: '7px', cursor: 'pointer', bgcolor: 'rgba(0,0,0,0.02)', '&:hover': { bgcolor: 'rgba(0,0,0,0.04)', borderColor: 'rgba(0,0,0,0.18)' }, transition: 'all 0.1s' }}>
                <Typography sx={{ fontSize: 12, color: text.secondary }}>{src.name}</Typography>
                <Chip size="small" label={src.category} sx={{ height: 14, fontSize: 9, bgcolor: 'transparent', border: '1px solid rgba(0,0,0,0.10)', color: text.tertiary, '& .MuiChip-label': { px: '5px' } }} />
              </Box>
            ))}
          </Box>
        </Box>
      </Box>

      {/* Connect dialog */}
      <Dialog open={connectOpen} onClose={() => setConnectOpen(false)} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: '10px' } }}>
        <DialogTitle sx={{ fontSize: 14, fontWeight: 700 }}>Connect {connectTarget || 'source'}</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: '8px !important' }}>
          {!connectTarget && (
            <TextField label="Source name" placeholder="e.g., Capterra" fullWidth size="small" onChange={e => setConnectTarget(e.target.value)} />
          )}
          <TextField label="API key or credential" placeholder="Enter credentials" fullWidth size="small" type="password" />
          <Box sx={{ px: '12px', py: '10px', bgcolor: 'rgba(0,0,0,0.03)', borderRadius: '7px', border: '1px solid rgba(0,0,0,0.08)' }}>
            <Typography sx={{ fontSize: 11, color: text.secondary, lineHeight: 1.6 }}>
              Credentials are encrypted at rest. Orbit requests read-only access and never writes to source platforms.
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={() => setConnectOpen(false)} sx={{ color: text.secondary }}>Cancel</Button>
          <Button variant="contained" onClick={() => { toast.success(`${connectTarget} connected — syncing reviews`); setConnectOpen(false); setConnectTarget(''); }}
            sx={{ bgcolor: color.functional.primary, '&:hover': { bgcolor: color.functional.primaryHover } }}>
            Connect
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
