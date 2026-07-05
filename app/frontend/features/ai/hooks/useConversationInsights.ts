// @ts-nocheck
import { useConversationAnalysis } from './useConversationAnalysis';

export const useConversationInsights = (conversationId: string | null) => {
  const analysis = useConversationAnalysis(conversationId);
  const data = analysis.data;

  return {
    ...analysis,
    data: data
      ? {
          intent: data.intent?.displayLabel || data.intent?.label || 'Unknown',
          priority: data.priority?.level || 'normal',
          estimatedResponseTime: data.priority?.level === 'urgent' ? '1 hour' : data.priority?.level === 'high' ? '2 hours' : 'Same day',
          extractedEntities: data.entities.map((entity) => ({
            type: entity.type,
            value: entity.value,
          })),
          suggestedActions: data.nextActions.map((action, index) => ({
            id: `${index + 1}`,
            label: action.label,
            action: action.actionType,
          })),
        }
      : undefined,
  };
};
