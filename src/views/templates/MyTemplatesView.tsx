import React, { useState, useMemo } from 'react';
import {
  Layout,
  Plus,
  Search,
  Award,
  Users,
  Eye,
  Edit3,
  Trash2,
  Copy,
  Zap,
  FileSpreadsheet,
  Download,
  Upload,
  CheckCircle2,
  Clock,
  Sparkles,
  Layers,
  ChevronRight,
  ShieldCheck,
  X,
  FileCheck2,
  Filter,
  ExternalLink,
  Braces,
  LayoutGrid,
  List,
  Compass
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { Organisation, Candidate, CertificateTemplate, Credential } from '../../types';
import { StudioDesignSchema } from '../../types/templateStudio';
import { VectorCertificatePreview } from '../template-studio/components/VectorCertificatePreview';
import { 
  PREBUILT_TEMPLATES_CATALOG, 
  DEFAULT_DEMO_DATA, 
  createBlankDesignSchema,
  legacyTemplateToDesignSchema
} from '../../utils/templatePresets';

interface MyTemplatesViewProps {
  currentOrg: Organisation;
  templates: CertificateTemplate[];
  credentials: Credential[];
  candidates: Candidate[];
  onNavigateToDesigner: (templateId?: string, isNew?: boolean) => void;
  onViewCertificate: (credential: Credential) => void;
  onCredentialCreated: (newCreds: Credential[]) => void;
  onDeleteTemplate?: (templateId: string) => void;
  onDuplicateTemplate?: (template: CertificateTemplate) => void;
}

export const MyTemplatesView: React.FC<MyTemplatesViewProps> = ({
  currentOrg,
  templates,
  credentials,
  candidates,
  onNavigateToDesigner,
  onViewCertificate,
  onCredentialCreated,
  onDeleteTemplate,
  onDuplicateTemplate
}) => {
  // Search, Filter & View State (Default to 'grid' view primarily as requested)
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<string>('All');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [selectedTemplateForRoster, setSelectedTemplateForRoster] = useState<CertificateTemplate | null>(null);
  const [selectedTemplateForIssue, setSelectedTemplateForIssue] = useState<CertificateTemplate | null>(null);

  // Quick Issuance Modal State
  const [issueMode, setIssueMode] = useState<'single' | 'batch'>('single');
  const [singleInputs, setSingleInputs] = useState<Record<string, string>>({});
  const [selectedCandidateId, setSelectedCandidateId] = useState<string>('');
  const [batchRows, setBatchRows] = useState<Record<string, any>[]>([]);
  const [batchFileName, setBatchFileName] = useState<string>('');
  const [isIssuing, setIsIssuing] = useState(false);
  const [issueSuccessCount, setIssueSuccessCount] = useState<number | null>(null);

  // Filter categories list
  const filterOptions = ['All', 'Landscape', 'Portrait', 'With Candidates', 'Official'];

  // Helper to resolve schema
  const resolveSchema = (t: CertificateTemplate): StudioDesignSchema => {
    // 1. Check custom saved schemas in localStorage strictly for current institution
    try {
      const orgKey = `icertix_studio_schemas_${currentOrg.id}`;
      const stored = localStorage.getItem(orgKey);
      if (stored) {
        const parsed: StudioDesignSchema[] = JSON.parse(stored);
        const match = parsed.find(s => (s.id === t.id || s.templateId === t.id) && s.organisationId === currentOrg.id);
        if (match && match.elements && match.elements.length > 0) {
          return match;
        }
      }
    } catch {}

    if (t.schema && t.schema.elements && t.schema.elements.length > 0) {
      return t.schema as StudioDesignSchema;
    }
    return legacyTemplateToDesignSchema(t, currentOrg);
  };

  // Extract all variables from a template schema
  const extractVariables = (t: CertificateTemplate) => {
    const schema = resolveSchema(t);
    const vars: Array<{ key: string; label: string; sample: string }> = [];
    const seen = new Set<string>();

    schema.elements.forEach(el => {
      if (el.isVariable || el.type === 'dynamic-field') {
        const key = (el.customVariableKey || el.fieldKey || el.name || 'custom_field').trim();
        if (!seen.has(key)) {
          seen.add(key);
          vars.push({
            key,
            label: el.name || key,
            sample: el.fallbackText || el.text || `Sample ${key}`
          });
        }
      }
    });

    if (vars.length === 0) {
      vars.push(
        { key: 'candidateName', label: 'Candidate Name', sample: 'Rahul Kumar' },
        { key: 'candidateEmail', label: 'Candidate Email', sample: 'rahul.kumar@stanford.edu' },
        { key: 'courseName', label: 'Program / Course', sample: 'Executive AI Strategy' },
        { key: 'grantDate', label: 'Grant Date', sample: 'March 03, 2026' }
      );
    }

    return vars;
  };

  // Accurate filter and search logic (Strictly scoped to currentOrg templates)
  const filteredTemplates = useMemo(() => {
    const orgTemplates = templates.filter(t => t.organisationId === currentOrg.id);
    const q = searchQuery.toLowerCase().trim();
    return orgTemplates.filter(t => {
      const schema = resolveSchema(t);
      const tOrientation = (t.orientation || schema?.page?.orientation || 'landscape').toLowerCase();
      const vars = extractVariables(t);
      const varKeys = vars.map(v => v.key.toLowerCase()).join(' ');
      const varLabels = vars.map(v => v.label.toLowerCase()).join(' ');
      
      const candidateHolders = credentials.filter(c => (c.templateId === t.id || c.title === t.name) && c.organisationId === currentOrg.id).length;

      const matchesSearch = !q || (
        t.name.toLowerCase().includes(q) ||
        t.id.toLowerCase().includes(q) ||
        (t.theme && t.theme.toLowerCase().includes(q)) ||
        varKeys.includes(q) ||
        varLabels.includes(q)
      );

      let matchesFilter = true;
      if (selectedFilter === 'Landscape') {
        matchesFilter = tOrientation.includes('landscape');
      } else if (selectedFilter === 'Portrait') {
        matchesFilter = tOrientation.includes('portrait');
      } else if (selectedFilter === 'With Candidates') {
        matchesFilter = candidateHolders > 0;
      } else if (selectedFilter === 'Official') {
        matchesFilter = !!t.isDefault;
      }

      return matchesSearch && matchesFilter;
    });
  }, [templates, currentOrg.id, searchQuery, selectedFilter, credentials]);

  // Overall aggregate stats
  const totalIssuedCount = credentials.length;
  const totalUniqueCandidates = new Set(credentials.map(c => c.recipient?.email || c.candidateId)).size;
  const totalVariablesDetected = useMemo(() => {
    let count = 0;
    templates.forEach(t => {
      count += extractVariables(t).length;
    });
    return count;
  }, [templates]);

  // Open Quick Issuance Modal
  const handleOpenQuickIssue = (template: CertificateTemplate) => {
    setSelectedTemplateForIssue(template);
    const vars = extractVariables(template);
    const initialValues: Record<string, string> = {};
    vars.forEach(v => {
      initialValues[v.key] = '';
    });
    setSingleInputs(initialValues);
    setSelectedCandidateId('');
    setBatchRows([]);
    setBatchFileName('');
    setIssueSuccessCount(null);
  };

  // Populate Single Recipient Form from Candidate selection
  const handleSelectCandidateForSingle = (candId: string) => {
    setSelectedCandidateId(candId);
    const cand = candidates.find(c => c.id === candId);
    if (cand) {
      setSingleInputs(prev => ({
        ...prev,
        candidateName: cand.name,
        candidateEmail: cand.email,
        candidateId: cand.studentId || cand.id,
        courseName: selectedTemplateForIssue?.name || prev.courseName || 'Certificate Program',
        issueDate: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
        grade: 'Distinction (A+)',
        score: '98%'
      }));
    }
  };

  // Download tailored Excel Template for this specific certificate's variables
  const handleDownloadExcelTemplate = (template: CertificateTemplate) => {
    const vars = extractVariables(template);
    
    // Construct columns
    const headers = ['candidateName', 'candidateEmail', 'candidateId', 'courseName', ...vars.map(v => v.key).filter(k => !['candidateName', 'candidateEmail', 'candidateId', 'courseName'].includes(k))];
    
    // Sample rows
    const sampleRows = [
      {
        candidateName: 'Rahul Kumar',
        candidateEmail: 'rahul.kumar@stanford.edu',
        candidateId: 'CAND-SU-2026-089',
        courseName: template.name,
        grade: 'High Honors',
        score: '98',
        duration: '120 Hours',
        department: currentOrg.department || 'Computer Science'
      },
      {
        candidateName: 'Dr. Jennifer Widom',
        candidateEmail: 'jennifer.w@alumni.edu',
        candidateId: 'CAND-SU-2026-090',
        courseName: template.name,
        grade: 'Distinction',
        score: '95',
        duration: '120 Hours',
        department: currentOrg.department || 'Computer Science'
      }
    ];

    const worksheet = XLSX.utils.json_to_sheet(sampleRows, { header: headers });
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Variables_Data');
    
    const cleanName = template.name.replace(/[^a-zA-Z0-9_-]/g, '_');
    XLSX.writeFile(workbook, `iCertiX_${cleanName}_Variables_Template.xlsx`);
  };

  // Handle Excel / CSV File Upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setBatchFileName(file.name);
    const reader = new FileReader();

    reader.onload = (evt) => {
      try {
        const data = evt.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const parsedRows = XLSX.utils.sheet_to_json(firstSheet) as Record<string, any>[];
        
        if (parsedRows && parsedRows.length > 0) {
          setBatchRows(parsedRows);
        } else {
          alert('No data rows found in the uploaded file.');
        }
      } catch (err) {
        console.error('File parsing error:', err);
        alert('Failed to parse the file. Please upload a valid .xlsx or .csv file.');
      }
    };

    reader.readAsBinaryString(file);
  };

  // Execute Direct Issuance (Single or Batch)
  const handleExecuteIssuance = async () => {
    if (!selectedTemplateForIssue) return;

    setIsIssuing(true);
    const template = selectedTemplateForIssue;
    const schema = resolveSchema(template);

    try {
      const newCreds: Credential[] = [];

      if (issueMode === 'single') {
        const credId = `ICX-${new Date().getFullYear()}-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
        const certNum = `CERT-${new Date().getFullYear()}-${String(Math.floor(100000 + Math.random() * 900000))}`;
        const candidateName = singleInputs.candidateName || 'Rahul Kumar';
        const candidateEmail = singleInputs.candidateEmail || 'rahul.kumar@stanford.edu';
        const candidateId = singleInputs.candidateId || selectedCandidateId || `CAND-${(currentOrg.code || 'ORG').split('-')[0]}-${Date.now().toString().slice(-4)}`;
        const courseTitle = singleInputs.courseName || template.name;

        const newCred: Credential = {
          id: `cred-${Date.now()}`,
          credentialId: credId,
          certificateNumber: certNum,
          organisationId: currentOrg.id,
          candidateId: candidateId,
          courseId: template.id,
          templateId: template.id,
          designSchema: schema,
          customAttributes: { ...singleInputs },
          recipient: {
            name: candidateName,
            email: candidateEmail,
            studentId: candidateId
          },
          issuer: {
            name: currentOrg.name,
            department: currentOrg.department || 'Academic Registry',
            code: currentOrg.code || 'ORG',
            verifiedDomain: currentOrg.domain || 'icertix.com',
            logo: currentOrg.logo
          },
          title: template.name,
          courseName: courseTitle,
          category: 'Certificate',
          grade: singleInputs.grade || 'A+',
          score: singleInputs.score ? Number(singleInputs.score) : 98,
          issueDate: new Date().toISOString(),
          status: 'ACTIVE',
          skills: ['Sovereign Credential', 'Cryptographic Verification'],
          description: `Certified accomplishment for ${template.name}`,
          emailDelivery: {
            status: 'Queued',
            sentAt: new Date().toISOString(),
            messageId: `msg-${Date.now()}`
          },
          signatories: [],
          crypto: {
            sha256Hash: `0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`,
            signatureHex: `0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`,
            keyId: 'HSM-ECDSA-SEC256K1-01',
            signatureAlgorithm: 'ECDSA-secp256k1',
            signedAt: new Date().toISOString()
          }
        };

        newCreds.push(newCred);
      } else {
        // Batch issue
        batchRows.forEach((row, idx) => {
          const credId = `ICX-${new Date().getFullYear()}-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
          const certNum = `CERT-${new Date().getFullYear()}-${String(Math.floor(100000 + Math.random() * 900000))}`;
          const candidateName = row.candidateName || row.name || `Candidate ${idx + 1}`;
          const candidateEmail = row.candidateEmail || row.email || `candidate${idx + 1}@example.org`;
          const candidateId = row.candidateId || row.studentId || row['Candidate ID'] || row['Student ID'] || row['ID'] || row.id || `CAND-${(currentOrg.code || 'ORG').split('-')[0]}-${1000 + idx}`;
          const courseTitle = row.courseName || template.name;

          const newCred: Credential = {
            id: `cred-${Date.now()}-${idx}`,
            credentialId: credId,
            certificateNumber: certNum,
            organisationId: currentOrg.id,
            candidateId: candidateId,
            courseId: template.id,
            templateId: template.id,
            designSchema: schema,
            customAttributes: { ...row },
            recipient: {
              name: candidateName,
              email: candidateEmail,
              studentId: candidateId
            },
            issuer: {
              name: currentOrg.name,
              department: currentOrg.department || 'Academic Registry',
              code: currentOrg.code || 'ORG',
              verifiedDomain: currentOrg.domain || 'icertix.com',
              logo: currentOrg.logo
            },
            title: template.name,
            courseName: courseTitle,
            category: 'Certificate',
            grade: row.grade || 'A',
            score: row.score ? Number(row.score) : 95,
            issueDate: new Date().toISOString(),
            status: 'ACTIVE',
            skills: ['Sovereign Credential', 'Cryptographic Verification'],
            description: `Certified accomplishment for ${template.name}`,
            emailDelivery: {
              status: 'Queued',
              sentAt: new Date().toISOString(),
              messageId: `msg-${Date.now()}-${idx}`
            },
            signatories: [],
            crypto: {
              sha256Hash: `0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`,
              signatureHex: `0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`,
              keyId: 'HSM-ECDSA-SEC256K1-01',
              signatureAlgorithm: 'ECDSA-secp256k1',
              signedAt: new Date().toISOString()
            }
          };

          newCreds.push(newCred);
        });
      }

      // Simulate cryptographic HSM signing delay
      await new Promise(r => setTimeout(r, 600));

      onCredentialCreated(newCreds);
      setIssueSuccessCount(newCreds.length);
    } catch (err) {
      console.error('Issuance error:', err);
    } finally {
      setIsIssuing(false);
    }
  };

  return (
    <div className="space-y-5 animate-fadeIn pb-12">
      {/* 1. COMPACT SLIM HERO HEADER */}
      <div className="relative overflow-hidden bg-gradient-to-r from-[#0c1a30] via-[#0a2540] to-[#0d3460] rounded-2xl p-4 sm:p-5 text-white shadow-md border border-sky-900/40">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 bg-sky-500/20 border border-sky-400/30 rounded-md text-[10px] font-mono text-sky-300">
                Templates Hub
              </span>
              <h1 className="text-lg sm:text-xl font-bold font-sora text-white">
                My Saved Templates
              </h1>
            </div>
            <p className="text-xs text-slate-300">
              Manage certificate designs, view candidate holder metrics, and issue credentials directly.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {/* KPI Mini Pills Strip */}
            <div className="hidden lg:flex items-center gap-1.5 bg-white/5 border border-white/10 p-1 rounded-xl text-[11px] font-mono">
              <span className="px-2 py-1 text-slate-300">
                Templates: <strong className="text-white font-bold">{templates.length}</strong>
              </span>
              <span className="px-2 py-1 text-slate-300 border-l border-white/10">
                Issued: <strong className="text-sky-400 font-bold">{totalIssuedCount}</strong>
              </span>
              <span className="px-2 py-1 text-slate-300 border-l border-white/10">
                Holders: <strong className="text-emerald-400 font-bold">{totalUniqueCandidates}</strong>
              </span>
              <span className="px-2 py-1 text-slate-300 border-l border-white/10">
                Variables: <strong className="text-amber-400 font-bold">{totalVariablesDetected}</strong>
              </span>
            </div>

            <button
              onClick={() => onNavigateToDesigner(undefined, true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-[#1877e0] to-[#0284C7] hover:from-[#1565c0] hover:to-[#0369a1] text-white font-bold text-xs rounded-xl shadow-md cursor-pointer transition-all shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create New Template</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. FILTER, SEARCH & VIEW SWITCHER BAR */}
      <div className="icx-card p-3.5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            id="template-search-input"
            type="text"
            placeholder="Search templates by title, format, or variable (e.g. {{grade}})..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-[#f4f7fc] border border-[#e5ebf4] rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-[#2ea6ff] transition-all"
          />
        </div>

        {/* Filter Pills & View Switcher */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1 bg-[#f4f7fc] p-1 rounded-xl border border-[#e5ebf4] overflow-x-auto">
            {filterOptions.map((opt) => (
              <button
                key={opt}
                onClick={() => setSelectedFilter(opt)}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                  selectedFilter === opt
                    ? 'bg-[#0a1f44] text-[#2ea6ff] shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white'
                }`}
              >
                {opt}
              </button>
            ))}
          </div>

          {/* Grid / Table Toggle */}
          <div className="flex items-center gap-1 bg-[#f4f7fc] p-1 rounded-xl border border-[#e5ebf4]">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1 text-xs font-bold ${
                viewMode === 'grid' ? 'bg-white shadow-xs text-[#1877e0]' : 'text-slate-400 hover:text-slate-700'
              }`}
              title="Grid View (Default)"
            >
              <LayoutGrid className="w-4 h-4" />
              <span className="hidden sm:inline">Grid</span>
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1 text-xs font-bold ${
                viewMode === 'table' ? 'bg-white shadow-xs text-[#1877e0]' : 'text-slate-400 hover:text-slate-700'
              }`}
              title="Table View"
            >
              <List className="w-4 h-4" />
              <span className="hidden sm:inline">Table</span>
            </button>
          </div>
        </div>
      </div>

      {/* 3. TEMPLATES CONTENT: GRID VIEW (PRIMARY) OR TABLE VIEW */}
      {filteredTemplates.length === 0 ? (
        <div className="icx-card p-12 text-center rounded-3xl space-y-4">
          <div className="w-14 h-14 bg-sky-50 text-[#1877e0] rounded-3xl mx-auto flex items-center justify-center border border-sky-100">
            <Layout className="w-7 h-7" />
          </div>
          <div className="max-w-md mx-auto">
            <h3 className="text-base font-bold font-sora text-[#0c1a30]">
              {searchQuery || selectedFilter !== 'All' ? 'No Matching Templates Found' : 'No Templates Created Yet'}
            </h3>
            <p className="text-xs text-[#66748c] mt-1.5">
              {searchQuery || selectedFilter !== 'All'
                ? 'Try adjusting your search query or switching to "All" filters.'
                : 'Design and customize certificate layouts in the Certificate Designer studio to start issuing.'}
            </p>
          </div>
          <button
            onClick={() => onNavigateToDesigner(undefined, true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#1877e0] hover:bg-[#1565c0] text-white text-xs font-bold rounded-xl transition-all shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Open Certificate Designer</span>
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        /* GRID VIEW (Compact & Proportional Scaled Previews) */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredTemplates.map((template) => {
            const schema = resolveSchema(template);
            const templateCreds = credentials.filter(c => c.templateId === template.id || c.title === template.name);
            const candidateHoldersCount = templateCreds.length;
            const variables = extractVariables(template);
            const tOrientation = (template.orientation || schema?.page?.orientation || 'landscape').toLowerCase();

            return (
              <div
                key={template.id}
                className="bg-white rounded-2xl border border-[#e5ebf4] hover:border-[#1877e0]/60 p-4 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
              >
                <div>
                  {/* Top Bar */}
                  <div className="flex items-center justify-between gap-2 mb-2.5">
                    <div className="flex items-center gap-1.5">
                      <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-md text-[10px] font-mono font-bold uppercase">
                        {template.status || 'PUBLISHED'}
                      </span>
                      <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md text-[10px] font-mono">
                        {tOrientation === 'portrait' ? 'Portrait' : 'Landscape'}
                      </span>
                      {template.isDefault && (
                        <span className="px-1.5 py-0.5 bg-amber-50 text-amber-700 border border-amber-200 rounded text-[9px] font-mono font-bold">
                          Default
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => onNavigateToDesigner(template.id, false)}
                        className="p-1 hover:bg-sky-50 text-slate-400 hover:text-[#1877e0] rounded-lg transition-colors cursor-pointer"
                        title="Edit in Certificate Designer"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      {onDuplicateTemplate && (
                        <button
                          onClick={() => onDuplicateTemplate(template)}
                          className="p-1 hover:bg-slate-100 text-slate-400 hover:text-slate-700 rounded-lg transition-colors cursor-pointer"
                          title="Duplicate Template"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                      )}
                      {onDeleteTemplate && (
                        <button
                          onClick={() => onDeleteTemplate(template.id)}
                          className="p-1 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-lg transition-colors cursor-pointer"
                          title="Delete Template"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Title */}
                  <h3 
                    onClick={() => onNavigateToDesigner(template.id, false)}
                    className="text-sm font-bold font-sora text-[#0c1a30] group-hover:text-[#1877e0] transition-colors truncate cursor-pointer"
                    title={template.name}
                  >
                    {template.name}
                  </h3>

                  {/* Scaled Certificate Canvas Container */}
                  <div 
                    onClick={() => onNavigateToDesigner(template.id, false)}
                    className="mt-2.5 bg-slate-100/90 rounded-xl p-2 border border-slate-200/80 cursor-pointer overflow-hidden relative group/thumb hover:ring-2 hover:ring-[#1877e0]/30 transition-all flex items-center justify-center min-h-[175px]"
                  >
                    <div className="shrink-0 shadow-sm rounded overflow-hidden pointer-events-none">
                      <VectorCertificatePreview
                        schema={schema}
                        scale={tOrientation === 'portrait' ? 0.22 : 0.26}
                        demoData={{
                          ...DEFAULT_DEMO_DATA,
                          courseName: template.name
                        }}
                      />
                    </div>
                    <div className="absolute inset-0 bg-[#0c1a30]/20 opacity-0 group-hover/thumb:opacity-100 flex items-center justify-center transition-all backdrop-blur-[1px] rounded-xl">
                      <span className="px-3 py-1.5 bg-white/95 text-[#0c1a30] font-bold text-xs rounded-xl shadow-lg flex items-center gap-1.5 transform group-hover/thumb:scale-105 transition-transform">
                        <Edit3 className="w-3.5 h-3.5 text-[#1877e0]" />
                        <span>Edit Canvas</span>
                      </span>
                    </div>
                  </div>

                  {/* Variables Detected in Schema */}
                  <div className="mt-3">
                    <div className="flex items-center justify-between text-[10px] font-bold text-slate-600 mb-1">
                      <span className="flex items-center gap-1 font-mono">
                        <Braces className="w-3 h-3 text-[#0284C7]" />
                        <span>Variables ({variables.length})</span>
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1 max-h-12 overflow-y-auto">
                      {variables.slice(0, 4).map(v => (
                        <span
                          key={v.key}
                          className="px-1.5 py-0.5 bg-slate-100 text-slate-700 border border-slate-200 rounded text-[9px] font-mono"
                          title={`Sample: "${v.sample}"`}
                        >
                          {`{{${v.key}}}`}
                        </span>
                      ))}
                      {variables.length > 4 && (
                        <span className="px-1.5 py-0.5 bg-slate-100 text-slate-500 rounded text-[9px] font-mono">
                          +{variables.length - 4}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Card Actions Footer */}
                <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <button
                    onClick={() => setSelectedTemplateForRoster(template)}
                    className="px-2.5 py-1.5 bg-sky-50 hover:bg-sky-100 text-[#0284C7] text-xs font-bold rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                    title="View candidate roster"
                  >
                    <Users className="w-3.5 h-3.5" />
                    <span>{candidateHoldersCount} Holders</span>
                  </button>

                  <button
                    onClick={() => handleOpenQuickIssue(template)}
                    className="px-3.5 py-1.5 bg-[#1877e0] hover:bg-[#1565c0] text-white text-xs font-bold rounded-lg shadow-2xs hover:shadow-xs transition-all flex items-center gap-1 cursor-pointer"
                  >
                    <Zap className="w-3.5 h-3.5 text-amber-300" />
                    <span>Issue Certificate</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* TABLE VIEW (Row by row) */
        <div className="icx-card rounded-2xl overflow-hidden border border-[#e5ebf4]">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#f8fafc] text-slate-600 font-mono text-[11px] border-b border-[#e5ebf4]">
                <tr>
                  <th className="py-3.5 px-4 font-bold">TEMPLATE NAME & DESIGN</th>
                  <th className="py-3.5 px-3 font-bold">ORIENTATION & SIZE</th>
                  <th className="py-3.5 px-3 font-bold">VARIABLES IN SCHEMA</th>
                  <th className="py-3.5 px-3 font-bold">CANDIDATE HOLDERS</th>
                  <th className="py-3.5 px-3 font-bold">STATUS</th>
                  <th className="py-3.5 px-4 font-bold text-right">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f1f5f9]">
                {filteredTemplates.map((template) => {
                  const schema = resolveSchema(template);
                  const templateCreds = credentials.filter(c => c.templateId === template.id || c.title === template.name);
                  const candidateHoldersCount = templateCreds.length;
                  const variables = extractVariables(template);
                  const tOrientation = (template.orientation || schema?.page?.orientation || 'landscape').toLowerCase();

                  return (
                    <tr 
                      key={template.id} 
                      className="hover:bg-sky-50/40 transition-colors group"
                    >
                      {/* 1. Template Name & Mini Thumbnail */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div 
                            onClick={() => onNavigateToDesigner(template.id, false)}
                            className="w-10 h-8 rounded-lg bg-gradient-to-br from-slate-100 to-slate-200 border border-slate-300/80 flex items-center justify-center shrink-0 cursor-pointer group-hover:border-[#1877e0] transition-colors shadow-2xs"
                            title="Click to edit template"
                          >
                            <Layout className="w-4 h-4 text-[#1877e0]" />
                          </div>

                          <div>
                            <div className="flex items-center gap-1.5">
                              <span 
                                onClick={() => onNavigateToDesigner(template.id, false)}
                                className="font-bold text-slate-900 group-hover:text-[#1877e0] transition-colors cursor-pointer text-xs"
                              >
                                {template.name}
                              </span>
                              {template.isDefault && (
                                <span className="px-1.5 py-0.2 bg-amber-50 text-amber-700 border border-amber-200 rounded text-[9px] font-mono font-bold">
                                  Default
                                </span>
                              )}
                            </div>
                            <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                              ID: {template.id} • {schema.elements.length} elements
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* 2. Orientation & Size */}
                      <td className="py-3 px-3">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg text-[10px] font-mono font-medium">
                          {tOrientation === 'portrait' ? '📄 A4 Portrait' : '📜 A4 Landscape'}
                        </span>
                      </td>

                      {/* 3. Variables Detected in Schema */}
                      <td className="py-3 px-3">
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {variables.slice(0, 3).map(v => (
                            <span 
                              key={v.key}
                              className="px-1.5 py-0.5 bg-sky-50 text-[#0284C7] border border-sky-100 rounded text-[10px] font-mono font-medium"
                              title={`Sample: "${v.sample}"`}
                            >
                              {`{{${v.key}}}`}
                            </span>
                          ))}
                          {variables.length > 3 && (
                            <span 
                              className="px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded text-[10px] font-mono font-bold"
                              title={variables.slice(3).map(v => `{{${v.key}}}`).join(', ')}
                            >
                              +{variables.length - 3} more
                            </span>
                          )}
                        </div>
                      </td>

                      {/* 4. Candidate Holders Count */}
                      <td className="py-3 px-3">
                        <button
                          onClick={() => setSelectedTemplateForRoster(template)}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-sky-50 hover:bg-sky-100 text-[#0284C7] border border-sky-200 text-xs font-bold transition-all cursor-pointer"
                          title="View all candidates holding this certificate"
                        >
                          <Users className="w-3.5 h-3.5" />
                          <span>{candidateHoldersCount} {candidateHoldersCount === 1 ? 'Candidate' : 'Candidates'}</span>
                        </button>
                      </td>

                      {/* 5. Status Badge */}
                      <td className="py-3 px-3">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-[10px] font-mono font-bold uppercase">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>{template.status || 'PUBLISHED'}</span>
                        </span>
                      </td>

                      {/* 6. Action Buttons */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenQuickIssue(template)}
                            className="px-3 py-1.5 bg-[#1877e0] hover:bg-[#1565c0] text-white rounded-xl text-xs font-bold transition-all shadow-2xs flex items-center gap-1 cursor-pointer"
                            title="Directly issue certificate passing variable values"
                          >
                            <Zap className="w-3.5 h-3.5 text-amber-300" />
                            <span>Issue</span>
                          </button>

                          <button
                            onClick={() => onNavigateToDesigner(template.id, false)}
                            className="p-1.5 hover:bg-sky-50 text-slate-500 hover:text-[#1877e0] rounded-xl transition-colors cursor-pointer"
                            title="Edit Canvas in Template Designer"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => setSelectedTemplateForRoster(template)}
                            className="p-1.5 hover:bg-slate-100 text-slate-500 hover:text-slate-800 rounded-xl transition-colors cursor-pointer"
                            title="View Candidates Roster"
                          >
                            <Users className="w-4 h-4" />
                          </button>

                          {onDuplicateTemplate && (
                            <button
                              onClick={() => onDuplicateTemplate(template)}
                              className="p-1.5 hover:bg-slate-100 text-slate-400 hover:text-slate-700 rounded-xl transition-colors cursor-pointer"
                              title="Duplicate Template"
                            >
                              <Copy className="w-4 h-4" />
                            </button>
                          )}

                          {onDeleteTemplate && (
                            <button
                              onClick={() => onDeleteTemplate(template.id)}
                              className="p-1.5 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-xl transition-colors cursor-pointer"
                              title="Delete Template"
                            >
                              <Trash2 className="w-4 h-4" />
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
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. QUICK VARIABLE ISSUANCE MODAL                                          */}
      {/* ========================================================================= */}
      {selectedTemplateForIssue && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-3xl border border-[#e5ebf4] shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-scale-in">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-sky-50 to-white">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-[#1877e0] text-white flex items-center justify-center shadow-xs">
                  <Zap className="w-5 h-5 text-amber-300" />
                </div>
                <div>
                  <h3 className="text-base font-bold font-sora text-[#0c1a30]">
                    Issue Certificate: {selectedTemplateForIssue.name}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Pass variable values to generate cryptographically signed credentials.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedTemplateForIssue(null)}
                className="p-2 hover:bg-slate-100 text-slate-400 hover:text-slate-600 rounded-xl cursor-pointer transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Tabs: Single Issue vs Batch Excel */}
            <div className="flex border-b border-slate-200 bg-slate-50 px-5 pt-3 gap-2">
              <button
                onClick={() => { setIssueMode('single'); setIssueSuccessCount(null); }}
                className={`pb-3 px-3 text-xs font-bold border-b-2 transition-all cursor-pointer ${
                  issueMode === 'single'
                    ? 'border-[#1877e0] text-[#1877e0]'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                Single Recipient Variables
              </button>
              <button
                onClick={() => { setIssueMode('batch'); setIssueSuccessCount(null); }}
                className={`pb-3 px-3 text-xs font-bold border-b-2 transition-all cursor-pointer ${
                  issueMode === 'batch'
                    ? 'border-[#1877e0] text-[#1877e0]'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                Batch Excel / CSV Import
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-4 flex-1">
              {issueSuccessCount !== null ? (
                <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-2xl text-center space-y-3">
                  <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
                  <h4 className="text-base font-bold text-emerald-900">
                    Successfully Issued {issueSuccessCount} Certificate{issueSuccessCount === 1 ? '' : 's'}!
                  </h4>
                  <p className="text-xs text-emerald-700">
                    Cryptographic credentials have been signed and added to the Credentials Registry.
                  </p>
                  <div className="pt-2 flex justify-center gap-3">
                    <button
                      onClick={() => setSelectedTemplateForIssue(null)}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
                    >
                      Done
                    </button>
                    <button
                      onClick={() => {
                        setIssueSuccessCount(null);
                        setSingleInputs({});
                      }}
                      className="px-4 py-2 bg-white border border-emerald-300 text-emerald-800 hover:bg-emerald-100 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                    >
                      Issue Another
                    </button>
                  </div>
                </div>
              ) : issueMode === 'single' ? (
                <div className="space-y-4">
                  {/* Optional Candidate Selection */}
                  {candidates.length > 0 && (
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">
                        Select Existing Candidate (Optional)
                      </label>
                      <select
                        value={selectedCandidateId}
                        onChange={(e) => handleSelectCandidateForSingle(e.target.value)}
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-[#1877e0]"
                      >
                        <option value="">-- Type manual variables or choose candidate --</option>
                        {candidates.map(c => (
                          <option key={c.id} value={c.id}>
                            {c.name} ({c.email}) - {c.studentId || c.id}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* Dynamic Variable Inputs */}
                  <div className="space-y-3">
                    <div className="text-xs font-bold font-mono uppercase tracking-wider text-slate-600">
                      Template Variables
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {extractVariables(selectedTemplateForIssue).map((v) => (
                        <div key={v.key} className="space-y-1">
                          <label className="text-[11px] font-bold text-slate-700 flex items-center justify-between">
                            <span>{v.label}</span>
                            <span className="text-[10px] font-mono text-slate-400">{`{{${v.key}}}`}</span>
                          </label>
                          <input
                            type="text"
                            placeholder={v.sample}
                            value={singleInputs[v.key] ?? ''}
                            onChange={(e) => setSingleInputs({ ...singleInputs, [v.key]: e.target.value })}
                            className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-[#1877e0] focus:ring-1 focus:ring-[#1877e0]"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                /* Batch Excel / CSV Mode */
                <div className="space-y-4">

                  {/* Upload Drop Area */}
                  <label className="block p-6 border-2 border-dashed border-slate-300 hover:border-[#1877e0] rounded-2xl bg-slate-50 hover:bg-sky-50/30 text-center cursor-pointer transition-all">
                    <FileSpreadsheet className="w-10 h-10 text-slate-400 mx-auto mb-2" />
                    <span className="text-xs font-bold text-slate-700 block">
                      {batchFileName || 'Click or drag .xlsx / .csv file here'}
                    </span>
                    <span className="text-[10px] text-slate-400 mt-1 block">
                      Auto-detects matching variable column headers
                    </span>
                    <input
                      type="file"
                      accept=".xlsx,.xls,.csv"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>

                  {/* Batch Preview Table */}
                  {batchRows.length > 0 && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                        <span>Parsed Rows Preview ({batchRows.length} Candidates)</span>
                      </div>
                      <div className="max-h-48 overflow-y-auto border border-slate-200 rounded-xl text-xs">
                        <table className="w-full text-left">
                          <thead className="bg-slate-100 text-slate-600 text-[10px] font-mono sticky top-0">
                            <tr>
                              <th className="p-2">#</th>
                              {Object.keys(batchRows[0] || {}).slice(0, 4).map(k => (
                                <th key={k} className="p-2">{k}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                            {batchRows.slice(0, 5).map((row, idx) => (
                              <tr key={idx} className="hover:bg-slate-50">
                                <td className="p-2 text-slate-400">{idx + 1}</td>
                                {Object.values(row).slice(0, 4).map((v: any, i) => (
                                  <td key={i} className="p-2 truncate max-w-[120px]">{String(v)}</td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            {issueSuccessCount === null && (
              <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-2">
                <button
                  onClick={() => setSelectedTemplateForIssue(null)}
                  className="px-4 py-2 bg-white border border-slate-200 hover:bg-slate-100 text-slate-600 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  disabled={isIssuing || (issueMode === 'batch' && batchRows.length === 0)}
                  onClick={handleExecuteIssuance}
                  className={`px-5 py-2.5 bg-[#1877e0] hover:bg-[#1565c0] text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-2 cursor-pointer transition-all ${
                    isIssuing || (issueMode === 'batch' && batchRows.length === 0) ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {isIssuing ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Signing Credentials...</span>
                    </>
                  ) : (
                    <>
                      <Zap className="w-3.5 h-3.5 text-amber-300" />
                      <span>
                        {issueMode === 'single'
                          ? 'Generate & Issue Certificate'
                          : `Batch Issue (${batchRows.length} Candidates)`}
                      </span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. CANDIDATES ROSTER DRAWER FOR SELECTED TEMPLATE                          */}
      {/* ========================================================================= */}
      {selectedTemplateForRoster && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-3xl border border-[#e5ebf4] shadow-2xl w-full max-w-3xl max-h-[85vh] flex flex-col overflow-hidden animate-scale-in">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-sky-50 to-white">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-[#0284C7] text-white flex items-center justify-center shadow-xs">
                  <Users className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-base font-bold font-sora text-[#0c1a30]">
                    Candidate Holders: {selectedTemplateForRoster.name}
                  </h3>
                  <p className="text-xs text-slate-500">
                    List of all candidates holding certificates issued using this template.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedTemplateForRoster(null)}
                className="p-2 hover:bg-slate-100 text-slate-400 hover:text-slate-600 rounded-xl cursor-pointer transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto flex-1">
              {(() => {
                const templateCreds = credentials.filter(c => c.templateId === selectedTemplateForRoster.id);

                if (templateCreds.length === 0) {
                  return (
                    <div className="text-center py-12 space-y-3">
                      <FileCheck2 className="w-12 h-12 text-slate-300 mx-auto" />
                      <h4 className="text-sm font-bold text-slate-700">No Certificates Issued Yet</h4>
                      <p className="text-xs text-slate-500 max-w-xs mx-auto">
                        This template hasn't been issued to any candidates yet. Click "Issue Certificate" to generate credentials.
                      </p>
                      <button
                        onClick={() => {
                          const t = selectedTemplateForRoster;
                          setSelectedTemplateForRoster(null);
                          handleOpenQuickIssue(t);
                        }}
                        className="px-4 py-2 bg-[#1877e0] text-white text-xs font-bold rounded-xl hover:bg-[#1565c0] transition-colors"
                      >
                        Issue First Certificate
                      </button>
                    </div>
                  );
                }

                return (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-600 mb-2">
                      <span>Total {templateCreds.length} Issued Records</span>
                    </div>

                    <div className="border border-slate-200 rounded-2xl overflow-hidden">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-50 text-slate-600 font-mono text-[10px] border-b border-slate-200">
                          <tr>
                            <th className="p-3">Candidate</th>
                            <th className="p-3">Credential ID</th>
                            <th className="p-3">Issued Date</th>
                            <th className="p-3">Status</th>
                            <th className="p-3 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {templateCreds.map((cred) => (
                            <tr key={cred.id} className="hover:bg-slate-50/80 transition-colors">
                              <td className="p-3">
                                <div className="font-bold text-slate-800">{cred.recipient?.name || 'Unknown'}</div>
                                <div className="text-[11px] text-slate-400 font-mono">{cred.recipient?.email}</div>
                              </td>
                              <td className="p-3 font-mono text-[11px] text-[#0284C7] font-bold">
                                {cred.credentialId}
                              </td>
                              <td className="p-3 text-slate-500 text-[11px]">
                                {new Date(cred.issueDate || Date.now()).toLocaleDateString()}
                              </td>
                              <td className="p-3">
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                  cred.status === 'ACTIVE'
                                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                    : 'bg-rose-50 text-rose-700 border border-rose-200'
                                }`}>
                                  {cred.status}
                                </span>
                              </td>
                              <td className="p-3 text-right">
                                <button
                                  onClick={() => {
                                    setSelectedTemplateForRoster(null);
                                    onViewCertificate(cred);
                                  }}
                                  className="px-3 py-1.5 bg-sky-50 hover:bg-sky-100 text-[#0284C7] rounded-xl font-bold text-[11px] transition-colors inline-flex items-center gap-1 cursor-pointer"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                  <span>View</span>
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
