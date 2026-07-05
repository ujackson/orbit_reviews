import { ThemesView, type Theme } from '@/features/themes/ThemesView';
import { OrbitReviewsPage } from './OrbitReviewsPage';
import type { ReviewTheme } from '@/types';

type ThemesProps = {
  themes?: ReviewTheme[];
};

const spark = (count: number) => [0.45, 0.52, 0.48, 0.61, 0.58, 0.74, 0.78, 0.92, 1].map(v => ({ v: Math.round(count * v) }));

const toTheme = (theme: ReviewTheme): Theme => ({
  id: String(theme.id),
  name: theme.name,
  reviewCount: theme.reviewCount,
  shareOfReviews: theme.share,
  sentiment: theme.sentiment as Theme['sentiment'],
  sentimentPct: String(theme.metadata?.sentimentPct ?? `${theme.sentiment} sentiment`),
  change: theme.changePercent,
  changeDir: theme.changePercent.trim().startsWith('-') || theme.changePercent.trim().startsWith('−') ? 'down' : 'up',
  isNegativeChange: theme.sentiment === 'negative',
  sources: Number(theme.metadata?.sources ?? 1),
  products: Number(theme.metadata?.products ?? 1),
  status: theme.status as Theme['status'],
  spark: spark(theme.reviewCount),
  detail: {
    summary: theme.description ?? theme.name,
    evidence: Array.isArray(theme.metadata?.evidence) ? theme.metadata.evidence.map(String) : [`${theme.reviewCount.toLocaleString()} reviews mention ${theme.name}`],
    subthemes: Array.isArray(theme.metadata?.subthemes) ? theme.metadata.subthemes.map(String) : [],
    emergingPhrases: Array.isArray(theme.metadata?.emergingPhrases) ? theme.metadata.emergingPhrases.map(String) : [],
  },
});

export default function Themes({ themes }: ThemesProps) {
  return (
    <OrbitReviewsPage title="Themes">
      <ThemesView themes={themes?.map(toTheme)} />
    </OrbitReviewsPage>
  );
}
