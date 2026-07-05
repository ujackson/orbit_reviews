// @ts-nocheck
/**
 * Feature Container: AISummaryContainer (Layer 4)
 * 
 * Connects AI summary hook with AIInsightBlock pattern.
 * This is where AI data enters the UI.
 */

import { AIInsightBlock, AIInsightBlockEmpty } from '../patterns';
import { useConversationAnalysis } from '../hooks/useConversationAnalysis';
import { useEffect, useRef } from 'react';

interface AISummaryContainerProps {
  conversationId: string | null;
  fallbackSummary?: string;
}

export const AISummaryContainer = ({
  conversationId,
}: AISummaryContainerProps) => {
  const requestedConversationIdRef = useRef<string | null>(null);
  const {
    data: analysis,
    isLoading,
    error,
    analyze,
    isAnalyzing,
  } = useConversationAnalysis(conversationId);

  const summary = analysis?.summary?.text || '';

  useEffect(() => {
    if (!conversationId || !analysis?.canAnalyze || analysis.summary) return;
    if (analysis.aiRun?.status === 'pending' || analysis.aiRun?.status === 'running') return;
    if (requestedConversationIdRef.current === conversationId) return;

    requestedConversationIdRef.current = conversationId;
    analyze();
  }, [conversationId, analysis?.canAnalyze, analysis?.summary, analysis?.aiRun, analyze]);

  if (!conversationId) {
    return <AIInsightBlockEmpty message="Select a conversation to view AI summary" />;
  }

  return (
    <AIInsightBlock
      variant="summary"
      title={isAnalyzing ? 'AI Summary · Analyzing' : 'AI Summary'}
      content={summary || 'Analysis queued. Summary will appear here shortly.'}
      isLoading={isLoading || isAnalyzing}
      isError={!!error}
      errorMessage={error?.message}
      showBadge
    />
  );
};
