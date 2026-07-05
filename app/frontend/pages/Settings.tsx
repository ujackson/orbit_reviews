import { SettingsView } from '@/features/settings/SettingsView';
import { OrbitReviewsPage } from './OrbitReviewsPage';

export default function Settings() {
  return (
    <OrbitReviewsPage title="Settings">
      <SettingsView />
    </OrbitReviewsPage>
  );
}
