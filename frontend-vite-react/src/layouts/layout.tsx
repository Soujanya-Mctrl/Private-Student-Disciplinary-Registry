import { Link, useRouterState } from '@tanstack/react-router';
import { ReactNode } from 'react';
import { LayoutDashboard, UserPlus, ClipboardList, Shield, Wallet } from 'lucide-react';
import { ModeToggle } from '@/components/mode-toggle';
import { motion } from 'framer-motion';

interface MainLayoutProps {
  children: ReactNode;
}

const navItems = [
  { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { label: 'Registration', path: '/registration', icon: UserPlus },
  { label: 'Records', path: '/records', icon: ClipboardList },
  { label: 'Wallet', path: '/wallet-ui', icon: Wallet },
];

export const MainLayout = ({ children }: MainLayoutProps) => {
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;

  return (
    <div className="min-h-screen flex bg-background">
      {/* ──── Sidebar ──── */}
      <aside
        className="fixed inset-y-0 left-0 z-40 flex w-[260px] flex-col border-r bg-[var(--sidebar)]"
        style={{ borderColor: 'var(--sidebar-border)' }}
      >
        {/* App branding */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          className="flex items-center gap-3 px-5 py-5 border-b cursor-pointer"
          style={{ borderColor: 'var(--sidebar-border)' }}
        >
          <motion.div
            whileHover={{ rotate: 8 }}
            transition={{ type: 'spring', stiffness: 300, damping: 15 }}
            className="flex items-center justify-center h-9 w-9 rounded-lg"
            style={{ background: 'var(--primary)' }}
          >
            <Shield className="h-5 w-5 text-white" />
          </motion.div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold truncate" style={{ fontFamily: 'var(--font-display)', color: 'var(--sidebar-foreground)' }}>
                SDR
              </span>
              <span className="h-2 w-2 rounded-full brand-pulse" style={{ background: 'var(--primary)' }} />
            </div>
            <p className="text-[11px] truncate" style={{ color: 'var(--muted-foreground)' }}>
              Student Disciplinary Registry
            </p>
          </div>
        </motion.div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          <p className="px-3 mb-2 text-[10px] uppercase tracking-widest font-semibold" style={{ color: 'var(--muted-foreground)' }}>
            Navigation
          </p>
          {navItems.map((item, index) => {
            const isActive = currentPath === item.path || (item.path === '/dashboard' && currentPath === '/');
            const Icon = item.icon;
            return (
              <motion.div
                key={item.path}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05, duration: 0.3 }}
                whileHover={!isActive ? { x: 4, scale: 1.02 } : {}}
                whileTap={{ scale: 0.97 }}
              >
                <Link
                  to={item.path}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
                    isActive
                      ? 'sidebar-link-active'
                      : 'hover:bg-[var(--sidebar-accent)]'
                  }`}
                  style={{
                    color: isActive ? 'var(--sidebar-primary)' : 'var(--sidebar-foreground)',
                  }}
                >
                  <motion.span
                    whileHover={{ rotate: isActive ? 0 : 12 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 15 }}
                    className="flex-shrink-0"
                  >
                    <Icon className="h-4 w-4" />
                  </motion.span>
                  <span>{item.label}</span>
                </Link>
              </motion.div>
            );
          })}

          <div className="!mt-6">
            <p className="px-3 mb-2 text-[10px] uppercase tracking-widest font-semibold" style={{ color: 'var(--muted-foreground)' }}>
              Privacy
            </p>
            <motion.div
              whileHover={{ scale: 1.03, y: -1 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              className="mx-3 rounded-lg p-3 text-xs cursor-default"
              style={{ background: 'var(--privacy-tint)', border: '1px solid var(--privacy-border)' }}
            >
              <div className="flex items-center gap-1.5 mb-1 font-medium" style={{ color: 'var(--primary)' }}>
                <Shield className="h-3 w-3" />
                Zero-Knowledge Enabled
              </div>
              <p style={{ color: 'var(--muted-foreground)' }}>
                All student data is processed locally using ZK proofs.
              </p>
            </motion.div>
          </div>
        </nav>

        {/* Footer */}
        <div className="px-4 py-3 border-t flex items-center justify-between" style={{ borderColor: 'var(--sidebar-border)' }}>
          <span className="text-[11px]" style={{ color: 'var(--muted-foreground)' }}>
            Midnight Network
          </span>
          <ModeToggle />
        </div>
      </aside>

      {/* ──── Main content ──── */}
      <main className="flex-1 ml-[260px]">
        <div className="min-h-screen">
          {children}
        </div>
      </main>
    </div>
  );
};