import { useState } from 'react';
import {
  Box, Typography, Divider, alpha, Button, Chip, Switch,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField,
  FormControl, InputLabel, Select, MenuItem, IconButton, Tooltip,
} from '@mui/material';
import {
  Add as AddIcon, PlayArrow as RunIcon, Delete as DeleteIcon,
  ArrowForward, MoreHoriz as MoreIcon, CheckCircle, Error as ErrIcon,
} from '@mui/icons-material';
import { color, text, radius } from '../../shared/tokens/design-tokens';
import { toast } from 'sonner';

const TRIGGERS = [
  'New 1-star review',
  'Negative sentiment spike (>20% in 1h)',
  'Competitor mention detected',
  'Theme spike (>20% volume change)',
  'Review volume anomaly',
  'Rating drop (7-day rolling)',
  'Review escalated by agent',
  'Response overdue (>48h)',
];

const ACTIONS_LIST = [
  'Slack notification',
  'Email alert',
  'Microsoft Teams message',
  'Create Jira ticket',
  'Create Linear issue',
  'Assign to team member',
  'Outbound webhook',
  'PagerDuty alert',
];

type AutoStatus = 'active' | 'paused' | 'failing';

interface Automation {
  id: string;
  name: string;
  trigger: string;
  action: string;
  active: boolean;
  status: AutoStatus;
  runs: number;
  lastRun: string;
  failureReason?: string;
}

const INITIAL: Automation[] = [
  { id: 'a1', name: '1-star review → Jira ticket',     trigger: 'New 1-star review',                    action: 'Create Jira ticket · Project: CX · Priority: High',   active: true,  status: 'active',  runs: 847, lastRun: '2h ago' },
  { id: 'a2', name: 'Negative spike → Slack alert',    trigger: 'Negative sentiment spike (>20% in 1h)', action: 'Slack notification · #cx-alerts · with context',      active: true,  status: 'active',  runs: 12,  lastRun: '6h ago' },
  { id: 'a3', name: 'Competitor mention → email',      trigger: 'Competitor mention detected',           action: 'Email alert · product@company.com · daily digest',   active: true,  status: 'active',  runs: 67,  lastRun: '1d ago' },
  { id: 'a4', name: 'Theme spike → Linear issue',      trigger: 'Theme spike (>20% volume change)',      action: 'Create Linear issue · Team: Engineering',            active: false, status: 'paused',  runs: 3,   lastRun: '8d ago' },
  { id: 'a5', name: 'Rating drop → PagerDuty',         trigger: 'Rating drop (7-day rolling)',           action: 'PagerDuty alert · Service: Reviews · Severity: High', active: false, status: 'failing', runs: 0,   lastRun: 'Never', failureReason: 'PagerDuty authentication expired. Reconnect in Connections.' },
];

const statusConfig: Record<AutoStatus, { label: string; color: string }> = {
  active:  { label: 'Active',  color: color.functional.success },
  paused:  { label: 'Paused',  color: text.tertiary },
  failing: { label: 'Failing', color: color.functional.error },
};

function NewAutomationDialog({ open, onClose, onAdd }: { open: boolean; onClose: () => void; onAdd: (a: Automation) => void }) {
  const [name, setName]       = useState('');
  const [trigger, setTrigger] = useState('');
  const [action, setAction]   = useState('');

  const handleSubmit = () => {
    if (!name || !trigger || !action) { toast.error('All fields required'); return; }
    onAdd({ id: `a${Date.now()}`, name, trigger, action, active: true, status: 'active', runs: 0, lastRun: 'Never' });
    toast.success(`Automation "${name}" created`);
    setName(''); setTrigger(''); setAction('');
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: '10px' } }}>
      <DialogTitle sx={{ fontSize: 14, fontWeight: 700 }}>New automation</DialogTitle>
      <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: '8px !important' }}>
        <TextField label="Name" placeholder="e.g., 1-star review → Jira" value={name} onChange={e => setName(e.target.value)} fullWidth size="small" />

        {/* Visual trigger → action flow */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <Box>
            <Typography sx={{ fontSize: 11, fontWeight: 700, color: text.tertiary, textTransform: 'uppercase', letterSpacing: '0.06em', mb: '6px' }}>
              When this trigger fires
            </Typography>
            <FormControl size="small" fullWidth>
              <Select value={trigger} onChange={e => setTrigger(e.target.value)} displayEmpty
                renderValue={v => v || <Typography sx={{ fontSize: 13, color: text.tertiary }}>Select trigger…</Typography>}>
                {TRIGGERS.map(t => <MenuItem key={t} value={t} sx={{ fontSize: 13 }}>{t}</MenuItem>)}
              </Select>
            </FormControl>
            {trigger && (
              <Box sx={{ mt: '6px', px: '12px', py: '8px', bgcolor: alpha(color.functional.warning, 0.07), borderRadius: '6px', border: `1px solid ${alpha(color.functional.warning, 0.18)}` }}>
                <Typography sx={{ fontSize: 12, color: color.functional.warning, fontWeight: 500 }}>Trigger: {trigger}</Typography>
              </Box>
            )}
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px', opacity: trigger ? 1 : 0.3 }}>
            <Divider sx={{ flex: 1 }} />
            <ArrowForward sx={{ fontSize: 16, color: text.tertiary }} />
            <Divider sx={{ flex: 1 }} />
          </Box>

          <Box>
            <Typography sx={{ fontSize: 11, fontWeight: 700, color: text.tertiary, textTransform: 'uppercase', letterSpacing: '0.06em', mb: '6px' }}>
              Run this action
            </Typography>
            <FormControl size="small" fullWidth disabled={!trigger}>
              <Select value={action} onChange={e => setAction(e.target.value)} displayEmpty
                renderValue={v => v || <Typography sx={{ fontSize: 13, color: text.tertiary }}>Select action…</Typography>}>
                {ACTIONS_LIST.map(a => <MenuItem key={a} value={a} sx={{ fontSize: 13 }}>{a}</MenuItem>)}
              </Select>
            </FormControl>
            {action && (
              <Box sx={{ mt: '6px', px: '12px', py: '8px', bgcolor: alpha(color.functional.primary, 0.06), borderRadius: '6px', border: `1px solid ${alpha(color.functional.primary, 0.18)}` }}>
                <Typography sx={{ fontSize: 12, color: color.functional.primary, fontWeight: 500 }}>Action: {action}</Typography>
              </Box>
            )}
          </Box>
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
        <Button onClick={onClose} sx={{ color: text.secondary }}>Cancel</Button>
        <Button variant="contained" onClick={handleSubmit}
          sx={{ bgcolor: color.functional.primary, '&:hover': { bgcolor: color.functional.primaryHover } }}>
          Create automation
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export const AutomationsView = () => {
  const [automations, setAutomations] = useState(INITIAL);
  const [addOpen, setAddOpen]         = useState(false);

  const toggleActive = (id: string) => {
    setAutomations(prev => prev.map(a => a.id === id ? { ...a, active: !a.active, status: (!a.active ? 'active' : 'paused') as AutoStatus } : a));
    const auto = automations.find(a => a.id === id);
    toast.success(`${auto?.name} ${auto?.active ? 'paused' : 'activated'}`);
  };

  const runNow = (auto: Automation) => {
    if (!auto.active) { toast.error('Enable the automation before running'); return; }
    toast.success(`Running "${auto.name}"…`);
    setTimeout(() => toast.success(`"${auto.name}" completed — ${auto.action}`), 1500);
  };

  const del = (id: string) => {
    const a = automations.find(a => a.id === id);
    setAutomations(prev => prev.filter(a => a.id !== id));
    toast.success(`"${a?.name}" deleted`);
  };

  const activeCount  = automations.filter(a => a.active).length;
  const failingCount = automations.filter(a => a.status === 'failing').length;

  return (
    <Box sx={{ flex: 1, height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden', bgcolor: '#fff' }}>

      {/* Header */}
      <Box sx={{ px: '24px', py: '12px', borderBottom: '1px solid #EAECF0', display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
        <Box sx={{ flex: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Typography sx={{ fontSize: 14, fontWeight: 700, color: text.primary, letterSpacing: '-0.01em' }}>Automations</Typography>
            {failingCount > 0 && (
              <Chip size="small" label={`${failingCount} failing`}
                sx={{ height: 16, fontSize: 10, fontWeight: 700, bgcolor: alpha(color.functional.error, 0.09), color: color.functional.error, '& .MuiChip-label': { px: '6px' } }} />
            )}
          </Box>
          <Typography sx={{ fontSize: 11, color: text.tertiary }}>
            {activeCount} active · {automations.length} total · trigger-based workflow rules
          </Typography>
        </Box>
        <Button size="small" variant="contained" startIcon={<AddIcon sx={{ fontSize: 15 }} />} onClick={() => setAddOpen(true)}
          sx={{ fontSize: 12, height: 30, px: '12px', bgcolor: color.functional.primary, '&:hover': { bgcolor: color.functional.primaryHover } }}>
          New automation
        </Button>
      </Box>

      {/* Column headers */}
      <Box sx={{ display: 'flex', px: '20px', py: '7px', bgcolor: 'rgba(0,0,0,0.025)', borderBottom: '1px solid #EAECF0', flexShrink: 0, gap: '12px' }}>
        {[
          { l: 'Name',    flex: 1.3 },
          { l: 'Trigger → Action', flex: 2.5 },
          { l: 'Runs',    w: 70,  right: true },
          { l: 'Last run',w: 100, right: false },
          { l: 'Status',  w: 90  },
          { l: '',        w: 110 },
        ].map((col, i) => (
          <Typography key={i} sx={{ fontSize: 10, fontWeight: 700, color: text.tertiary, textTransform: 'uppercase', letterSpacing: '0.07em', flex: (col as any).flex, width: (col as any).w, flexShrink: (col as any).w ? 0 : undefined, textAlign: (col as any).right ? 'right' : 'left' }}>
            {col.l}
          </Typography>
        ))}
      </Box>

      {/* Automations list */}
      <Box sx={{ flex: 1, overflow: 'auto', '&::-webkit-scrollbar': { width: 5 } }}>
        {automations.map((auto, i) => {
          const sc = statusConfig[auto.status];
          return (
            <Box key={auto.id}>
              {i > 0 && <Divider sx={{ borderColor: '#F3F4F6' }} />}
              <Box sx={{ display: 'flex', alignItems: 'center', px: '20px', py: '11px', gap: '12px', opacity: auto.active ? 1 : 0.6, '&:hover': { bgcolor: 'rgba(0,0,0,0.015)' } }}>

                {/* Name */}
                <Box sx={{ flex: 1.3, minWidth: 0 }}>
                  <Typography sx={{ fontSize: 13, fontWeight: 600, color: text.primary }} noWrap>{auto.name}</Typography>
                  {auto.failureReason && (
                    <Typography sx={{ fontSize: 11, color: color.functional.error, mt: '2px', lineHeight: 1.4 }}>
                      {auto.failureReason}
                    </Typography>
                  )}
                </Box>

                {/* Trigger → Action */}
                <Box sx={{ flex: 2.5, display: 'flex', alignItems: 'center', gap: '6px', minWidth: 0 }}>
                  <Chip size="small" label={auto.trigger}
                    sx={{ height: 18, fontSize: 10, fontWeight: 500, bgcolor: alpha(color.functional.warning, 0.08), color: color.functional.warning, '& .MuiChip-label': { px: '6px' }, maxWidth: 220 }} />
                  <ArrowForward sx={{ fontSize: 12, color: text.tertiary, flexShrink: 0 }} />
                  <Typography sx={{ fontSize: 11, color: text.secondary }} noWrap>{auto.action}</Typography>
                </Box>

                {/* Runs */}
                <Typography sx={{ fontSize: 12, fontWeight: 500, color: text.primary, width: 70, flexShrink: 0, textAlign: 'right' }}>
                  {auto.runs.toLocaleString()}
                </Typography>

                {/* Last run */}
                <Typography sx={{ fontSize: 11, color: text.tertiary, width: 100, flexShrink: 0 }}>{auto.lastRun}</Typography>

                {/* Status */}
                <Box sx={{ width: 90, flexShrink: 0, display: 'flex', alignItems: 'center', gap: '5px' }}>
                  {auto.status === 'active'
                    ? <CheckCircle sx={{ fontSize: 12, color: sc.color }} />
                    : auto.status === 'failing'
                    ? <ErrIcon sx={{ fontSize: 12, color: sc.color }} />
                    : <Box sx={{ width: 7, height: 7, borderRadius: '50%', bgcolor: '#D1D5DB' }} />}
                  <Typography sx={{ fontSize: 11, fontWeight: 500, color: sc.color }}>{sc.label}</Typography>
                </Box>

                {/* Controls */}
                <Box sx={{ width: 110, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '4px' }}>
                  <Switch checked={auto.active} onChange={() => toggleActive(auto.id)} size="small" />
                  <Tooltip title="Run now">
                    <IconButton size="small" onClick={() => runNow(auto)} sx={{ color: text.tertiary, '&:hover': { color: color.functional.primary } }}>
                      <RunIcon sx={{ fontSize: 15 }} />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete">
                    <IconButton size="small" onClick={() => del(auto.id)} sx={{ color: text.tertiary, '&:hover': { color: color.functional.error } }}>
                      <DeleteIcon sx={{ fontSize: 15 }} />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Box>
            </Box>
          );
        })}

        {automations.length === 0 && (
          <Box sx={{ py: 8, textAlign: 'center' }}>
            <Typography sx={{ fontSize: 13, color: text.tertiary, mb: '12px' }}>No automations configured</Typography>
            <Button size="small" variant="outlined" onClick={() => setAddOpen(true)}
              sx={{ fontSize: 12, borderColor: '#EAECF0', color: text.secondary }}>
              Create your first automation
            </Button>
          </Box>
        )}

        {/* Trigger/action catalogs live inside the creation dialog, not the main page */}
      </Box>

      <NewAutomationDialog open={addOpen} onClose={() => setAddOpen(false)} onAdd={a => setAutomations(prev => [...prev, a])} />
    </Box>
  );
};
