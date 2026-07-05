// @ts-nocheck
/**
 * Layout Component: ThreadPane (Layer 3)
 * 
 * Defines structural container for message thread and composer.
 * Manages thread layout, header, and composer UI.
 */

import { Box, Typography, IconButton, Chip, Button, TextField, Menu, MenuItem, ListItemIcon, ListItemText, Divider, alpha } from '@mui/material';
import {
  MoreVert as MoreVertIcon,
  Reply as ReplyIcon,
  Archive as ArchiveIcon,
  Delete as DeleteIcon,
  Schedule as ScheduleIcon,
  AttachFile as AttachFileIcon,
  Send as SendIcon,
  PersonAdd as PersonAddIcon,
  Label as LabelIcon,
  CheckCircle as CheckCircleIcon,
  Forward as ForwardIcon,
  Print as PrintIcon,
  Report as ReportIcon,
} from '@mui/icons-material';
import { Message } from '../types';
import { getChannelColor, getChannelLabel } from '@/lib/mockMessages';
import { getMuiIcon } from '@/features/integrations/utils/getMuiIcon';
import { useInboxUIStore } from '../store/inboxUIStore';
import { useState, useRef, useEffect } from 'react';
import { MessageTimelineContainer } from '../containers/MessageTimelineContainer';
import { KeyboardHintsFooter } from '@/layout/KeyboardHintsFooter';
import { color, spacing, typography, radius, text, transition, elevation } from '../../../shared/tokens/design-tokens';
import { toast } from 'sonner';

interface ThreadPaneProps {
  conversation: Message | null;
  messages?: Message[];
  isMessagesLoading?: boolean;
  isSending?: boolean;
  onMarkAsRead: (messageId: string) => void;
  onArchive: (messageId: string) => void;
  onSendReply?: (conversationId: string, body: string) => void;
}

export const ThreadPane = ({ conversation: message, messages = [], isMessagesLoading = false, isSending = false, onMarkAsRead, onArchive, onSendReply }: ThreadPaneProps) => {
  const { composerDraft, setComposerDraft, clearComposerDraft } = useInboxUIStore();
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [assignMenuAnchor, setAssignMenuAnchor] = useState<null | HTMLElement>(null);
  const [statusMenuAnchor, setStatusMenuAnchor] = useState<null | HTMLElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const composerRef = useRef<HTMLInputElement>(null);

  // Simulate message loading
  useEffect(() => {
    if (message) {
      setIsLoading(true);
      const timer = setTimeout(() => setIsLoading(false), 300);
      return () => clearTimeout(timer);
    }
  }, [message?.id]);

  // Autofocus composer when conversation selected
  useEffect(() => {
    if (message && composerRef.current && !isLoading) {
      const timer = setTimeout(() => {
        composerRef.current?.focus();
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [message?.id, isLoading]);

  if (!message) {
    return (
      <Box
        sx={{
          flex: 1,
          height: '100vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          bgcolor: color.surface.work, // Layer 3 - Work surface (semantic token)
        }}
      >
        <Box
          sx={{
            width: 64,
            height: 64,
            borderRadius: radius.md,
            bgcolor: alpha(color.neutral[900], 0.03),
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mb: spacing[16],
          }}
        >
          <ReplyIcon sx={{ fontSize: 32, color: text.secondary }} />
        </Box>
        <Typography 
          sx={{ 
            fontSize: typography.fontSize.xl,
            fontWeight: typography.fontWeight.medium,
            color: text.secondary,
            mb: spacing[8],
          }}
        >
          Select a conversation
        </Typography>
        <Typography 
          sx={{ 
            fontSize: typography.fontSize.md,
            color: text.tertiary,
          }}
        >
          Choose a conversation to view messages
        </Typography>
      </Box>
    );
  }

  const ServiceIcon = getMuiIcon(message.service === 'slack' ? 'Chat' : message.service === 'gmail' ? 'Email' : 'Hub');
  const serviceLabel = message.service === 'gmail' ? 'Gmail' : message.service === 'slack' ? 'Slack' : message.service;

  return (
    <Box
      sx={{
        flex: 1,
        minWidth: 0,
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: color.surface.work, // Layer 3 - Work surface (semantic token)
      }}
    >
      {/* Header - Progressive Disclosure */}
      <Box
        sx={{
          px: spacing[24],
          py: spacing[16],
          borderBottom: `1px solid ${alpha(color.neutral[900], 0.04)}`, // Tonal surface instead of visible border
          display: 'flex',
          alignItems: 'center',
          gap: spacing[16],
          bgcolor: alpha(color.neutral[50], 0.3), // Subtle surface tone for dominance
        }}
      >
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: spacing[12], mb: spacing[4] }}>
            <Typography 
              sx={{ 
                fontSize: typography.fontSize.xl,
                fontWeight: typography.fontWeight.semibold, // Increased from medium for thread title authority
                color: text.primary,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {message.subject}
            </Typography>
            
            <Chip
              label={getChannelLabel(message.channel)}
              size="small"
              sx={{
                height: 20,
                fontSize: typography.fontSize.xs,
                fontWeight: typography.fontWeight.semibold,
                bgcolor: alpha(getChannelColor(message.channel), 0.1),
                color: getChannelColor(message.channel),
                borderRadius: radius.sm,
              }}
            />

            {serviceLabel && (
              <Chip
                icon={<ServiceIcon sx={{ fontSize: 14 }} />}
                label={serviceLabel}
                size="small"
                sx={{
                  height: 20,
                  fontSize: typography.fontSize.xs,
                  fontWeight: typography.fontWeight.semibold,
                  bgcolor: alpha(color.neutral[900], 0.04),
                  color: text.secondary,
                  borderRadius: radius.sm,
                  '& .MuiChip-icon': {
                    color: text.secondary,
                    ml: spacing[6],
                  },
                }}
              />
            )}

            {message.priority === 'urgent' && (
              <Chip
                label="Urgent"
                size="small"
                sx={{
                  height: 20,
                  fontSize: typography.fontSize.xs,
                  fontWeight: typography.fontWeight.semibold,
                  bgcolor: alpha(color.functional.error, 0.1),
                  color: color.functional.error,
                  borderRadius: radius.sm,
                }}
              />
            )}
          </Box>
          
          <Typography 
            sx={{ 
              fontSize: typography.fontSize.sm,
              color: text.secondary,
            }}
          >
            {message.sender.organization}
          </Typography>
        </Box>

        {/* Primary Actions Only: Assign and Status */}
        <Button
          variant="text" // Changed from outlined - lighter, more tool-like
          size="small"
          startIcon={<PersonAddIcon />}
          onClick={(e) => setAssignMenuAnchor(e.currentTarget)}
          sx={{
            textTransform: 'none',
            borderRadius: radius.base,
            fontSize: typography.fontSize.sm, // Reduced from base for less dominance
            fontWeight: typography.fontWeight.medium,
            color: text.secondary, // Reduced from primary
            bgcolor: 'transparent',
            px: spacing[12],
            transition: `all ${transition.duration.fast} ${transition.easing.base}`,
            '&:hover': {
              color: text.primary,
              bgcolor: alpha(color.neutral[900], 0.04), // Subtle surface on hover
            },
          }}
        >
          Assign
        </Button>

        <Button
          variant="text"
          size="small"
          startIcon={<CheckCircleIcon />}
          onClick={(e) => setStatusMenuAnchor(e.currentTarget)}
          sx={{
            textTransform: 'none',
            borderRadius: radius.base,
            fontSize: typography.fontSize.sm,
            fontWeight: typography.fontWeight.medium,
            color: text.secondary,
            bgcolor: 'transparent',
            px: spacing[12],
            transition: `all ${transition.duration.fast} ${transition.easing.base}`,
            '&:hover': {
              color: text.primary,
              bgcolor: alpha(color.neutral[900], 0.04),
            },
          }}
        >
          Status
        </Button>

        {/* Overflow Menu for Advanced Actions */}
        <IconButton 
          size="small" 
          sx={{ 
            color: text.secondary,
            transition: `all ${transition.duration.fast} ${transition.easing.base}`,
            '&:hover': {
              bgcolor: alpha(color.neutral[900], 0.04),
            },
          }}
          onClick={(e) => setMenuAnchorEl(e.currentTarget)}
        >
          <MoreVertIcon fontSize="small" />
        </IconButton>

        <Menu
          anchorEl={menuAnchorEl}
          open={Boolean(menuAnchorEl)}
          onClose={() => setMenuAnchorEl(null)}
          sx={{
            '& .MuiPaper-root': {
              borderRadius: radius.md,
              minWidth: 200,
              boxShadow: elevation[3],
            },
          }}
        >
          <MenuItem onClick={() => { setMenuAnchorEl(null); toast.success('Label menu will open here'); }}>
            <ListItemIcon>
              <LabelIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText 
              primary="Add Label" 
              primaryTypographyProps={{ fontSize: typography.fontSize.md }}
            />
            <Typography variant="caption" color="text.secondary" sx={{ ml: 2 }}>
              L
            </Typography>
          </MenuItem>
          <MenuItem onClick={() => { onArchive(message.id); setMenuAnchorEl(null); }}>
            <ListItemIcon>
              <ArchiveIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText 
              primary="Archive" 
              primaryTypographyProps={{ fontSize: typography.fontSize.md }}
            />
            <Typography variant="caption" color="text.secondary" sx={{ ml: 2 }}>
              A
            </Typography>
          </MenuItem>
          <MenuItem onClick={() => { setMenuAnchorEl(null); toast.success('Snoozed until tomorrow 9:00 AM'); }}>
            <ListItemIcon>
              <ScheduleIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText 
              primary="Snooze" 
              primaryTypographyProps={{ fontSize: typography.fontSize.md }}
            />
            <Typography variant="caption" color="text.secondary" sx={{ ml: 2 }}>
              S
            </Typography>
          </MenuItem>
          <MenuItem onClick={() => { setMenuAnchorEl(null); toast.info('Forward dialog will open here'); }}>
            <ListItemIcon>
              <ForwardIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText 
              primary="Forward" 
              primaryTypographyProps={{ fontSize: typography.fontSize.md }}
            />
            <Typography variant="caption" color="text.secondary" sx={{ ml: 2 }}>
              F
            </Typography>
          </MenuItem>
          <Divider />
          <MenuItem onClick={() => { setMenuAnchorEl(null); window.print(); }}>
            <ListItemIcon>
              <PrintIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText 
              primary="Print" 
              primaryTypographyProps={{ fontSize: typography.fontSize.md }}
            />
          </MenuItem>
          <MenuItem onClick={() => { setMenuAnchorEl(null); toast.success('Message reported as spam'); }}>
            <ListItemIcon>
              <ReportIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText 
              primary="Report Spam" 
              primaryTypographyProps={{ fontSize: typography.fontSize.md }}
            />
          </MenuItem>
          <Divider />
          <MenuItem onClick={() => { setMenuAnchorEl(null); toast.success('Message deleted'); }} sx={{ color: color.functional.error }}>
            <ListItemIcon>
              <DeleteIcon fontSize="small" color="error" />
            </ListItemIcon>
            <ListItemText 
              primary="Delete" 
              primaryTypographyProps={{ fontSize: typography.fontSize.md }}
            />
          </MenuItem>
        </Menu>

        {/* Assign Menu */}
        <Menu
          anchorEl={assignMenuAnchor}
          open={Boolean(assignMenuAnchor)}
          onClose={() => setAssignMenuAnchor(null)}
          sx={{
            '& .MuiPaper-root': {
              borderRadius: radius.md,
              minWidth: 200,
              boxShadow: elevation[3],
            },
          }}
        >
          <MenuItem onClick={() => { setAssignMenuAnchor(null); toast.success('Assigned to you'); }}>
            <ListItemText primary="Assign to Me" primaryTypographyProps={{ fontSize: typography.fontSize.md }} />
          </MenuItem>
          <MenuItem onClick={() => { setAssignMenuAnchor(null); toast.info('Team member selection dialog will open'); }}>
            <ListItemText primary="Assign to Team Member..." primaryTypographyProps={{ fontSize: typography.fontSize.md }} />
          </MenuItem>
          <Divider />
          <MenuItem onClick={() => { setAssignMenuAnchor(null); toast.success('Conversation unassigned'); }}>
            <ListItemText primary="Unassign" primaryTypographyProps={{ fontSize: typography.fontSize.md }} />
          </MenuItem>
        </Menu>

        {/* Status Menu */}
        <Menu
          anchorEl={statusMenuAnchor}
          open={Boolean(statusMenuAnchor)}
          onClose={() => setStatusMenuAnchor(null)}
          sx={{
            '& .MuiPaper-root': {
              borderRadius: radius.md,
              minWidth: 180,
              boxShadow: elevation[3],
            },
          }}
        >
          <MenuItem onClick={() => { setStatusMenuAnchor(null); toast.success('Status: Open'); }}>
            <ListItemText primary="Open" primaryTypographyProps={{ fontSize: typography.fontSize.md }} />
          </MenuItem>
          <MenuItem onClick={() => { setStatusMenuAnchor(null); toast.success('Status: Pending'); }}>
            <ListItemText primary="Pending" primaryTypographyProps={{ fontSize: typography.fontSize.md }} />
          </MenuItem>
          <MenuItem onClick={() => { setStatusMenuAnchor(null); toast.success('Status: Closed'); }}>
            <ListItemText primary="Closed" primaryTypographyProps={{ fontSize: typography.fontSize.md }} />
          </MenuItem>
          <Divider />
          <MenuItem onClick={() => { setStatusMenuAnchor(null); toast.success('Conversation archived'); }}>
            <ListItemText primary="Archive" primaryTypographyProps={{ fontSize: typography.fontSize.md }} />
          </MenuItem>
        </Menu>
      </Box>

      {/* Thread Content */}
      <Box sx={{ flex: 1, minHeight: 0, overflow: 'auto', px: spacing[32], py: spacing[24] }}>
        <MessageTimelineContainer
          message={message}
          messages={messages}
          isLoading={isLoading || isMessagesLoading}
        />
      </Box>

      {/* Reply Composer */}
      <Box
        sx={{
          px: spacing[32], // Increased from 24 for more spatial authority
          pt: spacing[20], // More breathing room above composer
          pb: spacing[16],
          flexShrink: 0,
          borderTop: `1px solid ${alpha(color.neutral[900], 0.06)}`, // Softer divider
          bgcolor: alpha(color.neutral[50], 0.25), // Subtle surface differentiation
        }}
      >
        <Box sx={{ display: 'flex', gap: spacing[12], alignItems: 'flex-end' }}>
          <TextField
            fullWidth
            multiline
            minRows={1}
            maxRows={4}
            placeholder="Type your reply..."
            value={composerDraft}
            onChange={(e) => setComposerDraft(e.target.value)}
            inputRef={composerRef}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: radius.base,
                fontSize: typography.fontSize.md,
                bgcolor: color.neutral[0],
                borderColor: color.neutral[200],
                minHeight: '46px', // Increased from default ~40px for more presence
                py: spacing[12], // Vertical padding for authority
                transition: `all ${transition.duration.fast} ${transition.easing.base}`,
                '&:hover': {
                  borderColor: color.neutral[300],
                },
                '&.Mui-focused': {
                  borderColor: color.functional.primary,
                  boxShadow: `0 0 0 3px ${alpha(color.functional.primary, 0.08)}`,
                },
              },
            }}
          />
          
          <IconButton
            sx={{
              color: text.secondary,
              transition: `all ${transition.duration.fast} ${transition.easing.base}`,
              '&:hover': { 
                bgcolor: alpha(color.neutral[900], 0.04),
              },
            }}
          >
            <AttachFileIcon />
          </IconButton>

          <Button
            variant="contained"
            endIcon={<SendIcon />}
            disabled={!composerDraft.trim() || isSending}
            onClick={() => {
              if (!message || !composerDraft.trim()) return;
              onSendReply?.(message.id, composerDraft.trim());
              clearComposerDraft();
            }}
            sx={{
              borderRadius: radius.base,
              textTransform: 'none',
              fontSize: typography.fontSize.md,
              fontWeight: typography.fontWeight.medium,
              px: spacing[24],
              flexShrink: 0,
              bgcolor: color.functional.primary,
              boxShadow: 'none',
              transition: `all ${transition.duration.fast} ${transition.easing.base}`,
              '&:hover': { 
                bgcolor: color.functional.primaryHover,
                boxShadow: `0 4px 12px ${alpha(color.functional.primary, 0.3)}`,
                transform: 'translateY(-1px)',
              },
              '&:active': {
                transform: 'translateY(0)',
              },
            }}
          >
            {isSending ? 'Sending...' : 'Send'}
          </Button>
        </Box>

      </Box>

      {/* Keyboard Hints Footer */}
      <KeyboardHintsFooter />
    </Box>
  );
};
