import React from 'react';
import { 
  Award, 
  ShieldCheck, 
  Users, 
  Palette, 
  Mail, 
  CheckCircle2, 
  AlertTriangle, 
  Plus, 
  Zap, 
  Edit3, 
  Layers,
  Sparkles
} from 'lucide-react';
import { Organisation, Credential, CertificateTemplate, NavTab } from '../../types';
import { StudioDesignSchema } from '../../types/templateStudio';
import { formatDate } from '../../utils/crypto';
import { VectorCertificatePreview } from '../template-studio/components/VectorCertificatePreview';
import { 
  PREBUILT_TEMPLATES_CATALOG, 
  DEFAULT_DEMO_DATA, 
  legacyTemplateToDesignSchema 
} from '../../utils/templatePresets';

interface DashboardViewProps {
  currentOrg: Organisation;
  credentials: Credential[];
  templates: CertificateTemplate[];
  candidateCount: number;
  onNavigateTab: (tab: NavTab) => void;
  onViewCertificate: (cred: Credential) => void;
  onVerifyCredential: (cred: Credential) => void;
  onEditTemplateInDesigner?: (templateId: string) => void;
  onUseTemplateForIssue?: (templateId: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  currentOrg,
  credentials,
  templates,
  candidateCount,
  onNavigateTab,
  onViewCertificate,
  onVerifyCredential,
  onEditTemplateInDesigner,
  onUseTemplateForIssue
}) => {
  const orgCustomizedCount = React.useMemo(() => {
    try {
      const seen = new Set<string>();
      let count = 0;
      const orgKey = `icertix_studio_schemas_${currentOrg?.id}`;
      const stored = localStorage.getItem(orgKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          parsed.forEach((s: any) => {
            const isThisOrg = s.organisationId === currentOrg?.id || 
              (s.organisationName && s.organisationName.trim().toLowerCase() === currentOrg?.name?.trim().toLowerCase());
            if (isThisOrg && !seen.has(s.id || s.templateId)) {
              seen.add(s.id || s.templateId);
              count++;
            }
          });
        }
      }
      return count;
    } catch { return 0; }
  }, [currentOrg]);

  const orgCreds = credentials.filter(c => c && c.organisationId === currentOrg?.id);
  const activeCount = orgCreds.filter(c => c.status === 'ACTIVE').length;
  const revokedCount = orgCreds.filter(c => c.status === 'REVOKED').length;
  const emailDeliveredCount = orgCreds.filter(c => c.emailDelivery?.status === 'Delivered' || c.emailDelivery?.status === 'Opened').length;
  const emailRate = orgCreds.length > 0 ? Math.round((emailDeliveredCount / orgCreds.length) * 100) : 100;

  const resolveSchema = (t: CertificateTemplate | any): StudioDesignSchema => {
    if (t.schema && t.schema.elements && t.schema.elements.length > 0) {
      return t.schema as StudioDesignSchema;
    }
    const prebuilt = PREBUILT_TEMPLATES_CATALOG.find(p => p.id === t.id || p.name === t.name);
    if (prebuilt) {
      return prebuilt.schema;
    }
    return legacyTemplateToDesignSchema(t, currentOrg);
  };

  const extractVariables = (t: CertificateTemplate | any): string[] => {
    const schema = resolveSchema(t);
    const vars: string[] = [];
    const seen = new Set<string>();
    if (schema?.elements) {
      schema.elements.forEach(el => {
        if (el.isVariable || el.type === 'dynamic-field') {
          const k = (el.customVariableKey || el.fieldKey || el.name || '').trim();
          if (k && !seen.has(k)) {
            seen.add(k);
            vars.push(k);
          }
        }
      });
    }
    return vars.length > 0 ? vars : ['candidateName', 'courseName', 'issueDate'];
  };

  const featuredTemplates = React.useMemo(() => {
    const list: Array<{
      id: string;
      name: string;
      badge: string;
      category: string;
      orientation: string;
      schema: StudioDesignSchema;
      variables: string[];
    }> = [];
    const seen = new Set<string>();

    templates.forEach(t => {
      if (!seen.has(t.id)) {
        seen.add(t.id);
        const schema = resolveSchema(t);
        list.push({
          id: t.id,
          name: t.name,
          badge: t.isDefault ? 'Official Default' : 'Active Design',
          category: t.theme || 'Official',
          orientation: t.orientation || schema?.page?.orientation || 'landscape',
          schema,
          variables: extractVariables(t)
        });
      }
    });

    PREBUILT_TEMPLATES_CATALOG.forEach(p => {
      if (!seen.has(p.id) && list.length < 6) {
        seen.add(p.id);
        list.push({
          id: p.id,
          name: p.name,
          badge: (p as any).badge || 'Popular Preset',
          category: p.category,
          orientation: p.schema.page?.orientation || 'landscape',
          schema: p.schema,
          variables: ['candidateName', 'courseName', 'grade', 'score']
        });
      }
    });

    return list.slice(0, 4);
  }, [templates, currentOrg]);

  const handleEdit = (tplId: string) => {
    if (onEditTemplateInDesigner) {
      onEditTemplateInDesigner(tplId);
    } else {
      onNavigateTab('designer');
    }
  };

  const handleIssue = (tplId: string) => {
    if (onUseTemplateForIssue) {
      onUseTemplateForIssue(tplId);
    } else {
      onNavigateTab('generation');
    }
  };

  return (
    <div className="space-y-5 animate-fadeIn pb-10">
      <div className="bg-gradient-to-r from-[#050e20] via-[#0a1f44] to-[#0e2a5c] text-white p-4 sm:p-5 rounded-2xl border border-[#0e2a5c] shadow-md relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-48 h-48 rounded-full bg-[#2ea6ff]/10 blur-2xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <span className="px-2 py-0.5 bg-sky-500/20 border border-sky-400/30 rounded-md text-[10px] font-mono text-sky-300">
                Authority Dashboard
              </span>
              <span className="text-[11px] text-slate-300 font-mono">Tenant: {currentOrg.code || currentOrg.name}</span>
            </div>
            <h1 className="text-lg sm:text-xl font-bold font-sora text-white">
              {currentOrg.name}
            </h1>
          </div>

          <p className="text-xs text-slate-300 max-w-md font-jakarta hidden md:block">
            Issue cryptographically anchored credentials with SHA-256 digests, automated email dispatch, and instant verification.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mt-3.5 pt-3.5 border-t border-white/10 text-xs relative z-10">
          <div 
            onClick={() => onNavigateTab('templates')}
            className="p-2.5 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-[#2ea6ff]/50 rounded-xl cursor-pointer transition-all group"
          >
            <span className="text-[9px] font-mono text-[#2ea6ff] block font-bold">STEP 1</span>
            <span className="font-bold text-white text-xs block truncate group-hover:text-[#2ea6ff] transition-colors">My Templates</span>
            <span className="text-[10px] text-slate-300 truncate block">Saved variable layouts</span>
          </div>

          <div 
            onClick={() => onNavigateTab('designer')}
            className="p-2.5 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-[#7bd94f]/50 rounded-xl cursor-pointer transition-all group"
          >
            <span className="text-[9px] font-mono text-[#7bd94f] block font-bold">STEP 2</span>
            <span className="font-bold text-white text-xs block truncate group-hover:text-[#7bd94f] transition-colors">Design Studio</span>
            <span className="text-[10px] text-slate-300 truncate block">Vector canvas & seals</span>
          </div>

          <div 
            onClick={() => onNavigateTab('candidates')}
            className="p-2.5 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-[#2ea6ff]/50 rounded-xl cursor-pointer transition-all group"
          >
            <span className="text-[9px] font-mono text-[#2ea6ff] block font-bold">STEP 3</span>
            <span className="font-bold text-white text-xs block truncate group-hover:text-[#2ea6ff] transition-colors">Add Candidates</span>
            <span className="text-[10px] text-slate-300 truncate block">Excel / CSV import</span>
          </div>

          <div 
            onClick={() => onNavigateTab('generation')}
            className="p-2.5 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-[#7bd94f]/50 rounded-xl cursor-pointer transition-all group"
          >
            <span className="text-[9px] font-mono text-[#7bd94f] block font-bold">STEP 4</span>
            <span className="font-bold text-white text-xs block truncate group-hover:text-[#7bd94f] transition-colors">Issue Certificates</span>
            <span className="text-[10px] text-slate-300 truncate block">HSM batch signing</span>
          </div>

          <div 
            onClick={() => onNavigateTab('registry')}
            className="p-2.5 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-[#2ea6ff]/50 rounded-xl cursor-pointer transition-all group col-span-2 sm:col-span-1"
          >
            <span className="text-[9px] font-mono text-[#2ea6ff] block font-bold">STEP 5</span>
            <span className="font-bold text-white text-xs block truncate group-hover:text-[#2ea6ff] transition-colors">Public Registry</span>
            <span className="text-[10px] text-slate-300 truncate block">Audit & verification</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="icx-card p-4 rounded-2xl">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#66748c] font-mono">
              Total Certificates
            </span>
            <div className="w-8 h-8 bg-sky-50 text-[#1877e0] rounded-xl flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-bold font-sora text-[#0c1a30] mt-1.5">
            {orgCreds.length}
          </div>
          <div className="flex items-center justify-between text-[11px] mt-2 pt-2 border-t border-[#e5ebf4] text-[#42506a]">
            <span className="text-[#5cbf3c] font-semibold flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> {activeCount} Active
            </span>
            {revokedCount > 0 && (
              <span className="text-rose-600 font-semibold flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" /> {revokedCount} Revoked
              </span>
            )}
          </div>
        </div>

        <div className="icx-card p-4 rounded-2xl">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#66748c] font-mono">
              Enrolled Candidates
            </span>
            <div className="w-8 h-8 bg-emerald-50 text-[#5cbf3c] rounded-xl flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-bold font-sora text-[#0c1a30] mt-1.5">
            {candidateCount}
          </div>
          <div className="text-[11px] text-[#66748c] mt-2 pt-2 border-t border-[#e5ebf4] flex items-center justify-between">
            <span>Registered recipients</span>
            <button 
              onClick={() => onNavigateTab('candidates')}
              className="text-[#1877e0] font-bold hover:underline cursor-pointer"
            >
              View List →
            </button>
          </div>
        </div>

        <div className="icx-card p-4 rounded-2xl">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#66748c] font-mono">
              Saved Templates
            </span>
            <div className="w-8 h-8 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center">
              <Palette className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-bold font-sora text-[#0c1a30] mt-1.5">
            {templates.length}
          </div>
          <div className="text-[11px] text-[#66748c] mt-2 pt-2 border-t border-[#e5ebf4] flex items-center justify-between">
            <span>{orgCustomizedCount} custom in studio</span>
            <button 
              onClick={() => onNavigateTab('templates')}
              className="text-[#1877e0] font-bold hover:underline cursor-pointer"
            >
              Templates Hub →
            </button>
          </div>
        </div>

        <div className="icx-card p-4 rounded-2xl">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#66748c] font-mono">
              Email Delivery
            </span>
            <div className="w-8 h-8 bg-sky-50 text-[#2ea6ff] rounded-xl flex items-center justify-center">
              <Mail className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-bold font-sora text-[#0c1a30] mt-1.5">
            {emailRate}%
          </div>
          <div className="text-[11px] text-[#66748c] mt-2 pt-2 border-t border-[#e5ebf4] flex items-center justify-between">
            <span>{emailDeliveredCount} Sent via SES</span>
            <button 
              onClick={() => onNavigateTab('emails')}
              className="text-[#1877e0] font-bold hover:underline cursor-pointer"
            >
              Logs →
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-start">
        <div className="lg:col-span-2 space-y-4">
          <div className="icx-card p-4 sm:p-5 rounded-2xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 border-b border-slate-100 pb-3">
              <div>
                <div className="flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <h2 className="font-sora text-sm sm:text-base font-bold text-[#0c1a30]">
                    Featured & Famous Certificate Templates
                  </h2>
                </div>
                <p className="text-xs text-[#66748c] mt-0.5">
                  Ready-to-issue layouts with dynamic variable schemas & sovereign security seals.
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => onNavigateTab('templates')}
                  className="px-3 py-1.5 bg-sky-50 hover:bg-sky-100 text-[#1877e0] rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>View All ({templates.length})</span>
                </button>

                <button
                  onClick={() => onNavigateTab('designer')}
                  className="px-3.5 py-1.5 bg-gradient-to-r from-[#1877e0] to-[#0284C7] hover:from-[#1565c0] hover:to-[#0369a1] text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center gap-1 shrink-0"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Create New</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {featuredTemplates.map((tpl) => {
                const tOrientation = (tpl.orientation || 'landscape').toLowerCase();

                return (
                  <div
                    key={tpl.id}
                    className="bg-slate-50/70 hover:bg-white rounded-2xl border border-[#e5ebf4] hover:border-[#1877e0]/60 p-3.5 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between group"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-1.5 mb-2">
                        <div className="flex items-center gap-1">
                          <span className="px-2 py-0.5 bg-sky-100 text-[#0284C7] rounded-md text-[9px] font-mono font-bold uppercase truncate max-w-[120px]">
                            {tpl.category}
                          </span>
                          <span className="px-1.5 py-0.5 bg-slate-200/80 text-slate-700 rounded text-[9px] font-mono">
                            {tOrientation === 'portrait' ? 'Portrait' : 'Landscape'}
                          </span>
                        </div>

                        <span className="px-2 py-0.5 bg-amber-50 text-amber-700 border border-amber-200/80 rounded-md text-[9px] font-mono font-bold flex items-center gap-1">
                          <Sparkles className="w-2.5 h-2.5 text-amber-500" />
                          <span>{tpl.badge}</span>
                        </span>
                      </div>

                      <h3 
                        onClick={() => handleEdit(tpl.id)}
                        className="text-xs sm:text-sm font-bold font-sora text-[#0c1a30] group-hover:text-[#1877e0] transition-colors truncate cursor-pointer"
                        title={tpl.name}
                      >
                        {tpl.name}
                      </h3>

                      <div 
                        onClick={() => handleEdit(tpl.id)}
                        className="mt-2 bg-slate-100 rounded-xl p-1.5 border border-slate-200/80 cursor-pointer overflow-hidden relative group/thumb hover:ring-2 hover:ring-[#1877e0]/30 transition-all flex items-center justify-center min-h-[140px]"
                      >
                        <div className="shrink-0 shadow-xs rounded overflow-hidden pointer-events-none">
                          <VectorCertificatePreview
                            schema={tpl.schema}
                            scale={tOrientation === 'portrait' ? 0.17 : 0.21}
                            demoData={{
                              ...DEFAULT_DEMO_DATA,
                              courseName: tpl.name
                            }}
                          />
                        </div>
                        <div className="absolute inset-0 bg-[#0c1a30]/20 opacity-0 group-hover/thumb:opacity-100 flex items-center justify-center transition-all backdrop-blur-[1px] rounded-xl">
                          <span className="px-2.5 py-1 bg-white/95 text-[#0c1a30] font-bold text-[11px] rounded-lg shadow-md flex items-center gap-1 transform group-hover/thumb:scale-105 transition-transform">
                            <Edit3 className="w-3 h-3 text-[#1877e0]" />
                            <span>Edit Canvas</span>
                          </span>
                        </div>
                      </div>

                      <div className="mt-2.5 flex items-center gap-1 flex-wrap">
                        {tpl.variables.slice(0, 3).map(v => (
                          <span 
                            key={v}
                            className="px-1.5 py-0.5 bg-white text-slate-600 border border-slate-200/80 rounded text-[9px] font-mono"
                          >
                            {`{{${v}}}`}
                          </span>
                        ))}
                        {tpl.variables.length > 3 && (
                          <span className="text-[9px] font-mono text-slate-400">
                            +{tpl.variables.length - 3}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="pt-2.5 mt-2.5 border-t border-slate-200/70 flex items-center justify-between gap-2">
                      <button
                        onClick={() => handleEdit(tpl.id)}
                        className="px-2.5 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                        title="Customize in Canvas Designer"
                      >
                        <Edit3 className="w-3 h-3 text-slate-500" />
                        <span>Edit Canvas</span>
                      </button>

                      <button
                        onClick={() => handleIssue(tpl.id)}
                        className="px-3 py-1.5 bg-[#1877e0] hover:bg-[#1565c0] text-white rounded-lg text-xs font-bold shadow-2xs hover:shadow-xs transition-all flex items-center gap-1 cursor-pointer"
                        title="Directly issue with variables"
                      >
                        <Zap className="w-3 h-3 text-amber-300" />
                        <span>Issue</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="icx-card p-4 sm:p-5 rounded-2xl">
            <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-2.5">
              <div>
                <h3 className="font-sora text-sm font-bold text-[#0c1a30]">
                  Recent Issued Credentials
                </h3>
                <span className="text-[11px] text-[#66748c]">Live cryptographic ledger</span>
              </div>
              <button
                onClick={() => onNavigateTab('registry')}
                className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-[#1877e0] font-bold text-[11px] rounded-lg transition-colors cursor-pointer"
              >
                View All →
              </button>
            </div>

            <div className="divide-y divide-[#f1f5f9]">
              {orgCreds.length === 0 ? (
                <div className="py-8 text-center text-[#66748c] text-xs space-y-2">
                  <p>No credentials issued yet.</p>
                  <button
                    onClick={() => onNavigateTab('generation')}
                    className="px-3 py-1.5 bg-[#1877e0] text-white text-xs font-bold rounded-lg cursor-pointer"
                  >
                    Issue First Certificate
                  </button>
                </div>
              ) : (
                orgCreds.slice(0, 5).map((cred) => (
                  <div 
                    key={cred.id} 
                    className="py-2.5 hover:bg-slate-50/80 px-1 rounded-xl transition-colors flex items-center justify-between gap-2"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-full bg-sky-100 text-[#1877e0] flex items-center justify-center font-bold text-[11px] shrink-0 font-sora border border-sky-200/70">
                        {cred.recipient.name.slice(0, 2).toUpperCase()}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span 
                            className="text-xs font-bold text-[#0c1a30] hover:text-[#1877e0] cursor-pointer truncate max-w-[110px]" 
                            onClick={() => onViewCertificate(cred)}
                            title={cred.recipient.name}
                          >
                            {cred.recipient.name}
                          </span>
                          <span className={`px-1.5 py-0.2 text-[9px] font-mono font-bold rounded-md uppercase ${
                            cred.status === 'ACTIVE' 
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                              : 'bg-rose-50 text-rose-700 border border-rose-200'
                          }`}>
                            {cred.status}
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-500 font-mono truncate max-w-[140px]">
                          {cred.title}
                        </div>
                        <div className="text-[9px] text-slate-400 font-mono truncate">
                          ID: {cred.credentialId} • {formatDate(cred.issueDate)}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => onViewCertificate(cred)}
                        className="px-2 py-1 text-[10px] font-bold text-slate-700 hover:bg-slate-100 border border-slate-200 rounded-md transition-colors cursor-pointer"
                        title="View Certificate"
                      >
                        View
                      </button>
                      <button
                        onClick={() => onVerifyCredential(cred)}
                        className="px-2 py-1 text-[10px] font-bold text-[#1877e0] hover:bg-sky-50 border border-sky-200 rounded-md transition-colors flex items-center gap-0.5 cursor-pointer"
                        title="Verify SHA-256 Proof"
                      >
                        <ShieldCheck className="w-3 h-3 text-[#2ea6ff]" />
                        <span>Verify</span>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="bg-gradient-to-br from-[#050e20] to-[#0a1f44] text-white p-4 rounded-2xl border border-[#0e2a5c] shadow-md text-xs space-y-2 font-mono">
            <div className="flex items-center justify-between text-[#7bd94f] font-bold uppercase tracking-wider text-[11px]">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Platform Cryptography</span>
              </div>
              <span className="text-[10px] text-[#2ea6ff]">Active</span>
            </div>
            <div className="space-y-1 text-slate-300 text-[10px] pt-1 border-t border-white/10">
              <div className="flex justify-between">
                <span>Algorithm:</span>
                <span className="text-white font-bold">SHA-256 (FIPS 180-4)</span>
              </div>
              <div className="flex justify-between">
                <span>Signatures:</span>
                <span className="text-white font-bold">Ed25519 Curve25519</span>
              </div>
              <div className="flex justify-between">
                <span>Tamper Detection:</span>
                <span className="text-[#7bd94f] font-bold">Anchored</span>
              </div>
              <div className="flex justify-between">
                <span>Verification:</span>
                <span className="text-[#2ea6ff] font-bold">Instant ~40ms</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
