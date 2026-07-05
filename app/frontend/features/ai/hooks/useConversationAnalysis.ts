// @ts-nocheck
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { aiApi } from '../api/aiApi';
import { aiKeys } from '../api/aiKeys';
import { useWorkspace } from '@/providers/WorkspaceProvider';

const ACTIVE_RUN_STATUSES = new Set(['pending', 'running']);

export const useConversationAnalysis = (conversationId: string | null) => {
  const { workspace } = useWorkspace();
  const queryClient = useQueryClient();
  const workspaceId = workspace?.id || 'default';
  const [queued, setQueued] = useState(false);

  const query = useQuery({
    queryKey: aiKeys.analysis(workspaceId, conversationId || ''),
    queryFn: () => aiApi.getAnalysis(workspaceId, conversationId || ''),
    enabled: !!conversationId && !!workspaceId,
    refetchInterval: (query) => {
      const status = query.state.data?.aiRun?.status;
      return queued || ACTIVE_RUN_STATUSES.has(status) ? 2500 : false;
    },
  });

  const analyzeMutation = useMutation({
    mutationFn: () => aiApi.analyzeConversation(workspaceId, conversationId || ''),
    onMutate: () => {
      setQueued(true);
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: aiKeys.analysis(workspaceId, conversationId || '') }),
        queryClient.invalidateQueries({ queryKey: aiKeys.summary(workspaceId, conversationId || '') }),
        queryClient.invalidateQueries({ queryKey: aiKeys.insights(workspaceId, conversationId || '') }),
        queryClient.invalidateQueries({ queryKey: aiKeys.suggestedReply(workspaceId, conversationId || '') }),
      ]);
    },
  });

  useEffect(() => {
    const status = query.data?.aiRun?.status;
    if (query.data?.summary || status === 'completed' || status === 'failed') {
      setQueued(false);
    }
  }, [query.data?.summary, query.data?.aiRun?.status]);

  return {
    ...query,
    analyze: analyzeMutation.mutate,
    analyzeAsync: analyzeMutation.mutateAsync,
    isAnalyzing: queued || analyzeMutation.isPending || ACTIVE_RUN_STATUSES.has(query.data?.aiRun?.status),
    analyzeError: analyzeMutation.error,
  };
};
