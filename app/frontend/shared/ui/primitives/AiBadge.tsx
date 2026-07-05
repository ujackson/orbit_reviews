import { Box, Typography } from '@mui/material';
import { AutoAwesome as AutoAwesomeIcon } from '@mui/icons-material';
import { aiVisualLanguage, spacing } from '../../tokens/design-tokens';

interface AiBadgeProps {
  size?: 'sm' | 'md';
  showIcon?: boolean;
  showLabel?: boolean;
}

export const AiBadge = ({ 
  size = 'sm', 
  showIcon = true, 
  showLabel = false 
}: AiBadgeProps) => {
  const dimensions = {
    sm: { container: 20, icon: 12, fontSize: 10 },
    md: { container: 24, icon: 14, fontSize: 11 },
  };

  const { container, icon, fontSize } = dimensions[size];

  if (!showLabel) {
    return (
      <Box
        sx={{
          width: container,
          height: container,
          borderRadius: '50%',
          bgcolor: aiVisualLanguage.badge.background,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {showIcon && (
          <AutoAwesomeIcon 
            sx={{ 
              fontSize: icon, 
              color: aiVisualLanguage.badge.color 
            }} 
          />
        )}
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: spacing[4],
        px: spacing[8],
        py: spacing[4],
        borderRadius: '12px',
        bgcolor: aiVisualLanguage.badge.background,
      }}
    >
      {showIcon && (
        <AutoAwesomeIcon 
          sx={{ 
            fontSize: icon, 
            color: aiVisualLanguage.badge.color 
          }} 
        />
      )}
      <Typography
        sx={{
          fontSize,
          fontWeight: 600,
          color: aiVisualLanguage.badge.color,
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
        }}
      >
        AI
      </Typography>
    </Box>
  );
};
