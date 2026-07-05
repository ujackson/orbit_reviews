/**
 * Component: WorkspaceHealthBanner (Orbit Intelligence)
 * 
 * Executive overview for workspace governance.
 * Instant security and compliance status.
 */

import { Box, Typography, Chip, alpha } from '@mui/material';
import { 
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  AutoAwesome as AIIcon,
} from '@mui/icons-material';
import { color, spacing, typography, text, radius } from '../../../shared/tokens/design-tokens';

interface HealthIssue {
  severity: 'warning' | 'info';
  message: string;
}

interface WorkspaceHealthBannerProps {
  issues?: HealthIssue[];
}

export const WorkspaceHealthBanner = ({ issues = [] }: WorkspaceHealthBannerProps) => {
  const isHealthy = issues.length === 0;

  return (
    <Box
      sx={{
        p: spacing[20],
        mb: spacing[32],
        borderRadius: radius.base,
        bgcolor: isHealthy 
          ? alpha(color.functional.success, 0.04)
          : alpha(color.functional.warning, 0.04),
        border: `1px solid ${isHealthy 
          ? alpha(color.functional.success, 0.12)
          : alpha(color.functional.warning, 0.12)}`,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: spacing[12] }}>
        {/* Icon */}
        <Box
          sx={{
            width: 36,
            height: 36,
            borderRadius: radius.base,
            bgcolor: isHealthy
              ? alpha(color.functional.success, 0.12)
              : alpha(color.functional.warning, 0.12),
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          {isHealthy ? (
            <CheckCircleIcon sx={{ fontSize: 20, color: color.functional.success }} />
          ) : (
            <WarningIcon sx={{ fontSize: 20, color: color.functional.warning }} />
          )}
        </Box>

        {/* Content */}
        <Box sx={{ flex: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: spacing[12], mb: spacing[4] }}>
            <Typography
              sx={{
                fontSize: typography.fontSize.base,
                fontWeight: typography.fontWeight.semibold,
                color: text.primary,
              }}
            >
              Workspace Health: {isHealthy ? 'Good' : 'Needs Attention'}
            </Typography>
            {!isHealthy && (
              <Chip
                label={`${issues.length} ${issues.length === 1 ? 'issue' : 'issues'}`}
                size="small"
                sx={{
                  height: 20,
                  fontSize: typography.fontSize.xs,
                  fontWeight: typography.fontWeight.medium,
                  bgcolor: alpha(color.functional.warning, 0.15),
                  color: color.functional.warning,
                  borderRadius: radius.sm,
                }}
              />
            )}
          </Box>

          {isHealthy ? (
            <Typography sx={{ fontSize: typography.fontSize.sm, color: text.secondary }}>
              All security and governance settings are properly configured
            </Typography>
          ) : (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: spacing[8], mt: spacing[8] }}>
              {issues.map((issue, index) => (
                <Typography
                  key={index}
                  sx={{
                    fontSize: typography.fontSize.sm,
                    color: text.secondary,
                    '&:not(:last-child)::after': {
                      content: '"•"',
                      mx: spacing[8],
                      color: text.tertiary,
                    },
                  }}
                >
                  {issue.message}
                </Typography>
              ))}
            </Box>
          )}
        </Box>

        {/* AI Badge */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: spacing[6],
            px: spacing[10],
            py: spacing[6],
            borderRadius: radius.sm,
            bgcolor: alpha(color.ai[500], 0.08),
          }}
        >
          <AIIcon sx={{ fontSize: 14, color: color.ai[600] }} />
          <Typography
            sx={{
              fontSize: typography.fontSize.xs,
              fontWeight: typography.fontWeight.medium,
              color: color.ai[700],
            }}
          >
            Orbit Monitored
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};
