// @ts-nocheck
// Query key factory for AI feature
export const aiKeys = {
  all: ['ai'] as const,

  analysis: (workspaceId: string, conversationId: string) =>
    [...aiKeys.all, 'analysis', workspaceId, conversationId] as const,
  
  summary: (workspaceId: string, conversationId: string) =>
    [...aiKeys.all, 'summary', workspaceId, conversationId] as const,
  
  insights: (workspaceId: string, conversationId: string) =>
    [...aiKeys.all, 'insights', workspaceId, conversationId] as const,
  
  suggestedReply: (workspaceId: string, conversationId: string) =>
    [...aiKeys.all, 'suggestedReply', workspaceId, conversationId] as const,
};
