import React from 'react';
import { 
  X, 
  Eye, 
  Palette, 
  Printer, 
  Layers, 
  ShieldCheck, 
  ArrowRight 
} from 'lucide-react';
import { StudioDesignSchema } from '../../../types/templateStudio';
import { DEFAULT_DEMO_DATA } from '../../../utils/templatePresets';
import { VectorCertificatePreview } from '../components/VectorCertificatePreview';

interface StudioPreviewModalProps {
  schema: StudioDesignSchema | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenInEditor: (schema: StudioDesignSchema) => void;
}

export const StudioPreviewModal: React.FC<StudioPreviewModalProps> = ({
  schema,
  isOpen,
  onClose,
  onOpenInEditor
}) => {
  const [scale, setScale] = React.useState(0.75);

  React.useEffect(() => {
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

  if (!isOpen || !schema) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/85 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto animate-fadeIn">
      <div className="bg-white max-w-5xl w-full rounded-2xl sm:rounded-3xl border border-[#e5ebf4] shadow-2xl overflow-hidden flex flex-col my-auto max-h-[95vh]">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-[#050e20] via-[#0a1f44] to-[#0e2a5c] text-white px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between border-b border-[#0e2a5c] shrink-0 gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 sm:w-9 h-8 sm:h-9 rounded-xl sm:rounded-2xl bg-sky-500/20 border border-sky-400/30 flex items-center justify-center text-[#2ea6ff] shrink-0">
              <Eye className="w-4 sm:w-5 h-4 sm:h-5" />
            </div>
            <div className="min-w-0">
              <h2 className="text-sm sm:text-base font-bold font-sora text-white truncate">{schema.name}</h2>
              <p className="text-[10px] sm:text-xs text-slate-300 truncate">
                {schema.category} • {schema.page.size} {schema.page.orientation} • v{schema.version}.0
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <button
              onClick={() => {
                onClose();
                onOpenInEditor(schema);
              }}
              className="btn-primary-gradient px-3 sm:px-4 py-1.5 text-xs font-bold rounded-full flex items-center gap-1.5 shadow-xs cursor-pointer text-[#051427]"
            >
              <Palette className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Open in Studio</span>
              <span className="sm:hidden">Edit</span>
            </button>

            <button 
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-full transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body: Vector Certificate Stage */}
        <div className="flex-1 overflow-auto p-3 sm:p-6 bg-slate-100 flex items-center justify-center min-h-[260px]">
          <div className="shadow-xl rounded-xl sm:rounded-2xl overflow-hidden ring-1 ring-slate-900/10 max-w-full">
            <VectorCertificatePreview
              schema={schema}
              demoData={DEFAULT_DEMO_DATA}
              scale={scale}
              previewMode={true}
            />
          </div>
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 border-t border-[#e5ebf4] px-4 sm:px-6 py-3 flex items-center justify-between text-xs shrink-0 gap-2">
          <div className="flex items-center gap-1.5 text-slate-600 font-mono text-[10px] sm:text-[11px] truncate">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span className="truncate">Ready for batch generation and candidate distribution</span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={onClose}
              className="btn-pill-ghost px-3 sm:px-4 py-1.5 text-xs font-semibold rounded-full border-slate-200 hover:bg-slate-100 cursor-pointer"
            >
              Close
            </button>

            <button
              onClick={() => {
                onClose();
                onOpenInEditor(schema);
              }}
              className="btn-primary-gradient px-3.5 sm:px-5 py-1.5 text-xs font-bold rounded-full flex items-center gap-1.5 shadow-xs cursor-pointer text-[#051427]"
            >
              <span className="hidden sm:inline">Customize Design</span>
              <span className="sm:hidden">Customize</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
