import {
  LayoutDashboard,
  Layout,
  Palette,
  Users,
  Award,
  FileCheck2,
  Mail,
  ShieldCheck,
  CreditCard,
  LogOut,
  Webhook
} from 'lucide-react';
import { Organisation, AuthUser, NavTab } from '../../types';
import { IcertixLogo } from '../common/IcertixLogo';

interface SidebarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  currentOrg: Organisation;
  credentialCount: number;
  candidateCount: number;
  templateCount?: number;
  currentUser?: AuthUser | null;
  onOpenLogin?: () => void;
  onLogout?: () => void;
  onCloseMobileMenu?: () => void;
  onOpenWebhooks?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  currentOrg,
  credentialCount,
  candidateCount,
  templateCount,
  currentUser,
  onOpenLogin,
  onLogout,
  onCloseMobileMenu,
  onOpenWebhooks
}) => {
  const navItems: Array<{
    id: NavTab;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    description: string;
  }> = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      description: 'Analytics, KPIs & recent activity'
    },
    {
      id: 'templates',
      label: 'My Templates',
      icon: Layout,
      description: 'Saved designs, variables & candidate stats'
    },
    {
      id: 'designer',
      label: 'Certificate Designer',
      icon: Palette,
      description: 'Visual template builder & fields'
    },
    {
      id: 'candidates',
      label: 'Candidates & Import',
      icon: Users,
      description: 'Directory & Bulk CSV upload'
    },
    {
      id: 'generation',
      label: 'Issue & Generate',
      icon: Award,
      description: 'Batch PDF & cryptographic signing'
    },
    {
      id: 'registry',
      label: 'Credentials Registry',
      icon: FileCheck2,
      description: 'All issued certificates & lifecycle'
    },
    {
      id: 'emails',
      label: 'Email Delivery Logs',
      icon: Mail,
      description: 'Amazon SES queue & status'
    },
    {
      id: 'audit',
      label: 'Audit Trail',
      icon: ShieldCheck,
      description: 'Immutable system event records'
    },
    {
      id: 'subscription',
      label: 'Plan & Billing',
      icon: CreditCard,
      description: 'Quota limits & feature tiers'
    }
  ];

  return (
    <aside className="w-64 bg-gradient-to-b from-[#071328] via-[#0a1f44] to-[#050e20] text-white h-full flex flex-col justify-between border-r border-[#0e2a5c] select-none shadow-xl">
      <div>
        {/* Organisation Overview (No Duplicate Logo) */}
        <div className="p-4 border-b border-[#0e2a5c] bg-[#0a1f44]/80 backdrop-blur-xs relative">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <div 
                className="w-8 h-8 text-white font-bold flex items-center justify-center text-xs font-sora rounded-xl shadow-md shrink-0 border border-white/10"
                style={{ backgroundColor: currentOrg.badgeColor || '#123a7a' }}
              >
                {currentOrg.logo || currentOrg.code?.slice(0, 4) || currentOrg.name?.replace(/[^a-zA-Z0-9]/g, '').slice(0, 2).toUpperCase() || 'OG'}
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="text-xs font-bold font-sora text-white truncate leading-tight">
                  {currentOrg.name}
                </h2>
                <span className="text-[10px] text-[#2ea6ff] font-mono block truncate">
                  {currentOrg.code} • {currentOrg.plan}
                </span>
              </div>
            </div>

            {onCloseMobileMenu && (
              <button
                onClick={onCloseMobileMenu}
                className="md:hidden p-1 text-slate-400 hover:text-white bg-[#071328] rounded-lg border border-slate-700"
                aria-label="Close navigation menu"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="p-3 space-y-1.5">
          <div className="px-3 py-1 text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
            Navigation Menu
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`w-full text-left px-3.5 py-2.5 rounded-xl flex items-center justify-between transition-all duration-200 ${
                  isActive
                    ? 'btn-primary-gradient shadow-md'
                    : 'text-slate-200 hover:bg-white/10 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#051427]' : 'text-[#2ea6ff]'}`} />
                  <span className={`text-xs truncate ${isActive ? 'font-bold text-[#051427]' : 'font-medium'}`}>
                    {item.label}
                  </span>
                </div>
              </button>
            );
          })}
        </nav>

        {/* Institutional Webhooks / LMS Integration Trigger */}
        {onOpenWebhooks && (
          <div className="px-3 pt-3 border-t border-[#0e2a5c]/60">
            <button
              onClick={onOpenWebhooks}
              className="w-full px-3 py-2 bg-[#0e2a5c]/60 hover:bg-[#0e2a5c] text-sky-300 hover:text-white rounded-xl text-xs font-semibold flex items-center justify-between transition-all border border-sky-800/40 cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Webhook className="w-3.5 h-3.5 text-sky-400" />
                <span>Webhooks & LMS Sync</span>
              </div>
              <span className="text-[9px] font-mono px-1.5 py-0.5 bg-sky-950 text-sky-300 rounded font-bold">HMAC</span>
            </button>
          </div>
        )}
      </div>

      {/* Footer System Info & User Switcher */}
      <div className="border-t border-[#0e2a5c] bg-[#071328]/95">
        {/* User Quick Info */}
        <div className="p-3 border-b border-[#0e2a5c] flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 btn-primary-gradient flex items-center justify-center text-[10px] font-bold shrink-0 font-sora rounded-full shadow-xs">
              {currentUser?.name ? currentUser.name.slice(0, 2).toUpperCase() : 'JW'}
            </div>
            <div className="min-w-0">
              <div className="text-xs font-bold text-white truncate leading-tight">
                {currentUser?.name || 'Dr. Jennifer Widom'}
              </div>
              <div className="text-[10px] text-[#2ea6ff] truncate font-mono">
                {currentUser?.role === 'ORG_ADMIN' ? 'Authority Officer' : 'Active Account'}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {onLogout && (
              <button
                onClick={onLogout}
                className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        <div className="p-3 text-[10px] text-slate-400 space-y-1 font-mono">
          <div className="flex items-center justify-between">
            <span>Cryptographic Engine:</span>
            <span className="text-[#7bd94f] font-bold">SHA-256 Anchored</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Verification Status:</span>
            <span className="text-[#2ea6ff]">Global Verifiable</span>
          </div>
        </div>
      </div>
    </aside>
  );
};
