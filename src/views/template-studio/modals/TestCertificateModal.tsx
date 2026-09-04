import React, { useState, useEffect } from 'react';
import { 
  X, 
  Sparkles, 
  Printer, 
  Download, 
  RefreshCw, 
  ShieldCheck, 
  Check, 
  ExternalLink,
  User,
  BookOpen,
  Award
} from 'lucide-react';
import { StudioDesignSchema, DemoCandidateData } from '../../../types/templateStudio';
import { DEFAULT_DEMO_DATA } from '../../../utils/templatePresets';
import { VectorCertificatePreview } from '../components/VectorCertificatePreview';

interface TestCertificateModalProps {
  schema: StudioDesignSchema;
  isOpen: boolean;
  onClose: () => void;
}

export const TestCertificateModal: React.FC<TestCertificateModalProps> = ({
  schema,
  isOpen,
  onClose
}) => {
  const [demoData, setDemoData] = useState<DemoCandidateData>({ ...DEFAULT_DEMO_DATA });
  const [scale, setScale] = useState(0.75);

  useEffect(() => {
    const updateScale = () => {
      const w = window.innerWidth;
      const isLandscape = schema?.page.orientation === 'landscape';
      if (w < 640) setScale(isLandscape ? 0.35 : 0.42);
      else if (w < 1024) setScale(isLandscape ? 0.55 : 0.6);
      else setScale(isLandscape ? 0.8 : 0.68);
    };
    updateScale();
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, [schema]);

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleRandomize = () => {
    const names = [
      'Ananya Sharma',
      'Rahul Kumar',
      'Dr. Marcus Vance Jr.',
      'Siddharth Nair',
      'Elena Rostova',
      'Prof. Jonathan H. Sterling III'
    ];
    const courses = [
      'Executive AI & Deep Learning Strategy',
      'Quantum Cryptography & Zero-Knowledge Architecture',
      'Advanced Cloud Systems & Kubernetes Engineering',
      'Healthcare Informatics & Clinical Governance'
    ];
    const grades = [
      'Awarded with Highest Distinction (Rank #1)',
      'First Class Honors (GPA 3.98)',
      'Grade A+ (Distinction)',
      'Summa Cum Laude'
    ];

    const randomName = names[Math.floor(Math.random() * names.length)];
    const randomCourse = courses[Math.floor(Math.random() * courses.length)];
    const randomGrade = grades[Math.floor(Math.random() * grades.length)];
    const randomNum = Math.floor(100000 + Math.random() * 900000);

    setDemoData(prev => ({
      ...prev,
      candidateName: randomName,
      courseName: randomCourse,
      grade: randomGrade,
      credentialId: `ICX-2026-X${randomNum.toString().slice(0, 5)}`,
      certificateNumber: `CERT-2026-${randomNum}`
    }));
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/85 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto animate-fadeIn">
      <div className="bg-white max-w-5xl w-full rounded-2xl sm:rounded-3xl border border-slate-300 shadow-2xl overflow-hidden flex flex-col my-auto max-h-[95vh]">
        {/* Modal Header */}
        <div className="bg-[#0A2540] text-white px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between border-b border-[#0F3559] shrink-0 gap-2 overflow-x-auto scrollbar-none">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-[#0284C7] flex items-center justify-center text-white shrink-0">
              <Sparkles className="w-4 h-4 text-amber-300" />
            </div>
            <div className="min-w-0">
              <h2 className="text-sm sm:text-base font-bold font-sora flex items-center gap-2 truncate">
                <span>Test Certificate</span>
                <span className="text-[9px] sm:text-[10px] font-mono font-bold uppercase tracking-wider bg-emerald-600 px-1.5 sm:px-2 py-0.5 rounded">
                  Live Vector
                </span>
              </h2>
              <p className="text-[10px] sm:text-xs text-slate-300 truncate">
                Simulating issued credential using template "{schema.name}"
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <button
              onClick={handleRandomize}
              className="px-2.5 sm:px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 rounded-lg transition-colors cursor-pointer border border-slate-600"
              title="Test with another randomized candidate"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Randomize</span>
            </button>

            <button
              onClick={handlePrint}
              className="px-2.5 sm:px-3 py-1.5 bg-[#0284C7] hover:bg-[#0369A1] text-white text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 rounded-lg transition-colors cursor-pointer shadow-xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Print Sample</span>
            </button>

            <button 
              onClick={onClose}
              className="p-1 text-slate-400 hover:text-white transition-colors ml-1 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-6 bg-slate-200/80 flex flex-col items-center justify-center">
          {/* Certificate Vector Preview Stage */}
          <div className="w-full flex items-center justify-center py-2 sm:py-4">
            <div className="shadow-2xl rounded-xl sm:rounded-2xl ring-1 ring-slate-400/20 max-w-full overflow-auto">
              <VectorCertificatePreview
                schema={schema}
                demoData={demoData}
                scale={scale}
                previewMode={true}
              />
            </div>
          </div>

          {/* Dynamic Data Simulation Controls Bar */}
          <div className="w-full max-w-4xl bg-white border border-slate-300 p-3 sm:p-4 rounded-xl sm:rounded-2xl shadow-sm mt-3 text-xs">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2 mb-3">
              <span className="font-bold text-slate-800 font-sora flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-[#0284C7]" />
                <span>Simulated Candidate Data Inputs</span>
              </span>
              <span className="text-[10px] text-slate-500 font-mono">
                Changes update the preview instantly
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 block mb-1">
                  Candidate Full Name
                </label>
                <input
                  type="text"
                  value={demoData.candidateName}
                  onChange={(e) => setDemoData({ ...demoData, candidateName: e.target.value })}
                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 font-semibold focus:bg-white text-slate-900 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 block mb-1">
                  Course / Program Title
                </label>
                <input
                  type="text"
                  value={demoData.courseName}
                  onChange={(e) => setDemoData({ ...demoData, courseName: e.target.value })}
                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 font-semibold focus:bg-white text-slate-900 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 block mb-1">
                  Grade / Distinction
                </label>
                <input
                  type="text"
                  value={demoData.grade}
                  onChange={(e) => setDemoData({ ...demoData, grade: e.target.value })}
                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 font-semibold focus:bg-white text-slate-900 focus:outline-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 border-t border-slate-200 px-6 py-3 flex items-center justify-between text-xs shrink-0">
          <div className="flex items-center gap-2 text-slate-500 font-mono text-[11px]">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Cryptographic Verification Vector • SHA-256 Validated</span>
          </div>

          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold uppercase tracking-wider text-xs transition-colors cursor-pointer"
          >
            Back to Editor
          </button>
        </div>
      </div>
    </div>
  );
};
