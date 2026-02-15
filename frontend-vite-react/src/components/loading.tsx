import { Loader2 } from 'lucide-react';

export const Loading = () => {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'var(--background)' }}
    >
      <Loader2
        className="h-8 w-8 animate-spin"
        style={{ color: 'var(--primary)' }}
      />
    </div>
  );
};