/**
 * Connections — unified entry point for review platform connections.
 */
import { useState } from 'react';
import {
  Box, Typography, Tabs, Tab, alpha, Chip, Button,
  IconButton, Tooltip, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField,
} from '@mui/material';
import {
  Add as AddIcon, Sync as SyncIcon, Settings as SettingsIcon,
  CheckCircle as OkIcon, Error as ErrIcon, Schedule as DelayIcon,
  Warning as WarnIcon,
} from '@mui/icons-material';
import { color, text } from '../../shared/tokens/design-tokens';
import { toast } from 'sonner';

// ─── Types ────────────────────────────────────────────────────────────────────

export type SyncStatus = 'healthy' | 'syncing' | 'pending' | 'delayed' | 'action_required' | 'disconnected';

export type CredentialField = {
  name: string;
  label: string;
  type?: string;
  required?: boolean;
};

// ─── Review Sources data ──────────────────────────────────────────────────────

export interface SourceAccount {
  id: string; name: string; status: SyncStatus;
  lastSync: string; latestReview: string;
  recordsSynced: number; syncFrequency: string; error?: string; connectionId?: number;
}
export interface SourceProvider {
  id: string; name: string; category: string; accounts: SourceAccount[];
  authType?: string; capabilities?: string[]; credentialFields?: CredentialField[];
  setupMode?: string; setupNote?: string | null; securityNote?: string | null;
  docsUrl?: string | null; estimatedSetupMinutes?: number;
  status?: SyncStatus; healthStatus?: string | null; lastSync?: string;
}

type ProviderAction = (provider: SourceProvider, values?: Record<string, string>) => Promise<void> | void;
type ConnectionAction = (account: SourceAccount, provider: SourceProvider) => Promise<void> | void;

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

const statusMeta: Record<SyncStatus, { label: string; icon: React.ReactNode; color: string }> = {
  healthy:         { label: 'Healthy',         icon: <OkIcon sx={{ fontSize: 13, color: color.functional.success }} />,  color: color.functional.success },
  syncing:         { label: 'Syncing',          icon: <SyncIcon sx={{ fontSize: 13, color: color.functional.info }} />,   color: color.functional.info },
  pending:         { label: 'Pending',          icon: <SyncIcon sx={{ fontSize: 13, color: color.functional.info }} />,   color: color.functional.info },
  delayed:         { label: 'Delayed',          icon: <DelayIcon sx={{ fontSize: 13, color: color.functional.warning }} />, color: color.functional.warning },
  action_required: { label: 'Action required',  icon: <WarnIcon sx={{ fontSize: 13, color: color.functional.error }} />,   color: color.functional.error },
  disconnected:    { label: 'Disconnected',     icon: <ErrIcon sx={{ fontSize: 13, color: text.tertiary }} />,             color: text.tertiary },
};

function SourceAccountRow({
  account,
  provider,
  busy,
  onSync,
  onDisconnect,
}: {
  account: SourceAccount;
  provider: SourceProvider;
  busy: boolean;
  onSync?: ConnectionAction;
  onDisconnect?: ConnectionAction;
}) {
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
          <Button size="small" disabled={busy} onClick={() => toast.success('Redirecting to authentication…')}
            sx={{ fontSize: 10, height: 24, px: '8px', bgcolor: color.functional.error, color: '#fff', '&:hover': { bgcolor: '#B91C1C' } }}>
            Fix
          </Button>
        ) : (
          <Tooltip title="Force sync">
            <span>
            <IconButton
              size="small"
              aria-label={`Sync ${account.name}`}
              disabled={busy || !account.connectionId}
              onClick={() => onSync?.(account, provider)}
              sx={{ color: text.tertiary }}
            >
              <SyncIcon sx={{ fontSize: 14 }} />
            </IconButton>
            </span>
          </Tooltip>
        )}
        <Tooltip title="Disconnect">
          <span>
          <IconButton
            size="small"
            aria-label={`Disconnect ${account.name}`}
            disabled={busy || !account.connectionId}
            onClick={() => onDisconnect?.(account, provider)}
            sx={{ color: text.tertiary }}
          >
            <SettingsIcon sx={{ fontSize: 14 }} />
          </IconButton>
          </span>
        </Tooltip>
      </Box>
    </Box>
  );
}

const setupLabels: Record<string, string> = {
  oauth: 'OAuth',
  api_key: 'API token',
  jwt_private_key: 'JWT key',
  service_account: 'Service account',
};

function ReviewSourcesTab({
  sources = SOURCES,
  busyProviderId,
  onConnect,
  onSync,
  onDisconnect,
}: {
  sources?: SourceProvider[];
  busyProviderId?: string | null;
  onConnect?: ProviderAction;
  onSync?: ConnectionAction;
  onDisconnect?: ConnectionAction;
}) {
  const [connectOpen, setConnectOpen] = useState(false);
  const [connectTarget, setConnectTarget] = useState<SourceProvider | null>(null);
  const [credentialValues, setCredentialValues] = useState<Record<string, string>>({});
  const totalConnected = sources.reduce((s, p) => s + p.accounts.length, 0);
  const actionRequired = sources.flatMap(p => p.accounts).filter(a => a.status === 'action_required').length;
  const credentialFields = connectTarget?.credentialFields?.length
    ? connectTarget.credentialFields
    : connectTarget?.authType === 'oauth2'
      ? []
      : [{ name: 'api_key', label: 'API key', type: 'password', required: true }];
  const connectName = connectTarget?.name || 'review source';
  const busy = !!connectTarget && busyProviderId === connectTarget.id;
  const readyToImport = sources.filter(source => source.accounts.some(account => account.status === 'healthy' || account.status === 'syncing')).length;
  const nextConnectTarget = sources.find(source => source.accounts.length === 0) ?? sources[0] ?? null;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', flex: 1 }}>
      {/* Sub-header */}
      <Box sx={{ px: '24px', py: '10px', borderBottom: '1px solid rgba(0,0,0,0.07)', display: 'flex', alignItems: 'center', gap: '10px', bgcolor: '#FAFAFA', flexShrink: 0 }}>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography sx={{ fontSize: 12, color: text.secondary }}>
            {totalConnected} connected accounts · {readyToImport} importing review sources
            {actionRequired > 0 && <Box component="span" sx={{ color: color.functional.error, fontWeight: 600, ml: '8px' }}>· {actionRequired} need attention</Box>}
          </Typography>
          <Typography sx={{ fontSize: 11, color: text.tertiary, mt: '2px' }}>
            OAuth tokens, API tokens, private keys, and service-account credentials are encrypted at rest.
          </Typography>
        </Box>
        <Button size="small" variant="outlined" startIcon={<AddIcon sx={{ fontSize: 14 }} />}
          disabled={!nextConnectTarget}
          onClick={() => { setConnectTarget(nextConnectTarget); setCredentialValues({}); setConnectOpen(true); }}
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
          <Typography key={i} sx={{ fontSize: 10, fontWeight: 700, color: text.tertiary, textTransform: 'uppercase', letterSpacing: '0.07em', flex: (col as any).flex, width: (col as any).w, flexShrink: (col as any).w ? 0 : undefined, textAlign: (col as any).right ? 'right' : 'left' }}>
            {col.l}
          </Typography>
        ))}
      </Box>

      {/* Provider groups */}
      <Box sx={{ flex: 1, overflow: 'auto', '&::-webkit-scrollbar': { width: 5 } }}>
        {sources.map(provider => (
          <Box key={provider.id}>
            <Box sx={{ display: 'flex', alignItems: 'center', px: '20px', py: '8px', bgcolor: 'rgba(0,0,0,0.02)', borderBottom: '1px solid rgba(0,0,0,0.06)', borderTop: '1px solid rgba(0,0,0,0.04)', gap: '10px' }}>
              <Typography sx={{ fontSize: 12, fontWeight: 700, color: text.primary, flex: 1 }}>{provider.name}</Typography>
              <Chip size="small" label={provider.category}
                sx={{ height: 16, fontSize: 10, bgcolor: 'rgba(0,0,0,0.05)', color: text.tertiary, '& .MuiChip-label': { px: '6px' } }} />
              {provider.setupMode && (
                <Chip size="small" label={setupLabels[provider.setupMode] || provider.setupMode}
                  sx={{ height: 16, fontSize: 10, bgcolor: 'rgba(94,106,210,0.08)', color: color.functional.primary, '& .MuiChip-label': { px: '6px' } }} />
              )}
              {provider.estimatedSetupMinutes && (
                <Chip size="small" label={`${provider.estimatedSetupMinutes} min setup`}
                  sx={{ height: 16, fontSize: 10, bgcolor: 'rgba(0,0,0,0.05)', color: text.tertiary, '& .MuiChip-label': { px: '6px' } }} />
              )}
              {provider.docsUrl && (
                <Button size="small" href={provider.docsUrl} target="_blank" rel="noreferrer"
                  sx={{ fontSize: 10, height: 24, px: '8px', color: text.secondary, border: '1px solid rgba(0,0,0,0.11)' }}>
                  Guide
                </Button>
              )}
              <Button size="small" disabled={busyProviderId === provider.id} onClick={() => { setConnectTarget(provider); setCredentialValues({}); setConnectOpen(true); }}
                startIcon={<AddIcon sx={{ fontSize: 12 }} />}
                sx={{ fontSize: 10, height: 24, px: '8px', color: text.secondary, border: '1px solid rgba(0,0,0,0.11)' }}>
                {provider.accounts.length ? 'Add account' : 'Connect'}
              </Button>
            </Box>
            {provider.accounts.length ? (
              provider.accounts.map(account => (
                <SourceAccountRow
                  key={account.id}
                  account={account}
                  provider={provider}
                  busy={busyProviderId === provider.id}
                  onSync={onSync}
                  onDisconnect={onDisconnect}
                />
              ))
            ) : (
              <Box sx={{ display: 'flex', alignItems: 'center', px: '20px', py: '10px', gap: '12px', borderBottom: '1px solid rgba(0,0,0,0.05)', bgcolor: 'rgba(0,0,0,0.012)' }}>
                <Box sx={{ width: 20, flexShrink: 0 }} />
                <Typography sx={{ fontSize: 12, color: text.tertiary, flex: 1 }}>
                  Not connected yet. {provider.setupNote || 'Connect this provider to begin importing reviews.'}
                </Typography>
                <Button size="small" onClick={() => { setConnectTarget(provider); setCredentialValues({}); setConnectOpen(true); }}
                  sx={{ fontSize: 10, height: 24, px: '8px', color: color.functional.primary, border: `1px solid ${alpha(color.functional.primary, 0.35)}` }}>
                  Connect
                </Button>
              </Box>
            )}
          </Box>
        ))}

      </Box>

      {/* Connect dialog */}
      <Dialog open={connectOpen} onClose={() => { setConnectOpen(false); setConnectTarget(null); setCredentialValues({}); }} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: '10px' } }}>
        <DialogTitle sx={{ fontSize: 14, fontWeight: 700 }}>Connect {connectName}</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: '8px !important' }}>
          {connectTarget && (
            <Box sx={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {connectTarget.setupMode && (
                <Chip size="small" label={setupLabels[connectTarget.setupMode] || connectTarget.setupMode}
                  sx={{ height: 18, fontSize: 10, bgcolor: 'rgba(94,106,210,0.08)', color: color.functional.primary }} />
              )}
              {connectTarget.estimatedSetupMinutes && (
                <Chip size="small" label={`${connectTarget.estimatedSetupMinutes} min setup`}
                  sx={{ height: 18, fontSize: 10, bgcolor: 'rgba(0,0,0,0.05)', color: text.tertiary }} />
              )}
            </Box>
          )}
          {credentialFields.map(field => (
            <TextField
              key={field.name}
              label={field.label}
              value={credentialValues[field.name] ?? ''}
              onChange={e => setCredentialValues(prev => ({ ...prev, [field.name]: e.target.value }))}
              fullWidth
              size="small"
              type={field.type === 'password' ? 'password' : 'text'}
              required={field.required}
            />
          ))}
          <Box sx={{ px: '12px', py: '10px', bgcolor: 'rgba(0,0,0,0.03)', borderRadius: '7px', border: '1px solid rgba(0,0,0,0.08)' }}>
            <Typography sx={{ fontSize: 11, color: text.secondary, lineHeight: 1.6 }}>
              {connectTarget?.setupNote || 'Orbit requests read-only access. Credentials are encrypted at rest and never used to write to source platforms.'}
            </Typography>
            <Typography sx={{ fontSize: 11, color: text.tertiary, lineHeight: 1.6, mt: '6px' }}>
              {connectTarget?.securityNote || 'Secrets are encrypted at rest. Do not paste unrelated customer data, PHI, or personal data into setup fields.'}
            </Typography>
            {connectTarget?.docsUrl && (
              <Button
                size="small"
                href={connectTarget.docsUrl}
                target="_blank"
                rel="noreferrer"
                sx={{ mt: '6px', p: 0, minWidth: 0, fontSize: 11, color: color.functional.primary }}
              >
                View setup guide
              </Button>
            )}
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button disabled={busy} onClick={() => { setConnectOpen(false); setConnectTarget(null); setCredentialValues({}); }} sx={{ color: text.secondary }}>Cancel</Button>
          <Button variant="contained" disabled={!connectTarget || busy} onClick={async () => {
            if (!connectTarget) return;
            await onConnect?.(connectTarget, credentialValues);
            setConnectOpen(false);
            setConnectTarget(null);
            setCredentialValues({});
          }} sx={{ bgcolor: color.functional.primary }}>{busy ? 'Connecting...' : 'Connect'}</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

// ─── Health tab ───────────────────────────────────────────────────────────────

function providerStatus(provider: SourceProvider): SyncStatus {
  if (provider.accounts.some(account => account.status === 'action_required')) return 'action_required';
  if (provider.accounts.some(account => account.status === 'syncing')) return 'syncing';
  if (provider.accounts.some(account => account.status === 'healthy')) return 'healthy';
  return provider.status ?? 'disconnected';
}

function ConnectionHealthTab({ sources }: { sources: SourceProvider[] }) {
  const connectedAccounts = sources.reduce((sum, source) => sum + source.accounts.length, 0);
  const readyProviders = sources.filter(source => providerStatus(source) === 'healthy' || providerStatus(source) === 'syncing').length;

  return (
    <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <Box sx={{ px: '24px', py: '10px', borderBottom: '1px solid rgba(0,0,0,0.07)', bgcolor: '#FAFAFA', flexShrink: 0 }}>
        <Typography sx={{ fontSize: 12, color: text.secondary }}>
          {readyProviders} providers ready · {connectedAccounts} connected accounts · sync jobs run through Orbit Connect
        </Typography>
      </Box>
      <Box sx={{ display: 'flex', px: '20px', py: '7px', bgcolor: 'rgba(0,0,0,0.025)', borderBottom: '1px solid rgba(0,0,0,0.07)', flexShrink: 0, gap: '12px' }}>
        {[
          { l: 'Provider', flex: 1 }, { l: 'Connection', w: 130 }, { l: 'Accounts', w: 90, right: true },
          { l: 'Auth', w: 130 }, { l: 'Last sync', w: 130 }, { l: 'Capabilities', flex: 1 },
        ].map((col, i) => (
          <Typography key={i} sx={{ fontSize: 10, fontWeight: 700, color: text.tertiary, textTransform: 'uppercase', letterSpacing: '0.07em', flex: (col as any).flex, width: (col as any).w, flexShrink: (col as any).w ? 0 : undefined, textAlign: (col as any).right ? 'right' : 'left' }}>
            {col.l}
          </Typography>
        ))}
      </Box>
      <Box sx={{ flex: 1, overflow: 'auto', '&::-webkit-scrollbar': { width: 5 } }}>
        {sources.map(provider => {
          const status = providerStatus(provider);
          const sm = statusMeta[status];
          return (
            <Box key={provider.id} sx={{ display: 'flex', alignItems: 'center', px: '20px', py: '11px', gap: '12px', borderBottom: '1px solid rgba(0,0,0,0.05)', '&:hover': { bgcolor: 'rgba(0,0,0,0.02)' } }}>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography sx={{ fontSize: 13, fontWeight: 600, color: text.primary }}>{provider.name}</Typography>
                <Typography sx={{ fontSize: 11, color: text.tertiary }}>{provider.category}</Typography>
              </Box>
              <Box sx={{ width: 130, flexShrink: 0, display: 'flex', alignItems: 'center', gap: '5px' }}>
                {sm.icon}
                <Typography sx={{ fontSize: 11, fontWeight: 600, color: sm.color }}>{sm.label}</Typography>
              </Box>
              <Typography sx={{ width: 90, flexShrink: 0, textAlign: 'right', fontSize: 12, fontWeight: 600, color: text.secondary }}>{provider.accounts.length}</Typography>
              <Typography sx={{ width: 130, flexShrink: 0, fontSize: 12, color: text.secondary }}>{setupLabels[provider.setupMode || ''] || provider.authType || 'API token'}</Typography>
              <Typography sx={{ width: 130, flexShrink: 0, fontSize: 11, color: text.tertiary }}>{provider.lastSync || 'Never'}</Typography>
              <Box sx={{ flex: 1, minWidth: 0, display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                {(provider.capabilities || []).slice(0, 4).map(capability => (
                  <Chip key={capability} size="small" label={capability.replace(/_/g, ' ')}
                    sx={{ height: 16, fontSize: 10, bgcolor: 'rgba(0,0,0,0.04)', color: text.tertiary, '& .MuiChip-label': { px: '5px' } }} />
                ))}
              </Box>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}

// ─── Setup and security tab ──────────────────────────────────────────────────

function SetupSecurityTab({ sources }: { sources: SourceProvider[] }) {
  return (
    <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <Box sx={{ px: '24px', py: '10px', borderBottom: '1px solid rgba(0,0,0,0.07)', bgcolor: '#FAFAFA', flexShrink: 0 }}>
        <Typography sx={{ fontSize: 12, color: text.secondary }}>
          Each provider shows exactly what an admin needs before connecting. Secrets are encrypted at rest and setup fields should not contain PHI.
        </Typography>
      </Box>
      <Box sx={{ display: 'flex', px: '20px', py: '7px', bgcolor: 'rgba(0,0,0,0.025)', borderBottom: '1px solid rgba(0,0,0,0.07)', flexShrink: 0, gap: '12px' }}>
        {[
          { l: 'Provider', flex: 1 }, { l: 'Setup', w: 130 }, { l: 'Required', flex: 1 }, { l: 'Security posture', flex: 1 }, { l: '', w: 80 },
        ].map((col, i) => (
          <Typography key={i} sx={{ fontSize: 10, fontWeight: 700, color: text.tertiary, textTransform: 'uppercase', letterSpacing: '0.07em', flex: (col as any).flex, width: (col as any).w, flexShrink: (col as any).w ? 0 : undefined }}>
            {col.l}
          </Typography>
        ))}
      </Box>
      <Box sx={{ flex: 1, overflow: 'auto', '&::-webkit-scrollbar': { width: 5 } }}>
        {sources.map(provider => {
          const required = provider.credentialFields?.length
            ? provider.credentialFields.map(field => field.label).join(', ')
            : provider.authType === 'oauth2' ? 'Workspace admin OAuth consent' : 'API token';

          return (
            <Box key={provider.id} sx={{ display: 'flex', alignItems: 'flex-start', px: '20px', py: '12px', gap: '12px', borderBottom: '1px solid rgba(0,0,0,0.05)', '&:hover': { bgcolor: 'rgba(0,0,0,0.02)' } }}>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography sx={{ fontSize: 13, fontWeight: 600, color: text.primary }}>{provider.name}</Typography>
                <Typography sx={{ fontSize: 11, color: text.tertiary, lineHeight: 1.45 }}>{provider.setupNote || 'Connect this provider to import reviews.'}</Typography>
              </Box>
              <Typography sx={{ width: 130, flexShrink: 0, fontSize: 12, color: text.secondary }}>{setupLabels[provider.setupMode || ''] || provider.authType || 'API token'}</Typography>
              <Typography sx={{ flex: 1, minWidth: 0, fontSize: 12, color: text.secondary, lineHeight: 1.45 }}>{required}</Typography>
              <Typography sx={{ flex: 1, minWidth: 0, fontSize: 12, color: text.secondary, lineHeight: 1.45 }}>{provider.securityNote || 'Credentials are encrypted at rest.'}</Typography>
              <Box sx={{ width: 80, flexShrink: 0, display: 'flex', justifyContent: 'flex-end' }}>
                {provider.docsUrl && (
                  <Button size="small" href={provider.docsUrl} target="_blank" rel="noreferrer"
                    sx={{ fontSize: 10, height: 24, px: '8px', color: color.functional.primary, border: `1px solid ${alpha(color.functional.primary, 0.35)}` }}>
                    Guide
                  </Button>
                )}
              </Box>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}

// ─── Main view ────────────────────────────────────────────────────────────────

export const ConnectionsView = ({
  sources = SOURCES,
  busyProviderId,
  onConnect,
  onSync,
  onDisconnect,
}: {
  sources?: SourceProvider[];
  busyProviderId?: string | null;
  onConnect?: ProviderAction;
  onSync?: ConnectionAction;
  onDisconnect?: ConnectionAction;
}) => {
  const [tab, setTab] = useState(0);

  const actionRequired = sources.flatMap(p => p.accounts).filter(a => a.status === 'action_required').length;

  return (
    <Box sx={{ flex: 1, height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden', bgcolor: '#fff' }}>
      {/* Header */}
      <Box sx={{ px: '24px', py: '12px', borderBottom: '1px solid rgba(0,0,0,0.07)', flexShrink: 0 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Typography sx={{ fontSize: 14, fontWeight: 700, color: text.primary, letterSpacing: '-0.01em' }}>Connections</Typography>
          {actionRequired > 0 && (
            <Chip size="small" label={`${actionRequired} need attention`}
              sx={{ height: 16, fontSize: 10, fontWeight: 700, bgcolor: 'rgba(220,38,38,0.09)', color: color.functional.error, '& .MuiChip-label': { px: '6px' } }} />
          )}
        </Box>
        <Typography sx={{ fontSize: 11, color: text.tertiary }}>Review platform connections, sync health, and secure setup</Typography>
      </Box>

      {/* Tabs */}
      <Tabs value={tab} onChange={(_, v) => setTab(v)}
        sx={{ px: '24px', borderBottom: '1px solid rgba(0,0,0,0.07)', flexShrink: 0, bgcolor: '#fff',
          '& .MuiTab-root': { minHeight: 40, py: 0, fontSize: 13, px: '4px', mr: '16px', fontWeight: 500 },
          '& .MuiTabs-indicator': { height: 2 } }}>
        <Tab label="Review sources" />
        <Tab label="Health" />
        <Tab label="Setup & security" />
      </Tabs>

      {/* Content */}
      {tab === 0 && (
        <ReviewSourcesTab
          sources={sources}
          busyProviderId={busyProviderId}
          onConnect={onConnect}
          onSync={onSync}
          onDisconnect={onDisconnect}
        />
      )}
      {tab === 1 && <ConnectionHealthTab sources={sources} />}
      {tab === 2 && <SetupSecurityTab sources={sources} />}
    </Box>
  );
};
