// @ts-nocheck
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { inboxApi } from '../api/inboxApi';
import { inboxKeys } from '../api/inboxKeys';
import { useWorkspace } from '@/providers/WorkspaceProvider';
import { MessageStatus } from '../types';

export const useUpdateStatus = () => {
  const queryClient = useQueryClient();
  const { workspace } = useWorkspace();
  const workspaceId = workspace?.id || 'default';

  return useMutation({
    mutationFn: ({ messageId, status }: { messageId: string; status: MessageStatus }) =>
      inboxApi.updateMessageStatus(workspaceId, messageId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: inboxKeys.all });
    },
  });
};
