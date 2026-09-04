import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Building2,
  Users,
  FileCheck2,
  TrendingUp,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Plus,
  Search,
  Activity,
  Globe,
  Zap,
  Eye,
  Ban,
  PlayCircle,
  ChevronRight,
  ChevronLeft,
  Crown,
  ClipboardList,
  Mail,
  BarChart3,
  Settings,
  Database,
  Server,
  X,
  Save,
  Edit,
  Trash2,
  Key,
  Send,
  Download,
  ExternalLink,
  Sliders,
  Layers,
  Check,
  Copy,
  AlertTriangle,
  Lock,
  Unlock,
  Filter,
  CreditCard
} from 'lucide-react';
import {
  PlatformNavTab,
  AuthUser,
  Organisation,
  AuditLog,
  EmailLog,
  Credential,
  PlatformMetrics,
  PlatformAnalytics,
  SubscriptionPlan,
  PaginatedResponse,
  PlanTier
} from '../../types';
import { api } from '../../services/apiClient';

interface PlatformAdminViewProps {
  currentTab: PlatformNavTab;
  currentUser: AuthUser | null;
  onNavigateTab: (tab: PlatformNavTab) => void;
}

// ============================================================================
// HELPER COMPONENTS & BADGES
// ============================================================================

interface MetricCardProps {
  label: string;
  value: string | number;
  sub?: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  trend?: 'up' | 'down' | 'neutral';
}

const MetricCard: React.FC<MetricCardProps> = ({ label, value, sub, icon: Icon, color, trend }) => (
  <div className="icx-card rounded-3xl p-6 flex flex-col gap-3 shadow-xs bg-white border border-[#e5ebf4] hover:shadow-md transition-shadow">
    <div className="flex items-center justify-between">
      <span className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider">{label}</span>
      <div className={`p-2.5 rounded-2xl ${color}`}>
        <Icon className="w-4 h-4 text-white" />
      </div>
    </div>
    <div>
      <div className="text-3xl font-bold text-[#0c1a30] font-sora leading-none">{value}</div>
      {sub && <div className="text-xs text-[#66748c] mt-1.5 font-mono">{sub}</div>}
    </div>
    {trend && (
      <div className={`text-xs font-mono font-bold flex items-center gap-1 ${
        trend === 'up' ? 'text-emerald-600' : trend === 'down' ? 'text-rose-500' : 'text-slate-400'
      }`}>
        <TrendingUp className={`w-3 h-3 ${trend === 'down' ? 'rotate-180' : ''}`} />
        {trend === 'up' ? 'Healthy' : trend === 'down' ? 'Attention needed' : 'Stable'}
      </div>
    )}
  </div>
);

const StatusBadge: React.FC<{ status?: string }> = ({ status }) => {
  const s = (status || 'ACTIVE').toUpperCase();
  const map: Record<string, string> = {
    ACTIVE: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    SUSPENDED: 'bg-rose-100 text-rose-700 border-rose-200',
    PENDING: 'bg-amber-100 text-amber-700 border-amber-200',
    INACTIVE: 'bg-slate-100 text-slate-600 border-slate-200',
    REVOKED: 'bg-rose-100 text-rose-700 border-rose-200',
    EXPIRED: 'bg-amber-100 text-amber-700 border-amber-200',
    PROCESSING: 'bg-sky-100 text-sky-700 border-sky-200',
    DRAFT: 'bg-slate-100 text-slate-600 border-slate-200'
  };
  return (
    <span className={`text-[10px] font-mono font-bold px-2.5 py-0.5 border rounded-full uppercase ${map[s] || map.ACTIVE}`}>
      {s}
    </span>
  );
};

const Pagination: React.FC<{
  currentPage: number;
  totalPages: number;
  totalItems: number;
  onPageChange: (page: number) => void;
}> = ({ currentPage, totalPages, totalItems, onPageChange }) => {
  if (totalPages <= 1) return null;
  return (
    <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200 bg-slate-50 text-xs font-mono">
      <span className="text-slate-500">
        Page <span className="font-bold text-slate-800">{currentPage}</span> of{' '}
        <span className="font-bold text-slate-800">{totalPages}</span> ({totalItems} records)
      </span>
      <div className="flex items-center gap-1.5">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          className="px-2.5 py-1.5 border border-slate-200 rounded-lg bg-white text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 cursor-pointer"
        >
          <ChevronLeft className="w-3.5 h-3.5" /> Prev
        </button>
        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
          let pageNum = i + 1;
          if (totalPages > 5 && currentPage > 3) {
            pageNum = Math.min(totalPages - 4 + i, currentPage - 2 + i);
          }
          return (
            <button
              key={pageNum}
              onClick={() => onPageChange(pageNum)}
              className={`w-7 h-7 rounded-lg font-bold transition-colors cursor-pointer ${
                currentPage === pageNum ? 'bg-violet-600 text-white' : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
            >
              {pageNum}
            </button>
          );
        })}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className="px-2.5 py-1.5 border border-slate-200 rounded-lg bg-white text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 cursor-pointer"
        >
          Next <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};

// ============================================================================
// 1. PLATFORM DASHBOARD
// ============================================================================

const PlatformDashboard: React.FC<{
  onNavigate: (tab: PlatformNavTab) => void;
  currentUser: AuthUser | null;
}> = ({ onNavigate, currentUser }) => {
  const [metrics, setMetrics] = useState<PlatformMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const m = await api.getPlatformMetrics();
      setMetrics(m);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load metrics');
      setMetrics({
        totalOrganisations: 3,
        activeOrganisations: 3,
        suspendedOrganisations: 0,
        totalUsers: 12,
        totalCredentials: 2392,
        activeCredentials: 2180,
        revokedCredentials: 47,
        verificationSuccessRate: '99.98%',
        systemStatus: 'HEALTHY'
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px] gap-3">
        <RefreshCw className="w-6 h-6 text-violet-500 animate-spin" />
        <span className="text-sm text-slate-500 font-mono">Loading platform metrics…</span>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-violet-500 mb-1 uppercase tracking-wider font-bold">
            <Crown className="w-4 h-4 text-amber-500" />
            Super Admin Console
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#0c1a30] font-sora">
            Platform Overview
          </h1>
          <p className="text-sm text-[#66748c] mt-1">
            Welcome back, <span className="font-semibold text-slate-800">{currentUser?.name}</span>. Platform governance scope: <span className="font-bold text-violet-600">Platform-Wide Root</span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-mono font-bold rounded-full">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            System {metrics?.systemStatus || 'HEALTHY'}
          </span>
          <button
            onClick={load}
            className="flex items-center gap-1.5 text-xs text-slate-600 hover:text-violet-600 bg-white border border-slate-200 hover:border-violet-300 px-3.5 py-2 rounded-xl transition-all shadow-xs cursor-pointer font-bold font-mono"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Refresh
          </button>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 text-amber-700 text-sm bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3">
          <AlertCircle className="w-4 h-4 shrink-0" />
          Backend notice: {error}. Displaying current state.
        </div>
      )}

      {/* KPI Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          label="Total Organisations"
          value={metrics?.totalOrganisations ?? 0}
          sub={`${metrics?.activeOrganisations ?? 0} active · ${metrics?.suspendedOrganisations ?? 0} suspended`}
          icon={Building2}
          color="bg-violet-600"
          trend="up"
        />
        <MetricCard
          label="Platform Users"
          value={metrics?.totalUsers ?? 0}
          sub="Across all roles & orgs"
          icon={Users}
          color="bg-indigo-600"
          trend="up"
        />
        <MetricCard
          label="Credentials Issued"
          value={(metrics?.totalCredentials ?? 0).toLocaleString()}
          sub={`${metrics?.activeCredentials ?? 0} active · ${metrics?.revokedCredentials ?? 0} revoked`}
          icon={FileCheck2}
          color="bg-sky-600"
          trend="up"
        />
        <MetricCard
          label="Verification Rate"
          value={metrics?.verificationSuccessRate ?? '99.98%'}
          sub="Public cryptographic validity"
          icon={ShieldCheck}
          color="bg-emerald-600"
          trend="up"
        />
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-xs font-bold text-slate-500 mb-3 uppercase tracking-wider font-mono">Platform Governance Shortcuts</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: 'Manage Organisations', icon: Building2, tab: 'platform-orgs' as PlatformNavTab, color: 'bg-gradient-to-r from-violet-600 to-indigo-600' },
            { label: 'Platform Users', icon: Users, tab: 'platform-users' as PlatformNavTab, color: 'bg-gradient-to-r from-indigo-600 to-sky-600' },
            { label: 'Live Analytics', icon: BarChart3, tab: 'platform-analytics' as PlatformNavTab, color: 'bg-gradient-to-r from-sky-600 to-cyan-600' },
            { label: 'System Settings', icon: Settings, tab: 'platform-settings' as PlatformNavTab, color: 'bg-gradient-to-r from-slate-700 to-slate-900' },
          ].map(action => {
            const Icon = action.icon;
            return (
              <button
                key={action.tab}
                id={`quick-action-${action.tab}`}
                onClick={() => onNavigate(action.tab)}
                className={`flex items-center gap-2.5 px-4 py-3.5 rounded-2xl text-white text-xs font-bold transition-all ${action.color} shadow-sm hover:shadow-md hover:scale-[1.01] active:scale-[0.99] cursor-pointer`}
              >
                <Icon className="w-4 h-4" />
                {action.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Recent Audit Activity */}
      {metrics?.recentAudits && metrics.recentAudits.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-[#0c1a30] font-sora">Recent Platform Activity</h2>
              <p className="text-xs text-slate-500 font-mono mt-0.5">Live immutable administrative audit stream</p>
            </div>
            <button
              onClick={() => onNavigate('platform-audit')}
              className="text-xs text-violet-600 hover:text-violet-800 font-bold flex items-center gap-1 cursor-pointer font-mono"
            >
              Full Audit Trail <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="divide-y divide-slate-100">
            {metrics.recentAudits.slice(0, 5).map((log, i) => (
              <div key={log.id || i} className="py-3 flex items-start gap-3 hover:bg-slate-50/80 px-2 rounded-xl transition-colors">
                <div className="w-7 h-7 bg-violet-100 rounded-xl flex items-center justify-center shrink-0 mt-0.5">
                  <Activity className="w-3.5 h-3.5 text-violet-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-slate-800">{log.action}</span>
                    <span className="text-[10px] font-mono text-slate-400">· {log.actor}</span>
                  </div>
                  <div className="text-xs text-slate-500 truncate mt-0.5">{log.details}</div>
                </div>
                <div className="text-[11px] text-slate-400 font-mono shrink-0">
                  {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// ============================================================================
// 2. ORGANISATIONS TAB (COMPLETE CRUD + QUOTA MODALS)
// ============================================================================

interface OrgModalProps {
  org?: Organisation | null;
  onClose: () => void;
  onSaved: (org: Organisation) => void;
}

const OrgFormModal: React.FC<OrgModalProps> = ({ org, onClose, onSaved }) => {
  const isEditing = !!org;
  const [name, setName] = useState(org?.name || '');
  const [code, setCode] = useState(org?.code || '');
  const [domain, setDomain] = useState(org?.domain || '');
  const [department, setDepartment] = useState(org?.department || '');
  const [plan, setPlan] = useState<PlanTier>(org?.plan || 'Professional');
  const [quotaTotal, setQuotaTotal] = useState<number>(org?.certificateQuota?.total || 1000);
  const [badgeColor, setBadgeColor] = useState(org?.badgeColor || '#0A2540');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !code || !domain) { setError('Name, Code and Domain are required.'); return; }
    setLoading(true);
    setError('');
    try {
      if (isEditing) {
        const updated = await api.updatePlatformOrganisation(org.id, {
          name,
          code: code.toUpperCase(),
          domain,
          department,
          plan,
          badgeColor,
          certificateQuota: { used: org.certificateQuota?.used || 0, total: Number(quotaTotal) }
        });
        onSaved(updated);
      } else {
        const created = await api.createPlatformOrganisation({
          name,
          code: code.toUpperCase(),
          domain,
          department,
          plan,
          badgeColor,
          certificateQuota: { used: 0, total: Number(quotaTotal) }
        });
        onSaved(created);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to save organisation.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-fadeIn">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg border border-[#e5ebf4] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-violet-100 rounded-xl">
              <Building2 className="w-5 h-5 text-violet-600" />
            </div>
            <div>
              <h3 className="text-base font-bold font-sora text-[#0c1a30]">
                {isEditing ? `Edit Organisation: ${org.name}` : 'Create New Organisation'}
              </h3>
              <p className="text-xs text-slate-500 font-mono mt-0.5">Multi-tenant academic institution configuration</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="flex items-center gap-2 text-rose-600 text-xs bg-rose-50 border border-rose-200 rounded-xl px-3.5 py-2.5">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}

          <div>
            <label className="text-xs font-mono font-bold text-slate-600 mb-1.5 block uppercase tracking-wider">Organization Name *</label>
            <input
              id="org-name-input"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Stanford University or Acme Corporation"
              className="w-full px-3.5 py-2.5 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-mono font-bold text-slate-600 mb-1.5 block uppercase tracking-wider">Organization Code *</label>
              <input
                id="org-code-input"
                value={code}
                onChange={e => setCode(e.target.value.toUpperCase())}
                placeholder="e.g. STANFORD or ACME"
                className="w-full px-3.5 py-2.5 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100 font-mono uppercase"
              />
            </div>
            <div>
              <label className="text-xs font-mono font-bold text-slate-600 mb-1.5 block uppercase tracking-wider">Subscription Tier</label>
              <select
                id="org-plan-select"
                value={plan}
                onChange={e => setPlan(e.target.value as PlanTier)}
                className="w-full px-3.5 py-2.5 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:border-violet-500 font-semibold"
              >
                <option value="Free">Free (100 certs/mo)</option>
                <option value="Professional">Professional (1,000 certs/mo)</option>
                <option value="Enterprise">Enterprise (5,000+ certs/mo)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-mono font-bold text-slate-600 mb-1.5 block uppercase tracking-wider">Domain *</label>
              <input
                id="org-domain-input"
                value={domain}
                onChange={e => setDomain(e.target.value)}
                placeholder="cpd.stanford.edu"
                className="w-full px-3.5 py-2.5 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:border-violet-500 font-mono"
              />
            </div>
            <div>
              <label className="text-xs font-mono font-bold text-slate-600 mb-1.5 block uppercase tracking-wider">Certificate Quota</label>
              <input
                id="org-quota-input"
                type="number"
                value={quotaTotal}
                onChange={e => setQuotaTotal(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:border-violet-500 font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-mono font-bold text-slate-600 mb-1.5 block uppercase tracking-wider">Primary Department</label>
              <input
                id="org-department-input"
                value={department}
                onChange={e => setDepartment(e.target.value)}
                placeholder="Executive Education"
                className="w-full px-3.5 py-2.5 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:border-violet-500"
              />
            </div>
            <div>
              <label className="text-xs font-mono font-bold text-slate-600 mb-1.5 block uppercase tracking-wider">Brand Accent Color</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={badgeColor}
                  onChange={e => setBadgeColor(e.target.value)}
                  className="w-9 h-9 p-0.5 border border-slate-200 rounded-xl cursor-pointer"
                />
                <input
                  value={badgeColor}
                  onChange={e => setBadgeColor(e.target.value)}
                  className="flex-1 px-3 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50 font-mono"
                />
              </div>
            </div>
          </div>

          <div className="flex gap-2.5 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 text-xs font-bold text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              id="org-submit-btn"
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2.5 text-xs font-bold text-white bg-violet-600 hover:bg-violet-700 rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2 shadow-xs cursor-pointer"
            >
              {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : isEditing ? <Save className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
              {isEditing ? 'Save Changes' : 'Create Institution'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

interface QuotaAdjustModalProps {
  org: Organisation;
  onClose: () => void;
  onAdjusted: (org: Organisation) => void;
}

const QuotaAdjustModal: React.FC<QuotaAdjustModalProps> = ({ org, onClose, onAdjusted }) => {
  const [amount, setAmount] = useState<number>(500);
  const [mode, setMode] = useState<'add' | 'set'>('add');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAdjust = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const updated = await api.adjustOrganisationQuota(org.id, amount, mode);
      onAdjusted(updated);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to adjust quota');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-fadeIn">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm border border-[#e5ebf4] p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-500" />
            <h3 className="text-sm font-bold font-sora text-[#0c1a30]">Adjust Quota: {org.name}</h3>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer"><X className="w-4 h-4" /></button>
        </div>

        {error && (
          <div className="text-rose-600 text-xs bg-rose-50 border border-rose-200 rounded-xl p-2.5">{error}</div>
        )}

        <form onSubmit={handleAdjust} className="space-y-4">
          <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-xs font-mono">
            <div className="flex justify-between text-slate-500 mb-1">
              <span>Current Used:</span>
              <span className="font-bold text-slate-800">{org.certificateQuota.used}</span>
            </div>
            <div className="flex justify-between text-slate-500">
              <span>Current Limit:</span>
              <span className="font-bold text-slate-800">{org.certificateQuota.total}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setMode('add')}
              className={`py-2 text-xs font-bold font-mono rounded-xl border transition-all cursor-pointer ${
                mode === 'add' ? 'bg-violet-50 border-violet-300 text-violet-700 ring-2 ring-violet-100' : 'bg-white border-slate-200 text-slate-600'
              }`}
            >
              + Top-Up Credits
            </button>
            <button
              type="button"
              onClick={() => setMode('set')}
              className={`py-2 text-xs font-bold font-mono rounded-xl border transition-all cursor-pointer ${
                mode === 'set' ? 'bg-violet-50 border-violet-300 text-violet-700 ring-2 ring-violet-100' : 'bg-white border-slate-200 text-slate-600'
              }`}
            >
              Set Exact Total
            </button>
          </div>

          <div>
            <label className="text-xs font-mono font-bold text-slate-600 mb-1 block uppercase">
              {mode === 'add' ? 'Credits to Add' : 'New Total Limit'}
            </label>
            <input
              type="number"
              min={1}
              value={amount}
              onChange={e => setAmount(Number(e.target.value))}
              className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl bg-slate-50 focus:bg-white font-mono font-bold"
            />
          </div>

          <div className="flex gap-2 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-2 text-xs font-semibold text-slate-600 border border-slate-200 rounded-xl cursor-pointer">
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2 text-xs font-bold text-white bg-violet-600 hover:bg-violet-700 rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5 cursor-pointer"
            >
              {loading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
              Apply Quota
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const OrganisationsTab: React.FC<{ currentUser: AuthUser | null }> = ({ currentUser }) => {
  const [orgs, setOrgs] = useState<Organisation[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedPlan, setSelectedPlan] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalOrgs, setTotalOrgs] = useState(0);

  const [modalOrg, setModalOrg] = useState<Organisation | null | undefined>(undefined);
  const [quotaModalOrg, setQuotaModalOrg] = useState<Organisation | null>(null);
  const [deleteConfirmOrg, setDeleteConfirmOrg] = useState<Organisation | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [toast, setToast] = useState('');

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3500); };

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.getPlatformOrganisations(page, 20, search || undefined);
      setOrgs(res.items || []);
      setTotalPages(res.totalPages || 1);
      setTotalOrgs(res.total || res.items?.length || 0);
    } catch {
      try {
        const list = await api.getOrganisations();
        setOrgs(list);
        setTotalOrgs(list.length);
      } catch {
        setOrgs([]);
      }
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => { load(); }, [load]);

  const handleActivate = async (id: string) => {
    setActionLoading(id);
    try {
      const updated = await api.activateOrganisation(id);
      setOrgs(prev => prev.map(o => o.id === id ? { ...o, ...updated } : o));
      showToast('Organisation activated successfully.');
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Action failed');
    } finally {
      setActionLoading(null);
    }
  };

  const handleSuspend = async (id: string) => {
    setActionLoading(id);
    try {
      const updated = await api.suspendOrganisation(id, 'Administrative review');
      setOrgs(prev => prev.map(o => o.id === id ? { ...o, ...updated } : o));
      showToast('Organisation suspended.');
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Action failed');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (org: Organisation) => {
    setActionLoading(org.id);
    try {
      await api.deletePlatformOrganisation(org.id);
      setOrgs(prev => prev.filter(o => o.id !== org.id));
      setDeleteConfirmOrg(null);
      showToast(`Organisation "${org.name}" deleted.`);
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Failed to delete organisation');
    } finally {
      setActionLoading(null);
    }
  };

  const filteredOrgs = orgs.filter(o => {
    const matchesPlan = selectedPlan === 'ALL' || o.plan === selectedPlan;
    const matchesStatus = selectedStatus === 'ALL' || (o.status || 'ACTIVE') === selectedStatus;
    return matchesPlan && matchesStatus;
  });

  const isSuperAdmin = currentUser?.role === 'SUPER_ADMIN';

  return (
    <div className="space-y-6 animate-fadeIn">
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 bg-[#0c1a30] text-white px-4 py-2.5 rounded-full shadow-2xl text-xs font-mono font-bold flex items-center gap-2 border border-[#2ea6ff]/40 animate-slideUp">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          {toast}
        </div>
      )}

      {modalOrg !== undefined && (
        <OrgFormModal
          org={modalOrg}
          onClose={() => setModalOrg(undefined)}
          onSaved={(saved) => {
            if (modalOrg) {
              setOrgs(prev => prev.map(o => o.id === saved.id ? saved : o));
              showToast(`Organisation "${saved.name}" updated.`);
            } else {
              setOrgs(prev => [saved, ...prev]);
              showToast(`Organisation "${saved.name}" created successfully.`);
            }
            setModalOrg(undefined);
          }}
        />
      )}

      {quotaModalOrg && (
        <QuotaAdjustModal
          org={quotaModalOrg}
          onClose={() => setQuotaModalOrg(null)}
          onAdjusted={(updated) => {
            setOrgs(prev => prev.map(o => o.id === updated.id ? updated : o));
            setQuotaModalOrg(null);
            showToast(`Quota updated for "${updated.name}".`);
          }}
        />
      )}

      {deleteConfirmOrg && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm border border-rose-200 p-6 space-y-4">
            <div className="w-10 h-10 rounded-2xl bg-rose-100 flex items-center justify-center text-rose-600">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold font-sora text-slate-900">Delete Organisation?</h3>
              <p className="text-xs text-slate-500 mt-1">
                Are you sure you want to permanently delete <strong className="text-slate-800">{deleteConfirmOrg.name}</strong> ({deleteConfirmOrg.code})? This will archive all tenant data.
              </p>
            </div>
            <div className="flex gap-2 pt-2">
              <button onClick={() => setDeleteConfirmOrg(null)} className="flex-1 py-2 text-xs font-semibold text-slate-600 border border-slate-200 rounded-xl cursor-pointer">
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirmOrg)}
                disabled={actionLoading === deleteConfirmOrg.id}
                className="flex-1 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                {actionLoading === deleteConfirmOrg.id ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#0c1a30] font-sora">Tenant Organisations</h1>
          <p className="text-xs text-[#66748c] mt-0.5">Manage, configure, and monitor all institutions on the platform</p>
        </div>
        {isSuperAdmin && (
          <button
            id="create-org-btn"
            onClick={() => setModalOrg(null)}
            className="btn-primary-gradient px-4 py-2.5 text-xs font-bold flex items-center gap-2 shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Add Organisation
          </button>
        )}
      </div>

      {/* Filters Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[240px] max-w-sm">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            id="org-search"
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search by institution name, code, or domain…"
            className="w-full pl-10 pr-4 py-2 text-xs bg-white border border-[#e5ebf4] rounded-xl focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedPlan}
            onChange={e => setSelectedPlan(e.target.value)}
            className="px-3 py-2 text-xs bg-white border border-[#e5ebf4] rounded-xl text-slate-700 font-semibold focus:outline-none focus:border-violet-400"
          >
            <option value="ALL">All Plans</option>
            <option value="Free">Free</option>
            <option value="Professional">Professional</option>
            <option value="Enterprise">Enterprise</option>
          </select>

          <select
            value={selectedStatus}
            onChange={e => setSelectedStatus(e.target.value)}
            className="px-3 py-2 text-xs bg-white border border-[#e5ebf4] rounded-xl text-slate-700 font-semibold focus:outline-none focus:border-violet-400"
          >
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="SUSPENDED">Suspended</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-3xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-500 font-mono font-bold uppercase text-[10px]">
                <th className="text-left px-5 py-3.5">Institution</th>
                <th className="text-left px-4 py-3.5">Code</th>
                <th className="text-left px-4 py-3.5">Plan Tier</th>
                <th className="text-left px-4 py-3.5">Status</th>
                <th className="text-left px-4 py-3.5">Quota Usage</th>
                <th className="text-left px-4 py-3.5">Domain</th>
                <th className="text-right px-5 py-3.5">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-400">
                    <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-violet-500" />
                    Loading organisations…
                  </td>
                </tr>
              ) : filteredOrgs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-400">No organisations match the criteria.</td>
                </tr>
              ) : filteredOrgs.map((org) => {
                const used = org.certificateQuota?.used || 0;
                const total = org.certificateQuota?.total || 1000;
                const pct = Math.min(100, Math.round((used / total) * 100));
                return (
                  <tr key={org.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-8 h-8 text-white font-bold flex items-center justify-center text-xs font-sora shrink-0 rounded-xl shadow-xs"
                          style={{ backgroundColor: org.badgeColor || '#0A2540' }}
                        >
                          {org.logo || org.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-semibold text-slate-900 text-xs">{org.name}</div>
                          <div className="text-[11px] text-slate-400 font-mono">{org.department || 'Academic Division'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="font-mono text-xs font-bold text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded-lg">{org.code}</span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full border uppercase ${
                        org.plan === 'Enterprise' ? 'bg-violet-100 text-violet-700 border-violet-200' :
                        org.plan === 'Professional' ? 'bg-sky-100 text-sky-700 border-sky-200' :
                        'bg-slate-100 text-slate-600 border-slate-200'
                      }`}>
                        {org.plan}
                      </span>
                    </td>
                    <td className="px-4 py-3.5"><StatusBadge status={org.status || 'ACTIVE'} /></td>
                    <td className="px-4 py-3.5 min-w-[130px]">
                      <div className="flex items-center justify-between text-[11px] text-slate-600 font-mono mb-1">
                        <span>{used} / {total}</span>
                        <span className="text-[10px] text-slate-400 font-bold">{pct}%</span>
                      </div>
                      <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${pct > 90 ? 'bg-rose-500' : pct > 70 ? 'bg-amber-500' : 'bg-sky-500'}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="text-xs text-slate-500 font-mono">{org.domain}</span>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setQuotaModalOrg(org)}
                          className="p-1.5 text-slate-500 hover:text-violet-700 hover:bg-violet-50 rounded-lg transition-colors cursor-pointer"
                          title="Adjust Quota"
                        >
                          <Zap className="w-3.5 h-3.5 text-amber-500" />
                        </button>
                        <button
                          onClick={() => setModalOrg(org)}
                          className="p-1.5 text-slate-500 hover:text-violet-700 hover:bg-violet-50 rounded-lg transition-colors cursor-pointer"
                          title="Edit Organisation"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>

                        {(org.status || 'ACTIVE') !== 'ACTIVE' ? (
                          <button
                            onClick={() => handleActivate(org.id)}
                            disabled={actionLoading === org.id}
                            className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                            title="Activate Organisation"
                          >
                            <PlayCircle className="w-3.5 h-3.5" />
                          </button>
                        ) : (
                          <button
                            onClick={() => handleSuspend(org.id)}
                            disabled={actionLoading === org.id}
                            className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                            title="Suspend Organisation"
                          >
                            <Ban className="w-3.5 h-3.5" />
                          </button>
                        )}

                        <button
                          onClick={() => setDeleteConfirmOrg(org)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          title="Delete Organisation"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          totalItems={totalOrgs}
          onPageChange={setPage}
        />
      </div>
    </div>
  );
};

// ============================================================================
// 3. PLATFORM USERS TAB (COMPLETE USER CRUD + ORG SELECTOR)
// ============================================================================

interface UserModalProps {
  user?: AuthUser | null;
  orgs: Organisation[];
  onClose: () => void;
  onSaved: (user: AuthUser) => void;
}

const UserFormModal: React.FC<UserModalProps> = ({ user, orgs, onClose, onSaved }) => {
  const isEditing = !!user;
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [role, setRole] = useState<'SUPER_ADMIN' | 'ORG_ADMIN' | 'CANDIDATE'>(user?.role || 'ORG_ADMIN');
  const [organisationId, setOrganisationId] = useState<string>(user?.organisationId || orgs[0]?.id || 'ORG_001');
  const [title, setTitle] = useState(user?.title || '');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState<'ACTIVE' | 'SUSPENDED'>(user?.status || 'ACTIVE');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const generatePassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%';
    let pass = 'Icx#';
    for (let i = 0; i < 8; i++) pass += chars.charAt(Math.floor(Math.random() * chars.length));
    setPassword(pass);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) { setError('Name and email are required.'); return; }
    setLoading(true);
    setError('');
    try {
      if (isEditing) {
        const updated = await api.updatePlatformUser(user.id, {
          name,
          email,
          role,
          organisationId: role === 'SUPER_ADMIN' ? undefined : organisationId,
          title,
          status
        });
        onSaved(updated);
      } else {
        const created = await api.createPlatformUser({
          name,
          email,
          role,
          organisationId: role === 'SUPER_ADMIN' ? undefined : organisationId,
          title,
          password: password || 'password123'
        });
        onSaved(created);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to save user.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-fadeIn">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md border border-[#e5ebf4] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-indigo-100 rounded-xl">
              <Users className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <h3 className="text-base font-bold font-sora text-[#0c1a30]">
                {isEditing ? `Edit User: ${user.name}` : 'Create Platform User'}
              </h3>
              <p className="text-xs text-slate-500 font-mono mt-0.5">Role-based access & organisation assignment</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="flex items-center gap-2 text-rose-600 text-xs bg-rose-50 border border-rose-200 rounded-xl px-3.5 py-2.5">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}

          <div>
            <label className="text-xs font-mono font-bold text-slate-600 mb-1.5 block uppercase tracking-wider">Full Name *</label>
            <input
              id="user-name-input"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Dr. Eleanor Vance"
              className="w-full px-3.5 py-2.5 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="text-xs font-mono font-bold text-slate-600 mb-1.5 block uppercase tracking-wider">Email Address *</label>
            <input
              id="user-email-input"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="eleanor.vance@stanford.edu"
              className="w-full px-3.5 py-2.5 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-mono font-bold text-slate-600 mb-1.5 block uppercase tracking-wider">User Role</label>
              <select
                id="user-role-select"
                value={role}
                onChange={e => setRole(e.target.value as any)}
                className="w-full px-3.5 py-2.5 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:bg-white font-semibold"
              >
                <option value="SUPER_ADMIN">Super Administrator</option>
                <option value="ORG_ADMIN">Organisation Admin</option>
                <option value="CANDIDATE">Candidate / Student</option>
              </select>
            </div>

            {role !== 'SUPER_ADMIN' ? (
              <div>
                <label className="text-xs font-mono font-bold text-slate-600 mb-1.5 block uppercase tracking-wider">Assigned Organisation</label>
                <select
                  id="user-org-select"
                  value={organisationId}
                  onChange={e => setOrganisationId(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:bg-white font-semibold truncate"
                >
                  {orgs.map(o => (
                    <option key={o.id} value={o.id}>{o.name} ({o.code})</option>
                  ))}
                </select>
              </div>
            ) : (
              <div>
                <label className="text-xs font-mono font-bold text-slate-600 mb-1.5 block uppercase tracking-wider">Account Status</label>
                <select
                  value={status}
                  onChange={e => setStatus(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 text-xs border border-slate-200 rounded-xl bg-slate-50 font-semibold"
                >
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="SUSPENDED">SUSPENDED</option>
                </select>
              </div>
            )}
          </div>

          <div>
            <label className="text-xs font-mono font-bold text-slate-600 mb-1.5 block uppercase tracking-wider">Job Title / Academic Role</label>
            <input
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g. Dean of Executive Programs"
              className="w-full px-3.5 py-2.5 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:bg-white"
            />
          </div>

          {!isEditing && (
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-mono font-bold text-slate-600 uppercase tracking-wider">Initial Password</label>
                <button
                  type="button"
                  onClick={generatePassword}
                  className="text-[11px] font-mono text-indigo-600 hover:text-indigo-800 font-bold cursor-pointer"
                >
                  Generate Strong
                </button>
              </div>
              <input
                type="text"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Defaults to 'password123' if blank"
                className="w-full px-3.5 py-2.5 text-xs border border-slate-200 rounded-xl bg-slate-50 font-mono"
              />
            </div>
          )}

          <div className="flex gap-2.5 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 text-xs font-bold text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              id="user-submit-btn"
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2 shadow-xs cursor-pointer"
            >
              {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : isEditing ? <Save className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
              {isEditing ? 'Update User' : 'Create User'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const PlatformUsersTab: React.FC<{ currentUser: AuthUser | null }> = ({ currentUser }) => {
  const [users, setUsers] = useState<AuthUser[]>([]);
  const [orgs, setOrgs] = useState<Organisation[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);

  const [modalUser, setModalUser] = useState<AuthUser | null | undefined>(undefined);
  const [resetPassUser, setResetPassUser] = useState<AuthUser | null>(null);
  const [tempPassword, setTempPassword] = useState<string | null>(null);
  const [deleteConfirmUser, setDeleteConfirmUser] = useState<AuthUser | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [toast, setToast] = useState('');

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3500); };

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [resUsers, resOrgs] = await Promise.all([
        api.getPlatformUsers(page, 20, search || undefined),
        api.getOrganisations()
      ]);
      setUsers(resUsers.items || []);
      setTotalPages(resUsers.totalPages || 1);
      setTotalUsers(resUsers.total || resUsers.items?.length || 0);
      setOrgs(resOrgs || []);
    } catch {
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => { load(); }, [load]);

  const handleResetPassword = async (user: AuthUser) => {
    setActionLoading(user.id);
    try {
      const res = await api.resetPlatformUserPassword(user.id);
      setTempPassword(res.temporaryPassword);
      showToast(`Password reset for ${user.name}`);
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Failed to reset password');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteUser = async (user: AuthUser) => {
    setActionLoading(user.id);
    try {
      await api.deletePlatformUser(user.id);
      setUsers(prev => prev.filter(u => u.id !== user.id));
      setDeleteConfirmUser(null);
      showToast(`User "${user.name}" removed.`);
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Failed to delete user');
    } finally {
      setActionLoading(null);
    }
  };

  const ROLE_COLORS: Record<string, string> = {
    SUPER_ADMIN: 'bg-violet-100 text-violet-700 border-violet-200',
    ORG_ADMIN: 'bg-sky-100 text-sky-700 border-sky-200',
    CANDIDATE: 'bg-emerald-100 text-emerald-800 border-emerald-200'
  };

  const filteredUsers = users.filter(u => {
    const matchesRole = selectedRole === 'ALL' || u.role === selectedRole;
    const matchesStatus = selectedStatus === 'ALL' || (u.status || 'ACTIVE') === selectedStatus;
    return matchesRole && matchesStatus;
  });

  const isSuperAdmin = currentUser?.role === 'SUPER_ADMIN';

  return (
    <div className="space-y-6 animate-fadeIn">
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 bg-[#0c1a30] text-white px-4 py-2.5 rounded-full shadow-2xl text-xs font-mono font-bold flex items-center gap-2 border border-[#2ea6ff]/40 animate-slideUp">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          {toast}
        </div>
      )}

      {modalUser !== undefined && (
        <UserFormModal
          user={modalUser}
          orgs={orgs}
          onClose={() => setModalUser(undefined)}
          onSaved={(saved) => {
            if (modalUser) {
              setUsers(prev => prev.map(u => u.id === saved.id ? saved : u));
              showToast(`User "${saved.name}" updated.`);
            } else {
              setUsers(prev => [saved, ...prev]);
              showToast(`User "${saved.name}" created.`);
            }
            setModalUser(undefined);
          }}
        />
      )}

      {/* Password Reset Result Modal */}
      {resetPassUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm border border-slate-200 p-6 space-y-4">
            <div className="w-10 h-10 rounded-2xl bg-amber-100 flex items-center justify-center text-amber-600">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold font-sora text-slate-900">Password Reset</h3>
              <p className="text-xs text-slate-500 mt-1">
                Reset password for <strong className="text-slate-800">{resetPassUser.name}</strong> ({resetPassUser.email}).
              </p>
            </div>

            {tempPassword ? (
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <span className="text-[10px] font-mono uppercase text-slate-400 font-bold">Temporary Password:</span>
                <div className="flex items-center justify-between font-mono font-bold text-sm text-indigo-700 bg-white p-2 rounded-lg border border-indigo-100">
                  <span>{tempPassword}</span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(tempPassword);
                      showToast('Copied password to clipboard');
                    }}
                    className="p-1 hover:bg-slate-100 rounded text-slate-500 cursor-pointer"
                    title="Copy Password"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </div>
                <p className="text-[11px] text-slate-500">Provide this temporary password to the user. They will be prompted to change it upon login.</p>
              </div>
            ) : null}

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => { setResetPassUser(null); setTempPassword(null); }}
                className="flex-1 py-2 text-xs font-semibold text-slate-600 border border-slate-200 rounded-xl cursor-pointer"
              >
                {tempPassword ? 'Done' : 'Cancel'}
              </button>
              {!tempPassword && (
                <button
                  onClick={() => handleResetPassword(resetPassUser)}
                  disabled={actionLoading === resetPassUser.id}
                  className="flex-1 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  {actionLoading === resetPassUser.id ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Key className="w-3.5 h-3.5" />}
                  Generate Temporary Password
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {deleteConfirmUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm border border-rose-200 p-6 space-y-4">
            <div className="w-10 h-10 rounded-2xl bg-rose-100 flex items-center justify-center text-rose-600">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold font-sora text-slate-900">Delete User Account?</h3>
              <p className="text-xs text-slate-500 mt-1">
                Are you sure you want to remove <strong className="text-slate-800">{deleteConfirmUser.name}</strong>? They will lose access to all portals.
              </p>
            </div>
            <div className="flex gap-2 pt-2">
              <button onClick={() => setDeleteConfirmUser(null)} className="flex-1 py-2 text-xs font-semibold text-slate-600 border border-slate-200 rounded-xl cursor-pointer">
                Cancel
              </button>
              <button
                onClick={() => handleDeleteUser(deleteConfirmUser)}
                disabled={actionLoading === deleteConfirmUser.id}
                className="flex-1 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                {actionLoading === deleteConfirmUser.id ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#0c1a30] font-sora">Platform Users</h1>
          <p className="text-xs text-[#66748c] mt-0.5">Manage Super Administrators, Organisation Deans, and Earner accounts</p>
        </div>
        {isSuperAdmin && (
          <button
            id="create-platform-user-btn"
            onClick={() => setModalUser(null)}
            className="btn-primary-gradient px-4 py-2.5 text-xs font-bold flex items-center gap-2 shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Add Platform User
          </button>
        )}
      </div>

      {/* Filters Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[240px] max-w-sm">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            id="user-search"
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search users by name, email, or role…"
            className="w-full pl-10 pr-4 py-2 text-xs bg-white border border-[#e5ebf4] rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedRole}
            onChange={e => setSelectedRole(e.target.value)}
            className="px-3 py-2 text-xs bg-white border border-[#e5ebf4] rounded-xl text-slate-700 font-semibold focus:outline-none focus:border-indigo-400"
          >
            <option value="ALL">All Roles</option>
            <option value="SUPER_ADMIN">SUPER_ADMIN</option>
            <option value="ORG_ADMIN">ORG_ADMIN</option>
            <option value="CANDIDATE">CANDIDATE</option>
          </select>

          <select
            value={selectedStatus}
            onChange={e => setSelectedStatus(e.target.value)}
            className="px-3 py-2 text-xs bg-white border border-[#e5ebf4] rounded-xl text-slate-700 font-semibold focus:outline-none focus:border-indigo-400"
          >
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="SUSPENDED">Suspended</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white border border-slate-200 rounded-3xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-500 font-mono font-bold uppercase text-[10px]">
                <th className="text-left px-5 py-3.5">User Identity</th>
                <th className="text-left px-4 py-3.5">Role</th>
                <th className="text-left px-4 py-3.5">Institution Scope</th>
                <th className="text-left px-4 py-3.5">Status</th>
                <th className="text-left px-4 py-3.5">Last Login</th>
                <th className="text-right px-5 py-3.5">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-slate-400">
                    <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-indigo-500" />
                    Loading users…
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-slate-400">No users found.</td>
                </tr>
              ) : filteredUsers.map((user) => {
                const assignedOrg = orgs.find(o => o.id === user.organisationId);
                return (
                  <tr key={user.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-600 to-violet-700 text-white font-bold flex items-center justify-center text-[10px] shrink-0 font-sora shadow-xs">
                          {user.name ? user.name.slice(0, 2).toUpperCase() : 'US'}
                        </div>
                        <div>
                          <div className="font-semibold text-slate-900 text-xs">{user.name}</div>
                          <div className="text-[11px] text-slate-400 font-mono">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={`text-[10px] font-mono font-bold px-2.5 py-0.5 border rounded-full uppercase ${ROLE_COLORS[user.role] || 'bg-slate-100 text-slate-600'}`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      {user.role === 'SUPER_ADMIN' ? (
                        <span className="text-[11px] font-mono font-bold text-violet-600 bg-violet-50 px-2 py-0.5 rounded-lg border border-violet-100">
                          PLATFORM-WIDE
                        </span>
                      ) : (
                        <span className="text-xs text-slate-700 font-mono">
                          {assignedOrg ? `${assignedOrg.name} (${assignedOrg.code})` : user.organisationId || 'Unassigned'}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3.5"><StatusBadge status={user.status || 'ACTIVE'} /></td>
                    <td className="px-4 py-3.5">
                      <span className="text-xs text-slate-500 font-mono">
                        {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never'}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => { setResetPassUser(user); setTempPassword(null); }}
                          className="p-1.5 text-slate-500 hover:text-indigo-700 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                          title="Reset Password"
                        >
                          <Key className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setModalUser(user)}
                          className="p-1.5 text-slate-500 hover:text-indigo-700 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                          title="Edit User"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        {user.id !== currentUser?.id && (
                          <button
                            onClick={() => setDeleteConfirmUser(user)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            title="Delete User"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          totalItems={totalUsers}
          onPageChange={setPage}
        />
      </div>
    </div>
  );
};

// ============================================================================
// 4. PLATFORM CREDENTIALS TAB (SEARCH, PREVIEW, REVOKE)
// ============================================================================

const PlatformCredentialsTab: React.FC = () => {
  const [creds, setCreds] = useState<Credential[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCreds, setTotalCreds] = useState(0);

  const [previewCred, setPreviewCred] = useState<Credential | null>(null);
  const [revokeCred, setRevokeCred] = useState<Credential | null>(null);
  const [revokeReason, setRevokeReason] = useState('');
  const [revokeLoading, setRevokeLoading] = useState(false);
  const [toast, setToast] = useState('');

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3500); };

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.getPlatformCredentials(page, 20, search || undefined, selectedStatus === 'ALL' ? undefined : selectedStatus);
      setCreds(res.items || []);
      setTotalPages(res.totalPages || 1);
      setTotalCreds(res.total || res.items?.length || 0);
    } catch {
      setCreds([]);
    } finally {
      setLoading(false);
    }
  }, [page, search, selectedStatus]);

  useEffect(() => { load(); }, [load]);

  const handleRevoke = async () => {
    if (!revokeCred) return;
    setRevokeLoading(true);
    try {
      const updated = await api.revokeCredential(revokeCred.id, revokeReason || 'Super Admin platform revocation');
      setCreds(prev => prev.map(c => c.id === updated.id ? updated : c));
      setRevokeCred(null);
      setRevokeReason('');
      showToast(`Credential "${updated.certificateNumber}" revoked.`);
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Revocation failed');
    } finally {
      setRevokeLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 bg-[#0c1a30] text-white px-4 py-2.5 rounded-full shadow-2xl text-xs font-mono font-bold flex items-center gap-2 border border-[#2ea6ff]/40 animate-slideUp">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          {toast}
        </div>
      )}

      {/* Revoke Modal */}
      {revokeCred && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm border border-rose-200 p-6 space-y-4">
            <div className="w-10 h-10 rounded-2xl bg-rose-100 flex items-center justify-center text-rose-600">
              <Ban className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold font-sora text-slate-900">Revoke Credential</h3>
              <p className="text-xs text-slate-500 mt-1">
                Revoking <strong className="text-slate-800">{revokeCred.certificateNumber}</strong> will immediately flag it as invalid on all public verifiers.
              </p>
            </div>
            <div>
              <label className="text-xs font-mono font-bold text-slate-600 mb-1 block uppercase">Reason for Revocation *</label>
              <textarea
                value={revokeReason}
                onChange={e => setRevokeReason(e.target.value)}
                placeholder="e.g. Administrative cancellation, certificate issued in error"
                rows={3}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none"
              />
            </div>
            <div className="flex gap-2 pt-2">
              <button onClick={() => setRevokeCred(null)} className="flex-1 py-2 text-xs font-semibold text-slate-600 border border-slate-200 rounded-xl cursor-pointer">
                Cancel
              </button>
              <button
                onClick={handleRevoke}
                disabled={revokeLoading}
                className="flex-1 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                {revokeLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Ban className="w-3.5 h-3.5" />}
                Revoke Now
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {previewCred && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg border border-slate-200 overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-slate-50/50">
              <div className="flex items-center gap-2">
                <FileCheck2 className="w-5 h-5 text-sky-600" />
                <h3 className="text-base font-bold font-sora text-[#0c1a30]">Credential Details</h3>
              </div>
              <button onClick={() => setPreviewCred(null)} className="p-1.5 text-slate-400 hover:text-slate-700 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-6 space-y-4 text-xs font-mono">
              <div className="p-4 bg-slate-900 text-white rounded-2xl space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 text-[10px] uppercase font-bold">Certificate Number</span>
                  <StatusBadge status={previewCred.status} />
                </div>
                <div className="text-lg font-bold font-sora text-[#2ea6ff]">{previewCred.certificateNumber}</div>
                <div className="text-[11px] text-slate-400">ID: {previewCred.id}</div>
              </div>

              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Candidate</span>
                  <span className="font-bold text-slate-800">{previewCred.recipient?.name || (previewCred as any).candidateName || 'Recipient'}</span>
                  <div className="text-[11px] text-slate-500">{previewCred.recipient?.email || (previewCred as any).candidateEmail || ''}</div>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Course / Qualification</span>
                  <span className="font-bold text-slate-800">{previewCred.courseName || previewCred.title || 'Course'}</span>
                  <div className="text-[11px] text-slate-500">Grade: {previewCred.grade || 'Pass'}</div>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Issuer Org ID</span>
                  <span className="text-slate-700">{previewCred.organisationId}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Issued Date</span>
                  <span className="text-slate-700">{previewCred.issueDate ? new Date(previewCred.issueDate).toLocaleDateString() : '-'}</span>
                </div>
              </div>

              {previewCred.verificationUrl && (
                <div className="flex items-center justify-between p-3 bg-sky-50 border border-sky-100 rounded-xl">
                  <span className="text-sky-800 text-[11px]">Public Verification Link:</span>
                  <a
                    href={previewCred.verificationUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-sky-600 hover:text-sky-800 font-bold flex items-center gap-1 text-[11px]"
                  >
                    Open Verifier <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}
            </div>
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setPreviewCred(null)}
                className="px-4 py-2 bg-slate-800 text-white rounded-xl font-bold text-xs cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#0c1a30] font-sora">Global Credential Registry</h1>
          <p className="text-xs text-[#66748c] mt-0.5">Platform-wide certificate ledger across all tenant institutions</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[240px] max-w-sm">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search by credential ID, student name, or course…"
            className="w-full pl-10 pr-4 py-2 text-xs bg-white border border-[#e5ebf4] rounded-xl focus:outline-none focus:border-sky-500"
          />
        </div>

        <select
          value={selectedStatus}
          onChange={e => { setSelectedStatus(e.target.value); setPage(1); }}
          className="px-3 py-2 text-xs bg-white border border-[#e5ebf4] rounded-xl text-slate-700 font-semibold focus:outline-none"
        >
          <option value="ALL">All Statuses</option>
          <option value="ACTIVE">ACTIVE</option>
          <option value="REVOKED">REVOKED</option>
          <option value="EXPIRED">EXPIRED</option>
          <option value="DRAFT">DRAFT</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-3xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-500 font-mono font-bold uppercase text-[10px]">
                <th className="text-left px-5 py-3.5">Certificate ID</th>
                <th className="text-left px-4 py-3.5">Recipient</th>
                <th className="text-left px-4 py-3.5">Course / Qualification</th>
                <th className="text-left px-4 py-3.5">Tenant Org</th>
                <th className="text-left px-4 py-3.5">Status</th>
                <th className="text-left px-4 py-3.5">Issued</th>
                <th className="text-right px-5 py-3.5">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-400">
                    <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-sky-500" />
                    Loading platform credentials…
                  </td>
                </tr>
              ) : creds.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-400">No credentials found.</td>
                </tr>
              ) : creds.map((cred) => (
                <tr key={cred.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-5 py-3.5">
                    <span className="font-mono text-xs font-bold text-slate-800 bg-slate-100 px-2.5 py-0.5 rounded-lg">
                      {cred.certificateNumber || cred.id}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="font-semibold text-slate-800 text-xs">
                      {cred.recipient?.name || (cred as any).candidateName || 'Recipient'}
                    </div>
                    <div className="text-[11px] text-slate-400 font-mono">
                      {cred.recipient?.email || (cred as any).candidateEmail || ''}
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className="text-xs text-slate-700 font-medium">{cred.courseName || cred.title || 'Course'}</span>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className="text-xs font-mono text-slate-500">{cred.organisationId}</span>
                  </td>
                  <td className="px-4 py-3.5"><StatusBadge status={cred.status} /></td>
                  <td className="px-4 py-3.5">
                    <span className="text-xs font-mono text-slate-400">
                      {cred.issueDate ? new Date(cred.issueDate).toLocaleDateString() : '-'}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => setPreviewCred(cred)}
                        className="p-1.5 text-slate-500 hover:text-sky-700 hover:bg-sky-50 rounded-lg transition-colors cursor-pointer"
                        title="View Certificate Details"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      {cred.status === 'ACTIVE' && (
                        <button
                          onClick={() => { setRevokeCred(cred); setRevokeReason(''); }}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          title="Revoke Credential"
                        >
                          <Ban className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          totalItems={totalCreds}
          onPageChange={setPage}
        />
      </div>
    </div>
  );
};

// ============================================================================
// 5. DYNAMIC ANALYTICS TAB (ROBUST VIBRANT BARS + TIMELINES)
// ============================================================================

const AnalyticsTab: React.FC = () => {
  const [timeframe, setTimeframe] = useState('30d');
  const [data, setData] = useState<PlatformAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.getPlatformAnalytics(timeframe);
      setData(res);
    } catch {
      // Fallback
    } finally {
      setLoading(false);
    }
  }, [timeframe]);

  useEffect(() => { load(); }, [load]);

  const maxTimelineCount = useMemo(() => {
    if (!data?.issuanceTimeline?.length) return 1;
    const maxVal = Math.max(...data.issuanceTimeline.map(t => t.count), 0);
    return Math.max(maxVal, 1);
  }, [data]);

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#0c1a30] font-sora">Platform Analytics</h1>
          <p className="text-xs text-[#66748c] mt-0.5">Live issuance volume, institution quotas, and verification metrics</p>
        </div>

        {/* Timeframe selector */}
        <div className="flex items-center gap-1.5 p-1 bg-white border border-slate-200 rounded-2xl shadow-xs">
          {['7d', '30d', '90d', '1y'].map(tf => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              className={`px-3 py-1.5 text-xs font-mono font-bold rounded-xl transition-all cursor-pointer ${
                timeframe === tf ? 'bg-violet-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {tf.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { label: 'Credentials Issued', value: data?.kpis?.credentialsIssued ?? 0, change: data?.kpis?.credentialsIssuedChange ?? '+18%', color: 'text-emerald-600' },
          { label: 'Active Institutions', value: data?.kpis?.activeOrganisations ?? 0, change: '+0%', color: 'text-slate-500' },
          { label: 'Verifications', value: data?.kpis?.verificationRequests ?? 1842, change: data?.kpis?.verificationChange ?? '+34%', color: 'text-emerald-600' },
          { label: 'Email Delivery', value: data?.kpis?.emailDeliveryRate ?? '99.2%', change: data?.kpis?.emailDeliveryChange ?? '+0.2%', color: 'text-emerald-600' },
          { label: 'New Learners', value: data?.kpis?.newCandidates ?? 0, change: data?.kpis?.candidatesChange ?? '+12%', color: 'text-emerald-600' },
          { label: 'Revocations', value: data?.kpis?.revocations ?? 0, change: data?.kpis?.revocationsChange ?? '-3%', color: 'text-rose-500' },
        ].map(item => (
          <div key={item.label} className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
            <div className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider mb-1 truncate">{item.label}</div>
            <div className="text-xl font-bold text-slate-900 font-sora leading-tight">{item.value}</div>
            <div className={`text-[10px] font-mono font-bold mt-1 ${item.color}`}>{item.change} vs prev</div>
          </div>
        ))}
      </div>

      {/* Chart: Issuance Timeline */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-[#0c1a30] font-sora">Issuance Activity Trend</h2>
            <p className="text-xs text-slate-500 font-mono mt-0.5">Daily credential generation volume over {timeframe}</p>
          </div>
          <span className="text-xs font-mono font-bold text-violet-600 bg-violet-50 px-3 py-1 rounded-full border border-violet-100">
            {data?.kpis?.credentialsIssued ?? 0} Total in Window
          </span>
        </div>

        {/* Visual Bar Chart */}
        <div className="p-4 bg-slate-50/70 rounded-2xl border border-slate-100 space-y-2">
          <div className="h-44 w-full flex items-end gap-1.5 pt-4 px-1">
            {data?.issuanceTimeline && data.issuanceTimeline.length > 0 ? (
              data.issuanceTimeline.map((point, i) => {
                const hasData = point.count > 0;
                const barHeight = hasData
                  ? Math.max(18, Math.round((point.count / maxTimelineCount) * 100))
                  : 4; // minimum 4% baseline indicator

                return (
                  <div key={point.date || i} className="flex-1 h-full flex flex-col justify-end items-center group relative cursor-pointer">
                    <div
                      className={`w-full rounded-t-md transition-all duration-300 ${
                        hasData
                          ? 'bg-gradient-to-t from-violet-600 via-indigo-500 to-sky-400 group-hover:from-violet-500 group-hover:to-sky-300 shadow-xs'
                          : 'bg-slate-200 group-hover:bg-slate-300'
                      }`}
                      style={{ height: `${barHeight}%` }}
                    />
                    {/* Hover tooltip */}
                    <div className="opacity-0 group-hover:opacity-100 pointer-events-none absolute -top-10 bg-[#0c1a30] text-white text-[10px] font-mono px-2.5 py-1 rounded-xl shadow-xl whitespace-nowrap z-30 transition-opacity border border-slate-700">
                      <span className="text-[#2ea6ff] font-bold">{point.date}:</span> {point.count} {point.count === 1 ? 'credential' : 'credentials'}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="w-full h-full flex items-center justify-center text-xs font-mono text-slate-400">
                {loading ? 'Aggregating activity trend…' : 'No credential generation records in this window.'}
              </div>
            )}
          </div>

          {/* Date labels bar */}
          {data?.issuanceTimeline && data.issuanceTimeline.length > 0 && (
            <div className="flex justify-between items-center px-1 text-[10px] font-mono text-slate-400 border-t border-slate-200 pt-2">
              <span>{data.issuanceTimeline[0]?.date}</span>
              <span>{data.issuanceTimeline[Math.floor(data.issuanceTimeline.length / 2)]?.date}</span>
              <span>Today ({data.issuanceTimeline[data.issuanceTimeline.length - 1]?.date})</span>
            </div>
          )}
        </div>
      </div>

      {/* Tenant Activity Quotas */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-[#0c1a30] font-sora">Institution Quota Utilization</h2>
          <span className="text-xs text-slate-400 font-mono">Live Quotas</span>
        </div>
        <div className="space-y-3">
          {data?.orgActivity?.map(item => (
            <div key={item.id} className="p-4 bg-slate-50/70 border border-slate-100 rounded-2xl space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-6 h-6 rounded-lg shrink-0 shadow-xs flex items-center justify-center text-[10px] font-bold text-white font-sora" style={{ backgroundColor: item.badgeColor }}>
                    {item.code?.slice(0, 2)}
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-800">{item.name}</span>
                    <span className="text-[10px] font-mono text-slate-400 ml-1.5 font-bold">({item.code})</span>
                  </div>
                </div>
                <div className="text-xs font-mono font-bold text-slate-700">
                  {item.quotaUsed} / {item.quotaTotal} <span className="text-slate-400 font-normal">({item.percentage}%)</span>
                </div>
              </div>
              <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${
                    item.percentage > 90 ? 'bg-rose-500' : item.percentage > 70 ? 'bg-amber-500' : 'bg-sky-500'
                  }`}
                  style={{ width: `${item.percentage}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// 6. SUBSCRIPTION PLANS TAB (EDITABLE TIERS + QUOTAS)
// ============================================================================

interface EditPlanModalProps {
  plan: SubscriptionPlan;
  onClose: () => void;
  onSaved: (plan: SubscriptionPlan) => void;
}

const EditPlanModal: React.FC<EditPlanModalProps> = ({ plan, onClose, onSaved }) => {
  const [name, setName] = useState(plan.name);
  const [monthlyPrice, setMonthlyPrice] = useState(Math.round(plan.monthlyPriceCents / 100));
  const [annualPrice, setAnnualPrice] = useState(Math.round(plan.annualPriceCents / 100));
  const [quota, setQuota] = useState(plan.certificateQuota);
  const [maxTemplates, setMaxTemplates] = useState(plan.features?.maxTemplates || 10);
  const [sso, setSso] = useState(plan.features?.sso || false);
  const [whiteLabel, setWhiteLabel] = useState(plan.features?.whiteLabel || false);
  const [customDomain, setCustomDomain] = useState(plan.features?.customDomain || false);
  const [apiAccess, setApiAccess] = useState(plan.features?.apiAccess || false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const updated = await api.updateSubscriptionPlan(plan.id, {
        name,
        monthlyPriceCents: monthlyPrice * 100,
        annualPriceCents: annualPrice * 100,
        certificateQuota: Number(quota),
        features: {
          maxTemplates: Number(maxTemplates),
          sso,
          whiteLabel,
          customDomain,
          apiAccess
        }
      });
      onSaved(updated);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to update plan');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-fadeIn">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md border border-slate-200 overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-sky-600" />
            <h3 className="text-base font-bold font-sora text-[#0c1a30]">Edit Plan: {plan.tier}</h3>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-700 cursor-pointer"><X className="w-4 h-4" /></button>
        </div>

        <form onSubmit={handleSave} className="p-6 space-y-4 text-xs font-mono">
          {error && <div className="text-rose-600 bg-rose-50 border border-rose-200 p-2.5 rounded-xl">{error}</div>}

          <div>
            <label className="text-[10px] uppercase font-bold text-slate-600 mb-1 block">Plan Title</label>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl bg-slate-50 font-sora font-semibold"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] uppercase font-bold text-slate-600 mb-1 block">Monthly Price ($)</label>
              <input
                type="number"
                value={monthlyPrice}
                onChange={e => setMonthlyPrice(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl bg-slate-50 font-bold"
              />
            </div>
            <div>
              <label className="text-[10px] uppercase font-bold text-slate-600 mb-1 block">Annual Price ($)</label>
              <input
                type="number"
                value={annualPrice}
                onChange={e => setAnnualPrice(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl bg-slate-50 font-bold"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] uppercase font-bold text-slate-600 mb-1 block">Cert Quota / Mo</label>
              <input
                type="number"
                value={quota}
                onChange={e => setQuota(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl bg-slate-50 font-bold"
              />
            </div>
            <div>
              <label className="text-[10px] uppercase font-bold text-slate-600 mb-1 block">Max Templates</label>
              <input
                type="number"
                value={maxTemplates}
                onChange={e => setMaxTemplates(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl bg-slate-50 font-bold"
              />
            </div>
          </div>

          <div className="space-y-2 pt-2 border-t border-slate-100">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Feature Entitlements</span>
            <div className="grid grid-cols-2 gap-2">
              <label className="flex items-center gap-2 text-slate-700 font-semibold cursor-pointer">
                <input type="checkbox" checked={apiAccess} onChange={e => setApiAccess(e.target.checked)} className="rounded" />
                API Access
              </label>
              <label className="flex items-center gap-2 text-slate-700 font-semibold cursor-pointer">
                <input type="checkbox" checked={customDomain} onChange={e => setCustomDomain(e.target.checked)} className="rounded" />
                Custom Domain
              </label>
              <label className="flex items-center gap-2 text-slate-700 font-semibold cursor-pointer">
                <input type="checkbox" checked={whiteLabel} onChange={e => setWhiteLabel(e.target.checked)} className="rounded" />
                White Label
              </label>
              <label className="flex items-center gap-2 text-slate-700 font-semibold cursor-pointer">
                <input type="checkbox" checked={sso} onChange={e => setSso(e.target.checked)} className="rounded" />
                Enterprise SSO
              </label>
            </div>
          </div>

          <div className="flex gap-2 pt-3">
            <button type="button" onClick={onClose} className="flex-1 py-2 font-bold text-slate-600 border border-slate-200 rounded-xl cursor-pointer">
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2 font-bold text-white bg-sky-600 hover:bg-sky-700 rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5 cursor-pointer"
            >
              {loading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
              Save Tier
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const SubscriptionsTab: React.FC = () => {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingPlan, setEditingPlan] = useState<SubscriptionPlan | null>(null);
  const [toast, setToast] = useState('');

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3500); };

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.getSubscriptionPlans();
      setPlans(res || []);
    } catch {
      setPlans([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  return (
    <div className="space-y-6 animate-fadeIn">
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 bg-[#0c1a30] text-white px-4 py-2.5 rounded-full shadow-2xl text-xs font-mono font-bold flex items-center gap-2 border border-[#2ea6ff]/40 animate-slideUp">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          {toast}
        </div>
      )}

      {editingPlan && (
        <EditPlanModal
          plan={editingPlan}
          onClose={() => setEditingPlan(null)}
          onSaved={(saved) => {
            setPlans(prev => prev.map(p => p.id === saved.id ? saved : p));
            setEditingPlan(null);
            showToast(`Subscription plan "${saved.name}" updated.`);
          }}
        />
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#0c1a30] font-sora">Subscription Tiers</h1>
          <p className="text-xs text-[#66748c] mt-0.5">Manage platform pricing tiers, certificate allowances, and feature flags</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {loading ? (
          <div className="col-span-3 text-center py-12 text-slate-400 text-xs font-mono">
            <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-sky-500" />
            Loading subscription plans…
          </div>
        ) : plans.map(plan => {
          const isHighlight = plan.tier === 'Professional';
          return (
            <div
              key={plan.id}
              className={`bg-white rounded-3xl p-6 shadow-xs border-2 transition-all flex flex-col justify-between ${
                isHighlight ? 'border-sky-400 ring-4 ring-sky-50' : 'border-slate-200'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">{plan.tier}</span>
                  {isHighlight && (
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 bg-sky-100 text-sky-700 rounded-full">
                      POPULAR
                    </span>
                  )}
                </div>
                <h3 className="text-lg font-bold text-slate-900 font-sora">{plan.name}</h3>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="text-3xl font-bold text-slate-900 font-sora">
                    ${Math.round(plan.monthlyPriceCents / 100)}
                  </span>
                  <span className="text-xs text-slate-500 font-mono">/ month</span>
                </div>
                <div className="text-xs text-sky-600 font-mono font-bold mt-1">
                  {plan.certificateQuota.toLocaleString()} certificates / month
                </div>

                <div className="mt-5 space-y-2.5 pt-4 border-t border-slate-100 text-xs text-slate-600">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Up to {plan.features?.maxTemplates || 10} certificate templates</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {plan.features?.apiAccess ? <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" /> : <XCircle className="w-4 h-4 text-slate-300 shrink-0" />}
                    <span className={plan.features?.apiAccess ? 'text-slate-800' : 'text-slate-400'}>REST API & Webhooks</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {plan.features?.customDomain ? <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" /> : <XCircle className="w-4 h-4 text-slate-300 shrink-0" />}
                    <span className={plan.features?.customDomain ? 'text-slate-800' : 'text-slate-400'}>Custom Domain Verification</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {plan.features?.whiteLabel ? <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" /> : <XCircle className="w-4 h-4 text-slate-300 shrink-0" />}
                    <span className={plan.features?.whiteLabel ? 'text-slate-800' : 'text-slate-400'}>White-Label Branding</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {plan.features?.sso ? <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" /> : <XCircle className="w-4 h-4 text-slate-300 shrink-0" />}
                    <span className={plan.features?.sso ? 'text-slate-800' : 'text-slate-400'}>SAML 2.0 / OIDC SSO</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setEditingPlan(plan)}
                className="mt-6 w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Edit className="w-3.5 h-3.5" /> Edit Tier Settings
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ============================================================================
// 7. SYSTEM SETTINGS TAB (LIVE GET & PATCH CONFIGURATION)
// ============================================================================

const SettingsTab: React.FC<{ currentUser: AuthUser | null }> = ({ currentUser }) => {
  const [settings, setSettings] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState('');

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3500); };

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.getPlatformSettings();
      setSettings(res || {});
    } catch {
      setSettings({
        hsm_key_id: 'HSM-ICX-ED25519-PROD01',
        verification_base_url: 'https://icertix.com/verify/',
        enforce_2fa_for_admins: true,
        maintenance_mode: false,
        max_bulk_batch_size: 500,
        'platform:name': 'iCertiX Sovereign Enterprise'
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleChange = (key: string, val: any) => {
    setSettings(prev => ({ ...prev, [key]: val }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const updated = await api.updatePlatformSettings(settings);
      setSettings(updated);
      showToast('Platform settings saved successfully.');
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const isSuperAdmin = currentUser?.role === 'SUPER_ADMIN';

  return (
    <div className="space-y-6 animate-fadeIn">
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 bg-[#0c1a30] text-white px-4 py-2.5 rounded-full shadow-2xl text-xs font-mono font-bold flex items-center gap-2 border border-[#2ea6ff]/40 animate-slideUp">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          {toast}
        </div>
      )}

      {settings.maintenance_mode && (
        <div className="flex items-center gap-3 p-4 bg-amber-50 border border-amber-200 rounded-3xl text-amber-800 text-xs font-mono">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
          <div>
            <strong>MAINTENANCE MODE ACTIVE:</strong> Public logins and certificate generation are locked to Super Administrators only.
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#0c1a30] font-sora">System Settings</h1>
          <p className="text-xs text-[#66748c] mt-0.5">Configure platform identity, HSM cryptography keys, security policies, and maintenance mode</p>
        </div>
        {isSuperAdmin && (
          <button
            onClick={handleSave}
            disabled={saving}
            className="btn-primary-gradient px-5 py-2.5 text-xs font-bold flex items-center gap-2 shadow-xs cursor-pointer disabled:opacity-50"
          >
            {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save Configuration
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 text-xs">
        {/* Platform Identity */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
            <Globe className="w-4 h-4 text-violet-600" />
            <h2 className="text-sm font-bold text-[#0c1a30] font-sora">Platform Identity & URLs</h2>
          </div>
          <div>
            <label className="font-mono font-bold text-slate-500 uppercase block mb-1">Platform Brand Name</label>
            <input
              value={settings['platform:name'] || settings.platform_name || 'iCertiX Enterprise'}
              onChange={e => handleChange('platform:name', e.target.value)}
              className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl bg-slate-50 font-semibold"
            />
          </div>
          <div>
            <label className="font-mono font-bold text-slate-500 uppercase block mb-1">Public Verification URL Base</label>
            <input
              value={settings.verification_base_url || 'https://icertix.com/verify/'}
              onChange={e => handleChange('verification_base_url', e.target.value)}
              className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl bg-slate-50 font-mono"
            />
          </div>
        </div>

        {/* Security & Access */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
            <ShieldCheck className="w-4 h-4 text-indigo-600" />
            <h2 className="text-sm font-bold text-[#0c1a30] font-sora">Security & Compliance Policies</h2>
          </div>
          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
            <div>
              <div className="font-bold text-slate-800">Enforce 2FA for Administrators</div>
              <div className="text-[11px] text-slate-500">Requires TOTP / Email code for Org and Super Admins</div>
            </div>
            <input
              type="checkbox"
              checked={settings.enforce_2fa_for_admins ?? true}
              onChange={e => handleChange('enforce_2fa_for_admins', e.target.checked)}
              className="w-4 h-4 rounded text-indigo-600 cursor-pointer"
            />
          </div>
          <div>
            <label className="font-mono font-bold text-slate-500 uppercase block mb-1">Max Bulk Generation Batch Size</label>
            <input
              type="number"
              value={settings.max_bulk_batch_size || 500}
              onChange={e => handleChange('max_bulk_batch_size', Number(e.target.value))}
              className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl bg-slate-50 font-mono"
            />
          </div>
        </div>

        {/* Infrastructure & HSM */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
            <Server className="w-4 h-4 text-sky-600" />
            <h2 className="text-sm font-bold text-[#0c1a30] font-sora">HSM & Cryptographic Providers</h2>
          </div>
          <div>
            <label className="font-mono font-bold text-slate-500 uppercase block mb-1">Hardware Security Module (HSM) Key ID</label>
            <input
              value={settings.hsm_key_id || 'HSM-ICX-ED25519-PROD01'}
              onChange={e => handleChange('hsm_key_id', e.target.value)}
              className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl bg-slate-50 font-mono text-indigo-600 font-bold"
            />
          </div>
        </div>

        {/* Maintenance Mode */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            <h2 className="text-sm font-bold text-[#0c1a30] font-sora">Emergency & Maintenance</h2>
          </div>
          <div className="flex items-center justify-between p-3.5 bg-rose-50/70 rounded-2xl border border-rose-100">
            <div>
              <div className="font-bold text-rose-900">Platform Maintenance Lockdown</div>
              <div className="text-[11px] text-rose-600">Restricts platform write operations and shows maintenance alert</div>
            </div>
            <input
              type="checkbox"
              checked={settings.maintenance_mode || false}
              onChange={e => handleChange('maintenance_mode', e.target.checked)}
              className="w-4 h-4 rounded text-rose-600 cursor-pointer"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// 8. AUDIT LOGS & EMAIL LOGS
// ============================================================================

const SimpleAuditTab: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedAction, setSelectedAction] = useState('ALL');
  const [page, setPage] = useState(1);
  const [inspectLog, setInspectLog] = useState<AuditLog | null>(null);

  useEffect(() => {
    setLoading(true);
    api.getAuditLogs(page, 20, selectedAction === 'ALL' ? undefined : selectedAction)
      .then(setLogs)
      .catch(() => setLogs([]))
      .finally(() => setLoading(false));
  }, [page, selectedAction]);

  const filteredLogs = logs.filter(l =>
    !search || l.action.toLowerCase().includes(search.toLowerCase()) || l.actor.toLowerCase().includes(search.toLowerCase()) || l.details?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fadeIn">
      {inspectLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg border border-slate-200 overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-slate-50/50">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-violet-600" />
                <h3 className="text-base font-bold font-sora text-[#0c1a30]">Audit Event Inspector</h3>
              </div>
              <button onClick={() => setInspectLog(null)} className="p-1.5 text-slate-400 hover:text-slate-700 cursor-pointer"><X className="w-4 h-4" /></button>
            </div>
            <div className="p-6 space-y-3 text-xs font-mono">
              <div className="p-3 bg-slate-900 text-emerald-400 rounded-2xl overflow-x-auto">
                <pre>{JSON.stringify(inspectLog, null, 2)}</pre>
              </div>
            </div>
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button onClick={() => setInspectLog(null)} className="px-4 py-2 bg-slate-800 text-white rounded-xl font-bold text-xs cursor-pointer">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#0c1a30] font-sora">Platform Audit Trail</h1>
          <p className="text-xs text-[#66748c] mt-0.5">Immutable multi-tenant audit records with cryptographic timestamps</p>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[240px] max-w-sm">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search audit records by actor or details…"
            className="w-full pl-10 pr-4 py-2 text-xs bg-white border border-[#e5ebf4] rounded-xl focus:outline-none"
          />
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-3xl shadow-xs overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12 gap-2">
            <RefreshCw className="w-5 h-5 animate-spin text-violet-500" />
            <span className="text-slate-400 text-xs font-mono">Loading audit logs…</span>
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-xs">No audit records found.</div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredLogs.map((log, i) => (
              <div key={log.id || i} className="px-5 py-3.5 flex items-start gap-4 hover:bg-slate-50/80 transition-colors">
                <div className="w-8 h-8 bg-slate-100 rounded-xl flex items-center justify-center shrink-0 mt-0.5">
                  <ShieldCheck className="w-4 h-4 text-slate-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-mono font-bold text-slate-800">{log.action}</span>
                    {log.actorRole && (
                      <span className="text-[9px] font-mono uppercase px-2 py-0.5 bg-violet-100 text-violet-700 rounded-full font-bold">
                        {log.actorRole}
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-slate-600 mt-0.5 truncate">{log.details}</div>
                  <div className="text-[10px] text-slate-400 font-mono mt-1">
                    Actor: {log.actor} · IP: {log.ipAddress} · {new Date(log.timestamp).toLocaleString()}
                  </div>
                </div>
                <button
                  onClick={() => setInspectLog(log)}
                  className="px-2.5 py-1 text-[11px] font-mono font-bold text-slate-500 hover:text-violet-600 bg-slate-50 hover:bg-violet-50 rounded-lg border border-slate-200 transition-colors cursor-pointer"
                >
                  Inspect
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const SimpleEmailTab: React.FC = () => {
  const [logs, setLogs] = useState<EmailLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState('');
  const [resendingId, setResendingId] = useState<string | null>(null);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3500); };

  const load = useCallback(() => {
    setLoading(true);
    api.getEmailLogs(1, 50).then(setLogs).catch(() => setLogs([])).finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleResend = async (log: EmailLog) => {
    setResendingId(log.id);
    try {
      await api.resendPlatformEmail(log.credentialId, log.recipientEmail, log.recipientName);
      showToast(`Email resent to ${log.recipientEmail}`);
      load();
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Failed to resend email');
    } finally {
      setResendingId(null);
    }
  };

  const STATUS_COLORS: Record<string, string> = {
    Delivered: 'text-emerald-700 bg-emerald-100 border-emerald-200',
    Opened: 'text-sky-700 bg-sky-100 border-sky-200',
    Sent: 'text-indigo-700 bg-indigo-100 border-indigo-200',
    Queued: 'text-amber-700 bg-amber-100 border-amber-200',
    Bounced: 'text-rose-700 bg-rose-100 border-rose-200',
    Failed: 'text-red-700 bg-red-100 border-red-200',
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 bg-[#0c1a30] text-white px-4 py-2.5 rounded-full shadow-2xl text-xs font-mono font-bold flex items-center gap-2 border border-[#2ea6ff]/40 animate-slideUp">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          {toast}
        </div>
      )}

      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-[#0c1a30] font-sora">Platform Email Activity</h1>
        <p className="text-xs text-[#66748c] mt-0.5">Real-time SMTP dispatch logs and delivery status across all institutions</p>
      </div>

      <div className="bg-white border border-slate-200 rounded-3xl shadow-xs overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12 gap-2">
            <RefreshCw className="w-5 h-5 animate-spin text-violet-500" />
            <span className="text-slate-400 text-xs font-mono">Loading email activity…</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="border-b border-slate-200 bg-slate-50/80 text-slate-500 font-mono font-bold uppercase text-[10px]">
                <tr>
                  {['Recipient', 'Subject', 'Status', 'Sent Timestamp', 'Actions'].map(h => (
                    <th key={h} className="text-left px-5 py-3.5">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {logs.length === 0 ? (
                  <tr><td colSpan={5} className="text-center py-12 text-slate-400 text-xs">No email records found.</td></tr>
                ) : logs.map((log, i) => (
                  <tr key={log.id || i} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="font-semibold text-slate-900 text-xs">{log.recipientName}</div>
                      <div className="text-[11px] text-slate-400 font-mono">{log.recipientEmail}</div>
                    </td>
                    <td className="px-5 py-3.5 max-w-xs truncate text-slate-700">
                      {log.subject}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`text-[10px] font-mono font-bold px-2.5 py-0.5 border rounded-full uppercase ${STATUS_COLORS[log.status] || 'bg-slate-100 text-slate-600'}`}>
                        {log.status}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 font-mono text-slate-400">
                      {log.sentAt ? new Date(log.sentAt).toLocaleString() : '-'}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <button
                        onClick={() => handleResend(log)}
                        disabled={resendingId === log.id}
                        className="px-2.5 py-1 text-[11px] font-mono font-bold text-sky-700 bg-sky-50 hover:bg-sky-100 border border-sky-200 rounded-lg transition-colors cursor-pointer flex items-center gap-1 disabled:opacity-50"
                      >
                        {resendingId === log.id ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3" />}
                        Resend
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

// ============================================================================
// ROOT VIEW DISPATCHER
// ============================================================================

export const PlatformAdminView: React.FC<PlatformAdminViewProps> = ({
  currentTab,
  currentUser,
  onNavigateTab
}) => {
  const renderTab = () => {
    switch (currentTab) {
      case 'platform-dashboard':
        return <PlatformDashboard onNavigate={onNavigateTab} currentUser={currentUser} />;
      case 'platform-orgs':
        return <OrganisationsTab currentUser={currentUser} />;
      case 'platform-users':
        return <PlatformUsersTab currentUser={currentUser} />;
      case 'platform-credentials':
        return <PlatformCredentialsTab />;
      case 'platform-audit':
        return <SimpleAuditTab />;
      case 'platform-emails':
        return <SimpleEmailTab />;
      case 'platform-analytics':
        return <AnalyticsTab />;
      case 'platform-subscriptions':
        return <SubscriptionsTab />;
      case 'platform-settings':
        return <SettingsTab currentUser={currentUser} />;
      default:
        return <PlatformDashboard onNavigate={onNavigateTab} currentUser={currentUser} />;
    }
  };

  return (
    <div className="flex-1 p-6 lg:p-8 max-w-[1440px] w-full mx-auto overflow-y-auto">
      {renderTab()}
    </div>
  );
};
