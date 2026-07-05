// @ts-nocheck
/**
 * Layout Component: AIContextPanel (Layer 3)
 * 
 * Defines structural container for AI context information.
 * Manages tab navigation and panel layout.
 * 
 * PANEL INTELLIGENCE:
 * - Passive State: Background AI summaries, metadata
 * - Assistive State: Adapts to user actions (future)
 * - Active State: Expanded AI command mode (future)
 * - Tab System: AI | Customer | Tasks | Activity (prevents panel competition)
 */

import { Box, Typography, Tabs, Tab, Chip, Avatar, Divider, Button, alpha, TextField, Select, MenuItem } from '@mui/material';
import {
  AutoAwesome as AutoAwesomeIcon,
  Person as PersonIcon,
  Task as TaskIcon,
  History as HistoryIcon,
  ChevronRight as ChevronRightIcon,
  Email as EmailIcon,
  Business as BusinessIcon,
} from '@mui/icons-material';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { Message } from '../../inbox/types';
import { getChannelColor } from '@/lib/mockMessages';
import { useInboxUIStore } from '../../inbox/store/inboxUIStore';
import { useConversationInsights } from '../hooks/useConversationInsights';
import { useConversationAnalysis } from '../hooks/useConversationAnalysis';
import { AISummaryContainer } from '../containers/AISummaryContainer';
import { RagKnowledgeContainer } from '../containers/RagKnowledgeContainer';
import { SuggestedReplyContainer } from '../containers/SuggestedReplyContainer';
import { TasksTab } from './tabs/TasksTab';
import { ActivityTab } from './tabs/ActivityTab';
import { SuggestedActionsPanel } from './SuggestedActionsPanel';
import { AIAttachmentsModule } from './AIAttachmentsModule';
import { SlidePanel } from '../../../shared/components/SlidePanel';
import { color, spacing, typography, radius, text, layout, transition } from '../../../shared/tokens/design-tokens';

interface AIContextPanelProps {
  conversation: Message | null;
}

export const AIContextPanel = ({ conversation }: AIContextPanelProps) => {
  const { rightPanelTab, setRightPanelTab } = useInboxUIStore();
  const partialAnalysisRefreshRef = useRef<string | null>(null);
  const { data: analysis, analyze, isAnalyzing } = useConversationAnalysis(conversation?.id || null);
  const { data: insights } = useConversationInsights(conversation?.id || null);

  useEffect(() => {
    if (!conversation?.id || !analysis?.canAnalyze || isAnalyzing) return;
    if (!analysis.summary || analysis.aiRun?.status !== 'completed') return;
    if (partialAnalysisRefreshRef.current === conversation.id) return;

    const isPartial = !analysis.suggestedReply?.draft || analysis.nextActions.length === 0;
    if (!isPartial) return;

    partialAnalysisRefreshRef.current = conversation.id;
    analyze();
  }, [conversation?.id, analysis?.canAnalyze, analysis?.summary, analysis?.aiRun?.status, analysis?.suggestedReply?.draft, analysis?.nextActions.length, isAnalyzing, analyze]);

  if (!conversation) {
    return (
      <Box
        sx={{
          width: layout.aiPane.width,
          height: '100vh',
          bgcolor: color.surface.ai, // Layer 4 - AI intelligence layer
          borderLeft: `1px solid ${alpha(color.neutral[900], 0.04)}`, // Tonal difference instead of visible border
        }}
      />
    );
  }

  const priority = analysis?.priority;
  const priorityLevel = priority?.level || conversation.priority || 'normal';
  const suggestedActions = (insights?.suggestedActions || []).filter((action) => action.action !== 'draft_reply');
  const estimatedResponseTime = insights?.estimatedResponseTime || (
    priorityLevel === 'urgent' ? '1 hour' : priorityLevel === 'high' ? '2 hours' : 'Same day'
  );

  return (
    <Box
      sx={{
        width: layout.aiPane.width,
        height: '100vh',
        bgcolor: color.surface.ai, // Layer 4 - AI intelligence layer
        borderLeft: `1px solid ${alpha(color.neutral[900], 0.04)}`, // Tonal difference instead of visible border
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Tabs */}
      <Box 
        sx={{ 
          borderBottom: `1px solid ${color.neutral[200]}`,
          bgcolor: color.surface.primary,
        }}
      >
        <Tabs
          value={rightPanelTab}
          onChange={(_, v) => setRightPanelTab(v)}
          variant="fullWidth"
          sx={{
            minHeight: 48,
            '& .MuiTab-root': {
              minHeight: 48,
              fontSize: typography.fontSize.sm,
              textTransform: 'none',
              fontWeight: typography.fontWeight.medium,
              transition: `all ${transition.duration.fast} ${transition.easing.base}`,
              position: 'relative',
              color: text.secondary,
              '&.Mui-selected': {
                color: text.primary, // Increased active tab contrast
                fontWeight: typography.fontWeight.semibold,
              },
            },
            '& .MuiTabs-indicator': {
              height: 2,
              bgcolor: color.functional.primary, // Increased contrast - explicit color
              transition: `all 120ms ${transition.easing.base}`, // 120ms slide animation
            },
          }}
        >
          <Tab value="ai" icon={<AutoAwesomeIcon sx={{ fontSize: 18 }} />} iconPosition="start" label="AI" />
          <Tab value="customer" icon={<PersonIcon sx={{ fontSize: 18 }} />} iconPosition="start" label="Customer" />
          <Tab value="tasks" icon={<TaskIcon sx={{ fontSize: 18 }} />} iconPosition="start" label="Tasks" />
          <Tab value="activity" icon={<HistoryIcon sx={{ fontSize: 18 }} />} iconPosition="start" label="Activity" />
        </Tabs>
      </Box>

      {/* Content */}
      <Box sx={{ flex: 1, overflow: 'auto', px: spacing[24], py: spacing[32] }}>
        {/* AI Tab */}
        {rightPanelTab === 'ai' && (
          <Box>
            {/* AI Summary */}
            <AISummaryContainer
              conversationId={conversation.id}
              fallbackSummary={conversation.aiSummary}
            />

            {/* Vertical Rhythm Divider */}
            <Divider sx={{ my: spacing[32], borderColor: alpha(color.ai[500], 0.08) }} />

            {/* Workspace Knowledge */}
            <RagKnowledgeContainer key={conversation.id} conversationId={conversation.id} />

            {/* Vertical Rhythm Divider */}
            <Divider sx={{ my: spacing[32], borderColor: alpha(color.ai[500], 0.08) }} />

            {/* Intent & Priority */}
            <Box sx={{ mb: spacing[32] }}>
              <Typography 
                sx={{ 
                  fontWeight: typography.fontWeight.semibold,
                  fontSize: typography.fontSize.base,
                  color: text.primary,
                  mb: spacing[16], // More spacing for vertical rhythm
                }}
              >
                Intent & Priority
              </Typography>
              
              <Box sx={{ display: 'flex', gap: spacing[8], mb: spacing[12], flexWrap: 'wrap' }}>
                <Chip
                  label={insights?.intent || 'Request for Information'}
                  size="small"
                  sx={{
                    fontSize: typography.fontSize.xs,
                    fontWeight: typography.fontWeight.medium,
                    bgcolor: alpha(color.functional.info, 0.1),
                    color: color.functional.info,
                    borderRadius: radius.sm,
                  }}
                />
                <Chip
                  label={
                    priorityLevel === 'urgent'
                      ? 'Urgent'
                      : priorityLevel === 'high'
                      ? 'High Priority'
                      : 'Normal'
                  }
                  size="small"
                  sx={{
                    fontSize: typography.fontSize.xs,
                    fontWeight: typography.fontWeight.medium,
                    bgcolor: alpha(
                      priorityLevel === 'urgent'
                        ? color.functional.error
                        : priorityLevel === 'high'
                        ? color.functional.warning
                        : color.functional.success,
                      0.1
                    ),
                    color:
                      priorityLevel === 'urgent'
                        ? color.functional.error
                        : priorityLevel === 'high'
                        ? color.functional.warning
                        : color.functional.success,
                    borderRadius: radius.sm,
                  }}
                />
              </Box>

              <Typography 
                sx={{ 
                  fontSize: typography.fontSize.sm,
                  color: text.secondary,
                }}
              >
                Estimated response time: <strong>{estimatedResponseTime}</strong>
              </Typography>
            </Box>

            {/* Suggested Reply */}
            <SuggestedReplyContainer conversationId={conversation.id} />

            {/* Vertical Rhythm Divider */}
            <Divider sx={{ my: spacing[32], borderColor: alpha(color.ai[500], 0.08) }} />

            {/* Extracted Entities */}
            <Box sx={{ mb: spacing[32] }}>
              <Typography 
                sx={{ 
                  fontWeight: typography.fontWeight.semibold,
                  fontSize: typography.fontSize.base,
                  color: text.primary,
                  mb: spacing[16], // Increased for vertical rhythm
                }}
              >
                Extracted Information
              </Typography>
              
              {/* Remove card borders - use subtle internal structure */}
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: spacing[16] }}>
                <Box
                  sx={{
                    py: spacing[12],
                    px: spacing[16],
                    borderRadius: radius.base,
                    bgcolor: alpha(color.neutral[900], 0.015), // Very subtle background
                    border: 'none', // Remove hard border
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: spacing[12] }}>
                    <Box
                      sx={{
                        width: 32,
                        height: 32,
                        borderRadius: radius.sm,
                        bgcolor: alpha(color.functional.info, 0.08), // Softer icon background
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <EmailIcon sx={{ fontSize: 16, color: alpha(color.functional.info, 0.8) }} />
                    </Box>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography 
                        sx={{ 
                          fontSize: typography.fontSize.xs,
                          color: text.tertiary,
                          mb: spacing[4],
                        }}
                      >
                        Email
                      </Typography>
                      <Typography 
                        sx={{ 
                          fontSize: typography.fontSize.sm,
                          fontWeight: typography.fontWeight.medium,
                          color: text.primary,
                        }}
                      >
                        {conversation.sender.email}
                      </Typography>
                    </Box>
                  </Box>
                </Box>

                {conversation.sender.organization && (
                  <Box
                    sx={{
                      py: spacing[12],
                      px: spacing[16],
                      borderRadius: radius.base,
                      bgcolor: alpha(color.neutral[900], 0.015), // Very subtle background
                      border: 'none', // Remove hard border
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: spacing[12] }}>
                      <Box
                        sx={{
                          width: 32,
                          height: 32,
                          borderRadius: radius.sm,
                          bgcolor: alpha(color.functional.success, 0.08), // Softer icon background
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <BusinessIcon sx={{ fontSize: 16, color: alpha(color.functional.success, 0.8) }} />
                      </Box>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography 
                          sx={{ 
                            fontSize: typography.fontSize.xs,
                            color: text.tertiary,
                            mb: spacing[4],
                          }}
                        >
                          Organization
                        </Typography>
                        <Typography 
                          sx={{ 
                            fontSize: typography.fontSize.sm,
                            fontWeight: typography.fontWeight.medium,
                            color: text.primary,
                          }}
                        >
                          {conversation.sender.organization}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                )}
              </Box>
            </Box>

            {/* Vertical Rhythm Divider */}
            <Divider sx={{ my: spacing[32], borderColor: alpha(color.ai[500], 0.08) }} />

            {/* Next Best Actions */}
            <Box>
              <Typography 
                sx={{ 
                  fontWeight: typography.fontWeight.semibold,
                  fontSize: typography.fontSize.base,
                  color: text.primary,
                  mb: spacing[16], // Increased for vertical rhythm
                }}
              >
                Suggested Actions
              </Typography>
              
              <SuggestedActionsPanel
                actions={suggestedActions}
              />
            </Box>

            {/* Vertical Rhythm Divider */}
            <Divider sx={{ my: spacing[32], borderColor: alpha(color.ai[500], 0.08) }} />

            {/* Attachments */}
            <Box>
              <Typography 
                sx={{ 
                  fontWeight: typography.fontWeight.semibold,
                  fontSize: typography.fontSize.base,
                  color: text.primary,
                  mb: spacing[16], // Increased for vertical rhythm
                }}
              >
                Attachments
              </Typography>
              
              <AIAttachmentsModule
                attachments={conversation.attachments || []}
                onToggleInclude={(id) => {
                  toast.info('Include in AI toggled');
                }}
                onAction={(id, action) => {
                  toast.success(`${action} initiated for attachment`);
                }}
              />
            </Box>
          </Box>
        )}

        {/* Customer Tab */}
        {rightPanelTab === 'customer' && (
          <Box>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: spacing[24] }}>
              <Avatar
                sx={{
                  width: 64,
                  height: 64,
                  bgcolor: alpha(getChannelColor(conversation.channel), 0.15),
                  color: getChannelColor(conversation.channel),
                  fontSize: typography.fontSize.xxl,
                  fontWeight: typography.fontWeight.semibold,
                  mb: spacing[12],
                }}
              >
                {conversation.sender.avatar}
              </Avatar>
              <Typography 
                sx={{ 
                  fontSize: typography.fontSize.xl,
                  fontWeight: typography.fontWeight.semibold,
                  color: text.primary,
                  mb: spacing[4],
                }}
              >
                {conversation.sender.name}
              </Typography>
              <Typography 
                sx={{ 
                  fontSize: typography.fontSize.base,
                  color: text.secondary,
                }}
              >
                {conversation.sender.organization}
              </Typography>
            </Box>

            <Divider sx={{ mb: spacing[24] }} />

            <Box sx={{ mb: spacing[24] }}>
              <Typography 
                sx={{ 
                  fontWeight: typography.fontWeight.semibold,
                  fontSize: typography.fontSize.base,
                  color: text.primary,
                  mb: spacing[12],
                }}
              >
                Contact Information
              </Typography>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: spacing[12] }}>
                <Box>
                  <Typography 
                    sx={{ 
                      fontSize: typography.fontSize.xs,
                      color: text.tertiary,
                      mb: spacing[4],
                    }}
                  >
                    Email
                  </Typography>
                  <Typography 
                    sx={{ 
                      fontSize: typography.fontSize.base,
                      color: text.primary,
                    }}
                  >
                    {conversation.sender.email}
                  </Typography>
                </Box>
                
                <Box>
                  <Typography 
                    sx={{ 
                      fontSize: typography.fontSize.xs,
                      color: text.tertiary,
                      mb: spacing[4],
                    }}
                  >
                    First Contact
                  </Typography>
                  <Typography 
                    sx={{ 
                      fontSize: typography.fontSize.base,
                      color: text.primary,
                    }}
                  >
                    2 weeks ago
                  </Typography>
                </Box>

                <Box>
                  <Typography 
                    sx={{ 
                      fontSize: typography.fontSize.xs,
                      color: text.tertiary,
                      mb: spacing[4],
                    }}
                  >
                    Total Conversations
                  </Typography>
                  <Typography 
                    sx={{ 
                      fontSize: typography.fontSize.base,
                      color: text.primary,
                    }}
                  >
                    {conversation.threadCount || 1}
                  </Typography>
                </Box>
              </Box>
            </Box>

            <Divider sx={{ mb: spacing[24] }} />

            <Box>
              <Typography 
                sx={{ 
                  fontWeight: typography.fontWeight.semibold,
                  fontSize: typography.fontSize.base,
                  color: text.primary,
                  mb: spacing[12],
                }}
              >
                Tags
              </Typography>
              
              <Box sx={{ display: 'flex', gap: spacing[8], flexWrap: 'wrap' }}>
                {conversation.labels.map((label) => (
                  <Chip
                    key={label}
                    label={label}
                    size="small"
                    sx={{
                      fontSize: typography.fontSize.xs,
                      fontWeight: typography.fontWeight.medium,
                      bgcolor: alpha(color.neutral[900], 0.05),
                      borderRadius: radius.sm,
                    }}
                  />
                ))}
              </Box>
            </Box>
          </Box>
        )}

        {/* Tasks Tab */}
        {rightPanelTab === 'tasks' && (
          <TasksTab conversation={conversation} />
        )}

        {/* Activity Tab */}
        {rightPanelTab === 'activity' && (
          <ActivityTab conversation={conversation} />
        )}
      </Box>
    </Box>
  );
};
