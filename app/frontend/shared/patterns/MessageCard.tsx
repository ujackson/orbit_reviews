import { Box, Typography, Avatar, Chip, alpha } from '@mui/material';
import { color, spacing, typography, radius, text } from '../tokens/design-tokens';
import { motion } from 'motion/react';

type Attachment = {
  id: string;
  name?: string;
  fileName?: string;
};

export type MessageCardType = 'inbound' | 'outbound' | 'note';

interface MessageCardProps {
  type: MessageCardType;
  senderName: string;
  senderAvatar: string;
  senderEmail?: string;
  timestamp: Date;
  content: string;
  channelColor: string;
  attachments?: Attachment[];
}

export const MessageCard = ({
  type,
  senderName,
  senderAvatar,
  timestamp,
  content,
  channelColor,
  attachments = [],
}: MessageCardProps) => {
  const timestampLabel = new Intl.DateTimeFormat(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(timestamp);

  const getCardStyles = () => {
    switch (type) {
      case 'outbound':
        return {
          bgcolor: alpha(color.functional.primary, 0.025), // Desaturated for tonal surface
          boxShadow: 'none', // Removed elevation - let spacing define structure
          border: `1px solid ${alpha(color.functional.primary, 0.06)}`, // Softer border - tonal difference
        };
      case 'note':
        return {
          bgcolor: color.surface.aiSubtle, // Semantic AI surface token
          border: 'none', // Tonal surface instead of border
          borderRadius: radius.base,
        };
      case 'inbound':
      default:
        return {
          bgcolor: color.surface.work, // Semantic work surface token - document-first
          border: `1px solid ${alpha(color.neutral[900], 0.05)}`, // Minimal tonal border
        };
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.12, ease: 'easeOut' }}
    >
      <Box sx={{ mb: spacing[24] }}>
        {/* Sender Info */}
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: spacing[16], mb: spacing[16] }}>
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
          
          <Box sx={{ flex: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: spacing[8], mb: spacing[4] }}>
              <Typography 
                sx={{ 
                  fontWeight: typography.fontWeight.semibold, 
                  fontSize: typography.fontSize.md,
                  color: text.primary,
                }}
              >
                {senderName}
              </Typography>
              {type === 'note' && (
                <Chip
                  label="Internal Note"
                  size="small"
                  sx={{
                    height: 18,
                    fontSize: typography.fontSize.xs,
                    bgcolor: alpha(color.ai[500], 0.1),
                    color: color.ai[700],
                  }}
                />
              )}
            </Box>
            
            <Typography 
              sx={{ 
                fontSize: typography.fontSize.base,
                color: text.secondary,
              }}
            >
              {timestampLabel}
            </Typography>
          </Box>
        </Box>

        {/* Message Body */}
        <Box
          sx={{
            ml: spacing[48] + spacing[16], // Align with content after avatar
            p: spacing[16],
            borderRadius: radius.md,
            ...getCardStyles(),
          }}
        >
          <Typography
            sx={{
              whiteSpace: 'pre-wrap',
              lineHeight: typography.lineHeight.relaxed,
              fontSize: typography.fontSize.md,
              color: text.primary,
            }}
          >
            {content}
          </Typography>
          
          {/* Attachments */}
          {attachments.length > 0 && (
            <Box sx={{ mt: spacing[20], display: 'flex', flexDirection: 'column', gap: spacing[12] }}>
              {attachments.map((attachment) => (
                <Chip key={attachment.id} label={attachment.fileName || attachment.name || 'Attachment'} size="small" />
              ))}
            </Box>
          )}
        </Box>
      </Box>
    </motion.div>
  );
};
