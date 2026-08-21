import { IssuesView } from '@/features/issues/IssuesView';
import { OrbitReviewsPage } from './OrbitReviewsPage';

export default function Themes() {
  return (
    <OrbitReviewsPage title="Issues">
      <IssuesView />
    </OrbitReviewsPage>
  );
}
