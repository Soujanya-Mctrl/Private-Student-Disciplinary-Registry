import { useNavigate } from '@tanstack/react-router';
import { Users, ShieldAlert, UserPlus, ClipboardList, Shield, ArrowRight, Lock, Globe } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useContractSubscription } from '@/modules/midnight/disciplinary-sdk/hooks/use-contract-subscription';
import { useDemoMode } from '@/contexts/demo-mode';
import { motion } from 'framer-motion';

// Animation variants
const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] },
  }),
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: (i: number) => ({
    opacity: 1, scale: 1,
    transition: { delay: i * 0.08, duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] },
  }),
};

export function Dashboard() {
  const navigate = useNavigate();
  const { derivedState } = useContractSubscription();
  const { isDemoMode } = useDemoMode();

  const stats = [
    {
      title: 'Total Students',
      value: isDemoMode 
        ? '15' 
        : (derivedState?.totalStudents || 0n).toString(),
      description: isDemoMode ? 'Mock registered students' : 'Registered on-chain',
      icon: <Users className="h-5 w-5" />,
      color: 'var(--primary)',
      tint: 'var(--privacy-tint)',
    },
    {
      title: 'System Health',
      value: 'Online',
      description: 'Zero-knowledge node active',
      icon: <ShieldAlert className="h-5 w-5" />,
      color: 'var(--success)',
      tint: 'var(--success-tint)',
    },
    {
      title: 'ZK Verified',
      value: isDemoMode ? '124' : '0',
      description: 'Proof-verified queries',
      icon: <Shield className="h-5 w-5" />,
      color: 'var(--zk-accent)',
      tint: 'var(--zk-accent-tint)',
    },
  ];

  const quickActions = [
    {
      title: 'Register Student',
      description: 'Add a new student to the private registry with on-chain commitment',
      icon: <UserPlus className="h-6 w-6" />,
      path: '/registration',
      actionLabel: 'Register',
      color: 'var(--primary)',
      tint: 'var(--privacy-tint)',
    },
    {
      title: 'Manage Records',
      description: 'Add or view privacy-preserving disciplinary records',
      icon: <ClipboardList className="h-6 w-6" />,
      path: '/records',
      actionLabel: 'Manage',
      color: 'var(--zk-accent)',
      tint: 'var(--zk-accent-tint)',
    },
  ];

  return (
    <div className="flex-1 p-8 pt-6 space-y-8">
      {/* ──── Hero Header ──── */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="relative overflow-hidden rounded-2xl p-8"
        style={{
          background: 'linear-gradient(135deg, var(--primary), color-mix(in srgb, var(--primary) 60%, var(--zk-accent)))',
        }}
      >
        {/* Grid overlay */}
        <div className="absolute inset-0 opacity-[0.06]" style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.3) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }} />
        {/* Radial glow */}
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 0.2, scale: 1 }}
          transition={{ duration: 1.2, delay: 0.3 }}
          className="absolute top-0 right-0 w-64 h-64"
          style={{ background: 'radial-gradient(circle, var(--zk-accent), transparent 70%)' }}
        />

        <div className="relative z-10">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium mb-4"
            style={{
              background: 'rgba(255,255,255,0.15)',
              color: 'rgba(255,255,255,0.9)',
              backdropFilter: 'blur(4px)',
            }}
          >
            <Shield className="h-3 w-3" />
            Private Student Disciplinary Registry · Midnight Network
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-3xl md:text-4xl font-bold text-white mb-2"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Privacy-First{' '}
            <em className="not-italic" style={{
              background: 'linear-gradient(90deg, #fff, rgba(255,255,255,0.7))',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>
              Student Records
            </em>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="text-white/70 text-sm max-w-lg mb-5"
          >
            Manage disciplinary records with zero-knowledge selective disclosure.
            Student data never leaves your device — only cryptographic proofs go on-chain.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.6 }}
            className="flex flex-wrap gap-2"
          >
            {['ZK Proofs', 'Selective Disclosure', 'On-Chain Commitments'].map((tag) => (
              <span key={tag} className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-medium" style={{
                background: 'rgba(255,255,255,0.12)',
                color: 'rgba(255,255,255,0.85)',
                border: '1px solid rgba(255,255,255,0.15)',
              }}>
                {tag}
              </span>
            ))}
          </motion.div>
        </div>
      </motion.div>

      {/* ──── Stats ──── */}
      <div className="grid gap-4 md:grid-cols-3">
        {stats.map((stat, index) => (
          <motion.div
            key={index}
            custom={index}
            variants={scaleIn}
            initial="hidden"
            animate="visible"
          >
            <Card className="relative overflow-hidden h-full">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium" style={{ fontFamily: 'var(--font-body)' }}>
                  {stat.title}
                </CardTitle>
                <div className="flex h-8 w-8 items-center justify-center rounded-lg" style={{ background: stat.tint, color: stat.color }}>
                  {stat.icon}
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold" style={{ fontFamily: 'var(--font-display)', color: stat.color }}>
                  {stat.value}
                </div>
                <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* ──── Quick Actions + Privacy Info ──── */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Quick Actions */}
        <motion.div
          custom={0}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
        >
          <Card className="h-full">
            <CardHeader>
              <CardTitle style={{ fontFamily: 'var(--font-display)' }}>Quick Actions</CardTitle>
              <CardDescription>Common registry operations</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {quickActions.map((action, index) => (
                <motion.div
                  key={index}
                  whileHover={{ scale: 1.01, y: -2 }}
                  whileTap={{ scale: 0.99 }}
                  className="flex items-center gap-4 rounded-xl border p-4 cursor-pointer transition-shadow hover:shadow-sm"
                  style={{ borderColor: 'var(--border)' }}
                  onClick={() => navigate({ to: action.path })}
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl flex-shrink-0" style={{ background: action.tint, color: action.color }}>
                    {action.icon}
                  </div>
                  <div className="flex-1 min-w-0 space-y-0.5">
                    <p className="text-sm font-semibold">{action.title}</p>
                    <p className="text-xs text-muted-foreground">{action.description}</p>
                  </div>
                  <Button variant="ghost" size="sm" className="flex-shrink-0 gap-1">
                    {action.actionLabel}
                    <ArrowRight className="h-3 w-3" />
                  </Button>
                </motion.div>
              ))}
            </CardContent>
          </Card>
        </motion.div>

        {/* Privacy Architecture card */}
        <motion.div
          custom={1}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
        >
          <Card className="overflow-hidden h-full">
            <CardHeader>
              <CardTitle style={{ fontFamily: 'var(--font-display)' }}>Privacy Architecture</CardTitle>
              <CardDescription>How your data is protected</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                {[
                  {
                    icon: <Lock className="h-4 w-4" />,
                    title: 'Stays on your device',
                    items: ['Student names', 'Incident descriptions', 'Personal details'],
                    color: 'var(--primary)',
                    tint: 'var(--privacy-tint)',
                  },
                  {
                    icon: <Globe className="h-4 w-4" />,
                    title: 'Goes on-chain',
                    items: ['Commitment hashes', 'Incident counters', 'ZK proofs'],
                    color: 'var(--zk-accent)',
                    tint: 'var(--zk-accent-tint)',
                  },
                ].map((section, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + i * 0.15, duration: 0.4 }}
                    className="rounded-lg p-3"
                    style={{ background: section.tint, border: `1px solid color-mix(in srgb, ${section.color} 20%, transparent)` }}
                  >
                    <div className="flex items-center gap-2 mb-2 text-sm font-medium" style={{ color: section.color }}>
                      {section.icon}
                      {section.title}
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {section.items.map((item, j) => (
                        <span key={j} className="text-[11px] px-2 py-0.5 rounded-full" style={{
                          background: 'var(--card)',
                          color: 'var(--muted-foreground)',
                          border: '1px solid var(--border)',
                        }}>
                          {item}
                        </span>
                      ))}
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
