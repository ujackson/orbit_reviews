// @ts-nocheck
// Query key factory for inbox feature
export const inboxKeys = {
  all: ['inbox'] as const,
  
  conversations: (workspaceId: string, viewId: string, filters?: unknown) =>
    [...inboxKeys.all, 'conversations', workspaceId, viewId, filters] as const,
  
  conversation: (workspaceId: string, conversationId: string) =>
    [...inboxKeys.all, 'conversation', workspaceId, conversationId] as const,
  
  messages: (workspaceId: string, conversationId: string) =>
    [...inboxKeys.all, 'messages', workspaceId, conversationId] as const,
};
