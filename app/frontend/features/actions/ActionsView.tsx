import { useState } from 'react';
import {
  Box, Typography, alpha, Button, Chip, Divider, IconButton, Tooltip,
  Select, MenuItem, FormControl, TextField, Dialog,
  DialogTitle, DialogContent, DialogActions, Avatar,
} from '@mui/material';
import {
  Add as AddIcon,
  OpenInNew as JiraIcon,
} from '@mui/icons-material';
import { color, text } from '../../shared/tokens/design-tokens';
import { MOCK_ACTIONS, MOCK_ISSUES, actionStatusConfig, type MockAction, type ActionStatus } from '../../shared/mock/issues';
import { toast } from 'sonner';
import { useNavigate, useWorkspacePath } from '@/hooks/useInertiaNavigation';

const ACTION_VIEWS = [
  { id: 'all',               label: 'All',               count: MOCK_ACTIONS.filter(a => a.status !== 'completed').length },
  { id: 'my',                label: 'My actions',        count: 2 },
  { id: 'overdue',           label: 'Overdue',           count: MOCK_ACTIONS.filter(a => a.status === 'overdue').length },
  { id: 'this_week',         label: 'Due this week',     count: 3 },
  { id: 'awaiting_approval', label: 'Awaiting approval', count: MOCK_ACTIONS.filter(a => a.status === 'awaiting_approval').length },
  { id: 'monitoring',        label: 'Monitoring',        count: 1 },
];

function ActionStatusChip({ status }: { status: ActionStatus }) {
  const s = actionStatusConfig[status];
  return (
    <Chip size="small" label={s.label}
      sx={{ height: 18, fontSize: 10, fontWeight: 600, bgcolor: s.bg, color: s.color, borderRadius: '3px', '& .MuiChip-label': { px: '6px' } }} />
  );
}

function ActionRow({ action }: { action: MockAction }) {
  const navigate = useNavigate();
  const workspacePath = useWorkspacePath();
  const [jiraOpen, setJiraOpen] = useState(false);
  const [done, setDone] = useState(false);

  return (
    <>
      <Dialog open={jiraOpen} onClose={() => setJiraOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontSize: 14, fontWeight: 700 }}>Create Jira issue</DialogTitle>
        <DialogContent>
          <TextField fullWidth size="small" label="Summary" defaultValue={action.title} sx={{ mb: 2, mt: 1 }} />
          <TextField fullWidth size="small" label="Assignee" defaultValue={action.owner} sx={{ mb: 2 }} />
          <TextField fullWidth size="small" label="Due date" defaultValue={action.due} />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
          <Button onClick={() => setJiraOpen(false)} sx={{ textTransform: 'none', color: text.secondary }}>Cancel</Button>
          <Button variant="contained" onClick={() => { toast.success('Jira issue created'); setJiraOpen(false); }}
            sx={{ textTransform: 'none', bgcolor: color.functional.primary, '&:hover': { bgcolor: color.functional.primaryHover } }}>
            Create
          </Button>
        </DialogActions>
      </Dialog>

      <Box sx={{
        display: 'flex', alignItems: 'center',
        borderBottom: '1px solid #F3F4F6',
        opacity: done ? 0.4 : 1,
        transition: 'opacity 0.15s, background 0.08s',
        '&:hover': { bgcolor: 'rgba(0,0,0,0.015)' },
        '&:hover .row-actions': { opacity: 1 },
      }}>
        <Box sx={{ width: 3, alignSelf: 'stretch', bgcolor: actionStatusConfig[action.status].color, flexShrink: 0 }} />

        <Box sx={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, px: '16px', py: '10px', minWidth: 0 }}>
          <Box sx={{ flex: 2.5, minWidth: 0 }}>
            <Typography sx={{ fontSize: 13, fontWeight: 500, color: text.primary, lineHeight: 1.3, mb: '2px', textDecoration: done ? 'line-through' : 'none' }} noWrap>
              {action.title}
            </Typography>
            <Typography
              onClick={() => navigate(workspacePath('insights'))}
              sx={{ fontSize: 11, color: text.tertiary, cursor: 'pointer', '&:hover': { color: color.functional.primary } }}
              noWrap
            >
              {action.issueTitle}
            </Typography>
          </Box>

          <Box sx={{ flex: 0.65 }}>
            <Typography sx={{ fontSize: 11, color: text.secondary, bgcolor: '#F3F4F6', px: '6px', py: '2px', borderRadius: '3px', display: 'inline-block' }}>
              {action.product}
            </Typography>
          </Box>

          <Box sx={{ flex: 0.8, display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Avatar sx={{ width: 20, height: 20, fontSize: 9, fontWeight: 700, bgcolor: alpha(color.functional.primary, 0.12), color: color.functional.primary, flexShrink: 0 }}>
              {action.owner.split(' ').map(n => n[0]).join('')}
            </Avatar>
            <Typography sx={{ fontSize: 12, color: text.secondary }} noWrap>{action.owner.split(' ')[0]}</Typography>
          </Box>

          <Box sx={{ flex: 0.55 }}>
            <Typography sx={{ fontSize: 12, fontWeight: action.status === 'overdue' ? 600 : 400, color: action.status === 'overdue' ? color.functional.error : text.secondary }}>
              {action.due}
            </Typography>
          </Box>

          <Box sx={{ flex: 0.85 }}>
            <ActionStatusChip status={action.status} />
          </Box>

          <Box className="row-actions" sx={{ display: 'flex', gap: '4px', flexShrink: 0, opacity: 0, transition: 'opacity 0.1s' }}>
            <Tooltip title="Create Jira issue">
              <IconButton size="small" onClick={() => setJiraOpen(true)} sx={{ color: text.tertiary, '&:hover': { color: text.primary }, width: 26, height: 26 }}>
                <JiraIcon sx={{ fontSize: 13 }} />
              </IconButton>
            </Tooltip>
            {action.status !== 'completed' && !done && (
              <Button size="small"
                onClick={() => { setDone(true); toast.success('Marked complete'); }}
                sx={{ fontSize: 10, color: color.functional.success, border: `1px solid ${alpha(color.functional.success, 0.3)}`, px: '6px', height: 22, textTransform: 'none', minWidth: 0 }}>
                Done
              </Button>
            )}
          </Box>
        </Box>
      </Box>
    </>
  );
}

function NewActionDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontSize: 14, fontWeight: 700, pb: 1 }}>New action</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: '12px', mt: 1 }}>
          <TextField size="small" label="Title" fullWidth placeholder="e.g. Roll back authentication SDK" autoFocus />
          <FormControl size="small" fullWidth>
            <Select displayEmpty defaultValue="">
              <MenuItem value="" disabled sx={{ fontSize: 13 }}>Link to issue…</MenuItem>
              {MOCK_ISSUES.map(i => (
                <MenuItem key={i.id} value={i.id} sx={{ fontSize: 13 }}>{i.title}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <Box sx={{ display: 'flex', gap: '10px' }}>
            <FormControl size="small" sx={{ flex: 1 }}>
              <Select displayEmpty defaultValue="">
                <MenuItem value="" disabled sx={{ fontSize: 13 }}>Owner</MenuItem>
                {['Sarah Chen', 'Tom Huang', 'Maya Patel', 'James Liu', 'Priya Sharma'].map(n => (
                  <MenuItem key={n} value={n} sx={{ fontSize: 13 }}>{n}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField size="small" label="Due date" sx={{ flex: 1 }} placeholder="Jun 30" />
          </Box>
          <TextField size="small" label="Expected outcome" fullWidth multiline rows={2} placeholder="What should change after this is done?" />
          <TextField size="small" label="Verification" fullWidth placeholder="How will success be measured?" />
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
        <Button onClick={onClose} sx={{ textTransform: 'none', color: text.secondary }}>Cancel</Button>
        <Button variant="contained" onClick={() => { toast.success('Action created'); onClose(); }}
          sx={{ textTransform: 'none', bgcolor: color.functional.primary, '&:hover': { bgcolor: color.functional.primaryHover }, fontWeight: 600 }}>
          Create action
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export const ActionsView = () => {
  const [activeView, setActiveView] = useState('all');
  const [newActionOpen, setNewActionOpen] = useState(false);

  const filtered = MOCK_ACTIONS.filter(action => {
    if (activeView === 'all') return action.status !== 'completed';
    if (activeView === 'overdue') return action.status === 'overdue';
    if (activeView === 'awaiting_approval') return action.status === 'awaiting_approval';
    if (activeView === 'monitoring') return action.status === 'monitoring';
    if (activeView === 'my') return ['Sarah Chen', 'Tom Huang'].includes(action.owner);
    if (activeView === 'this_week') return !['completed', 'monitoring'].includes(action.status);
    return true;
  });

  const overdueCount = MOCK_ACTIONS.filter(a => a.status === 'overdue').length;

  return (
    <Box sx={{ flex: 1, height: '100%', display: 'flex', overflow: 'hidden', bgcolor: '#fff' }}>
      <NewActionDialog open={newActionOpen} onClose={() => setNewActionOpen(false)} />

      {/* Sidebar */}
      <Box sx={{ width: 168, flexShrink: 0, borderRight: '1px solid #E7E9EE', display: 'flex', flexDirection: 'column', bgcolor: '#F4F5F8', overflow: 'auto', pt: '10px' }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: '1px', px: '6px' }}>
          {ACTION_VIEWS.map(view => {
            const on = activeView === view.id;
            const isOverdue = view.id === 'overdue' && view.count > 0;
            return (
              <Box key={view.id} onClick={() => setActiveView(view.id)}
                sx={{
                  display: 'flex', alignItems: 'center', gap: '8px',
                  px: '8px', py: '5px', borderRadius: '5px', cursor: 'pointer',
                  bgcolor: on ? alpha(color.functional.primary, 0.08) : 'transparent',
                  '&:hover': { bgcolor: on ? alpha(color.functional.primary, 0.10) : 'rgba(0,0,0,0.04)' },
                }}
              >
                <Typography sx={{ fontSize: 12, fontWeight: on ? 600 : 400, flex: 1, color: on ? color.functional.primary : text.secondary, fontFamily: 'inherit' }}>
                  {view.label}
                </Typography>
                {view.count > 0 && (
                  <Typography sx={{ fontSize: 10, fontWeight: 700, color: isOverdue ? color.functional.error : (on ? color.functional.primary : text.tertiary) }}>
                    {view.count}
                  </Typography>
                )}
              </Box>
            );
          })}
        </Box>
      </Box>

      {/* Content */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>

        {/* Header */}
        <Box sx={{ px: '20px', py: '11px', borderBottom: '1px solid #E7E9EE', display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
          <Typography sx={{ fontSize: 13, fontWeight: 600, color: text.primary, flex: 1 }}>
            {ACTION_VIEWS.find(v => v.id === activeView)?.label ?? 'Actions'}
            <Box component="span" sx={{ fontWeight: 400, color: text.tertiary, ml: '6px' }}>
              {filtered.length}
            </Box>
          </Typography>
          {overdueCount > 0 && (
            <Chip size="small" label={`${overdueCount} overdue`}
              sx={{ height: 17, fontSize: 10, fontWeight: 700, bgcolor: 'rgba(220,38,38,0.07)', color: '#E5484D', borderRadius: '3px' }} />
          )}
          <Button size="small" startIcon={<AddIcon sx={{ fontSize: 13 }} />}
            onClick={() => setNewActionOpen(true)}
            sx={{ fontSize: 12, height: 28, px: '10px', color: color.functional.primary, border: `1px solid ${alpha(color.functional.primary, 0.25)}`, bgcolor: alpha(color.functional.primary, 0.04), textTransform: 'none' }}>
            New
          </Button>
        </Box>

        {/* Table header */}
        <Box sx={{ display: 'flex', px: '16px', py: '5px', bgcolor: '#F8F9FC', borderBottom: '1px solid #F3F4F6', flexShrink: 0, ml: '3px' }}>
          {[
            { label: 'Action',  flex: 2.5 },
            { label: 'Product', flex: 0.65 },
            { label: 'Owner',   flex: 0.8 },
            { label: 'Due',     flex: 0.55 },
            { label: 'Status',  flex: 0.85 },
            { label: '',        flex: 0 },
          ].map((col, i) => (
            <Typography key={i} sx={{ flex: col.flex, fontSize: 10, fontWeight: 600, color: text.tertiary, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              {col.label}
            </Typography>
          ))}
        </Box>

        {/* Rows */}
        <Box sx={{ flex: 1, overflow: 'auto', '&::-webkit-scrollbar': { width: 4 } }}>
          {filtered.map(action => (
            <ActionRow key={action.id} action={action} />
          ))}
          {filtered.length === 0 && (
            <Box sx={{ py: '80px', textAlign: 'center' }}>
              <Typography sx={{ fontSize: 13, color: text.tertiary }}>Nothing here</Typography>
              <Button size="small" sx={{ mt: '8px', fontSize: 12, color: color.functional.primary, textTransform: 'none' }} onClick={() => setNewActionOpen(true)}>
                Create an action
              </Button>
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
};
