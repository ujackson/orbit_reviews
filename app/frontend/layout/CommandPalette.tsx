import { useEffect, useState, type ReactNode } from 'react';
import {
  alpha,
  Avatar,
  Box,
  Chip,
  Dialog,
  DialogContent,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  TextField,
  Typography,
} from '@mui/material';
import {
  Archive as ArchiveIcon,
  AutoAwesome as AutoAwesomeIcon,
  CheckCircle as CheckCircleIcon,
  DarkMode as DarkModeIcon,
  Email as EmailIcon,
  Inbox as InboxIcon,
  LightMode as LightModeIcon,
  People as PeopleIcon,
  Person as PersonIcon,
  Rule as RuleIcon,
  Search as SearchIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material';
import { formatDistanceToNow } from 'date-fns';
import { workspace as workspaceRoutes } from '@/api';
import { useConversations } from '@/features/inbox/hooks/useConversations';
import { useInboxUIStore } from '@/features/inbox/store/inboxUIStore';
import type { Channel } from '@/features/inbox/types';
import { getChannelColor, getChannelLabel } from '@/lib/mockMessages';
import { useUIStore } from '@/stores/uiStore';
import { useNavigate } from '@/hooks/useInertiaNavigation';
import { useWorkspace } from '@/providers/WorkspaceProvider';

interface Command {
  id: string;
  label: string;
  subtitle?: string;
  icon: ReactNode;
  keywords: string[];
  action: () => void;
  category: string;
  shortcut?: string;
  avatar?: string;
  channel?: Channel;
}

export const CommandPalette = () => {
  const { isCommandPaletteOpen, closeCommandPalette, theme, toggleTheme } = useUIStore();
  const { setSelectedConversationId } = useInboxUIStore();
  const navigate = useNavigate();
  const { workspace } = useWorkspace();
  const workspaceId = workspace?.id ?? 'default';
  const [search, setSearch] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  const { data: conversations = [] } = useConversations('all', {
    status: 'all',
    channels: [],
    priority: 'all',
    searchQuery: '',
  });

  const baseCommands: Command[] = [
    {
      id: 'inbox',
      label: 'Go to Inbox',
      icon: <InboxIcon />,
      keywords: ['inbox', 'messages', 'go'],
      action: () => navigate(workspaceRoutes.inbox.path({ workspace_id: workspaceId, view_id: 'all' })),
      category: 'Navigation',
      shortcut: 'G I',
    },
    {
      id: 'assigned',
      label: 'Go to Assigned to Me',
      icon: <PersonIcon />,
      keywords: ['assigned', 'me', 'go'],
      action: () => navigate(workspaceRoutes.inbox.path({ workspace_id: workspaceId, view_id: 'assigned' })),
      category: 'Navigation',
    },
    {
      id: 'contacts',
      label: 'Go to Contacts',
      icon: <PeopleIcon />,
      keywords: ['contacts', 'people', 'go'],
      action: () => navigate(workspaceRoutes.contacts.path({ workspace_id: workspaceId })),
      category: 'Navigation',
      shortcut: 'G C',
    },
    {
      id: 'rules',
      label: 'Go to Rules & Automation',
      icon: <RuleIcon />,
      keywords: ['rules', 'automation', 'workflow', 'go'],
      action: () => navigate(workspaceRoutes.rules.path({ workspace_id: workspaceId })),
      category: 'Navigation',
      shortcut: 'G R',
    },
    {
      id: 'settings',
      label: 'Go to Settings',
      icon: <SettingsIcon />,
      keywords: ['settings', 'preferences', 'configuration', 'go'],
      action: () => navigate(workspaceRoutes.settings.path({ workspace_id: workspaceId })),
      category: 'Navigation',
      shortcut: 'G S',
    },
    {
      id: 'toggle-theme',
      label: `Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`,
      icon: theme === 'light' ? <DarkModeIcon /> : <LightModeIcon />,
      keywords: ['theme', 'dark', 'light', 'mode'],
      action: toggleTheme,
      category: 'Settings',
    },
    {
      id: 'assign-me',
      label: 'Assign to Me',
      icon: <PersonIcon />,
      keywords: ['assign', 'me'],
      action: () => undefined,
      category: 'Actions',
      shortcut: 'E',
    },
    {
      id: 'close-conversation',
      label: 'Close Conversation',
      icon: <CheckCircleIcon />,
      keywords: ['close', 'done', 'resolve'],
      action: () => undefined,
      category: 'Actions',
      shortcut: 'C',
    },
    {
      id: 'archive',
      label: 'Archive Conversation',
      icon: <ArchiveIcon />,
      keywords: ['archive', 'hide'],
      action: () => undefined,
      category: 'Actions',
    },
    {
      id: 'ai-summarize',
      label: 'AI Summarize Thread',
      icon: <AutoAwesomeIcon />,
      keywords: ['ai', 'summarize', 'summary'],
      action: () => undefined,
      category: 'AI Commands',
    },
    {
      id: 'ai-draft',
      label: 'AI Draft Reply',
      icon: <AutoAwesomeIcon />,
      keywords: ['ai', 'draft', 'reply', 'suggest'],
      action: () => undefined,
      category: 'AI Commands',
    },
    {
      id: 'ai-translate',
      label: 'AI Translate Message',
      icon: <AutoAwesomeIcon />,
      keywords: ['ai', 'translate', 'language'],
      action: () => undefined,
      category: 'AI Commands',
    },
  ];

  const conversationCommands: Command[] = search.trim()
    ? conversations
        .filter((conversation) => {
          const term = search.toLowerCase();
          return (
            conversation.subject.toLowerCase().includes(term) ||
            conversation.sender.name.toLowerCase().includes(term) ||
            conversation.preview.toLowerCase().includes(term)
          );
        })
        .slice(0, 5)
        .map((conversation) => ({
          id: `conversation-${conversation.id}`,
          label: conversation.subject,
          subtitle: `${conversation.sender.name} · ${formatDistanceToNow(conversation.timestamp, { addSuffix: true })}`,
          icon: <EmailIcon />,
          avatar: conversation.sender.avatar,
          channel: conversation.channel,
          keywords: [conversation.subject, conversation.sender.name, conversation.preview],
          action: () => {
            setSelectedConversationId(conversation.id);
            navigate(workspaceRoutes.inbox.path({ workspace_id: workspaceId, view_id: 'all' }));
          },
          category: 'Conversations',
        }))
    : [];

  const contactCommands: Command[] = search.trim()
    ? conversations
        .filter((conversation) => conversation.sender.name.toLowerCase().includes(search.toLowerCase()))
        .slice(0, 3)
        .map((conversation) => ({
          id: `contact-${conversation.sender.id}`,
          label: conversation.sender.name,
          subtitle: conversation.sender.email,
          icon: <PersonIcon />,
          avatar: conversation.sender.avatar,
          keywords: [conversation.sender.name, conversation.sender.email],
          action: () => navigate(workspaceRoutes.contacts.path({ workspace_id: workspaceId })),
          category: 'Contacts',
        }))
    : [];

  const allCommands = [...baseCommands, ...conversationCommands, ...contactCommands];

  const filteredCommands = search.trim()
    ? allCommands.filter((command) => {
        const term = search.toLowerCase();
        return (
          command.keywords.some((keyword) => keyword.toLowerCase().includes(term)) ||
          command.label.toLowerCase().includes(term)
        );
      })
    : baseCommands;

  const groupedCommands = filteredCommands.reduce(
    (groups, command) => {
      if (!groups[command.category]) groups[command.category] = [];
      groups[command.category].push(command);
      return groups;
    },
    {} as Record<string, Command[]>
  );

  const categoryOrder = ['Conversations', 'Contacts', 'Navigation', 'Actions', 'AI Commands', 'Settings'];
  const sortedCategories = Object.keys(groupedCommands).sort((left, right) => {
    const leftIndex = categoryOrder.indexOf(left);
    const rightIndex = categoryOrder.indexOf(right);
    return (leftIndex === -1 ? 999 : leftIndex) - (rightIndex === -1 ? 999 : rightIndex);
  });

  const handleClose = () => {
    closeCommandPalette();
    setSearch('');
    setSelectedIndex(0);
  };

  const handleExecute = (command: Command) => {
    command.action();
    handleClose();
  };

  useEffect(() => {
    if (isCommandPaletteOpen) {
      setSelectedIndex(0);
    }
  }, [isCommandPaletteOpen, search]);

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setSelectedIndex((current) => Math.min(current + 1, filteredCommands.length - 1));
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setSelectedIndex((current) => Math.max(current - 1, 0));
    } else if (event.key === 'Enter') {
      event.preventDefault();
      if (filteredCommands[selectedIndex]) {
        handleExecute(filteredCommands[selectedIndex]);
      }
    } else if (event.key === 'Escape') {
      handleClose();
    }
  };

  // Debug: Log command palette state
  if (isCommandPaletteOpen) {
    console.log('[CommandPalette] OPEN');
  }

  return (
    <Dialog
      open={isCommandPaletteOpen}
      slotProps={{
        backdrop: {
          'data-component': 'CommandPalette',
        } as any,
      }}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          overflow: 'hidden',
        },
      }}
    >
      <DialogContent sx={{ p: 0 }}>
        <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
          <TextField
            fullWidth
            placeholder="Search conversations, contacts, or actions..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            onKeyDown={handleKeyDown}
            autoFocus
            InputProps={{
              startAdornment: <SearchIcon sx={{ mr: 1.5, color: 'text.secondary' }} />,
              sx: {
                '& fieldset': { border: 'none' },
                fontSize: 15,
              },
            }}
          />
        </Box>

        <Box sx={{ maxHeight: 400, overflow: 'auto' }}>
          {sortedCategories.map((category) => (
            <Box key={category}>
              <Typography
                variant="caption"
                sx={{
                  px: 2,
                  py: 1,
                  display: 'block',
                  color: 'text.secondary',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  fontSize: 11,
                  bgcolor: alpha('#000', 0.02),
                }}
              >
                {category}
              </Typography>
              <List sx={{ py: 0 }}>
                {groupedCommands[category].map((command) => {
                  const globalIndex = filteredCommands.indexOf(command);
                  const channelColor = command.channel ? getChannelColor(command.channel) : alpha('#5E6AD2', 0.15);

                  return (
                    <ListItem key={command.id} disablePadding>
                      <ListItemButton
                        selected={globalIndex === selectedIndex}
                        onClick={() => handleExecute(command)}
                        sx={{
                          py: 1.5,
                          '&.Mui-selected': {
                            bgcolor: alpha('#5E6AD2', 0.08),
                          },
                        }}
                      >
                        {command.avatar ? (
                          <ListItemIcon sx={{ minWidth: 40 }}>
                            <Avatar
                              sx={{
                                width: 24,
                                height: 24,
                                fontSize: 11,
                                bgcolor: command.channel ? alpha(channelColor, 0.15) : alpha('#5E6AD2', 0.15),
                                color: command.channel ? channelColor : '#5E6AD2',
                              }}
                            >
                              {command.avatar}
                            </Avatar>
                          </ListItemIcon>
                        ) : (
                          <ListItemIcon sx={{ minWidth: 40, color: 'text.secondary' }}>{command.icon}</ListItemIcon>
                        )}
                        <ListItemText
                          primary={command.label}
                          secondary={command.subtitle}
                          primaryTypographyProps={{ fontSize: 14 }}
                          secondaryTypographyProps={{ fontSize: 12 }}
                        />
                        {command.shortcut ? (
                          <Chip
                            label={command.shortcut}
                            size="small"
                            sx={{
                              height: 20,
                              fontSize: 11,
                              fontWeight: 600,
                              bgcolor: alpha('#000', 0.06),
                            }}
                          />
                        ) : null}
                        {command.channel ? (
                          <Chip
                            label={getChannelLabel(command.channel)}
                            size="small"
                            sx={{
                              height: 20,
                              fontSize: 10,
                              fontWeight: 600,
                              bgcolor: alpha(channelColor, 0.1),
                              color: channelColor,
                            }}
                          />
                        ) : null}
                      </ListItemButton>
                    </ListItem>
                  );
                })}
              </List>
            </Box>
          ))}

          {filteredCommands.length === 0 ? (
            <Box sx={{ py: 8, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                No results found
              </Typography>
            </Box>
          ) : null}
        </Box>

        <Box
          sx={{
            px: 2,
            py: 1.5,
            borderTop: 1,
            borderColor: 'divider',
            bgcolor: alpha('#000', 0.01),
            display: 'flex',
            gap: 2,
            fontSize: 12,
            color: 'text.secondary',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Chip label="↑↓" size="small" sx={{ height: 18, fontSize: 10 }} />
            <Typography variant="caption">Navigate</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Chip label="↵" size="small" sx={{ height: 18, fontSize: 10 }} />
            <Typography variant="caption">Execute</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Chip label="Esc" size="small" sx={{ height: 18, fontSize: 10 }} />
            <Typography variant="caption">Close</Typography>
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  );
};
