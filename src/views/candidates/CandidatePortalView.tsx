import React, { useState, useMemo } from 'react';
import { 
  Award, 
  Share2, 
  ShieldCheck, 
  Linkedin, 
  Twitter, 
  Calendar,
  Check,
  Copy,
  ExternalLink,
  Eye,
  Lock,
  Sparkles
} from 'lucide-react';
import { Candidate, Credential, Organisation, AuthUser } from '../../types';
import { formatDate } from '../../utils/crypto';
import { generateLinkedInUrl } from '../../utils/linkedinUrl';
import { IcertixSeal, useToast } from '../../components/common';

interface CandidatePortalViewProps {
  currentUser?: AuthUser | null;
  candidates: Candidate[];
  credentials: Credential[];
  organisations: Organisation[];
  onViewCertificate: (cred: Credential) => void;
  onVerifyCredential: (cred: Credential) => void;
}

export const CandidatePortalView: React.FC<CandidatePortalViewProps> = ({
  currentUser,
  candidates,
  credentials,
  organisations,
  onViewCertificate,
  onVerifyCredential
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const toast = useToast();

  // Strictly resolve the active candidate based on authenticated session
  const currentCandidate = useMemo<Candidate>(() => {
    if (currentUser) {
      const match = candidates.find(
        c => (currentUser.candidateId && c.id === currentUser.candidateId) ||
             (c.email && currentUser.email && c.email.toLowerCase() === currentUser.email.toLowerCase())
      );
      if (match) return match;
      
      // Fallback constructed from currentUser
      return {
        id: currentUser.candidateId || `CAN_${currentUser.id}`,
        name: currentUser.name || 'Verified Candidate',
        email: currentUser.email,
        studentId: currentUser.title?.includes('Candidate ID:') 
          ? currentUser.title.replace('Candidate ID: ', '').trim()
          : currentUser.title?.includes('Student ID:')
          ? currentUser.title.replace('Student ID: ', '').trim()
          : (currentUser.title || 'CAND-2026-001'),
        department: 'Academic Division',
        organisationId: currentUser.organisationId || 'ORG_001',
        status: 'Active',
        createdAt: new Date().toISOString()
      };
    }
    return candidates[0] || {
      id: 'CAN_DEFAULT',
      name: 'Candidate Portfolio',
      email: 'candidate@institution.edu',
      studentId: 'CAND-2026-001',
      department: 'Academic Division',
      organisationId: 'ORG_001',
      status: 'Active',
      createdAt: new Date().toISOString()
    };
  }, [currentUser, candidates]);

  // Filter credentials strictly belonging to this authenticated candidate
  const candidateCreds = useMemo(() => {
    const candEmail = currentCandidate?.email?.toLowerCase();
    const candId = currentCandidate?.id;
    return credentials.filter(c => {
      const recEmail = (c.recipient?.email || (c as any).candidateEmail)?.toLowerCase();
      const recId = c.candidateId;
      return (candId && recId === candId) || (candEmail && recEmail && recEmail === candEmail);
    });
  }, [credentials, currentCandidate]);

  const handleCopyLink = (cred: Credential) => {
    const url = `${window.location.origin}/verify/${cred.credentialId}`;
    navigator.clipboard.writeText(url);
    setCopiedId(cred.id);
    toast.success(`Verification URL copied: ${cred.credentialId}`);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleShareLinkedIn = (cred: Credential) => {
    const org = organisations.find(o => o.id === cred.organisationId);
    const verifyUrl = `${window.location.origin}/verify/${cred.credentialId}`;
    const linkedInUrl = generateLinkedInUrl({
      name: cred.title,
      issuerName: org?.name || cred.issuer?.name || 'iCertiX Authorized Institution',
      issueDate: cred.issueDate,
      expiryDate: cred.expiryDate,
      credentialId: cred.credentialId,
      verificationUrl: verifyUrl
    });
    window.open(linkedInUrl, '_blank');
    toast.info('Opening LinkedIn "Add to Profile" certification form...');
  };

  const handleShareTwitter = (cred: Credential) => {
    const verifyUrl = `${window.location.origin}/verify/${cred.credentialId}`;
    const text = `I just earned my verified digital credential "${cred.title}" from ${cred.issuer.name}! Authenticated via @iCertiX:`;
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(verifyUrl)}`;
    window.open(twitterUrl, '_blank');
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Candidate Persona Header */}
      <div className="icx-card p-6 sm:p-8 rounded-3xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 btn-primary-gradient flex items-center justify-center text-lg font-sora font-bold rounded-2xl shadow-md text-white">
            {currentCandidate?.name ? currentCandidate.name.slice(0, 2).toUpperCase() : 'ST'}
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl sm:text-2xl font-bold font-sora tracking-tight text-[#0c1a30]">
                {currentCandidate?.name || 'Candidate Portfolio'}
              </h1>
              <span className="px-3 py-0.5 bg-sky-100 text-[#1877e0] text-[10px] font-mono font-bold uppercase rounded-full">
                Verified Candidate
              </span>
            </div>
            <div className="text-xs text-[#66748c] font-mono mt-1">
              {currentCandidate?.email} • Candidate ID: <strong className="text-[#0c1a30]">{currentCandidate?.studentId}</strong> • {currentCandidate?.department}
            </div>
          </div>
        </div>

        {/* Security & Authentication Identity Badge */}
        <div className="flex items-center gap-2.5 bg-emerald-50 border border-emerald-200 px-4 py-2 rounded-2xl">
          <ShieldCheck className="w-5 h-5 text-[#5cbf3c] shrink-0" />
          <div>
            <span className="text-[11px] font-mono font-bold text-emerald-900 block leading-tight">
              Sovereign Account Authenticated
            </span>
            <span className="text-[10px] text-emerald-700 font-mono">
              Role: Candidate Earner
            </span>
          </div>
        </div>
      </div>

      {/* Candidate Badges & Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="icx-card p-5 flex items-center gap-3.5">
          <div className="w-11 h-11 bg-sky-50 text-[#1877e0] rounded-2xl flex items-center justify-center">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold font-sora text-[#0c1a30]">{candidateCreds.length}</div>
            <span className="text-[11px] font-mono text-[#66748c] uppercase font-bold">Earned Credentials</span>
          </div>
        </div>

        <div className="icx-card p-5 flex items-center gap-3.5">
          <div className="w-11 h-11 bg-emerald-50 text-[#5cbf3c] rounded-2xl flex items-center justify-center">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold font-sora text-[#0c1a30]">
              {candidateCreds.filter(c => c.status === 'ACTIVE').length} Active
            </div>
            <span className="text-[11px] font-mono text-[#66748c] uppercase font-bold">Cryptographically Verified</span>
          </div>
        </div>

        <div className="icx-card p-5 flex items-center gap-3.5">
          <div className="w-11 h-11 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center">
            <Share2 className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold font-sora text-[#0c1a30]">Public</div>
            <span className="text-[11px] font-mono text-[#66748c] uppercase font-bold">Shareable & Verifiable</span>
          </div>
        </div>
      </div>

      {/* Credentials List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-sora text-sm font-bold uppercase tracking-wider text-[#0c1a30]">
            My Digital Certificates & Badges ({candidateCreds.length})
          </h2>
          <span className="text-xs text-[#66748c] font-mono">
            Directly issued by authorized institutions
          </span>
        </div>

        {candidateCreds.length === 0 ? (
          <div className="icx-card p-10 text-center space-y-3">
            <div className="w-12 h-12 bg-sky-50 text-[#1877e0] rounded-2xl flex items-center justify-center mx-auto">
              <Award className="w-6 h-6" />
            </div>
            <h3 className="font-sora font-bold text-base text-[#0c1a30]">No Credentials Issued Yet</h3>
            <p className="text-xs text-[#66748c] max-w-md mx-auto">
              When your enrolled institution issues certificates to your Candidate ID (<strong>{currentCandidate?.studentId}</strong>), they will appear here automatically.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {candidateCreds.map((cred) => {
              const org = organisations.find(o => o.id === cred.organisationId);
              return (
                <div 
                  key={cred.id} 
                  className="icx-card p-5 sm:p-6 space-y-4 hover:shadow-md transition-shadow relative overflow-hidden flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-10 h-10 rounded-xl text-white font-bold flex items-center justify-center text-sm font-sora shadow-2xs shrink-0"
                          style={{ backgroundColor: org?.badgeColor || '#0A2540' }}
                        >
                          {cred.issuer.logo || 'IC'}
                        </div>
                        <div>
                          <h3 className="font-bold text-xs text-[#0c1a30]">{cred.issuer.name}</h3>
                          <span className="text-[11px] text-[#66748c] font-mono">{cred.issuer.department}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <IcertixSeal size={32} showGlow={false} />
                        <span className={`px-2 py-0.5 text-[10px] font-mono font-bold uppercase rounded-full ${
                          cred.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                        }`}>
                          {cred.status}
                        </span>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-sora font-bold text-sm sm:text-base text-[#0c1a30] leading-snug">
                        {cred.title}
                      </h4>
                      <p className="text-xs text-[#66748c] line-clamp-2 mt-1 font-jakarta">
                        {cred.description}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] font-mono text-[#66748c] pt-2 border-t border-[#e5ebf4]">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        Issued: {formatDate(cred.issueDate)}
                      </span>
                      <span>ID: <strong className="text-[#0c1a30]">{cred.credentialId}</strong></span>
                      {cred.grade && (
                        <span className="text-[#1877e0] font-semibold">{cred.grade}</span>
                      )}
                    </div>

                    {/* Skills Tags */}
                    {cred.skills && cred.skills.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {cred.skills.map((skill, idx) => (
                          <span 
                            key={idx}
                            className="px-2.5 py-0.5 bg-[#f4f7fc] text-[#42506a] border border-[#e5ebf4] text-[10px] rounded-full font-medium"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Actions Toolbar */}
                  <div className="pt-3 border-t border-[#e5ebf4] flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onViewCertificate(cred)}
                        className="btn-primary-gradient px-3.5 py-1.5 text-xs font-bold font-sora flex items-center gap-1.5 shadow-xs"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View Certificate</span>
                      </button>

                      <button
                        onClick={() => onVerifyCredential(cred)}
                        className="btn-pill-ghost px-3 py-1.5 text-xs font-semibold flex items-center gap-1.5"
                      >
                        <ShieldCheck className="w-3.5 h-3.5 text-[#5cbf3c]" />
                        <span>Verify</span>
                      </button>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleShareLinkedIn(cred)}
                        className="p-1.5 bg-[#0077b5] text-white rounded-lg hover:brightness-110 transition-all shadow-2xs"
                        title="Add Certificate to LinkedIn Profile"
                      >
                        <Linkedin className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => handleShareTwitter(cred)}
                        className="p-1.5 bg-[#1da1f2] text-white rounded-lg hover:brightness-110 transition-all shadow-2xs"
                        title="Share Certificate on Twitter / X"
                      >
                        <Twitter className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => handleCopyLink(cred)}
                        className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg flex items-center gap-1 transition-colors"
                        title="Copy Public Verifier Link"
                      >
                        {copiedId === cred.id ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-[#5cbf3c]" />
                            <span className="text-[11px] text-[#5cbf3c]">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span className="text-[11px]">Copy Link</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
