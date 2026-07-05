// @ts-nocheck
/**
 * Pattern: ConversationRow (Layer 2)
 * 
 * Combines primitives into a reusable conversation list item structure.
 * Knows about layout but NOT data sources.
 * 
 * States: default, hover, selected, loading, focused
 */

import { Box, Typography, alpha } from '@mui/material';
import { AttachFile as AttachFileIcon } from '@mui/icons-material';
import { Avatar, Chip } from '../../../shared/ui/primitives';
import { getMuiIcon } from '@/features/integrations/utils/getMuiIcon';
import { color, spacing, typography, radius, text, transition, status } from '../../../shared/tokens/design-tokens';
import { formatDistanceToNow } from 'date-fns';
import { motion } from 'motion/react';

export interface ConversationRowProps {
  id: string;
  senderName: string;
  senderAvatar: string;
  subject: string;
  preview: string;
  timestamp: Date;
  channelColor: string;
  channelLabel: string;
  service?: string;
  isUnread: boolean;
  isSelected: boolean;
  isFocused?: boolean;
  hasAttachments?: boolean;
  isUrgent?: boolean;
  onClick: () => void;
}

export const ConversationRow = ({
  senderName,
  senderAvatar,
  subject,
  preview,
  timestamp,
  channelColor,
  channelLabel,
  service,
  isUnread,
  isSelected,
  isFocused = false,
  hasAttachments = false,
  isUrgent = false,
  onClick,
}: ConversationRowProps) => {
  const ServiceIcon = getMuiIcon(service === 'slack' ? 'Chat' : service === 'gmail' ? 'Email' : 'Hub');
  const serviceLabel = service === 'gmail' ? 'Gmail' : service === 'slack' ? 'Slack' : service;
  const avatarIsImage = /^https?:\/\//.test(senderAvatar || '');

  return (
    <motion.div
      initial={false}
      animate={{ 
        backgroundColor: isSelected ? alpha(color.functional.primary, 0.08) : 'rgba(0, 0, 0, 0)',
      }}
      transition={{ duration: 0.12 }}
    >
      <Box
        onClick={onClick}
        sx={{
          px: spacing[16],
          py: spacing[10], // Reduced from spacing[12] for tighter density
          borderBottom: `1px solid ${alpha(color.neutral[900], 0.04)}`, // Tonal surface instead of visible border
          cursor: 'pointer',
          transition: `background-color ${transition.duration.fast} ${transition.easing.base}`,
          position: 'relative',
          
          // Default state
          // Hover state
          '&:hover': {
            bgcolor: isSelected ? alpha(color.functional.primary, 0.12) : alpha(color.neutral[900], 0.02),
          },
          
          // Focused state (keyboard navigation)
          ...(isFocused && {
            outline: `2px solid ${color.functional.primary}`,
            outlineOffset: '-2px',
          }),
        }}
      >
        <Box sx={{ display: 'flex', gap: spacing[12], width: '100%' }}>
          {/* Avatar with hover fade animation */}
          <motion.div
            initial={false}
            animate={{ 
              opacity: isSelected ? 1 : 0.92,
            }}
            whileHover={{ 
              opacity: 1,
            }}
            transition={{ duration: 0.12 }}
          >
            <Avatar size="md" accentColor={channelColor} src={avatarIsImage ? senderAvatar : undefined}>
              {avatarIsImage ? undefined : senderAvatar}
            </Avatar>
          </motion.div>

          {/* Content */}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            {/* Header - Name + Time */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: spacing[8], mb: spacing[4] }}>
              <Typography
                sx={{
                  fontWeight: isUnread ? typography.fontWeight.semibold : typography.fontWeight.medium, // Sender name leads scanning
                  fontSize: typography.fontSize.md,
                  color: text.primary,
                  flex: 1,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {senderName}
              </Typography>

              <Typography
                sx={{
                  color: text.tertiary, // Reduced from secondary for less prominence
                  fontSize: typography.fontSize.xs,
                  fontWeight: typography.fontWeight.normal, // Reduced from medium
                  flexShrink: 0,
                }}
              >
                {formatDistanceToNow(timestamp, { addSuffix: false })}
              </Typography>
            </Box>

            {/* Subject */}
            <Typography
              sx={{
                fontSize: typography.fontSize.base,
                fontWeight: isUnread ? typography.fontWeight.semibold : typography.fontWeight.normal,
                color: text.primary,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                mb: spacing[4],
              }}
            >
              {subject}
            </Typography>

            {/* Preview - Reduced prominence so sender name leads */}
            <Typography
              sx={{
                fontSize: typography.fontSize.sm, // Reduced from base for less prominence
                fontWeight: typography.fontWeight.normal,
                color: text.tertiary, // Reduced from secondary
                opacity: 0.65, // Reduced from 0.7 for quieter presence
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                mb: spacing[4],
              }}
            >
              {preview}
            </Typography>

            {/* Tags */}
            <Box sx={{ display: 'flex', gap: spacing[8], alignItems: 'center' }}>
              <Chip
                label={channelLabel}
                size="sm"
                sx={{
                  bgcolor: alpha(channelColor, 0.1),
                  color: channelColor,
                }}
              />

              {serviceLabel && (
                <Chip
                  icon={<ServiceIcon sx={{ fontSize: 12 }} />}
                  label={serviceLabel}
                  size="sm"
                  sx={{
                    bgcolor: alpha(color.neutral[900], 0.04),
                    color: text.secondary,
                    '& .MuiChip-icon': {
                      color: text.secondary,
                      ml: spacing[4],
                    },
                  }}
                />
              )}

              {isUrgent && (
                <Chip
                  label="Urgent"
                  size="sm"
                  sx={{
                    bgcolor: status.urgent.bg, // Semantic status token - desaturated, informational
                    color: status.urgent.text, // Muted text - readable but not dominant
                  }}
                />
              )}

              {hasAttachments && (
                <AttachFileIcon
                  sx={{
                    fontSize: 14,
                    color: text.secondary,
                    transform: 'rotate(45deg)',
                  }}
                />
              )}

              {isUnread && (
                <Box
                  sx={{
                    width: 6,
                    height: 6,
                    borderRadius: '50%',
                    bgcolor: color.functional.primary,
                    ml: 'auto',
                  }}
                />
              )}
            </Box>
          </Box>
        </Box>
      </Box>
    </motion.div>
  );
};

/**
 * Loading State Variant
 */
export const ConversationRowSkeleton = () => {
  return (
    <Box sx={{ px: spacing[16], py: spacing[12], borderBottom: `1px solid ${color.neutral[200]}` }}>
      <Box sx={{ display: 'flex', gap: spacing[12] }}>
        <Box
          sx={{
            width: 40,
            height: 40,
            borderRadius: '50%',
            bgcolor: color.neutral[200],
          }}
        />
        <Box sx={{ flex: 1 }}>
          <Box
            sx={{
              height: 14,
              width: '60%',
              bgcolor: color.neutral[200],
              borderRadius: radius.sm,
              mb: spacing[8],
            }}
          />
          <Box
            sx={{
              height: 12,
              width: '80%',
              bgcolor: color.neutral[100],
              borderRadius: radius.sm,
            }}
          />
        </Box>
      </Box>
    </Box>
  );
};

/**
 * Empty State Variant
 */
export const ConversationRowEmpty = ({ message }: { message: string }) => {
  return (
    <Box
      sx={{
        textAlign: 'center',
        py: spacing[64],
        px: spacing[24],
      }}
    >
      <Typography
        sx={{
          fontSize: typography.fontSize.md,
          color: text.secondary,
        }}
      >
        {message}
      </Typography>
    </Box>
  );
};
