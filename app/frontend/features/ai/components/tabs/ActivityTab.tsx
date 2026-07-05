// @ts-nocheck
/**
 * Component: ActivityTab
 * 
 * Context Panel Intelligence: Activity timeline
 * Shows conversation history, status changes, assignments
 */

import { Box, Typography, Avatar, Chip, alpha } from '@mui/material';
import {
  PersonAdd as AssignIcon,
  Check as CheckIcon,
  Message as MessageIcon,
  Label as TagIcon,
} from '@mui/icons-material';
import { Message } from '../../../inbox/types';
import { color, spacing, typography, text, radius } from '../../../../shared/tokens/design-tokens';

interface ActivityTabProps {
  conversation: Message;
}

interface ActivityEvent {
  id: string;
  type: 'message' | 'status' | 'assignment' | 'tag';
  title: string;
  description?: string;
  timestamp: string;
  actor?: string;
}

export const ActivityTab = ({ conversation }: ActivityTabProps) => {
  // Mock activity data (in real app, fetch from API)
  const activities: ActivityEvent[] = [
    {
      id: '1',
      type: 'message',
      title: 'New message received',
      description: conversation.snippet,
      timestamp: '2 hours ago',
      actor: conversation.sender.name,
    },
    {
      id: '2',
      type: 'assignment',
      title: 'Assigned to Sarah Chen',
      timestamp: '3 hours ago',
      actor: 'System',
    },
    {
      id: '3',
      type: 'status',
      title: 'Status changed to In Progress',
      timestamp: '5 hours ago',
      actor: 'Sarah Chen',
    },
    {
      id: '4',
      type: 'tag',
      title: 'Tagged as Enterprise',
      timestamp: '1 day ago',
      actor: 'AI Assistant',
    },
  ];

  const getActivityIcon = (type: ActivityEvent['type']) => {
    switch (type) {
      case 'message':
        return <MessageIcon sx={{ fontSize: 16 }} />;
      case 'assignment':
        return <AssignIcon sx={{ fontSize: 16 }} />;
      case 'status':
        return <CheckIcon sx={{ fontSize: 16 }} />;
      case 'tag':
        return <TagIcon sx={{ fontSize: 16 }} />;
    }
  };

  const getActivityColor = (type: ActivityEvent['type']) => {
    switch (type) {
      case 'message':
        return color.functional.info;
      case 'assignment':
        return color.ai[500];
      case 'status':
        return color.functional.success;
      case 'tag':
        return color.functional.warning;
    }
  };

  return (
    <Box>
      {/* Section Header */}
      <Typography
        sx={{
          fontSize: typography.fontSize.base,
          fontWeight: typography.fontWeight.semibold,
          color: text.primary,
          mb: spacing[20],
        }}
      >
        Timeline
      </Typography>

      {/* Activity Timeline */}
      <Box sx={{ position: 'relative' }}>
        {/* Timeline Line */}
        <Box
          sx={{
            position: 'absolute',
            left: 16,
            top: 12,
            bottom: 12,
            width: 2,
            bgcolor: alpha(color.neutral[900], 0.06),
          }}
        />

        {/* Activity Items */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: spacing[16] }}>
          {activities.map((activity, index) => (
            <Box
              key={activity.id}
              sx={{
                display: 'flex',
                gap: spacing[16],
                position: 'relative',
              }}
            >
              {/* Icon */}
              <Box
                sx={{
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  bgcolor: alpha(getActivityColor(activity.type), 0.1),
                  border: `2px solid ${color.surface.ai}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  position: 'relative',
                  zIndex: 1,
                }}
              >
                {getActivityIcon(activity.type)}
              </Box>

              {/* Content */}
              <Box sx={{ flex: 1, minWidth: 0, pt: '2px' }}>
                <Typography
                  sx={{
                    fontSize: typography.fontSize.base,
                    fontWeight: typography.fontWeight.medium,
                    color: text.primary,
                    mb: spacing[4],
                  }}
                >
                  {activity.title}
                </Typography>

                {activity.description && (
                  <Typography
                    sx={{
                      fontSize: typography.fontSize.sm,
                      color: text.secondary,
                      mb: spacing[8],
                      lineHeight: 1.5,
                    }}
                  >
                    {activity.description}
                  </Typography>
                )}

                <Box sx={{ display: 'flex', alignItems: 'center', gap: spacing[8] }}>
                  <Typography
                    sx={{
                      fontSize: typography.fontSize.xs,
                      color: text.tertiary,
                    }}
                  >
                    {activity.timestamp}
                  </Typography>
                  {activity.actor && (
                    <>
                      <Box
                        sx={{
                          width: 3,
                          height: 3,
                          borderRadius: '50%',
                          bgcolor: text.tertiary,
                        }}
                      />
                      <Typography
                        sx={{
                          fontSize: typography.fontSize.xs,
                          color: text.tertiary,
                        }}
                      >
                        {activity.actor}
                      </Typography>
                    </>
                  )}
                </Box>
              </Box>
            </Box>
          ))}
        </Box>
      </Box>

      {/* Conversation Stats */}
      <Box
        sx={{
          mt: spacing[32],
          pt: spacing[24],
          borderTop: `1px solid ${alpha(color.neutral[900], 0.06)}`,
        }}
      >
        <Typography
          sx={{
            fontSize: typography.fontSize.base,
            fontWeight: typography.fontWeight.semibold,
            color: text.primary,
            mb: spacing[16],
          }}
        >
          Conversation Stats
        </Typography>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: spacing[12] }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography sx={{ fontSize: typography.fontSize.sm, color: text.secondary }}>
              Messages
            </Typography>
            <Typography sx={{ fontSize: typography.fontSize.sm, fontWeight: typography.fontWeight.medium, color: text.primary }}>
              {conversation.messagesCount || 3}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography sx={{ fontSize: typography.fontSize.sm, color: text.secondary }}>
              First Contact
            </Typography>
            <Typography sx={{ fontSize: typography.fontSize.sm, fontWeight: typography.fontWeight.medium, color: text.primary }}>
              2 weeks ago
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography sx={{ fontSize: typography.fontSize.sm, color: text.secondary }}>
              Avg Response Time
            </Typography>
            <Typography sx={{ fontSize: typography.fontSize.sm, fontWeight: typography.fontWeight.medium, color: text.primary }}>
              2.5 hours
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography sx={{ fontSize: typography.fontSize.sm, color: text.secondary }}>
              Channel
            </Typography>
            <Chip
              label={conversation.channel}
              size="small"
              sx={{
                height: 20,
                fontSize: typography.fontSize.xs,
                fontWeight: typography.fontWeight.medium,
                bgcolor: alpha(color.neutral[900], 0.06),
                color: text.primary,
                borderRadius: radius.sm,
              }}
            />
          </Box>
        </Box>
      </Box>
    </Box>
  );
};
