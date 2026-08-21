import { useState, useEffect } from 'react';
import {
  Dialog, DialogContent, TextField, List, ListItem, ListItemButton,
  ListItemIcon, ListItemText, Box, Typography, Chip, alpha, Divider,
} from '@mui/material';
import {
  Dashboard as OverviewIcon, Inbox as FeedbackIcon, BugReport as IssuesIcon,
  TaskAlt as ActionsIcon, TrendingUp as ImpactIcon,
  Cable as IntegrationsIcon, AccountTree as AutomationsIcon,
  Group as TeamIcon, Settings as SettingsIcon, Search as SearchIcon,
  DarkMode as DarkIcon, LightMode as LightIcon,
} from '@mui/icons-material';
import { useUIStore } from '../stores/uiStore';
import { useNavigate, useWorkspacePath } from '@/hooks/useInertiaNavigation';
import { toast } from 'sonner';
import { color, text, radius } from '../shared/tokens/design-tokens';

interface Command {
  id: string;
  label: string;
  subtitle?: string;
  icon: React.ReactNode;
  keywords: string[];
  action: () => void;
  category: string;
  shortcut?: string;
}

export const CommandPalette = () => {
  const { isCommandPaletteOpen, closeCommandPalette, theme, toggleTheme } = useUIStore();
  const navigate = useNavigate();
  const workspacePath = useWorkspacePath();
  const [search, setSearch] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  const go = (path: string) => navigate(workspacePath(path));

  const commands: Command[] = [
    // Navigation
    { id: 'overview',     label: 'Go to Overview',      icon: <OverviewIcon fontSize="small" />,     keywords: ['overview', 'home', 'priority issues', 'command center'], action: () => go(''),            category: 'Navigation', shortcut: 'G H' },
    { id: 'issues',       label: 'Go to Issues',         icon: <IssuesIcon fontSize="small" />,       keywords: ['issues', 'insights', 'themes', 'alerts', 'problems'],    action: () => go('insights'),    category: 'Navigation', shortcut: 'G I' },
    { id: 'feedback',     label: 'Go to Feedback',       icon: <FeedbackIcon fontSize="small" />,     keywords: ['feedback', 'inbox', 'reviews', 'response', 'queue'],     action: () => go('inbox'),       category: 'Navigation', shortcut: 'G F' },
    { id: 'actions',      label: 'Go to Actions',        icon: <ActionsIcon fontSize="small" />,      keywords: ['actions', 'tasks', 'corrective', 'due', 'overdue'],      action: () => go('alerts'),      category: 'Navigation', shortcut: 'G A' },
    { id: 'impact',       label: 'Go to Impact',         icon: <ImpactIcon fontSize="small" />,       keywords: ['impact', 'reports', 'outcomes', 'verified', 'before after'], action: () => go('reports'), category: 'Navigation' },
    { id: 'integrations', label: 'Go to Integrations',   icon: <IntegrationsIcon fontSize="small" />, keywords: ['integrations', 'connections', 'sources', 'webhooks'],    action: () => go('connections'), category: 'Navigation' },
    { id: 'automations',  label: 'Go to Automations',    icon: <AutomationsIcon fontSize="small" />,  keywords: ['automations', 'workflows', 'triggers'],                  action: () => go('automations'),  category: 'Navigation' },
    { id: 'team',         label: 'Go to Team',           icon: <TeamIcon fontSize="small" />,         keywords: ['team', 'members', 'roles', 'permissions'],               action: () => go('team'),         category: 'Navigation' },
    { id: 'settings',     label: 'Go to Settings',       icon: <SettingsIcon fontSize="small" />,     keywords: ['settings', 'preferences', 'config'],                     action: () => go('settings'),     category: 'Navigation', shortcut: 'G S' },
    // Actions
    { id: 'create-issue',   label: 'Create issue',              icon: <IssuesIcon fontSize="small" />,   keywords: ['create', 'issue', 'new'],                action: () => { go('insights'); toast.info('Opening Issues'); }, category: 'Actions' },
    { id: 'draft-response', label: 'Draft response to feedback',icon: <FeedbackIcon fontSize="small" />, keywords: ['draft', 'reply', 'respond', 'response'], action: () => { go('inbox'); toast.success('Opening Feedback — select a review to draft a response'); }, category: 'Actions' },
    { id: 'create-action',  label: 'Create corrective action',  icon: <ActionsIcon fontSize="small" />,  keywords: ['action', 'corrective', 'create'],        action: () => { go('alerts'); toast.info('Opening Actions'); }, category: 'Actions' },
    { id: 'toggle-theme',   label: `Switch to ${theme === 'light' ? 'dark' : 'light'} mode`, icon: theme === 'light' ? <DarkIcon fontSize="small" /> : <LightIcon fontSize="small" />, keywords: ['theme', 'dark', 'light', 'mode'], action: toggleTheme, category: 'Settings' },
  ];

  const filtered = search.trim()
    ? commands.filter(c =>
        c.label.toLowerCase().includes(search.toLowerCase()) ||
        c.keywords.some(k => k.includes(search.toLowerCase()))
      )
    : commands;

  const grouped = filtered.reduce((acc, cmd) => {
    if (!acc[cmd.category]) acc[cmd.category] = [];
    acc[cmd.category].push(cmd);
    return acc;
  }, {} as Record<string, Command[]>);

  const order = ['Navigation', 'Actions', 'Settings'];
  const categories = order.filter(c => grouped[c]);

  const handleClose = () => { closeCommandPalette(); setSearch(''); setSelectedIndex(0); };
  const execute = (cmd: Command) => { cmd.action(); handleClose(); };

  useEffect(() => { if (isCommandPaletteOpen) { setSearch(''); setSelectedIndex(0); } }, [isCommandPaletteOpen]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setSelectedIndex(p => Math.min(p + 1, filtered.length - 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setSelectedIndex(p => Math.max(p - 1, 0)); }
    else if (e.key === 'Enter') { e.preventDefault(); if (filtered[selectedIndex]) execute(filtered[selectedIndex]); }
  };

  return (
    <Dialog
      open={isCommandPaletteOpen}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '10px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.18)',
          border: '1px solid rgba(0,0,0,0.09)',
          overflow: 'hidden',
        },
      }}
    >
      <DialogContent sx={{ p: 0 }}>
        {/* Search */}
        <Box sx={{ px: '14px', py: '10px', borderBottom: '1px solid rgba(0,0,0,0.07)' }}>
          <TextField
            fullWidth placeholder="Search or navigate…"
            value={search} onChange={e => setSearch(e.target.value)}
            onKeyDown={handleKeyDown} autoFocus
            InputProps={{
              startAdornment: <SearchIcon sx={{ mr: '10px', fontSize: 17, color: text.tertiary }} />,
              sx: { fontSize: 14, '& fieldset': { border: 'none' }, color: text.primary },
            }}
          />
        </Box>

        {/* Results */}
        <Box sx={{ maxHeight: 400, overflow: 'auto' }}>
          {categories.map(cat => (
            <Box key={cat}>
              <Typography sx={{ px: '14px', py: '5px', fontSize: 10, fontWeight: 700, color: text.tertiary, textTransform: 'uppercase', letterSpacing: '0.07em', bgcolor: 'rgba(0,0,0,0.02)' }}>
                {cat}
              </Typography>
              <List sx={{ py: 0 }}>
                {grouped[cat].map(cmd => {
                  const gIdx = filtered.indexOf(cmd);
                  return (
                    <ListItem key={cmd.id} disablePadding>
                      <ListItemButton
                        selected={gIdx === selectedIndex}
                        onClick={() => execute(cmd)}
                        sx={{ py: '9px', px: '14px', '&.Mui-selected': { bgcolor: alpha(color.functional.primary, 0.07) }, '&:hover': { bgcolor: 'rgba(0,0,0,0.04)' } }}
                      >
                        <ListItemIcon sx={{ minWidth: 30, color: text.tertiary }}>{cmd.icon}</ListItemIcon>
                        <ListItemText
                          primary={cmd.label}
                          primaryTypographyProps={{ fontSize: 13, color: text.primary, fontWeight: 500 }}
                        />
                        {cmd.shortcut && (
                          <Box sx={{ display: 'flex', gap: '3px' }}>
                            {cmd.shortcut.split(' ').map(k => (
                              <Typography key={k} sx={{ fontSize: 10, color: text.tertiary, bgcolor: 'rgba(0,0,0,0.07)', borderRadius: '4px', px: '5px', py: '2px', lineHeight: 1.4 }}>
                                {k}
                              </Typography>
                            ))}
                          </Box>
                        )}
                      </ListItemButton>
                    </ListItem>
                  );
                })}
              </List>
            </Box>
          ))}

          {filtered.length === 0 && (
            <Box sx={{ py: 6, textAlign: 'center' }}>
              <Typography sx={{ fontSize: 13, color: text.tertiary }}>No results for "{search}"</Typography>
            </Box>
          )}
        </Box>

        {/* Footer hints */}
        <Box sx={{ px: '14px', py: '9px', borderTop: '1px solid rgba(0,0,0,0.07)', display: 'flex', gap: '16px' }}>
          {[['↑↓', 'Navigate'], ['↵', 'Select'], ['Esc', 'Close']].map(([k, l]) => (
            <Box key={k} sx={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Typography sx={{ fontSize: 10, color: text.tertiary, bgcolor: 'rgba(0,0,0,0.06)', borderRadius: '4px', px: '5px', py: '1px', lineHeight: 1.5 }}>{k}</Typography>
              <Typography sx={{ fontSize: 11, color: text.tertiary }}>{l}</Typography>
            </Box>
          ))}
        </Box>
      </DialogContent>
    </Dialog>
  );
};
