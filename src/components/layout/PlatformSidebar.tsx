import React from 'react';
import {
  LayoutDashboard,
  Building2,
  Users,
  ShieldCheck,
  FileCheck2,
  Mail,
  CreditCard,
  BarChart3,
  Settings,
  LogOut,
  Sparkles,
  Globe
} from 'lucide-react';
import { AuthUser, PlatformNavTab } from '../../types';
import { IcertixLogo } from '../common/IcertixLogo';

interface PlatformSidebarProps {
  currentTab: PlatformNavTab;
  onSelectTab: (tab: PlatformNavTab) => void;
  currentUser?: AuthUser | null;
  onLogout?: () => void;
  onCloseMobileMenu?: () => void;
}

const PLATFORM_NAV_ITEMS: Array<{
  id: PlatformNavTab;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  superAdminOnly?: boolean;
}> = [
  {
    id: 'platform-dashboard',
    label: 'Platform Dashboard',
    icon: LayoutDashboard,
    description: 'Global KPIs & system health'
  },
  {
    id: 'platform-orgs',
    label: 'Organisations',
    icon: Building2,
    description: 'Manage all tenant organisations'
  },
  {
    id: 'platform-users',
    label: 'Platform Users',
    icon: Users,
    description: 'Super & platform administrators'
  },
  {
    id: 'platform-credentials',
    label: 'All Credentials',
    icon: FileCheck2,
    description: 'Platform-wide credential registry'
  },
  {
    id: 'platform-audit',
    label: 'Audit Logs',
    icon: ShieldCheck,
    description: 'Immutable platform audit trail'
  },
  {
    id: 'platform-emails',
    label: 'Email Activity',
    icon: Mail,
    description: 'Platform-wide email delivery'
  },
  {
    id: 'platform-analytics',
    label: 'Analytics',
    icon: BarChart3,
    description: 'Platform growth & usage metrics'
  },
  {
    id: 'platform-subscriptions',
    label: 'Subscriptions',
    icon: CreditCard,
    description: 'Plans, billing & quota management',
    superAdminOnly: true
  },
  {
    id: 'platform-settings',
    label: 'System Settings',
    icon: Settings,
    description: 'Platform configuration',
    superAdminOnly: true
  }
];

export const PlatformSidebar: React.FC<PlatformSidebarProps> = ({
  currentTab,
  onSelectTab,
  currentUser,
  onLogout,
  onCloseMobileMenu
}) => {
  const isSuperAdmin = currentUser?.role === 'SUPER_ADMIN';

  const visibleItems = PLATFORM_NAV_ITEMS.filter(item =>
    !item.superAdminOnly || isSuperAdmin
  );

  return (
    <aside className="w-64 bg-[#071328] text-white h-full flex flex-col justify-between border-r border-[#0e2a5c] select-none shadow-xl">
      <div>
        {/* Role Badge & Mobile Close Button */}
        <div className="p-4 border-b border-[#0e2a5c] bg-[#0a1f44]/80 flex items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl btn-primary-gradient flex items-center justify-center shrink-0 shadow-md text-white font-bold">
              <Globe className="w-4 h-4 text-[#051427]" />
            </div>
            <div>
              <div className="text-xs font-bold text-white font-sora leading-tight">
                Platform Governance
              </div>
              <div className="text-[10px] font-mono mt-0.5 font-bold uppercase tracking-wider text-[#2ea6ff]">
                SUPER_ADMIN
              </div>
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

        {/* Navigation */}
        <nav className="p-3 space-y-1">
          <div className="px-3 py-1.5 text-[10px] font-mono font-bold uppercase tracking-widest text-slate-400">
            Platform Controls
          </div>
          {visibleItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                id={`platform-nav-${item.id}`}
                onClick={() => onSelectTab(item.id)}
                className={`w-full text-left px-3.5 py-2.5 flex items-center gap-3 transition-all duration-200 rounded-xl cursor-pointer ${
                  isActive
                    ? 'btn-primary-gradient shadow-md font-bold text-[#051427]'
                    : 'text-slate-300 hover:bg-white/10 hover:text-white'
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#051427]' : 'text-[#2ea6ff]'}`} />
                <div className="min-w-0 flex-1">
                  <div className="text-xs leading-none truncate">{item.label}</div>
                </div>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer */}
      <div className="border-t border-[#0e2a5c] bg-[#050e20]">
        <div className="p-3.5 border-b border-[#0e2a5c] flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 btn-primary-gradient text-[#051427] font-bold flex items-center justify-center text-[10px] shrink-0 font-sora rounded-full shadow-xs">
              {currentUser?.name ? currentUser.name.slice(0, 2).toUpperCase() : 'SA'}
            </div>
            <div className="min-w-0">
              <div className="text-xs font-bold text-white truncate leading-tight">
                {currentUser?.name || 'System Administrator'}
              </div>
              <div className="text-[10px] text-[#2ea6ff] truncate font-mono">
                {currentUser?.email || 'superadmin@icertix.demo'}
              </div>
            </div>
          </div>
          {onLogout && (
            <button
              onClick={onLogout}
              className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-white/10 transition-colors rounded-lg cursor-pointer"
              title="Lock Session / Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="p-3.5 text-[10px] text-slate-400 space-y-1 font-mono">
          <div className="flex items-center justify-between">
            <span>Scope:</span>
            <span className="text-[#2ea6ff] font-bold">PLATFORM-WIDE</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Engine:</span>
            <span className="text-[#7bd94f] font-bold">v3.0.0 ACTIVE</span>
          </div>
        </div>
      </div>
    </aside>
  );
};
