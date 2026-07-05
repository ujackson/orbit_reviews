// @ts-nocheck
import { Box, Button, CircularProgress, TextField, Typography, alpha } from '@mui/material';
import { AutoAwesome as AutoAwesomeIcon, Search as SearchIcon } from '@mui/icons-material';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useRagQuery } from '../hooks/useRagQuery';
import { color, radius, spacing, text, typography } from '../../../shared/tokens/design-tokens';

interface RagKnowledgeContainerProps {
  conversationId: string | null;
}

export const RagKnowledgeContainer = ({ conversationId }: RagKnowledgeContainerProps) => {
  const [question, setQuestion] = useState('');
  const [pendingQuestion, setPendingQuestion] = useState<string | null>(null);
  const [pollAttempts, setPollAttempts] = useState(0);
  const { askAsync, data, isAsking, error, reset } = useRagQuery(conversationId);
  const isWaitingForKnowledge = Boolean(data?.indexing || pendingQuestion);
  const canAsk = !!conversationId && question.trim().length > 2 && !isAsking && !isWaitingForKnowledge;

  useEffect(() => {
    setQuestion('');
    setPendingQuestion(null);
    setPollAttempts(0);
    reset();
  }, [conversationId, reset]);

  useEffect(() => {
    if (!pendingQuestion || !data?.indexing || isAsking) return;

    if (pollAttempts >= 45) {
      setPendingQuestion(null);
      toast.error('Workspace knowledge is still indexing. Try again in a moment.');
      return;
    }

    const timer = window.setTimeout(async () => {
      try {
        const response = await askAsync(pendingQuestion);
        setPollAttempts((value) => value + 1);
        if (!response.indexing) {
          setPendingQuestion(null);
          setPollAttempts(0);
        }
      } catch (err) {
        setPendingQuestion(null);
        toast.error(err instanceof Error ? err.message : 'Workspace knowledge search failed');
      }
    }, 2000);

    return () => window.clearTimeout(timer);
  }, [askAsync, data?.indexing, isAsking, pendingQuestion, pollAttempts]);

  const handleAsk = async () => {
    if (!canAsk) return;

    try {
      const trimmedQuestion = question.trim();
      const response = await askAsync(trimmedQuestion);
      if (response.indexing) {
        setPendingQuestion(trimmedQuestion);
        setPollAttempts(0);
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Workspace knowledge search failed');
    }
  };

  return (
    <Box sx={{ mb: spacing[32] }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: spacing[8], mb: spacing[12] }}>
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
          <AutoAwesomeIcon sx={{ fontSize: 13, color: color.ai[700] }} />
        </Box>
        <Typography sx={{ fontWeight: typography.fontWeight.semibold, fontSize: typography.fontSize.base, color: text.primary }}>
          Workspace Knowledge
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', gap: spacing[8], mb: spacing[12] }}>
        <TextField
          value={question}
          onChange={(event) => setQuestion(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') handleAsk();
          }}
          placeholder="Ask about this conversation..."
          size="small"
          disabled={!conversationId || isAsking || isWaitingForKnowledge}
          sx={{
            flex: 1,
            '& .MuiOutlinedInput-root': {
              borderRadius: radius.base,
              bgcolor: color.surface.primary,
              fontSize: typography.fontSize.sm,
            },
          }}
        />
        <Button
          variant="contained"
          onClick={handleAsk}
          disabled={!canAsk}
          sx={{
            minWidth: 40,
            px: spacing[12],
            borderRadius: radius.base,
            bgcolor: color.ai[600],
            '&:hover': { bgcolor: color.ai[700] },
          }}
        >
          {isAsking || isWaitingForKnowledge ? <CircularProgress size={16} sx={{ color: color.surface.primary }} /> : <SearchIcon sx={{ fontSize: 18 }} />}
        </Button>
      </Box>

      {(data?.answer || error) && (
        <Box
          sx={{
            p: spacing[16],
            borderRadius: radius.base,
            bgcolor: alpha(color.ai[500], 0.05),
            border: `1px solid ${alpha(color.ai[500], 0.12)}`,
          }}
        >
          <Typography sx={{ fontSize: typography.fontSize.sm, lineHeight: 1.55, color: error ? color.functional.error : text.primary }}>
            {error ? error.message : data.answer || 'No indexed workspace knowledge matched this question.'}
          </Typography>

          {data?.sources?.length > 0 && (
            <Box sx={{ mt: spacing[12], display: 'flex', flexDirection: 'column', gap: spacing[8] }}>
              {data.sources.slice(0, 3).map((source) => (
                <Box
                  key={source.contentId}
                  sx={{
                    p: spacing[8],
                    borderRadius: radius.sm,
                    bgcolor: alpha(color.neutral[900], 0.025),
                  }}
                >
                  <Typography sx={{ fontSize: typography.fontSize.xs, color: text.tertiary, mb: spacing[4] }}>
                    {source.title || source.contentType}
                  </Typography>
                  <Typography sx={{ fontSize: typography.fontSize.xs, color: text.secondary }}>
                    {source.text}
                  </Typography>
                </Box>
              ))}
            </Box>
          )}
        </Box>
      )}
    </Box>
  );
};
