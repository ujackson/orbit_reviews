import { ReactNode } from 'react';
import { Head } from '@inertiajs/react';
import { OrbitShell } from '@/layout/OrbitShell';

interface OrbitReviewsPageProps {
  title: string;
  children: ReactNode;
}

export function OrbitReviewsPage({ title, children }: OrbitReviewsPageProps) {
  return (
    <OrbitShell>
      <Head title={title} />
      {children}
    </OrbitShell>
  );
}
