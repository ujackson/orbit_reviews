// @ts-nocheck
/**
 * Component: AttachmentTray
 * 
 * Compact attachment preview tray above composer with drag-and-drop.
 * Minimalist enterprise design with clear affordance.
 */

import { Box, Typography, IconButton, alpha } from '@mui/material';
import {
  Close as CloseIcon,
  AttachFile as AttachIcon,
  CloudUpload as UploadIcon,
} from '@mui/icons-material';
import { Attachment, formatFileSize, getAttachmentIcon } from '../types/attachment';
import { color, spacing, typography, radius, text } from '../../../shared/tokens/design-tokens';

interface AttachmentTrayProps {
  attachments: Attachment[];
  onRemove: (attachmentId: string) => void;
  onAdd?: () => void;
}

export const AttachmentTray = ({ attachments, onRemove, onAdd }: AttachmentTrayProps) => {
  if (attachments.length === 0) {
    return null;
  }

  return (
    <Box
      sx={{
        px: spacing[24],
        py: spacing[12],
        borderBottom: `1px solid ${alpha(color.neutral[900], 0.06)}`,
        bgcolor: alpha(color.neutral[50], 0.5),
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: spacing[8], flexWrap: 'wrap' }}>
        {attachments.map((attachment) => (
          <Box
            key={attachment.id}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: spacing[8],
              pl: spacing[10],
              pr: spacing[6],
              py: spacing[6],
              borderRadius: radius.sm,
              bgcolor: alpha(color.neutral[900], 0.04),
              border: `1px solid ${alpha(color.neutral[900], 0.08)}`,
              transition: 'all 0.12s ease-out',
              '&:hover': {
                bgcolor: alpha(color.neutral[900], 0.06),
                borderColor: alpha(color.neutral[900], 0.12),
              },
            }}
          >
            {/* Icon */}
            <Typography sx={{ fontSize: typography.fontSize.base }}>
              {getAttachmentIcon(attachment.type)}
            </Typography>

            {/* Name & Size */}
            <Box>
              <Typography
                sx={{
                  fontSize: typography.fontSize.xs,
                  fontWeight: typography.fontWeight.medium,
                  color: text.primary,
                  maxWidth: 180,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {attachment.name}
              </Typography>
              <Typography sx={{ fontSize: typography.fontSize.xs, color: text.tertiary }}>
                {formatFileSize(attachment.size)}
              </Typography>
            </Box>

            {/* Remove button */}
            <IconButton
              size="small"
              onClick={() => onRemove(attachment.id)}
              sx={{
                width: 18,
                height: 18,
                color: text.tertiary,
                '&:hover': {
                  bgcolor: alpha(color.neutral[900], 0.08),
                  color: text.secondary,
                },
              }}
            >
              <CloseIcon sx={{ fontSize: 14 }} />
            </IconButton>
          </Box>
        ))}

        {/* Add more button */}
        {onAdd && (
          <IconButton
            size="small"
            onClick={onAdd}
            sx={{
              width: 28,
              height: 28,
              color: text.tertiary,
              border: `1px dashed ${alpha(color.neutral[900], 0.2)}`,
              borderRadius: radius.sm,
              '&:hover': {
                bgcolor: alpha(color.neutral[900], 0.04),
                borderColor: alpha(color.neutral[900], 0.3),
              },
            }}
          >
            <AttachIcon sx={{ fontSize: 16 }} />
          </IconButton>
        )}
      </Box>
    </Box>
  );
};

// Drag-and-drop zone for empty state
export const AttachmentDropZone = ({ onDrop }: { onDrop?: () => void }) => {
  return (
    <Box
      sx={{
        px: spacing[24],
        py: spacing[16],
        borderBottom: `1px solid ${alpha(color.neutral[900], 0.06)}`,
        bgcolor: alpha(color.ai[500], 0.02),
        border: `1px dashed ${alpha(color.ai[500], 0.2)}`,
        borderRadius: radius.base,
        transition: 'all 0.12s ease-out',
        cursor: 'pointer',
        '&:hover': {
          bgcolor: alpha(color.ai[500], 0.04),
          borderColor: alpha(color.ai[500], 0.3),
        },
      }}
      onClick={onDrop}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: spacing[12], justifyContent: 'center' }}>
        <UploadIcon sx={{ fontSize: 20, color: alpha(color.ai[600], 0.6) }} />
        <Typography
          sx={{
            fontSize: typography.fontSize.sm,
            color: text.secondary,
          }}
        >
          Drop files here or click to attach
        </Typography>
      </Box>
    </Box>
  );
};
