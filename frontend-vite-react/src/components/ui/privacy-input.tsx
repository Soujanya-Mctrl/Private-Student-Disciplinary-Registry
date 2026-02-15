import * as React from 'react';
import { Lock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PrivacyInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  privacyHint?: string;
  label?: string;
}

const PrivacyInput = React.forwardRef<HTMLInputElement, PrivacyInputProps>(
  ({ className, privacyHint = 'This field is encrypted locally and never transmitted', label, id, ...props }, ref) => {
    return (
      <div className="space-y-1.5">
        {label && (
          <label
            htmlFor={id}
            className="flex items-center gap-1.5 text-sm font-medium"
          >
            <Lock className="h-3.5 w-3.5" style={{ color: 'var(--primary)' }} />
            {label}
          </label>
        )}
        <input
          id={id}
          className={cn(
            'flex h-10 w-full rounded-md border px-3 py-2 text-sm transition-colors',
            'file:border-0 file:bg-transparent file:text-sm file:font-medium',
            'placeholder:text-muted-foreground',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
            'disabled:cursor-not-allowed disabled:opacity-50',
            'input-private',
            className
          )}
          ref={ref}
          {...props}
        />
        <p className="text-xs text-muted-foreground flex items-center gap-1">
          <span>🔒</span>
          <span className="italic">{privacyHint}</span>
        </p>
      </div>
    );
  }
);
PrivacyInput.displayName = 'PrivacyInput';

export { PrivacyInput };
