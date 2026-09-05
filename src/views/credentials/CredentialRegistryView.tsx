import React, { useState } from 'react';
import { 
  FileCheck2, 
  Search, 
  Filter, 
  Eye, 
  ShieldCheck, 
  Link, 
  Mail, 
  Ban, 
  Download, 
  CheckCircle2, 
  AlertTriangle,
  Clock,
  Copy,
  ExternalLink,
  ChevronDown,
  Linkedin
} from 'lucide-react';
import { Organisation, Credential, CredentialStatus } from '../../types';
import { formatDate } from '../../utils/crypto';
import { generateLinkedInUrl } from '../../utils/linkedinUrl';
import { useToast } from '../../components/common';

interface CredentialRegistryViewProps {
  currentOrg: Organisation;
  credentials: Credential[];
  onViewCertificate: (cred: Credential) => void;
  onVerifyCredential: (cred: Credential) => void;
  onRevokeCredential: (cred: Credential) => void;
  onResendEmail: (cred: Credential) => void;
}

export const CredentialRegistryView: React.FC<CredentialRegistryViewProps> = ({
  currentOrg,
  credentials,
  onViewCertificate,
  onVerifyCredential,
  onRevokeCredential,
  onResendEmail
}) => {
  const toast = useToast();
  const orgCredentials = credentials.filter(c => c.organisationId === currentOrg.id);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filtered = orgCredentials.filter(c => {
    const rName = c.recipient?.name || (c as any).candidateName || '';
    const rEmail = c.recipient?.email || (c as any).candidateEmail || '';
    const cTitle = c.title || (c as any).courseName || '';
    const cId = c.credentialId || c.id || '';

    const matchesSearch = 
      rName.toLowerCase().includes(search.toLowerCase()) ||
      cId.toLowerCase().includes(search.toLowerCase()) ||
      cTitle.toLowerCase().includes(search.toLowerCase()) ||
      rEmail.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleCopyLink = (cred: Credential) => {
    const url = `${window.location.origin}/verify/${cred.credentialId}`;
    navigator.clipboard.writeText(url);
    setCopiedId(cred.id);
    toast.success(`Verification link copied for ${cred.credentialId}`);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleShareLinkedIn = (cred: Credential) => {
    const verifyUrl = `${window.location.origin}/verify/${cred.credentialId}`;
    const linkedInUrl = generateLinkedInUrl({
      name: cred.title,
      issuerName: cred.issuer?.name || currentOrg.name,
      issueDate: cred.issueDate,
      expiryDate: cred.expiryDate,
      credentialId: cred.credentialId,
      verificationUrl: verifyUrl
    });
    window.open(linkedInUrl, '_blank');
    toast.info('Opening LinkedIn "Add to Profile" certification form...');
  };

  const handleExportJson = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(orgCredentials, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `icertix-credentials-${currentOrg.code.toLowerCase()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    toast.success(`Exported ${orgCredentials.length} credentials as raw JSON`);
  };

  const handleExportW3cBundle = () => {
    const host = window.location.origin;
    const bundle = {
      "@context": [
        "https://www.w3.org/ns/credentials/v2",
        "https://purl.imsglobal.org/spec/ob/v3p0/context-3.0.3.json"
      ],
      type: ["VerifiablePresentation"],
      id: `urn:uuid:${crypto.randomUUID ? crypto.randomUUID() : Date.now()}`,
      holder: `did:web:${currentOrg.domain || 'icertix.com'}`,
      verifiableCredential: orgCredentials.map(cred => ({
        "@context": [
          "https://www.w3.org/2018/credentials/v1",
          "https://purl.imsglobal.org/spec/ob/v3p0/context-3.0.3.json"
        ],
        id: `${host}/verify/${cred.credentialId}`,
        type: ["VerifiableCredential", "OpenBadgeCredential"],
        issuer: {
          id: `did:web:${currentOrg.domain || 'icertix.com'}`,
          type: ["Profile"],
          name: currentOrg.name,
          url: host
        },
        issuanceDate: cred.issueDate,
        credentialSubject: {
          id: cred.recipient?.email ? `did:mailto:${cred.recipient.email}` : `urn:student:${cred.recipient?.studentId || 'unknown'}`,
          name: cred.recipient?.name || 'Recipient',
          achievement: {
            id: `${host}/verify/${cred.credentialId}#achievement`,
            type: ["Achievement"],
            name: cred.title || 'Certified Competency',
            description: cred.description || `Issued by ${currentOrg.name}`
          }
        },
        proof: {
          type: "Ed25519Signature2020",
          created: cred.issueDate,
          proofPurpose: "assertionMethod",
          verificationMethod: `did:web:${currentOrg.domain || 'icertix.com'}#key-1`,
          proofValue: cred.crypto?.signatureHex || (cred.crypto as any)?.signature || '0x0000000000000000',
          jcsDigest: cred.crypto?.sha256Hash
        }
      }))
    };

    const dataStr = "data:application/ld+json;charset=utf-8," + encodeURIComponent(JSON.stringify(bundle, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `icertix-w3c-bundle-${currentOrg.code.toLowerCase()}.jsonld`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    toast.success(`Exported ${orgCredentials.length} credentials as W3C Verifiable Presentation (.jsonld)`);
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-10">
      {/* Header Card */}
      <div className="icx-card p-6 sm:p-8 rounded-3xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 bg-sky-50 text-[#1877e0] rounded-2xl flex items-center justify-center">
              <FileCheck2 className="w-5 h-5" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold font-sora tracking-tight text-[#0c1a30]">
              Credentials Registry & Lifecycle
            </h1>
          </div>
          <p className="text-xs text-[#66748c] mt-1.5 font-jakarta">
            Complete institutional ledger of issued digital credentials, public verification links, and cryptographic status.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative group">
            <button
              className="btn-pill-ghost px-4 py-2 text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Download className="w-4 h-4 text-sky-600" />
              <span>Export Standards</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>
            <div className="absolute right-0 mt-1 w-60 bg-white border border-slate-200 rounded-2xl shadow-xl py-1.5 hidden group-hover:block z-50 animate-fadeIn text-left">
              <button
                onClick={handleExportW3cBundle}
                className="w-full text-left px-3.5 py-2 text-xs text-slate-700 hover:bg-sky-50 hover:text-sky-700 flex items-center justify-between transition-colors"
              >
                <div>
                  <div className="font-semibold">W3C Verifiable Presentation</div>
                  <div className="text-[10px] text-slate-400">JSON-LD 1.1 / Open Badges 3.0</div>
                </div>
                <span className="text-[10px] font-mono px-1.5 py-0.5 bg-emerald-50 text-emerald-700 rounded font-bold">.jsonld</span>
              </button>
              <button
                onClick={handleExportJson}
                className="w-full text-left px-3.5 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center justify-between transition-colors"
              >
                <div>
                  <div className="font-semibold">Raw Registry Ledger</div>
                  <div className="text-[10px] text-slate-400">Institutional records backup</div>
                </div>
                <span className="text-[10px] font-mono px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded font-bold">.json</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="icx-card p-4 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search Credential ID, Candidate, Title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-[#f4f7fc] border border-[#e5ebf4] rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:border-[#2ea6ff] transition-all"
          />
        </div>

        <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
          <span className="text-slate-500 font-mono text-[11px] mr-1">Status:</span>
          {['ALL', 'ACTIVE', 'REVOKED', 'EXPIRED'].map((s) => (
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

      {/* Mobile Card List (< md screens) */}
      <div className="md:hidden space-y-3">
        {filtered.length === 0 ? (
          <div className="icx-card p-8 text-center text-slate-500 rounded-2xl text-xs">
            No credentials found matching your query.
          </div>
        ) : (
          filtered.map((cred) => (
            <div key={cred.id} className="icx-card p-5 rounded-2xl space-y-3.5">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <span className="text-[10px] font-mono font-bold text-[#1877e0] block">
                    {cred.credentialId}
                  </span>
                  <h3 className="font-bold text-sm text-[#0c1a30] truncate">
                    {cred.recipient?.name || (cred as any).candidateName || 'Recipient'}
                  </h3>
                  <p className="text-xs text-[#66748c] font-medium line-clamp-1">
                    {cred.title || (cred as any).courseName}
                  </p>
                </div>
                <span className={`px-2.5 py-0.5 text-[10px] font-mono font-bold uppercase rounded-full shrink-0 ${
                  cred.status === 'ACTIVE'
                    ? 'bg-emerald-100 text-emerald-800'
                    : cred.status === 'REVOKED'
                    ? 'bg-rose-100 text-rose-800'
                    : 'bg-slate-100 text-slate-800'
                }`}>
                  {cred.status}
                </span>
              </div>

              <div className="bg-[#f4f7fc] p-3 rounded-xl border border-[#e5ebf4] text-[11px] font-mono space-y-1">
                <div className="flex items-center justify-between text-[#42506a]">
                  <span className="text-slate-400">Issued:</span>
                  <span>{formatDate(cred.issueDate)}</span>
                </div>
                <div className="flex items-center justify-between text-[#42506a]">
                  <span className="text-slate-400">Email:</span>
                  <span className="font-bold text-emerald-700 flex items-center gap-1">
                    <Mail className="w-3 h-3" />
                    {cred.emailDelivery?.status || 'Delivered'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-slate-400 text-[10px]">
                  <span>SHA-256:</span>
                  <span className="font-mono truncate max-w-[180px]">{cred.crypto.sha256Hash}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  onClick={() => onViewCertificate(cred)}
                  className="py-2 btn-primary-gradient text-xs font-bold flex items-center justify-center gap-1 cursor-pointer shadow-xs"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>View</span>
                </button>
                <button
                  onClick={() => onVerifyCredential(cred)}
                  className="py-2 btn-pill-ghost text-xs font-semibold flex items-center justify-center gap-1 cursor-pointer"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-[#5cbf3c]" />
                  <span>Verify</span>
                </button>
                <button
                  onClick={() => handleShareLinkedIn(cred)}
                  className="py-2 bg-[#0077b5] hover:brightness-110 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1 shadow-2xs transition-all cursor-pointer"
                >
                  <Linkedin className="w-3.5 h-3.5" />
                  <span>LinkedIn</span>
                </button>
                <button
                  onClick={() => handleCopyLink(cred)}
                  className="py-2 bg-[#f4f7fc] hover:bg-[#eef3fb] text-[#42506a] rounded-xl text-xs font-semibold flex items-center justify-center gap-1 border border-[#e5ebf4] transition-colors cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{copiedId === cred.id ? 'Copied!' : 'Copy Link'}</span>
                </button>
                {cred.status === 'ACTIVE' ? (
                  <button
                    onClick={() => onRevokeCredential(cred)}
                    className="py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl font-bold text-xs flex items-center justify-center gap-1 border border-rose-200 transition-colors cursor-pointer"
                  >
                    <Ban className="w-3.5 h-3.5" />
                    <span>Revoke</span>
                  </button>
                ) : (
                  <div className="py-2 bg-slate-100 text-slate-400 rounded-xl font-mono text-[10px] flex items-center justify-center border border-slate-200">
                    Revoked
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Desktop/Tablet Credentials Table (>= md screens) */}
      <div className="hidden md:block icx-table-card">
        <table className="w-full text-left text-xs border-collapse min-w-[780px]">
          <thead>
            <tr className="bg-[#f4f7fc] border-b border-[#e5ebf4] text-[#42506a] font-mono font-bold uppercase text-[10px]">
              <th className="p-4">Recipient & Course</th>
              <th className="p-4">Credential ID</th>
              <th className="p-4">SHA-256 Digest</th>
              <th className="p-4">Status</th>
              <th className="p-4">Issued Date</th>
              <th className="p-4">Email Delivery</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#e5ebf4]">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-10 text-center text-slate-500 font-jakarta">
                  No credentials found matching your query.
                </td>
              </tr>
            ) : (
              filtered.map((cred) => (
                <tr key={cred.id} className="hover:bg-slate-50/80 transition-colors">
                  {/* Recipient */}
                  <td className="p-4">
                    <div className="font-bold text-[#0c1a30]">
                      {cred.recipient?.name || (cred as any).candidateName || 'Recipient'}
                    </div>
                    <div className="text-[11px] text-[#66748c] truncate max-w-xs">{cred.title || (cred as any).courseName}</div>
                    <div className="text-[10px] text-slate-400 font-mono">
                      {cred.recipient?.email || (cred as any).candidateEmail || ''}
                    </div>
                  </td>

                  {/* ID */}
                  <td className="p-4 font-mono text-[11px] font-bold text-[#1877e0]">
                    {cred.credentialId}
                  </td>

                  {/* SHA-256 */}
                  <td className="p-4 font-mono text-[10px] text-slate-500 max-w-[140px] truncate" title={cred.crypto.sha256Hash}>
                    {cred.crypto.sha256Hash.slice(0, 16)}...
                  </td>

                  {/* Status */}
                  <td className="p-4">
                    <span className={`px-2.5 py-0.5 text-[10px] font-mono font-bold uppercase rounded-full ${
                      cred.status === 'ACTIVE'
                        ? 'bg-emerald-100 text-emerald-800'
                        : cred.status === 'REVOKED'
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-slate-100 text-slate-800'
                    }`}>
                      {cred.status}
                    </span>
                  </td>

                  {/* Issue Date */}
                  <td className="p-4 font-mono text-[11px] text-[#42506a]">
                    {formatDate(cred.issueDate)}
                  </td>

                  {/* Email Delivery */}
                  <td className="p-4 text-[11px]">
                    <span className={`inline-flex items-center gap-1 font-mono text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      (cred.emailDelivery?.status || 'Delivered') === 'Delivered' || cred.emailDelivery?.status === 'Opened'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}>
                      <Mail className="w-3 h-3" />
                      {cred.emailDelivery?.status || 'Delivered'}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="p-4 text-right space-x-1.5 whitespace-nowrap">
                    <button
                      onClick={() => onViewCertificate(cred)}
                      className="px-3 py-1 btn-primary-gradient text-[11px] font-bold shadow-2xs cursor-pointer inline-flex items-center gap-1"
                      title="View Official Certificate"
                    >
                      <Eye className="w-3 h-3" />
                      <span>View</span>
                    </button>
                    <button
                      onClick={() => onVerifyCredential(cred)}
                      className="px-2.5 py-1 btn-pill-ghost text-[11px] font-semibold cursor-pointer inline-flex items-center gap-1"
                      title="Verify SHA-256 Proof"
                    >
                      <ShieldCheck className="w-3 h-3 text-[#5cbf3c]" />
                      <span>Verify</span>
                    </button>
                    <button
                      onClick={() => handleShareLinkedIn(cred)}
                      className="px-2.5 py-1 bg-[#0077b5] hover:brightness-110 text-white rounded-lg text-[11px] font-semibold cursor-pointer inline-flex items-center gap-1 shadow-2xs transition-all"
                      title="Add to LinkedIn Profile"
                    >
                      <Linkedin className="w-3 h-3" />
                      <span>LinkedIn</span>
                    </button>
                    <button
                      onClick={() => handleCopyLink(cred)}
                      className="px-2.5 py-1 bg-[#f4f7fc] hover:bg-[#eef3fb] text-[#42506a] rounded-lg text-[11px] font-semibold border border-[#e5ebf4] cursor-pointer inline-flex items-center gap-1"
                      title="Copy Public URL"
                    >
                      <Copy className="w-3 h-3" />
                      <span>{copiedId === cred.id ? 'Copied' : 'Copy'}</span>
                    </button>
                    {cred.status === 'ACTIVE' && (
                      <button
                        onClick={() => onRevokeCredential(cred)}
                        className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg text-[11px] font-semibold border border-rose-200 cursor-pointer inline-flex items-center gap-1"
                        title="Revoke Credential"
                      >
                        <Ban className="w-3 h-3" />
                        <span>Revoke</span>
                      </button>
                    )}
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
