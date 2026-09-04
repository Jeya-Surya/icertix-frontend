import React, { useState } from 'react';
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
  BringToFront, 
  SendToBack, 
  ArrowUp, 
  ArrowDown, 
  Sliders, 
  Palette, 
  Maximize2,
  Sparkles,
  QrCode,
  Award,
  FileSignature,
  Database,
  Grid3X3,
  RotateCw,
  Move,
  CheckCircle2,
  Info,
  ChevronRight,
  ChevronLeft,
  Type,
  ShieldCheck,
  Check,
  Braces
} from 'lucide-react';

interface PropertiesPanelProps {
  schema: StudioDesignSchema;
  selectedElementId: string | null;
  onUpdateElement: (updated: StudioElement) => void;
  onDeleteElement: (id: string) => void;
  onDuplicateElement: (element: StudioElement) => void;
  onUpdatePageSize: (size: PageSize, orientation: PageOrientation) => void;
  onUpdateBackground: (bg: any) => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export const PropertiesPanel: React.FC<PropertiesPanelProps> = ({
  schema,
  selectedElementId,
  onUpdateElement,
  onDeleteElement,
  onDuplicateElement,
  onUpdatePageSize,
  onUpdateBackground,
  isCollapsed = false,
  onToggleCollapse
}) => {
  const selectedElement = schema.elements.find(el => el.id === selectedElementId) || null;

  // If collapsed, show slim vertical expand handle
  if (isCollapsed) {
    return (
      <div 
        onClick={onToggleCollapse}
        className="w-10 bg-white border-l border-[#e5ebf4] flex flex-col items-center py-4 hover:bg-sky-50 text-slate-500 hover:text-[#1877e0] cursor-pointer transition-all shadow-xs shrink-0 select-none group"
        title="Expand Properties Inspector"
      >
        <ChevronLeft className="w-4 h-4 mb-3 text-slate-400 group-hover:text-[#1877e0] group-hover:-translate-x-0.5 transition-transform" />
        <Sliders className="w-4 h-4 mb-2 text-slate-400 group-hover:text-[#1877e0]" />
        <span className="text-[10px] font-mono font-bold tracking-widest uppercase [writing-mode:vertical-lr] rotate-180 text-slate-500 group-hover:text-[#1877e0] mt-2">
          Inspector
        </span>
      </div>
    );
  }

  // Alignment helpers
  const handleAlign = (alignment: 'canvas-center-x' | 'canvas-center-y' | 'top' | 'middle' | 'bottom') => {
    if (!selectedElement) return;

    let newX = selectedElement.x;
    let newY = selectedElement.y;

    if (alignment === 'canvas-center-x') {
      newX = Math.round((schema.page.width - selectedElement.width) / 2);
    } else if (alignment === 'canvas-center-y') {
      newY = Math.round((schema.page.height - selectedElement.height) / 2);
    } else if (alignment === 'top') {
      newY = 40;
    } else if (alignment === 'middle') {
      newY = Math.round((schema.page.height - selectedElement.height) / 2);
    } else if (alignment === 'bottom') {
      newY = schema.page.height - selectedElement.height - 40;
    }

    onUpdateElement({ ...selectedElement, x: newX, y: newY });
  };

  // Layer ordering helpers
  const handleLayerOrder = (direction: 'forward' | 'backward' | 'front' | 'back') => {
    if (!selectedElement) return;
    const currentZ = selectedElement.zIndex || 1;
    let newZ = currentZ;

    if (direction === 'front') newZ = 100;
    else if (direction === 'back') newZ = 1;
    else if (direction === 'forward') newZ = currentZ + 1;
    else if (direction === 'backward') newZ = Math.max(1, currentZ - 1);

    onUpdateElement({ ...selectedElement, zIndex: newZ });
  };

  const DYNAMIC_FIELD_KEYS: Array<{ key: DynamicFieldKey; label: string; helper: string }> = [
    { key: 'candidateName', label: 'Student / Candidate Full Name', helper: 'Replaced with recipient name' },
    { key: 'candidateId', label: 'Student ID / Registration Number', helper: 'Unique candidate ID' },
    { key: 'candidateEmail', label: 'Candidate Email Address', helper: 'Recipient email' },
    { key: 'courseName', label: 'Course / Degree Program Name', helper: 'Title of the program' },
    { key: 'courseCode', label: 'Course Code', helper: 'Catalog code (e.g. CS-101)' },
    { key: 'department', label: 'Department / Faculty', helper: 'Academic department' },
    { key: 'duration', label: 'Course Duration', helper: 'e.g. 12 Weeks (120 Hours)' },
    { key: 'certificateNumber', label: 'Certificate Serial Number', helper: 'Official certificate serial' },
    { key: 'credentialId', label: 'Verification Credential ID', helper: 'Unique verification code' },
    { key: 'issueDate', label: 'Date of Issuance', helper: 'Date certificate was given' },
    { key: 'completionDate', label: 'Course Completion Date', helper: 'Date requirement completed' },
    { key: 'score', label: 'Final Exam / Grade Score', helper: 'e.g. 98%' },
    { key: 'grade', label: 'Honors & Grade (e.g. Distinction, A+)', helper: 'Academic standing' },
    { key: 'orgName', label: 'Issuing University / Organisation', helper: 'Institution name' },
    { key: 'orgDepartment', label: 'Authority Board / Unit', helper: 'Issuing committee or faculty' },
    { key: 'signatory1Name', label: 'Dean / Signatory Name', helper: 'Primary signer full name' },
    { key: 'signatory1Role', label: 'Dean / Signatory Title', helper: 'e.g. Dean of Academic Affairs' },
    { key: 'signatory1Key', label: 'Digital Security Signature ID', helper: 'Cryptographic signature key' },
    { key: 'verificationUrl', label: 'Online Verification Web Link', helper: 'Public web URL for verification' },
    { key: 'hashDigest', label: 'Tamper-Proof Verification Code', helper: 'Security check digest' }
  ];

  // Helper for friendly element type name
  const getFriendlyElementType = (type: string) => {
    switch (type) {
      case 'dynamic-field': return 'Certificate Data Item';
      case 'text': return 'Text Box';
      case 'seal': return 'Official Badge / Seal';
      case 'signature': return 'Signature Line';
      case 'qr': return 'Verification QR Code';
      case 'image': return 'Image / Logo';
      case 'shape': return 'Shape / Container';
      case 'line': return 'Divider Line';
      case 'frame': return 'Border Frame';
      default: return 'Element';
    }
  };

  const fontsList = [
    { name: 'Playfair Display', label: 'Playfair Display (Classic Serif)' },
    { name: 'Cinzel', label: 'Cinzel (Diplomatic Formal)' },
    { name: 'Sora', label: 'Sora (Modern Display)' },
    { name: 'Plus Jakarta Sans', label: 'Plus Jakarta Sans (Standard Body)' },
    { name: 'Montserrat', label: 'Montserrat (Geometric Sans)' },
    { name: 'JetBrains Mono', label: 'JetBrains Mono (Security Code)' },
    { name: 'Alex Brush', label: 'Alex Brush (Calligraphic Script)' },
    { name: 'Great Vibes', label: 'Great Vibes (Formal Calligraphy)' }
  ];

  const paletteSwatches = [
    '#FFFFFF', '#FBF8F3', '#FFFDF5', '#F8FAFC', '#0A2540', 
    '#0F172A', '#1E293B', '#1E1B4B', '#FEF3C7', '#E0F2FE', 
    '#F0FDF4', '#FAF5FF', '#1877E0', '#0284C7', '#D97706', '#059669'
  ];

  // 1. IF NO ELEMENT IS SELECTED -> SHOW CERTIFICATE CANVAS PAGE SETTINGS
  if (!selectedElement) {
    return (
      <div 
        onClick={(e) => e.stopPropagation()}
        className="w-[270px] sm:w-80 bg-white border-l border-[#e5ebf4] p-4 sm:p-5 flex flex-col h-full overflow-y-auto space-y-4 sm:space-y-5 text-xs select-none shrink-0 shadow-xs animate-fadeIn"
      >
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold font-sora text-[#0c1a30] uppercase tracking-wider">
              <Sliders className="w-4 h-4 text-[#1877e0]" />
              <span>Canvas Properties</span>
            </div>
            <p className="text-[11px] text-[#66748c] mt-1 leading-relaxed">
              Customize background colors, paper layout format, and textures.
            </p>
          </div>
          {onToggleCollapse && (
            <button
              onClick={onToggleCollapse}
              className="p-1.5 bg-slate-100 hover:bg-sky-50 text-slate-500 hover:text-[#1877e0] border border-slate-200 hover:border-sky-300 rounded-xl cursor-pointer transition-all shadow-xs shrink-0"
              title="Collapse Inspector"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Page Dimensions Spec */}
        <div className="space-y-2">
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#66748c] block">
            Page Dimensions & Specs
          </span>
          <div className="p-3.5 bg-[#f4f7fc] border border-[#e5ebf4] rounded-2xl space-y-2">
            <div className="flex justify-between items-center text-[#0c1a30]">
              <span className="font-medium text-slate-500">Format:</span>
              <span className="font-bold">{schema.page.size} ({schema.page.orientation === 'landscape' ? 'Horizontal' : 'Vertical'})</span>
            </div>
            <div className="flex justify-between items-center text-[#0c1a30]">
              <span className="font-medium text-slate-500">Dimensions:</span>
              <span className="font-mono font-bold text-[#1877e0]">{schema.page.width} × {schema.page.height} px</span>
            </div>
            <div className="flex justify-between items-center text-[#0c1a30]">
              <span className="font-medium text-slate-500">Elements:</span>
              <span className="font-bold text-slate-800">{schema.elements.length} Items</span>
            </div>
          </div>
        </div>

        {/* Choose Page Layout */}
        <div className="space-y-2">
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#66748c] block">
            Paper Format & Orientation
          </span>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => onUpdatePageSize('A4', 'landscape')}
              className={`p-3 border rounded-2xl text-left cursor-pointer transition-all ${
                schema.page.size === 'A4' && schema.page.orientation === 'landscape'
                  ? 'border-[#2ea6ff] bg-sky-50 text-[#1877e0] font-bold shadow-xs ring-1 ring-[#2ea6ff]'
                  : 'border-[#e5ebf4] bg-white hover:bg-[#f4f7fc] text-slate-700'
              }`}
            >
              <div className="text-xs font-bold">A4 Landscape</div>
              <div className="text-[10px] text-slate-500 mt-0.5">1000 × 707px</div>
            </button>

            <button
              onClick={() => onUpdatePageSize('A4', 'portrait')}
              className={`p-3 border rounded-2xl text-left cursor-pointer transition-all ${
                schema.page.size === 'A4' && schema.page.orientation === 'portrait'
                  ? 'border-[#2ea6ff] bg-sky-50 text-[#1877e0] font-bold shadow-xs ring-1 ring-[#2ea6ff]'
                  : 'border-[#e5ebf4] bg-white hover:bg-[#f4f7fc] text-slate-700'
              }`}
            >
              <div className="text-xs font-bold">A4 Portrait</div>
              <div className="text-[10px] text-slate-500 mt-0.5">707 × 1000px</div>
            </button>
          </div>
        </div>

        {/* Canvas Background Color */}
        <div className="space-y-2.5">
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#66748c] block">
            Canvas Background Color
          </span>
          <div className="flex items-center gap-2 bg-[#f4f7fc] border border-[#e5ebf4] p-2 rounded-2xl">
            <input
              type="color"
              value={schema.background.value || '#FFFFFF'}
              onChange={(e) => onUpdateBackground({ ...schema.background, value: e.target.value })}
              className="w-7 h-7 p-0 border border-slate-300 rounded-xl cursor-pointer shrink-0"
            />
            <input
              type="text"
              value={schema.background.value || '#FFFFFF'}
              onChange={(e) => onUpdateBackground({ ...schema.background, value: e.target.value })}
              className="w-full bg-transparent text-xs font-mono font-bold uppercase focus:outline-none text-[#0c1a30]"
            />
          </div>

          {/* Quick Palette Swatches */}
          <div className="grid grid-cols-8 gap-1.5 pt-1">
            {paletteSwatches.map(c => (
              <button
                key={c}
                onClick={() => onUpdateBackground({ ...schema.background, value: c })}
                className={`w-6 h-6 border rounded-lg cursor-pointer hover:scale-110 transition-transform ${
                  schema.background.value === c ? 'border-[#1877e0] ring-2 ring-[#1877e0]' : 'border-slate-200'
                }`}
                style={{ backgroundColor: c }}
                title={c}
              />
            ))}
          </div>
        </div>

        {/* Parchment Texture Toggle */}
        <div className="space-y-2">
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#66748c] block">
            Parchment Security Paper
          </span>
          <button
            onClick={() => onUpdateBackground({
              ...schema.background,
              patternType: schema.background.patternType === 'parchment-texture' ? 'none' : 'parchment-texture'
            })}
            className={`w-full p-3.5 border rounded-2xl text-xs font-bold flex items-center justify-between cursor-pointer transition-all ${
              schema.background.patternType === 'parchment-texture'
                ? 'bg-amber-50 border-amber-300 text-amber-900 shadow-xs'
                : 'bg-white border-[#e5ebf4] text-slate-700 hover:bg-slate-50'
            }`}
          >
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-amber-600" />
              <span>Security Texture</span>
            </div>
            <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
              schema.background.patternType === 'parchment-texture'
                ? 'bg-amber-100 border-amber-300 font-bold text-amber-900'
                : 'bg-slate-100 border-slate-200 text-slate-500'
            }`}>
              {schema.background.patternType === 'parchment-texture' ? 'ACTIVE' : 'OFF'}
            </span>
          </button>
        </div>

        {/* Quick Tips Box */}
        <div className="p-4 bg-sky-50/80 border border-sky-100 rounded-2xl space-y-1.5 text-slate-700">
          <div className="flex items-center gap-1.5 font-bold text-xs text-[#0c1a30]">
            <Info className="w-4 h-4 text-[#1877e0]" />
            <span>Designer Note</span>
          </div>
          <p className="text-[11px] text-slate-600 leading-relaxed">
            Click on any item on the canvas to inspect and edit its typography, colors, dynamic tokens, and alignment.
          </p>
        </div>
      </div>
    );
  }

  const isText = selectedElement.type === 'text';
  const isDynamicField = selectedElement.type === 'dynamic-field';
  const isShape = selectedElement.type === 'shape' || selectedElement.type === 'line' || selectedElement.type === 'frame';
  const isSeal = selectedElement.type === 'seal';
  const isQr = selectedElement.type === 'qr';
  const isSignature = selectedElement.type === 'signature';

  // 2. ELEMENT SPECIFIC PROPERTIES (WHEN AN ELEMENT IS SELECTED)
  return (
    <div 
      onClick={(e) => e.stopPropagation()}
      className="w-[270px] sm:w-80 bg-white border-l border-[#e5ebf4] p-4 sm:p-5 flex flex-col h-full overflow-y-auto space-y-4 sm:space-y-5 text-xs select-none shrink-0 animate-fadeIn shadow-xs"
    >
      {/* Header with Element Name & Quick Actions */}
      <div className="space-y-3 pb-4 border-b border-[#e5ebf4]">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#1877e0] bg-sky-50 px-2.5 py-1 border border-sky-200 rounded-full">
            {getFriendlyElementType(selectedElement.type)}
          </span>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => onUpdateElement({ ...selectedElement, locked: !selectedElement.locked })}
              className={`p-1.5 rounded-xl transition-all cursor-pointer ${
                selectedElement.locked ? 'bg-amber-100 text-amber-800' : 'hover:bg-slate-100 text-slate-500'
              }`}
              title={selectedElement.locked ? 'Unlock element' : 'Lock in place'}
            >
              {selectedElement.locked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
            </button>
            <button
              onClick={() => onDuplicateElement(selectedElement)}
              className="p-1.5 hover:bg-slate-100 text-slate-500 rounded-xl cursor-pointer transition-all"
              title="Duplicate (Ctrl+D)"
            >
              <Copy className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onDeleteElement(selectedElement.id)}
              className="p-1.5 hover:bg-rose-50 text-rose-500 rounded-xl cursor-pointer transition-all"
              title="Delete Element (Delete)"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>

            {onToggleCollapse && (
              <button
                onClick={onToggleCollapse}
                className="p-1.5 bg-slate-100 hover:bg-sky-50 text-slate-500 hover:text-[#1877e0] border border-slate-200 hover:border-sky-300 rounded-xl cursor-pointer transition-all shadow-xs shrink-0"
                title="Collapse Properties Panel"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
        
        <div>
          <label className="text-[10px] font-bold uppercase text-[#66748c] block mb-1">Item Title:</label>
          <input
            type="text"
            value={selectedElement.name || ''}
            onChange={(e) => onUpdateElement({ ...selectedElement, name: e.target.value })}
            className="w-full font-bold text-[#0c1a30] bg-[#f4f7fc] border border-[#e5ebf4] focus:border-[#2ea6ff] px-3 py-2 rounded-xl focus:outline-none text-xs transition-all"
            placeholder="Item Name"
          />
        </div>
      </div>

      {/* SEGMENTED CONTROL: CONSTANT STATIC TEXT VS. DYNAMIC VARIABLE */}
      {(isText || isDynamicField) && (
        <div className="space-y-3">
          {/* Segmented Mode Picker */}
          <div className="flex bg-[#f4f7fc] p-1 border border-[#e5ebf4] rounded-xl text-xs font-semibold">
            <button
              onClick={() => {
                onUpdateElement({
                  ...selectedElement,
                  isVariable: false,
                  type: 'text',
                  text: selectedElement.text || selectedElement.fallbackText || selectedElement.name
                });
              }}
              className={`flex-1 py-1.5 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                !selectedElement.isVariable && selectedElement.type === 'text'
                  ? 'bg-white text-[#0A2540] font-bold shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Type className="w-3.5 h-3.5" />
              <span>Static Text</span>
            </button>

            <button
              onClick={() => {
                onUpdateElement({
                  ...selectedElement,
                  isVariable: true,
                  type: 'dynamic-field',
                  customVariableKey: selectedElement.customVariableKey || selectedElement.fieldKey || selectedElement.name || 'custom_field',
                  fallbackText: selectedElement.fallbackText || selectedElement.text || 'Sample Value'
                });
              }}
              className={`flex-1 py-1.5 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                selectedElement.isVariable || selectedElement.type === 'dynamic-field'
                  ? 'bg-[#0284C7] text-white font-bold shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Braces className="w-3.5 h-3.5" />
              <span>Variable</span>
            </button>
          </div>

          {/* 1. If Static Text */}
          {(!selectedElement.isVariable && selectedElement.type === 'text') && (
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-[10px] font-mono font-bold uppercase tracking-wider text-[#66748c]">
                <span>Constant Text Content</span>
                <span className="text-emerald-600 font-bold">Fixed on all</span>
              </div>
              <textarea
                rows={3}
                value={selectedElement.text || ''}
                onChange={(e) => onUpdateElement({ ...selectedElement, text: e.target.value })}
                className="w-full bg-[#f4f7fc] border border-[#e5ebf4] p-3 text-xs font-medium rounded-xl focus:outline-none focus:border-[#2ea6ff] leading-relaxed text-slate-800"
                placeholder="Type constant certificate text here..."
              />
              <span className="text-[10px] text-slate-400 block">
                This content will remain identical across all issued certificates.
              </span>
            </div>
          )}

          {/* 2. If Dynamic Variable */}
          {(selectedElement.isVariable || selectedElement.type === 'dynamic-field') && (
            <div className="space-y-3 p-3.5 bg-sky-50/80 border border-sky-200 rounded-2xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#0c1a30]">
                  <Database className="w-3.5 h-3.5 text-[#0284C7]" />
                  <span>Variable Configuration</span>
                </div>
                <span className="text-[10px] font-mono bg-sky-100 text-[#0284C7] px-2 py-0.5 rounded-full font-bold">
                  Excel / CSV Field
                </span>
              </div>

              {/* Custom Variable Key / Excel Column Name */}
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-700 block">
                  Variable Key (Excel Header Column):
                </span>
                <input
                  type="text"
                  value={selectedElement.customVariableKey || selectedElement.fieldKey || selectedElement.name || ''}
                  onChange={(e) => onUpdateElement({
                    ...selectedElement,
                    isVariable: true,
                    customVariableKey: e.target.value,
                    name: e.target.value
                  })}
                  className="w-full bg-white border border-sky-300 font-mono font-bold text-[#0A2540] text-xs py-2 px-3 rounded-xl focus:outline-none focus:border-[#0284C7] shadow-xs"
                  placeholder="e.g. project_title, track, rank"
                />
              </div>

              {/* Standard Key Presets Dropdown */}
              <div className="space-y-1">
                <span className="text-[10px] font-medium text-slate-600 block">
                  Or choose standard preset:
                </span>
                <select
                  value={selectedElement.fieldKey || ''}
                  onChange={(e) => {
                    const selectedOpt = DYNAMIC_FIELD_KEYS.find(f => f.key === e.target.value);
                    onUpdateElement({
                      ...selectedElement,
                      isVariable: true,
                      fieldKey: e.target.value as DynamicFieldKey,
                      customVariableKey: e.target.value,
                      name: selectedOpt?.label || e.target.value,
                      fallbackText: selectedOpt?.helper || 'Sample Data'
                    });
                  }}
                  className="w-full bg-white border border-slate-200 text-xs py-1.5 px-2.5 rounded-xl focus:outline-none focus:border-[#0284C7] text-slate-700 cursor-pointer"
                >
                  <option value="">-- Custom Variable --</option>
                  {DYNAMIC_FIELD_KEYS.map((field) => (
                    <option key={field.key} value={field.key}>
                      {field.label} ({field.key})
                    </option>
                  ))}
                </select>
              </div>

              {/* Sample Preview Text */}
              <div className="space-y-1">
                <span className="text-[10px] font-medium text-slate-600 block">Sample Preview Value:</span>
                <input
                  type="text"
                  value={selectedElement.fallbackText || ''}
                  onChange={(e) => onUpdateElement({ ...selectedElement, fallbackText: e.target.value })}
                  className="w-full bg-white border border-[#e5ebf4] px-3 py-1.5 text-xs rounded-xl focus:outline-none focus:border-[#2ea6ff]"
                  placeholder="Sample text shown in designer preview..."
                />
              </div>

              {/* Prefix & Suffix */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <div>
                  <span className="text-[10px] font-medium text-slate-600 block mb-0.5">Prefix</span>
                  <input
                    type="text"
                    value={selectedElement.prefix || ''}
                    onChange={(e) => onUpdateElement({ ...selectedElement, prefix: e.target.value })}
                    className="w-full bg-white border border-[#e5ebf4] px-2 py-1 text-xs rounded-lg focus:outline-none"
                    placeholder="e.g. Rank: #"
                  />
                </div>
                <div>
                  <span className="text-[10px] font-medium text-slate-600 block mb-0.5">Suffix</span>
                  <input
                    type="text"
                    value={selectedElement.suffix || ''}
                    onChange={(e) => onUpdateElement({ ...selectedElement, suffix: e.target.value })}
                    className="w-full bg-white border border-[#e5ebf4] px-2 py-1 text-xs rounded-lg focus:outline-none"
                    placeholder="e.g. / 100"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TYPOGRAPHY & FONT FORMATTING CONTROLS */}
      {(isText || isDynamicField) && (
        <div className="space-y-3.5">
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#66748c] block">
            Typography & Font Styling
          </span>

          {/* Font Family Selector */}
          <div className="space-y-1">
            <span className="text-[10px] text-slate-500 font-medium">Font Family</span>
            <select
              value={selectedElement.fontFamily || 'Plus Jakarta Sans'}
              onChange={(e) => onUpdateElement({ ...selectedElement, fontFamily: e.target.value })}
              className="w-full bg-[#f4f7fc] border border-[#e5ebf4] py-2 px-3 text-xs font-semibold text-[#0c1a30] rounded-xl focus:outline-none focus:border-[#2ea6ff] cursor-pointer"
            >
              {fontsList.map(f => (
                <option key={f.name} value={f.name}>{f.label}</option>
              ))}
            </select>
          </div>

          {/* Font Size & Text Color */}
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <span className="text-[10px] text-slate-500 font-medium">Font Size</span>
              <div className="flex items-center bg-[#f4f7fc] border border-[#e5ebf4] rounded-xl overflow-hidden">
                <button
                  onClick={() => onUpdateElement({ ...selectedElement, fontSize: Math.max(8, (selectedElement.fontSize || 16) - 1) })}
                  className="px-2.5 py-1.5 hover:bg-slate-200 text-slate-600 font-bold text-xs"
                >
                  -
                </button>
                <input
                  type="number"
                  min="8"
                  max="120"
                  value={selectedElement.fontSize || 16}
                  onChange={(e) => onUpdateElement({ ...selectedElement, fontSize: parseInt(e.target.value) || 16 })}
                  className="w-full bg-transparent font-mono text-xs font-bold text-[#0c1a30] text-center focus:outline-none"
                />
                <button
                  onClick={() => onUpdateElement({ ...selectedElement, fontSize: Math.min(120, (selectedElement.fontSize || 16) + 1) })}
                  className="px-2.5 py-1.5 hover:bg-slate-200 text-slate-600 font-bold text-xs"
                >
                  +
                </button>
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] text-slate-500 font-medium">Text Color</span>
              <div className="flex items-center gap-2 bg-[#f4f7fc] border border-[#e5ebf4] px-2 py-1 rounded-xl">
                <input
                  type="color"
                  value={selectedElement.color || '#0A2540'}
                  onChange={(e) => onUpdateElement({ ...selectedElement, color: e.target.value })}
                  className="w-5 h-5 p-0 border-0 rounded-md cursor-pointer shrink-0"
                />
                <input
                  type="text"
                  value={selectedElement.color || '#0A2540'}
                  onChange={(e) => onUpdateElement({ ...selectedElement, color: e.target.value })}
                  className="w-full bg-transparent text-xs font-mono font-bold uppercase focus:outline-none text-[#0c1a30]"
                />
              </div>
            </div>
          </div>

          {/* Bold, Italic, Underline & Strikethrough Buttons */}
          <div className="space-y-1">
            <span className="text-[10px] text-slate-500 font-medium">Text Style</span>
            <div className="flex items-center gap-1.5 bg-[#f4f7fc] p-1 border border-[#e5ebf4] rounded-xl">
              <button
                onClick={() => onUpdateElement({
                  ...selectedElement,
                  fontWeight: selectedElement.fontWeight === 'bold' || selectedElement.fontWeight === '800' ? 'normal' : 'bold'
                })}
                className={`flex-1 py-1.5 rounded-lg flex items-center justify-center cursor-pointer transition-all ${
                  selectedElement.fontWeight === 'bold' || selectedElement.fontWeight === '800'
                    ? 'bg-[#0a1f44] text-[#2ea6ff] shadow-xs font-bold'
                    : 'text-slate-600 hover:bg-white'
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
                className={`flex-1 py-1.5 rounded-lg flex items-center justify-center cursor-pointer transition-all ${
                  selectedElement.fontStyle === 'italic'
                    ? 'bg-[#0a1f44] text-[#2ea6ff] shadow-xs font-bold'
                    : 'text-slate-600 hover:bg-white'
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
                className={`flex-1 py-1.5 rounded-lg flex items-center justify-center cursor-pointer transition-all ${
                  selectedElement.textDecoration === 'underline'
                    ? 'bg-[#0a1f44] text-[#2ea6ff] shadow-xs font-bold'
                    : 'text-slate-600 hover:bg-white'
                }`}
                title="Underline"
              >
                <Underline className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => onUpdateElement({
                  ...selectedElement,
                  textDecoration: selectedElement.textDecoration === 'line-through' ? 'none' : 'line-through'
                })}
                className={`flex-1 py-1.5 rounded-lg flex items-center justify-center cursor-pointer transition-all ${
                  selectedElement.textDecoration === 'line-through'
                    ? 'bg-[#0a1f44] text-[#2ea6ff] shadow-xs font-bold'
                    : 'text-slate-600 hover:bg-white'
                }`}
                title="Strikethrough"
              >
                <Strikethrough className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Text Alignment */}
          <div className="space-y-1">
            <span className="text-[10px] text-slate-500 font-medium">Text Alignment</span>
            <div className="flex items-center gap-1.5 bg-[#f4f7fc] p-1 border border-[#e5ebf4] rounded-xl">
              {[
                { id: 'left', icon: AlignLeft, label: 'Align Left' },
                { id: 'center', icon: AlignCenter, label: 'Align Center' },
                { id: 'right', icon: AlignRight, label: 'Align Right' },
                { id: 'justify', icon: AlignJustify, label: 'Justify' }
              ].map(a => {
                const Icon = a.icon;
                const isActive = (selectedElement.textAlign || 'center') === a.id;
                return (
                  <button
                    key={a.id}
                    onClick={() => onUpdateElement({ ...selectedElement, textAlign: a.id as any })}
                    className={`flex-1 py-1.5 rounded-lg flex items-center justify-center cursor-pointer transition-all ${
                      isActive ? 'bg-[#0a1f44] text-[#2ea6ff] shadow-xs font-bold' : 'text-slate-600 hover:bg-white'
                    }`}
                    title={a.label}
                  >
                    <Icon className="w-3.5 h-3.5" />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Letter Spacing & Line Height */}
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <span className="text-[10px] text-slate-500 font-medium">Letter Spacing</span>
              <div className="flex items-center bg-[#f4f7fc] border border-[#e5ebf4] px-2.5 py-1.5 rounded-xl">
                <input
                  type="number"
                  min="-2"
                  max="20"
                  value={selectedElement.letterSpacing || 0}
                  onChange={(e) => onUpdateElement({ ...selectedElement, letterSpacing: parseInt(e.target.value) || 0 })}
                  className="w-full bg-transparent font-mono text-xs font-bold text-[#0c1a30] focus:outline-none"
                />
                <span className="text-[10px] text-slate-400 font-mono">px</span>
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] text-slate-500 font-medium">Line Height</span>
              <div className="flex items-center bg-[#f4f7fc] border border-[#e5ebf4] px-2.5 py-1.5 rounded-xl">
                <input
                  type="number"
                  step="0.1"
                  min="0.8"
                  max="3.0"
                  value={selectedElement.lineHeight || 1.2}
                  onChange={(e) => onUpdateElement({ ...selectedElement, lineHeight: parseFloat(e.target.value) || 1.2 })}
                  className="w-full bg-transparent font-mono text-xs font-bold text-[#0c1a30] focus:outline-none"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SEAL SPECIFICS */}
      {isSeal && (
        <div className="space-y-2.5">
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#66748c] block">
            Official Seal Type
          </span>
          <div className="grid grid-cols-2 gap-2">
            {[
              { id: 'gold-crest', label: 'Gold Crest', color: '#D97706' },
              { id: 'silver-hologram', label: 'Silver Seal', color: '#64748B' },
              { id: 'emerald-sovereign', label: 'Emerald Seal', color: '#059669' },
              { id: 'minimal-icertix', label: 'iCertiX Seal', color: '#1877E0' }
            ].map((s) => (
              <button
                key={s.id}
                onClick={() => onUpdateElement({ ...selectedElement, sealType: s.id as any })}
                className={`p-2.5 border rounded-2xl flex flex-col items-center justify-center gap-1 cursor-pointer transition-all ${
                  selectedElement.sealType === s.id
                    ? 'border-[#1877e0] bg-sky-50 text-[#1877e0] font-bold shadow-xs'
                    : 'border-[#e5ebf4] bg-white hover:bg-[#f4f7fc] text-slate-700'
                }`}
              >
                <Award className="w-5 h-5" style={{ color: s.color }} />
                <span className="text-[11px] font-semibold">{s.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* QR CODE SPECIFICS */}
      {isQr && (
        <div className="space-y-3">
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#66748c] block">
            Verification QR Styling
          </span>

          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <span className="text-[10px] text-slate-500 font-medium">QR Color</span>
              <div className="flex items-center gap-2 bg-[#f4f7fc] border border-[#e5ebf4] p-1.5 rounded-xl">
                <input
                  type="color"
                  value={selectedElement.qrFgColor || '#0A2540'}
                  onChange={(e) => onUpdateElement({ ...selectedElement, qrFgColor: e.target.value })}
                  className="w-5 h-5 p-0 border-0 rounded-md cursor-pointer shrink-0"
                />
                <input
                  type="text"
                  value={selectedElement.qrFgColor || '#0A2540'}
                  onChange={(e) => onUpdateElement({ ...selectedElement, qrFgColor: e.target.value })}
                  className="w-full bg-transparent text-xs font-mono font-bold uppercase focus:outline-none text-[#0c1a30]"
                />
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] text-slate-500 font-medium">Background</span>
              <div className="flex items-center gap-2 bg-[#f4f7fc] border border-[#e5ebf4] p-1.5 rounded-xl">
                <input
                  type="color"
                  value={selectedElement.qrBgColor || '#FFFFFF'}
                  onChange={(e) => onUpdateElement({ ...selectedElement, qrBgColor: e.target.value })}
                  className="w-5 h-5 p-0 border-0 rounded-md cursor-pointer shrink-0"
                />
                <input
                  type="text"
                  value={selectedElement.qrBgColor || '#FFFFFF'}
                  onChange={(e) => onUpdateElement({ ...selectedElement, qrBgColor: e.target.value })}
                  className="w-full bg-transparent text-xs font-mono font-bold uppercase focus:outline-none text-[#0c1a30]"
                />
              </div>
            </div>
          </div>

          <div className="space-y-1">
            <span className="text-[10px] text-slate-500 font-medium">Error Correction</span>
            <select
              value={selectedElement.qrLevel || 'M'}
              onChange={(e) => onUpdateElement({ ...selectedElement, qrLevel: e.target.value as any })}
              className="w-full bg-[#f4f7fc] border border-[#e5ebf4] p-2 rounded-xl text-xs font-semibold text-[#0c1a30] focus:bg-white focus:outline-none focus:border-[#2ea6ff]"
            >
              <option value="L">Level L (7% Damage Recovery)</option>
              <option value="M">Level M (15% Standard)</option>
              <option value="Q">Level Q (25% High Reliability)</option>
              <option value="H">Level H (30% Maximum Resilience)</option>
            </select>
          </div>

          <div className="flex items-center justify-between p-3 bg-[#f4f7fc] border border-[#e5ebf4] rounded-xl">
            <span className="text-xs font-semibold text-[#0c1a30]">Show "Scan to Verify" Label</span>
            <input
              type="checkbox"
              checked={selectedElement.qrShowLabel ?? true}
              onChange={(e) => onUpdateElement({ ...selectedElement, qrShowLabel: e.target.checked })}
              className="w-4 h-4 accent-[#1877e0] cursor-pointer"
            />
          </div>

          <div className="p-3 bg-sky-50/60 border border-sky-200/80 rounded-xl space-y-1">
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#1877e0]">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Real-Time Scannable QR</span>
            </div>
            <p className="text-[10px] text-slate-600 leading-relaxed">
              When printed or downloaded, this QR code automatically encodes the authentic verification URL and opens the verification portal when scanned by any mobile phone camera.
            </p>
          </div>
        </div>
      )}

      {/* SHAPES & STYLING */}
      {isShape && (
        <div className="space-y-3">
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#66748c] block">
            Color & Border Styling
          </span>

          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <span className="text-[10px] text-slate-500 font-medium">Fill Color</span>
              <div className="flex items-center gap-2 bg-[#f4f7fc] border border-[#e5ebf4] p-1.5 rounded-xl">
                <input
                  type="color"
                  value={selectedElement.fill === 'transparent' ? '#FFFFFF' : selectedElement.fill || '#FFFFFF'}
                  onChange={(e) => onUpdateElement({ ...selectedElement, fill: e.target.value })}
                  className="w-5 h-5 p-0 border-0 rounded-md cursor-pointer shrink-0"
                />
                <button
                  onClick={() => onUpdateElement({ ...selectedElement, fill: selectedElement.fill === 'transparent' ? '#F8FAFC' : 'transparent' })}
                  className="text-[10px] text-[#1877e0] font-bold hover:underline"
                >
                  {selectedElement.fill === 'transparent' ? 'Add Fill' : 'No Fill'}
                </button>
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] text-slate-500 font-medium">Border Color</span>
              <div className="flex items-center gap-2 bg-[#f4f7fc] border border-[#e5ebf4] p-1.5 rounded-xl">
                <input
                  type="color"
                  value={selectedElement.stroke || '#0A2540'}
                  onChange={(e) => onUpdateElement({ ...selectedElement, stroke: e.target.value })}
                  className="w-5 h-5 p-0 border-0 rounded-md cursor-pointer shrink-0"
                />
                <input
                  type="text"
                  value={selectedElement.stroke || '#0A2540'}
                  onChange={(e) => onUpdateElement({ ...selectedElement, stroke: e.target.value })}
                  className="w-full bg-transparent text-xs font-mono font-bold uppercase focus:outline-none text-[#0c1a30]"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <span className="text-[10px] text-slate-500 font-medium">Border Width</span>
              <div className="flex items-center bg-[#f4f7fc] border border-[#e5ebf4] px-2.5 py-1.5 rounded-xl">
                <input
                  type="number"
                  min="0"
                  max="20"
                  value={selectedElement.strokeWidth || 1}
                  onChange={(e) => onUpdateElement({ ...selectedElement, strokeWidth: parseInt(e.target.value) || 0 })}
                  className="w-full bg-transparent font-mono text-xs font-bold text-[#0c1a30] focus:outline-none"
                />
                <span className="text-[10px] text-slate-400 font-mono">px</span>
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] text-slate-500 font-medium">Corner Radius</span>
              <div className="flex items-center bg-[#f4f7fc] border border-[#e5ebf4] px-2.5 py-1.5 rounded-xl">
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={selectedElement.borderRadius || 0}
                  onChange={(e) => onUpdateElement({ ...selectedElement, borderRadius: parseInt(e.target.value) || 0 })}
                  className="w-full bg-transparent font-mono text-xs font-bold text-[#0c1a30] focus:outline-none"
                />
                <span className="text-[10px] text-slate-400 font-mono">px</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* POSITION & DIMENSIONS */}
      <div className="space-y-2.5">
        <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#66748c] block">
          Position & Dimensions
        </span>
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <span className="text-[10px] text-slate-500 font-medium">X (Left)</span>
            <div className="flex items-center bg-[#f4f7fc] border border-[#e5ebf4] px-2.5 py-1.5 rounded-xl">
              <input
                type="number"
                value={Math.round(selectedElement.x)}
                onChange={(e) => onUpdateElement({ ...selectedElement, x: parseInt(e.target.value) || 0 })}
                className="w-full bg-transparent font-mono text-xs text-[#0c1a30] font-bold focus:outline-none"
              />
              <span className="text-[10px] text-slate-400 font-mono">px</span>
            </div>
          </div>
          <div className="space-y-1">
            <span className="text-[10px] text-slate-500 font-medium">Y (Top)</span>
            <div className="flex items-center bg-[#f4f7fc] border border-[#e5ebf4] px-2.5 py-1.5 rounded-xl">
              <input
                type="number"
                value={Math.round(selectedElement.y)}
                onChange={(e) => onUpdateElement({ ...selectedElement, y: parseInt(e.target.value) || 0 })}
                className="w-full bg-transparent font-mono text-xs text-[#0c1a30] font-bold focus:outline-none"
              />
              <span className="text-[10px] text-slate-400 font-mono">px</span>
            </div>
          </div>
          <div className="space-y-1">
            <span className="text-[10px] text-slate-500 font-medium">Width</span>
            <div className="flex items-center bg-[#f4f7fc] border border-[#e5ebf4] px-2.5 py-1.5 rounded-xl">
              <input
                type="number"
                value={Math.round(selectedElement.width)}
                onChange={(e) => onUpdateElement({ ...selectedElement, width: Math.max(10, parseInt(e.target.value) || 10) })}
                className="w-full bg-transparent font-mono text-xs text-[#0c1a30] font-bold focus:outline-none"
              />
              <span className="text-[10px] text-slate-400 font-mono">px</span>
            </div>
          </div>
          <div className="space-y-1">
            <span className="text-[10px] text-slate-500 font-medium">Height</span>
            <div className="flex items-center bg-[#f4f7fc] border border-[#e5ebf4] px-2.5 py-1.5 rounded-xl">
              <input
                type="number"
                value={Math.round(selectedElement.height)}
                onChange={(e) => onUpdateElement({ ...selectedElement, height: Math.max(10, parseInt(e.target.value) || 10) })}
                className="w-full bg-transparent font-mono text-xs text-[#0c1a30] font-bold focus:outline-none"
              />
              <span className="text-[10px] text-slate-400 font-mono">px</span>
            </div>
          </div>
        </div>

        {/* Quick Align */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          <button
            onClick={() => handleAlign('canvas-center-x')}
            className="py-2 px-2.5 bg-[#f4f7fc] hover:bg-sky-50 hover:text-[#1877e0] border border-[#e5ebf4] text-[#0c1a30] font-bold rounded-xl transition-all cursor-pointer text-[11px] text-center"
          >
            Center Horizontal
          </button>
          <button
            onClick={() => handleAlign('canvas-center-y')}
            className="py-2 px-2.5 bg-[#f4f7fc] hover:bg-sky-50 hover:text-[#1877e0] border border-[#e5ebf4] text-[#0c1a30] font-bold rounded-xl transition-all cursor-pointer text-[11px] text-center"
          >
            Center Vertical
          </button>
        </div>
      </div>

      {/* TRANSPARENCY & ROTATION */}
      <div className="space-y-3 pt-2">
        <div className="space-y-1.5">
          <div className="flex justify-between text-[10px] font-bold text-[#66748c]">
            <span>Transparency / Opacity</span>
            <span className="font-mono text-[#0c1a30]">{selectedElement.opacity ?? 100}%</span>
          </div>
          <input
            type="range"
            min="10"
            max="100"
            value={selectedElement.opacity ?? 100}
            onChange={(e) => onUpdateElement({ ...selectedElement, opacity: parseInt(e.target.value) })}
            className="w-full accent-[#1877e0] cursor-pointer h-1.5 bg-slate-200 rounded-lg appearance-none"
          />
        </div>

        <div className="space-y-1.5">
          <div className="flex justify-between text-[10px] font-bold text-[#66748c]">
            <span>Rotation Angle</span>
            <span className="font-mono text-[#0c1a30]">{selectedElement.rotation || 0}°</span>
          </div>
          <input
            type="range"
            min="0"
            max="360"
            value={selectedElement.rotation || 0}
            onChange={(e) => onUpdateElement({ ...selectedElement, rotation: parseInt(e.target.value) })}
            className="w-full accent-[#1877e0] cursor-pointer h-1.5 bg-slate-200 rounded-lg appearance-none"
          />
        </div>
      </div>

      {/* LAYER STACKING ORDER */}
      <div className="space-y-2.5 pt-3 border-t border-[#e5ebf4]">
        <div className="flex items-center justify-between text-[10px] font-mono font-bold uppercase text-[#66748c]">
          <span>Layer Arrangement</span>
          <span className="font-mono font-bold text-[#1877e0] bg-sky-50 px-2 py-0.5 rounded-full border border-sky-200">
            Z-Index #{selectedElement.zIndex || 1}
          </span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => handleLayerOrder('forward')}
            className="p-2.5 bg-[#f4f7fc] hover:bg-slate-100 text-[#0c1a30] flex items-center justify-center gap-1.5 rounded-xl cursor-pointer font-bold text-[11px] transition-all"
            title="Move one layer higher"
          >
            <ArrowUp className="w-3.5 h-3.5 text-[#1877e0]" />
            <span>Forward</span>
          </button>
          <button
            onClick={() => handleLayerOrder('backward')}
            className="p-2.5 bg-[#f4f7fc] hover:bg-slate-100 text-[#0c1a30] flex items-center justify-center gap-1.5 rounded-xl cursor-pointer font-bold text-[11px] transition-all"
            title="Move one layer lower"
          >
            <ArrowDown className="w-3.5 h-3.5 text-[#1877e0]" />
            <span>Backward</span>
          </button>
          <button
            onClick={() => handleLayerOrder('front')}
            className="p-2.5 bg-[#f4f7fc] hover:bg-slate-100 text-[#0c1a30] flex items-center justify-center gap-1.5 rounded-xl cursor-pointer font-bold text-[11px] transition-all"
            title="Place above all other elements"
          >
            <BringToFront className="w-3.5 h-3.5 text-[#1877e0]" />
            <span>Bring to Top</span>
          </button>
          <button
            onClick={() => handleLayerOrder('back')}
            className="p-2.5 bg-[#f4f7fc] hover:bg-slate-100 text-[#0c1a30] flex items-center justify-center gap-1.5 rounded-xl cursor-pointer font-bold text-[11px] transition-all"
            title="Place behind all other elements"
          >
            <SendToBack className="w-3.5 h-3.5 text-[#1877e0]" />
            <span>Send to Back</span>
          </button>
        </div>
      </div>
    </div>
  );
};
