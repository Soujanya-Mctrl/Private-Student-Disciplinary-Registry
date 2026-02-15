import { useState, useEffect, useCallback } from 'react';
import { Shield, Cpu, Lock, Send, CheckCircle2, Loader2, X } from 'lucide-react';
import { Button } from './button';

interface ZkProofStep {
  label: string;
  description: string;
  icon: React.ReactNode;
}

interface ZkProofModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete?: () => void;
  contractName?: string;
  blockchainName?: string;
  steps?: ZkProofStep[];
}

const defaultSteps: ZkProofStep[] = [
  {
    label: 'Loading private state from local store',
    description: 'Reading encrypted data from your device',
    icon: <Lock className="h-5 w-5" />,
  },
  {
    label: 'Executing disciplinary circuit locally',
    description: 'Running the Compact circuit on your machine',
    icon: <Cpu className="h-5 w-5" />,
  },
  {
    label: 'Generating zk-SNARK proof',
    description: 'Creating a cryptographic proof of computation',
    icon: <Shield className="h-5 w-5" />,
  },
  {
    label: 'Submitting proof to Midnight Network',
    description: 'Broadcasting the proof (never your data)',
    icon: <Send className="h-5 w-5" />,
  },
];

type StepStatus = 'pending' | 'active' | 'done';

export function ZkProofModal({
  isOpen,
  onClose,
  onComplete,
  steps = defaultSteps,
}: ZkProofModalProps) {
  const [currentStep, setCurrentStep] = useState(-1);
  const [stepStatuses, setStepStatuses] = useState<StepStatus[]>(
    steps.map(() => 'pending')
  );

  const simulateProgress = useCallback(() => {
    let step = 0;
    const interval = setInterval(() => {
      if (step >= steps.length) {
        clearInterval(interval);
        onComplete?.();
        return;
      }

      setCurrentStep(step);
      setStepStatuses((prev) => {
        const next = [...prev];
        if (step > 0) next[step - 1] = 'done';
        next[step] = 'active';
        return next;
      });

      step++;
    }, 1800);

    return () => clearInterval(interval);
  }, [steps.length, onComplete]);

  useEffect(() => {
    if (isOpen) {
      setCurrentStep(-1);
      setStepStatuses(steps.map(() => 'pending'));
      const timeout = setTimeout(() => {
        simulateProgress();
      }, 400);
      return () => clearTimeout(timeout);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const progress = Math.max(0, ((currentStep + 1) / steps.length) * 100);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div
        className="relative w-full max-w-lg mx-4 rounded-xl border bg-card text-card-foreground shadow-lg"
        style={{ boxShadow: '0 8px 40px rgba(0,0,0,0.08)' }}
        role="dialog"
        aria-modal="true"
        aria-label="ZK Proof Generation"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 pb-2">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--zk-accent-tint)]">
              <Shield className="h-5 w-5" style={{ color: 'var(--zk-accent)' }} />
            </div>
            <div>
              <h3 className="font-semibold text-lg" style={{ fontFamily: 'var(--font-display)' }}>
                Generating Zero-Knowledge Proof
              </h3>
              <p className="text-sm text-muted-foreground">
                Your actual records never leave your device
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-md p-1 hover:bg-muted transition-colors"
            aria-label="Close modal"
          >
            <X className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>

        {/* Progress bar */}
        <div className="px-6 py-3">
          <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700 ease-out"
              style={{
                width: `${progress}%`,
                background: `linear-gradient(90deg, var(--primary), var(--zk-accent))`,
              }}
            />
          </div>
        </div>

        {/* Steps */}
        <div className="px-6 pb-2 space-y-1">
          {steps.map((step, i) => {
            const status = stepStatuses[i];
            return (
              <div
                key={i}
                className={`flex items-center gap-3 rounded-lg px-3 py-3 transition-colors ${
                  status === 'active' ? 'bg-[var(--zk-accent-tint)]' : ''
                }`}
              >
                {/* Status icon */}
                <div className="flex-shrink-0">
                  {status === 'done' ? (
                    <CheckCircle2 className="h-5 w-5 zk-step-done" style={{ color: 'var(--success)' }} />
                  ) : status === 'active' ? (
                    <Loader2 className="h-5 w-5 animate-spin" style={{ color: 'var(--zk-accent)' }} />
                  ) : (
                    <div className="h-5 w-5 rounded-full border-2 border-muted" />
                  )}
                </div>

                {/* Step icon */}
                <div
                  className={`flex-shrink-0 ${
                    status === 'done'
                      ? 'text-[var(--success)]'
                      : status === 'active'
                        ? 'text-[var(--zk-accent)]'
                        : 'text-muted-foreground'
                  }`}
                >
                  {step.icon}
                </div>

                {/* Label */}
                <div className="flex-1 min-w-0">
                  <p
                    className={`text-sm font-medium ${
                      status === 'pending' ? 'text-muted-foreground' : 'text-foreground'
                    }`}
                  >
                    {step.label}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">{step.description}</p>
                </div>

                {/* Done checkmark text */}
                {status === 'done' && (
                  <span className="text-xs font-medium" style={{ color: 'var(--success)' }}>
                    ✓ done
                  </span>
                )}
                {status === 'active' && (
                  <span className="text-xs font-medium" style={{ color: 'var(--zk-accent)' }}>
                    ⚙ processing
                  </span>
                )}
                {status === 'pending' && (
                  <span className="text-xs text-muted-foreground">○ pending</span>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-6 pt-3 border-t flex items-center justify-between">
          <p className="text-xs text-muted-foreground flex items-center gap-1.5">
            <Lock className="h-3 w-3" />
            Your data is processed locally and never transmitted
          </p>
          <Button variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}
