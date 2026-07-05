// @ts-nocheck
import { useConversationAnalysis } from './useConversationAnalysis';

export const useSuggestedReply = (conversationId: string | null) => {
  const analysis = useConversationAnalysis(conversationId);
  const data = analysis.data;

  return {
    ...analysis,
    data: data
      ? {
          id: data.aiRun?.id?.toString() || conversationId || '',
          text: data.suggestedReply?.draft || '',
          confidence: data.suggestedReply?.confidence || 0,
        }
      : undefined,
  };
};
