import { createFileRoute } from '@tanstack/react-router';
import { lazy, Suspense } from 'react';
import { Loading } from '@/components/loading';

const Records = lazy(() => import('@/pages/records').then(m => ({ default: m.Records })));

export const Route = createFileRoute('/records')({
  component: () => (
    <Suspense fallback={<Loading />}>
      <Records />
    </Suspense>
  ),
});
