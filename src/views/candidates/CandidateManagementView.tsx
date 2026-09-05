import React, { useState, useRef } from 'react';
import { 
  Users, 
  Upload, 
  Plus, 
  Search, 
  FileSpreadsheet, 
  CheckCircle2, 
  AlertCircle, 
  Trash2, 
  Mail, 
  Award,
  Download,
  X,
  UserCheck,
  FileText,
  ShieldCheck,
  Loader2
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { Organisation, Candidate } from '../../types';
import { useToast } from '../../components/common/ToastContext';
import { api } from '../../services/apiClient';

interface CandidateManagementViewProps {
  currentOrg: Organisation;
  candidates: Candidate[];
  onAddCandidate: (candidate: Candidate) => void;
  onImportBulkCandidates: (candidates: Candidate[]) => void;
  onDeleteCandidate: (id: string) => void;
  onIssueForCandidate: (candidate: Candidate) => void;
}

export const CandidateManagementView: React.FC<CandidateManagementViewProps> = ({
  currentOrg,
  candidates,
  onAddCandidate,
  onImportBulkCandidates,
  onDeleteCandidate,
  onIssueForCandidate
}) => {
  const toast = useToast();
  const [exportingCandidateId, setExportingCandidateId] = useState<string | null>(null);
  const orgCandidates = candidates.filter(c => c.organisationId === currentOrg.id);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [uploadMode, setUploadMode] = useState<'excel' | 'csv'>('excel');
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Single Candidate Form
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newStudentId, setNewStudentId] = useState('');
  const [newDepartment, setNewDepartment] = useState('Computer Science');

  // Bulk Import Parse State
  const [rawCsvText, setRawCsvText] = useState('');
  const [parsedRows, setParsedRows] = useState<Array<{
    name: string;
    email: string;
    studentId: string;
    department: string;
    valid: boolean;
    error?: string;
  }>>([]);

  const filteredCandidates = orgCandidates.filter(c => {
    const matchesSearch = 
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase()) ||
      c.studentId.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // GDPR / FERPA Subject Access Request (SAR) Bundle Exporter
  const handleExportGdpr = async (candidateId: string, candidateName: string) => {
    try {
      setExportingCandidateId(candidateId);
      const sarBundle = await api.exportCandidateGdpr(candidateId);
      const jsonStr = JSON.stringify(sarBundle, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `gdpr-sar-bundle-${candidateName.toLowerCase().replace(/[^a-z0-9]/g, '_')}-${candidateId}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success(`GDPR Subject Access Request bundle generated for ${candidateName}`, 'SAR Bundle Exported');
    } catch (err: any) {
      toast.error(err.message || 'Failed to export candidate GDPR data bundle', 'Export Failed');
    } finally {
      setExportingCandidateId(null);
    }
  };

  // 1. Generate & Download Example Excel (.xlsx) Template
  const handleDownloadExcelTemplate = () => {
    const orgCode = currentOrg.code || 'ORG';
    const sampleData = [
      {
        "Full Name": "Sophia Chen",
        "Email Address": "sophia.chen@alumni.edu",
        "Candidate ID": `CAND-${orgCode}-2026-1001`,
        "Department / Branch": "Computer Science & Engineering",
        "Course / Program Code": "CS-AI-890",
        "Grade / Performance": "A+ (Distinction)",
        "Contact Phone": "+1 (555) 234-5678"
      },
      {
        "Full Name": "Dr. Marcus Aurelius",
        "Email Address": "m.aurelius@rome-academics.org",
        "Candidate ID": `CAND-${orgCode}-2026-1002`,
        "Department / Branch": "Executive Leadership",
        "Course / Program Code": "EXEC-101",
        "Grade / Performance": "A",
        "Contact Phone": "+1 (555) 876-5432"
      },
      {
        "Full Name": "Carlos Mendoza",
        "Email Address": "c.mendoza@cyber-defense.org",
        "Candidate ID": `CAND-${orgCode}-2026-1003`,
        "Department / Branch": "Cybersecurity & Cryptography",
        "Course / Program Code": "SEC-501",
        "Grade / Performance": "A-",
        "Contact Phone": "+1 (555) 345-6789"
      },
      {
        "Full Name": "Amara Okafor",
        "Email Address": "amara.okafor@tech-africa.ng",
        "Candidate ID": `CAND-${orgCode}-2026-1004`,
        "Department / Branch": "Distributed Cloud Systems",
        "Course / Program Code": "CLOUD-301",
        "Grade / Performance": "A+",
        "Contact Phone": "+234 802 123 4567"
      },
      {
        "Full Name": "Priya Patel",
        "Email Address": "priya.patel@ai-innovate.in",
        "Candidate ID": `CAND-${orgCode}-2026-1005`,
        "Department / Branch": "Bioinformatics & AI",
        "Course / Program Code": "BIO-602",
        "Grade / Performance": "A",
        "Contact Phone": "+91 98765 43210"
      }
    ];

    const worksheet = XLSX.utils.json_to_sheet(sampleData);
    worksheet['!cols'] = [
      { wch: 25 }, // Full Name
      { wch: 32 }, // Email Address
      { wch: 25 }, // Candidate ID
      { wch: 38 }, // Department
      { wch: 24 }, // Course Code
      { wch: 22 }, // Grade
      { wch: 20 }  // Contact Phone
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Candidates Data');
    XLSX.writeFile(workbook, `iCertiX_${orgCode}_Candidates_Import_Template.xlsx`);
  };

  // 2. Parse Uploaded Excel File (.xlsx / .xls / .csv)
  const handleExcelFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadedFileName(file.name);
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const data = new Uint8Array(evt.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const json: any[] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        if (json.length <= 1) {
          setParsedRows([]);
          return;
        }

        const headers = (json[0] as any[]).map(h => String(h || '').trim().toLowerCase());
        const nameIdx = headers.findIndex(h => h.includes('name'));
        const emailIdx = headers.findIndex(h => h.includes('email') || h.includes('mail'));
        const studentIdIdx = headers.findIndex(h => h.includes('student') || h.includes('id') || h.includes('roll') || h.includes('reg'));
        const deptIdx = headers.findIndex(h => h.includes('depart') || h.includes('branch') || h.includes('stream') || h.includes('major'));

        const rows = json.slice(1)
          .filter(row => Array.isArray(row) && row.some(cell => cell !== undefined && String(cell).trim() !== ''))
          .map((row: any[]) => {
            const name = String(row[nameIdx >= 0 ? nameIdx : 0] || '').trim();
            const email = String(row[emailIdx >= 0 ? emailIdx : 1] || '').trim();
            const studentId = String(row[studentIdIdx >= 0 ? studentIdIdx : 2] || '').trim();
            const department = String(row[deptIdx >= 0 ? deptIdx : 3] || 'General').trim();

            const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
            const valid = Boolean(name && email && emailValid);

            return {
              name,
              email,
              studentId: studentId || `CAND-${currentOrg.code || 'ORG'}-${Math.floor(1000 + Math.random() * 9000)}`,
              department: department || 'General',
              valid,
              error: !name ? 'Missing name' : !email ? 'Missing email' : !emailValid ? 'Invalid email format' : undefined
            };
          });

        setParsedRows(rows);
      } catch (err: any) {
        alert('Could not parse spreadsheet. Please ensure it is a valid Excel (.xlsx, .xls) or CSV file.');
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleSingleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newEmail.trim()) return;

    const newCand: Candidate = {
      id: `CAN_${Date.now().toString().slice(-4)}`,
      organisationId: currentOrg.id,
      name: newName.trim(),
      email: newEmail.trim(),
      studentId: newStudentId.trim() || `CAND-${currentOrg.code.split('-')[0]}-${Math.floor(1000 + Math.random() * 9000)}`,
      department: newDepartment,
      status: 'Active',
      createdAt: new Date().toISOString().split('T')[0]
    };

    onAddCandidate(newCand);
    setNewName('');
    setNewEmail('');
    setNewStudentId('');
    setShowAddModal(false);
  };

  const handleLoadSampleCsv = () => {
    const sample = `Name,Email,CandidateID,Department
Dr. Marcus Aurelius,m.aurelius@rome-academics.org,CAND-${currentOrg.code}-2026-8810,Executive Leadership
Sophia Chen,sophia.chen@stanford-alumni.org,CAND-${currentOrg.code}-2026-1455,Computer Science
Carlos Mendoza,c.mendoza@latam-cyber.com,CAND-${currentOrg.code}-2026-9021,Cybersecurity
Amara Okafor,amara.okafor@lagos-tech.ng,CAND-${currentOrg.code}-2026-1590,Distributed Systems
Priya Patel,priya.patel@ai-innovate.in,CAND-${currentOrg.code}-2026-7734,Artificial Intelligence`;
    setRawCsvText(sample);
    parseCsv(sample);
  };

  const parseCsv = (text: string) => {
    const lines = text.trim().split('\n');
    if (lines.length <= 1) {
      setParsedRows([]);
      return;
    }

    const rows = lines.slice(1).map((line) => {
      const parts = line.split(',').map(p => p.trim());
      const name = parts[0] || '';
      const email = parts[1] || '';
      const studentId = parts[2] || '';
      const department = parts[3] || 'General';

      const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
      const valid = Boolean(name && email && emailValid);

      return {
        name,
        email,
        studentId: studentId || `CAND-${Math.floor(1000 + Math.random() * 9000)}`,
        department,
        valid,
        error: !name ? 'Missing name' : !email ? 'Missing email' : !emailValid ? 'Invalid email format' : undefined
      };
    });

    setParsedRows(rows);
  };

  const handleExecuteBulkImport = () => {
    const validRows = parsedRows.filter(r => r.valid);
    if (validRows.length === 0) return;

    const newCandidates: Candidate[] = validRows.map((r, i) => ({
      id: `CAN_${Date.now().toString().slice(-4)}_${i}`,
      organisationId: currentOrg.id,
      name: r.name,
      email: r.email,
      studentId: r.studentId,
      department: r.department,
      status: 'Active',
      createdAt: new Date().toISOString().split('T')[0]
    }));

    onImportBulkCandidates(newCandidates);
    setRawCsvText('');
    setParsedRows([]);
    setUploadedFileName(null);
    setShowBulkModal(false);
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-10">
      {/* Header Card */}
      <div className="icx-card p-6 sm:p-8 rounded-3xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 bg-sky-50 text-[#1877e0] rounded-2xl flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold font-sora tracking-tight text-[#0c1a30]">
              Candidate & Graduate Directory
            </h1>
          </div>
          <p className="text-xs text-[#66748c] mt-1.5 font-jakarta">
            Manage registered candidates, import batches via CSV/Excel, and trigger cryptographic certificate issuance.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => {
              setShowBulkModal(true);
              setUploadMode('excel');
            }}
            className="btn-pill-ghost px-4 py-2 text-xs flex items-center justify-center gap-2 cursor-pointer shadow-xs text-[#1877e0]"
          >
            <Upload className="w-4 h-4" />
            <span>Import Candidates</span>
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="btn-primary-gradient px-4 py-2 text-xs flex items-center justify-center gap-2 cursor-pointer shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Add Candidate</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="icx-card p-4 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search name, candidate ID, email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-[#f4f7fc] border border-[#e5ebf4] rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:border-[#2ea6ff] transition-all"
          />
        </div>

        <div className="flex items-center gap-1.5 w-full md:w-auto overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          <span className="text-slate-500 font-mono text-[11px] shrink-0 mr-1">Filter:</span>
          {['ALL', 'Active', 'Completed'].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-full transition-all shrink-0 cursor-pointer ${
                statusFilter === s
                  ? 'bg-[#0c1a30] text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Mobile Candidate Cards (Screen width < md) */}
      <div className="block md:hidden space-y-3">
        {filteredCandidates.length === 0 ? (
          <div className="icx-card p-8 rounded-2xl text-center text-slate-500 text-xs">
            No candidates found. Use "+ Add Candidate" or "Bulk Import" to register candidate records.
          </div>
        ) : (
          filteredCandidates.map((cand) => (
            <div key={cand.id} className="icx-card p-4 rounded-2xl space-y-2.5">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <h4 className="font-bold text-sm text-[#0c1a30] font-sora truncate">{cand.name}</h4>
                  <p className="text-xs text-[#42506a] truncate">{cand.email}</p>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold font-mono shrink-0 ${
                  cand.status === 'Active' 
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                    : 'bg-slate-100 text-slate-600'
                }`}>
                  {cand.status}
                </span>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-[#e5ebf4] text-xs gap-2">
                <div className="min-w-0 flex-1">
                  <span className="font-mono font-bold text-[#1877e0] block truncate">{cand.studentId}</span>
                  <span className="text-[10px] text-slate-500 truncate block">{cand.department}</span>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => handleExportGdpr(cand.id, cand.name)}
                    disabled={exportingCandidateId === cand.id}
                    className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer inline-flex items-center"
                    title="Export GDPR / FERPA SAR Data Bundle"
                  >
                    {exportingCandidateId === cand.id ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-600" />
                    ) : (
                      <ShieldCheck className="w-3.5 h-3.5" />
                    )}
                  </button>
                  <button
                    onClick={() => onIssueForCandidate(cand)}
                    className="btn-primary-gradient px-3 py-1 text-[11px] font-bold shadow-xs cursor-pointer inline-flex items-center gap-1 text-[#051427]"
                    title="Issue verified certificate for this candidate"
                  >
                    <Award className="w-3 h-3" />
                    <span>Issue</span>
                  </button>
                  <button
                    onClick={() => onDeleteCandidate(cand.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer inline-flex items-center"
                    title="Remove candidate"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Desktop Table List (Screen width >= md) */}
      <div className="hidden md:block icx-card rounded-3xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#f4f7fc] border-b border-[#e5ebf4] font-mono font-bold text-[#42506a] uppercase text-[10px] tracking-wider">
              <tr>
                <th className="p-4 pl-6">Candidate ID</th>
                <th className="p-4">Candidate Name</th>
                <th className="p-4">Email</th>
                <th className="p-4">Department</th>
                <th className="p-4">Status</th>
                <th className="p-4 pr-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e5ebf4]">
              {filteredCandidates.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-slate-500">
                    No candidates found. Use "+ Add Candidate" or "Bulk Import" to register candidate records.
                  </td>
                </tr>
              ) : (
                filteredCandidates.map((cand) => (
                  <tr key={cand.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="p-4 pl-6 font-mono font-bold text-[#1877e0]">{cand.studentId}</td>
                    <td className="p-4 font-semibold text-[#0c1a30] font-sora">{cand.name}</td>
                    <td className="p-4 text-[#42506a]">{cand.email}</td>
                    <td className="p-4 text-slate-600">{cand.department}</td>
                    <td className="p-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono ${
                        cand.status === 'Active' 
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                          : 'bg-slate-100 text-slate-600'
                      }`}>
                        {cand.status}
                      </span>
                    </td>
                    <td className="p-4 pr-6 text-right space-x-2">
                      <button
                        onClick={() => handleExportGdpr(cand.id, cand.name)}
                        disabled={exportingCandidateId === cand.id}
                        className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer inline-flex items-center"
                        title="Export GDPR / FERPA SAR Data Bundle"
                      >
                        {exportingCandidateId === cand.id ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-600" />
                        ) : (
                          <ShieldCheck className="w-3.5 h-3.5" />
                        )}
                      </button>
                      <button
                        onClick={() => onIssueForCandidate(cand)}
                        className="btn-pill-primary px-3 py-1 text-[11px] font-bold shadow-xs cursor-pointer inline-flex items-center gap-1"
                        title="Issue verified certificate for this candidate"
                      >
                        <Award className="w-3 h-3" /> Issue
                      </button>
                      <button
                        onClick={() => onDeleteCandidate(cand.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer inline-flex items-center"
                        title="Remove candidate"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Single Candidate Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-[#e5ebf4] animate-scaleUp">
            <div className="flex items-center justify-between pb-3 border-b border-[#e5ebf4]">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#2ea6ff] to-[#7bd94f] flex items-center justify-center text-white shadow-xs">
                  <Plus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold font-sora text-[#0c1a30]">Register Single Candidate</h3>
                  <p className="text-[11px] text-[#42506a]">Add an individual candidate to your institution.</p>
                </div>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSingleSubmit} className="space-y-3.5 mt-4 text-xs">
              <div>
                <label className="block text-[#42506a] font-mono uppercase text-[11px] font-bold mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Rahul Kumar"
                  className="w-full p-2.5 bg-[#f4f7fc] border border-[#e5ebf4] rounded-xl focus:bg-white focus:outline-none focus:border-[#2ea6ff]"
                />
              </div>

              <div>
                <label className="block text-[#42506a] font-mono uppercase text-[11px] font-bold mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="e.g. candidate@university.edu"
                  className="w-full p-2.5 bg-[#f4f7fc] border border-[#e5ebf4] rounded-xl focus:bg-white focus:outline-none focus:border-[#2ea6ff]"
                />
              </div>

              <div>
                <label className="block text-[#42506a] font-mono uppercase text-[11px] font-bold mb-1">Candidate ID / Reg No</label>
                <input
                  type="text"
                  value={newStudentId}
                  onChange={(e) => setNewStudentId(e.target.value)}
                  placeholder="e.g. CAND-SU-2026-0891 (Leave blank to auto-generate)"
                  className="w-full p-2.5 bg-[#f4f7fc] border border-[#e5ebf4] rounded-xl focus:bg-white focus:outline-none focus:border-[#2ea6ff] font-mono uppercase"
                />
              </div>

              <div>
                <label className="block text-[#42506a] font-mono uppercase text-[11px] font-bold mb-1">Department</label>
                <input
                  type="text"
                  value={newDepartment}
                  onChange={(e) => setNewDepartment(e.target.value)}
                  className="w-full p-2.5 bg-[#f4f7fc] border border-[#e5ebf4] rounded-xl focus:bg-white focus:outline-none focus:border-[#2ea6ff]"
                />
              </div>

              <div className="pt-3 border-t border-[#e5ebf4] flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="btn-pill-ghost px-4 py-2 text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary-gradient px-4 py-2 text-xs font-bold cursor-pointer"
                >
                  Add Candidate
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bulk Excel & CSV Upload Modal */}
      {showBulkModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white max-w-2xl w-full border border-[#e5ebf4] shadow-2xl rounded-3xl p-6 sm:p-7 space-y-4 max-h-[92vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[#e5ebf4] pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-sora font-bold text-base text-[#0c1a30]">
                    Bulk Candidate Import (Excel & CSV)
                  </h3>
                  <p className="text-[11px] text-slate-500 font-mono">
                    Upload your completed spreadsheet or paste CSV candidate rows
                  </p>
                </div>
              </div>
              <button 
                onClick={() => {
                  setShowBulkModal(false);
                  setUploadedFileName(null);
                  setParsedRows([]);
                }} 
                className="text-slate-400 hover:text-slate-800 cursor-pointer p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Step 1: Download Template Callout Card */}
            <div className="p-4 bg-gradient-to-r from-emerald-50/90 to-teal-50/70 border border-emerald-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-0.5">
                <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-900 font-sora">
                  <FileSpreadsheet className="w-4 h-4 text-emerald-700" />
                  <span>Step 1: Download Formatted Excel Template</span>
                </div>
                <p className="text-[11px] text-emerald-800 leading-relaxed font-jakarta">
                  Download our pre-structured Excel template with sample rows and correct column headers. Edit in Excel, save, and upload below.
                </p>
              </div>
              <button
                onClick={handleDownloadExcelTemplate}
                className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs transition-colors shrink-0 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Download .xlsx Template</span>
              </button>
            </div>

            {/* Step 2: Upload Mode Selection Tabs */}
            <div className="flex items-center justify-between border-b border-slate-200 pb-1">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setUploadMode('excel')}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer ${
                    uploadMode === 'excel'
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <FileSpreadsheet className="w-3.5 h-3.5" />
                  <span>Upload Spreadsheet (.xlsx, .xls, .csv)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setUploadMode('csv')}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer ${
                    uploadMode === 'csv'
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Paste Raw CSV Text</span>
                </button>
              </div>

              {parsedRows.length > 0 && (
                <span className="text-[11px] text-slate-500 font-mono">
                  {parsedRows.filter(r => r.valid).length} of {parsedRows.length} Valid
                </span>
              )}
            </div>

            {/* Upload Area: Excel File Dropzone */}
            {uploadMode === 'excel' && (
              <div className="space-y-3">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx, .xls, .csv"
                  onChange={handleExcelFileUpload}
                  className="hidden"
                />

                <div
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
                    uploadedFileName
                      ? 'border-emerald-400 bg-emerald-50/40 hover:bg-emerald-50/70'
                      : 'border-slate-300 bg-slate-50/70 hover:bg-sky-50/50 hover:border-[#1877e0]'
                  }`}
                >
                  <div className="w-12 h-12 mx-auto mb-2.5 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center justify-center text-[#1877e0]">
                    <Upload className="w-6 h-6" />
                  </div>
                  {uploadedFileName ? (
                    <div>
                      <div className="font-bold text-xs text-emerald-800 font-sora flex items-center justify-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>{uploadedFileName}</span>
                      </div>
                      <p className="text-[11px] text-slate-500 font-mono mt-1">
                        Parsed {parsedRows.length} records ({parsedRows.filter(r => r.valid).length} valid). Click to replace file.
                      </p>
                    </div>
                  ) : (
                    <div>
                      <div className="font-bold text-xs text-[#0c1a30] font-sora">
                        Click to browse or drag & drop your candidate file
                      </div>
                      <p className="text-[11px] text-slate-500 font-mono mt-1">
                        Supports Microsoft Excel (.xlsx, .xls) and Comma-Separated Values (.csv)
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Upload Area: Raw CSV Textarea */}
            {uploadMode === 'csv' && (
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-[#66748c]">
                    Format: <code className="bg-[#f4f7fc] px-1 py-0.5 rounded font-mono border border-[#e5ebf4]">Name,Email,StudentID,Department</code>
                  </span>
                  <button
                    onClick={handleLoadSampleCsv}
                    className="text-[#1877e0] font-bold hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <span>Load Sample Data</span>
                  </button>
                </div>
                <textarea
                  rows={5}
                  value={rawCsvText}
                  onChange={(e) => {
                    setRawCsvText(e.target.value);
                    parseCsv(e.target.value);
                  }}
                  placeholder="Full Name,Email Address,CandidateID,Department&#10;Sophia Chen,sophia.chen@alumni.edu,CAND-001,Computer Science&#10;Dr. Elena Rostova,e.rostova@quantum.org,CAND-002,Physics"
                  className="w-full p-3 bg-[#f4f7fc] border border-[#e5ebf4] rounded-2xl font-mono text-[11px] focus:bg-white focus:outline-none focus:border-[#2ea6ff]"
                />
              </div>
            )}

            {/* Live Parsed Preview Table */}
            {parsedRows.length > 0 && (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold font-sora text-[#0c1a30]">
                    Parsed Candidate Preview ({parsedRows.length} rows)
                  </span>
                  <span className="text-[10px] text-emerald-700 font-mono font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    {parsedRows.filter(r => r.valid).length} Ready to Import
                  </span>
                </div>

                <div className="border border-[#e5ebf4] rounded-2xl overflow-hidden max-h-48 overflow-y-auto overflow-x-auto">
                  <table className="w-full text-left text-[11px] min-w-[440px]">
                    <thead className="bg-[#f4f7fc] border-b border-[#e5ebf4] font-mono font-bold text-[#42506a] uppercase text-[9px]">
                      <tr>
                        <th className="p-2.5">Status</th>
                        <th className="p-2.5">Candidate ID</th>
                        <th className="p-2.5">Candidate Name</th>
                        <th className="p-2.5">Email Address</th>
                        <th className="p-2.5">Department</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#e5ebf4]">
                      {parsedRows.map((r, idx) => (
                        <tr key={idx} className={r.valid ? 'hover:bg-slate-50' : 'bg-rose-50/50'}>
                          <td className="p-2.5">
                            {r.valid ? (
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <span className="text-[9px] font-bold text-rose-600 flex items-center gap-1">
                                <AlertCircle className="w-3 h-3" /> {r.error}
                              </span>
                            )}
                          </td>
                          <td className="p-2.5 font-mono text-slate-500 font-semibold">{r.studentId}</td>
                          <td className="p-2.5 font-semibold text-[#0c1a30]">{r.name}</td>
                          <td className="p-2.5 text-[#42506a]">{r.email}</td>
                          <td className="p-2.5 text-slate-500">{r.department}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Modal Footer Actions */}
            <div className="pt-3 border-t border-[#e5ebf4] flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => {
                  setShowBulkModal(false);
                  setUploadedFileName(null);
                  setParsedRows([]);
                }}
                className="btn-pill-ghost px-4 py-2 text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleExecuteBulkImport}
                disabled={parsedRows.filter(r => r.valid).length === 0}
                className="btn-primary-gradient px-4 py-2 text-xs font-bold flex items-center gap-1.5 disabled:opacity-50 cursor-pointer shadow-xs"
              >
                <Upload className="w-4 h-4" />
                <span>Import {parsedRows.filter(r => r.valid).length} Candidates</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
