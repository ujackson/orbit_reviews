import { FeedbackView } from '@/features/inbox/InboxView';
import { OrbitReviewsPage } from './OrbitReviewsPage';

export default function Inbox() {
  return (
    <OrbitReviewsPage title="Feedback">
      <FeedbackView />
    </OrbitReviewsPage>
  );
}
