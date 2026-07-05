// @ts-nocheck
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { inboxApi } from '../api/inboxApi';
import { inboxKeys } from '../api/inboxKeys';
import { useWorkspace } from '@/providers/WorkspaceProvider';

export const useSendReply = () => {
  const queryClient = useQueryClient();
  const { workspace } = useWorkspace();
  const workspaceId = workspace?.id || 'default';

  return useMutation({
    mutationFn: ({ conversationId, body }: { conversationId: string; body: string }) =>
      inboxApi.sendReply(workspaceId, conversationId, body),
    onSuccess: (_message, variables) => {
      queryClient.invalidateQueries({ queryKey: inboxKeys.messages(workspaceId, variables.conversationId) });
      queryClient.invalidateQueries({ queryKey: inboxKeys.conversations(workspaceId, '', undefined) });
    },
  });
};
