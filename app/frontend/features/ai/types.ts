// @ts-nocheck
export interface AIInsights {
  intent: string;
  priority: 'normal' | 'high' | 'urgent';
  estimatedResponseTime: string;
  extractedEntities: Array<{
    type: string;
    value: string;
  }>;
  suggestedActions: Array<{
    id: string;
    label: string;
    action: string;
  }>;
}

export interface SuggestedReply {
  id: string;
  text: string;
  confidence: number;
}
