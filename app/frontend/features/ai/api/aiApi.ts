// @ts-nocheck
import { AIInsights, SuggestedReply } from '../types';

export interface ConversationAnalysisResponse {
  aiRun: {
    id: number;
    status: string;
    provider: string;
    model: string;
    generatedAt: string;
  } | null;
  summary: {
    text: string;
    confidence: number;
    generatedAt: string;
  } | null;
  intent: {
    label: string;
    displayLabel: string;
    confidence: number;
    signals: string[];
  } | null;
  priority: {
    level: 'normal' | 'high' | 'urgent';
    confidence: number;
    reason: string;
  } | null;
  sentiment: {
    label: string;
    confidence: number;
  } | null;
  suggestedReply: {
    draft: string;
    tone: string;
    confidence: number;
  } | null;
  entities: Array<{
    key: string;
    value: string;
    type: string;
    confidence: number;
    sourceMessageId?: number;
  }>;
  nextActions: Array<{
    label: string;
    actionType: string;
    confidence: number;
    requiresApproval: boolean;
  }>;
  canAnalyze: boolean;
}

export const aiApi = {
  getAnalysis: async (
    workspaceId: string,
    conversationId: string
  ): Promise<ConversationAnalysisResponse> => {
    const response = await fetch(`/w/${workspaceId}/api/conversations/${conversationId}/ai`, {
      headers: { Accept: 'application/json' },
    });

    if (!response.ok) throw new Error(errorMessageForResponse(response, 'fetch AI analysis'));

    return normalizeAnalysis(await response.json());
  },

  analyzeConversation: async (
    workspaceId: string,
    conversationId: string
  ): Promise<{ status: string; conversationId: number }> => {
    const response = await fetch(`/w/${workspaceId}/api/conversations/${conversationId}/ai/analyze`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'X-CSRF-Token': document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')?.content || '',
      },
    });

    if (!response.ok) throw new Error(errorMessageForResponse(response, 'queue AI analysis'));

    const data = await response.json();
    return { status: data.status, conversationId: data.conversation_id };
  },

  // Get conversation summary
  getSummary: async (
    workspaceId: string,
    conversationId: string
  ): Promise<string> => {
    const analysis = await aiApi.getAnalysis(workspaceId, conversationId);
    return analysis.summary?.text || '';
  },

  // Get AI insights
  getInsights: async (
    workspaceId: string,
    conversationId: string
  ): Promise<AIInsights> => {
    const analysis = await aiApi.getAnalysis(workspaceId, conversationId);

    return {
      intent: analysis.intent?.displayLabel || analysis.intent?.label || 'Unknown',
      priority: analysis.priority?.level || 'normal',
      estimatedResponseTime: analysis.priority?.level === 'urgent' ? '1 hour' : analysis.priority?.level === 'high' ? '2 hours' : 'Same day',
      extractedEntities: analysis.entities.map((entity) => ({
        type: entity.type,
        value: entity.value,
      })),
      suggestedActions: analysis.nextActions.map((action, index) => ({
        id: `${index + 1}`,
        label: action.label,
        action: action.actionType,
      })),
    };
  },

  // Get suggested reply
  getSuggestedReply: async (
    workspaceId: string,
    conversationId: string
  ): Promise<SuggestedReply> => {
    const analysis = await aiApi.getAnalysis(workspaceId, conversationId);

    return {
      id: analysis.aiRun?.id?.toString() || conversationId,
      text: analysis.suggestedReply?.draft || '',
      confidence: analysis.suggestedReply?.confidence || 0,
    };
  },

  // Provide feedback on suggested reply
  feedbackSuggestedReply: async (
    replyId: string,
    feedback: 'positive' | 'negative'
  ): Promise<void> => {
    console.log('Feedback for reply:', replyId, feedback);
  },
};

const normalizeAnalysis = (analysis: any): ConversationAnalysisResponse => ({
  aiRun: analysis.ai_run
    ? {
        id: analysis.ai_run.id,
        status: analysis.ai_run.status,
        provider: analysis.ai_run.provider,
        model: analysis.ai_run.model,
        generatedAt: analysis.ai_run.generated_at,
      }
    : null,
  summary: analysis.summary
    ? {
        text: cleanSummaryText(analysis.summary.text),
        confidence: analysis.summary.confidence,
        generatedAt: analysis.summary.generated_at,
      }
    : null,
  intent: analysis.intent
    ? {
        label: analysis.intent.label,
        displayLabel: cleanText(analysis.intent.display_label),
        confidence: analysis.intent.confidence,
        signals: (analysis.intent.signals || []).map(cleanText),
      }
    : null,
  priority: analysis.priority
    ? {
        level: analysis.priority.level,
        confidence: analysis.priority.confidence,
        reason: cleanText(analysis.priority.reason),
      }
    : null,
  sentiment: analysis.sentiment
    ? {
        label: analysis.sentiment.label,
        confidence: analysis.sentiment.confidence,
      }
    : null,
  suggestedReply: analysis.suggested_reply
    ? {
        draft: cleanText(analysis.suggested_reply.draft),
        tone: analysis.suggested_reply.tone,
        confidence: analysis.suggested_reply.confidence,
      }
    : null,
  entities: (analysis.entities || []).map((entity: any) => ({
    key: cleanText(entity.key),
    value: cleanText(entity.value),
    type: cleanText(entity.type),
    confidence: entity.confidence,
    sourceMessageId: entity.source_message_id,
  })),
  nextActions: (analysis.next_actions || []).map((action: any) => ({
    label: cleanText(action.label),
    actionType: action.action_type,
    confidence: action.confidence,
    requiresApproval: action.requires_approval,
  })),
  canAnalyze: analysis.can_analyze,
});

const cleanText = (value: unknown): string => {
  const text = String(value ?? '');
  if (!text) return '';

  const textarea = document.createElement('textarea');
  textarea.innerHTML = text;

  return textarea.value
    .replace(/\u00A0/g, ' ')
    .replace(/[\u200B-\u200F\u202A-\u202E\u2060\u034F\u00AD]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
};

const cleanSummaryText = (value: unknown): string =>
  cleanText(value)
    .replace(/\.\.\./g, '')
    .replace(/\s+\.$/, '.')
    .trim();

const errorMessageForResponse = (response: Response, action: string): string => {
  if (response.status === 401) return 'Your session expired. Sign in again to load AI analysis.';
  if (response.status === 403) return 'You do not have access to this conversation analysis.';
  if (response.status === 404) return 'This conversation was not found in the current workspace.';
  if (response.status === 502) return 'The AI model gateway is unavailable. Try again after orbit_ai is healthy.';

  return `Failed to ${action}`;
};
