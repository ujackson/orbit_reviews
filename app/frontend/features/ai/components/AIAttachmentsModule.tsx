// @ts-nocheck
/**
 * Component: AIAttachmentsModule
 * 
 * AI panel module for attachment intelligence.
 * Actions: Summarize, Extract fields, Describe
 * Citations with provenance (PDF page 3, etc.)
 */

import { Box, Typography, IconButton, Button, Switch, Chip, alpha, Divider } from '@mui/material';
import {
  AutoAwesome as AIIcon,
  Summarize as SummarizeIcon,
  DataObject as ExtractIcon,
  Description as DescribeIcon,
  ExpandMore as ExpandIcon,
  CheckCircle as CheckIcon,
} from '@mui/icons-material';
import { useState } from 'react';
import { Attachment, formatFileSize, getAttachmentIcon } from '../../inbox/types/attachment';
import { getChannelLabel } from '@/lib/mockMessages';
import { color, spacing, typography, radius, text } from '../../../shared/tokens/design-tokens';

interface AIAttachmentsModuleProps {
  attachments: Attachment[];
  onToggleInclude: (attachmentId: string) => void;
  onAction: (attachmentId: string, action: 'summarize' | 'extract' | 'describe') => void;
}

export const AIAttachmentsModule = ({ 
  attachments, 
  onToggleInclude, 
  onAction 
}: AIAttachmentsModuleProps) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [includedIds, setIncludedIds] = useState<Set<string>>(
    () => new Set(attachments.filter((attachment) => attachment.includeInAI).map((attachment) => attachment.id))
  );

  if (attachments.length === 0) {
    return null;
  }

  const toggleInclude = (attachment: Attachment) => {
    setIncludedIds((prev) => {
      const next = new Set(prev);
      if (next.has(attachment.id)) {
        next.delete(attachment.id);
      } else {
        next.add(attachment.id);
      }
      return next;
    });
    onToggleInclude(attachment.id);
  };

  const runMetadataAction = (attachment: Attachment, action: 'summarize' | 'extract' | 'describe') => {
    onAction(attachment.id, action);
    setExpandedId(attachment.id);
  };

  return (
    <Box>
      {/* Module Header */}
      <Box
        sx={{
          px: spacing[16],
          py: spacing[12],
          borderBottom: `1px solid ${alpha(color.neutral[900], 0.06)}`,
          bgcolor: alpha(color.ai[500], 0.03),
        }}
      >
        <Typography
          sx={{
            fontSize: typography.fontSize.xs,
            fontWeight: typography.fontWeight.semibold,
            color: text.secondary,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
          }}
        >
          Attachments ({attachments.length})
        </Typography>
      </Box>

      {/* Attachment List */}
      <Box sx={{ p: spacing[16] }}>
        {attachments.map((attachment, index) => {
          const isExpanded = expandedId === attachment.id;
          const isIncluded = includedIds.has(attachment.id);
          const hasAIAnalysis = attachment.aiSummary || attachment.aiExtractedFields || attachment.aiDescription;

          return (
            <Box key={attachment.id}>
              {index > 0 && <Divider sx={{ my: spacing[12] }} />}
              
              <Box>
                {/* Attachment Header */}
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: spacing[10], mb: spacing[8] }}>
                  {/* Icon */}
                  <Typography sx={{ fontSize: typography.fontSize.lg, mt: spacing[2] }}>
                    {getAttachmentIcon(attachment.type)}
                  </Typography>

                  {/* Info */}
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography
                      sx={{
                        fontSize: typography.fontSize.sm,
                        fontWeight: typography.fontWeight.medium,
                        color: text.primary,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        mb: spacing[4],
                      }}
                    >
                      {attachment.name}
                    </Typography>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: spacing[8], flexWrap: 'wrap' }}>
                      <Typography sx={{ fontSize: typography.fontSize.xs, color: text.tertiary }}>
                        {formatFileSize(attachment.size)}
                      </Typography>
                      <Box sx={{ width: 3, height: 3, borderRadius: '50%', bgcolor: text.tertiary }} />
                      <Chip
                        label={getChannelLabel(attachment.source)}
                        size="small"
                        sx={{
                          height: 16,
                          fontSize: typography.fontSize.xs,
                          bgcolor: alpha(color.neutral[900], 0.06),
                          color: text.tertiary,
                          '& .MuiChip-label': { px: spacing[6] },
                        }}
                      />
                    </Box>
                  </Box>

                  {/* Include Toggle */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: spacing[6] }}>
                    <Typography sx={{ fontSize: typography.fontSize.xs, color: text.tertiary }}>
                      Include
                    </Typography>
                    <Switch
                      size="small"
                      checked={isIncluded}
                      onChange={() => toggleInclude(attachment)}
                      sx={{
                        '& .MuiSwitch-switchBase.Mui-checked': {
                          color: color.ai[600],
                        },
                        '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                          bgcolor: color.ai[500],
                        },
                      }}
                    />
                  </Box>
                </Box>

                {/* AI Actions */}
                <Box sx={{ display: 'flex', gap: spacing[6], mb: spacing[8] }}>
                  <Button
                    size="small"
                    startIcon={<SummarizeIcon sx={{ fontSize: 14 }} />}
                    onClick={() => runMetadataAction(attachment, 'summarize')}
                    disabled={!isIncluded}
                    sx={{
                      fontSize: typography.fontSize.xs,
                      textTransform: 'none',
                      color: attachment.aiSummary ? color.ai[700] : text.secondary,
                      bgcolor: attachment.aiSummary ? alpha(color.ai[500], 0.08) : 'transparent',
                      px: spacing[8],
                      py: spacing[4],
                      minWidth: 'auto',
                      '&:hover': {
                        bgcolor: alpha(color.ai[500], 0.12),
                      },
                    }}
                  >
                    Summarize
                  </Button>
                  
                  <Button
                    size="small"
                    startIcon={<ExtractIcon sx={{ fontSize: 14 }} />}
                    onClick={() => runMetadataAction(attachment, 'extract')}
                    disabled={!isIncluded}
                    sx={{
                      fontSize: typography.fontSize.xs,
                      textTransform: 'none',
                      color: attachment.aiExtractedFields ? color.ai[700] : text.secondary,
                      bgcolor: attachment.aiExtractedFields ? alpha(color.ai[500], 0.08) : 'transparent',
                      px: spacing[8],
                      py: spacing[4],
                      minWidth: 'auto',
                      '&:hover': {
                        bgcolor: alpha(color.ai[500], 0.12),
                      },
                    }}
                  >
                    Extract
                  </Button>
                  
                  <Button
                    size="small"
                    startIcon={<DescribeIcon sx={{ fontSize: 14 }} />}
                    onClick={() => runMetadataAction(attachment, 'describe')}
                    disabled={!isIncluded}
                    sx={{
                      fontSize: typography.fontSize.xs,
                      textTransform: 'none',
                      color: attachment.aiDescription ? color.ai[700] : text.secondary,
                      bgcolor: attachment.aiDescription ? alpha(color.ai[500], 0.08) : 'transparent',
                      px: spacing[8],
                      py: spacing[4],
                      minWidth: 'auto',
                      '&:hover': {
                        bgcolor: alpha(color.ai[500], 0.12),
                      },
                    }}
                  >
                    Describe
                  </Button>
                </Box>

                {/* AI Analysis Results */}
                {hasAIAnalysis && (
                  <Box
                    sx={{
                      p: spacing[12],
                      borderRadius: radius.sm,
                      bgcolor: alpha(color.ai[500], 0.04),
                      border: `1px solid ${alpha(color.ai[500], 0.12)}`,
                    }}
                  >
                    {/* Summary */}
                    {attachment.aiSummary && (
                      <Box sx={{ mb: spacing[12] }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: spacing[6], mb: spacing[6] }}>
                          <AIIcon sx={{ fontSize: 14, color: color.ai[600] }} />
                          <Typography
                            sx={{
                              fontSize: typography.fontSize.xs,
                              fontWeight: typography.fontWeight.semibold,
                              color: color.ai[700],
                            }}
                          >
                            AI Summary
                          </Typography>
                        </Box>
                        <Typography sx={{ fontSize: typography.fontSize.xs, color: text.secondary, lineHeight: 1.5 }}>
                          {attachment.aiSummary}
                        </Typography>
                      </Box>
                    )}

                    {/* Extracted Fields */}
                    {attachment.aiExtractedFields && (
                      <Box sx={{ mb: spacing[12] }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: spacing[6], mb: spacing[6] }}>
                          <AIIcon sx={{ fontSize: 14, color: color.ai[600] }} />
                          <Typography
                            sx={{
                              fontSize: typography.fontSize.xs,
                              fontWeight: typography.fontWeight.semibold,
                              color: color.ai[700],
                            }}
                          >
                            Extracted Data
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: spacing[6] }}>
                          {Object.entries(attachment.aiExtractedFields).map(([key, value]) => (
                            <Box key={key} sx={{ display: 'flex', gap: spacing[8] }}>
                              <Typography
                                sx={{
                                  fontSize: typography.fontSize.xs,
                                  fontWeight: typography.fontWeight.medium,
                                  color: text.secondary,
                                  minWidth: 80,
                                }}
                              >
                                {key}:
                              </Typography>
                              <Typography sx={{ fontSize: typography.fontSize.xs, color: text.primary }}>
                                {value}
                              </Typography>
                            </Box>
                          ))}
                        </Box>
                      </Box>
                    )}

                    {/* Description */}
                    {attachment.aiDescription && (
                      <Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: spacing[6], mb: spacing[6] }}>
                          <AIIcon sx={{ fontSize: 14, color: color.ai[600] }} />
                          <Typography
                            sx={{
                              fontSize: typography.fontSize.xs,
                              fontWeight: typography.fontWeight.semibold,
                              color: color.ai[700],
                            }}
                          >
                            AI Description
                          </Typography>
                        </Box>
                        <Typography sx={{ fontSize: typography.fontSize.xs, color: text.secondary, lineHeight: 1.5 }}>
                          {attachment.aiDescription}
                        </Typography>
                      </Box>
                    )}

                    {/* Citations */}
                    {attachment.citations && attachment.citations.length > 0 && (
                      <Box sx={{ mt: spacing[12], pt: spacing[12], borderTop: `1px solid ${alpha(color.ai[500], 0.1)}` }}>
                        <Typography
                          sx={{
                            fontSize: typography.fontSize.xs,
                            fontWeight: typography.fontWeight.medium,
                            color: text.tertiary,
                            mb: spacing[6],
                          }}
                        >
                          Citations:
                        </Typography>
                        {attachment.citations.map((citation, idx) => (
                          <Box key={idx} sx={{ display: 'flex', gap: spacing[6], mb: spacing[4] }}>
                            <Typography sx={{ fontSize: typography.fontSize.xs, color: text.tertiary }}>
                              •
                            </Typography>
                            <Typography sx={{ fontSize: typography.fontSize.xs, color: text.secondary }}>
                              {citation.location && (
                                <Typography
                                  component="span"
                                  sx={{
                                    fontSize: typography.fontSize.xs,
                                    fontWeight: typography.fontWeight.medium,
                                    color: color.ai[700],
                                    mr: spacing[6],
                                  }}
                                >
                                  [{citation.location}]
                                </Typography>
                              )}
                              {citation.text}
                            </Typography>
                          </Box>
                        ))}
                      </Box>
                    )}
                  </Box>
                )}
              </Box>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
};
