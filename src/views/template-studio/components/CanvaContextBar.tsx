import React, { useState, useRef, useEffect } from 'react';
import { 
  StudioElement, 
  StudioDesignSchema, 
  DynamicFieldKey, 
  PageSize, 
  PageOrientation 
} from '../../../types/templateStudio';
import { 
  Bold, 
  Italic, 
  Underline, 
  Strikethrough,
  AlignLeft, 
  AlignCenter, 
  AlignRight, 
  AlignJustify,
  Layers, 
  Lock, 
  Unlock, 
  Trash2, 
  Copy, 
  Sliders, 
  Palette, 
  Sparkles,
  ChevronDown,
  ArrowUp,
  ArrowDown,
  BringToFront,
  SendToBack,
  Type,
  Maximize2,
  Minimize2,
  Database,
  Award,
  QrCode,
  FileSignature
} from 'lucide-react';

interface CanvaContextBarProps {
  schema: StudioDesignSchema;
  selectedElement: StudioElement | null;
  onUpdateElement: (updated: StudioElement) => void;
  onDeleteElement: (id: string) => void;
  onDuplicateElement: (element: StudioElement) => void;
  onUpdateBackground: (bg: any) => void;
  onUpdatePageSize: (size: PageSize, orientation: PageOrientation) => void;
}

export const CanvaContextBar: React.FC<CanvaContextBarProps> = ({
  schema,
  selectedElement,
  onUpdateElement,
  onDeleteElement,
  onDuplicateElement,
  onUpdateBackground,
  onUpdatePageSize
}) => {
  // Popover state toggles
  const [openPopover, setOpenPopover] = useState<'font' | 'color' | 'fill' | 'stroke' | 'spacing' | 'position' | 'field' | 'opacity' | 'seal' | null>(null);

  // Close popovers on click outside
  const popoverRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handleDocumentClick = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setOpenPopover(null);
      }
    };
    document.addEventListener('mousedown', handleDocumentClick);
    return () => document.removeEventListener('mousedown', handleDocumentClick);
  }, []);

  const fontsList = [
    { name: 'Playfair Display', label: 'Playfair Display (Serif)', sample: 'Certificate' },
    { name: 'Cinzel', label: 'Cinzel (Diplomatic)', sample: 'HONORIS' },
    { name: 'Sora', label: 'Sora (Modern Display)', sample: 'Innovation' },
    { name: 'Plus Jakarta Sans', label: 'Plus Jakarta Sans (Body)', sample: 'Standard' },
    { name: 'Montserrat', label: 'Montserrat (Geometric)', sample: 'LEADERSHIP' },
    { name: 'JetBrains Mono', label: 'JetBrains Mono (Crypto)', sample: '0xSHA256' },
    { name: 'Alex Brush', label: 'Alex Brush (Cursive)', sample: 'Signature' },
    { name: 'Great Vibes', label: 'Great Vibes (Formal Calligraphy)', sample: 'Excellence' }
  ];

  const DYNAMIC_FIELD_OPTIONS: Array<{ key: DynamicFieldKey; label: string }> = [
    { key: 'candidateName', label: 'Student / Candidate Full Name' },
    { key: 'candidateId', label: 'Student ID / Registration Number' },
    { key: 'candidateEmail', label: 'Candidate Email Address' },
    { key: 'courseName', label: 'Course / Degree Program Name' },
    { key: 'courseCode', label: 'Course Code' },
    { key: 'department', label: 'Department / Faculty' },
    { key: 'duration', label: 'Course Duration' },
    { key: 'certificateNumber', label: 'Certificate Serial Number' },
    { key: 'credentialId', label: 'Verification Credential ID' },
    { key: 'issueDate', label: 'Date of Issuance' },
    { key: 'completionDate', label: 'Course Completion Date' },
    { key: 'score', label: 'Final Exam / Grade Score' },
    { key: 'grade', label: 'Honors & Grade (e.g. Distinction, A+)' },
    { key: 'orgName', label: 'Issuing University / Organisation' },
    { key: 'orgDepartment', label: 'Authority Board / Unit' },
    { key: 'signatory1Name', label: 'Dean / Signatory Name' },
    { key: 'signatory1Role', label: 'Dean / Signatory Title' },
    { key: 'signatory1Key', label: 'Digital Security Signature ID' },
    { key: 'verificationUrl', label: 'Online Verification Web Link' },
    { key: 'hashDigest', label: 'Tamper-Proof Verification Code' }
  ];

  // Helper for font size
  const changeFontSize = (delta: number) => {
    if (!selectedElement) return;
    const currentSize = selectedElement.fontSize || 16;
    const nextSize = Math.max(8, Math.min(120, currentSize + delta));
    onUpdateElement({ ...selectedElement, fontSize: nextSize });
  };

  // Helper for positioning
  const handleAlign = (alignment: 'canvas-center-x' | 'canvas-center-y' | 'forward' | 'backward' | 'front' | 'back') => {
    if (!selectedElement) return;
    if (alignment === 'canvas-center-x') {
      const newX = Math.round((schema.page.width - selectedElement.width) / 2);
      onUpdateElement({ ...selectedElement, x: newX });
    } else if (alignment === 'canvas-center-y') {
      const newY = Math.round((schema.page.height - selectedElement.height) / 2);
      onUpdateElement({ ...selectedElement, y: newY });
    } else {
      const currentZ = selectedElement.zIndex || 1;
      let newZ = currentZ;
      if (alignment === 'front') newZ = 100;
      else if (alignment === 'back') newZ = 1;
      else if (alignment === 'forward') newZ = currentZ + 1;
      else if (alignment === 'backward') newZ = Math.max(1, currentZ - 1);
      onUpdateElement({ ...selectedElement, zIndex: newZ });
    }
  };

  // 1. IF NO ELEMENT SELECTED -> SHOW CANVAS & PAGE SETTINGS BAR
  if (!selectedElement) {
    return (
      <div 
        ref={popoverRef}
        className="min-h-[44px] h-11 bg-white border-b border-[#e5ebf4] px-2 sm:px-4 flex items-center justify-between gap-2 sm:gap-4 text-xs select-none shrink-0 shadow-xs z-30 overflow-x-auto whitespace-nowrap scrollbar-none"
      >
        {/* Canvas Format Info */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="flex items-center gap-2 font-sora font-bold text-[#0c1a30] shrink-0">
            <Sparkles className="w-3.5 h-3.5 text-[#2ea6ff] shrink-0" />
            <span className="text-xs">Certificate Canvas:</span>
            <span className="font-mono bg-[#f4f7fc] text-[#1877e0] px-2.5 py-0.5 border border-[#e5ebf4] rounded-lg text-[11px] whitespace-nowrap font-bold">
              {schema.page.size} {schema.page.orientation === 'landscape' ? 'Landscape' : 'Portrait'} ({schema.page.width} × {schema.page.height}px)
            </span>
          </div>

          <div className="h-4 w-px bg-slate-200 shrink-0" />

          {/* Background Color Picker */}
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="text-slate-500 font-medium text-xs">Background:</span>
            <div className="relative">
              <button
                onClick={() => setOpenPopover(openPopover === 'color' ? null : 'color')}
                className="w-6 h-6 rounded-lg border border-slate-300 shadow-xs flex items-center justify-center p-0.5 hover:border-[#1877e0] cursor-pointer transition-all"
                style={{ backgroundColor: schema.background.value || '#FFFFFF' }}
                title="Change certificate background color"
              />
              {openPopover === 'color' && (
                <div className="absolute top-8 left-0 bg-white border border-[#e5ebf4] shadow-xl p-3 z-50 w-56 rounded-2xl space-y-2.5 animate-fadeIn">
                  <div className="text-[10px] font-mono font-bold uppercase text-slate-500">
                    Background Color
                  </div>
                  <div className="grid grid-cols-6 gap-1.5">
                    {['#FFFFFF', '#FBF8F3', '#FFFDF5', '#F8FAFC', '#0A2540', '#0F172A', '#1E293B', '#1E1B4B', '#FEF3C7', '#E0F2FE', '#F0FDF4', '#FAF5FF'].map(c => (
                      <button
                        key={c}
                        onClick={() => {
                          onUpdateBackground({ ...schema.background, value: c });
                          setOpenPopover(null);
                        }}
                        className="w-6 h-6 border border-slate-200 rounded-lg cursor-pointer hover:scale-110 transition-transform"
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>
                  <div className="pt-2 border-t border-slate-200 flex items-center gap-2">
                    <input
                      type="color"
                      value={schema.background.value || '#FFFFFF'}
                      onChange={(e) => onUpdateBackground({ ...schema.background, value: e.target.value })}
                      className="w-6 h-6 p-0 border border-slate-300 rounded-md cursor-pointer shrink-0"
                    />
                    <input
                      type="text"
                      value={schema.background.value || '#FFFFFF'}
                      onChange={(e) => onUpdateBackground({ ...schema.background, value: e.target.value })}
                      className="flex-1 px-2 py-0.5 text-xs font-mono font-bold uppercase border border-slate-200 rounded-lg"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Texture Overlay Toggle */}
          <button
            onClick={() => onUpdateBackground({
              ...schema.background,
              patternType: schema.background.patternType === 'parchment-texture' ? 'none' : 'parchment-texture'
            })}
            className={`px-3 py-1 text-xs rounded-full font-semibold flex items-center gap-1.5 transition-all cursor-pointer border shrink-0 ${
              schema.background.patternType === 'parchment-texture'
                ? 'bg-amber-50 border-amber-300 text-amber-900 font-bold shadow-xs'
                : 'bg-[#f4f7fc] border-[#e5ebf4] hover:bg-slate-100 text-slate-700'
            }`}
          >
            <Palette className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            <span>Parchment Security Texture {schema.background.patternType === 'parchment-texture' ? 'ON' : 'OFF'}</span>
          </button>
        </div>

        {/* Quick Orientation Switch */}
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="text-slate-400 text-[11px] font-medium">Layout:</span>
          <button
            onClick={() => onUpdatePageSize('A4', 'landscape')}
            className={`px-3 py-1 text-[11px] font-bold rounded-full cursor-pointer transition-all ${
              schema.page.size === 'A4' && schema.page.orientation === 'landscape'
                ? 'bg-[#0a1f44] text-[#2ea6ff] shadow-xs'
                : 'bg-[#f4f7fc] hover:bg-slate-100 text-slate-700'
            }`}
          >
            A4 Landscape
          </button>
          <button
            onClick={() => onUpdatePageSize('A4', 'portrait')}
            className={`px-3 py-1 text-[11px] font-bold rounded-full cursor-pointer transition-all ${
              schema.page.size === 'A4' && schema.page.orientation === 'portrait'
                ? 'bg-[#0a1f44] text-[#2ea6ff] shadow-xs'
                : 'bg-[#f4f7fc] hover:bg-slate-100 text-slate-700'
            }`}
          >
            A4 Portrait
          </button>
        </div>
      </div>
    );
  }

  const isTextLike = selectedElement.type === 'text' || selectedElement.type === 'dynamic-field';
  const isShapeLike = selectedElement.type === 'shape' || selectedElement.type === 'line' || selectedElement.type === 'frame';

  // 2. CONTEXTUAL TOOLBAR FOR SELECTED ELEMENT (EXACT CANVA STYLE)
  return (
    <div 
      ref={popoverRef}
      className="min-h-[44px] h-11 bg-white border-b border-[#e5ebf4] px-2 sm:px-4 flex items-center justify-between gap-2 sm:gap-3 text-xs select-none shrink-0 shadow-xs z-30 overflow-x-auto whitespace-nowrap scrollbar-none"
    >
      {/* Left Group: Type Specific Properties */}
      <div className="flex items-center gap-1.5 shrink-0">
        {/* TEXT & DYNAMIC FIELD CONTROLS */}
        {isTextLike && (
          <>
            {/* Font Family Dropdown */}
            <div className="relative">
              <button
                onClick={() => setOpenPopover(openPopover === 'font' ? null : 'font')}
                className="h-8 px-3 bg-[#f4f7fc] hover:bg-slate-100 border border-[#e5ebf4] rounded-xl flex items-center gap-2 font-medium text-slate-900 cursor-pointer min-w-[140px] justify-between transition-all"
                title="Font Family"
              >
                <span className="truncate max-w-[110px] text-xs font-semibold" style={{ fontFamily: selectedElement.fontFamily || 'Plus Jakarta Sans' }}>
                  {selectedElement.fontFamily || 'Plus Jakarta Sans'}
                </span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {openPopover === 'font' && (
                <div className="absolute top-9 left-0 bg-white border border-[#e5ebf4] shadow-xl p-1.5 z-50 w-60 rounded-2xl space-y-0.5 max-h-72 overflow-y-auto animate-fadeIn">
                  {fontsList.map(f => (
                    <button
                      key={f.name}
                      onClick={() => {
                        onUpdateElement({ ...selectedElement, fontFamily: f.name });
                        setOpenPopover(null);
                      }}
                      className={`w-full px-2.5 py-1.5 text-left rounded-xl flex items-center justify-between hover:bg-sky-50 transition-colors cursor-pointer ${
                        selectedElement.fontFamily === f.name ? 'bg-sky-50 font-bold text-[#1877e0]' : 'text-slate-800'
                      }`}
                    >
                      <span style={{ fontFamily: f.name }} className="text-sm">{f.name}</span>
                      <span className="text-[10px] text-slate-400 font-mono">{f.sample}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Font Size with - / input / + */}
            <div className="flex items-center bg-[#f4f7fc] border border-[#e5ebf4] rounded-xl h-8 px-1">
              <button
                onClick={() => changeFontSize(-2)}
                className="px-2 h-full hover:bg-slate-200 text-slate-700 font-bold text-sm cursor-pointer rounded-lg"
                title="Decrease Font Size"
              >
                -
              </button>
              <input
                type="number"
                value={selectedElement.fontSize || 16}
                onChange={(e) => onUpdateElement({ ...selectedElement, fontSize: Math.max(8, parseInt(e.target.value) || 16) })}
                className="w-10 h-full text-center bg-transparent font-mono font-bold text-xs text-slate-900 focus:outline-none"
              />
              <button
                onClick={() => changeFontSize(2)}
                className="px-2 h-full hover:bg-slate-200 text-slate-700 font-bold text-sm cursor-pointer rounded-lg"
                title="Increase Font Size"
              >
                +
              </button>
            </div>

            {/* Font Color Button with Underline Bar */}
            <div className="relative">
              <button
                onClick={() => setOpenPopover(openPopover === 'color' ? null : 'color')}
                className="h-8 w-8 bg-[#f4f7fc] hover:bg-slate-100 border border-[#e5ebf4] rounded-xl flex flex-col items-center justify-center cursor-pointer transition-all"
                title="Text Color"
              >
                <span className="font-serif font-black text-sm text-slate-900 leading-none">A</span>
                <div 
                  className="w-4 h-1 mt-0.5 rounded-full" 
                  style={{ backgroundColor: selectedElement.color || '#0A2540' }} 
                />
              </button>

              {openPopover === 'color' && (
                <div className="absolute top-9 left-0 bg-white border border-[#e5ebf4] shadow-xl p-3 z-50 w-56 rounded-2xl space-y-2.5 animate-fadeIn">
                  <div className="text-[10px] font-mono font-bold uppercase text-slate-500">Text Color</div>
                  <div className="grid grid-cols-6 gap-1.5">
                    {['#0A2540', '#1877E0', '#D97706', '#059669', '#DC2626', '#475569', '#000000', '#FFFFFF', '#6366F1', '#8B5CF6', '#EC4899', '#78350F'].map(c => (
                      <button
                        key={c}
                        onClick={() => {
                          onUpdateElement({ ...selectedElement, color: c });
                          setOpenPopover(null);
                        }}
                        className="w-6 h-6 border border-slate-200 rounded-lg cursor-pointer hover:scale-110 transition-transform"
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>
                  <div className="pt-2 border-t border-slate-200 flex items-center gap-2">
                    <input
                      type="color"
                      value={selectedElement.color || '#0A2540'}
                      onChange={(e) => onUpdateElement({ ...selectedElement, color: e.target.value })}
                      className="w-6 h-6 p-0 border border-slate-300 rounded-md cursor-pointer"
                    />
                    <input
                      type="text"
                      value={selectedElement.color || '#0A2540'}
                      onChange={(e) => onUpdateElement({ ...selectedElement, color: e.target.value })}
                      className="flex-1 px-2 py-0.5 text-xs font-mono font-bold uppercase border border-slate-200 rounded-lg"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Bold, Italic, Underline */}
            <div className="flex items-center bg-[#f4f7fc] border border-[#e5ebf4] rounded-xl h-8 p-0.5">
              <button
                onClick={() => onUpdateElement({ 
                  ...selectedElement, 
                  fontWeight: selectedElement.fontWeight === '700' || selectedElement.fontWeight === 'bold' ? 'normal' : '700' 
                })}
                className={`w-7 h-full rounded-lg flex items-center justify-center transition-colors cursor-pointer ${
                  selectedElement.fontWeight === '700' || selectedElement.fontWeight === 'bold' ? 'bg-[#0a1f44] text-[#2ea6ff]' : 'text-slate-700 hover:bg-white'
                }`}
                title="Bold"
              >
                <Bold className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => onUpdateElement({ 
                  ...selectedElement, 
                  fontStyle: selectedElement.fontStyle === 'italic' ? 'normal' : 'italic' 
                })}
                className={`w-7 h-full rounded-lg flex items-center justify-center transition-colors cursor-pointer ${
                  selectedElement.fontStyle === 'italic' ? 'bg-[#0a1f44] text-[#2ea6ff]' : 'text-slate-700 hover:bg-white'
                }`}
                title="Italic"
              >
                <Italic className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => onUpdateElement({ 
                  ...selectedElement, 
                  textDecoration: selectedElement.textDecoration === 'underline' ? 'none' : 'underline' 
                })}
                className={`w-7 h-full rounded-lg flex items-center justify-center transition-colors cursor-pointer ${
                  selectedElement.textDecoration === 'underline' ? 'bg-[#0a1f44] text-[#2ea6ff]' : 'text-slate-700 hover:bg-white'
                }`}
                title="Underline"
              >
                <Underline className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Alignment Toggle (Left / Center / Right) */}
            <div className="flex items-center bg-[#f4f7fc] border border-[#e5ebf4] rounded-xl h-8 p-0.5">
              {[
                { align: 'left', icon: AlignLeft },
                { align: 'center', icon: AlignCenter },
                { align: 'right', icon: AlignRight }
              ].map(({ align, icon: Icon }) => (
                <button
                  key={align}
                  onClick={() => onUpdateElement({ ...selectedElement, textAlign: align as any })}
                  className={`w-7 h-full rounded-lg flex items-center justify-center transition-colors cursor-pointer ${
                    (selectedElement.textAlign || 'center') === align ? 'bg-[#0a1f44] text-[#2ea6ff]' : 'text-slate-700 hover:bg-white'
                  }`}
                  title={`Align ${align}`}
                >
                  <Icon className="w-3.5 h-3.5" />
                </button>
              ))}
            </div>

            {/* Spacing Popover */}
            <div className="relative">
              <button
                onClick={() => setOpenPopover(openPopover === 'spacing' ? null : 'spacing')}
                className="h-8 px-2.5 bg-[#f4f7fc] hover:bg-slate-100 border border-[#e5ebf4] rounded-xl flex items-center gap-1 text-slate-700 font-semibold cursor-pointer"
                title="Letter & Line Spacing"
              >
                <Sliders className="w-3.5 h-3.5" />
                <span className="text-[11px] font-bold">Spacing</span>
              </button>

              {openPopover === 'spacing' && (
                <div className="absolute top-9 left-0 bg-white border border-[#e5ebf4] shadow-xl p-3 z-50 w-56 rounded-2xl space-y-3 animate-fadeIn">
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] font-mono text-slate-500">
                      <span>Letter Spacing</span>
                      <span>{selectedElement.letterSpacing || 0}px</span>
                    </div>
                    <input
                      type="range"
                      min="-2"
                      max="20"
                      value={selectedElement.letterSpacing || 0}
                      onChange={(e) => onUpdateElement({ ...selectedElement, letterSpacing: parseInt(e.target.value) })}
                      className="w-full accent-[#1877e0] cursor-pointer"
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] font-mono text-slate-500">
                      <span>Line Spacing</span>
                      <span>{selectedElement.lineHeight || 1.3}</span>
                    </div>
                    <input
                      type="range"
                      min="0.8"
                      max="2.5"
                      step="0.1"
                      value={selectedElement.lineHeight || 1.3}
                      onChange={(e) => onUpdateElement({ ...selectedElement, lineHeight: parseFloat(e.target.value) })}
                      className="w-full accent-[#1877e0] cursor-pointer"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Dynamic Data Field Token Switcher */}
            {selectedElement.type === 'dynamic-field' && (
              <div className="relative">
                <button
                  onClick={() => setOpenPopover(openPopover === 'field' ? null : 'field')}
                  className="h-8 px-2.5 bg-sky-50 hover:bg-sky-100 border border-sky-200 rounded-xl flex items-center gap-1.5 text-[#1877e0] font-bold cursor-pointer transition-all"
                  title="Change Dynamic Data Token"
                >
                  <Database className="w-3 h-3" />
                  <span className="truncate max-w-[120px] text-xs">
                    {DYNAMIC_FIELD_OPTIONS.find(f => f.key === selectedElement.fieldKey)?.label || 'Field'}
                  </span>
                  <ChevronDown className="w-3 h-3" />
                </button>

                {openPopover === 'field' && (
                  <div className="absolute top-9 left-0 bg-white border border-[#e5ebf4] shadow-xl p-1.5 z-50 w-60 rounded-2xl max-h-72 overflow-y-auto animate-fadeIn">
                    <div className="px-2 py-1 text-[9px] font-mono font-bold uppercase text-slate-400">
                      Select Bound Dynamic Field
                    </div>
                    {DYNAMIC_FIELD_OPTIONS.map(f => (
                      <button
                        key={f.key}
                        onClick={() => {
                          onUpdateElement({ ...selectedElement, fieldKey: f.key, name: f.label });
                          setOpenPopover(null);
                        }}
                        className={`w-full px-2.5 py-1.5 text-left rounded-xl text-xs flex items-center justify-between hover:bg-sky-50 cursor-pointer ${
                          selectedElement.fieldKey === f.key ? 'bg-sky-50 font-bold text-[#1877e0]' : 'text-slate-700'
                        }`}
                      >
                        <span className="truncate max-w-[160px]">{f.label}</span>
                        <span className="text-[9px] font-mono text-slate-400">`{`{{${f.key}}}`}`</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}

        {/* SHAPES & FRAMES CONTROLS */}
        {isShapeLike && (
          <>
            {/* Fill Color */}
            <div className="relative">
              <button
                onClick={() => setOpenPopover(openPopover === 'fill' ? null : 'fill')}
                className="h-8 px-2.5 bg-[#f4f7fc] hover:bg-slate-100 border border-[#e5ebf4] rounded-xl flex items-center gap-1.5 text-slate-700 font-semibold cursor-pointer"
                title="Fill Color"
              >
                <div 
                  className="w-4 h-4 rounded-md border border-slate-300 shadow-xs" 
                  style={{ backgroundColor: selectedElement.fill === 'transparent' ? '#FFF' : selectedElement.fill || '#FFF' }} 
                />
                <span className="text-xs">Fill</span>
              </button>

              {openPopover === 'fill' && (
                <div className="absolute top-9 left-0 bg-white border border-[#e5ebf4] shadow-xl p-3 z-50 w-56 rounded-2xl space-y-2 animate-fadeIn">
                  <div className="text-[10px] font-mono font-bold uppercase text-slate-500">Fill Color</div>
                  <div className="grid grid-cols-6 gap-1.5">
                    {['#FFFFFF', '#F8FAFC', '#E2E8F0', '#0A2540', '#1877E0', '#059669', '#DC2626', '#D97706', '#6366F1', '#8B5CF6', '#EC4899', '#000000'].map(c => (
                      <button
                        key={c}
                        onClick={() => {
                          onUpdateElement({ ...selectedElement, fill: c });
                          setOpenPopover(null);
                        }}
                        className="w-6 h-6 border border-slate-200 rounded-lg cursor-pointer hover:scale-110 transition-transform"
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>
                  <button
                    onClick={() => {
                      onUpdateElement({ ...selectedElement, fill: 'transparent' });
                      setOpenPopover(null);
                    }}
                    className="w-full py-1 text-center text-xs font-bold text-[#1877e0] bg-sky-50 rounded-lg hover:bg-sky-100 cursor-pointer"
                  >
                    Transparent / No Fill
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Right Group: Alignment, Position, Lock, Duplicate, Delete */}
      <div className="flex items-center gap-1.5 shrink-0">
        {/* Opacity Slider */}
        <div className="relative">
          <button
            onClick={() => setOpenPopover(openPopover === 'opacity' ? null : 'opacity')}
            className="h-8 px-2.5 bg-[#f4f7fc] hover:bg-slate-100 border border-[#e5ebf4] rounded-xl flex items-center gap-1 text-slate-700 font-semibold cursor-pointer"
            title="Transparency / Opacity"
          >
            <span className="text-[11px] font-mono font-bold">{selectedElement.opacity ?? 100}%</span>
          </button>

          {openPopover === 'opacity' && (
            <div className="absolute top-9 right-0 bg-white border border-[#e5ebf4] shadow-xl p-3 z-50 w-48 rounded-2xl space-y-1.5 animate-fadeIn">
              <div className="flex justify-between text-[10px] font-mono text-slate-500 font-bold">
                <span>Opacity</span>
                <span>{selectedElement.opacity ?? 100}%</span>
              </div>
              <input
                type="range"
                min="10"
                max="100"
                value={selectedElement.opacity ?? 100}
                onChange={(e) => onUpdateElement({ ...selectedElement, opacity: parseInt(e.target.value) })}
                className="w-full accent-[#1877e0] cursor-pointer"
              />
            </div>
          )}
        </div>

        {/* Position Menu (Layering + Canvas Center) */}
        <div className="relative">
          <button
            onClick={() => setOpenPopover(openPopover === 'position' ? null : 'position')}
            className="h-8 px-3 bg-[#f4f7fc] hover:bg-slate-100 border border-[#e5ebf4] rounded-xl flex items-center gap-1.5 text-slate-700 font-semibold cursor-pointer transition-all"
            title="Position & Layering"
          >
            <Layers className="w-3.5 h-3.5 text-[#1877e0]" />
            <span className="text-xs font-bold">Position</span>
          </button>

          {openPopover === 'position' && (
            <div className="absolute top-9 right-0 bg-white border border-[#e5ebf4] shadow-xl p-2.5 z-50 w-52 rounded-2xl space-y-2 animate-fadeIn text-xs">
              <div className="text-[10px] font-mono font-bold uppercase text-slate-400 px-1">
                Align to Canvas
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  onClick={() => {
                    handleAlign('canvas-center-x');
                    setOpenPopover(null);
                  }}
                  className="px-2 py-1.5 bg-[#f4f7fc] hover:bg-sky-50 hover:text-[#1877e0] rounded-xl text-[10px] font-bold cursor-pointer transition-all"
                >
                  Center Horizontal
                </button>
                <button
                  onClick={() => {
                    handleAlign('canvas-center-y');
                    setOpenPopover(null);
                  }}
                  className="px-2 py-1.5 bg-[#f4f7fc] hover:bg-sky-50 hover:text-[#1877e0] rounded-xl text-[10px] font-bold cursor-pointer transition-all"
                >
                  Center Vertical
                </button>
              </div>

              <div className="text-[10px] font-mono font-bold uppercase text-slate-400 px-1 pt-1.5 border-t border-slate-100">
                Layer Stacking (Z: {selectedElement.zIndex || 1})
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  onClick={() => handleAlign('forward')}
                  className="px-2 py-1.5 bg-[#f4f7fc] hover:bg-slate-100 rounded-xl text-[10px] flex items-center justify-center gap-1 cursor-pointer font-medium"
                >
                  <ArrowUp className="w-3 h-3" />
                  <span>Forward</span>
                </button>
                <button
                  onClick={() => handleAlign('backward')}
                  className="px-2 py-1.5 bg-[#f4f7fc] hover:bg-slate-100 rounded-xl text-[10px] flex items-center justify-center gap-1 cursor-pointer font-medium"
                >
                  <ArrowDown className="w-3 h-3" />
                  <span>Backward</span>
                </button>
                <button
                  onClick={() => handleAlign('front')}
                  className="px-2 py-1.5 bg-[#f4f7fc] hover:bg-slate-100 rounded-xl text-[10px] flex items-center justify-center gap-1 cursor-pointer font-medium"
                >
                  <BringToFront className="w-3 h-3" />
                  <span>To Front</span>
                </button>
                <button
                  onClick={() => handleAlign('back')}
                  className="px-2 py-1.5 bg-[#f4f7fc] hover:bg-slate-100 rounded-xl text-[10px] flex items-center justify-center gap-1 cursor-pointer font-medium"
                >
                  <SendToBack className="w-3 h-3" />
                  <span>To Back</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Lock / Unlock Toggle */}
        <button
          onClick={() => onUpdateElement({ ...selectedElement, locked: !selectedElement.locked })}
          className={`h-8 w-8 rounded-xl border flex items-center justify-center transition-all cursor-pointer ${
            selectedElement.locked 
              ? 'bg-amber-500 text-white border-amber-600 shadow-xs' 
              : 'bg-[#f4f7fc] hover:bg-slate-100 text-slate-700 border-[#e5ebf4]'
          }`}
          title={selectedElement.locked ? 'Unlock element' : 'Lock element position'}
        >
          {selectedElement.locked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
        </button>

        {/* Duplicate Element */}
        <button
          onClick={() => onDuplicateElement(selectedElement)}
          className="h-8 w-8 bg-[#f4f7fc] hover:bg-slate-100 text-slate-700 border border-[#e5ebf4] rounded-xl flex items-center justify-center transition-all cursor-pointer"
          title="Duplicate Element (Ctrl+D)"
        >
          <Copy className="w-3.5 h-3.5" />
        </button>

        {/* Delete Element */}
        <button
          onClick={() => onDeleteElement(selectedElement.id)}
          className="h-8 w-8 bg-[#f4f7fc] hover:bg-rose-50 hover:text-rose-600 text-slate-500 border border-[#e5ebf4] rounded-xl flex items-center justify-center transition-all cursor-pointer"
          title="Delete Element (Delete)"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
