import { useState } from 'react';
import {
  Box, Typography, Paper, Chip, Button, Divider, alpha,
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, FormControl, InputLabel, Select, MenuItem,
  IconButton, Tooltip, Switch, FormGroup, FormControlLabel,
  Tab, Tabs,
} from '@mui/material';
import {
  CheckCircle as ConnectedIcon, Add as AddIcon, Delete as DeleteIcon,
  Webhook as WebhookIcon, ContentCopy as CopyIcon, Refresh as RefreshIcon,
  OpenInNew as DocsIcon, Warning as WarnIcon,
} from '@mui/icons-material';
import { color, text, radius, elevation } from '../../shared/tokens/design-tokens';
import { toast } from 'sonner';

// ─── Integrations catalog ──────────────────────────────────────────────────────

const CATEGORIES_DATA = [
  {
    label: 'App Reviews',
    sources: [
      { name: 'Apple App Store', connected: true, reviews: 11203, color: '#555' },
      { name: 'Google Play', connected: true, reviews: 8940, color: '#3DDC84' },
    ],
  },
  {
    label: 'Business Reviews',
    sources: [
      { name: 'Google Business Profile', connected: true, reviews: 18420, color: '#4285F4' },
      { name: 'Yelp', connected: true, reviews: 2140, color: '#D32323' },
      { name: 'Tripadvisor', connected: false, reviews: 0, color: '#00AF87' },
    ],
  },
  {
    label: 'SaaS Reviews',
    sources: [
      { name: 'G2', connected: true, reviews: 4210, color: '#FF492C' },
      { name: 'Capterra', connected: true, reviews: 1240, color: '#FF9500' },
      { name: 'Trustpilot', connected: true, reviews: 3180, color: '#00B67A' },
    ],
  },
  {
    label: 'Ecommerce',
    sources: [
      { name: 'Shopify', connected: false, reviews: 0, color: '#96BF48' },
      { name: 'Amazon', connected: false, reviews: 0, color: '#FF9900' },
      { name: 'Yotpo', connected: false, reviews: 0, color: '#E24B4B' },
      { name: 'Bazaarvoice', connected: false, reviews: 0, color: '#004C97' },
    ],
  },
  {
    label: 'Support Platforms',
    sources: [
      { name: 'Zendesk', connected: false, reviews: 0, color: '#03363D' },
      { name: 'Intercom', connected: false, reviews: 0, color: '#1F8EED' },
      { name: 'HubSpot', connected: false, reviews: 0, color: '#FF7A59' },
    ],
  },
  {
    label: 'Action Integrations',
    sources: [
      { name: 'Slack', connected: true, reviews: 0, color: '#7D5AC9' },
      { name: 'Jira', connected: true, reviews: 0, color: '#0052CC' },
      { name: 'Linear', connected: false, reviews: 0, color: '#5E6AD2' },
      { name: 'Microsoft Teams', connected: false, reviews: 0, color: '#6264A7' },
      { name: 'PagerDuty', connected: false, reviews: 0, color: '#06AC38' },
    ],
  },
];

// ─── Webhook types ─────────────────────────────────────────────────────────────

const WEBHOOK_EVENTS = [
  { id: 'review.created', label: 'Review created', desc: 'New review received from any source' },
  { id: 'review.negative', label: 'Negative review', desc: '1–2 star review received' },
  { id: 'review.escalated', label: 'Review escalated', desc: 'Review manually escalated by team' },
  { id: 'alert.triggered', label: 'Alert triggered', desc: 'Anomaly or spike detected' },
  { id: 'theme.spike', label: 'Theme spike', desc: 'Theme volume increased >20% in 24h' },
  { id: 'response.sent', label: 'Response sent', desc: 'Reply sent to a review' },
];

interface Webhook {
  id: string;
  name: string;
  url: string;
  events: string[];
  active: boolean;
  secret: string;
  deliveries: number;
  lastDelivery: string;
  status: 'healthy' | 'failing' | 'inactive';
}

const INITIAL_WEBHOOKS: Webhook[] = [
  {
    id: 'wh1', name: 'CRM Sync', url: 'https://api.acme.com/webhooks/orbit',
    events: ['review.created', 'review.negative'], active: true,
    secret: 'whsec_a1b2c3d4e5f6g7h8', deliveries: 1842, lastDelivery: '2 min ago', status: 'healthy',
  },
  {
    id: 'wh2', name: 'Data Warehouse', url: 'https://hooks.acme-bi.io/orbit-reviews',
    events: ['review.created', 'theme.spike', 'alert.triggered'], active: true,
    secret: 'whsec_z9y8x7w6v5u4t3s2', deliveries: 4201, lastDelivery: '14 min ago', status: 'healthy',
  },
  {
    id: 'wh3', name: 'Notification Service', url: 'https://notify.internal.acme.com/orbit',
    events: ['review.negative', 'review.escalated'], active: false,
    secret: 'whsec_m1n2o3p4q5r6s7t8', deliveries: 312, lastDelivery: '3 days ago', status: 'inactive',
  },
];

// ─── Add Webhook Dialog ────────────────────────────────────────────────────────

function AddWebhookDialog({ open, onClose, onAdd }: { open: boolean; onClose: () => void; onAdd: (wh: Webhook) => void }) {
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [selectedEvents, setSelectedEvents] = useState<string[]>(['review.created']);
  const [urlError, setUrlError] = useState('');

  const toggleEvent = (id: string) => {
    setSelectedEvents(prev => prev.includes(id) ? prev.filter(e => e !== id) : [...prev, id]);
  };

  const validate = () => {
    try { new URL(url); setUrlError(''); return true; } catch { setUrlError('Must be a valid HTTPS URL'); return false; }
  };

  const handleSubmit = () => {
    if (!name.trim() || !url.trim()) { toast.error('Name and URL are required'); return; }
    if (!validate()) return;
    if (selectedEvents.length === 0) { toast.error('Select at least one event'); return; }
    const secret = `whsec_${Math.random().toString(36).substring(2, 18)}`;
    onAdd({ id: `wh${Date.now()}`, name, url, events: selectedEvents, active: true, secret, deliveries: 0, lastDelivery: 'Never', status: 'healthy' });
    toast.success('Webhook endpoint created');
    setName(''); setUrl(''); setSelectedEvents(['review.created']);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: radius.lg } }}>
      <DialogTitle sx={{ fontSize: 15, fontWeight: 700, color: text.primary, pb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <WebhookIcon sx={{ fontSize: 18, color: color.functional.primary }} />
          Add Webhook Endpoint
        </Box>
      </DialogTitle>
      <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: '8px !important' }}>
        <TextField label="Endpoint name" placeholder="e.g., CRM Sync" value={name} onChange={e => setName(e.target.value)} fullWidth size="small" required />
        <TextField
          label="Payload URL" placeholder="https://api.example.com/webhooks/orbit"
          value={url} onChange={e => { setUrl(e.target.value); setUrlError(''); }}
          fullWidth size="small" required error={!!urlError} helperText={urlError || 'HTTPS endpoints only'}
        />
        <Box>
          <Typography sx={{ fontSize: 12, fontWeight: 600, color: text.secondary, mb: 1.5 }}>
            Events to subscribe to
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
            {WEBHOOK_EVENTS.map(ev => {
              const checked = selectedEvents.includes(ev.id);
              return (
                <Box key={ev.id} onClick={() => toggleEvent(ev.id)}
                  sx={{
                    display: 'flex', alignItems: 'flex-start', gap: 1.5, p: 1.25,
                    borderRadius: radius.base, cursor: 'pointer',
                    border: `1px solid ${checked ? alpha(color.functional.primary, 0.25) : alpha(color.neutral[900], 0.08)}`,
                    bgcolor: checked ? alpha(color.functional.primary, 0.04) : 'transparent',
                    '&:hover': { borderColor: alpha(color.functional.primary, 0.2) },
                  }}>
                  <Box sx={{
                    width: 16, height: 16, borderRadius: '4px', mt: '1px', flexShrink: 0,
                    border: `2px solid ${checked ? color.functional.primary : alpha(color.neutral[900], 0.20)}`,
                    bgcolor: checked ? color.functional.primary : 'transparent',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    {checked && <Box sx={{ width: 8, height: 5, border: '1.5px solid #fff', borderTop: 'none', borderRight: 'none', transform: 'rotate(-45deg) translateY(-1px)' }} />}
                  </Box>
                  <Box>
                    <Typography sx={{ fontSize: 12, fontWeight: 600, color: text.primary }}>{ev.label}</Typography>
                    <Typography sx={{ fontSize: 11, color: text.tertiary }}>{ev.desc}</Typography>
                  </Box>
                </Box>
              );
            })}
          </Box>
        </Box>
        <Box sx={{ p: 1.5, bgcolor: alpha(color.neutral[900], 0.03), borderRadius: radius.base, border: `1px solid ${alpha(color.neutral[900], 0.07)}` }}>
          <Typography sx={{ fontSize: 11, color: text.tertiary, lineHeight: 1.6 }}>
            A signing secret will be generated automatically. Use it to verify webhook payloads with HMAC-SHA256.
          </Typography>
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
        <Button onClick={onClose} sx={{ textTransform: 'none', color: text.secondary }}>Cancel</Button>
        <Button variant="contained" onClick={handleSubmit}
          sx={{ textTransform: 'none', bgcolor: color.functional.primary, '&:hover': { bgcolor: color.functional.primaryHover }, fontWeight: 600 }}>
          Create Endpoint
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// ─── Webhook detail dialog ─────────────────────────────────────────────────────

function WebhookDetailDialog({ webhook, open, onClose }: { webhook: Webhook | null; open: boolean; onClose: () => void }) {
  if (!webhook) return null;
  const [secretVisible, setSecretVisible] = useState(false);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: radius.lg } }}>
      <DialogTitle sx={{ fontSize: 15, fontWeight: 700, color: text.primary, pb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <WebhookIcon sx={{ fontSize: 18, color: color.functional.primary }} />
            {webhook.name}
          </Box>
          <Chip size="small" label={webhook.status}
            sx={{ height: 18, fontSize: 10, fontWeight: 700, textTransform: 'capitalize',
              bgcolor: webhook.status === 'healthy' ? alpha(color.functional.success, 0.10) : webhook.status === 'failing' ? alpha(color.functional.error, 0.10) : alpha(color.neutral[900], 0.06),
              color: webhook.status === 'healthy' ? color.functional.success : webhook.status === 'failing' ? color.functional.error : text.tertiary }} />
        </Box>
      </DialogTitle>
      <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: '8px !important' }}>
        <Box>
          <Typography sx={{ fontSize: 11, fontWeight: 600, color: text.tertiary, textTransform: 'uppercase', letterSpacing: '0.05em', mb: 0.75 }}>Endpoint URL</Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, p: 1.25, bgcolor: alpha(color.neutral[900], 0.03), borderRadius: radius.base, border: `1px solid ${alpha(color.neutral[900], 0.08)}` }}>
            <Typography sx={{ fontSize: 12, fontFamily: 'monospace', color: text.primary, flex: 1, wordBreak: 'break-all' }}>{webhook.url}</Typography>
            <Tooltip title="Copy URL">
              <IconButton size="small" onClick={() => { navigator.clipboard.writeText(webhook.url); toast.success('URL copied'); }}>
                <CopyIcon sx={{ fontSize: 14 }} />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        <Box>
          <Typography sx={{ fontSize: 11, fontWeight: 600, color: text.tertiary, textTransform: 'uppercase', letterSpacing: '0.05em', mb: 0.75 }}>Signing Secret</Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, p: 1.25, bgcolor: alpha(color.neutral[900], 0.03), borderRadius: radius.base, border: `1px solid ${alpha(color.neutral[900], 0.08)}` }}>
            <Typography sx={{ fontSize: 12, fontFamily: 'monospace', color: text.primary, flex: 1 }}>
              {secretVisible ? webhook.secret : webhook.secret.substring(0, 8) + '••••••••••••••••'}
            </Typography>
            <Button size="small" onClick={() => setSecretVisible(!secretVisible)} sx={{ fontSize: 10, textTransform: 'none', color: text.tertiary, minWidth: 0, px: 1 }}>
              {secretVisible ? 'Hide' : 'Reveal'}
            </Button>
            <Tooltip title="Copy secret">
              <IconButton size="small" onClick={() => { navigator.clipboard.writeText(webhook.secret); toast.success('Secret copied'); }}>
                <CopyIcon sx={{ fontSize: 14 }} />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        <Box>
          <Typography sx={{ fontSize: 11, fontWeight: 600, color: text.tertiary, textTransform: 'uppercase', letterSpacing: '0.05em', mb: 0.75 }}>Subscribed Events</Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
            {webhook.events.map(ev => (
              <Chip key={ev} size="small" label={ev}
                sx={{ height: 20, fontSize: 11, fontFamily: 'monospace', bgcolor: alpha(color.functional.primary, 0.07), color: color.functional.primary, '& .MuiChip-label': { px: '8px' } }} />
            ))}
          </Box>
        </Box>

        <Box sx={{ display: 'flex', gap: 3 }}>
          <Box>
            <Typography sx={{ fontSize: 18, fontWeight: 700, color: text.primary, lineHeight: 1 }}>{webhook.deliveries.toLocaleString()}</Typography>
            <Typography sx={{ fontSize: 10, color: text.tertiary }}>total deliveries</Typography>
          </Box>
          <Box>
            <Typography sx={{ fontSize: 18, fontWeight: 700, color: text.primary, lineHeight: 1 }}>{webhook.lastDelivery}</Typography>
            <Typography sx={{ fontSize: 10, color: text.tertiary }}>last delivery</Typography>
          </Box>
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
        <Button startIcon={<RefreshIcon sx={{ fontSize: 14 }} />} onClick={() => { toast.success('Test payload sent'); onClose(); }}
          sx={{ textTransform: 'none', color: text.secondary, fontSize: 12 }}>
          Send test
        </Button>
        <Box sx={{ flex: 1 }} />
        <Button onClick={onClose} sx={{ textTransform: 'none', color: text.secondary }}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}

// ─── Webhooks tab ──────────────────────────────────────────────────────────────

function WebhooksTab() {
  const [webhooks, setWebhooks] = useState<Webhook[]>(INITIAL_WEBHOOKS);
  const [addOpen, setAddOpen] = useState(false);
  const [detailWebhook, setDetailWebhook] = useState<Webhook | null>(null);

  const toggleActive = (id: string) => {
    setWebhooks(prev => prev.map(w => w.id === id ? { ...w, active: !w.active, status: !w.active ? 'healthy' : 'inactive' } : w));
    const wh = webhooks.find(w => w.id === id);
    toast.success(`${wh?.name} ${wh?.active ? 'disabled' : 'enabled'}`);
  };

  const deleteWebhook = (id: string) => {
    const wh = webhooks.find(w => w.id === id);
    setWebhooks(prev => prev.filter(w => w.id !== id));
    toast.success(`${wh?.name} deleted`);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <Box>
          <Typography sx={{ fontSize: 14, fontWeight: 700, color: text.primary, mb: 0.5 }}>Webhook Endpoints</Typography>
          <Typography sx={{ fontSize: 12, color: text.tertiary }}>
            Receive real-time HTTP POST requests when review events occur. Payloads are signed with HMAC-SHA256.
          </Typography>
        </Box>
        <Button size="small" variant="contained" startIcon={<AddIcon sx={{ fontSize: 15 }} />} onClick={() => setAddOpen(true)}
          sx={{ fontSize: 12, textTransform: 'none', fontWeight: 600, bgcolor: color.functional.primary, '&:hover': { bgcolor: color.functional.primaryHover }, flexShrink: 0, ml: 2 }}>
          Add Endpoint
        </Button>
      </Box>

      {/* Webhooks list */}
      <Paper elevation={0} sx={{ border: `1px solid ${alpha(color.neutral[900], 0.08)}`, borderRadius: radius.md, overflow: 'hidden', bgcolor: color.surface.work }}>
        {webhooks.length === 0 ? (
          <Box sx={{ py: 6, textAlign: 'center' }}>
            <WebhookIcon sx={{ fontSize: 32, color: text.tertiary, mb: 1 }} />
            <Typography sx={{ fontSize: 13, color: text.tertiary }}>No webhook endpoints configured</Typography>
            <Button size="small" onClick={() => setAddOpen(true)} sx={{ mt: 1.5, textTransform: 'none', color: color.functional.primary, fontSize: 13 }}>Add your first endpoint</Button>
          </Box>
        ) : (
          webhooks.map((wh, i) => (
            <Box key={wh.id}>
              {i > 0 && <Divider />}
              <Box sx={{ px: '20px', py: '14px', display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                {/* Status dot */}
                <Box sx={{ width: 8, height: 8, borderRadius: '50%', mt: '5px', flexShrink: 0,
                  bgcolor: wh.status === 'healthy' ? color.functional.success : wh.status === 'failing' ? color.functional.error : color.neutral[300] }} />

                {/* Info */}
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.25 }}>
                    <Typography sx={{ fontSize: 13, fontWeight: 600, color: text.primary }}>{wh.name}</Typography>
                    {wh.status === 'failing' && (
                      <Chip size="small" icon={<WarnIcon sx={{ fontSize: '11px !important' }} />} label="Failing"
                        sx={{ height: 16, fontSize: 9, fontWeight: 700, bgcolor: alpha(color.functional.error, 0.10), color: color.functional.error, '& .MuiChip-label': { pl: '2px', pr: '5px' } }} />
                    )}
                  </Box>
                  <Typography sx={{ fontSize: 11, fontFamily: 'monospace', color: text.tertiary, mb: 0.5 }} noWrap>{wh.url}</Typography>
                  <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                    {wh.events.map(ev => (
                      <Chip key={ev} size="small" label={ev}
                        sx={{ height: 16, fontSize: 10, fontFamily: 'monospace', bgcolor: alpha(color.neutral[900], 0.05), color: text.tertiary, '& .MuiChip-label': { px: '5px' } }} />
                    ))}
                  </Box>
                </Box>

                {/* Stats */}
                <Box sx={{ textAlign: 'right', flexShrink: 0, width: 100 }}>
                  <Typography sx={{ fontSize: 12, fontWeight: 500, color: text.primary }}>{wh.deliveries.toLocaleString()}</Typography>
                  <Typography sx={{ fontSize: 10, color: text.tertiary }}>deliveries</Typography>
                  <Typography sx={{ fontSize: 10, color: text.tertiary, mt: 0.25 }}>{wh.lastDelivery}</Typography>
                </Box>

                {/* Controls */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexShrink: 0 }}>
                  <Switch checked={wh.active} onChange={() => toggleActive(wh.id)} size="small"
                    sx={{ '& .MuiSwitch-switchBase.Mui-checked': { color: color.functional.primary }, '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { bgcolor: color.functional.primary } }} />
                  <Tooltip title="View details">
                    <Button size="small" onClick={() => setDetailWebhook(wh)}
                      sx={{ fontSize: 11, textTransform: 'none', color: color.functional.primary, minWidth: 0, px: 1 }}>
                      Details
                    </Button>
                  </Tooltip>
                  <Tooltip title="Delete endpoint">
                    <IconButton size="small" onClick={() => deleteWebhook(wh.id)}
                      sx={{ color: text.tertiary, '&:hover': { color: color.functional.error, bgcolor: alpha(color.functional.error, 0.05) } }}>
                      <DeleteIcon sx={{ fontSize: 15 }} />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Box>
            </Box>
          ))
        )}
      </Paper>

      {/* Docs reference */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, p: '12px 16px', bgcolor: alpha(color.neutral[900], 0.03), borderRadius: radius.base, border: `1px solid ${alpha(color.neutral[900], 0.07)}` }}>
        <WebhookIcon sx={{ fontSize: 15, color: text.tertiary }} />
        <Typography sx={{ fontSize: 12, color: text.secondary, flex: 1 }}>
          Payloads are signed using <code style={{ fontFamily: 'monospace', fontSize: 11 }}>HMAC-SHA256</code>. Verify using the <code style={{ fontFamily: 'monospace', fontSize: 11 }}>X-Orbit-Signature</code> header.
        </Typography>
        <Button size="small" endIcon={<DocsIcon sx={{ fontSize: 13 }} />} onClick={() => toast.info('Opening webhook documentation…')}
          sx={{ fontSize: 11, textTransform: 'none', color: color.functional.primary, flexShrink: 0 }}>
          API Docs
        </Button>
      </Box>

      <AddWebhookDialog open={addOpen} onClose={() => setAddOpen(false)} onAdd={wh => setWebhooks(prev => [...prev, wh])} />
      <WebhookDetailDialog webhook={detailWebhook} open={!!detailWebhook} onClose={() => setDetailWebhook(null)} />
    </Box>
  );
}

// ─── Integrations catalog tab ──────────────────────────────────────────────────

function CatalogTab() {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {CATEGORIES_DATA.map(cat => (
        <Box key={cat.label}>
          <Typography sx={{ fontSize: 10, fontWeight: 700, color: text.tertiary, textTransform: 'uppercase', letterSpacing: '0.07em', mb: 1.5 }}>{cat.label}</Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
            {cat.sources.map(src => (
              <Paper key={src.name} elevation={0}
                sx={{ width: 200, p: '16px', border: `1px solid ${alpha(color.neutral[900], src.connected ? 0.08 : 0.05)}`, borderRadius: radius.md, bgcolor: src.connected ? color.surface.work : alpha(color.neutral[100], 0.4) }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: src.color }} />
                    <Typography sx={{ fontSize: 13, fontWeight: 600, color: text.primary }}>{src.name}</Typography>
                  </Box>
                  {src.connected && <ConnectedIcon sx={{ fontSize: 14, color: color.functional.success }} />}
                </Box>
                {src.connected && src.reviews > 0 && (
                  <Typography sx={{ fontSize: 11, color: text.tertiary, mb: 1 }}>{src.reviews.toLocaleString()} reviews synced</Typography>
                )}
                {src.connected ? (
                  <Chip size="small" label="Connected" sx={{ height: 18, fontSize: 10, fontWeight: 500, bgcolor: alpha(color.functional.success, 0.10), color: color.functional.success, '& .MuiChip-label': { px: '6px' } }} />
                ) : (
                  <Button size="small" variant="outlined" startIcon={<AddIcon sx={{ fontSize: 13 }} />} fullWidth
                    onClick={() => toast.success(`${src.name} connection initiated`)}
                    sx={{ fontSize: 11, textTransform: 'none', py: 0.375, borderColor: alpha(color.neutral[900], 0.15), color: text.secondary }}>
                    Connect
                  </Button>
                )}
              </Paper>
            ))}
          </Box>
        </Box>
      ))}
    </Box>
  );
}

// ─── Main view ─────────────────────────────────────────────────────────────────

export const IntegrationsView = () => {
  const [tab, setTab] = useState(0);

  const connectedCount = CATEGORIES_DATA.flatMap(c => c.sources).filter(s => s.connected).length;
  const availableCount = CATEGORIES_DATA.flatMap(c => c.sources).filter(s => !s.connected).length;

  return (
    <Box sx={{ flex: 1, height: '100vh', overflow: 'auto', bgcolor: alpha(color.neutral[100], 0.4), '&::-webkit-scrollbar': { width: 5 }, '&::-webkit-scrollbar-thumb': { bgcolor: alpha(color.neutral[900], 0.10), borderRadius: 3 } }}>
      {/* Header */}
      <Box sx={{ px: '32px', pt: '20px', pb: 0, bgcolor: color.surface.work, borderBottom: `1px solid ${alpha(color.neutral[900], 0.08)}`, position: 'sticky', top: 0, zIndex: 10 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
          <Box>
            <Typography sx={{ fontSize: 16, fontWeight: 700, color: text.primary }}>Integrations</Typography>
            <Typography sx={{ fontSize: 11, color: text.tertiary, mt: 0.25 }}>
              {connectedCount} connected · {availableCount} available
            </Typography>
          </Box>
        </Box>
        <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ '& .MuiTab-root': { fontSize: 12, textTransform: 'none', minHeight: 40, py: 0, fontWeight: 500 } }}>
          <Tab label="Connected Sources" />
          <Tab label={`Webhooks · ${INITIAL_WEBHOOKS.filter(w => w.active).length} active`} />
        </Tabs>
      </Box>

      <Box sx={{ px: '32px', py: '24px' }}>
        {tab === 0 && <CatalogTab />}
        {tab === 1 && <WebhooksTab />}
      </Box>
    </Box>
  );
};
