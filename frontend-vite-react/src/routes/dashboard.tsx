import { createFileRoute } from '@tanstack/react-router';
import { lazy, Suspense } from 'react';
import { Loading } from '@/components/loading';

const Dashboard = lazy(() => import('@/pages/dashboard').then(m => ({ default: m.Dashboard })));

export const Route = createFileRoute('/dashboard')({
  component: () => (
    <Suspense fallback={<Loading />}>
      <Dashboard />
    </Suspense>
  ),
});
