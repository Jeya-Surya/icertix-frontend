import React, { useState } from 'react';
import { 
  Mail, 
  Search, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Send, 
  RefreshCw, 
  ExternalLink,
  ShieldCheck,
  Zap
} from 'lucide-react';
import { Organisation, EmailLog, Credential } from '../../types';
import { formatDate } from '../../utils/crypto';

interface EmailLogsViewProps {
  currentOrg: Organisation;
  emailLogs: EmailLog[];
  credentials: Credential[];
  onResendEmail: (credId: string) => void;
}

export const EmailLogsView: React.FC<EmailLogsViewProps> = ({
  currentOrg,
  emailLogs,
  credentials,
  onResendEmail
}) => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [resendingId, setResendingId] = useState<string | null>(null);

  const orgLogs = emailLogs.filter(l => l.organisationId === currentOrg.id);

  const filteredLogs = orgLogs.filter(log => {
    const matchesSearch = 
      log.recipientEmail.toLowerCase().includes(search.toLowerCase()) ||
      log.recipientName.toLowerCase().includes(search.toLowerCase()) ||
      log.credentialId.toLowerCase().includes(search.toLowerCase()) ||
      log.subject.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || log.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const deliveredCount = orgLogs.filter(l => l.status === 'Delivered' || l.status === 'Opened').length;
  const openedCount = orgLogs.filter(l => l.status === 'Opened').length;
  const bouncedCount = orgLogs.filter(l => l.status === 'Bounced').length;

  const handleTriggerResend = (log: EmailLog) => {
    setResendingId(log.id);
    setTimeout(() => {
      onResendEmail(log.credentialId);
      setResendingId(null);
    }, 800);
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-10">
      {/* Header Card */}
      <div className="icx-card p-6 sm:p-8 rounded-3xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 bg-sky-50 text-[#1877e0] rounded-2xl flex items-center justify-center">
              <Mail className="w-5 h-5" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold font-sora tracking-tight text-[#0c1a30]">
              Email Delivery & Notifications
            </h1>
          </div>
          <p className="text-xs text-[#66748c] mt-1.5 font-jakarta">
            Automated certificate distribution logs, open tracking metrics, and DKIM/SPF authenticated dispatch queue.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono bg-emerald-50 text-emerald-800 px-3.5 py-1.5 rounded-full border border-emerald-200 self-start sm:self-auto font-bold">
          <span>SES DKIM:</span>
          <span className="text-[#5cbf3c]">✓ 2048-bit Verified</span>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="icx-card p-5 rounded-2xl">
          <span className="text-[10px] font-mono font-bold uppercase text-slate-500 block">Total Dispatched</span>
          <div className="text-xl sm:text-2xl font-bold font-sora text-[#0c1a30] mt-1">{orgLogs.length}</div>
          <span className="text-[11px] text-slate-400 font-mono">Queue</span>
        </div>

        <div className="icx-card p-5 rounded-2xl">
          <span className="text-[10px] font-mono font-bold uppercase text-slate-500 block">Delivered Rate</span>
          <div className="text-xl sm:text-2xl font-bold font-sora text-[#5cbf3c] mt-1">
            {orgLogs.length > 0 ? Math.round((deliveredCount / orgLogs.length) * 100) : 100}%
          </div>
          <span className="text-[11px] text-slate-500 font-mono">{deliveredCount} of {orgLogs.length}</span>
        </div>

        <div className="icx-card p-5 rounded-2xl">
          <span className="text-[10px] font-mono font-bold uppercase text-slate-500 block">Opened by Graduate</span>
          <div className="text-xl sm:text-2xl font-bold font-sora text-[#1877e0] mt-1">
            {orgLogs.length > 0 ? Math.round((openedCount / orgLogs.length) * 100) : 0}%
          </div>
          <span className="text-[11px] text-slate-500 font-mono">{openedCount} Opened</span>
        </div>

        <div className="icx-card p-5 rounded-2xl">
          <span className="text-[10px] font-mono font-bold uppercase text-slate-500 block">Bounce Rate</span>
          <div className="text-xl sm:text-2xl font-bold font-sora text-[#0c1a30] mt-1">
            {bouncedCount === 0 ? '0.0%' : `${bouncedCount} Bounced`}
          </div>
          <span className="text-[11px] text-[#5cbf3c] font-mono font-bold">Healthy</span>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="icx-card p-4 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search recipient, subject, ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-[#f4f7fc] border border-[#e5ebf4] rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:border-[#2ea6ff] transition-all"
          />
        </div>

        <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
          <span className="text-slate-500 font-mono text-[11px] mr-1">Status:</span>
          {['ALL', 'Delivered', 'Opened', 'Queued', 'Bounced'].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-full transition-all shrink-0 cursor-pointer ${
                statusFilter === s
                  ? 'btn-primary-gradient shadow-2xs font-bold'
                  : 'bg-[#eef3fb] text-slate-700 hover:bg-[#e5ebf4]'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Mobile Card List (< md) */}
      <div className="md:hidden space-y-3">
        {filteredLogs.length === 0 ? (
          <div className="icx-card p-8 text-center text-slate-500 rounded-2xl text-xs">
            No email logs found.
          </div>
        ) : (
          filteredLogs.map((log) => (
            <div key={log.id} className="icx-card p-5 rounded-2xl space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <h3 className="font-bold text-sm text-[#0c1a30] truncate">{log.recipientName}</h3>
                  <p className="text-[11px] text-[#66748c] font-mono truncate">{log.recipientEmail}</p>
                </div>
                <span className={`px-2.5 py-0.5 text-[10px] font-mono font-bold uppercase rounded-full shrink-0 ${
                  log.status === 'Delivered' || log.status === 'Opened'
                    ? 'bg-emerald-100 text-emerald-800'
                    : log.status === 'Bounced'
                    ? 'bg-rose-100 text-rose-800'
                    : 'bg-slate-100 text-slate-800'
                }`}>
                  {log.status}
                </span>
              </div>

              <div className="bg-[#f4f7fc] p-3 rounded-xl border border-[#e5ebf4] text-[11px] space-y-1">
                <p className="text-[#42506a] font-medium line-clamp-1">{log.subject}</p>
                <div className="flex items-center justify-between text-slate-500 font-mono text-[10px] pt-1">
                  <span>Cred: {log.credentialId}</span>
                  <span>{new Date(log.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              </div>

              <div className="flex justify-end pt-1">
                <button
                  onClick={() => handleTriggerResend(log)}
                  disabled={resendingId === log.id}
                  className="w-full py-2 btn-pill-ghost font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${resendingId === log.id ? 'animate-spin text-[#1877e0]' : ''}`} />
                  <span>{resendingId === log.id ? 'Sending...' : 'Resend Email Notification'}</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Desktop/Tablet Email Delivery Table (>= md) */}
      <div className="hidden md:block icx-table-card">
        <table className="w-full text-left text-xs border-collapse min-w-[760px]">
          <thead>
            <tr className="bg-[#f4f7fc] border-b border-[#e5ebf4] text-[#42506a] font-mono font-bold uppercase text-[10px]">
              <th className="p-4">Recipient</th>
              <th className="p-4">Credential</th>
              <th className="p-4">Subject</th>
              <th className="p-4">Status</th>
              <th className="p-4">Timestamp</th>
              <th className="p-4">SES Message ID</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#e5ebf4]">
            {filteredLogs.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-10 text-center text-slate-500 font-jakarta">
                  No email logs found.
                </td>
              </tr>
            ) : (
              filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="p-4">
                    <div className="font-bold text-[#0c1a30]">{log.recipientName}</div>
                    <div className="text-[11px] text-[#66748c] font-mono">{log.recipientEmail}</div>
                  </td>
                  <td className="p-4 font-mono text-[#1877e0] font-bold text-[11px]">
                    {log.credentialId}
                  </td>
                  <td className="p-4 text-[#42506a] max-w-xs truncate">
                    {log.subject}
                  </td>
                  <td className="p-4">
                    <span className={`px-2.5 py-0.5 text-[10px] font-mono font-bold uppercase rounded-full ${
                      log.status === 'Delivered' || log.status === 'Opened'
                        ? 'bg-emerald-100 text-emerald-800'
                        : log.status === 'Bounced'
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-slate-100 text-slate-800'
                    }`}>
                      {log.status}
                    </span>
                  </td>
                  <td className="p-4 font-mono text-[11px] text-[#42506a]">
                    {new Date(log.sentAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                  </td>
                  <td className="p-4 font-mono text-[10px] text-slate-400 truncate max-w-[120px]" title={log.messageId}>
                    {log.messageId}
                  </td>
                  <td className="p-4 text-right whitespace-nowrap">
                    <button
                      onClick={() => handleTriggerResend(log)}
                      disabled={resendingId === log.id}
                      className="px-3 py-1 btn-pill-ghost font-semibold text-[11px] cursor-pointer inline-flex items-center gap-1"
                    >
                      <RefreshCw className={`w-3 h-3 ${resendingId === log.id ? 'animate-spin text-[#1877e0]' : ''}`} />
                      <span>{resendingId === log.id ? 'Sending...' : 'Resend'}</span>
                    </button>
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
