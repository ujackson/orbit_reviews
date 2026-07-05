import { ConnectionsView, type SourceProvider } from '@/features/connections/ConnectionsView';
import { OrbitReviewsPage } from './OrbitReviewsPage';
import type { ReviewSourceAccount } from '@/types';

type ConnectionsProps = {
  sourceAccounts?: ReviewSourceAccount[];
};

const toSources = (accounts: ReviewSourceAccount[] = []): SourceProvider[] => {
  const groups = new Map<string, SourceProvider>();

  accounts.forEach(account => {
    const key = account.provider ?? account.sourceName ?? 'reviews';
    const provider = groups.get(key) ?? {
      id: key,
      name: account.sourceName ?? account.provider ?? 'Review source',
      category: 'Review source',
      accounts: [],
    };

    provider.accounts.push({
      id: String(account.id),
      name: account.name,
      status: account.status as SourceProvider['accounts'][number]['status'],
      lastSync: account.lastSyncAt ? new Date(account.lastSyncAt).toLocaleString([], { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }) : 'Never',
      latestReview: account.latestReviewAt ? new Date(account.latestReviewAt).toLocaleString([], { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }) : 'None yet',
      recordsSynced: account.recordsCount,
      syncFrequency: account.syncFrequency ?? 'Manual',
      error: String(account.metadata?.error ?? ''),
    });
    groups.set(key, provider);
  });

  return Array.from(groups.values());
};

export default function Connections({ sourceAccounts }: ConnectionsProps) {
  return (
    <OrbitReviewsPage title="Connections">
      <ConnectionsView sources={toSources(sourceAccounts)} />
    </OrbitReviewsPage>
  );
}
