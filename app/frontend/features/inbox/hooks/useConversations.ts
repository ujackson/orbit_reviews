// @ts-nocheck
import { useQuery } from '@tanstack/react-query';
import { inboxApi, ConversationsFilter } from '../api/inboxApi';
import { inboxKeys } from '../api/inboxKeys';
import { useWorkspace } from '@/providers/WorkspaceProvider';

export const useConversations = (viewId: string, filter: ConversationsFilter = {}) => {
  const { workspace } = useWorkspace();
  const workspaceId = workspace?.id || 'default';

  return useQuery({
    queryKey: inboxKeys.conversations(workspaceId, viewId, filter),
    queryFn: () => inboxApi.getConversations(workspaceId, filter),
  });
};
