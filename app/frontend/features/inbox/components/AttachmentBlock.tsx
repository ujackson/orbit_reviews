// @ts-nocheck
/**
 * Component: AttachmentBlock
 * 
 * Displays attachments in thread with provenance and preview.
 * Image thumbnails and file blocks with metadata.
 */

import { Box, Typography, IconButton, alpha } from '@mui/material';
import {
  Download as DownloadIcon,
  InsertDriveFile as FileIcon,
  Image as ImageIcon,
  PictureAsPdf as PdfIcon,
  Description as DocIcon,
  TableChart as SpreadsheetIcon,
  VideoLibrary as VideoIcon,
} from '@mui/icons-material';
import { Attachment, AttachmentType, formatFileSize } from '../types/attachment';
import { getChannelLabel } from '@/lib/mockMessages';
import { color, spacing, typography, radius, text } from '../../../shared/tokens/design-tokens';

interface AttachmentBlockProps {
  attachment: Attachment;
  variant?: 'inline' | 'compact';
}

const getTypeIcon = (type: AttachmentType) => {
  const iconProps = { sx: { fontSize: 20, color: text.secondary } };
  
  switch (type) {
    case 'image':
      return <ImageIcon {...iconProps} />;
    case 'pdf':
      return <PdfIcon {...iconProps} />;
    case 'document':
      return <DocIcon {...iconProps} />;
    case 'spreadsheet':
      return <SpreadsheetIcon {...iconProps} />;
    case 'video':
      return <VideoIcon {...iconProps} />;
    default:
      return <FileIcon {...iconProps} />;
  }
};

export const AttachmentBlock = ({ attachment, variant = 'inline' }: AttachmentBlockProps) => {
  // Image variant with thumbnail
  if (attachment.type === 'image' && variant === 'inline' && attachment.thumbnailUrl) {
    return (
      <Box
        sx={{
          position: 'relative',
          maxWidth: 360,
          borderRadius: radius.base,
          overflow: 'hidden',
          border: `1px solid ${alpha(color.neutral[900], 0.08)}`,
        }}
      >
        <img
          src={attachment.thumbnailUrl}
          alt={attachment.name}
          style={{
            width: '100%',
            height: 'auto',
            display: 'block',
          }}
        />
        
        {/* Overlay with metadata */}
        <Box
          sx={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            px: spacing[12],
            py: spacing[8],
            bgcolor: alpha('#000', 0.6),
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              sx={{
                fontSize: typography.fontSize.xs,
                fontWeight: typography.fontWeight.medium,
                color: '#FFFFFF',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {attachment.name}
            </Typography>
            <Typography sx={{ fontSize: typography.fontSize.xs, color: alpha('#FFF', 0.7) }}>
              {formatFileSize(attachment.size)} • {getChannelLabel(attachment.source)}
            </Typography>
          </Box>
          
          <IconButton
            size="small"
            sx={{
              color: '#FFFFFF',
              '&:hover': { bgcolor: alpha('#FFF', 0.15) },
            }}
          >
            <DownloadIcon sx={{ fontSize: 16 }} />
          </IconButton>
        </Box>
      </Box>
    );
  }

  // File block variant
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: spacing[12],
        p: spacing[12],
        maxWidth: variant === 'compact' ? '100%' : 360,
        borderRadius: radius.base,
        bgcolor: alpha(color.neutral[900], 0.02),
        border: `1px solid ${alpha(color.neutral[900], 0.08)}`,
        transition: 'all 0.12s ease-out',
        cursor: 'pointer',
        '&:hover': {
          bgcolor: alpha(color.neutral[900], 0.04),
          borderColor: alpha(color.neutral[900], 0.12),
        },
      }}
    >
      {/* Icon */}
      <Box
        sx={{
          width: 36,
          height: 36,
          borderRadius: radius.sm,
          bgcolor: alpha(color.neutral[900], 0.04),
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        {getTypeIcon(attachment.type)}
      </Box>

      {/* Metadata */}
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography
          sx={{
            fontSize: typography.fontSize.sm,
            fontWeight: typography.fontWeight.medium,
            color: text.primary,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            mb: spacing[2],
          }}
        >
          {attachment.name}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: spacing[8] }}>
          <Typography sx={{ fontSize: typography.fontSize.xs, color: text.tertiary }}>
            {attachment.mimeType.split('/')[1].toUpperCase()}
          </Typography>
          <Box sx={{ width: 3, height: 3, borderRadius: '50%', bgcolor: text.tertiary }} />
          <Typography sx={{ fontSize: typography.fontSize.xs, color: text.tertiary }}>
            {formatFileSize(attachment.size)}
          </Typography>
          <Box sx={{ width: 3, height: 3, borderRadius: '50%', bgcolor: text.tertiary }} />
          <Typography sx={{ fontSize: typography.fontSize.xs, color: text.tertiary }}>
            {getChannelLabel(attachment.source)}
          </Typography>
        </Box>
      </Box>

      {/* Download action */}
      <IconButton size="small" sx={{ color: text.tertiary }}>
        <DownloadIcon sx={{ fontSize: 18 }} />
      </IconButton>
    </Box>
  );
};
