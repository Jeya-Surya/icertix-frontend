import React, { useState, useEffect, useMemo } from 'react';
import { 
  X, 
  Printer, 
  Download, 
  ShieldCheck, 
  Copy, 
  Check, 
  ZoomIn,
  ZoomOut
} from 'lucide-react';
import { Credential, Organisation, CertificateTemplate } from '../../types';
import { StudioDesignSchema, DemoCandidateData } from '../../types/templateStudio';
import { VectorCertificatePreview } from '../../views/template-studio/components/VectorCertificatePreview';
import { 
  PREBUILT_TEMPLATES_CATALOG, 
  legacyTemplateToDesignSchema, 
  createBlankDesignSchema 
} from '../../utils/templatePresets';

interface CertificateModalProps {
  credential: Credential | null;
  organisation?: Organisation;
  templates?: CertificateTemplate[];
  onClose: () => void;
  onOpenVerifier: (cred: Credential) => void;
}

export const CertificateModal: React.FC<CertificateModalProps> = ({
  credential,
  organisation,
  templates = [],
  onClose,
  onOpenVerifier
}) => {
  const [copiedLink, setCopiedLink] = useState(false);
  const [zoomScale, setZoomScale] = useState(0.85);

  // Auto-calculate appropriate scale based on window width
  useEffect(() => {
    const updateScale = () => {
      const w = window.innerWidth;
      if (w < 640) setZoomScale(0.36);
      else if (w < 768) setZoomScale(0.55);
      else if (w < 1024) setZoomScale(0.72);
      else setZoomScale(0.85);
    };
    updateScale();
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, []);

  // Resolve the exact customized StudioDesignSchema for this credential
  const resolvedSchema = useMemo<StudioDesignSchema>(() => {
    if (!credential) {
      return PREBUILT_TEMPLATES_CATALOG[0].schema;
    }

    // 1. Direct embedded schema on credential
    if ((credential as any).designSchema && (credential as any).designSchema.elements?.length > 0) {
      return (credential as any).designSchema;
    }
    if ((credential as any).schema && (credential as any).schema.elements?.length > 0) {
      return (credential as any).schema;
    }

    // 2. Check saved Studio Schemas in localStorage for tenant
    try {
      const orgId = credential.organisationId || organisation?.id || 'ORG_001';
      const stored = localStorage.getItem(`icertix_studio_schemas_${orgId}`) || localStorage.getItem('icertix_studio_schemas_v2');
      if (stored) {
        const schemas: StudioDesignSchema[] = JSON.parse(stored);
        const match = schemas.find(
          s => s.id === credential.templateId || s.templateId === credential.templateId
        );
        if (match && match.elements && match.elements.length > 0) {
          return match;
        }
      }
    } catch {}

    // 3. Check templates list passed from App.tsx
    const matchedTemplate = templates.find(t => t.id === credential.templateId);
    if (matchedTemplate) {
      if (matchedTemplate.schema && matchedTemplate.schema.elements) {
        return matchedTemplate.schema;
      }
      return legacyTemplateToDesignSchema(matchedTemplate);
    }

    // 4. Check Prebuilt Template Catalog
    const prebuilt = PREBUILT_TEMPLATES_CATALOG.find(
      p => p.id === credential.templateId || p.schema.templateId === credential.templateId || p.name.toLowerCase() === credential.templateId.toLowerCase()
    );
    if (prebuilt) {
      return prebuilt.schema;
    }

    // 5. Fallback to default catalog schema
    return PREBUILT_TEMPLATES_CATALOG[0]?.schema || createBlankDesignSchema(organisation as any || {
      id: 'ORG_INIT',
      name: credential.issuer?.name || 'Academic Institution',
      code: 'ICX',
      domain: 'institution.edu',
      department: 'Academic Division',
      logo: 'IC',
      badgeColor: '#0A2540',
      plan: 'Enterprise',
      certificateQuota: { used: 0, total: 100 },
      signatories: []
    });
  }, [credential, templates, organisation]);

  // Construct dynamic candidate data for rendering vector tokens
  const candidateData = useMemo<DemoCandidateData>(() => {
    if (!credential) {
      return {
        candidateName: 'Recipient Name',
        candidateId: 'ST-0000',
        candidateEmail: 'candidate@institution.edu',
        courseName: 'Course Title',
        courseCode: 'CRS-001',
        department: 'Academic Department',
        duration: 'Mastery Program',
        certificateNumber: 'CERT-000000',
        credentialId: 'ICX-2026-000000',
        issueDate: new Date().toISOString().split('T')[0],
        completionDate: new Date().toISOString().split('T')[0],
        expiryDate: 'Lifetime Verifiable',
        score: '95%',
        grade: 'High Distinction',
        orgName: organisation?.name || 'Academic Institution',
        orgDepartment: organisation?.department || 'Academic Division',
        orgDomain: organisation?.domain || 'institution.edu',
        orgLogo: organisation?.logo || 'IC',
        signatory1Name: organisation?.signatories[0]?.name || 'Dean & Registrar',
        signatory1Role: organisation?.signatories[0]?.role || 'Academic Authority',
        signatory1Key: organisation?.signatories[0]?.keyId || 'KEY-PRIMARY-01',
        signatory2Name: organisation?.signatories[1]?.name || '',
        signatory2Role: organisation?.signatories[1]?.role || '',
        verificationQr: `${window.location.origin}/verify/ICX-DEMO`,
        verificationUrl: `${window.location.origin}/verify/ICX-DEMO`,
        hashDigest: '0x0000000000000000000000000000000000000000'
      };
    }

    const recipientName = credential.recipient?.name || (credential as any).candidateName || 'Rahul Kumar';
    const recipientId = credential.recipient?.studentId || (credential as any).studentId || 'ST-2026';
    const recipientEmail = credential.recipient?.email || (credential as any).candidateEmail || '';
    const courseTitle = credential.courseName || credential.title || 'Executive Mastery Program';
    const certNum = credential.certificateNumber || `CERT-${credential.credentialId}`;
    const credId = credential.credentialId || credential.id;
    const orgName = credential.issuer?.name || organisation?.name || 'Academic Institution';
    const orgDept = credential.issuer?.department || organisation?.department || 'Academic Division';
    const orgDom = credential.issuer?.verifiedDomain || organisation?.domain || 'institution.edu';
    const orgLogo = credential.issuer?.logo || organisation?.logo || 'IC';
    const sig1 = credential.signatories?.[0] || organisation?.signatories?.[0];
    const sig2 = credential.signatories?.[1] || organisation?.signatories?.[1];

    return {
      ...(credential.customAttributes || {}),
      ...((credential as any).customVariables || {}),
      ...((credential as any).variables || {}),
      ...((credential as any).metadata || {}),
      candidateName: recipientName,
      candidateId: recipientId,
      candidateEmail: recipientEmail,
      courseName: courseTitle,
      courseCode: credential.category || 'ACAD-2026',
      department: orgDept,
      duration: 'Academic Certification',
      certificateNumber: certNum,
      credentialId: credId,
      issueDate: credential.issueDate,
      completionDate: credential.completionDate || credential.issueDate,
      expiryDate: 'Lifetime Verifiable',
      score: credential.score ? `${credential.score}%` : '95%',
      grade: credential.grade ? `Awarded with ${credential.grade}` : 'High Honors (Distinction)',
      orgName: orgName,
      orgDepartment: orgDept,
      orgDomain: orgDom,
      orgLogo: orgLogo,
      signatory1Name: sig1?.name || 'Dr. Jennifer Widom',
      signatory1Role: sig1?.role || 'Dean & Issuing Authority',
      signatory1Key: sig1?.keyId || credential.crypto?.keyId || 'KEY-PRIMARY-01',
      signatory2Name: sig2?.name || '',
      signatory2Role: sig2?.role || '',
      verificationQr: `${window.location.origin}/verify/${credId}`,
      verificationUrl: `${window.location.origin}/verify/${credId}`,
      hashDigest: credential.crypto?.sha256Hash || '0x' + credId
    };
  }, [credential, organisation]);

  if (!credential) return null;

  const handleCopyLink = () => {
    const url = `${window.location.origin}/verify/${credential.credentialId}`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadJson = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(credential, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `${credential.credentialId}-proof.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto animate-fadeIn">
      <div className="bg-white max-w-5xl w-full border border-slate-300 shadow-2xl rounded-2xl overflow-hidden flex flex-col my-auto max-h-[96vh]">
        {/* Top Modal Action Toolbar */}
        <div className="bg-[#0A2540] text-white px-3 sm:px-6 py-2.5 sm:py-3 flex items-center justify-between gap-2 sm:gap-3 border-b border-[#0F3559] shrink-0 overflow-x-auto scrollbar-none">
          <div className="flex items-center gap-2 text-xs font-mono shrink-0">
            <span className="text-emerald-400 font-bold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block animate-pulse"></span>
              VERIFIED CREDENTIAL
            </span>
            <span className="text-slate-500">•</span>
            <span className="text-sky-300 font-semibold">{credential.credentialId}</span>
            <span className="text-slate-500 hidden sm:inline">•</span>
            <span className="text-slate-300 text-[11px] hidden sm:inline truncate max-w-xs">{resolvedSchema.name}</span>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Zoom Controls */}
            <div className="hidden sm:flex items-center bg-slate-800 rounded-lg p-0.5 border border-slate-700">
              <button
                onClick={() => setZoomScale(prev => Math.max(0.3, prev - 0.1))}
                className="p-1 hover:bg-slate-700 text-slate-300 rounded transition-colors cursor-pointer"
                title="Zoom Out"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span className="text-[11px] font-mono px-1.5 text-slate-300">
                {Math.round(zoomScale * 100)}%
              </span>
              <button
                onClick={() => setZoomScale(prev => Math.min(1.2, prev + 0.1))}
                className="p-1 hover:bg-slate-700 text-slate-300 rounded transition-colors cursor-pointer"
                title="Zoom In"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
            </div>

            <button
              onClick={handlePrint}
              className="px-2 sm:px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-semibold rounded-lg flex items-center gap-1 border border-slate-700 transition-colors cursor-pointer"
              title="Print Vector Certificate"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Print</span>
            </button>

            <button
              onClick={handleDownloadJson}
              className="px-2 sm:px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-semibold rounded-lg flex items-center gap-1 border border-slate-700 transition-colors cursor-pointer"
              title="Download JSON-LD Proof"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">JSON Proof</span>
            </button>

            <button
              onClick={handleCopyLink}
              className="px-2 sm:px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-semibold rounded-lg flex items-center gap-1 border border-slate-700 transition-colors cursor-pointer"
              title="Copy Public Link"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">{copiedLink ? 'Copied' : 'Copy Link'}</span>
            </button>

            <button
              onClick={() => onOpenVerifier(credential)}
              className="px-2.5 sm:px-3 py-1.5 bg-gradient-to-r from-[#0284C7] to-[#0369A1] hover:brightness-110 text-white rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-1 shadow-xs transition-all cursor-pointer"
              title="Open in Public Verifier"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
              <span className="hidden sm:inline">Verify Online</span>
              <span className="sm:hidden">Verify</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors ml-1 cursor-pointer"
              title="Close Certificate"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Parchment Area with Custom Rendered Vector Canvas */}
        <div className="p-4 sm:p-8 bg-slate-100/80 overflow-auto flex items-center justify-center min-h-[500px]">
          <div className="flex items-center justify-center p-2 rounded-xl">
            <VectorCertificatePreview
              schema={resolvedSchema}
              demoData={candidateData}
              scale={zoomScale}
              previewMode={true}
            />
          </div>
        </div>

        {/* Bottom Metadata & Security Bar */}
        <div className="bg-slate-50 border-t border-slate-200 px-5 py-2.5 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 font-mono gap-2 shrink-0">
          <div className="flex items-center gap-2 truncate">
            <span className="font-bold text-slate-700">SHA-256 Digest:</span>
            <span className="truncate max-w-xs sm:max-w-md text-slate-600">{candidateData.hashDigest}</span>
          </div>
          <div className="flex items-center gap-3">
            <span>Template: <strong className="text-slate-800">{resolvedSchema.name}</strong></span>
            <span>Orientation: <strong className="text-slate-800 capitalize">{resolvedSchema.page.orientation}</strong></span>
          </div>
        </div>
      </div>
    </div>
  );
};
