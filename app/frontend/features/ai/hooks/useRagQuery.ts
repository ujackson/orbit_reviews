// @ts-nocheck
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ragApi } from '../api/ragApi';
import { useWorkspace } from '@/providers/WorkspaceProvider';

export const ragKeys = {
  all: (workspaceId: string) => ['rag', workspaceId] as const,
  conversation: (workspaceId: string, conversationId: string) => ['rag', workspaceId, 'conversation', conversationId] as const,
};

export const useRagQuery = (conversationId: string | null) => {
  const { workspace } = useWorkspace();
  const workspaceId = workspace?.id || 'default';
  const queryClient = useQueryClient();

  const indexMutation = useMutation({
    mutationFn: () => ragApi.indexConversation(workspaceId, conversationId || ''),
    onSuccess: () => {
      if (conversationId) {
        queryClient.invalidateQueries({ queryKey: ragKeys.conversation(workspaceId, conversationId) });
      }
    },
  });

  const queryMutation = useMutation({
    mutationFn: async (question: string) => {
      if (!conversationId) throw new Error('Select a conversation first.');
      return ragApi.queryConversation(workspaceId, conversationId, question, { content_type: 'message' }, 3);
    },
  });

  return {
    ask: queryMutation.mutate,
    askAsync: queryMutation.mutateAsync,
    reset: queryMutation.reset,
    isAsking: queryMutation.isPending || indexMutation.isPending,
    data: queryMutation.data,
    error: queryMutation.error,
    indexConversation: indexMutation.mutate,
    isIndexing: indexMutation.isPending,
  };
};
