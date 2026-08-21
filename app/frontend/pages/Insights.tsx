import { IssuesView } from '@/features/issues/IssuesView';
import { OrbitReviewsPage } from './OrbitReviewsPage';

export default function Insights() {
  return (
    <OrbitReviewsPage title="Issues">
      <IssuesView />
    </OrbitReviewsPage>
  );
}
