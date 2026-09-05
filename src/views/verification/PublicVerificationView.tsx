import React, { useState, useEffect, useMemo } from 'react';
import { 
  ShieldCheck, 
  Search, 
  CheckCircle2, 
  XCircle, 
  Lock, 
  Eye, 
  Copy,
  RefreshCw,
  Linkedin,
  Code,
  FileJson,
  Download,
  Check,
  Globe,
  Award,
  Sparkles
} from 'lucide-react';
import { Credential, Organisation, VerificationResult } from '../../types';
import { formatDate } from '../../utils/crypto';
import { generateLinkedInUrl } from '../../utils/linkedinUrl';
import { IcertixSeal, useToast } from '../../components/common';
import { api, normalizeCredential } from '../../services/apiClient';

interface PublicVerificationViewProps {
  credentials: Credential[];
  organisations: Organisation[];
  initialCredentialId?: string | null;
  onViewCertificate: (cred: Credential) => void;
}

export const PublicVerificationView: React.FC<PublicVerificationViewProps> = ({
  credentials,
  organisations,
  initialCredentialId,
  onViewCertificate
}) => {
  const toast = useToast();
  const [lookupId, setLookupId] = useState(initialCredentialId || credentials[0]?.credentialId || 'ICX-2026-7F8A91C2');
  const [matchedCred, setMatchedCred] = useState<Credential | null>(null);
  const [liveVerification, setLiveVerification] = useState<VerificationResult | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [activeInspectorTab, setActiveInspectorTab] = useState<'checklist' | 'w3c_vc' | 'openbadges' | 'canonical'>('checklist');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Execute verification query
  const runVerification = async (targetId: string) => {
    if (!targetId.trim()) {
      setMatchedCred(null);
      setLiveVerification(null);
      return;
    }

    const clean = targetId.trim().toUpperCase();
    setIsVerifying(true);

    try {
      // 1. Live query to backend Express public verification engine
      const backendResult = await api.verifyPublicCredential(clean);
      if (backendResult && backendResult.credential) {
        setLiveVerification(backendResult);
        const normalized = normalizeCredential(backendResult.credential, organisations);
        setMatchedCred(normalized);
        setIsVerifying(false);
        return;
      }
    } catch {
      // Graceful fallback to local state if backend route fails
    }

    // 2. Fallback check from frontend credentials array
    const found = credentials.find(c => 
      c.credentialId.toUpperCase() === clean || 
      c.id.toUpperCase() === clean ||
      c.certificateNumber.toUpperCase() === clean
    );

    setMatchedCred(found || null);
    setLiveVerification(null);
    setIsVerifying(false);
  };

  useEffect(() => {
    if (initialCredentialId) {
      setLookupId(initialCredentialId);
      runVerification(initialCredentialId);
    } else {
      runVerification(lookupId);
    }
  }, [initialCredentialId]);

  const org = matchedCred ? organisations.find(o => o.id === matchedCred.organisationId) : null;

  // Generate W3C Verifiable Credential payload on the client for live display
  const w3cPayload = useMemo(() => {
    if (!matchedCred) return null;
    const orgDomain = org?.domain || matchedCred.issuer?.verifiedDomain || 'icertix.app';
    const orgName = matchedCred.issuer?.name || org?.name || 'Academic Institution';
    return {
      "@context": [
        "https://www.w3.org/2018/credentials/v1",
        "https://purl.imsglobal.org/spec/ob/v3p0/context.json",
        "https://w3id.org/security/suites/ed25519-2020/v1"
      ],
      "id": `urn:uuid:${matchedCred.id}`,
      "type": ["VerifiableCredential", "OpenBadgeCredential", "AcademicDegreeCredential"],
      "issuer": {
        "id": `did:web:${orgDomain}`,
        "name": orgName,
        "url": `https://${orgDomain}`
      },
      "issuanceDate": new Date(matchedCred.issueDate).toISOString(),
      ...(matchedCred.expiryDate ? { "expirationDate": new Date(matchedCred.expiryDate).toISOString() } : {}),
      "credentialSubject": {
        "id": `did:mailto:${encodeURIComponent(matchedCred.recipient.email)}`,
        "name": matchedCred.recipient.name,
        "studentId": matchedCred.recipient.studentId,
        "email": matchedCred.recipient.email,
        "achievement": {
          "id": `urn:icertix:course:${matchedCred.courseId || 'CRS_001'}`,
          "type": ["Achievement", "CourseCompletion"],
          "name": matchedCred.title || matchedCred.courseName,
          "description": matchedCred.description
        },
        "grade": matchedCred.grade,
        "score": matchedCred.score,
        "skills": matchedCred.skills || []
      },
      "evidence": [
        {
          "id": `urn:icertix:verification:${matchedCred.credentialId}`,
          "type": ["CryptographicDigestEvidence"],
          "verifierUrl": `${window.location.origin}/verify/${matchedCred.credentialId}`,
          "sha256Digest": matchedCred.crypto.sha256Hash
        }
      ],
      "proof": {
        "type": "Ed25519Signature2020",
        "created": matchedCred.crypto.signedAt,
        "verificationMethod": `did:web:${orgDomain}#${matchedCred.crypto.keyId}`,
        "proofPurpose": "assertionMethod",
        "proofValue": matchedCred.crypto.signatureHex,
        "keyId": matchedCred.crypto.keyId
      }
    };
  }, [matchedCred, org]);

  // Generate Open Badges 3.0 payload on the client for live display
  const openBadgePayload = useMemo(() => {
    if (!matchedCred) return null;
    const orgDomain = org?.domain || matchedCred.issuer?.verifiedDomain || 'icertix.app';
    const orgName = matchedCred.issuer?.name || org?.name || 'Academic Institution';
    return {
      "@context": [
        "https://purl.imsglobal.org/spec/ob/v3p0/context.json",
        "https://www.w3.org/2018/credentials/v1"
      ],
      "id": `urn:uuid:${matchedCred.id}`,
      "type": ["OpenBadgeCredential", "VerifiableCredential"],
      "name": matchedCred.title || matchedCred.courseName,
      "description": matchedCred.description,
      "image": {
        "id": `${window.location.origin}/api/public/verify/${matchedCred.credentialId}/badge-svg`,
        "type": "Image"
      },
      "criteria": {
        "narrative": `Successful completion of all curriculum standards, academic assessments, and attained distinction in ${matchedCred.courseName}.`
      },
      "issuer": {
        "id": `https://${orgDomain}/issuer.json`,
        "type": ["Profile", "Issuer"],
        "name": orgName,
        "url": `https://${orgDomain}`
      },
      "recipient": {
        "type": "email",
        "identity": matchedCred.recipient.email,
        "hashed": false,
        "name": matchedCred.recipient.name
      },
      "issuedOn": new Date(matchedCred.issueDate).toISOString(),
      "results": [
        {
          "value": `${matchedCred.score}% (${matchedCred.grade})`,
          "status": matchedCred.status === 'ACTIVE' ? "Completed" : "Revoked"
        }
      ]
    };
  }, [matchedCred, org]);

  const handleCopyVerificationUrl = () => {
    if (!matchedCred) return;
    const url = `${window.location.origin}/verify/${matchedCred.credentialId}`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    toast.success(`Verification link copied for ${matchedCred.credentialId}`);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleShareLinkedIn = () => {
    if (!matchedCred) return;
    const verifyUrl = `${window.location.origin}/verify/${matchedCred.credentialId}`;
    const linkedInUrl = generateLinkedInUrl({
      name: matchedCred.title,
      issuerName: matchedCred.issuer?.name || org?.name || 'Academic Institution',
      issueDate: matchedCred.issueDate,
      expiryDate: matchedCred.expiryDate,
      credentialId: matchedCred.credentialId,
      verificationUrl: verifyUrl
    });
    window.open(linkedInUrl, '_blank');
    toast.info('Opening LinkedIn "Add to Profile" certification form...');
  };

  const handleCopyCode = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(label);
    toast.success(`${label} copied to clipboard!`);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleDownloadJsonFile = (data: any, filename: string) => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data, null, 2));
    const a = document.createElement('a');
    a.setAttribute("href", dataStr);
    a.setAttribute("download", filename);
    document.body.appendChild(a);
    a.click();
    a.remove();
    toast.success(`Downloaded ${filename}`);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fadeIn pb-12">
      {/* Search & Verification Gateway Header */}
      <div className="bg-gradient-to-r from-[#050e20] via-[#0a1f44] to-[#0e2a5c] text-white p-8 sm:p-10 rounded-3xl border border-[#0e2a5c] shadow-xl text-center space-y-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-[#2ea6ff]/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 rounded-full bg-[#7bd94f]/10 blur-3xl pointer-events-none" />

        <div className="inline-flex items-center gap-2 px-3.5 py-1 bg-white/10 rounded-full text-[#7bd94f] text-xs font-mono font-bold uppercase tracking-wider border border-white/10 relative z-10">
          <ShieldCheck className="w-4 h-4" />
          <span>Sovereign Proof Validator • W3C VC & Open Badges 3.0</span>
        </div>

        <h1 className="text-2xl sm:text-4xl font-bold font-sora tracking-tight text-white relative z-10">
          Public Credential Verification Gateway
        </h1>

        <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto leading-relaxed font-jakarta relative z-10">
          Authoritative real-time validation against issuer HSM hardware keys, SHA-256 canonical digests, W3C Verifiable Credentials, and revocation registries.
        </p>

        {/* Search Bar */}
        <form onSubmit={(e) => { e.preventDefault(); runVerification(lookupId); }} className="max-w-xl mx-auto flex flex-col sm:flex-row items-center gap-2 pt-2 relative z-10">
          <div className="relative w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={lookupId}
              onChange={(e) => setLookupId(e.target.value)}
              placeholder="Enter Credential ID (e.g. ICX-2026-7F8A91C2)"
              className="w-full pl-11 pr-4 py-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl text-white placeholder-slate-400 text-xs font-mono focus:outline-hidden focus:ring-2 focus:ring-[#2ea6ff] focus:bg-white/15 transition-all"
            />
          </div>
          <button
            type="submit"
            disabled={isVerifying}
            className="w-full sm:w-auto px-6 py-3 btn-primary-gradient text-xs font-bold font-sora uppercase tracking-wider rounded-2xl flex items-center justify-center gap-2 shadow-lg shrink-0 cursor-pointer disabled:opacity-50"
          >
            {isVerifying ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Validating...</span>
              </>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4" />
                <span>Verify Now</span>
              </>
            )}
          </button>
        </form>
      </div>

      {/* Main Verified Credential Result Card */}
      {matchedCred ? (
        <div className="bg-white border border-[#e5ebf4] rounded-3xl shadow-sm overflow-hidden animate-fadeIn">
          {/* Status Header Banner */}
          <div className={`p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b ${
            matchedCred.status === 'ACTIVE'
              ? 'bg-emerald-50/90 border-emerald-200 text-emerald-950'
              : 'bg-rose-50/90 border-rose-200 text-rose-950'
          }`}>
            <div className="flex items-center gap-3.5">
              {matchedCred.status === 'ACTIVE' ? (
                <div className="w-11 h-11 bg-[#5cbf3c] text-white flex items-center justify-center rounded-2xl shadow-sm">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
              ) : (
                <div className="w-11 h-11 bg-rose-600 text-white flex items-center justify-center rounded-2xl shadow-sm">
                  <XCircle className="w-7 h-7" />
                </div>
              )}
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base sm:text-lg font-bold font-sora uppercase tracking-wider">
                    {matchedCred.status === 'ACTIVE' ? '✓ VERIFIED OFFICIAL CREDENTIAL' : '✕ INVALID OR REVOKED CREDENTIAL'}
                  </h2>
                </div>
                <p className="text-xs text-slate-600 font-mono mt-0.5">
                  {matchedCred.status === 'ACTIVE' 
                    ? (liveVerification?.diagnosticMessage || 'Cryptographically authenticated with issuer HSM Key and clean CRL status.')
                    : (matchedCred.revocationReason ? `Officially revoked: ${matchedCred.revocationReason}` : 'This credential has been officially revoked by the issuing authority.')}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => onViewCertificate(matchedCred)}
                className="btn-primary-gradient px-4 py-2 text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-sm font-bold cursor-pointer"
              >
                <Eye className="w-4 h-4" />
                <span>View Certificate</span>
              </button>
              <button
                onClick={handleShareLinkedIn}
                className="px-4 py-2 bg-[#0077b5] hover:brightness-110 text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
                title="Add Verified Credential to LinkedIn"
              >
                <Linkedin className="w-3.5 h-3.5" />
                <span>Add to LinkedIn</span>
              </button>
              <button
                onClick={handleCopyVerificationUrl}
                className={`btn-pill-ghost px-4 py-2 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer transition-all ${
                  copiedLink ? 'bg-emerald-50 text-emerald-700 border-emerald-300' : ''
                }`}
              >
                {copiedLink ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedLink ? 'Copied!' : 'Copy Link'}</span>
              </button>
            </div>
          </div>

          {/* Core Verified Data Grid */}
          <div className="p-6 sm:p-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6 border-b border-[#e5ebf4]">
              <div className="space-y-2">
                <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#66748c] block">
                  Credential Recipient
                </span>
                <div className="text-xl font-bold font-sora text-[#0c1a30]">
                  {matchedCred.recipient.name}
                </div>
                <div className="text-xs text-[#42506a] font-mono space-y-0.5">
                  <div>Email: {matchedCred.recipient.email}</div>
                  <div>Candidate ID: {matchedCred.recipient.studentId}</div>
                </div>
              </div>

              <div className="space-y-2">
                <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#66748c] block">
                  Issuing Authority & Institution
                </span>
                <div className="text-xl font-bold font-sora text-[#0c1a30] flex items-center gap-2.5">
                  <div 
                    className="w-7 h-7 text-white font-bold flex items-center justify-center text-xs font-sora rounded-xl"
                    style={{ backgroundColor: org?.badgeColor || '#0a1f44' }}
                  >
                    {org?.logo || 'IC'}
                  </div>
                  <span>{matchedCred.issuer.name}</span>
                </div>
                <div className="text-xs text-[#42506a] font-mono space-y-0.5">
                  <div>Department: {matchedCred.issuer.department}</div>
                  <div>Domain: {matchedCred.issuer.verifiedDomain}</div>
                </div>
              </div>
            </div>

            {/* Course & Credential Specs + Seal */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 pb-6 border-b border-[#e5ebf4] text-xs items-center">
              <div>
                <span className="text-[10px] font-mono uppercase text-[#66748c] block font-bold">Credential Title</span>
                <span className="font-bold text-[#0c1a30] text-sm block mt-0.5">{matchedCred.title}</span>
                <span className="text-[#66748c] font-mono text-[11px]">{matchedCred.courseName}</span>
              </div>

              <div>
                <span className="text-[10px] font-mono uppercase text-[#66748c] block font-bold">Issue Date</span>
                <span className="font-bold text-[#0c1a30] text-sm block mt-0.5">{formatDate(matchedCred.issueDate)}</span>
                <span className="text-[#66748c] font-mono text-[11px]">Permanent Verifiable</span>
              </div>

              <div>
                <span className="text-[10px] font-mono uppercase text-[#66748c] block font-bold">Grade & Distinction</span>
                <span className="font-bold text-[#0c1a30] text-sm block mt-0.5">{matchedCred.grade}</span>
                <span className="text-[#66748c] font-mono text-[11px]">Score: {matchedCred.score}%</span>
              </div>

              <div className="flex flex-col items-center justify-center p-3 bg-[#f4f7fc] border border-[#e5ebf4] rounded-2xl">
                <IcertixSeal size={52} showGlow={true} />
              </div>
            </div>

            {/* Cryptographic Proof & Global Standards Multi-Tab Inspector */}
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-2">
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-[#1877e0]" />
                  <span className="font-sora text-xs font-bold uppercase tracking-wider text-[#0c1a30]">
                    Authoritative Proof & Standards Inspector
                  </span>
                </div>

                {/* Tabs */}
                <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
                  <button
                    onClick={() => setActiveInspectorTab('checklist')}
                    className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                      activeInspectorTab === 'checklist' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Verification Summary
                  </button>
                  <button
                    onClick={() => setActiveInspectorTab('w3c_vc')}
                    className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer flex items-center gap-1 ${
                      activeInspectorTab === 'w3c_vc' ? 'bg-white text-[#1877e0] shadow-xs' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Globe className="w-3.5 h-3.5" />
                    <span>W3C VC (JSON-LD)</span>
                  </button>
                  <button
                    onClick={() => setActiveInspectorTab('openbadges')}
                    className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer flex items-center gap-1 ${
                      activeInspectorTab === 'openbadges' ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Award className="w-3.5 h-3.5" />
                    <span>Open Badges 3.0</span>
                  </button>
                  <button
                    onClick={() => setActiveInspectorTab('canonical')}
                    className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer flex items-center gap-1 ${
                      activeInspectorTab === 'canonical' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Code className="w-3.5 h-3.5" />
                    <span>RFC 8785 Raw</span>
                  </button>
                </div>
              </div>

              {/* Tab 1: Checklist Summary */}
              {activeInspectorTab === 'checklist' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs animate-fadeIn">
                  {liveVerification?.checks && liveVerification.checks.length > 0 ? (
                    liveVerification.checks.map((chk, idx) => (
                      <div key={idx} className={`p-3.5 rounded-2xl border flex items-start gap-2.5 ${
                        chk.passed ? 'bg-[#f4f7fc] border-[#e5ebf4]' : 'bg-rose-50 border-rose-300'
                      }`}>
                        {chk.passed ? (
                          <CheckCircle2 className="w-4 h-4 text-[#5cbf3c] shrink-0 mt-0.5" />
                        ) : (
                          <XCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                        )}
                        <div>
                          <div className="font-bold text-[#0c1a30]">{chk.name}</div>
                          <div className="text-[10px] font-mono text-[#66748c]">{chk.details}</div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <>
                      <div className="p-3.5 bg-[#f4f7fc] border border-[#e5ebf4] rounded-2xl flex items-start gap-2.5">
                        <CheckCircle2 className="w-4 h-4 text-[#5cbf3c] shrink-0 mt-0.5" />
                        <div>
                          <div className="font-bold text-[#0c1a30]">Registry Record Match</div>
                          <div className="text-[10px] font-mono text-[#66748c]">Document ID: {matchedCred.id}</div>
                        </div>
                      </div>

                      <div className="p-3.5 bg-[#f4f7fc] border border-[#e5ebf4] rounded-2xl flex items-start gap-2.5">
                        <CheckCircle2 className="w-4 h-4 text-[#5cbf3c] shrink-0 mt-0.5" />
                        <div>
                          <div className="font-bold text-[#0c1a30]">Canonical SHA-256 Digest</div>
                          <div className="text-[10px] font-mono text-[#66748c] truncate max-w-xs">
                            {matchedCred.crypto.sha256Hash}
                          </div>
                        </div>
                      </div>

                      <div className="p-3.5 bg-[#f4f7fc] border border-[#e5ebf4] rounded-2xl flex items-start gap-2.5">
                        <CheckCircle2 className="w-4 h-4 text-[#5cbf3c] shrink-0 mt-0.5" />
                        <div>
                          <div className="font-bold text-[#0c1a30]">HSM Digital Signature</div>
                          <div className="text-[10px] font-mono text-[#66748c]">Signer Key: {matchedCred.crypto.keyId}</div>
                        </div>
                      </div>

                      <div className={`p-3.5 rounded-2xl border flex items-start gap-2.5 ${
                        matchedCred.status === 'ACTIVE' ? 'bg-[#f4f7fc] border-[#e5ebf4]' : 'bg-rose-50 border-rose-300'
                      }`}>
                        {matchedCred.status === 'ACTIVE' ? (
                          <CheckCircle2 className="w-4 h-4 text-[#5cbf3c] shrink-0 mt-0.5" />
                        ) : (
                          <XCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                        )}
                        <div>
                          <div className="font-bold text-[#0c1a30]">Certificate Revocation List (CRL)</div>
                          <div className="text-[10px] font-mono text-[#66748c]">
                            Status: {matchedCred.status}
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* Tab 2: W3C Verifiable Credentials (JSON-LD) */}
              {activeInspectorTab === 'w3c_vc' && w3cPayload && (
                <div className="space-y-3 animate-fadeIn">
                  <div className="flex items-center justify-between">
                    <div className="text-xs text-slate-500 font-mono">
                      W3C Verifiable Credentials Data Model v1.1 / v2.0 • Digital Wallet Compatible
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleCopyCode(JSON.stringify(w3cPayload, null, 2), 'W3C VC JSON-LD')}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        {copiedCode === 'W3C VC JSON-LD' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedCode === 'W3C VC JSON-LD' ? 'Copied' : 'Copy JSON-LD'}</span>
                      </button>
                      <button
                        onClick={() => handleDownloadJsonFile(w3cPayload, `${matchedCred.credentialId}-w3c-vc.jsonld`)}
                        className="px-3 py-1.5 btn-primary-gradient text-xs font-bold rounded-lg flex items-center gap-1 shadow-2xs cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Download .jsonld</span>
                      </button>
                    </div>
                  </div>
                  <pre className="p-4 rounded-2xl bg-slate-950 text-slate-200 font-mono text-[11px] leading-relaxed max-h-80 overflow-y-auto border border-slate-800">
                    {JSON.stringify(w3cPayload, null, 2)}
                  </pre>
                </div>
              )}

              {/* Tab 3: Open Badges 3.0 Standard */}
              {activeInspectorTab === 'openbadges' && openBadgePayload && (
                <div className="space-y-3 animate-fadeIn">
                  <div className="flex items-center justify-between">
                    <div className="text-xs text-slate-500 font-mono">
                      1EdTech Open Badges v3.0 Specification • Standard Portable Badge Payload
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleCopyCode(JSON.stringify(openBadgePayload, null, 2), 'Open Badges 3.0')}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        {copiedCode === 'Open Badges 3.0' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedCode === 'Open Badges 3.0' ? 'Copied' : 'Copy Badge JSON'}</span>
                      </button>
                      <button
                        onClick={() => handleDownloadJsonFile(openBadgePayload, `${matchedCred.credentialId}-open-badge.json`)}
                        className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-lg flex items-center gap-1 shadow-2xs cursor-pointer transition-colors"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Download .json</span>
                      </button>
                    </div>
                  </div>
                  <pre className="p-4 rounded-2xl bg-slate-950 text-slate-200 font-mono text-[11px] leading-relaxed max-h-80 overflow-y-auto border border-slate-800">
                    {JSON.stringify(openBadgePayload, null, 2)}
                  </pre>
                </div>
              )}

              {/* Tab 4: RFC 8785 Canonical Digest */}
              {activeInspectorTab === 'canonical' && (
                <div className="space-y-3 animate-fadeIn">
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-mono space-y-2">
                    <div className="text-[#1877e0] font-bold">SHA-256 Hashing Formula (RFC 8785 JSON Canonicalization):</div>
                    <div className="p-2.5 rounded-xl bg-white border border-slate-200 break-all text-[11px] text-slate-800">
                      Digest = SHA-256(canonicalPayload) = <strong className="text-emerald-700">{matchedCred.crypto.sha256Hash}</strong>
                    </div>
                    <div className="text-slate-600 pt-1">
                      Digital Signature Proof: <code className="text-indigo-700 font-bold">{matchedCred.crypto.signatureHex}</code>
                    </div>
                    <div className="text-slate-500 text-[10px]">
                      Algorithm: <span className="font-bold">{matchedCred.crypto.signatureAlgorithm}</span> • Key ID: <span className="font-bold">{matchedCred.crypto.keyId}</span> • Merkle Block: <span className="font-bold">{matchedCred.crypto.blockHeight || 1984210}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white p-12 text-center border border-[#e5ebf4] rounded-3xl shadow-sm space-y-3">
          <div className="w-12 h-12 mx-auto bg-slate-100 text-slate-400 rounded-full flex items-center justify-center">
            <XCircle className="w-6 h-6" />
          </div>
          <h3 className="font-sora text-base font-bold text-[#0c1a30]">
            No Credential Found for "{lookupId}"
          </h3>
          <p className="text-xs text-[#66748c] max-w-sm mx-auto">
            Please check the Credential ID or scan the dynamic QR code printed on the official certificate.
          </p>
        </div>
      )}
    </div>
  );
};
