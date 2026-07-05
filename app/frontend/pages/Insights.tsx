import { InsightsView, type Insight } from '@/features/insights/InsightsView';
import { OrbitReviewsPage } from './OrbitReviewsPage';
import type { ReviewInsight } from '@/types';

type InsightsProps = {
  insights?: ReviewInsight[];
};

const toInsight = (insight: ReviewInsight): Insight => ({
  id: String(insight.id),
  title: insight.title,
  severity: insight.severity as Insight['severity'],
  change: insight.changePercent,
  changeDir: insight.changePercent.trim().startsWith('-') || insight.changePercent.trim().startsWith('−') ? 'down' : 'up',
  isNegativeChange: insight.severity !== 'low',
  evidence: insight.evidenceCount,
  evidenceUnit: 'reviews',
  scope: insight.scope ?? 'All sources',
  firstDetected: insight.detectedAt ? new Date(insight.detectedAt).toLocaleDateString([], { month: 'short', day: 'numeric' }) : 'Recent',
  lastUpdated: insight.lastUpdatedAt ? new Date(insight.lastUpdatedAt).toLocaleDateString([], { month: 'short', day: 'numeric' }) : 'Recently',
  status: insight.status as Insight['status'],
  owner: insight.ownerName,
  detail: {
    summary: String(insight.metadata?.summary ?? insight.title),
    keyFacts: [
      { label: 'Change', value: insight.changePercent },
      { label: 'Evidence', value: String(insight.evidenceCount) },
      { label: 'Scope', value: insight.scope ?? 'All sources' },
      { label: 'Status', value: insight.status },
    ],
    primaryDriver: String(insight.metadata?.primaryDriver ?? insight.title),
  },
});

export default function Insights({ insights }: InsightsProps) {
  return (
    <OrbitReviewsPage title="Insights">
      <InsightsView insights={insights?.map(toInsight)} />
    </OrbitReviewsPage>
  );
}
