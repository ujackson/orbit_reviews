// @ts-nocheck
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { inboxApi } from '../api/inboxApi';
import { inboxKeys } from '../api/inboxKeys';
import { useWorkspace } from '@/providers/WorkspaceProvider';
import { useAuth } from '@/providers/AuthProvider';

export const useAssignConversation = () => {
  const queryClient = useQueryClient();
  const { workspace } = useWorkspace();
  const { user } = useAuth();
  const workspaceId = workspace?.id || 'default';

  return useMutation({
    mutationFn: ({ conversationId, userId }: { conversationId: string; userId?: string }) =>
      inboxApi.assignConversation(workspaceId, conversationId, userId || user?.id || ''),
    onSuccess: () => {
      // Invalidate conversations list
      queryClient.invalidateQueries({ queryKey: inboxKeys.conversations(workspaceId, '', undefined) });
    },
  });
};
