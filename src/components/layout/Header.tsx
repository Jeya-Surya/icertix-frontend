import React, { useState } from 'react';
import { 
  Building2, 
  Search, 
  ChevronDown, 
  Award,
  ShieldCheck, 
  CheckCircle2, 
  LogIn, 
  LogOut, 
  KeyRound, 
  Shield, 
  Sparkles 
} from 'lucide-react';
import { Organisation, UserPortal, AuthUser } from '../../types';
import { IcertixLogo } from '../common/IcertixLogo';

interface HeaderProps {
  currentPortal: UserPortal;
  onChangePortal: (portal: UserPortal) => void;
  organisations: Organisation[];
  currentOrg: Organisation;
  onChangeOrg: (org: Organisation) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onQuickIssue: () => void;
  onQuickVerify: () => void;
  mobileMenuOpen: boolean;
  onToggleMobileMenu: () => void;
  currentUser: AuthUser | null;
  onOpenLogin: () => void;
  onLogout: () => void;
  apiHealth?: { connected: boolean; version?: string; latencyMs?: number };
}

export const Header: React.FC<HeaderProps> = ({
  currentPortal,
  onChangePortal,
  organisations,
  currentOrg,
  onChangeOrg,
  searchQuery,
  onSearchChange,
  onQuickIssue,
  onQuickVerify,
  mobileMenuOpen,
  onToggleMobileMenu,
  currentUser,
  onOpenLogin,
  onLogout,
  apiHealth
}) => {
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-[#071328] text-white border-b border-[#0e2a5c] shadow-md backdrop-blur-md select-none">
      <div className="px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3 sm:gap-4">
        {/* Left: Mobile Hamburger + Single iCertiX Logo + Live Engine Status */}
        <div className="flex items-center gap-3 sm:gap-4 min-w-0">
          {/* Mobile Menu Hamburger */}
          {(currentPortal === 'org' || currentPortal === 'platform-admin') && (
            <button
              onClick={onToggleMobileMenu}
              className="md:hidden p-2 text-slate-300 hover:text-white hover:bg-white/10 rounded-xl border border-slate-700/80 shrink-0 cursor-pointer"
              aria-label="Toggle Navigation Menu"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          )}

          {/* Primary iCertiX Brand Logo */}
          <div className="shrink-0 flex items-center">
            <IcertixLogo variant="light" size="sm" showSubtitle={false} />
          </div>

          {/* Platform Tagline */}
          <span className="text-[11px] text-slate-300 font-jakarta hidden xl:inline border-l border-slate-700/80 pl-3.5">
            Blockchain-Anchored Digital Credential & Verification Platform
          </span>

          {/* Backend API Connection Status Pill */}
          {apiHealth && (
            <div 
              className={`hidden lg:flex items-center gap-1.5 px-2.5 py-0.5 text-[10px] font-mono font-bold tracking-tight rounded-full border ${
                apiHealth.connected 
                  ? 'bg-emerald-950/80 text-emerald-300 border-emerald-700/60' 
                  : 'bg-amber-950/80 text-amber-300 border-amber-700/60'
              }`}
              title={apiHealth.connected ? `Backend Express active (${apiHealth.latencyMs || 56}ms)` : 'Running in offline mode'}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${apiHealth.connected ? 'bg-[#7bd94f] animate-pulse' : 'bg-amber-400'}`} />
              <span>{apiHealth.connected ? `Live Engine (${apiHealth.latencyMs || 56}ms)` : 'API Offline'}</span>
            </div>
          )}
        </div>

        {/* Center: Portal Title (Candidate & Login only) */}

        {currentPortal === 'login' && (
          <div className="flex items-center min-w-0">
            <span className="text-sm sm:text-base font-bold font-sora text-white">
              Access Gateway
            </span>
          </div>
        )}

        {/* Right: Actions (Public Verifier & User Profile) */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Public Verifier Action Button with Gradient */}
          <button
            onClick={() => onChangePortal('verify')}
            className="btn-primary-gradient px-4 py-1.5 text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all rounded-full cursor-pointer text-[#051427]"
            title="Public Cryptographic Certificate Verifier"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-[#051427]" />
            <span className="hidden sm:inline">Public Verifier</span>
            <span className="sm:hidden">Verify</span>
          </button>

          {/* User Session State / Profile Menu */}
          {currentUser ? (
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(prev => !prev)}
                className="flex items-center gap-2 px-2.5 sm:px-3 py-1.5 bg-white/10 hover:bg-white/15 border border-white/15 hover:border-[#2ea6ff]/40 rounded-full transition-all cursor-pointer"
                title="User profile & authentication menu"
              >
                <div className="w-6 h-6 bg-[#2ea6ff] text-[#051427] flex items-center justify-center text-[9px] font-bold font-sora rounded-full shrink-0">
                  {currentUser.role === 'ORG_ADMIN' && currentOrg?.logo
                    ? currentOrg.logo.slice(0, 4)
                    : currentUser.role === 'ORG_ADMIN' && currentOrg?.code
                    ? currentOrg.code.slice(0, 4)
                    : currentUser.name
                    ? currentUser.name.slice(0, 2).toUpperCase()
                    : 'US'}
                </div>
                <div className="hidden lg:block text-left">
                  <span className="text-xs font-bold text-white block leading-tight max-w-[120px] truncate">
                    {currentUser.name}
                  </span>
                  <span className="text-[10px] text-slate-300 block leading-tight font-mono">
                    {currentUser.role === 'SUPER_ADMIN' ? 'Super Admin' : currentUser.role === 'ORG_ADMIN' ? 'Organization Admin' : 'Candidate'}
                  </span>
                </div>
                <ChevronDown className="w-3 h-3 text-slate-400 shrink-0" />
              </button>

              {/* User Dropdown Menu with Click-Away Backdrop */}
              {userMenuOpen && (
                <>
                  {/* Backdrop overlay to close dropdown on outside click */}
                  <div 
                    className="fixed inset-0 z-40 cursor-default" 
                    onClick={() => setUserMenuOpen(false)} 
                  />
                  
                  <div 
                    className="absolute right-0 top-full mt-2 w-64 bg-[#071328] border border-[#0e2a5c] shadow-2xl rounded-2xl z-50 p-2 text-xs animate-fadeIn text-white"
                  >
                    <div className="p-3 border-b border-slate-700/60 bg-white/5 rounded-xl mb-1">
                      <div className="font-bold text-white truncate">{currentUser.name}</div>
                      <div className="text-[10px] text-slate-400 truncate">{currentUser.email}</div>
                      <div className="inline-flex items-center gap-1 mt-1.5 px-2 py-0.5 bg-[#0e2a5c] text-[#2ea6ff] font-mono text-[10px] font-bold rounded-full border border-sky-800/50">
                        <Shield className="w-3 h-3" />
                        <span>{currentUser.role}</span>
                      </div>
                    </div>

                    <div className="pt-1">
                      <button
                        onClick={() => {
                          setUserMenuOpen(false);
                          onLogout();
                        }}
                        className="w-full text-left p-2.5 hover:bg-rose-950/80 text-rose-300 font-semibold rounded-xl flex items-center gap-2 transition-colors cursor-pointer"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          ) : (
            <button
              onClick={onOpenLogin}
              className={`px-4 py-1.5 text-xs font-semibold flex items-center gap-1.5 rounded-full transition-colors border shrink-0 cursor-pointer ${
                currentPortal === 'login'
                  ? 'btn-primary-gradient text-[#051427] border-transparent'
                  : 'bg-white/10 hover:bg-white/20 text-white border-white/20'
              }`}
            >
              <LogIn className="w-3.5 h-3.5 text-[#2ea6ff]" />
              <span>Sign In</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
