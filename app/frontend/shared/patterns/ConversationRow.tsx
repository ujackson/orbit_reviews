import { Box, Typography, Avatar, Chip, alpha } from '@mui/material';
import { AttachFile as AttachFileIcon } from '@mui/icons-material';
import { color, spacing, typography, transition, radius, text, opacity } from '../tokens/design-tokens';
import { motion } from 'motion/react';

interface ConversationRowProps {
  id: string;
  senderName: string;
  senderAvatar: string;
  subject: string;
  preview: string;
  timestamp: Date;
  channel: string;
  channelColor: string;
  channelLabel: string;
  isUnread: boolean;
  isSelected: boolean;
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
  isUnread,
  isSelected,
  hasAttachments = false,
  isUrgent = false,
  onClick,
}: ConversationRowProps) => {
  const timeLabel = new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(timestamp);

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
          py: spacing[12], // Reduced for density
          borderBottom: `1px solid ${color.neutral[200]}`,
          cursor: 'pointer',
          transition: `background-color ${transition.duration.fast} ${transition.easing.base}`,
          '&:hover': {
            bgcolor: isSelected ? alpha(color.functional.primary, 0.12) : alpha(color.neutral[900], 0.02),
          },
        }}
      >
        <Box sx={{ display: 'flex', gap: spacing[12], width: '100%' }}>
          {/* Avatar */}
          <Avatar
            sx={{
              width: 40,
              height: 40,
              bgcolor: alpha(channelColor, 0.15),
              color: channelColor,
              fontSize: typography.fontSize.base,
              fontWeight: typography.fontWeight.semibold,
            }}
          >
            {senderAvatar}
          </Avatar>

          {/* Content */}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            {/* Header - Name + Time */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: spacing[8], mb: spacing[4] }}>
              <Typography
                sx={{
                  fontWeight: isUnread ? typography.fontWeight.semibold : typography.fontWeight.normal,
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
                  color: text.secondary,
                  fontSize: typography.fontSize.xs,
                  fontWeight: typography.fontWeight.medium, // Increased contrast
                  flexShrink: 0,
                }}
              >
                {timeLabel}
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

            {/* Preview - Lighter emphasis */}
            <Typography
              sx={{
                fontSize: typography.fontSize.base,
                fontWeight: typography.fontWeight.normal,
                color: text.secondary,
                opacity: opacity.secondary, // Lighter for tertiary content
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
                size="small"
                sx={{
                  height: 18,
                  fontSize: typography.fontSize.xs,
                  fontWeight: typography.fontWeight.semibold,
                  bgcolor: alpha(channelColor, 0.1),
                  color: channelColor,
                  borderRadius: radius.sm,
                }}
              />

              {isUrgent && (
                <Chip
                  label="Urgent"
                  size="small"
                  sx={{
                    height: 18,
                    fontSize: typography.fontSize.xs,
                    fontWeight: typography.fontWeight.semibold,
                    bgcolor: alpha(color.functional.error, 0.1),
                    color: color.functional.error,
                    borderRadius: radius.sm,
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
