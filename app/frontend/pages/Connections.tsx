import { ConnectionsView } from '@/features/connections/ConnectionsView';
import { OrbitReviewsPage } from './OrbitReviewsPage';
import type { ReviewSourceAccount } from '@/types';
import type { IntegrationCatalogItem, IntegrationConnection } from '@/features/connections/ConnectionsView';

type ConnectionsProps = {
  sourceAccounts?: ReviewSourceAccount[];
  integrationCatalog?: IntegrationCatalogItem[];
  integrationConnections?: IntegrationConnection[];
};

export default function Connections(props: ConnectionsProps) {
  return (
    <OrbitReviewsPage title="Integrations">
      <ConnectionsView {...props} />
    </OrbitReviewsPage>
  );
}
