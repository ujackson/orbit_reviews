// @ts-nocheck
/**
 * Feature Container: SuggestedReplyContainer (Layer 4)
 * 
 * Connects suggested reply hook with AIInsightBlock pattern and editing logic.
 * This is where AI suggestion data enters the UI.
 */

import { Box, IconButton, alpha } from '@mui/material';
import {
  ContentCopy as ContentCopyIcon,
  Edit as EditIcon,
  ThumbUp as ThumbUpIcon,
  ThumbDown as ThumbDownIcon,
} from '@mui/icons-material';
import { Button } from '../../../shared/ui/primitives';
import { AIInsightBlock, AIInsightBlockEmpty } from '../patterns';
import { useSuggestedReply } from '../hooks/useSuggestedReply';
import { useInboxUIStore } from '../../inbox/store/inboxUIStore';
import { useEffect } from 'react';
import { toast } from 'sonner';
import { color, spacing, typography, radius, transition, text } from '../../../shared/tokens/design-tokens';

interface SuggestedReplyContainerProps {
  conversationId: string | null;
}

export const SuggestedReplyContainer = ({
  conversationId,
}: SuggestedReplyContainerProps) => {
  const { 
    isEditingSuggestedReply,
    setEditingSuggestedReply,
    editedSuggestedReply,
    setEditedSuggestedReply,
    setComposerDraft,
  } = useInboxUIStore();
  
  const { data: suggestedReply, isLoading, error } = useSuggestedReply(conversationId);
  const savedDraft = suggestedReply?.text?.trim() || '';
  const draftText = (isEditingSuggestedReply ? editedSuggestedReply : savedDraft).trim();
  const hasDraft = draftText.length > 0;
  const controlsDisabled = isLoading || !!error || !hasDraft;

  // Initialize edited reply when suggested reply loads
  useEffect(() => {
    setEditedSuggestedReply(suggestedReply?.text || '');
    setEditingSuggestedReply(false);
  }, [conversationId, suggestedReply?.text]);

  const handleStartEditing = () => {
    setEditedSuggestedReply(suggestedReply?.text || '');
    setEditingSuggestedReply(true);
  };

  const handleCancelEditing = () => {
    setEditedSuggestedReply(suggestedReply?.text || '');
    setEditingSuggestedReply(false);
  };

  const handleApplyReply = () => {
    if (!draftText) return;
    setComposerDraft(draftText);
    setEditingSuggestedReply(false);
  };

  const handleCopyReply = () => {
    if (!savedDraft) return;
    navigator.clipboard.writeText(savedDraft);
  };

  if (!conversationId) {
    return <AIInsightBlockEmpty message="Select a conversation to view suggested reply" />;
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: spacing[12] }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: spacing[8] }}>
          <Box
            sx={{
              width: 20,
              height: 20,
              borderRadius: '50%',
              bgcolor: alpha(color.ai[500], 0.15),
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Box sx={{ fontSize: 12, color: color.ai[700] }}>✨</Box>
          </Box>
          <Box
            component="span"
            sx={{
              fontWeight: typography.fontWeight.semibold,
              fontSize: typography.fontSize.base,
              color: text.primary,
            }}
          >
            Suggested Reply
          </Box>
        </Box>
        {!isEditingSuggestedReply && (
          <IconButton 
            size="small" 
            disabled={controlsDisabled}
            sx={{ 
              color: text.secondary,
              transition: `all ${transition.duration.fast} ${transition.easing.base}`,
              '&:hover': {
                bgcolor: alpha(color.ai[500], 0.08),
                color: color.ai[700],
              },
            }}
            onClick={handleCopyReply}
          >
            <ContentCopyIcon sx={{ fontSize: 16 }} />
          </IconButton>
        )}
      </Box>
      
      <AIInsightBlock
        variant="suggestion"
        title=""
        content={editedSuggestedReply || savedDraft || 'No suggested reply available'}
        isLoading={isLoading}
        isEditing={isEditingSuggestedReply}
        isError={false}
        errorMessage=""
        onContentChange={setEditedSuggestedReply}
        showBadge={false}
      />

      {isEditingSuggestedReply ? (
        <Box sx={{ display: 'flex', gap: spacing[8], mt: spacing[12] }}>
          <Button
            variant="primary"
            size="sm"
            fullWidth
            onClick={handleApplyReply}
            disabled={!draftText.trim()}
            sx={{ 
              bgcolor: color.ai[600],
              '&:hover': { 
                bgcolor: color.ai[700],
              },
            }}
          >
            Apply
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleCancelEditing}
            sx={{ minWidth: 80 }}
          >
            Cancel
          </Button>
        </Box>
      ) : (
        <Box sx={{ display: 'flex', gap: spacing[8], mt: spacing[12] }}>
          <Button
            variant="primary"
            size="sm"
            fullWidth
            onClick={handleApplyReply}
            disabled={controlsDisabled}
            sx={{ 
              bgcolor: color.ai[600],
              '&:hover': { 
                bgcolor: color.ai[700],
              },
            }}
          >
            Use Draft
          </Button>
          <IconButton 
            size="small" 
            onClick={handleStartEditing}
            disabled={controlsDisabled}
            sx={{ 
              border: `1px solid ${color.neutral[300]}`,
              borderRadius: radius.base,
              '&:hover': { 
                borderColor: color.ai[600],
                bgcolor: alpha(color.ai[600], 0.08),
                color: color.ai[700],
              },
            }}
          >
            <EditIcon sx={{ fontSize: 16 }} />
          </IconButton>
          <IconButton 
            size="small" 
            onClick={() => toast.success('Thanks for the feedback!')}
            disabled={controlsDisabled}
            sx={{ 
              border: `1px solid ${color.neutral[300]}`,
              borderRadius: radius.base,
              '&:hover': { 
                borderColor: color.functional.success,
                bgcolor: alpha(color.functional.success, 0.08),
                color: color.functional.success,
              },
            }}
          >
            <ThumbUpIcon sx={{ fontSize: 16 }} />
          </IconButton>
          <IconButton 
            size="small" 
            onClick={() => toast.info('Feedback noted. We\'ll improve our suggestions.')}
            disabled={controlsDisabled}
            sx={{ 
              border: `1px solid ${color.neutral[300]}`,
              borderRadius: radius.base,
              '&:hover': { 
                borderColor: color.functional.error,
                bgcolor: alpha(color.functional.error, 0.08),
                color: color.functional.error,
              },
            }}
          >
            <ThumbDownIcon sx={{ fontSize: 16 }} />
          </IconButton>
        </Box>
      )}
    </Box>
  );
};
