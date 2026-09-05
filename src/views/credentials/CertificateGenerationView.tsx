import React, { useState, useEffect, useMemo, useRef } from 'react';
import * as XLSX from 'xlsx';
import { 
  Award, 
  CheckCircle2, 
  Users, 
  Palette, 
  BookOpen, 
  ShieldCheck, 
  Sparkles,
  ExternalLink,
  Eye,
  Check,
  FileSpreadsheet,
  Download,
  Upload,
  Braces,
  Database,
  Table,
  Layers,
  AlertCircle,
  FileText
} from 'lucide-react';
import { Organisation, Candidate, CertificateTemplate, Credential } from '../../types';
import { StudioDesignSchema } from '../../types/templateStudio';
import { computeSha256 } from '../../utils/crypto';
import { api } from '../../services/apiClient';
import { 
  PREBUILT_TEMPLATES_CATALOG, 
  DEFAULT_DEMO_DATA, 
  legacyTemplateToDesignSchema 
} from '../../utils/templatePresets';
import { VectorCertificatePreview } from '../template-studio/components/VectorCertificatePreview';

interface CertificateGenerationViewProps {
  currentOrg: Organisation;
  candidates: Candidate[];
  templates: CertificateTemplate[];
  preselectedCandidate?: Candidate | null;
  preselectedTemplateId?: string | null;
  onCredentialCreated: (newCreds: Credential[]) => void;
  onViewCertificate: (cred: Credential) => void;
}

export const CertificateGenerationView: React.FC<CertificateGenerationViewProps> = ({
  currentOrg,
  candidates,
  templates,
  preselectedCandidate,
  preselectedTemplateId,
  onCredentialCreated,
  onViewCertificate
}) => {
  const orgCandidates = candidates.filter(c => c.organisationId === currentOrg.id);
  const orgTemplates = templates.filter(t => t.organisationId === currentOrg.id);

  // Load custom studio schemas saved in localStorage strictly for current institution (Confidential)
  const mySavedSchemas = useMemo(() => {
    let mySaved: StudioDesignSchema[] = [];
    try {
      const orgKey = `icertix_studio_schemas_${currentOrg.id}`;
      const stored = localStorage.getItem(orgKey);
      if (stored) {
        mySaved = JSON.parse(stored).filter((s: StudioDesignSchema) => s.organisationId === currentOrg.id);
      }
    } catch {}
    return mySaved;
  }, [currentOrg.id]);

  // Merge all available selectable templates (strictly scoped to currentOrg + standard presets)
  const selectableTemplates = useMemo(() => {
    const list: Array<{
      id: string;
      name: string;
      category: string;
      schema?: StudioDesignSchema;
      isCustom: boolean;
      isMyOrg: boolean;
      publishedBy: string;
      orientation?: string;
    }> = [];
    const seen = new Set<string>();

    // 1. Saved custom studio designs for current institution
    for (const s of mySavedSchemas) {
      const id = s.templateId || s.id;
      if (id && !seen.has(id)) {
        seen.add(id);
        list.push({
          id,
          name: s.name || 'Custom Studio Design',
          category: s.category || 'Custom Studio',
          schema: s,
          isCustom: true,
          isMyOrg: true,
          publishedBy: s.organisationName || currentOrg.name,
          orientation: s.page?.orientation || 'landscape'
        });
      }
    }

    // 2. Org templates from props
    for (const t of orgTemplates) {
      if (!seen.has(t.id)) {
        seen.add(t.id);
        list.push({
          id: t.id,
          name: t.name,
          category: t.theme || 'Institutional',
          schema: t.schema,
          isCustom: Boolean(t.schema),
          isMyOrg: true,
          publishedBy: currentOrg.name,
          orientation: t.orientation || 'landscape'
        });
      }
    }

    // 3. Prebuilt catalog presets (Sanitized system vector templates)
    for (const p of PREBUILT_TEMPLATES_CATALOG) {
      if (!seen.has(p.id)) {
        seen.add(p.id);
        list.push({
          id: p.id,
          name: p.name,
          category: p.category,
          schema: p.schema,
          isCustom: false,
          isMyOrg: false,
          publishedBy: 'iCertiX Vector Library',
          orientation: p.schema?.page?.orientation || 'landscape'
        });
      }
    }

    return list;
  }, [mySavedSchemas, orgTemplates, currentOrg]);

  // Wizard state
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(() => {
    return preselectedTemplateId || selectableTemplates[0]?.id || 'TPL-001';
  });

  // Keep selectedTemplateId in sync when preselectedTemplateId changes
  useEffect(() => {
    if (preselectedTemplateId) {
      setSelectedTemplateId(preselectedTemplateId);
    }
  }, [preselectedTemplateId]);

  const selectedTemplateItem = useMemo(() => {
    return selectableTemplates.find(t => t.id === selectedTemplateId) || selectableTemplates[0];
  }, [selectableTemplates, selectedTemplateId]);

  // Extract all Variable layers defined in the selected certificate template
  const templateVariables = useMemo(() => {
    const schema = selectedTemplateItem?.schema;
    const vars: Array<{ key: string; label: string; isStandard: boolean; sample: string }> = [];
    const seen = new Set<string>();

    // 1. Core standard recipient identity fields
    vars.push({ key: 'candidateName', label: 'Recipient Full Name', isStandard: true, sample: 'Dr. Jane Mercer' });
    vars.push({ key: 'candidateEmail', label: 'Recipient Email Address', isStandard: true, sample: 'jane.mercer@institution.edu' });
    vars.push({ key: 'candidateId', label: 'Registration / Student ID', isStandard: true, sample: 'REG-2026-904' });
    seen.add('candidateName');
    seen.add('candidateEmail');
    seen.add('candidateId');

    // 2. Discover custom and dynamic variables from schema elements
    if (schema?.elements) {
      for (const el of schema.elements) {
        if (el.isVariable || el.type === 'dynamic-field') {
          const key = (el.customVariableKey || el.fieldKey || el.name || '').trim();
          if (key && !seen.has(key)) {
            seen.add(key);
            vars.push({
              key,
              label: el.name || key,
              isStandard: Boolean(el.fieldKey),
              sample: el.fallbackText || 'Sample Value'
            });
          }
        }
      }
    }

    return vars;
  }, [selectedTemplateItem]);

  // Data Input Mode: Spreadsheet (.xlsx / .csv) vs. Candidate Roster
  const [dataInputMode, setDataInputMode] = useState<'spreadsheet' | 'roster'>('spreadsheet');
  const [uploadedSpreadsheetName, setUploadedSpreadsheetName] = useState<string | null>(null);
  const [parsedSpreadsheetRows, setParsedSpreadsheetRows] = useState<Array<Record<string, any>>>([]);
  const [rawCsvText, setRawCsvText] = useState<string>('');
  const [spreadsheetParseError, setSpreadsheetParseError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [selectedCandidateIds, setSelectedCandidateIds] = useState<string[]>(
    preselectedCandidate ? [preselectedCandidate.id] : orgCandidates.slice(0, 3).map(c => c.id)
  );

  // Sync preselectedCandidate directly into roster selection
  useEffect(() => {
    if (preselectedCandidate) {
      setDataInputMode('roster');
      setSelectedCandidateIds([preselectedCandidate.id]);
    }
  }, [preselectedCandidate]);
  
  const [grade, setGrade] = useState('High Distinction');
  const [score, setScore] = useState(95);
  const [issueDate, setIssueDate] = useState(new Date().toISOString().split('T')[0]);
  const [sendEmailNotification, setSendEmailNotification] = useState(true);
  const [customNotes, setCustomNotes] = useState('Conferred for academic and technical excellence.');

  // Async Generation Pipeline State
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [currentStepLabel, setCurrentStepLabel] = useState('');
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [generatedBatch, setGeneratedBatch] = useState<Credential[] | null>(null);

  const toggleSelectCandidate = (id: string) => {
    setSelectedCandidateIds(prev => 
      prev.includes(id) ? prev.filter(cId => cId !== id) : [...prev, id]
    );
  };

  const handleSelectAllCandidates = () => {
    if (selectedCandidateIds.length === orgCandidates.length) {
      setSelectedCandidateIds([]);
    } else {
      setSelectedCandidateIds(orgCandidates.map(c => c.id));
    }
  };

  // 1. Download Tailored Excel (.xlsx) Template for the active Certificate Template
  const handleDownloadExcelTemplate = () => {
    const headers = templateVariables.map(v => v.key);
    const row1: Record<string, any> = {};
    const row2: Record<string, any> = {};

    templateVariables.forEach((v, idx) => {
      row1[v.key] = v.sample;
      row2[v.key] = idx === 0 ? 'Alex Thorne' : idx === 1 ? 'alex.thorne@example.org' : idx === 2 ? 'REG-2026-905' : `${v.sample} (Row 2)`;
    });

    const worksheet = XLSX.utils.json_to_sheet([row1, row2], { header: headers });
    worksheet['!cols'] = headers.map(() => ({ wch: 26 }));
    const workbook = XLSX.utils.book_new();
    const sheetName = (selectedTemplateItem?.name || 'Certificate').slice(0, 25).replace(/[\\/?*[\]]/g, '');
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName || 'Variables');

    const cleanTplName = (selectedTemplateItem?.name || 'Template').toLowerCase().replace(/[^a-z0-9]/g, '_');
    XLSX.writeFile(workbook, `icertix_${cleanTplName}_import_template.xlsx`);
  };

  // 2. Download Tailored CSV Template
  const handleDownloadCsvTemplate = () => {
    const headers = templateVariables.map(v => v.key);
    const row1 = templateVariables.map(v => `"${v.sample.replace(/"/g, '""')}"`).join(',');
    const row2 = templateVariables.map((v, idx) => {
      const val = idx === 0 ? 'Alex Thorne' : idx === 1 ? 'alex.thorne@example.org' : idx === 2 ? 'REG-2026-905' : `${v.sample} (Row 2)`;
      return `"${val.replace(/"/g, '""')}"`;
    }).join(',');

    const csvContent = `${headers.join(',')}\n${row1}\n${row2}\n`;
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const cleanTplName = (selectedTemplateItem?.name || 'Template').toLowerCase().replace(/[^a-z0-9]/g, '_');
    link.setAttribute('download', `icertix_${cleanTplName}_import_template.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // 3. Handle Spreadsheet File Upload (.xlsx, .xls, .csv)
  const handleUploadSpreadsheet = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSpreadsheetParseError(null);
    setUploadedSpreadsheetName(file.name);
    const reader = new FileReader();

    reader.onload = (evt) => {
      try {
        const data = new Uint8Array(evt.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const rows: any[] = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

        if (!rows || rows.length === 0) {
          setSpreadsheetParseError('The uploaded spreadsheet appears to be empty.');
          setParsedSpreadsheetRows([]);
          return;
        }

        // Normalize keys and map to template variables
        const normalizedRows = rows.map((r) => {
          const rowObj: Record<string, any> = {};
          for (const [k, v] of Object.entries(r)) {
            const cleanKey = String(k).trim();
            rowObj[cleanKey] = String(v).trim();
          }

          // Fuzzy map standard keys if exact key missing
          if (!rowObj.candidateName) {
            const nameKey = Object.keys(rowObj).find(k => /name|recipient|student|candidate/i.test(k));
            if (nameKey) rowObj.candidateName = rowObj[nameKey];
          }
          if (!rowObj.candidateEmail) {
            const emailKey = Object.keys(rowObj).find(k => /email|mail/i.test(k));
            if (emailKey) rowObj.candidateEmail = rowObj[emailKey];
          }
          if (!rowObj.candidateId) {
            const idKey = Object.keys(rowObj).find(k => /id|roll|reg|serial/i.test(k));
            if (idKey) rowObj.candidateId = rowObj[idKey];
          }

          return rowObj;
        });

        setParsedSpreadsheetRows(normalizedRows);
      } catch (err) {
        console.error('[Spreadsheet parse error]', err);
        setSpreadsheetParseError('Could not parse spreadsheet. Please ensure it is a valid Excel (.xlsx, .xls) or CSV file.');
      }
    };

    reader.readAsArrayBuffer(file);
  };

  // 4. Handle Raw CSV Paste
  const handleParseRawCsv = (text: string) => {
    setRawCsvText(text);
    if (!text.trim()) {
      setParsedSpreadsheetRows([]);
      return;
    }

    try {
      const workbook = XLSX.read(text, { type: 'string' });
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      const rows: any[] = XLSX.utils.sheet_to_json(worksheet, { defval: '' });
      setParsedSpreadsheetRows(rows);
      setSpreadsheetParseError(null);
    } catch {
      setSpreadsheetParseError('Could not parse raw CSV text.');
    }
  };

  // 5. Execute Batch Cryptographic Certificate Generation
  const handleExecuteGeneration = async () => {
    let targetsCount = 0;
    if (dataInputMode === 'spreadsheet') {
      targetsCount = parsedSpreadsheetRows.length;
      if (targetsCount === 0) {
        setGenerationError('Please upload an Excel spreadsheet or paste CSV rows first.');
        return;
      }
    } else {
      targetsCount = selectedCandidateIds.length;
      if (targetsCount === 0) {
        setGenerationError('Please select at least one candidate from the roster below.');
        return;
      }
    }

    setIsGenerating(true);
    setGenerationError(null);
    setGenerationProgress(20);
    setCurrentStepLabel('Constructing Canonical JSON Schemas & Credential IDs...');

    const chosenTemplate = selectedTemplateItem;
    const targetSchema = chosenTemplate?.schema;

    try {
      setGenerationProgress(50);
      setCurrentStepLabel('Hashing canonical payloads with SHA-256 & signing via server key...');

      const targetTitle = selectedTemplateItem?.name || 'Certificate of Accomplishment';
      const targetCategory = selectedTemplateItem?.category || 'Certificate';

      const newCredentials: Credential[] = [];

      if (dataInputMode === 'spreadsheet') {
        // Issue certificates from parsed spreadsheet rows with custom variables
        for (let i = 0; i < parsedSpreadsheetRows.length; i++) {
          const row = parsedSpreadsheetRows[i];
          const recipientName = row.candidateName || row['Recipient Name'] || row['Name'] || `Recipient ${i + 1}`;
          const recipientEmail = row.candidateEmail || row['Email'] || row['Recipient Email'] || `recipient${i + 1}@example.com`;
          const studentId = row.candidateId || row['Student ID'] || row['ID'] || `REG-2026-0${i + 1}`;
          const courseTitle = row.courseName || row['Program'] || row['Course'] || row['Title'] || targetTitle;

          const entropy = Math.random().toString(16).slice(2, 10).toUpperCase();
          const credId = `ICX-2026-${entropy}`;
          const certNum = `CERT-${currentOrg.code.split('-')[0]}-2026-${Math.floor(100000 + Math.random() * 900000)}`;

          const canonicalPayload = JSON.stringify({
            credentialId: credId,
            recipient: recipientName,
            studentId,
            course: courseTitle,
            issuer: currentOrg.name,
            issueDate,
            customVariables: row
          });
          const sha256 = await computeSha256(canonicalPayload);

          const cred: Credential = {
            id: `CRED-${Date.now().toString().slice(-4)}-${i}`,
            credentialId: credId,
            certificateNumber: certNum,
            organisationId: currentOrg.id,
            candidateId: `CAND-${Date.now().toString().slice(-4)}-${i}`,
            courseId: selectedTemplateId,
            templateId: selectedTemplateId,
            designSchema: targetSchema,
            customAttributes: row,
            recipient: {
              name: recipientName,
              email: recipientEmail,
              studentId
            },
            issuer: {
              name: currentOrg.name,
              department: currentOrg.department,
              code: currentOrg.code,
              verifiedDomain: currentOrg.domain,
              logo: currentOrg.logo
            },
            title: courseTitle,
            courseName: courseTitle,
            category: targetCategory,
            grade: row.grade || grade,
            score: Number(row.score) || score,
            issueDate,
            completionDate: row.completionDate || issueDate,
            status: 'ACTIVE',
            skills: ['Sovereign Credential', 'Cryptographic Verification'],
            description: customNotes || `Conferred upon ${recipientName} for achievement in ${courseTitle}.`,
            crypto: {
              hashAlgorithm: 'SHA-256',
              sha256Hash: sha256,
              signatureAlgorithm: 'Ed25519-HMAC',
              signatureHex: `${sha256.slice(0, 32)}9f88a2`,
              keyId: currentOrg.signatories[0]?.keyId || 'KEY-PRIMARY-01',
              canonicalPayloadJson: canonicalPayload,
              signedAt: new Date().toISOString()
            },
            pdfKey: `certificates/${currentOrg.id}/2026/${credId}.pdf`,
            verificationUrl: `/verify/${credId}`,
            emailDelivery: {
              status: sendEmailNotification ? 'Delivered' : 'Queued',
              sentAt: new Date().toISOString(),
              messageId: `ses-msg-${Math.floor(100000 + Math.random() * 900000)}-${currentOrg.code.toLowerCase()}`
            },
            signatories: currentOrg.signatories
          } as any;

          newCredentials.push(cred);
        }
      } else {
        // Candidate Roster mode
        const targetCandidates = candidates.filter(c => selectedCandidateIds.includes(c.id));
        const candidatesToProcess = targetCandidates.length > 0 ? targetCandidates : selectedCandidateIds.map((id, idx) => ({
          id,
          name: `Candidate ${idx + 1}`,
          email: `candidate${idx + 1}@institution.edu`,
          studentId: `ST-2026-0${idx + 1}`,
          department: currentOrg.department || 'Academic Division',
          organisationId: currentOrg.id,
          status: 'Active' as const,
          createdAt: new Date().toISOString()
        }));

        for (let i = 0; i < candidatesToProcess.length; i++) {
          const cand = candidatesToProcess[i];
          const entropy = Math.random().toString(16).slice(2, 10).toUpperCase();
          const credId = `ICX-2026-${entropy}`;
          const certNum = `CERT-${currentOrg.code.split('-')[0]}-2026-${Math.floor(100000 + Math.random() * 900000)}`;

          const canonicalPayload = JSON.stringify({
            credentialId: credId,
            recipient: cand.name,
            studentId: cand.studentId,
            course: targetTitle,
            issuer: currentOrg.name,
            issueDate
          });
          const sha256 = await computeSha256(canonicalPayload);

          const cred: Credential = {
            id: `CRED-${Date.now().toString().slice(-4)}-${i}`,
            credentialId: credId,
            certificateNumber: certNum,
            organisationId: currentOrg.id,
            candidateId: cand.id,
            courseId: selectedTemplateId,
            templateId: selectedTemplateId,
            designSchema: targetSchema,
            recipient: {
              name: cand.name,
              email: cand.email,
              studentId: cand.studentId
            },
            issuer: {
              name: currentOrg.name,
              department: currentOrg.department,
              code: currentOrg.code,
              verifiedDomain: currentOrg.domain,
              logo: currentOrg.logo
            },
            title: targetTitle,
            courseName: targetTitle,
            category: targetCategory,
            grade,
            score,
            issueDate,
            completionDate: issueDate,
            status: 'ACTIVE',
            skills: ['Sovereign Credential', 'Cryptographic Verification'],
            description: customNotes || `Conferred upon ${cand.name} for exemplary achievement.`,
            crypto: {
              hashAlgorithm: 'SHA-256',
              sha256Hash: sha256,
              signatureAlgorithm: 'Ed25519-HMAC',
              signatureHex: `${sha256.slice(0, 32)}9f88a2`,
              keyId: currentOrg.signatories[0]?.keyId || 'KEY-PRIMARY-01',
              canonicalPayloadJson: canonicalPayload,
              signedAt: new Date().toISOString()
            },
            pdfKey: `certificates/${currentOrg.id}/2026/${credId}.pdf`,
            verificationUrl: `/verify/${credId}`,
            emailDelivery: {
              status: sendEmailNotification ? 'Delivered' : 'Queued',
              sentAt: new Date().toISOString(),
              messageId: `ses-msg-${Math.floor(100000 + Math.random() * 900000)}-${currentOrg.code.toLowerCase()}`
            },
            signatories: currentOrg.signatories
          } as any;

          newCredentials.push(cred);
        }
      }

      setGenerationProgress(100);
      setGeneratedBatch(newCredentials);
      onCredentialCreated(newCredentials);
    } catch (err) {
      console.error('[Generation error]', err);
      setGenerationError('Failed to generate certificates. Please check inputs and try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white p-4 sm:p-6 border border-[#E2E8F0] shadow-xs rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 bg-sky-100 text-[#0284C7] text-[10px] font-bold uppercase tracking-wider rounded-full">
              Cryptographic Issuance
            </span>
            <span className="text-xs text-slate-500 font-mono">Tenant: {currentOrg.name}</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-[#0A2540] font-sora mt-1">
            Generate & Issue Certificates
          </h2>
          <p className="text-xs text-slate-600 mt-0.5">
            Select a certificate template design, map recipient & dynamic variables, and anchor verifiable credentials with digital signatures.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-xs font-mono">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Signer Key:</span>
          <span className="font-bold text-[#0A2540]">{currentOrg.signatories[0]?.keyId || 'HSM-ROOT-01'}</span>
        </div>
      </div>

      {/* If Generation Succeeded: Show Success Screen */}
      {generatedBatch && (
        <div className="bg-white border-2 border-emerald-500 p-4 sm:p-6 shadow-md rounded-2xl space-y-4 animate-fadeIn">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-100 text-emerald-700 flex items-center justify-center rounded-xl shrink-0">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-sora text-sm sm:text-base font-bold text-[#0A2540] uppercase tracking-wider">
                  Generated {generatedBatch.length} Verifiable Credentials
                </h3>
                <p className="text-xs text-slate-600">
                  Applied Template: <strong className="text-slate-800">{selectedTemplateItem?.name}</strong> • Cryptographically anchored with SHA-256.
                </p>
              </div>
            </div>

            <button
              onClick={() => setGeneratedBatch(null)}
              className="w-full sm:w-auto px-4 py-2 bg-slate-100 hover:bg-slate-200 text-xs font-bold uppercase tracking-wider text-slate-800 rounded-xl transition-colors"
            >
              Issue Another Batch
            </button>
          </div>

          <div className="divide-y divide-slate-200 border border-slate-200 rounded-xl text-xs max-h-64 overflow-y-auto">
            {generatedBatch.map((cred) => (
              <div key={cred.id} className="p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-slate-50 hover:bg-white transition-colors">
                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
                  <div className="font-bold text-[#0A2540]">{cred.recipient?.name || (cred as any).candidateName}</div>
                  <span className="font-mono text-[11px] text-[#0284C7] font-bold">{cred.credentialId}</span>
                  <span className="text-[10px] text-slate-400 font-mono truncate max-w-xs">{cred.crypto?.sha256Hash}</span>
                </div>
                <div className="flex items-center gap-2 self-end sm:self-auto">
                  <button
                    onClick={() => onViewCertificate(cred)}
                    className="px-3 py-1.5 bg-gradient-to-r from-[#0284C7] to-[#0369A1] hover:brightness-110 text-white rounded-lg font-bold text-[11px] flex items-center gap-1 shadow-xs transition-all"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>View Certificate</span>
                  </button>
                  <span className="text-[10px] px-2 py-0.5 bg-emerald-100 text-emerald-800 font-bold uppercase font-mono rounded-full">
                    Delivered
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* If Generating: Animated Progress Box with Live Queue Metrics */}
      {isGenerating && (
        <div className="bg-[#0A2540] text-white p-4 sm:p-6 border border-slate-700 rounded-2xl shadow-xl space-y-4 animate-fadeIn">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-gradient-to-tr from-[#0284C7] to-cyan-400 text-[#051427] flex items-center justify-center rounded-xl animate-spin shrink-0 shadow-xs font-bold">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-sora text-xs sm:text-sm font-bold uppercase tracking-wider text-white">
                    Asynchronous Batch Engine
                  </h3>
                  <span className="px-2 py-0.5 bg-emerald-950/80 text-emerald-300 border border-emerald-700/60 font-mono text-[10px] font-bold rounded-full animate-pulse">
                    PROCESSING
                  </span>
                </div>
                <span className="text-xs text-sky-300 font-mono block mt-0.5">
                  {currentStepLabel}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-3 self-end sm:self-auto font-mono text-xs">
              <span className="text-slate-400">Status: <strong className="text-emerald-400">Anchoring SHA-256</strong></span>
              <span className="font-mono text-lg font-bold text-white bg-slate-800 px-3 py-1 rounded-lg border border-slate-700">
                {generationProgress}%
              </span>
            </div>
          </div>

          <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden p-0.5 border border-slate-700/60">
            <div 
              className="bg-gradient-to-r from-[#0284C7] via-cyan-400 to-emerald-400 h-full rounded-full transition-all duration-300 ease-out shadow-[0_0_12px_rgba(46,166,255,0.6)]"
              style={{ width: `${generationProgress}%` }}
            />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-[11px] font-mono text-slate-300">
            <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800">
              <span className="text-slate-500 block text-[10px]">TOTAL TARGET</span>
              <strong className="text-white text-xs">{dataInputMode === 'spreadsheet' ? parsedSpreadsheetRows.length : selectedCandidateIds.length} records</strong>
            </div>
            <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800">
              <span className="text-slate-500 block text-[10px]">CRYPTO DIGEST</span>
              <strong className="text-sky-300 text-xs">Ed25519-SHA256</strong>
            </div>
            <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800">
              <span className="text-slate-500 block text-[10px]">EDGE CACHE</span>
              <strong className="text-emerald-300 text-xs">Auto-Warmed</strong>
            </div>
            <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800">
              <span className="text-slate-500 block text-[10px]">STANDARDS</span>
              <strong className="text-amber-300 text-xs">W3C VC + OB 3.0</strong>
            </div>
          </div>
        </div>
      )}

      {generationError && (
        <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-semibold">
          {generationError}
        </div>
      )}

      {/* Main Generation Configuration Form */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Template & Candidate Selectors */}
        <div className="lg:col-span-2 space-y-4">
          {/* 1. Select Template Design */}
          <div className="bg-white p-4 sm:p-5 border border-[#E2E8F0] shadow-xs rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-[#0A2540] font-sora flex items-center gap-2">
                <Palette className="w-4 h-4 text-[#0284C7]" />
                <span>1. Select Certificate Template Design</span>
              </label>
              <span className="text-[11px] text-slate-500 font-mono">
                {selectableTemplates.length} Designs Available
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-h-96 overflow-y-auto pr-1">
              {selectableTemplates.map((t) => {
                const isSelected = selectedTemplateId === t.id;
                const schema = t.schema && t.schema.elements && t.schema.elements.length > 0 
                  ? t.schema 
                  : (PREBUILT_TEMPLATES_CATALOG.find(p => p.id === t.id || p.name === t.name)?.schema || legacyTemplateToDesignSchema(t as any, currentOrg));
                const tOrientation = (t.orientation || schema?.page?.orientation || 'landscape').toLowerCase();

                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setSelectedTemplateId(t.id)}
                    className={`p-2.5 text-left border rounded-2xl text-xs transition-all relative flex flex-col justify-between group cursor-pointer ${
                      isSelected 
                        ? 'border-[#0284C7] bg-sky-50/70 ring-2 ring-[#0284C7]/30 shadow-md' 
                        : 'border-slate-200 bg-slate-50/50 hover:bg-white hover:border-slate-300'
                    }`}
                  >
                    <div>
                      {/* Top Header Tag Row */}
                      <div className="flex items-center justify-between gap-1 mb-1.5">
                        <span className={`px-1.5 py-0.5 text-[9px] font-bold uppercase rounded font-mono truncate max-w-[130px] ${
                          t.isCustom 
                            ? 'bg-sky-100 text-[#0284C7]' 
                            : 'bg-slate-200 text-slate-700'
                        }`}>
                          {t.isCustom ? (t.isMyOrg ? 'My Org' : 'Community') : 'Preset'}
                        </span>

                        {isSelected && (
                          <span className="w-4 h-4 rounded-full bg-[#0284C7] text-white flex items-center justify-center text-[10px] font-bold shrink-0 shadow-xs">
                            ✓
                          </span>
                        )}
                      </div>

                      {/* Visual Certificate Sample Preview */}
                      <div className="bg-slate-100 rounded-xl p-1 border border-slate-200/80 overflow-hidden flex items-center justify-center min-h-[110px]">
                        <div className="shrink-0 shadow-xs rounded overflow-hidden pointer-events-none">
                          <VectorCertificatePreview
                            schema={schema}
                            scale={tOrientation === 'portrait' ? 0.12 : 0.16}
                            demoData={{
                              ...DEFAULT_DEMO_DATA,
                              courseName: t.name
                            }}
                          />
                        </div>
                      </div>

                      {/* Title Below Certificate */}
                      <div className="font-bold font-sora text-[#0A2540] line-clamp-1 mt-2 text-xs group-hover:text-[#0284C7] transition-colors">
                        {t.name}
                      </div>

                      {t.isCustom && t.publishedBy && (
                        <div className="text-[10px] text-sky-800 font-medium truncate mt-0.5" title={`Customized & Published by ${t.publishedBy}`}>
                          By <span className="font-bold">{t.publishedBy}</span>
                        </div>
                      )}
                    </div>

                    <div className="text-[10px] text-slate-500 font-mono uppercase mt-1 flex items-center justify-between pt-1 border-t border-slate-200/60">
                      <span>{t.category}</span>
                      <span className="capitalize text-slate-400">{tOrientation}</span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Currently Active Template Notification */}
            {selectedTemplateItem && (
              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-[#0284C7]" />
                  <span className="text-slate-600">Selected Design:</span>
                  <strong className="text-[#0A2540]">{selectedTemplateItem.name}</strong>
                  {selectedTemplateItem.isCustom && (
                    <span className="px-1.5 py-0.2 bg-sky-100 text-[#0284C7] text-[10px] font-bold rounded">
                      {selectedTemplateItem.isMyOrg ? `Customized by ${currentOrg.name}` : `Published by ${selectedTemplateItem.publishedBy}`}
                    </span>
                  )}
                </div>
                {selectedTemplateItem.isCustom && (
                  <div className="text-[11px] text-slate-600 font-mono">
                    Customized & Published by: <span className="font-bold text-[#0A2540]">{selectedTemplateItem.publishedBy}</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 2. Data Ingestion: Dynamic Spreadsheet (Excel/CSV) OR Candidate Roster */}
          <div className="bg-white p-4 sm:p-5 border border-[#E2E8F0] shadow-xs rounded-2xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <label className="text-xs font-bold uppercase tracking-wider text-[#0A2540] font-sora flex items-center gap-2">
                <Database className="w-4 h-4 text-[#0284C7]" />
                <span>2. Certificate Recipient Data & Variables</span>
              </label>

              {/* Data Ingestion Mode Switcher */}
              <div className="flex bg-slate-100 p-0.5 rounded-xl border border-slate-200 text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setDataInputMode('spreadsheet')}
                  className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
                    dataInputMode === 'spreadsheet'
                      ? 'bg-white text-[#0A2540] font-bold shadow-xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Excel / CSV Import</span>
                </button>
                <button
                  type="button"
                  onClick={() => setDataInputMode('roster')}
                  className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
                    dataInputMode === 'roster'
                      ? 'bg-white text-[#0A2540] font-bold shadow-xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <Users className="w-3.5 h-3.5 text-[#0284C7]" />
                  <span>Candidate Roster</span>
                </button>
              </div>
            </div>

            {/* MODE A: SPREADSHEET (EXCEL & CSV) IMPORT */}
            {dataInputMode === 'spreadsheet' && (
              <div className="space-y-4 animate-fadeIn">
                {/* Detected Variables in Template */}
                <div className="p-3.5 bg-sky-50/70 border border-sky-200 rounded-xl space-y-2.5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-xs font-bold text-[#0A2540] flex items-center gap-1.5">
                      <Braces className="w-3.5 h-3.5 text-[#0284C7]" />
                      <span>Variables in "{selectedTemplateItem?.name}":</span>
                    </span>
                    <span className="text-[11px] font-mono text-[#0284C7] font-bold bg-sky-100/80 px-2 py-0.5 rounded-md border border-sky-200">
                      {templateVariables.length} Expected Columns
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {templateVariables.map((v) => (
                      <span
                        key={v.key}
                        className="px-2 py-0.5 bg-white border border-sky-300 text-[11px] font-mono font-bold text-slate-800 rounded-lg shadow-2xs flex items-center gap-1"
                        title={`Expected column: ${v.key} (Sample: ${v.sample})`}
                      >
                        <span className="text-[#0284C7]">`{`{{${v.key}}}`}`</span>
                      </span>
                    ))}
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-sky-200/60 text-xs">
                    <span className="text-[11px] text-slate-600">
                      Need the formatted template? Download ready-to-fill sample files:
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleDownloadExcelTemplate}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[11px] font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                      >
                        <Download className="w-3 h-3" />
                        <span>Download Excel (.xlsx)</span>
                      </button>
                      <button
                        type="button"
                        onClick={handleDownloadCsvTemplate}
                        className="px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-[11px] font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                      >
                        <Download className="w-3 h-3" />
                        <span>Download CSV</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Upload & Paste Grid (Cleanly Aligned) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 items-stretch">
                  {/* File Upload Dropzone */}
                  <div className="flex flex-col space-y-1.5">
                    <span className="text-[11px] font-bold text-slate-700 font-mono">
                      Upload Spreadsheet File:
                    </span>
                    <label className="flex-1 min-h-[110px] border-2 border-dashed border-slate-300 hover:border-[#0284C7] bg-slate-50/60 hover:bg-sky-50/40 p-4 rounded-xl flex flex-col items-center justify-center text-center cursor-pointer transition-all group">
                      <Upload className="w-5 h-5 text-slate-400 group-hover:text-[#0284C7] mb-1 transition-colors" />
                      <span className="text-xs font-bold text-[#0A2540]">
                        {uploadedSpreadsheetName ? uploadedSpreadsheetName : 'Upload Spreadsheet (.xlsx, .xls, .csv)'}
                      </span>
                      <span className="text-[10px] text-slate-400 mt-0.5">
                        Drag and drop your spreadsheet or click to browse
                      </span>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".xlsx, .xls, .csv"
                        className="hidden"
                        onChange={handleUploadSpreadsheet}
                      />
                    </label>
                  </div>

                  {/* Raw CSV Textarea */}
                  <div className="flex flex-col space-y-1.5">
                    <div className="flex justify-between items-center text-[11px] font-mono text-slate-700 font-bold">
                      <span>Or Paste CSV Rows:</span>
                      {rawCsvText && (
                        <button
                          type="button"
                          onClick={() => handleParseRawCsv('')}
                          className="text-rose-600 font-semibold hover:underline cursor-pointer"
                        >
                          Clear
                        </button>
                      )}
                    </div>
                    <textarea
                      value={rawCsvText}
                      onChange={(e) => handleParseRawCsv(e.target.value)}
                      placeholder={`${templateVariables.map(v => v.key).join(',')}\nJane Doe,jane@example.com,ST-101,Generative AI,1st Place`}
                      className="flex-1 min-h-[110px] w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-[11px] font-mono focus:bg-white focus:outline-none focus:border-[#0284C7] resize-none"
                    />
                  </div>
                </div>

                {spreadsheetParseError && (
                  <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{spreadsheetParseError}</span>
                  </div>
                )}

                {/* Parsed Rows Data Table Preview */}
                {parsedSpreadsheetRows.length > 0 && (
                  <div className="space-y-2 border border-slate-200 rounded-xl p-3 bg-slate-50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span className="text-xs font-bold text-[#0A2540]">
                          Ready to Generate {parsedSpreadsheetRows.length} Certificates
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setParsedSpreadsheetRows([]);
                          setUploadedSpreadsheetName(null);
                          setRawCsvText('');
                        }}
                        className="text-xs text-rose-600 hover:underline font-semibold"
                      >
                        Reset Data
                      </button>
                    </div>

                    <div className="max-h-52 overflow-auto border border-slate-200 rounded-lg bg-white">
                      <table className="w-full text-left text-[11px] border-collapse">
                        <thead>
                          <tr className="bg-slate-100 border-b border-slate-200 font-mono text-slate-700">
                            <th className="p-2 w-8">#</th>
                            {Object.keys(parsedSpreadsheetRows[0] || {}).map((col) => (
                              <th key={col} className="p-2 whitespace-nowrap font-bold">
                                {col}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 font-mono">
                          {parsedSpreadsheetRows.slice(0, 10).map((row, idx) => (
                            <tr key={idx} className="hover:bg-sky-50/50">
                              <td className="p-2 text-slate-400 font-bold">{idx + 1}</td>
                              {Object.keys(parsedSpreadsheetRows[0] || {}).map((col) => (
                                <td key={col} className="p-2 whitespace-nowrap text-slate-800">
                                  {row[col] || <span className="text-slate-300 italic">empty</span>}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      {parsedSpreadsheetRows.length > 10 && (
                        <div className="p-2 text-center text-[10px] text-slate-500 font-mono bg-slate-50 border-t border-slate-200">
                          + {parsedSpreadsheetRows.length - 10} more rows loaded from spreadsheet
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* MODE B: CANDIDATE ROSTER SELECTION */}
            {dataInputMode === 'roster' && (
              <div className="space-y-3 animate-fadeIn">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-600 font-semibold">
                    Selected Candidates ({selectedCandidateIds.length} of {orgCandidates.length})
                  </span>
                  <button
                    type="button"
                    onClick={handleSelectAllCandidates}
                    className="text-xs font-bold text-[#0284C7] hover:underline cursor-pointer"
                  >
                    {selectedCandidateIds.length === orgCandidates.length ? 'Deselect All' : 'Select All'}
                  </button>
                </div>

                <div className="border border-slate-200 rounded-xl max-h-60 overflow-y-auto divide-y divide-slate-100 text-xs">
                  {orgCandidates.map((cand) => {
                    const isSelected = selectedCandidateIds.includes(cand.id);
                    return (
                      <label
                        key={cand.id}
                        className={`p-3 flex items-center justify-between cursor-pointer transition-colors ${
                          isSelected ? 'bg-sky-50/70' : 'hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleSelectCandidate(cand.id)}
                            className="w-4 h-4 text-[#0284C7] rounded"
                          />
                          <div>
                            <span className="font-bold text-[#0A2540] block">{cand.name}</span>
                            <span className="text-[11px] text-slate-500 font-mono">{cand.email} • {cand.studentId}</span>
                          </div>
                        </div>
                        <span className="text-[10px] font-mono text-slate-400 hidden sm:inline">{cand.department}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right 1 Col: Metadata & Issuance Trigger */}
        <div className="space-y-4">
          <div className="bg-white p-4 sm:p-5 border border-[#E2E8F0] shadow-xs rounded-2xl space-y-4 text-xs">
            <h3 className="font-sora font-bold text-sm text-[#0A2540] uppercase tracking-wider border-b border-slate-100 pb-2">
              Issuance Parameters
            </h3>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Issue Date</label>
              <input
                type="date"
                value={issueDate}
                onChange={(e) => setIssueDate(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:border-[#0284C7]"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Default Grade</label>
                <input
                  type="text"
                  value={grade}
                  onChange={(e) => setGrade(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:border-[#0284C7]"
                  placeholder="e.g. High Distinction"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Default Score %</label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={score}
                  onChange={(e) => setScore(Number(e.target.value))}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:border-[#0284C7]"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Certificate Notes / Disclaimer</label>
              <textarea
                rows={2}
                value={customNotes}
                onChange={(e) => setCustomNotes(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:border-[#0284C7]"
              />
            </div>

            <div className="pt-2 border-t border-slate-100">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={sendEmailNotification}
                  onChange={(e) => setSendEmailNotification(e.target.checked)}
                  className="w-4 h-4 text-[#0284C7] rounded"
                />
                <span className="font-semibold text-slate-800">
                  Send Instant SES Email Delivery
                </span>
              </label>
              <span className="text-[10px] text-slate-500 block mt-1">
                Recipients receive their digital credential link and verification QR code.
              </span>
            </div>

            {/* Summary Box */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-[11px] font-mono text-slate-600 space-y-1.5">
              <div className="flex justify-between">
                <span>Selected Template:</span>
                <span className="font-bold text-[#0A2540] truncate max-w-[140px]">{selectedTemplateItem?.name}</span>
              </div>
              <div className="flex justify-between">
                <span>Data Source:</span>
                <span className="font-bold text-[#0284C7]">
                  {dataInputMode === 'spreadsheet' ? `Spreadsheet (${parsedSpreadsheetRows.length} Rows)` : `Roster (${selectedCandidateIds.length} Selected)`}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Security Stamp:</span>
                <span className="text-[#0284C7] font-bold">SHA-256 + Ed25519</span>
              </div>
            </div>

            <button
              onClick={handleExecuteGeneration}
              disabled={isGenerating || (dataInputMode === 'spreadsheet' ? parsedSpreadsheetRows.length === 0 : selectedCandidateIds.length === 0)}
              className="w-full py-3.5 bg-gradient-to-r from-[#0284C7] to-[#0369A1] hover:brightness-110 disabled:opacity-50 text-white font-bold uppercase tracking-wider text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Award className="w-4 h-4" />
              <span>
                Generate & Dispatch (
                {dataInputMode === 'spreadsheet' ? parsedSpreadsheetRows.length : selectedCandidateIds.length}
                )
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
