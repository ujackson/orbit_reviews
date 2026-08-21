/**
 * Connections — unified entry point for review sources, action destinations, and webhooks.
 * Replaces the previously separate Sources and Integrations views.
 */
import { useState } from 'react';
import {
  Box, Typography, Tabs, Tab, Divider, alpha, Chip, Button,
  IconButton, Tooltip, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, Select, MenuItem, FormControl,
  InputLabel,
} from '@mui/material';
import {
  Add as AddIcon, Sync as SyncIcon, Settings as SettingsIcon,
  CheckCircle as OkIcon, Error as ErrIcon, Schedule as DelayIcon,
  Warning as WarnIcon, Delete as DeleteIcon, Refresh as RefreshIcon,
  ContentCopy as CopyIcon, OpenInNew as ExtIcon,
} from '@mui/icons-material';
import { color, text, radius } from '../../shared/tokens/design-tokens';
import { toast } from 'sonner';

// ─── Types ────────────────────────────────────────────────────────────────────

type SyncStatus = 'healthy' | 'syncing' | 'delayed' | 'action_required' | 'disconnected';
type DestStatus = 'connected' | 'disconnected' | 'error';
type WebhookStatus = 'healthy' | 'failing' | 'inactive';

// ─── Review Sources data ──────────────────────────────────────────────────────

interface SourceAccount {
  id: string; name: string; status: SyncStatus;
  lastSync: string; latestReview: string;
  recordsSynced: number; syncFrequency: string; error?: string;
}
interface SourceProvider { id: string; name: string; category: string; accounts: SourceAccount[] }

const SOURCES: SourceProvider[] = [
  {
    id: 'google', name: 'Google Business Profile', category: 'Business reviews',
    accounts: [
      { id: 'g-us', name: 'US Retail Locations', status: 'healthy', lastSync: '1 min ago', latestReview: 'Jun 16, 2:31 PM', recordsSynced: 18420, syncFrequency: 'Real-time' },
      { id: 'g-ca', name: 'Canada Retail Locations', status: 'delayed', lastSync: '3h ago', latestReview: 'Jun 16, 9:14 AM', recordsSynced: 2140, syncFrequency: 'Every 30 min', error: 'API rate limit reached. Retrying in 22 min.' },
    ],
  },
  {
    id: 'appstore', name: 'Apple App Store', category: 'App reviews',
    accounts: [
      { id: 'as-mobile', name: 'Orbit Mobile', status: 'healthy', lastSync: '3 min ago', latestReview: 'Jun 16, 2:14 PM', recordsSynced: 11203, syncFrequency: 'Every 15 min' },
      { id: 'as-consumer', name: 'Orbit Consumer', status: 'action_required', lastSync: '48h ago', latestReview: 'Jun 14, 8:03 AM', recordsSynced: 4210, syncFrequency: 'Every 15 min', error: 'Authentication expired. Re-authenticate in App Store Connect.' },
    ],
  },
  {
    id: 'playstore', name: 'Google Play', category: 'App reviews',
    accounts: [
      { id: 'pl-main', name: 'Orbit Mobile (Android)', status: 'healthy', lastSync: '3 min ago', latestReview: 'Jun 16, 1:52 PM', recordsSynced: 8940, syncFrequency: 'Every 15 min' },
    ],
  },
  {
    id: 'g2', name: 'G2', category: 'SaaS reviews',
    accounts: [
      { id: 'g2-main', name: 'Orbit Reviews listing', status: 'healthy', lastSync: '5 min ago', latestReview: 'Jun 16, 12:18 PM', recordsSynced: 4210, syncFrequency: 'Every hour' },
    ],
  },
  {
    id: 'trustpilot', name: 'Trustpilot', category: 'SaaS reviews',
    accounts: [
      { id: 'tp-main', name: 'orbit.reviews', status: 'syncing', lastSync: 'Syncing now…', latestReview: 'Jun 16, 11:34 AM', recordsSynced: 3180, syncFrequency: 'Every hour' },
    ],
  },
];

const AVAILABLE_SOURCES = [
  'Capterra', 'Yelp', 'Tripadvisor', 'Amazon', 'Shopify', 'Yotpo', 'Bazaarvoice',
];

const statusMeta: Record<SyncStatus, { label: string; icon: React.ReactNode; color: string }> = {
  healthy:         { label: 'Healthy',         icon: <OkIcon sx={{ fontSize: 13, color: color.functional.success }} />,  color: color.functional.success },
  syncing:         { label: 'Syncing',          icon: <SyncIcon sx={{ fontSize: 13, color: color.functional.info }} />,   color: color.functional.info },
  delayed:         { label: 'Delayed',          icon: <DelayIcon sx={{ fontSize: 13, color: color.functional.warning }} />, color: color.functional.warning },
  action_required: { label: 'Action required',  icon: <WarnIcon sx={{ fontSize: 13, color: color.functional.error }} />,   color: color.functional.error },
  disconnected:    { label: 'Disconnected',     icon: <ErrIcon sx={{ fontSize: 13, color: text.tertiary }} />,             color: text.tertiary },
};

function SourceAccountRow({ account }: { account: SourceAccount }) {
  const sm = statusMeta[account.status];
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', px: '20px', py: '10px', gap: '12px', borderBottom: '1px solid rgba(0,0,0,0.05)', '&:hover': { bgcolor: 'rgba(0,0,0,0.02)' } }}>
      <Box sx={{ width: 20, flexShrink: 0 }} />
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography sx={{ fontSize: 12, fontWeight: 500, color: text.primary }}>{account.name}</Typography>
        {account.error && (
          <Typography sx={{ fontSize: 11, color: sm.color, mt: '2px', lineHeight: 1.4 }}>{account.error}</Typography>
        )}
      </Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: '5px', width: 140, flexShrink: 0 }}>
        {sm.icon}
        <Typography sx={{ fontSize: 11, fontWeight: 500, color: sm.color }}>{sm.label}</Typography>
      </Box>
      <Typography sx={{ fontSize: 11, color: text.tertiary, width: 110, flexShrink: 0 }}>{account.lastSync}</Typography>
      <Typography sx={{ fontSize: 11, color: text.tertiary, width: 160, flexShrink: 0 }}>{account.latestReview}</Typography>
      <Typography sx={{ fontSize: 12, fontWeight: 500, color: text.secondary, width: 80, flexShrink: 0, textAlign: 'right' }}>
        {account.recordsSynced.toLocaleString()}
      </Typography>
      <Typography sx={{ fontSize: 11, color: text.tertiary, width: 110, flexShrink: 0, textAlign: 'right' }}>{account.syncFrequency}</Typography>
      <Box sx={{ display: 'flex', gap: '2px', width: 70, flexShrink: 0, justifyContent: 'flex-end' }}>
        {account.status === 'action_required' ? (
          <Button size="small" onClick={() => toast.success('Redirecting to authentication…')}
            sx={{ fontSize: 10, height: 24, px: '8px', bgcolor: color.functional.error, color: '#fff', '&:hover': { bgcolor: '#B91C1C' } }}>
            Fix
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

function ReviewSourcesTab() {
  const [connectOpen, setConnectOpen] = useState(false);
  const [connectTarget, setConnectTarget] = useState('');
  const totalConnected = SOURCES.reduce((s, p) => s + p.accounts.length, 0);
  const actionRequired = SOURCES.flatMap(p => p.accounts).filter(a => a.status === 'action_required').length;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', flex: 1 }}>
      {/* Sub-header */}
      <Box sx={{ px: '24px', py: '10px', borderBottom: '1px solid rgba(0,0,0,0.07)', display: 'flex', alignItems: 'center', gap: '10px', bgcolor: '#F8F9FC', flexShrink: 0 }}>
        <Typography sx={{ fontSize: 12, color: text.secondary, flex: 1 }}>
          {totalConnected} connected accounts
          {actionRequired > 0 && <Box component="span" sx={{ color: color.functional.error, fontWeight: 600, ml: '8px' }}>· {actionRequired} need attention</Box>}
        </Typography>
        <Button size="small" variant="outlined" startIcon={<AddIcon sx={{ fontSize: 14 }} />}
          onClick={() => setConnectOpen(true)}
          sx={{ fontSize: 12, height: 30, px: '12px', borderColor: 'rgba(0,0,0,0.15)', color: text.secondary }}>
          Add source
        </Button>
      </Box>

      {/* Column headers */}
      <Box sx={{ display: 'flex', px: '20px', py: '7px', bgcolor: 'rgba(0,0,0,0.025)', borderBottom: '1px solid rgba(0,0,0,0.07)', flexShrink: 0, gap: '12px' }}>
        <Box sx={{ width: 20, flexShrink: 0 }} />
        {[
          { l: 'Account', flex: 1 }, { l: 'Status', w: 140 }, { l: 'Last sync', w: 110 },
          { l: 'Latest review', w: 160 }, { l: 'Records', w: 80, right: true },
          { l: 'Frequency', w: 110, right: true }, { l: '', w: 70 },
        ].map((col, i) => (
          <Typography key={i} sx={{ fontSize: 10, fontWeight: 600, color: text.tertiary, textTransform: 'uppercase', letterSpacing: '0.07em', flex: (col as any).flex, width: (col as any).w, flexShrink: (col as any).w ? 0 : undefined, textAlign: (col as any).right ? 'right' : 'left' }}>
            {col.l}
          </Typography>
        ))}
      </Box>

      {/* Provider groups */}
      <Box sx={{ flex: 1, overflow: 'auto', '&::-webkit-scrollbar': { width: 5 } }}>
        {SOURCES.map(provider => (
          <Box key={provider.id}>
            <Box sx={{ display: 'flex', alignItems: 'center', px: '20px', py: '8px', bgcolor: 'rgba(0,0,0,0.02)', borderBottom: '1px solid rgba(0,0,0,0.06)', borderTop: '1px solid rgba(0,0,0,0.04)', gap: '10px' }}>
              <Typography sx={{ fontSize: 12, fontWeight: 600, color: text.primary, flex: 1 }}>{provider.name}</Typography>
              <Chip size="small" label={provider.category}
                sx={{ height: 16, fontSize: 10, bgcolor: 'rgba(0,0,0,0.05)', color: text.tertiary, '& .MuiChip-label': { px: '6px' } }} />
              <Button size="small" onClick={() => toast.success(`New ${provider.name} account setup`)}
                startIcon={<AddIcon sx={{ fontSize: 12 }} />}
                sx={{ fontSize: 10, height: 24, px: '8px', color: text.secondary, border: '1px solid rgba(0,0,0,0.11)' }}>
                Add account
              </Button>
            </Box>
            {provider.accounts.map(account => <SourceAccountRow key={account.id} account={account} />)}
          </Box>
        ))}

        {/* Available */}
        <Box sx={{ px: '20px', py: '14px' }}>
          <Typography sx={{ fontSize: 11, fontWeight: 600, color: text.tertiary, textTransform: 'uppercase', letterSpacing: '0.07em', mb: '10px' }}>
            Available to connect
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {AVAILABLE_SOURCES.map(name => (
              <Box key={name} onClick={() => { setConnectTarget(name); setConnectOpen(true); }}
                sx={{ display: 'flex', alignItems: 'center', gap: '8px', px: '12px', py: '7px', border: '1px solid rgba(0,0,0,0.10)', borderRadius: '7px', cursor: 'pointer', bgcolor: 'rgba(0,0,0,0.02)', '&:hover': { bgcolor: 'rgba(0,0,0,0.04)', borderColor: 'rgba(0,0,0,0.18)' }, transition: 'all 0.1s' }}>
                <Typography sx={{ fontSize: 12, color: text.secondary }}>{name}</Typography>
              </Box>
            ))}
          </Box>
        </Box>
      </Box>

      {/* Connect dialog */}
      <Dialog open={connectOpen} onClose={() => { setConnectOpen(false); setConnectTarget(''); }} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: '10px' } }}>
        <DialogTitle sx={{ fontSize: 14, fontWeight: 700 }}>Connect {connectTarget || 'review source'}</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: '8px !important' }}>
          {!connectTarget && (
            <TextField label="Source" placeholder="e.g., Capterra" fullWidth size="small" onChange={e => setConnectTarget(e.target.value)} />
          )}
          <TextField label="API key" placeholder="Enter API credentials" fullWidth size="small" type="password" />
          <Box sx={{ px: '12px', py: '10px', bgcolor: 'rgba(0,0,0,0.03)', borderRadius: '7px', border: '1px solid rgba(0,0,0,0.08)' }}>
            <Typography sx={{ fontSize: 11, color: text.secondary, lineHeight: 1.6 }}>
              Orbit requests read-only access. Credentials are encrypted at rest and never used to write to source platforms.
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={() => { setConnectOpen(false); setConnectTarget(''); }} sx={{ color: text.secondary }}>Cancel</Button>
          <Button variant="contained" onClick={() => { toast.success(`${connectTarget} connected — importing reviews`); setConnectOpen(false); setConnectTarget(''); }}
            sx={{ bgcolor: color.functional.primary }}>Connect</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

// ─── Destinations tab ─────────────────────────────────────────────────────────

const DESTINATIONS = [
  { id: 'jira',   name: 'Jira',            category: 'Issue tracking', status: 'connected' as DestStatus,    last: '2h ago' },
  { id: 'slack',  name: 'Slack',           category: 'Notifications',  status: 'connected' as DestStatus,    last: '5 min ago' },
  { id: 'linear', name: 'Linear',          category: 'Issue tracking', status: 'disconnected' as DestStatus, last: '—' },
  { id: 'teams',  name: 'Microsoft Teams', category: 'Notifications',  status: 'disconnected' as DestStatus, last: '—' },
  { id: 'email',  name: 'Email (SMTP)',     category: 'Notifications',  status: 'connected' as DestStatus,    last: '12 min ago' },
  { id: 'zendesk',name: 'Zendesk',         category: 'Support',        status: 'disconnected' as DestStatus, last: '—' },
  { id: 'pager',  name: 'PagerDuty',       category: 'Incident',       status: 'disconnected' as DestStatus, last: '—' },
  { id: 'github', name: 'GitHub Issues',   category: 'Issue tracking', status: 'disconnected' as DestStatus, last: '—' },
];

function DestinationsTab() {
  return (
    <Box sx={{ flex: 1, overflow: 'auto', '&::-webkit-scrollbar': { width: 5 } }}>
      {/* Column headers */}
      <Box sx={{ display: 'flex', px: '20px', py: '7px', bgcolor: 'rgba(0,0,0,0.025)', borderBottom: '1px solid rgba(0,0,0,0.07)', position: 'sticky', top: 0, zIndex: 5 }}>
        {[
          { l: 'Destination', flex: 1 }, { l: 'Category', w: 140 },
          { l: 'Status', w: 130 }, { l: 'Last used', w: 110 }, { l: '', w: 80 },
        ].map((col, i) => (
          <Typography key={i} sx={{ fontSize: 10, fontWeight: 600, color: text.tertiary, textTransform: 'uppercase', letterSpacing: '0.07em', flex: (col as any).flex, width: (col as any).w, flexShrink: (col as any).w ? 0 : undefined }}>
            {col.l}
          </Typography>
        ))}
      </Box>

      {DESTINATIONS.map(dest => (
        <Box key={dest.id}
          sx={{ display: 'flex', alignItems: 'center', px: '20px', py: '11px', borderBottom: '1px solid rgba(0,0,0,0.05)', '&:hover': { bgcolor: 'rgba(0,0,0,0.02)' }, gap: '12px' }}>
          <Typography sx={{ fontSize: 13, fontWeight: 500, color: text.primary, flex: 1 }}>{dest.name}</Typography>
          <Typography sx={{ fontSize: 12, color: text.tertiary, width: 140, flexShrink: 0 }}>{dest.category}</Typography>
          <Box sx={{ width: 130, flexShrink: 0, display: 'flex', alignItems: 'center', gap: '5px' }}>
            {dest.status === 'connected'
              ? <OkIcon sx={{ fontSize: 13, color: color.functional.success }} />
              : dest.status === 'error'
              ? <WarnIcon sx={{ fontSize: 13, color: color.functional.error }} />
              : <Box sx={{ width: 7, height: 7, borderRadius: '50%', bgcolor: 'rgba(0,0,0,0.18)' }} />}
            <Typography sx={{ fontSize: 11, fontWeight: 500, color: dest.status === 'connected' ? color.functional.success : dest.status === 'error' ? color.functional.error : text.tertiary, textTransform: 'capitalize' }}>
              {dest.status === 'connected' ? 'Connected' : dest.status === 'error' ? 'Error' : 'Not connected'}
            </Typography>
          </Box>
          <Typography sx={{ fontSize: 11, color: text.tertiary, width: 110, flexShrink: 0 }}>{dest.last}</Typography>
          <Box sx={{ width: 80, flexShrink: 0, display: 'flex', justifyContent: 'flex-end', gap: '4px' }}>
            {dest.status === 'connected' ? (
              <>
                <Button size="small" onClick={() => toast.info(`${dest.name} settings`)}
                  sx={{ fontSize: 10, height: 24, px: '8px', color: text.secondary, border: '1px solid rgba(0,0,0,0.11)' }}>Settings</Button>
              </>
            ) : (
              <Button size="small" onClick={() => toast.success(`${dest.name} connection initiated`)}
                sx={{ fontSize: 10, height: 24, px: '8px', color: color.functional.primary, border: `1px solid ${color.functional.primary}` }}>Connect</Button>
            )}
          </Box>
        </Box>
      ))}

      <Box sx={{ px: '20px', py: '12px' }}>
        <Typography sx={{ fontSize: 11, color: text.tertiary }}>
          Destinations receive Orbit actions such as issue creation, notifications, and workflow triggers via Automations.
        </Typography>
      </Box>
    </Box>
  );
}

// ─── Webhooks tab ─────────────────────────────────────────────────────────────

const WEBHOOK_EVENTS = [
  { id: 'review.created', label: 'Review created' },
  { id: 'review.negative', label: 'Negative review' },
  { id: 'review.escalated', label: 'Review escalated' },
  { id: 'alert.triggered', label: 'Alert triggered' },
  { id: 'theme.spike', label: 'Theme spike' },
  { id: 'response.sent', label: 'Response sent' },
];

interface Webhook {
  id: string; name: string; url: string; events: string[];
  active: boolean; status: WebhookStatus;
  deliveries: number; lastDelivery: string; secret: string;
}

const INITIAL_WEBHOOKS: Webhook[] = [
  { id: 'wh1', name: 'CRM Sync', url: 'https://api.acme.com/webhooks/orbit', events: ['review.created', 'review.negative'], active: true, status: 'healthy', deliveries: 1842, lastDelivery: '2 min ago', secret: 'whsec_a1b2c3d4e5f6g7h8' },
  { id: 'wh2', name: 'Data Warehouse', url: 'https://hooks.acme-bi.io/orbit', events: ['review.created', 'theme.spike', 'alert.triggered'], active: true, status: 'healthy', deliveries: 4201, lastDelivery: '14 min ago', secret: 'whsec_z9y8x7w6v5u4t3s2' },
  { id: 'wh3', name: 'Notification Service', url: 'https://notify.internal.acme.com/orbit', events: ['review.negative', 'review.escalated'], active: false, status: 'inactive', deliveries: 312, lastDelivery: '3d ago', secret: 'whsec_m1n2o3p4q5r6s7t8' },
];

function WebhooksTab() {
  const [webhooks, setWebhooks] = useState(INITIAL_WEBHOOKS);
  const [addOpen, setAddOpen]   = useState(false);
  const [detail, setDetail]     = useState<Webhook | null>(null);
  const [secretVisible, setSecretVisible] = useState(false);
  const [newName, setNewName]   = useState('');
  const [newUrl, setNewUrl]     = useState('');
  const [selectedEvents, setSelectedEvents] = useState<string[]>(['review.created']);

  const toggleActive = (id: string) => {
    setWebhooks(prev => prev.map(w => w.id === id ? { ...w, active: !w.active, status: (!w.active ? 'healthy' : 'inactive') as WebhookStatus } : w));
    const wh = webhooks.find(w => w.id === id);
    toast.success(`${wh?.name} ${wh?.active ? 'paused' : 'enabled'}`);
  };

  const handleAdd = () => {
    if (!newName || !newUrl) { toast.error('Name and URL required'); return; }
    const secret = `whsec_${Math.random().toString(36).substring(2, 18)}`;
    setWebhooks(prev => [...prev, { id: `wh${Date.now()}`, name: newName, url: newUrl, events: selectedEvents, active: true, status: 'healthy', deliveries: 0, lastDelivery: 'Never', secret }]);
    toast.success('Webhook endpoint created');
    setAddOpen(false); setNewName(''); setNewUrl(''); setSelectedEvents(['review.created']);
  };

  return (
    <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Sub-header */}
      <Box sx={{ px: '24px', py: '10px', borderBottom: '1px solid rgba(0,0,0,0.07)', display: 'flex', alignItems: 'center', bgcolor: '#F8F9FC', flexShrink: 0 }}>
        <Typography sx={{ fontSize: 12, color: text.secondary, flex: 1 }}>
          Outbound webhooks signed with HMAC-SHA256 via <code style={{ fontFamily: 'monospace', fontSize: 11 }}>X-Orbit-Signature</code>
        </Typography>
        <Button size="small" variant="outlined" startIcon={<AddIcon sx={{ fontSize: 14 }} />}
          onClick={() => setAddOpen(true)}
          sx={{ fontSize: 12, height: 30, px: '12px', borderColor: 'rgba(0,0,0,0.15)', color: text.secondary }}>
          Add endpoint
        </Button>
      </Box>

      {/* Column headers */}
      <Box sx={{ display: 'flex', px: '20px', py: '7px', bgcolor: 'rgba(0,0,0,0.025)', borderBottom: '1px solid rgba(0,0,0,0.07)', flexShrink: 0, gap: '12px' }}>
        {[
          { l: 'Endpoint', flex: 2 }, { l: 'Status', w: 90 }, { l: 'Deliveries', w: 90 },
          { l: 'Last delivery', w: 110 }, { l: '', w: 120 },
        ].map((col, i) => (
          <Typography key={i} sx={{ fontSize: 10, fontWeight: 600, color: text.tertiary, textTransform: 'uppercase', letterSpacing: '0.07em', flex: (col as any).flex, width: (col as any).w, flexShrink: (col as any).w ? 0 : undefined }}>
            {col.l}
          </Typography>
        ))}
      </Box>

      {/* Webhook rows */}
      <Box sx={{ flex: 1, overflow: 'auto', '&::-webkit-scrollbar': { width: 5 } }}>
        {webhooks.map(wh => {
          const stColor = wh.status === 'healthy' ? color.functional.success : wh.status === 'failing' ? color.functional.error : text.tertiary;
          return (
            <Box key={wh.id} sx={{ display: 'flex', alignItems: 'center', px: '20px', py: '11px', borderBottom: '1px solid rgba(0,0,0,0.05)', gap: '12px', '&:hover': { bgcolor: 'rgba(0,0,0,0.02)' }, opacity: wh.active ? 1 : 0.55 }}>
              <Box sx={{ flex: 2, minWidth: 0 }}>
                <Typography sx={{ fontSize: 13, fontWeight: 600, color: text.primary, mb: '2px' }}>{wh.name}</Typography>
                <Typography sx={{ fontSize: 11, fontFamily: 'monospace', color: text.tertiary }} noWrap>{wh.url}</Typography>
                <Box sx={{ display: 'flex', gap: '4px', mt: '4px', flexWrap: 'wrap' }}>
                  {wh.events.map(ev => (
                    <Chip key={ev} size="small" label={ev}
                      sx={{ height: 16, fontSize: 10, fontFamily: 'monospace', bgcolor: 'rgba(0,0,0,0.04)', color: text.tertiary, '& .MuiChip-label': { px: '5px' } }} />
                  ))}
                </Box>
              </Box>
              <Box sx={{ width: 90, flexShrink: 0 }}>
                <Typography sx={{ fontSize: 11, fontWeight: 600, color: stColor, textTransform: 'capitalize' }}>{wh.status}</Typography>
              </Box>
              <Typography sx={{ fontSize: 12, fontWeight: 500, color: text.secondary, width: 90, flexShrink: 0 }}>{wh.deliveries.toLocaleString()}</Typography>
              <Typography sx={{ fontSize: 11, color: text.tertiary, width: 110, flexShrink: 0 }}>{wh.lastDelivery}</Typography>
              <Box sx={{ width: 120, flexShrink: 0, display: 'flex', gap: '4px', justifyContent: 'flex-end', alignItems: 'center' }}>
                <Button size="small" onClick={() => setDetail(wh)}
                  sx={{ fontSize: 10, height: 24, px: '8px', color: color.functional.primary }}>Details</Button>
                <Button size="small" onClick={() => toggleActive(wh.id)}
                  sx={{ fontSize: 10, height: 24, px: '8px', color: text.tertiary, border: '1px solid rgba(0,0,0,0.10)' }}>
                  {wh.active ? 'Pause' : 'Enable'}
                </Button>
                <Tooltip title="Delete">
                  <IconButton size="small" onClick={() => { setWebhooks(prev => prev.filter(w => w.id !== wh.id)); toast.success(`${wh.name} deleted`); }} sx={{ color: text.tertiary }}>
                    <DeleteIcon sx={{ fontSize: 14 }} />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>
          );
        })}
        {webhooks.length === 0 && (
          <Box sx={{ py: 6, textAlign: 'center' }}>
            <Typography sx={{ fontSize: 13, color: text.tertiary }}>No webhook endpoints configured</Typography>
          </Box>
        )}
      </Box>

      {/* Add endpoint dialog */}
      <Dialog open={addOpen} onClose={() => setAddOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: '10px' } }}>
        <DialogTitle sx={{ fontSize: 14, fontWeight: 700 }}>Add webhook endpoint</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: '8px !important' }}>
          <TextField label="Name" placeholder="e.g., CRM Sync" value={newName} onChange={e => setNewName(e.target.value)} fullWidth size="small" />
          <TextField label="Payload URL" placeholder="https://api.example.com/webhooks" value={newUrl} onChange={e => setNewUrl(e.target.value)} fullWidth size="small" helperText="HTTPS endpoints only" />
          <Box>
            <Typography sx={{ fontSize: 12, fontWeight: 600, color: text.secondary, mb: '8px' }}>Events</Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {WEBHOOK_EVENTS.map(ev => {
                const checked = selectedEvents.includes(ev.id);
                return (
                  <Box key={ev.id} onClick={() => setSelectedEvents(prev => checked ? prev.filter(e => e !== ev.id) : [...prev, ev.id])}
                    sx={{ display: 'flex', alignItems: 'center', gap: '10px', px: '12px', py: '7px', borderRadius: '6px', cursor: 'pointer', border: `1px solid ${checked ? 'rgba(94,106,210,0.25)' : 'rgba(0,0,0,0.08)'}`, bgcolor: checked ? 'rgba(94,106,210,0.04)' : 'transparent', '&:hover': { borderColor: 'rgba(94,106,210,0.20)' } }}>
                    <Box sx={{ width: 14, height: 14, borderRadius: '3px', border: `2px solid ${checked ? color.functional.primary : 'rgba(0,0,0,0.20)'}`, bgcolor: checked ? color.functional.primary : 'transparent', flexShrink: 0 }} />
                    <Typography sx={{ fontSize: 12, fontFamily: 'monospace', color: text.secondary }}>{ev.id}</Typography>
                    <Typography sx={{ fontSize: 12, color: text.tertiary, flex: 1 }}>{ev.label}</Typography>
                  </Box>
                );
              })}
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={() => setAddOpen(false)} sx={{ color: text.secondary }}>Cancel</Button>
          <Button variant="contained" onClick={handleAdd} sx={{ bgcolor: color.functional.primary }}>Create endpoint</Button>
        </DialogActions>
      </Dialog>

      {/* Detail dialog */}
      {detail && (
        <Dialog open={!!detail} onClose={() => { setDetail(null); setSecretVisible(false); }} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: '10px' } }}>
          <DialogTitle sx={{ fontSize: 14, fontWeight: 700 }}>{detail.name}</DialogTitle>
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: '8px !important' }}>
            <Box>
              <Typography sx={{ fontSize: 11, fontWeight: 600, color: text.tertiary, textTransform: 'uppercase', letterSpacing: '0.06em', mb: '6px' }}>Payload URL</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px', px: '12px', py: '8px', bgcolor: 'rgba(0,0,0,0.03)', borderRadius: '7px', border: '1px solid rgba(0,0,0,0.08)' }}>
                <Typography sx={{ fontSize: 12, fontFamily: 'monospace', color: text.primary, flex: 1, wordBreak: 'break-all' }}>{detail.url}</Typography>
                <Tooltip title="Copy">
                  <IconButton size="small" onClick={() => { navigator.clipboard.writeText(detail.url); toast.success('Copied'); }}>
                    <CopyIcon sx={{ fontSize: 14 }} />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>
            <Box>
              <Typography sx={{ fontSize: 11, fontWeight: 600, color: text.tertiary, textTransform: 'uppercase', letterSpacing: '0.06em', mb: '6px' }}>Signing secret</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px', px: '12px', py: '8px', bgcolor: 'rgba(0,0,0,0.03)', borderRadius: '7px', border: '1px solid rgba(0,0,0,0.08)' }}>
                <Typography sx={{ fontSize: 12, fontFamily: 'monospace', color: text.primary, flex: 1 }}>
                  {secretVisible ? detail.secret : detail.secret.substring(0, 8) + '••••••••••••'}
                </Typography>
                <Button size="small" onClick={() => setSecretVisible(!secretVisible)} sx={{ fontSize: 10, color: text.tertiary, minWidth: 0, px: '6px' }}>
                  {secretVisible ? 'Hide' : 'Reveal'}
                </Button>
                <Tooltip title="Copy">
                  <IconButton size="small" onClick={() => { navigator.clipboard.writeText(detail.secret); toast.success('Secret copied'); }}>
                    <CopyIcon sx={{ fontSize: 14 }} />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>
            <Box sx={{ display: 'flex', gap: '24px' }}>
              <Box>
                <Typography sx={{ fontSize: 20, fontWeight: 600, color: text.primary, lineHeight: 1 }}>{detail.deliveries.toLocaleString()}</Typography>
                <Typography sx={{ fontSize: 10, color: text.tertiary }}>total deliveries</Typography>
              </Box>
              <Box>
                <Typography sx={{ fontSize: 14, fontWeight: 600, color: text.primary }}>{detail.lastDelivery}</Typography>
                <Typography sx={{ fontSize: 10, color: text.tertiary }}>last delivery</Typography>
              </Box>
            </Box>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
            <Button onClick={() => toast.success('Test payload sent')} sx={{ color: text.secondary }}>Send test</Button>
            <Box sx={{ flex: 1 }} />
            <Button onClick={() => { setDetail(null); setSecretVisible(false); }} sx={{ color: text.secondary }}>Close</Button>
          </DialogActions>
        </Dialog>
      )}
    </Box>
  );
}

// ─── Main view ────────────────────────────────────────────────────────────────

export const ConnectionsView = () => {
  const [tab, setTab] = useState(0);

  const actionRequired = SOURCES.flatMap(p => p.accounts).filter(a => a.status === 'action_required').length;

  return (
    <Box sx={{ flex: 1, height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden', bgcolor: '#fff' }}>
      {/* Header */}
      <Box sx={{ px: '24px', py: '12px', borderBottom: '1px solid rgba(0,0,0,0.07)', flexShrink: 0 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Typography sx={{ fontSize: 14, fontWeight: 600, color: text.primary, letterSpacing: '-0.01em' }}>Integrations</Typography>
          {actionRequired > 0 && (
            <Chip size="small" label={`${actionRequired} need attention`}
              sx={{ height: 16, fontSize: 10, fontWeight: 600, bgcolor: 'rgba(220,38,38,0.09)', color: color.functional.error, '& .MuiChip-label': { px: '6px' } }} />
          )}
        </Box>
        <Typography sx={{ fontSize: 11, color: text.tertiary }}>Review sources, action destinations, and webhook endpoints</Typography>
      </Box>

      {/* Tabs */}
      <Tabs value={tab} onChange={(_, v) => setTab(v)}
        sx={{ px: '24px', borderBottom: '1px solid rgba(0,0,0,0.07)', flexShrink: 0, bgcolor: '#fff',
          '& .MuiTab-root': { minHeight: 40, py: 0, fontSize: 13, px: '4px', mr: '16px', fontWeight: 500 },
          '& .MuiTabs-indicator': { height: 2 } }}>
        <Tab label="Review sources" />
        <Tab label="Destinations" />
        <Tab label="Webhooks" />
      </Tabs>

      {/* Content */}
      {tab === 0 && <ReviewSourcesTab />}
      {tab === 1 && <DestinationsTab />}
      {tab === 2 && <WebhooksTab />}
    </Box>
  );
};
