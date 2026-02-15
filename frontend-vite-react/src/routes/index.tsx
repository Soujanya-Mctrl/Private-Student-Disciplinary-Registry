import { createFileRoute } from '@tanstack/react-router';
import { lazy, Suspense } from 'react';
import { Loading } from '@/components/loading';

const Home = lazy(() => import('@/pages/home').then(m => ({ default: m.Home })));

export const Route = createFileRoute('/')({
  component: () => (
    <Suspense fallback={<Loading />}>
      <Home />
    </Suspense>
  ),
});
