// @ts-nocheck
import { useQuery } from '@tanstack/react-query';
import { inboxApi } from '../api/inboxApi';
import { inboxKeys } from '../api/inboxKeys';
import { useWorkspace } from '@/providers/WorkspaceProvider';

export const useMessages = (conversationId: string | null) => {
  const { workspace } = useWorkspace();
  const workspaceId = workspace?.id || 'default';

  return useQuery({
    queryKey: inboxKeys.messages(workspaceId, conversationId || ''),
    queryFn: () => inboxApi.getMessages(workspaceId, conversationId || ''),
    enabled: !!conversationId,
  });
};
