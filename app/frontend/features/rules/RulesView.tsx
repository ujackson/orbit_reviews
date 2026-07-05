// @ts-nocheck
/**
 * View: RulesView
 * 
 * Mode C - Builder Workspace (72 + flex + optional 360 layout)
 * Enterprise automation builder with rule cards and AI suggestions.
 */

import { Box, Typography, Button, Chip, Switch, IconButton, alpha, TextField, Select, MenuItem } from '@mui/material';
import {
  Add as AddIcon,
  PlayArrow as PlayIcon,
  Pause as PauseIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  AutoAwesome as AIIcon,
  Schedule as ScheduleIcon,
  Bolt as BoltIcon,
  CheckCircle as CheckIcon,
} from '@mui/icons-material';
import { useState } from 'react';
import { toast } from 'sonner';
import { SlidePanel } from '../../shared/components/SlidePanel';
import { FormSection } from '../../shared/components/FormSection';
import { ConfirmDialog } from '../../shared/components/ConfirmDialog';
import { color, spacing, typography, text, radius } from '../../shared/tokens/design-tokens';

interface Rule {
  id: string;
  name: string;
  description: string;
  trigger: string;
  actions: string[];
  enabled: boolean;
  executionCount: number;
  lastRun?: string;
  aiSuggested?: boolean;
  status: 'active' | 'paused' | 'error';
}

export const RulesView = () => {
  const [createPanelOpen, setCreatePanelOpen] = useState(false);
  const [newRuleName, setNewRuleName] = useState('');
  const [newRuleDescription, setNewRuleDescription] = useState('');
  const [newRuleTrigger, setNewRuleTrigger] = useState('');

  const [rules, setRules] = useState<Rule[]>([
    {
      id: '1',
      name: 'Auto-assign urgent messages',
      description: 'Automatically assign urgent conversations to senior support agents',
      trigger: 'Message contains "urgent" or priority is high',
      actions: ['Assign to Senior Support Team', 'Send Slack notification'],
      enabled: true,
      executionCount: 247,
      lastRun: '5 minutes ago',
      status: 'active',
    },
    {
      id: '2',
      name: 'Tag enterprise customers',
      description: 'Add "Enterprise" tag when customer is from known enterprise domain',
      trigger: 'Email domain matches enterprise list',
      actions: ['Add tag: Enterprise', 'Set priority: High'],
      enabled: true,
      executionCount: 89,
      lastRun: '1 hour ago',
      status: 'active',
    },
    {
      id: '3',
      name: 'Auto-reply to common questions',
      description: 'Send AI-generated response to frequently asked questions',
      trigger: 'Message matches FAQ pattern',
      actions: ['Generate AI response', 'Mark as handled'],
      enabled: false,
      executionCount: 12,
      lastRun: '2 days ago',
      aiSuggested: true,
      status: 'paused',
    },
    {
      id: '4',
      name: 'Escalate negative sentiment',
      description: 'Notify team lead when AI detects negative customer sentiment',
      trigger: 'AI sentiment analysis is negative',
      actions: ['Notify Team Lead', 'Set priority: Urgent', 'Add tag: Escalated'],
      enabled: true,
      executionCount: 34,
      lastRun: '3 hours ago',
      status: 'active',
    },
  ]);

  const toggleRule = (ruleId: string) => {
    setRules((prev) =>
      prev.map((rule) =>
        rule.id === ruleId
          ? { ...rule, enabled: !rule.enabled, status: !rule.enabled ? 'active' : 'paused' }
          : rule
      )
    );
  };

  const activeRulesCount = rules.filter((r) => r.enabled).length;
  const totalExecutions = rules.reduce((sum, r) => sum + r.executionCount, 0);

  return (
    <Box
      sx={{
        flex: 1,
        height: '100vh',
        overflow: 'auto',
        bgcolor: color.surface.work, // Layer 3 - Work surface
        px: spacing[64],
        py: spacing[48],
      }}
    >
      <Box sx={{ maxWidth: 1200 }}>
        {/* Header */}
        <Box sx={{ mb: spacing[32] }}>
          <Typography
            sx={{
              fontSize: typography.fontSize.xxl,
              fontWeight: typography.fontWeight.semibold,
              color: text.primary,
              mb: spacing[8],
            }}
          >
            Rules & Automation
          </Typography>
          <Typography sx={{ fontSize: typography.fontSize.base, color: text.secondary }}>
            Automate your workflow with intelligent rules and triggers
          </Typography>
        </Box>

        {/* Stats */}
        <Box
          sx={{
            display: 'flex',
            gap: spacing[24],
            mb: spacing[32],
          }}
        >
          <Box
            sx={{
              flex: 1,
              p: spacing[20],
              borderRadius: radius.base,
              bgcolor: alpha(color.neutral[900], 0.015),
              border: `1px solid ${alpha(color.neutral[900], 0.06)}`,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: spacing[12], mb: spacing[8] }}>
              <Box
                sx={{
                  width: 32,
                  height: 32,
                  borderRadius: radius.sm,
                  bgcolor: alpha(color.functional.success, 0.1),
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <CheckIcon sx={{ fontSize: 18, color: color.functional.success }} />
              </Box>
              <Typography sx={{ fontSize: typography.fontSize.sm, color: text.tertiary }}>
                Active Rules
              </Typography>
            </Box>
            <Typography sx={{ fontSize: typography.fontSize.xxl, fontWeight: typography.fontWeight.semibold, color: text.primary }}>
              {activeRulesCount} <span style={{ fontSize: typography.fontSize.base, color: text.tertiary, fontWeight: typography.fontWeight.normal }}>
                / {rules.length} total
              </span>
            </Typography>
          </Box>

          <Box
            sx={{
              flex: 1,
              p: spacing[20],
              borderRadius: radius.base,
              bgcolor: alpha(color.neutral[900], 0.015),
              border: `1px solid ${alpha(color.neutral[900], 0.06)}`,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: spacing[12], mb: spacing[8] }}>
              <Box
                sx={{
                  width: 32,
                  height: 32,
                  borderRadius: radius.sm,
                  bgcolor: alpha(color.functional.primary, 0.1),
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <BoltIcon sx={{ fontSize: 18, color: color.functional.primary }} />
              </Box>
              <Typography sx={{ fontSize: typography.fontSize.sm, color: text.tertiary }}>
                Executions This Month
              </Typography>
            </Box>
            <Typography sx={{ fontSize: typography.fontSize.xxl, fontWeight: typography.fontWeight.semibold, color: text.primary }}>
              {totalExecutions.toLocaleString()}
            </Typography>
          </Box>

          <Box
            sx={{
              flex: 1,
              p: spacing[20],
              borderRadius: radius.base,
              bgcolor: alpha(color.ai[500], 0.04),
              border: `1px solid ${alpha(color.ai[500], 0.12)}`,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: spacing[12], mb: spacing[8] }}>
              <Box
                sx={{
                  width: 32,
                  height: 32,
                  borderRadius: radius.sm,
                  bgcolor: alpha(color.ai[500], 0.15),
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <AIIcon sx={{ fontSize: 18, color: color.ai[500] }} />
              </Box>
              <Typography sx={{ fontSize: typography.fontSize.sm, color: text.tertiary }}>
                AI Suggestions
              </Typography>
            </Box>
            <Typography sx={{ fontSize: typography.fontSize.xxl, fontWeight: typography.fontWeight.semibold, color: text.primary }}>
              {rules.filter((r) => r.aiSuggested).length}
            </Typography>
          </Box>
        </Box>

        {/* Create Rule Button */}
        <Box sx={{ mb: spacing[24] }}>
          <Button
            variant="contained"
            size="large"
            startIcon={<AddIcon />}
            sx={{
              fontSize: typography.fontSize.base,
              textTransform: 'none',
              fontWeight: typography.fontWeight.medium,
              bgcolor: color.functional.primary,
              color: '#FFFFFF',
              px: spacing[24],
              py: spacing[12],
              '&:hover': {
                bgcolor: color.functional.primaryHover,
              },
            }}
            onClick={() => setCreatePanelOpen(true)}
          >
            Create New Rule
          </Button>
        </Box>

        {/* Rules List */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: spacing[16] }}>
          {rules.map((rule) => (
            <Box
              key={rule.id}
              sx={{
                p: spacing[24],
                borderRadius: radius.base,
                bgcolor: color.surface.primary,
                border: `1px solid ${alpha(color.neutral[900], 0.06)}`,
                transition: 'all 0.12s ease-out',
                '&:hover': {
                  borderColor: alpha(color.neutral[900], 0.12),
                  boxShadow: `0 2px 8px ${alpha(color.neutral[900], 0.04)}`,
                },
              }}
            >
              {/* Header */}
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: spacing[16], mb: spacing[16] }}>
                {/* Status Indicator */}
                <Box
                  sx={{
                    width: 4,
                    height: 48,
                    borderRadius: radius.sm,
                    bgcolor: rule.enabled ? color.functional.success : text.tertiary,
                    flexShrink: 0,
                  }}
                />

                {/* Content */}
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: spacing[12], mb: spacing[8] }}>
                    <Typography
                      sx={{
                        fontSize: typography.fontSize.lg,
                        fontWeight: typography.fontWeight.semibold,
                        color: text.primary,
                      }}
                    >
                      {rule.name}
                    </Typography>
                    {rule.aiSuggested && (
                      <Chip
                        icon={<AIIcon sx={{ fontSize: 14 }} />}
                        label="AI Suggested"
                        size="small"
                        sx={{
                          height: 20,
                          fontSize: typography.fontSize.xs,
                          fontWeight: typography.fontWeight.medium,
                          bgcolor: alpha(color.ai[500], 0.1),
                          color: color.ai[500],
                          borderRadius: radius.sm,
                          '& .MuiChip-icon': {
                            color: color.ai[500],
                            marginLeft: spacing[8],
                          },
                        }}
                      />
                    )}
                  </Box>

                  <Typography sx={{ fontSize: typography.fontSize.base, color: text.secondary, mb: spacing[16] }}>
                    {rule.description}
                  </Typography>

                  {/* Trigger */}
                  <Box sx={{ mb: spacing[12] }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: spacing[8], mb: spacing[8] }}>
                      <ScheduleIcon sx={{ fontSize: 16, color: text.tertiary }} />
                      <Typography sx={{ fontSize: typography.fontSize.sm, fontWeight: typography.fontWeight.medium, color: text.secondary }}>
                        Trigger
                      </Typography>
                    </Box>
                    <Box
                      sx={{
                        pl: spacing[24],
                        py: spacing[8],
                        px: spacing[12],
                        borderRadius: radius.sm,
                        bgcolor: alpha(color.neutral[900], 0.02),
                        border: `1px solid ${alpha(color.neutral[900], 0.04)}`,
                      }}
                    >
                      <Typography sx={{ fontSize: typography.fontSize.sm, color: text.primary }}>
                        {rule.trigger}
                      </Typography>
                    </Box>
                  </Box>

                  {/* Actions */}
                  <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: spacing[8], mb: spacing[8] }}>
                      <BoltIcon sx={{ fontSize: 16, color: text.tertiary }} />
                      <Typography sx={{ fontSize: typography.fontSize.sm, fontWeight: typography.fontWeight.medium, color: text.secondary }}>
                        Actions ({rule.actions.length})
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: spacing[8], pl: spacing[24] }}>
                      {rule.actions.map((action, index) => (
                        <Chip
                          key={index}
                          label={action}
                          size="small"
                          sx={{
                            fontSize: typography.fontSize.xs,
                            fontWeight: typography.fontWeight.medium,
                            bgcolor: alpha(color.functional.primary, 0.08),
                            color: color.functional.primary,
                            borderRadius: radius.sm,
                          }}
                        />
                      ))}
                    </Box>
                  </Box>

                  {/* Stats */}
                  {rule.lastRun && (
                    <Box
                      sx={{
                        mt: spacing[16],
                        pt: spacing[16],
                        borderTop: `1px solid ${alpha(color.neutral[900], 0.04)}`,
                        display: 'flex',
                        alignItems: 'center',
                        gap: spacing[24],
                      }}
                    >
                      <Typography sx={{ fontSize: typography.fontSize.sm, color: text.tertiary }}>
                        Last run: <strong style={{ color: text.secondary }}>{rule.lastRun}</strong>
                      </Typography>
                      <Box
                        sx={{
                          width: 3,
                          height: 3,
                          borderRadius: '50%',
                          bgcolor: text.tertiary,
                        }}
                      />
                      <Typography sx={{ fontSize: typography.fontSize.sm, color: text.tertiary }}>
                        Executed: <strong style={{ color: text.secondary }}>{rule.executionCount} times</strong>
                      </Typography>
                    </Box>
                  )}
                </Box>

                {/* Actions */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: spacing[12], flexShrink: 0 }}>
                  <Switch
                    checked={rule.enabled}
                    onChange={() => toggleRule(rule.id)}
                    sx={{
                      '& .MuiSwitch-switchBase.Mui-checked': {
                        color: color.functional.success,
                      },
                      '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                        bgcolor: color.functional.success,
                      },
                    }}
                  />
                  <IconButton size="small" sx={{ color: text.tertiary }}>
                    <EditIcon sx={{ fontSize: 18 }} />
                  </IconButton>
                  <IconButton size="small" sx={{ color: text.tertiary }}>
                    <DeleteIcon sx={{ fontSize: 18 }} />
                  </IconButton>
                </Box>
              </Box>
            </Box>
          ))}
        </Box>

        {/* AI Suggestions Panel */}
        <Box
          sx={{
            mt: spacing[32],
            p: spacing[24],
            borderRadius: radius.base,
            bgcolor: alpha(color.ai[500], 0.04),
            border: `1px solid ${alpha(color.ai[500], 0.12)}`,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: spacing[16] }}>
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: radius.base,
                bgcolor: alpha(color.ai[500], 0.15),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <AIIcon sx={{ fontSize: 24, color: color.ai[500] }} />
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography
                sx={{
                  fontSize: typography.fontSize.base,
                  fontWeight: typography.fontWeight.semibold,
                  color: text.primary,
                  mb: spacing[8],
                }}
              >
                AI Rule Suggestion
              </Typography>
              <Typography sx={{ fontSize: typography.fontSize.base, color: text.secondary, mb: spacing[16] }}>
                Based on your conversation patterns, you might want to create a rule: "Auto-tag customers who mention pricing or billing"
              </Typography>
              <Button
                variant="outlined"
                size="small"
                sx={{
                  fontSize: typography.fontSize.sm,
                  textTransform: 'none',
                  fontWeight: typography.fontWeight.medium,
                  borderColor: color.ai[500],
                  color: color.ai[500],
                  '&:hover': {
                    borderColor: color.ai[600],
                    bgcolor: alpha(color.ai[500], 0.04),
                  },
                }}
              >
                Create This Rule
              </Button>
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Create Rule Panel - Orbit Intelligence */}
      <SlidePanel
        open={createPanelOpen}
        onClose={() => setCreatePanelOpen(false)}
        title="Create Automation Rule"
        subtitle="Rules › Build Workflow"
        intelligenceTip="Orbit can suggest triggers and actions based on your conversation patterns"
        width={520}
      >
        <FormSection title="Rule Definition" description="What this automation does">
          <TextField
            label="Rule Name"
            placeholder="e.g., Auto-assign VIP customers"
            value={newRuleName}
            onChange={(e) => setNewRuleName(e.target.value)}
            fullWidth
            autoFocus
          />
          <TextField
            label="Description"
            placeholder="Describe what this rule accomplishes..."
            value={newRuleDescription}
            onChange={(e) => setNewRuleDescription(e.target.value)}
            fullWidth
            multiline
            rows={3}
          />
        </FormSection>

        <FormSection title="Trigger Condition" description="When should this rule activate?">
          <TextField
            label="Trigger"
            placeholder="e.g., Message contains urgent OR priority is high"
            value={newRuleTrigger}
            onChange={(e) => setNewRuleTrigger(e.target.value)}
            fullWidth
          />
        </FormSection>

        <Button
          variant="contained"
          size="large"
          fullWidth
          sx={{
            fontSize: typography.fontSize.base,
            textTransform: 'none',
            fontWeight: typography.fontWeight.medium,
            bgcolor: color.neutral[900],
            color: '#FFFFFF',
            '&:hover': {
              bgcolor: color.neutral[800],
            },
          }}
          onClick={() => {
            if (!newRuleName.trim() || !newRuleDescription.trim() || !newRuleTrigger.trim()) {
              toast.error('Please fill in all fields');
              return;
            }
            setRules((prev) => [
              ...prev,
              {
                id: (prev.length + 1).toString(),
                name: newRuleName,
                description: newRuleDescription,
                trigger: newRuleTrigger,
                actions: [],
                enabled: true,
                executionCount: 0,
                status: 'active',
              },
            ]);
            toast.success('Automation rule created!');
            setCreatePanelOpen(false);
            setNewRuleName('');
            setNewRuleDescription('');
            setNewRuleTrigger('');
          }}
        >
          Create Automation
        </Button>
      </SlidePanel>
    </Box>
  );
};