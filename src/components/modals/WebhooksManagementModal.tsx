import React, { useState, useEffect } from 'react';
import { 
  Webhook, 
  X, 
  Plus, 
  Send, 
  Trash2, 
  Copy, 
  Check, 
  ExternalLink, 
  Activity, 
  ShieldCheck, 
  AlertCircle, 
  CheckCircle2,
  RefreshCw
} from 'lucide-react';
import { api } from '../../services/apiClient';
import { useToast } from '../common';

interface WebhooksManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  orgName: string;
}

export const WebhooksManagementModal: React.FC<WebhooksManagementModalProps> = ({
  isOpen,
  onClose,
  orgName
}) => {
  const toast = useToast();
  const [activeTab, setActiveTab] = useState<'endpoints' | 'logs' | 'create'>('endpoints');
  const [endpoints, setEndpoints] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [copiedKeyId, setCopiedKeyId] = useState<string | null>(null);

  // New Endpoint Form
  const [newUrl, setNewUrl] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [selectedEvents, setSelectedEvents] = useState<string[]>([
    'credential.issued',
    'credential.revoked',
    'batch.completed'
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [testingId, setTestingId] = useState<string | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [eps, deliveryLogs] = await Promise.all([
        api.getWebhooks().catch(() => []),
        api.getWebhookLogs().catch(() => [])
      ]);
      setEndpoints(eps || []);
      setLogs(deliveryLogs || []);
    } catch {
      toast.error('Could not load webhook configurations.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCopySecret = (id: string, secret: string) => {
    navigator.clipboard.writeText(secret);
    setCopiedKeyId(id);
    toast.success('HMAC-SHA256 signing secret copied to clipboard');
    setTimeout(() => setCopiedKeyId(null), 2000);
  };

  const handleToggleEvent = (eventName: string) => {
    setSelectedEvents(prev => 
      prev.includes(eventName) ? prev.filter(e => e !== eventName) : [...prev, eventName]
    );
  };

  const handleCreateWebhook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUrl.trim()) {
      toast.error('Please specify a valid webhook URL');
      return;
    }

    setIsSubmitting(true);
    try {
      await api.createWebhook({
        url: newUrl.trim(),
        description: newDescription.trim() || undefined,
        events: selectedEvents
      });
      toast.success('Outbound webhook registered successfully.');
      setNewUrl('');
      setNewDescription('');
      setActiveTab('endpoints');
      loadData();
    } catch (err: any) {
      toast.error(err.message || 'Failed to create webhook');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTestPing = async (id: string) => {
    setTestingId(id);
    try {
      const res = await api.testWebhook(id);
      toast.success(res?.message || 'Test event dispatched successfully!');
      loadData();
    } catch (err: any) {
      toast.error(err.message || 'Failed to dispatch test ping');
    } finally {
      setTestingId(null);
    }
  };

  const handleDeleteWebhook = async (id: string) => {
    if (!confirm('Are you sure you want to delete this webhook?')) return;
    try {
      await api.deleteWebhook(id);
      toast.success('Webhook endpoint removed.');
      loadData();
    } catch {
      toast.error('Failed to delete webhook.');
    }
  };

  const availableEvents = [
    { id: 'credential.issued', label: 'credential.issued', desc: 'Fires when a new verifiable certificate is minted.' },
    { id: 'credential.revoked', label: 'credential.revoked', desc: 'Fires immediately when a credential is CRL revoked.' },
    { id: 'batch.completed', label: 'batch.completed', desc: 'Fires when bulk issuance job processing completes.' },
    { id: 'candidate.claimed', label: 'candidate.claimed', desc: 'Fires when an earner claims their private wallet.' }
  ];

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-fadeIn">
      <div className="bg-white max-w-3xl w-full border border-slate-200 shadow-2xl rounded-3xl overflow-hidden flex flex-col my-auto max-h-[90vh]">
        {/* Header */}
        <div className="bg-[#0A2540] text-white p-5 sm:p-6 flex items-center justify-between border-b border-[#0F3559]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-sky-500/20 text-sky-400 rounded-2xl flex items-center justify-center border border-sky-400/30 shrink-0">
              <Webhook className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-sora font-bold text-base sm:text-lg text-white">
                  Institutional Outbound Webhooks
                </h2>
                <span className="px-2 py-0.5 bg-emerald-900/60 text-emerald-300 font-mono text-[10px] font-bold rounded-full border border-emerald-700/50">
                  HMAC-SHA256
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Stream real-time credentialing lifecycle events to Canvas LMS, Moodle, or SIS for {orgName}.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="bg-slate-50 border-b border-slate-200 px-6 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-semibold">
            <button
              onClick={() => setActiveTab('endpoints')}
              className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                activeTab === 'endpoints'
                  ? 'bg-white text-[#0A2540] shadow-xs font-bold border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Endpoints ({endpoints.length})
            </button>
            <button
              onClick={() => setActiveTab('logs')}
              className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                activeTab === 'logs'
                  ? 'bg-white text-[#0A2540] shadow-xs font-bold border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Delivery Logs ({logs.length})
            </button>
            <button
              onClick={() => setActiveTab('create')}
              className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1 ${
                activeTab === 'create'
                  ? 'bg-[#0A2540] text-white shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Webhook</span>
            </button>
          </div>

          <button
            onClick={loadData}
            disabled={isLoading}
            className="p-1.5 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-200 transition-colors cursor-pointer"
            title="Refresh Webhooks"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Content Viewport */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-4 max-h-[60vh]">
          {/* TAB 1: ENDPOINTS LIST */}
          {activeTab === 'endpoints' && (
            <div className="space-y-3">
              {endpoints.length === 0 ? (
                <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-300">
                  <Webhook className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                  <p className="text-xs text-slate-600 font-semibold">No webhook endpoints configured yet.</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">Add an endpoint to start streaming credential events.</p>
                  <button
                    onClick={() => setActiveTab('create')}
                    className="mt-3 px-4 py-1.5 btn-primary-gradient text-xs font-bold rounded-xl cursor-pointer"
                  >
                    Configure First Webhook
                  </button>
                </div>
              ) : (
                endpoints.map((ep) => (
                  <div
                    key={ep.id}
                    className="p-4 bg-white border border-slate-200 rounded-2xl hover:border-slate-300 transition-all space-y-3 shadow-2xs"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-emerald-500" />
                          <strong className="text-xs text-slate-900 font-mono">{ep.url}</strong>
                        </div>
                        {ep.description && (
                          <p className="text-[11px] text-slate-500 mt-0.5 font-jakarta">{ep.description}</p>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5 self-end sm:self-auto">
                        <button
                          onClick={() => handleTestPing(ep.id)}
                          disabled={testingId === ep.id}
                          className="px-2.5 py-1 bg-sky-50 hover:bg-sky-100 text-sky-700 rounded-lg text-xs font-semibold border border-sky-200 flex items-center gap-1 cursor-pointer transition-colors"
                        >
                          <Send className={`w-3 h-3 ${testingId === ep.id ? 'animate-spin' : ''}`} />
                          <span>{testingId === ep.id ? 'Pinging...' : 'Test Ping'}</span>
                        </button>
                        <button
                          onClick={() => handleDeleteWebhook(ep.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                          title="Delete Webhook"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      <span className="text-[10px] text-slate-400 font-mono mr-1">Events:</span>
                      {ep.events?.map((ev: string) => (
                        <span
                          key={ev}
                          className="px-2 py-0.5 bg-slate-100 text-slate-700 text-[10px] font-mono font-semibold rounded-md border border-slate-200"
                        >
                          {ev}
                        </span>
                      ))}
                    </div>

                    <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 flex items-center justify-between gap-2">
                      <div className="text-[11px] font-mono text-slate-600 truncate">
                        <span className="text-slate-400 mr-1.5">Secret:</span>
                        <span className="blur-xs hover:blur-none transition-all">{ep.secret}</span>
                      </div>
                      <button
                        onClick={() => handleCopySecret(ep.id, ep.secret)}
                        className="px-2 py-1 bg-white hover:bg-slate-100 text-slate-700 rounded-lg text-[10px] font-semibold border border-slate-300 flex items-center gap-1 shrink-0 cursor-pointer"
                      >
                        {copiedKeyId === ep.id ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedKeyId === ep.id ? 'Copied' : 'Copy Key'}</span>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB 2: DELIVERY LOGS */}
          {activeTab === 'logs' && (
            <div className="space-y-2">
              {logs.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-500">
                  No outbound webhook delivery events recorded yet.
                </div>
              ) : (
                logs.map((log) => (
                  <div
                    key={log.id}
                    className="p-3 bg-white border border-slate-200 rounded-xl text-xs space-y-1.5 hover:border-slate-300 transition-all font-mono"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2 py-0.5 text-[10px] font-bold rounded-md ${
                            log.success
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          HTTP {log.statusCode || 200}
                        </span>
                        <span className="font-bold text-slate-800">{log.event}</span>
                      </div>
                      <span className="text-[10px] text-slate-400">
                        {new Date(log.timestamp).toLocaleTimeString()} ({log.durationMs}ms)
                      </span>
                    </div>

                    <div className="text-[11px] text-slate-600 truncate">
                      Target: {log.targetUrl}
                    </div>

                    {log.responseBody && (
                      <div className="bg-slate-900 text-slate-200 p-2 rounded-lg text-[10px] truncate">
                        Response: {log.responseBody}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB 3: CREATE WEBHOOK */}
          {activeTab === 'create' && (
            <form onSubmit={handleCreateWebhook} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Destination Payload URL <span className="text-rose-500">*</span>
                </label>
                <input
                  type="url"
                  placeholder="https://canvas.institution.edu/api/v1/webhooks/icertix"
                  value={newUrl}
                  onChange={(e) => setNewUrl(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:border-sky-500 font-mono"
                  required
                />
                <p className="text-[10px] text-slate-500 mt-1">
                  Must be an HTTPS endpoint capable of receiving JSON POST payloads with <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-700">X-iCertiX-Signature</code> headers.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Description / Service Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Canvas Production LMS Sync"
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-2">
                  Subscribe to Events
                </label>
                <div className="space-y-2">
                  {availableEvents.map((ev) => (
                    <label
                      key={ev.id}
                      className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl flex items-start gap-2.5 cursor-pointer hover:bg-slate-100 transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={selectedEvents.includes(ev.id)}
                        onChange={() => handleToggleEvent(ev.id)}
                        className="mt-0.5 rounded text-sky-600 focus:ring-sky-500"
                      />
                      <div>
                        <div className="font-mono text-xs font-bold text-slate-800">{ev.label}</div>
                        <div className="text-[11px] text-slate-500 font-jakarta">{ev.desc}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setActiveTab('endpoints')}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 btn-primary-gradient text-xs font-bold rounded-xl shadow-xs cursor-pointer"
                >
                  {isSubmitting ? 'Registering...' : 'Register Webhook Endpoint'}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Footer info */}
        <div className="bg-slate-100 border-t border-slate-200 px-6 py-2.5 flex items-center justify-between text-[11px] text-slate-500 font-mono">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>All payloads signed with HMAC-SHA256 timestamping</span>
          </div>
          <span>iCertiX Webhook Engine v3.0</span>
        </div>
      </div>
    </div>
  );
};
