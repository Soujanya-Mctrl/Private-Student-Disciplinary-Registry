import { createFileRoute } from '@tanstack/react-router';
import { lazy, Suspense } from 'react';
import { Loading } from '@/components/loading';

const Registration = lazy(() => import('@/pages/registration').then(m => ({ default: m.Registration })));

export const Route = createFileRoute('/registration')({
  component: () => (
    <Suspense fallback={<Loading />}>
      <Registration />
    </Suspense>
  ),
});
