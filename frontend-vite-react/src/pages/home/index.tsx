import { useNavigate } from '@tanstack/react-router';
import { Shield, ArrowRight } from 'lucide-react';
import { ModeToggle } from '@/components/mode-toggle';
import { motion } from 'framer-motion';

export function Home() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center p-8" style={{ background: 'var(--background)' }}>
      <div className="max-w-lg w-full text-center space-y-8">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="flex justify-center"
        >
          <div className="flex items-center justify-center h-16 w-16 rounded-2xl" style={{ background: 'var(--primary)' }}>
            <Shield className="h-8 w-8 text-white" />
          </div>
        </motion.div>

        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="space-y-2"
        >
          <h1 className="text-3xl font-bold" style={{ fontFamily: 'var(--font-display)' }}>
            Private Student{' '}
            <span style={{ color: 'var(--primary)' }}>Disciplinary Registry</span>
          </h1>
          <p className="text-muted-foreground">
            Privacy-preserving student records on the Midnight Network
          </p>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="btn-zk inline-flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-semibold"
            onClick={() => navigate({ to: '/dashboard' })}
          >
            Enter Dashboard
            <ArrowRight className="h-4 w-4" />
          </motion.button>
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="pt-8 flex items-center justify-center gap-4"
        >
          <span className="text-xs text-muted-foreground">Powered by Midnight Network</span>
          <ModeToggle />
        </motion.div>
      </div>
    </div>
  );
}
