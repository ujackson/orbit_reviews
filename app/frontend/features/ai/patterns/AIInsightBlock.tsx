// @ts-nocheck
/**
 * Pattern: AIInsightBlock (Layer 2)
 * 
 * AI-specific pattern component for displaying insights, summaries, and suggestions.
 * Combines primitives with AI visual language.
 * Knows about layout but NOT data sources.
 * 
 * States: default, loading, editing, error
 */

import { Box, Typography, TextField } from '@mui/material';
import { AiBadge, SkeletonLoader } from '../../../shared/ui/primitives';
import { aiVisualLanguage, color, spacing, typography, radius, text, transition } from '../../../shared/tokens/design-tokens';
import { alpha } from '@mui/material';

export type AIInsightBlockVariant = 'summary' | 'suggestion' | 'insight';

export interface AIInsightBlockProps {
  variant?: AIInsightBlockVariant;
  title: string;
  content: string;
  isLoading?: boolean;
  isEditing?: boolean;
  isError?: boolean;
  errorMessage?: string;
  onContentChange?: (value: string) => void;
  showBadge?: boolean;
}

export const AIInsightBlock = ({
  variant = 'insight',
  title,
  content,
  isLoading = false,
  isEditing = false,
  isError = false,
  errorMessage,
  onContentChange,
  showBadge = true,
}: AIInsightBlockProps) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'summary':
        return {
          bgcolor: alpha(color.ai[500], 0.04), // Slightly darker for more presence
          border: `1px solid ${alpha(color.ai[500], 0.15)}`, // Increased border visibility
          accentGradient: aiVisualLanguage.surface.accent,
          padding: spacing[20], // Increased padding for dominance
        };
      case 'suggestion':
        return {
          bgcolor: color.surface.primary,
          border: `1px solid ${alpha(color.ai[500], 0.12)}`, // Reduced purple intensity
          accentGradient: aiVisualLanguage.surface.accent,
          padding: spacing[16],
        };
      case 'insight':
      default:
        return {
          bgcolor: alpha(color.ai[500], 0.03),
          border: `1px solid ${alpha(color.ai[500], 0.12)}`,
          accentGradient: `linear-gradient(90deg, ${alpha(color.ai[500], 0.2)}, ${alpha(color.ai[500], 0)})`,
          padding: spacing[16],
        };
    }
  };

  const styles = getVariantStyles();

  return (
    <Box sx={{ mb: spacing[24] }}>
      {/* Header */}
      {title && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: spacing[8], mb: spacing[12] }}>
          {showBadge && <AiBadge size="sm" showIcon showLabel={false} />}
          <Typography
            sx={{
              fontWeight: typography.fontWeight.semibold,
              fontSize: typography.fontSize.base,
              color: text.primary,
            }}
          >
            {title}
          </Typography>
        </Box>
      )}

      {/* Content Container */}
      <Box
        sx={{
          p: styles.padding,
          borderRadius: radius.md,
          bgcolor: styles.bgcolor,
          border: styles.border,
          position: 'relative',
          overflow: 'hidden',
          transition: `all ${transition.duration.base} ${transition.easing.base}`,
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 1,
            background: styles.accentGradient,
          },
        }}
      >
        {/* Loading State */}
        {isLoading && (
          <Box>
            <SkeletonLoader variant="text" width="100%" height="1em" sx={{ mb: spacing[8] }} />
            <SkeletonLoader variant="text" width="90%" height="1em" sx={{ mb: spacing[8] }} />
            <SkeletonLoader variant="text" width="75%" height="1em" />
          </Box>
        )}

        {/* Error State */}
        {isError && !isLoading && (
          <Typography
            sx={{
              fontSize: typography.fontSize.base,
              color: color.functional.error,
            }}
          >
            {errorMessage || 'Failed to load AI insight'}
          </Typography>
        )}

        {/* Editing State */}
        {isEditing && !isLoading && !isError && (
          <TextField
            fullWidth
            multiline
            minRows={3}
            value={content}
            onChange={(e) => onContentChange?.(e.target.value)}
            sx={{
              '& .MuiOutlinedInput-root': {
                fontSize: typography.fontSize.base,
                lineHeight: typography.lineHeight.relaxed,
                p: 0,
                '& fieldset': {
                  border: 'none',
                },
              },
            }}
          />
        )}

        {/* Default State */}
        {!isLoading && !isEditing && !isError && (
          <Typography
            sx={{
              fontSize: typography.fontSize.base,
              lineHeight: typography.lineHeight.relaxed,
              color: text.primary,
              whiteSpace: 'pre-wrap',
            }}
          >
            {content}
          </Typography>
        )}
      </Box>
    </Box>
  );
};

/**
 * Empty State Variant
 */
export const AIInsightBlockEmpty = ({ message }: { message: string }) => {
  return (
    <Box
      sx={{
        p: spacing[24],
        borderRadius: radius.md,
        bgcolor: alpha(color.ai[500], 0.03),
        border: `1px solid ${alpha(color.ai[500], 0.12)}`,
        textAlign: 'center',
      }}
    >
      <Typography
        sx={{
          fontSize: typography.fontSize.base,
          color: text.secondary,
        }}
      >
        {message}
      </Typography>
    </Box>
  );
};