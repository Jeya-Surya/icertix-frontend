import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Search, 
  Clock, 
  Lock, 
  UserCheck, 
  Download, 
  CheckCircle2, 
  FileText,
  AlertCircle
} from 'lucide-react';
import { Organisation, AuditLog } from '../../types';

interface AuditTrailViewProps {
  currentOrg: Organisation;
  auditLogs: AuditLog[];
}

export const AuditTrailView: React.FC<AuditTrailViewProps> = ({
  currentOrg,
  auditLogs
}) => {
  const [search, setSearch] = useState('');
  const orgLogs = auditLogs.filter(l => l.organisationId === currentOrg.id);

  const filtered = orgLogs.filter(log => {
    return (
      log.action.toLowerCase().includes(search.toLowerCase()) ||
      log.actor.toLowerCase().includes(search.toLowerCase()) ||
      log.details.toLowerCase().includes(search.toLowerCase()) ||
      log.targetId.toLowerCase().includes(search.toLowerCase())
    );
  });

  const handleExportAudit = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(orgLogs, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `icertix-audit-trail-${currentOrg.code.toLowerCase()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-10">
      {/* Header Card */}
      <div className="icx-card p-6 sm:p-8 rounded-3xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 bg-sky-50 text-[#1877e0] rounded-2xl flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold font-sora tracking-tight text-[#0c1a30]">
              Immutable Audit Trail
            </h1>
          </div>
          <p className="text-xs text-[#66748c] mt-1.5 font-jakarta">
            Tamper-evident event log recording credential issuance, revocation, and security activity.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportAudit}
            className="btn-pill-ghost px-4 py-2 text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Download className="w-4 h-4 text-slate-600" />
            <span>Export Audit Log</span>
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="icx-card p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search audit trail events..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-[#f4f7fc] border border-[#e5ebf4] rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:border-[#2ea6ff] transition-all"
          />
        </div>
        <span className="text-[11px] font-mono text-[#66748c] font-semibold">
          {filtered.length} Recorded Events
        </span>
      </div>

      {/* Mobile Card List (< md) */}
      <div className="md:hidden space-y-3">
        {filtered.length === 0 ? (
          <div className="icx-card p-8 text-center text-slate-500 rounded-2xl text-xs">
            No audit logs recorded for this filter.
          </div>
        ) : (
          filtered.map((log) => (
            <div key={log.id} className="icx-card p-5 rounded-2xl space-y-3">
              <div className="flex items-start justify-between gap-2">
                <span className={`px-2.5 py-0.5 text-[10px] font-mono font-bold uppercase rounded-full ${
                  log.action.includes('REVOKE')
                    ? 'bg-rose-100 text-rose-800'
                    : log.action.includes('ISSUE')
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-sky-100 text-[#1877e0]'
                }`}>
                  {log.action}
                </span>
                <span className="text-[10px] font-mono text-slate-400">
                  {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>

              <div className="text-xs">
                <div className="font-mono text-[11px] font-bold text-[#1877e0]">{log.targetId}</div>
                <p className="text-[#42506a] mt-1">{log.details}</p>
              </div>

              <div className="pt-2.5 border-t border-[#e5ebf4] flex items-center justify-between text-[10px] font-mono text-[#66748c]">
                <span>Actor: <strong className="text-[#0c1a30]">{log.actor}</strong></span>
                <span>IP: {log.ipAddress}</span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Desktop/Tablet Audit Log Table (>= md) */}
      <div className="hidden md:block icx-table-card">
        <table className="w-full text-left text-xs border-collapse min-w-[720px]">
          <thead>
            <tr className="bg-[#f4f7fc] border-b border-[#e5ebf4] text-[#42506a] font-mono font-bold uppercase text-[10px]">
              <th className="p-4">Timestamp</th>
              <th className="p-4">Action Type</th>
              <th className="p-4">Target ID</th>
              <th className="p-4">Authorized Actor</th>
              <th className="p-4">Details & Metadata</th>
              <th className="p-4 text-right">IP Address</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#e5ebf4]">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-10 text-center text-slate-500 font-jakarta">
                  No audit logs recorded for this filter.
                </td>
              </tr>
            ) : (
              filtered.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="p-4 font-mono text-[11px] text-[#42506a] whitespace-nowrap">
                    {new Date(log.timestamp).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                  </td>
                  <td className="p-4">
                    <span className={`px-2.5 py-0.5 text-[10px] font-mono font-bold uppercase rounded-full ${
                      log.action.includes('REVOKE')
                        ? 'bg-rose-100 text-rose-800'
                        : log.action.includes('ISSUE')
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-sky-100 text-[#1877e0]'
                    }`}>
                      {log.action}
                    </span>
                  </td>
                  <td className="p-4 font-mono font-bold text-[#1877e0] text-[11px]">
                    {log.targetId}
                  </td>
                  <td className="p-4 font-semibold text-[#0c1a30]">
                    {log.actor}
                  </td>
                  <td className="p-4 text-[#42506a] max-w-sm">
                    {log.details}
                  </td>
                  <td className="p-4 font-mono text-[#66748c] text-right text-[10px] whitespace-nowrap">
                    {log.ipAddress}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
