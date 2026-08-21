import { FeedbackView } from '@/features/inbox/InboxView';
import { OrbitReviewsPage } from './OrbitReviewsPage';
import type { Review } from '@/types';

type InboxProps = {
  reviews?: Review[];
};

export default function Inbox(props: InboxProps) {
  return (
    <OrbitReviewsPage title="Feedback">
      <FeedbackView reviews={props.reviews} />
    </OrbitReviewsPage>
  );
}
