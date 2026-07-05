import { AlertsView, type Alert } from '@/features/alerts/AlertsView';
import { OrbitReviewsPage } from './OrbitReviewsPage';
import type { ReviewAlert } from '@/types';

type AlertsProps = {
  alerts?: ReviewAlert[];
};

const toAlert = (alert: ReviewAlert): Alert => ({
  id: String(alert.id),
  trigger: alert.title,
  scope: String(alert.metadata?.scope ?? 'All sources'),
  detectedAt: alert.detectedAt ? new Date(alert.detectedAt).toLocaleDateString([], { month: 'short', day: 'numeric' }) : 'Recent',
  evidence: String(alert.evidence?.summary ?? alert.metadata?.evidenceSummary ?? 'Evidence available'),
  owner: alert.ownerName,
  status: alert.status as Alert['status'],
  severity: alert.severity as Alert['severity'],
  description: String(alert.metadata?.description ?? alert.title),
});

export default function Alerts({ alerts }: AlertsProps) {
  return (
    <OrbitReviewsPage title="Alerts">
      <AlertsView alerts={alerts?.map(toAlert)} />
    </OrbitReviewsPage>
  );
}
