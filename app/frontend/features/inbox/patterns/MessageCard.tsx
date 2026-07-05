// @ts-nocheck
/**
 * Pattern: MessageCard (Layer 2)
 * 
 * Combines primitives into a message display structure.
 * Knows about layout but NOT data sources.
 * 
 * States: default, loading, error
 */

import { Box, Typography, alpha } from '@mui/material';
import { Avatar, Chip } from '../../../shared/ui/primitives';
import { color, spacing, typography, radius, text, elevation } from '../../../shared/tokens/design-tokens';
import { format } from 'date-fns';
import { motion } from 'motion/react';

export type MessageCardType = 'inbound' | 'outbound' | 'note';

export interface MessageCardProps {
  type: MessageCardType;
  senderName: string;
  senderAvatar: string;
  senderEmail?: string;
  timestamp: Date;
  content: string;
  contentFormat?: 'html' | 'markdown' | 'text';
  channelColor: string;
}

export const MessageCard = ({
  type,
  senderName,
  senderAvatar,
  senderEmail,
  timestamp,
  content,
  contentFormat = 'text',
  channelColor,
}: MessageCardProps) => {
  const getCardStyles = () => {
    switch (type) {
      case 'outbound':
        return {
          bgcolor: alpha(color.functional.primary, 0.03),
          boxShadow: elevation[1],
          border: `1px solid ${alpha(color.neutral[200], 0.5)}`, // Reduced border contrast
        };
      case 'note':
        return {
          bgcolor: alpha(color.ai[500], 0.03),
          border: `1px solid ${alpha(color.ai[500], 0.12)}`, // Reduced intensity
          borderRadius: radius.base,
        };
      case 'inbound':
      default:
        return {
          bgcolor: color.surface.primary,
          border: `1px solid ${alpha(color.neutral[200], 0.6)}`, // Reduced border contrast
        };
    }
  };
  const avatarIsImage = /^https?:\/\//.test(senderAvatar || '');

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.12, ease: 'easeOut' }}
    >
      <Box sx={{ mb: spacing[24] }}>
        {/* Sender Info */}
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: spacing[16], mb: spacing[16] }}>
          <Avatar size="md" accentColor={channelColor} src={avatarIsImage ? senderAvatar : undefined}>
            {avatarIsImage ? undefined : senderAvatar}
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
                  size="sm"
                  sx={{
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
              {format(timestamp, 'EEEE, MMMM d, yyyy \'at\' h:mm a')}
            </Typography>
          </Box>
        </Box>

        {/* Message Body */}
        <Box
          sx={{
            ml: spacing[48] + spacing[16],
            p: spacing[16],
            borderRadius: radius.md,
            ...getCardStyles(),
          }}
        >
          <MessageBody content={content} format={contentFormat} />
        </Box>
      </Box>
    </motion.div>
  );
};

const MessageBody = ({ content, format }: { content: string; format: 'html' | 'markdown' | 'text' }) => {
  if (format === 'html') {
    return (
      <Box
        component="iframe"
        sandbox=""
        srcDoc={sanitizeEmailHtml(content)}
        sx={{
          width: '100%',
          height: 520,
          border: 'none',
          bgcolor: color.neutral[0],
          borderRadius: radius.sm,
        }}
      />
    );
  }

  if (format === 'markdown') {
    return (
      <Box
        sx={{
          lineHeight: typography.lineHeight.relaxed,
          fontSize: typography.fontSize.md,
          color: text.primary,
          '& p': { my: spacing[8] },
          '& strong': { fontWeight: typography.fontWeight.semibold },
          '& code': {
            fontFamily: 'monospace',
            bgcolor: alpha(color.neutral[900], 0.06),
            px: spacing[4],
            borderRadius: radius.sm,
          },
        }}
        dangerouslySetInnerHTML={{ __html: renderBasicMarkdown(content) }}
      />
    );
  }

  return (
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
  );
};

const sanitizeEmailHtml = (html: string) =>
  html
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '')
    .replace(/<iframe[\s\S]*?>[\s\S]*?<\/iframe>/gi, '')
    .replace(/\son[a-z]+\s*=\s*(['"]).*?\1/gi, '')
    .replace(/\shref\s*=\s*(['"])\s*javascript:.*?\1/gi, ' href="#"');

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');

const renderBasicMarkdown = (value: string) =>
  escapeHtml(value)
    .replace(/^###### (.*)$/gm, '<h6>$1</h6>')
    .replace(/^##### (.*)$/gm, '<h5>$1</h5>')
    .replace(/^#### (.*)$/gm, '<h4>$1</h4>')
    .replace(/^### (.*)$/gm, '<h3>$1</h3>')
    .replace(/^## (.*)$/gm, '<h2>$1</h2>')
    .replace(/^# (.*)$/gm, '<h1>$1</h1>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .split(/\n{2,}/)
    .map((block) => block.match(/^<h[1-6]>/) ? block : `<p>${block.replace(/\n/g, '<br />')}</p>`)
    .join('');

/**
 * Loading State Variant
 */
export const MessageCardSkeleton = () => {
  return (
    <Box sx={{ mb: spacing[24] }}>
      <Box sx={{ display: 'flex', gap: spacing[16], mb: spacing[16] }}>
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
              width: '30%',
              bgcolor: color.neutral[200],
              borderRadius: radius.sm,
              mb: spacing[8],
            }}
          />
          <Box
            sx={{
              height: 12,
              width: '50%',
              bgcolor: color.neutral[100],
              borderRadius: radius.sm,
            }}
          />
        </Box>
      </Box>
      <Box
        sx={{
          ml: spacing[48] + spacing[16],
          height: 120,
          bgcolor: color.neutral[100],
          borderRadius: radius.md,
        }}
      />
    </Box>
  );
};

/**
 * Error State Variant
 */
export const MessageCardError = ({ error }: { error: string }) => {
  return (
    <Box
      sx={{
        mb: spacing[24],
        p: spacing[16],
        borderRadius: radius.md,
        bgcolor: alpha(color.functional.error, 0.05),
        border: `1px solid ${alpha(color.functional.error, 0.2)}`,
      }}
    >
      <Typography
        sx={{
          fontSize: typography.fontSize.base,
          color: color.functional.error,
        }}
      >
        {error}
      </Typography>
    </Box>
  );
};
