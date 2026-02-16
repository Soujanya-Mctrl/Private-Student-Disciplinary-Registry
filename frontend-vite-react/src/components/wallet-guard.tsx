import { Shield, Wallet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useWallet } from '@/modules/midnight/wallet-widget/hooks/useWallet';
import { useDemoMode } from '@/contexts/demo-mode';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

interface WalletGuardProps {
  children: React.ReactNode;
}

export function WalletGuard({ children }: WalletGuardProps) {
  const { connectedAPI, setOpen } = useWallet();
  const { isDemoMode, setIsDemoMode } = useDemoMode();

  // If we have a connectedAPI or are in demo mode, the wallet is connected/bypassed
  if (connectedAPI || isDemoMode) {
    return <>{children}</>;
  }

  return (
    <div className="flex-1 flex items-center justify-center p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="max-w-md mx-auto text-center" style={{ background: 'var(--privacy-tint)', borderColor: 'var(--privacy-border)' }}>
          <CardContent className="pt-8 pb-8 space-y-6">
            <div className="flex justify-center">
              <div
                className="flex h-16 w-16 items-center justify-center rounded-2xl"
                style={{ background: 'var(--zk-accent-tint)' }}
              >
                <Shield className="h-8 w-8" style={{ color: 'var(--zk-accent)' }} />
              </div>
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-bold" style={{ fontFamily: 'var(--font-display)' }}>
                Wallet Required
              </h2>
              <p className="text-sm text-muted-foreground">
                Connect your Midnight Lace wallet to access this page.
                Your identity stays private through zero-knowledge proofs.
              </p>
            </div>
            <Button
              className="w-full gap-2 btn-zk"
              onClick={() => setOpen(true)}
            >
              <Wallet className="h-4 w-4" />
              Connect Wallet
            </Button>
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">Or</span>
              </div>
            </div>
            <Button
              variant="outline"
              className="w-full border-dashed"
              onClick={() => {
                setIsDemoMode(true);
                toast.info("Demo Mode activated — showing mock data.");
              }}
            >
              Enter Demo Mode (View Mock Data)
            </Button>
            <p className="text-xs text-muted-foreground">
              Don't have the Lace wallet?{' '}
              <a
                href="https://midnight.network"
                target="_blank"
                rel="noopener noreferrer"
                className="underline"
                style={{ color: 'var(--primary)' }}
              >
                Get it here
              </a>
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
