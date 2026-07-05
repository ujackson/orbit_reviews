import { Box, Typography, TextField } from '@mui/material';
import { color, spacing, typography, radius, text, transition } from '../tokens/design-tokens';
import { AiBadge } from '../primitives/AiBadge';
import { SkeletonLoader } from '../primitives/SkeletonLoader';
import { alpha } from '@mui/material';

export type AIInsightBlockVariant = 'summary' | 'suggestion' | 'insight';

interface AIInsightBlockProps {
  variant?: AIInsightBlockVariant;
  title: string;
  content: string;
  isLoading?: boolean;
  isEditing?: boolean;
  onContentChange?: (value: string) => void;
  showBadge?: boolean;
}

export const AIInsightBlock = ({
  variant = 'insight',
  title,
  content,
  isLoading = false,
  isEditing = false,
  onContentChange,
  showBadge = true,
}: AIInsightBlockProps) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'summary':
        return {
          bgcolor: color.surface.aiAccent, // Semantic AI surface - barely perceptible violet
          border: 'none', // Tonal surface instead of border
          accentGradient: `linear-gradient(90deg, ${alpha(color.ai[500], 0.08)}, ${alpha(color.ai[500], 0)})`, // Heavily desaturated gradient
          lineHeight: typography.lineHeight.relaxed, // Increased for skimmability
        };
      case 'suggestion':
        return {
          bgcolor: color.surface.aiSubtle, // Nearly invisible violet tint
          border: 'none', // Tonal surface instead of border
          accentGradient: `linear-gradient(90deg, ${alpha(color.ai[500], 0.10)}, ${alpha(color.ai[500], 0)})`, // Heavily desaturated AI gradient
          lineHeight: typography.lineHeight.base,
        };
      case 'insight':
      default:
        return {
          bgcolor: alpha(color.ai[500], 0.02), // Extremely subtle AI tint - tinted neutral, not accent
          border: 'none', // Tonal surface instead of border
          accentGradient: `linear-gradient(90deg, ${alpha(color.ai[500], 0.10)}, ${alpha(color.ai[500], 0)})`,
          lineHeight: typography.lineHeight.base,
        };
    }
  };

  const styles = getVariantStyles();

  return (
    <Box sx={{ mb: spacing[24] }}>
      {/* Header */}
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

      {/* Content Container */}
      <Box
        sx={{
          p: spacing[16],
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
        {isLoading ? (
          <Box>
            <SkeletonLoader variant="text" width="100%" height="1em" sx={{ mb: spacing[8] }} />
            <SkeletonLoader variant="text" width="90%" height="1em" sx={{ mb: spacing[8] }} />
            <SkeletonLoader variant="text" width="75%" height="1em" />
          </Box>
        ) : isEditing ? (
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
        ) : (
          <Typography
            sx={{
              fontSize: typography.fontSize.base,
              lineHeight: styles.lineHeight,
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
