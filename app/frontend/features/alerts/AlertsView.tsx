import { useState } from 'react';
import {
  Box, Typography, Divider, alpha, Chip, Button,
  Select, MenuItem, FormControl, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField,
} from '@mui/material';
import { color, text, radius } from '../../shared/tokens/design-tokens';
import { toast } from 'sonner';

type Severity = 'critical' | 'high' | 'medium' | 'low';
type AlertStatus = 'new' | 'acknowledged' | 'investigating' | 'resolved' | 'dismissed';

export interface Alert {
  id: string;
  trigger: string;
  scope: string;
  detectedAt: string;
  evidence: string;
  owner?: string;
  status: AlertStatus;
  severity: Severity;
  description: string;
}

const ALERTS: Alert[] = [
  { id: 'a1', severity: 'critical', trigger: 'Login failure volume spike', scope: 'Android · v5.1.0 · App Store + Play Store', detectedAt: '2h ago', evidence: '89 reviews · +312%', owner: 'Mobile Platform', status: 'investigating', description: 'Android login failure mentions increased 312% in 48h. Correlated with v5.1.0 release Jun 10. OAuth token refresh regression confirmed by engineering.' },
  { id: 'a2', severity: 'high', trigger: 'Negative sentiment spike — regional', scope: 'Texas · Google Business · Checkout', detectedAt: '6h ago', evidence: '41 reviews · +61%', owner: 'Support Ops', status: 'investigating', description: 'Checkout-related negative sentiment in Texas up 61% over 14 days. Regional payment gateway incident confirmed Jun 8.' },
  { id: 'a3', severity: 'high', trigger: 'Average rating drop', scope: 'App Store · 7-day rolling', detectedAt: '1d ago', evidence: '4.2★ → 3.7★', status: 'acknowledged', description: '7-day rolling average dropped 0.5 points on App Store. Primarily login and crash reports on Android devices. iOS rating unchanged at 4.4★.' },
  { id: 'a4', severity: 'medium', trigger: 'Competitor mention volume increase', scope: 'G2 · Capterra · Dark mode', detectedAt: '1d ago', evidence: '44 mentions · +218%', status: 'new', description: 'Intercom mentioned in 44 reviews this month as a direct comparison on dark mode. Highest competitor mention volume in 6 months.' },
  { id: 'a5', severity: 'low', trigger: 'Unusual review volume — Trustpilot', scope: 'Trustpilot · 3× normal rate', detectedAt: '2d ago', evidence: '3× 30-day avg', status: 'new', description: 'Trustpilot review volume 3× 30-day average this week. Pattern may indicate external campaign. Monitoring for sentiment quality signals.' },
];

const sevConfig: Record<Severity, { label: string; color: string; bg: string }> = {
  critical: { label: 'Critical', color: color.functional.error,   bg: alpha(color.functional.error, 0.08) },
  high:     { label: 'High',     color: color.functional.warning, bg: alpha(color.functional.warning, 0.08) },
  medium:   { label: 'Medium',   color: color.functional.info,    bg: alpha(color.functional.info, 0.08) },
  low:      { label: 'Low',      color: text.tertiary,             bg: 'rgba(0,0,0,0.05)' },
};

const statusConfig: Record<AlertStatus, { label: string; color: string }> = {
  new:          { label: 'New',           color: color.functional.primary },
  acknowledged: { label: 'Acknowledged',  color: color.functional.warning },
  investigating:{ label: 'Investigating', color: color.functional.warning },
  resolved:     { label: 'Resolved',      color: color.functional.success },
  dismissed:    { label: 'Dismissed',     color: text.tertiary },
};

function AlertRow({ alert, onStatusChange }: { alert: Alert; onStatusChange: (id: string, s: AlertStatus) => void }) {
  const [expanded, setExpanded] = useState(false);
  const sc = sevConfig[alert.severity];
  const st = statusConfig[alert.status];
  const [jiraOpen, setJiraOpen] = useState(false);

  const nextActions: { label: string; action: () => void }[] = alert.status === 'new'
    ? [{ label: 'Acknowledge', action: () => onStatusChange(alert.id, 'acknowledged') }]
    : alert.status === 'acknowledged'
    ? [{ label: 'Start investigating', action: () => onStatusChange(alert.id, 'investigating') }]
    : alert.status === 'investigating'
    ? [{ label: 'Mark resolved', action: () => onStatusChange(alert.id, 'resolved') }]
    : [];

  return (
    <>
      <Box sx={{ borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
        {/* Main row */}
        <Box
          onClick={() => setExpanded(!expanded)}
          sx={{ display: 'flex', alignItems: 'center', px: '20px', py: '11px', cursor: 'pointer', '&:hover': { bgcolor: 'rgba(0,0,0,0.02)' }, gap: '12px' }}
        >
          {/* Severity dot */}
          <Box sx={{ width: 7, height: 7, borderRadius: '50%', bgcolor: sc.color, flexShrink: 0 }} />

          {/* Trigger + scope */}
          <Box sx={{ flex: 2, minWidth: 0 }}>
            <Typography sx={{ fontSize: 12, fontWeight: 600, color: text.primary }} noWrap>{alert.trigger}</Typography>
            <Typography sx={{ fontSize: 11, color: text.tertiary }} noWrap>{alert.scope}</Typography>
          </Box>

          {/* Severity */}
          <Box sx={{ width: 80, flexShrink: 0 }}>
            <Chip size="small" label={sc.label}
              sx={{ height: 16, fontSize: 10, fontWeight: 600, bgcolor: sc.bg, color: sc.color, '& .MuiChip-label': { px: '5px' } }} />
          </Box>

          {/* Evidence */}
          <Typography sx={{ fontSize: 11, fontWeight: 600, color: text.secondary, width: 120, flexShrink: 0 }}>{alert.evidence}</Typography>

          {/* Detected */}
          <Typography sx={{ fontSize: 11, color: text.tertiary, width: 80, flexShrink: 0 }}>{alert.detectedAt}</Typography>

          {/* Owner */}
          <Typography sx={{ fontSize: 11, color: text.tertiary, width: 110, flexShrink: 0 }} noWrap>{alert.owner ?? '—'}</Typography>

          {/* Status */}
          <Box sx={{ width: 110, flexShrink: 0 }}>
            <Typography sx={{ fontSize: 11, fontWeight: 600, color: st.color }}>{st.label}</Typography>
          </Box>
        </Box>

        {/* Expanded detail */}
        {expanded && (
          <Box sx={{ px: '20px', pb: '12px', bgcolor: 'rgba(0,0,0,0.015)' }}>
            <Typography sx={{ fontSize: 12, color: text.secondary, lineHeight: 1.65, mb: '10px' }}>{alert.description}</Typography>
            <Box sx={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {nextActions.map(a => (
                <Button key={a.label} size="small" variant="outlined"
                  onClick={() => { a.action(); }}
                  sx={{ fontSize: 11, height: 26, px: '10px', borderColor: 'rgba(0,0,0,0.14)', color: text.secondary }}>
                  {a.label}
                </Button>
              ))}
              <Button size="small" onClick={() => setJiraOpen(true)}
                sx={{ fontSize: 11, height: 26, px: '10px', border: '1px solid rgba(0,0,0,0.12)', color: text.secondary }}>
                Create Jira issue
              </Button>
              <Button size="small" onClick={() => toast.success('Assigned')}
                sx={{ fontSize: 11, height: 26, px: '10px', border: '1px solid rgba(0,0,0,0.12)', color: text.secondary }}>
                Assign
              </Button>
              {alert.status !== 'dismissed' && (
                <Button size="small" onClick={() => onStatusChange(alert.id, 'dismissed')}
                  sx={{ fontSize: 11, height: 26, px: '10px', color: text.tertiary }}>
                  Dismiss
                </Button>
              )}
            </Box>
          </Box>
        )}
      </Box>

      <Dialog open={jiraOpen} onClose={() => setJiraOpen(false)} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: '10px' } }}>
        <DialogTitle sx={{ fontSize: 14, fontWeight: 700 }}>Create Jira issue</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, pt: '8px !important' }}>
          <TextField label="Title" defaultValue={alert.trigger} fullWidth size="small" />
          <TextField label="Description" defaultValue={alert.description} fullWidth size="small" multiline rows={3} />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={() => setJiraOpen(false)} sx={{ color: text.secondary }}>Cancel</Button>
          <Button variant="contained" onClick={() => { toast.success('Jira issue created'); setJiraOpen(false); }}
            sx={{ bgcolor: '#0052CC', '&:hover': { bgcolor: '#0043A8' } }}>Create</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export const AlertsView = ({ alerts: initialAlerts }: { alerts?: Alert[] }) => {
  const [alerts, setAlerts] = useState(initialAlerts?.length ? initialAlerts : ALERTS);
  const [statusFilter, setStatusFilter] = useState('all');

  const updateStatus = (id: string, status: AlertStatus) => {
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, status } : a));
    toast.success(`Alert ${status}`);
  };

  const filtered = statusFilter === 'all' ? alerts : alerts.filter(a => a.status === statusFilter);
  const critCount = alerts.filter(a => a.severity === 'critical' && a.status !== 'resolved' && a.status !== 'dismissed').length;
  const newCount  = alerts.filter(a => a.status === 'new').length;

  return (
    <Box sx={{ flex: 1, height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden', bgcolor: '#fff' }}>
      {/* Header */}
      <Box sx={{ px: '24px', py: '12px', borderBottom: '1px solid rgba(0,0,0,0.07)', display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
        <Box sx={{ flex: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Typography sx={{ fontSize: 14, fontWeight: 700, color: text.primary, letterSpacing: '-0.01em' }}>Alerts</Typography>
            {critCount > 0 && (
              <Chip size="small" label={`${critCount} critical`}
                sx={{ height: 16, fontSize: 10, fontWeight: 700, bgcolor: alpha(color.functional.error, 0.09), color: color.functional.error, '& .MuiChip-label': { px: '6px' } }} />
            )}
          </Box>
          <Typography sx={{ fontSize: 11, color: text.tertiary }}>Rule-triggered and anomaly-detected notifications</Typography>
        </Box>
        <FormControl size="small" sx={{ width: 150 }}>
          <Select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} displayEmpty
            sx={{ fontSize: 12, bgcolor: 'rgba(0,0,0,0.03)', '& .MuiSelect-select': { py: '6px' }, '& fieldset': { border: '1px solid rgba(0,0,0,0.12)' } }}>
            <MenuItem value="all" sx={{ fontSize: 12 }}>All statuses</MenuItem>
            {['new', 'acknowledged', 'investigating', 'resolved', 'dismissed'].map(s => (
              <MenuItem key={s} value={s} sx={{ fontSize: 12, textTransform: 'capitalize' }}>{s}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {/* Column headers */}
      <Box sx={{ display: 'flex', px: '20px', py: '7px', bgcolor: 'rgba(0,0,0,0.025)', borderBottom: '1px solid rgba(0,0,0,0.07)', flexShrink: 0, gap: '12px' }}>
        <Box sx={{ width: 7, flexShrink: 0 }} />
        {[
          { l: 'Trigger / Scope', flex: 2 }, { l: 'Severity', w: 80 },
          { l: 'Evidence', w: 120 }, { l: 'Detected', w: 80 },
          { l: 'Owner', w: 110 }, { l: 'Status', w: 110 },
        ].map(col => (
          <Typography key={col.l}
            sx={{ fontSize: 10, fontWeight: 700, color: text.tertiary, textTransform: 'uppercase', letterSpacing: '0.07em', flex: col.flex, width: col.w, flexShrink: col.w ? 0 : undefined }}>
            {col.l}
          </Typography>
        ))}
      </Box>

      {/* Queue */}
      <Box sx={{ flex: 1, overflow: 'auto', '&::-webkit-scrollbar': { width: 5 } }}>
        {filtered.length === 0 ? (
          <Box sx={{ py: 8, textAlign: 'center' }}>
            <Typography sx={{ fontSize: 13, color: text.tertiary }}>No alerts match this filter</Typography>
          </Box>
        ) : (
          filtered.map(alert => (
            <AlertRow key={alert.id} alert={alert} onStatusChange={updateStatus} />
          ))
        )}
      </Box>
    </Box>
  );
};
