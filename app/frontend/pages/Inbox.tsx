import { InboxView, type InboxReview } from '@/features/inbox/InboxView';
import { OrbitReviewsPage } from './OrbitReviewsPage';
import type { Review } from '@/types';

type InboxProps = {
  reviews?: Review[];
};

const sourceColor = (provider: string) => ({
  google: '#4285F4',
  appstore: '#555',
  playstore: '#3DDC84',
  g2: '#FF492C',
  trustpilot: '#00B67A',
}[provider] ?? '#5E6AD2');

const sourceAbbr = (provider: string) => ({
  google: 'G',
  appstore: 'AS',
  playstore: 'PL',
  g2: 'G2',
  trustpilot: 'TP',
}[provider] ?? provider.slice(0, 2).toUpperCase());

const toInboxReview = (review: Review): InboxReview => {
  const sourceName = review.sourceAccountName ?? review.sourceProvider;
  const analysis = review.analysis;
  const signals = Array.isArray(analysis?.signals) ? analysis.signals : [];
  const themes = Array.isArray(analysis?.themes) ? analysis.themes : [];

  return {
    id: String(review.id),
    sourceKey: review.sourceProvider,
    sourceName,
    sourceAbbr: sourceAbbr(review.sourceProvider),
    sourceColor: sourceColor(review.sourceProvider),
    rating: review.rating,
    title: review.title,
    excerpt: review.body,
    body: review.body,
    author: review.authorName ?? 'Anonymous',
    context: [review.productName, review.appVersion, review.platform, review.locationName].filter(Boolean).join(' · '),
    timestamp: new Date(review.reviewedAt).toLocaleString([], { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }),
    status: review.workflowStatus as InboxReview['status'],
    sentiment: review.sentiment as InboxReview['sentiment'],
    tags: themes.length ? themes : [review.sentiment],
    language: review.language,
    unread: review.responseStatus !== 'posted',
    relatedCount: analysis?.relatedReviewCount ?? 0,
    signals,
    themes,
    suggestedReplyBasis: ['Original review', 'Approved response policy', 'Verified product status'],
    suggestedReply: String(review.metadata?.suggestedReply ?? 'Thanks for sharing this feedback. Our team is reviewing the details and will follow up with the right next step.'),
  };
};

export default function Inbox({ reviews }: InboxProps) {
  return (
    <OrbitReviewsPage title="Inbox">
      <InboxView reviews={reviews?.map(toInboxReview)} />
    </OrbitReviewsPage>
  );
}
