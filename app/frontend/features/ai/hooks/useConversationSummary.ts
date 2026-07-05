// @ts-nocheck
import { useConversationAnalysis } from './useConversationAnalysis';

export const useConversationSummary = (conversationId: string | null) => {
  const analysis = useConversationAnalysis(conversationId);

  return {
    ...analysis,
    data: analysis.data?.summary?.text || '',
  };
};
