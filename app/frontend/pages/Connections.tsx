import { ConnectionsView } from '@/features/connections/ConnectionsView';
import { OrbitReviewsPage } from './OrbitReviewsPage';

export default function Connections() {
  return (
    <OrbitReviewsPage title="Integrations">
      <ConnectionsView />
    </OrbitReviewsPage>
  );
}
