import { ImpactView } from '@/features/reports/ReportsView';
import { OrbitReviewsPage } from './OrbitReviewsPage';

export default function Reports() {
  return (
    <OrbitReviewsPage title="Impact">
      <ImpactView />
    </OrbitReviewsPage>
  );
}
