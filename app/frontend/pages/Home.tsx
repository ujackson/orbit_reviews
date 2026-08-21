import { HomeView } from '@/features/home/HomeView';
import { OrbitReviewsPage } from './OrbitReviewsPage';
import type { ReviewInsight, ReviewSourceAccount } from '@/types';

type HomeProps = {
  metrics?: {
    reviewCount: number;
    needsResponseCount: number;
    activeAlertCount: number;
    activeAutomationCount: number;
  };
  recentInsights?: ReviewInsight[];
  sourceAccounts?: ReviewSourceAccount[];
};

export default function Home(props: HomeProps) {
  return (
    <OrbitReviewsPage title="Home">
      <HomeView {...props} />
    </OrbitReviewsPage>
  );
}
