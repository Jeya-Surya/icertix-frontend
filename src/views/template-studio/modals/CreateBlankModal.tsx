import React, { useState } from 'react';
import { 
  X, 
  Layout, 
  FileText, 
  Check, 
  ArrowRight,
  Palette,
  Maximize2
} from 'lucide-react';
import { PageSize, PageOrientation, StudioDesignSchema } from '../../../types/templateStudio';
import { Organisation } from '../../../types';
import { createBlankDesignSchema, PAGE_SIZES } from '../../../utils/templatePresets';

interface CreateBlankModalProps {
  currentOrg: Organisation;
  isOpen: boolean;
  onClose: () => void;
  onCreate: (schema: StudioDesignSchema) => void;
}

export const CreateBlankModal: React.FC<CreateBlankModalProps> = ({
  currentOrg,
  isOpen,
  onClose,
  onCreate
}) => {
  const [templateName, setTemplateName] = useState(`${currentOrg.name} Certificate`);
  const [pageSize, setPageSize] = useState<PageSize>('A4');
  const [orientation, setOrientation] = useState<PageOrientation>('landscape');
  const [bgType, setBgType] = useState<'white' | 'ivory' | 'dark' | 'slate' | 'cream' | 'custom'>('white');
  const [customBgColor, setCustomBgColor] = useState('#FFFFFF');

  if (!isOpen) return null;

  const bgColors: Record<string, string> = {
    white: '#FFFFFF',
    ivory: '#FAF8F5',
    dark: '#0A2540',
    slate: '#F8FAFC',
    cream: '#FFFDF0',
    custom: customBgColor
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const finalBg = bgColors[bgType] || '#FFFFFF';
    const schema = createBlankDesignSchema(currentOrg, pageSize, orientation, finalBg);
    schema.name = templateName.trim() || 'Untitled Certificate Template';
    onCreate(schema);
    onClose();
  };

  const currentDims = PAGE_SIZES[pageSize][orientation];

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-fadeIn">
      <div className="bg-white max-w-xl w-full rounded-2xl sm:rounded-3xl border border-[#e5ebf4] shadow-2xl overflow-hidden flex flex-col my-auto max-h-[92vh]">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-[#050e20] via-[#0a1f44] to-[#0e2a5c] text-white px-4 sm:px-6 py-3.5 sm:py-5 flex items-center justify-between border-b border-[#0e2a5c] shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="w-8 sm:w-9 h-8 sm:h-9 rounded-xl sm:rounded-2xl bg-sky-500/20 border border-sky-400/30 flex items-center justify-center text-[#2ea6ff] shrink-0">
              <Layout className="w-4 sm:w-5 h-4 sm:h-5" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold font-sora text-white">Create Blank Certificate</h2>
              <p className="text-[11px] sm:text-xs text-slate-300">Configure page size, orientation, and base canvas background</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-full transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleCreate} className="p-4 sm:p-6 space-y-4 sm:space-y-5 text-xs overflow-y-auto">
          {/* Template Name */}
          <div>
            <label className="block text-[#0c1a30] font-bold uppercase tracking-wider text-[11px] mb-1.5 font-mono">
              Template Title
            </label>
            <input
              type="text"
              required
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              placeholder="e.g. Master of Science Degree Template"
              className="w-full px-3.5 py-2.5 bg-[#f4f7fc] border border-[#e5ebf4] rounded-xl text-slate-900 font-semibold focus:bg-white focus:outline-none focus:border-[#2ea6ff] text-sm transition-all"
            />
          </div>

          {/* Page Size & Aspect */}
          <div>
            <label className="block text-[#0c1a30] font-bold uppercase tracking-wider text-[11px] mb-1.5 font-mono">
              Standard Page Size
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-2.5">
              {[
                { id: 'A4', label: 'A4 Standard', desc: 'International Standard' },
                { id: 'A5', label: 'A5 Compact', desc: 'Mini Diploma' },
                { id: 'Letter', label: 'US Letter', desc: 'North America Standard' }
              ].map((size) => (
                <button
                  key={size.id}
                  type="button"
                  onClick={() => setPageSize(size.id as PageSize)}
                  className={`p-3 border rounded-2xl text-left transition-all cursor-pointer ${
                    pageSize === size.id
                      ? 'border-[#2ea6ff] bg-sky-50/80 shadow-xs ring-2 ring-[#2ea6ff]/20'
                      : 'border-[#e5ebf4] bg-[#f4f7fc] hover:bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#0c1a30] text-xs">{size.label}</span>
                    {pageSize === size.id && <Check className="w-3.5 h-3.5 text-[#1877e0]" />}
                  </div>
                  <span className="text-[10px] text-[#66748c] block mt-0.5">{size.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Orientation */}
          <div>
            <label className="block text-[#0c1a30] font-bold uppercase tracking-wider text-[11px] mb-1.5 font-mono">
              Orientation
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setOrientation('landscape')}
                className={`p-3.5 border rounded-2xl flex items-center gap-3 transition-all cursor-pointer ${
                  orientation === 'landscape'
                    ? 'border-[#2ea6ff] bg-sky-50/80 shadow-xs ring-2 ring-[#2ea6ff]/20'
                    : 'border-[#e5ebf4] bg-[#f4f7fc] hover:bg-white'
                }`}
              >
                <div className="w-10 h-7 border-2 border-slate-600 bg-white rounded-md flex items-center justify-center text-[9px] font-mono font-bold text-slate-500">
                  {currentDims.width}x{currentDims.height}
                </div>
                <div className="text-left">
                  <div className="font-bold text-[#0c1a30]">Landscape (Recommended)</div>
                  <div className="text-[10px] text-[#66748c]">Traditional diploma ratio</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setOrientation('portrait')}
                className={`p-3.5 border rounded-2xl flex items-center gap-3 transition-all cursor-pointer ${
                  orientation === 'portrait'
                    ? 'border-[#2ea6ff] bg-sky-50/80 shadow-xs ring-2 ring-[#2ea6ff]/20'
                    : 'border-[#e5ebf4] bg-[#f4f7fc] hover:bg-white'
                }`}
              >
                <div className="w-7 h-10 border-2 border-slate-600 bg-white rounded-md flex items-center justify-center text-[8px] font-mono font-bold text-slate-500">
                  {PAGE_SIZES[pageSize].portrait.width}x{PAGE_SIZES[pageSize].portrait.height}
                </div>
                <div className="text-left">
                  <div className="font-bold text-[#0c1a30]">Portrait</div>
                  <div className="text-[10px] text-[#66748c]">Vertical document ratio</div>
                </div>
              </button>
            </div>
          </div>

          {/* Background Canvas Color */}
          <div>
            <label className="block text-[#0c1a30] font-bold uppercase tracking-wider text-[11px] mb-1.5 font-mono">
              Initial Background Canvas
            </label>
            <div className="grid grid-cols-5 gap-2">
              {[
                { id: 'white', label: 'Crisp White', color: '#FFFFFF', border: 'border-slate-300' },
                { id: 'ivory', label: 'Ivory Parchment', color: '#FAF8F5', border: 'border-amber-200' },
                { id: 'slate', label: 'Cool Slate', color: '#F8FAFC', border: 'border-slate-200' },
                { id: 'cream', label: 'Academic Cream', color: '#FFFDF0', border: 'border-yellow-200' },
                { id: 'dark', label: 'Obsidian Navy', color: '#0A2540', border: 'border-slate-800' }
              ].map((bg) => (
                <button
                  key={bg.id}
                  type="button"
                  onClick={() => setBgType(bg.id as any)}
                  className={`p-2 border rounded-xl text-center transition-all cursor-pointer ${
                    bgType === bg.id
                      ? 'ring-2 ring-[#2ea6ff] border-[#2ea6ff] bg-sky-50/40'
                      : 'border-[#e5ebf4] bg-[#f4f7fc] hover:bg-white'
                  }`}
                >
                  <div 
                    className={`w-full h-7 border rounded-lg shadow-2xs mb-1.5 ${bg.border}`}
                    style={{ backgroundColor: bg.color }}
                  />
                  <span className="text-[10px] font-semibold text-slate-700 block truncate">
                    {bg.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Action Footer */}
          <div className="pt-4 border-t border-[#e5ebf4] flex items-center justify-between">
            <button
              type="button"
              onClick={onClose}
              className="btn-pill-ghost px-4 py-2 text-xs font-semibold rounded-full border-slate-200 hover:bg-slate-100 cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="btn-primary-gradient px-6 py-2.5 text-xs font-bold rounded-full flex items-center gap-2 shadow-xs cursor-pointer text-[#051427]"
            >
              <span>Open in Canva Studio</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
