import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  StudioDesignSchema, 
  StudioElement, 
  DemoCandidateData 
} from '../../../types/templateStudio';
import { QrCodeSvg, IcertixSeal } from '../../../components/common';
import { 
  ShieldCheck, 
  RotateCw, 
  Lock, 
  Unlock,
  Trash2, 
  Copy, 
  Eye, 
  Maximize2,
  Sparkles,
  Sliders,
  Grid3X3,
  Magnet,
  AlignCenter,
  ZoomIn,
  ZoomOut,
  HelpCircle,
  Clock,
  FileText,
  Database,
  Braces,
  ChevronDown,
  Check,
  Type
} from 'lucide-react';

interface CanvasStageProps {
  schema: StudioDesignSchema;
  selectedElementId: string | null;
  onSelectElement: (id: string | null) => void;
  onUpdateElement: (updated: StudioElement) => void;
  onDeleteElement?: (id: string) => void;
  onDuplicateElement?: (element: StudioElement) => void;
  zoom: number;
  onZoomChange?: (newZoom: number) => void;
  onFitZoom?: () => void;
  showGrid: boolean;
  onToggleGrid?: () => void;
  gridSize?: number;
  snapToGrid?: boolean;
  onToggleSnap?: () => void;
  previewMode: boolean;
  onTogglePreviewMode?: () => void;
  demoData: DemoCandidateData;
  onDropElement?: (type: string, data: any, canvasX: number, canvasY: number) => void;
}

type DragMode = 'move' | 'nw' | 'ne' | 'se' | 'sw' | 'n' | 's' | 'e' | 'w' | 'rotate' | null;

export const CanvasStage: React.FC<CanvasStageProps> = ({
  schema,
  selectedElementId,
  onSelectElement,
  onUpdateElement,
  onDeleteElement,
  onDuplicateElement,
  zoom,
  onZoomChange,
  onFitZoom,
  showGrid,
  onToggleGrid,
  gridSize = 20,
  snapToGrid = false,
  onToggleSnap,
  previewMode,
  onTogglePreviewMode,
  demoData,
  onDropElement
}) => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [dragMode, setDragMode] = useState<DragMode>(null);
  const [dragStart, setDragStart] = useState<{ x: number; y: number; elX: number; elY: number; elW: number; elH: number; elRot: number } | null>(null);
  const [hasMovedDuringDrag, setHasMovedDuringDrag] = useState<boolean>(false);
  const [editingTextId, setEditingTextId] = useState<string | null>(null);
  const [mousePos, setMousePos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragOverCanvas, setIsDragOverCanvas] = useState<boolean>(false);
  const [openVariableMenu, setOpenVariableMenu] = useState<boolean>(false);
  const [customKeyInput, setCustomKeyInput] = useState<string>('');

  const VARIABLE_PRESETS = [
    { key: 'candidateName', label: 'Candidate Full Name', sample: 'Alex Mercer' },
    { key: 'candidateId', label: 'Candidate ID', sample: 'CAND-2026-881' },
    { key: 'candidateEmail', label: 'Candidate Email', sample: 'alex.mercer@univ.edu' },
    { key: 'courseName', label: 'Program / Course Name', sample: 'Advanced Cloud Architecture' },
    { key: 'project_title', label: 'Project Title / Topic', sample: 'AI Healthcare Diagnostics Engine' },
    { key: 'event_track', label: 'Event / Track Name', sample: 'Generative AI & HealthTech' },
    { key: 'rank', label: 'Award Position / Rank', sample: '1st Place Grand Winner' },
    { key: 'grade', label: 'Honors / Distinction / Grade', sample: 'High Distinction (Summa Cum Laude)' },
    { key: 'score', label: 'Score / Evaluation Marks', sample: '98%' },
    { key: 'issueDate', label: 'Issue Date', sample: '2026-09-03' },
    { key: 'completionDate', label: 'Completion Date', sample: '2026-08-30' },
    { key: 'duration', label: 'Duration / Hours / CME', sample: '120 Contact Hours' },
    { key: 'department', label: 'Department / Unit', sample: 'Faculty of Computing' },
    { key: 'signatory1Name', label: 'Dean / Signatory Name', sample: 'Dr. Jane Stanford' },
    { key: 'certificateNumber', label: 'Certificate Serial', sample: 'CERT-2026-0982' },
    { key: 'credentialId', label: 'Verification ID', sample: 'ICX-2026-A8F2' }
  ];

  const { page, background, elements } = schema;
  const width = page.width;
  const height = page.height;

  const selectedElement = elements.find(el => el.id === selectedElementId) || null;

  // Snap helper
  const snap = useCallback((val: number) => {
    if (!snapToGrid) return val;
    return Math.round(val / gridSize) * gridSize;
  }, [snapToGrid, gridSize]);

  // Handle Drag Start on an element or handle
  const handlePointerDown = (e: React.PointerEvent, mode: DragMode, el?: StudioElement) => {
    e.stopPropagation();
    setHasMovedDuringDrag(false);

    if (el) {
      onSelectElement(el.id);
      if (el.locked && mode === 'move') {
        return;
      }
    }

    const targetEl = el || selectedElement;
    if (!targetEl) return;

    setDragMode(mode);
    setDragStart({
      x: e.clientX,
      y: e.clientY,
      elX: targetEl.x,
      elY: targetEl.y,
      elW: targetEl.width,
      elH: targetEl.height,
      elRot: targetEl.rotation || 0
    });

    try {
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
    } catch {}
  };

  // Handle Drag Move
  const handlePointerMove = (e: React.PointerEvent) => {
    if (canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      const rawX = (e.clientX - rect.left) / zoom;
      const rawY = (e.clientY - rect.top) / zoom;
      setMousePos({ x: Math.round(rawX), y: Math.round(rawY) });
    }

    if (!dragMode || !dragStart || !selectedElement || selectedElement.locked) {
      return;
    }

    const deltaX = (e.clientX - dragStart.x) / zoom;
    const deltaY = (e.clientY - dragStart.y) / zoom;

    if (Math.abs(deltaX) > 2 || Math.abs(deltaY) > 2) {
      setHasMovedDuringDrag(true);
    }

    if (dragMode === 'move') {
      let newX = snap(dragStart.elX + deltaX);
      let newY = snap(dragStart.elY + deltaY);

      // Clamp within canvas with slight margin
      newX = Math.max(-100, Math.min(width - 20, newX));
      newY = Math.max(-100, Math.min(height - 20, newY));

      onUpdateElement({
        ...selectedElement,
        x: newX,
        y: newY
      });
    } else if (dragMode === 'rotate') {
      if (!canvasRef.current) return;
      const rect = canvasRef.current.getBoundingClientRect();
      const elCenterX = rect.left + (selectedElement.x + selectedElement.width / 2) * zoom;
      const elCenterY = rect.top + (selectedElement.y + selectedElement.height / 2) * zoom;

      const angleRad = Math.atan2(e.clientY - elCenterY, e.clientX - elCenterX);
      let angleDeg = Math.round(angleRad * (180 / Math.PI)) + 90;
      if (angleDeg < 0) angleDeg += 360;
      if (angleDeg >= 360) angleDeg -= 360;

      // Snap to cardinal angles
      if (Math.abs(angleDeg - 0) < 4 || Math.abs(angleDeg - 360) < 4) angleDeg = 0;
      if (Math.abs(angleDeg - 90) < 4) angleDeg = 90;
      if (Math.abs(angleDeg - 180) < 4) angleDeg = 180;
      if (Math.abs(angleDeg - 270) < 4) angleDeg = 270;

      onUpdateElement({
        ...selectedElement,
        rotation: angleDeg
      });
    } else {
      // Resize Handles
      let newX = dragStart.elX;
      let newY = dragStart.elY;
      let newW = dragStart.elW;
      let newH = dragStart.elH;

      if (dragMode.includes('e')) {
        newW = snap(Math.max(20, dragStart.elW + deltaX));
      }
      if (dragMode.includes('s')) {
        newH = snap(Math.max(15, dragStart.elH + deltaY));
      }
      if (dragMode.includes('w')) {
        const potentialW = snap(Math.max(20, dragStart.elW - deltaX));
        newX = dragStart.elX + (dragStart.elW - potentialW);
        newW = potentialW;
      }
      if (dragMode.includes('n')) {
        const potentialH = snap(Math.max(15, dragStart.elH - deltaY));
        newY = dragStart.elY + (dragStart.elH - potentialH);
        newH = potentialH;
      }

      onUpdateElement({
        ...selectedElement,
        x: newX,
        y: newY,
        width: newW,
        height: newH
      });
    }
  };

  // Handle Drag End
  const handlePointerUp = (e: React.PointerEvent) => {
    if (dragMode) {
      try {
        (e.target as HTMLElement).releasePointerCapture(e.pointerId);
      } catch {}
      setDragMode(null);
      setDragStart(null);
    }
  };

  // Keyboard navigation & quick shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      if (!selectedElement) return;

      const increment = e.shiftKey ? 10 : 1;

      if (e.key === 'ArrowUp') {
        e.preventDefault();
        onUpdateElement({ ...selectedElement, y: selectedElement.y - increment });
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        onUpdateElement({ ...selectedElement, y: selectedElement.y + increment });
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        onUpdateElement({ ...selectedElement, x: selectedElement.x - increment });
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        onUpdateElement({ ...selectedElement, x: selectedElement.x + increment });
      } else if ((e.key === 'Delete' || e.key === 'Backspace') && onDeleteElement) {
        e.preventDefault();
        onDeleteElement(selectedElement.id);
      } else if (e.key === 'Escape') {
        onSelectElement(null);
        setEditingTextId(null);
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'd' && onDuplicateElement) {
        e.preventDefault();
        onDuplicateElement(selectedElement);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedElement, onUpdateElement, onDeleteElement, onDuplicateElement, onSelectElement]);

  // Universal HTML5 Drop handler
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOverCanvas(false);
    if (!canvasRef.current || !onDropElement) return;

    try {
      const payloadStr = e.dataTransfer.getData('application/json');
      if (!payloadStr) return;
      const payload = JSON.parse(payloadStr);

      const rect = canvasRef.current.getBoundingClientRect();
      const rawX = (e.clientX - rect.left) / zoom;
      const rawY = (e.clientY - rect.top) / zoom;

      const canvasX = snap(Math.max(10, Math.min(width - 150, rawX - 80)));
      const canvasY = snap(Math.max(10, Math.min(height - 40, rawY - 20)));

      onDropElement(payload.type, payload.data, canvasX, canvasY);
    } catch {}
  };

  // Helper to extract value from demoData matching the variable key
  const lookupDemoValue = (keyToFind: string, data: any): string | undefined => {
    if (!data || typeof data !== 'object' || !keyToFind) return undefined;
    const clean = (k: string) => k.toLowerCase().replace(/[^a-z0-9]/g, '');
    const target = clean(keyToFind);
    if (!target) return undefined;

    // 1. Direct exact key match
    if (data[keyToFind] !== undefined && data[keyToFind] !== null && data[keyToFind] !== '') {
      return String(data[keyToFind]);
    }

    // 2. Normalized clean key match
    for (const [dKey, dVal] of Object.entries(data)) {
      if (dVal !== undefined && dVal !== null && dVal !== '') {
        const cleanDKey = clean(dKey);
        if (cleanDKey === target) {
          return String(dVal);
        }
      }
    }

    return undefined;
  };

  // Helper to resolve dynamic field value in preview vs token edit mode
  const resolveFieldValue = (el: StudioElement): string => {
    const isVar = el.isVariable || el.type === 'dynamic-field';
    const rawText = el.text || '';

    if (!previewMode) {
      if (isVar) {
        const varKey = (el.customVariableKey || el.fieldKey || el.name || 'variable').trim();
        return `{{${varKey}}}`;
      }
      return rawText;
    }

    // A. Check for explicit template placeholders like {{credits}} or {{candidateName}}
    if (demoData && rawText.includes('{{')) {
      const interpolated = rawText.replace(/\{\{([^}]+)\}\}/g, (match, token) => {
        const found = lookupDemoValue(token.trim(), demoData);
        return found !== undefined ? found : match;
      });
      return `${el.prefix || ''}${interpolated}${el.suffix || ''}`;
    }

    // B. If explicitly marked as a Dynamic Variable Layer
    if (isVar) {
      const varKey = (el.customVariableKey || el.fieldKey || el.name || '').trim();
      let value: string | undefined = undefined;

      if (demoData && varKey) {
        value = lookupDemoValue(varKey, demoData);
        if (!value && el.customVariableKey) value = lookupDemoValue(el.customVariableKey, demoData);
        if (!value && el.fieldKey) value = lookupDemoValue(el.fieldKey, demoData);
      }

      if (!value) {
        value = el.fallbackText || el.text || (varKey ? `{{${varKey}}}` : '');
      }

      const prefix = el.prefix || '';
      const suffix = el.suffix || '';
      return `${prefix}${value}${suffix}`;
    }

    // C. Pure Static Text -> REMAINS STRICTLY STATIC
    return rawText;
  };

  const sortedElements = [...elements].sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0));

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-slate-200/90 relative select-none">
      {/* Scrollable Stage Area */}
      <div 
        ref={containerRef}
        onClick={(e) => {
          // Only deselect if clicked directly on empty stage backdrop
          if (e.target === containerRef.current) {
            onSelectElement(null);
            setEditingTextId(null);
          }
        }}
        className="flex-1 overflow-auto flex items-center justify-center p-8 sm:p-14 relative min-h-[450px]"
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragOverCanvas(true);
        }}
        onDragLeave={() => setIsDragOverCanvas(false)}
        onDrop={handleDrop}
      >
        {/* The Printable Vector Parchment / Canvas */}
        <div
          ref={canvasRef}
          onClick={(e) => {
            // If clicked on canvas background itself, clear selection
            if (e.target === canvasRef.current || (e.target as HTMLElement)?.id === 'canvas-background-layer') {
              onSelectElement(null);
              setEditingTextId(null);
            }
          }}
          className={`relative bg-white shadow-2xl transition-all duration-75 ease-out shrink-0 ${
            isDragOverCanvas ? 'ring-4 ring-[#0284C7] ring-offset-4' : 'ring-1 ring-slate-400/30'
          }`}
          style={{
            width: `${width * zoom}px`,
            height: `${height * zoom}px`,
            minWidth: `${width * zoom}px`,
            minHeight: `${height * zoom}px`
          }}
        >
          {/* Inner Scaled Box (1:1 coordinate space) */}
          <div
            id="canvas-background-layer"
            className="absolute inset-0 origin-top-left"
            style={{
              width: `${width}px`,
              height: `${height}px`,
              transform: `scale(${zoom})`,
              backgroundColor: background.value || '#FFFFFF'
            }}
          >
            {/* Subtle Parchment Security Texture */}
            {background.patternType === 'parchment-texture' && (
              <div 
                className="absolute inset-0 pointer-events-none opacity-40 mix-blend-multiply"
                style={{
                  backgroundImage: `radial-gradient(#d97706 0.75px, transparent 0.75px), radial-gradient(#d97706 0.75px, #fbf8f3 0.75px)`,
                  backgroundSize: '30px 30px',
                  backgroundPosition: '0 0, 15px 15px'
                }}
              />
            )}

            {/* Grid Overlay */}
            {showGrid && (
              <div
                className="absolute inset-0 pointer-events-none z-10"
                style={{
                  backgroundImage: `linear-gradient(to right, rgba(2, 132, 199, 0.15) 1px, transparent 1px), linear-gradient(to bottom, rgba(2, 132, 199, 0.15) 1px, transparent 1px)`,
                  backgroundSize: `${gridSize}px ${gridSize}px`
                }}
              />
            )}

            {/* Watermark Crest Background */}
            <div className="absolute inset-0 flex items-center justify-center opacity-[0.025] pointer-events-none z-0">
              <ShieldCheck style={{ width: `${Math.min(width, height) * 0.45}px`, height: `${Math.min(width, height) * 0.45}px` }} />
            </div>

            {/* Elements Layer */}
            {sortedElements.map((el) => {
              if (el.hidden) return null;
              const isSelected = selectedElementId === el.id;
              const isEditing = editingTextId === el.id;

              return (
                <div
                  key={el.id}
                  id={`el-container-${el.id}`}
                  onPointerDown={(e) => handlePointerDown(e, 'move', el)}
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectElement(el.id);
                  }}
                  onDoubleClick={(e) => {
                    e.stopPropagation();
                    if (el.type === 'text' || el.type === 'dynamic-field') {
                      setEditingTextId(el.id);
                    }
                  }}
                  className={`absolute transition-shadow select-none group ${
                    el.locked ? 'cursor-not-allowed' : 'cursor-move'
                  } ${
                    isSelected 
                      ? 'ring-2 ring-[#0284C7] ring-offset-1 z-40' 
                      : 'hover:outline hover:outline-1 hover:outline-[#0284C7]/60'
                  }`}
                  style={{
                    left: `${el.x}px`,
                    top: `${el.y}px`,
                    width: `${el.width}px`,
                    height: `${el.height}px`,
                    transform: el.rotation ? `rotate(${el.rotation}deg)` : undefined,
                    opacity: el.opacity !== undefined ? el.opacity / 100 : 1,
                    zIndex: isSelected ? 50 : el.zIndex || 1
                  }}
                >
                  {/* Canva Floating Quick-Actions Pill (Top of active element) */}
                  {isSelected && (
                    <div 
                      onPointerDown={(e) => e.stopPropagation()}
                      onClick={(e) => e.stopPropagation()}
                      className="absolute -top-10 left-1/2 -translate-x-1/2 bg-white text-slate-800 border border-slate-200 shadow-xl px-2 py-1 flex items-center gap-1.5 z-[70] text-[10px] font-semibold whitespace-nowrap rounded-xl animate-fadeIn select-none"
                    >
                      {/* Name / Token Pill */}
                      <span className="font-mono text-slate-500 max-w-[110px] truncate border-r border-slate-200 pr-1.5">
                        {el.name || el.type}
                      </span>

                      {/* Variable Toggle Button (For Text / Dynamic Elements) */}
                      {(el.type === 'text' || el.type === 'dynamic-field') && (
                        <div className="relative border-r border-slate-200 pr-1.5">
                          <button
                            onClick={() => setOpenVariableMenu(!openVariableMenu)}
                            className={`px-2 py-0.5 rounded-lg flex items-center gap-1 cursor-pointer transition-all ${
                              el.isVariable || el.type === 'dynamic-field'
                                ? 'bg-gradient-to-r from-sky-500 to-[#0284C7] text-white font-bold shadow-xs hover:brightness-105'
                                : 'bg-slate-100 hover:bg-sky-50 text-slate-700 hover:text-[#0284C7] border border-slate-200'
                            }`}
                            title={el.isVariable || el.type === 'dynamic-field' ? 'Configured as Dynamic Variable (Click to change)' : 'Make this layer a Variable (Click to configure)'}
                          >
                            <Braces className="w-3 h-3 shrink-0" />
                            <span>
                              {el.isVariable || el.type === 'dynamic-field' 
                                ? `{{${el.customVariableKey || el.fieldKey || el.name || 'var'}}}` 
                                : 'Make Variable'}
                            </span>
                            <ChevronDown className="w-2.5 h-2.5 opacity-80 shrink-0" />
                          </button>

                          {/* Variable Configuration Popover */}
                          {openVariableMenu && (
                            <>
                              {/* Click-outside backdrop */}
                              <div 
                                className="fixed inset-0 z-[80]" 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setOpenVariableMenu(false);
                                }} 
                              />

                              {/* Solid Elevated Popover Card */}
                              <div 
                                onPointerDown={(e) => e.stopPropagation()}
                                onClick={(e) => e.stopPropagation()}
                                className="absolute top-8 -left-12 bg-white border border-slate-200 shadow-2xl p-3 z-[90] w-72 rounded-2xl space-y-2.5 text-xs animate-fadeIn text-left font-normal text-slate-800"
                              >
                                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                                  <span className="text-[11px] font-bold text-[#0A2540] flex items-center gap-1.5">
                                    <Database className="w-3.5 h-3.5 text-[#0284C7]" />
                                    <span>Layer Variable Setting</span>
                                  </span>
                                  <button
                                    onClick={() => setOpenVariableMenu(false)}
                                    className="text-slate-400 hover:text-slate-700 p-0.5 rounded-lg hover:bg-slate-100 cursor-pointer"
                                  >
                                    ✕
                                  </button>
                                </div>

                                {/* Toggle: Constant vs Variable */}
                                <div className="flex items-center justify-between bg-slate-50 p-2 rounded-xl border border-slate-200/80">
                                  <span className="text-[11px] font-semibold text-slate-700">Variable Layer:</span>
                                  <button
                                    onClick={() => {
                                      const nextIsVar = !(el.isVariable || el.type === 'dynamic-field');
                                      onUpdateElement({
                                        ...el,
                                        isVariable: nextIsVar,
                                        type: nextIsVar ? 'dynamic-field' : 'text',
                                        customVariableKey: nextIsVar ? (el.customVariableKey || el.fieldKey || el.name || 'custom_field') : undefined,
                                        fallbackText: el.fallbackText || el.text
                                      });
                                    }}
                                    className={`px-3 py-1 text-[10px] font-bold rounded-full transition-all cursor-pointer shadow-xs ${
                                      el.isVariable || el.type === 'dynamic-field'
                                        ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                                        : 'bg-slate-200 hover:bg-slate-300 text-slate-700'
                                    }`}
                                  >
                                    {el.isVariable || el.type === 'dynamic-field' ? 'YES (DYNAMIC)' : 'NO (STATIC)'}
                                  </button>
                                </div>

                                {(el.isVariable || el.type === 'dynamic-field') && (
                                  <>
                                    {/* Custom Key Input */}
                                    <div className="space-y-1">
                                      <span className="text-[10px] font-bold text-slate-600 block">
                                        Custom Variable Key / Header:
                                      </span>
                                      <div className="flex items-center gap-1.5">
                                        <input
                                          type="text"
                                          value={customKeyInput || el.customVariableKey || el.fieldKey || el.name || ''}
                                          onChange={(e) => setCustomKeyInput(e.target.value)}
                                          onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                              e.preventDefault();
                                              if (customKeyInput.trim()) {
                                                onUpdateElement({
                                                  ...el,
                                                  isVariable: true,
                                                  type: 'dynamic-field',
                                                  customVariableKey: customKeyInput.trim(),
                                                  name: customKeyInput.trim()
                                                });
                                                setOpenVariableMenu(false);
                                              }
                                            }
                                          }}
                                          placeholder="e.g. project_title, track, rank"
                                          className="flex-1 px-2.5 py-1.5 text-[11px] font-mono font-semibold border border-slate-300 rounded-xl focus:outline-none focus:border-[#0284C7] bg-slate-50 focus:bg-white"
                                        />
                                        <button
                                          onClick={() => {
                                            if (customKeyInput.trim()) {
                                              onUpdateElement({
                                                ...el,
                                                isVariable: true,
                                                type: 'dynamic-field',
                                                customVariableKey: customKeyInput.trim(),
                                                name: customKeyInput.trim()
                                              });
                                              setOpenVariableMenu(false);
                                            }
                                          }}
                                          className="px-3 py-1.5 bg-[#0284C7] hover:bg-[#0369A1] text-white text-[11px] font-bold rounded-xl cursor-pointer shadow-xs transition-colors"
                                        >
                                          Set
                                        </button>
                                      </div>
                                    </div>

                                    {/* Preset Suggestions */}
                                    <div className="space-y-1 pt-1.5 border-t border-slate-100">
                                      <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-slate-400 block">
                                        Or Pick Standard Preset Key:
                                      </span>
                                      <div className="max-h-40 overflow-y-auto space-y-1 pr-1">
                                        {VARIABLE_PRESETS.map((p) => {
                                          const isCurrent = (el.customVariableKey === p.key || el.fieldKey === p.key);
                                          return (
                                            <button
                                              key={p.key}
                                              onClick={() => {
                                                onUpdateElement({
                                                  ...el,
                                                  isVariable: true,
                                                  type: 'dynamic-field',
                                                  customVariableKey: p.key,
                                                  fieldKey: p.key as any,
                                                  name: p.label,
                                                  fallbackText: p.sample
                                                });
                                                setCustomKeyInput(p.key);
                                                setOpenVariableMenu(false);
                                              }}
                                              className={`w-full p-1.5 text-left text-[11px] rounded-xl flex items-center justify-between hover:bg-sky-50 transition-colors cursor-pointer border ${
                                                isCurrent ? 'bg-sky-50/80 border-sky-300 text-[#0284C7] font-bold' : 'border-transparent text-slate-700'
                                              }`}
                                            >
                                              <span className="truncate max-w-[135px] font-medium">{p.label}</span>
                                              <span className="text-[10px] font-mono bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded-md font-semibold">
                                                {`{{${p.key}}}`}
                                              </span>
                                            </button>
                                          );
                                        })}
                                      </div>
                                    </div>
                                  </>
                                )}
                              </div>
                            </>
                          )}
                        </div>
                      )}

                      {/* Lock / Unlock */}
                      <button
                        onClick={() => onUpdateElement({ ...el, locked: !el.locked })}
                        className={`p-1 rounded-md hover:bg-slate-100 cursor-pointer ${el.locked ? 'text-amber-600' : 'text-slate-600'}`}
                        title={el.locked ? 'Unlock element' : 'Lock element'}
                      >
                        {el.locked ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
                      </button>

                      {/* Align Center */}
                      <button
                        onClick={() => onUpdateElement({ ...el, x: Math.round((width - el.width) / 2) })}
                        className="p-1 rounded-md hover:bg-slate-100 text-slate-600 cursor-pointer"
                        title="Align Center Horizontal"
                      >
                        <AlignCenter className="w-3 h-3" />
                      </button>

                      {/* Duplicate */}
                      {onDuplicateElement && (
                        <button
                          onClick={() => onDuplicateElement(el)}
                          className="p-1 rounded-md hover:bg-slate-100 text-slate-600 cursor-pointer"
                          title="Duplicate (Ctrl+D)"
                        >
                          <Copy className="w-3 h-3" />
                        </button>
                      )}

                      {/* Delete */}
                      {(el.type === 'seal' || el.type === 'qr') ? (
                        <span 
                          className="px-1.5 py-0.5 bg-sky-50 text-[#0284C7] rounded text-[9px] font-bold flex items-center gap-1 border border-sky-200"
                          title={`iCertiX Sovereign Verification ${el.type === 'seal' ? 'Badge' : 'QR Code'} is mandatory on all certificates and cannot be removed`}
                        >
                          <ShieldCheck className="w-3 h-3 text-[#0284C7]" />
                          <span>Mandatory {el.type === 'seal' ? 'Badge' : 'QR'}</span>
                        </span>
                      ) : onDeleteElement && (
                        <button
                          onClick={() => onDeleteElement(el.id)}
                          className="p-1 rounded-md hover:bg-red-50 text-red-600 cursor-pointer"
                          title="Delete (Delete/Backspace)"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  )}

                  {/* Text & Dynamic Field Rendering */}
                  {(el.type === 'text' || el.type === 'dynamic-field') && (
                    <div className="w-full h-full flex flex-col justify-center overflow-hidden pointer-events-none">
                      {isEditing ? (
                        <input
                          type="text"
                          autoFocus
                          value={el.text || ''}
                          onChange={(e) => onUpdateElement({ ...el, text: e.target.value })}
                          onBlur={() => setEditingTextId(null)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') setEditingTextId(null);
                          }}
                          className="w-full h-full bg-white/95 border border-[#0284C7] px-2 text-slate-900 focus:outline-none pointer-events-auto"
                          style={{
                            fontFamily: el.fontFamily || 'Plus Jakarta Sans',
                            fontSize: `${el.fontSize || 16}px`,
                            fontWeight: el.fontWeight || 'normal',
                            textAlign: el.textAlign || 'center'
                          }}
                        />
                      ) : (
                        <div
                          className="w-full truncate"
                          style={{
                            fontFamily: el.fontFamily || 'Plus Jakarta Sans',
                            fontSize: `${el.fontSize || 16}px`,
                            fontWeight: el.fontWeight || 'normal',
                            fontStyle: el.fontStyle || 'normal',
                            textDecoration: el.textDecoration || 'none',
                            color: el.color || '#0A2540',
                            textAlign: el.textAlign || 'center',
                            letterSpacing: el.letterSpacing ? `${el.letterSpacing}px` : undefined,
                            lineHeight: el.lineHeight || 1.3,
                            textTransform: el.textTransform || 'none'
                          }}
                        >
                          {resolveFieldValue(el)}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Shape Rendering */}
                  {el.type === 'shape' && (
                    <div
                      className="w-full h-full pointer-events-none"
                      style={{
                        backgroundColor: el.fill || 'transparent',
                        borderColor: el.stroke || 'transparent',
                        borderWidth: el.strokeWidth !== undefined ? `${el.strokeWidth}px` : undefined,
                        borderStyle: el.strokeStyle || (el.stroke ? 'solid' : 'none'),
                        borderRadius: el.shapeType === 'circle' ? '9999px' : el.borderRadius ? `${el.borderRadius}px` : '0px'
                      }}
                    />
                  )}

                  {/* Line Rendering */}
                  {el.type === 'line' && (
                    <div className="w-full h-full flex items-center justify-center pointer-events-none">
                      <div
                        className="w-full"
                        style={{
                          height: `${el.strokeWidth || 2}px`,
                          backgroundColor: el.stroke || '#CBD5E1',
                          borderStyle: el.strokeStyle || 'solid'
                        }}
                      />
                    </div>
                  )}

                  {/* Official Seal Rendering */}
                  {el.type === 'seal' && (
                    <div className="w-full h-full flex items-center justify-center pointer-events-none">
                      <IcertixSeal 
                        size={Math.min(el.width, el.height)} 
                        showGlow={false} 
                      />
                    </div>
                  )}

                  {/* Dynamic QR Code Rendering */}
                  {el.type === 'qr' && (
                    <div className="w-full h-full flex flex-col items-center justify-center p-1 bg-white border border-slate-300 shadow-2xs pointer-events-none">
                      <QrCodeSvg 
                        value={demoData?.verificationQr || demoData?.verificationUrl || (demoData?.credentialId ? `${window.location.origin}/verify/${demoData.credentialId}` : `${window.location.origin}/verify/ICX-2026-DEMO`)} 
                        size={Math.min(el.width, el.height) - 12}
                        fgColor={el.qrFgColor || '#0A2540'} 
                        bgColor={el.qrBgColor || '#FFFFFF'}
                        level={el.qrLevel || 'M'}
                      />
                      {el.qrShowLabel && (
                        <span className="text-[7px] font-mono font-bold uppercase tracking-wider text-slate-500 mt-0.5">
                          Scan to Verify
                        </span>
                      )}
                    </div>
                  )}

                  {/* Signature Line Rendering */}
                  {el.type === 'signature' && (
                    <div className="w-full h-full flex flex-col justify-end text-left font-sans pointer-events-none">
                      <div 
                        className="italic text-base font-serif border-b border-slate-400 pb-0.5 text-slate-900"
                        style={{ fontFamily: 'Alex Brush, Great Vibes, Georgia, serif', fontSize: '20px' }}
                      >
                        {demoData?.signatory1Name || 'Dr. Jennifer Widom'}
                      </div>
                      <div className="text-[9px] font-bold text-slate-800 uppercase tracking-wider mt-0.5 font-mono">
                        {demoData?.signatory1Role || 'Dean & Registrar'}
                      </div>
                      <div className="text-[8px] font-mono text-slate-400">
                        Key: {demoData?.signatory1Key || 'HSM-STANFORD-01'}
                      </div>
                    </div>
                  )}

                  {/* Image Rendering */}
                  {el.type === 'image' && el.src && (
                    <img 
                      src={el.src} 
                      alt={el.name} 
                      className="w-full h-full object-contain pointer-events-none"
                    />
                  )}

                  {/* Lock Badge if locked */}
                  {el.locked && isSelected && (
                    <div className="absolute -top-3 -right-3 bg-amber-500 text-white p-1 rounded-full shadow-md z-50">
                      <Lock className="w-3 h-3" />
                    </div>
                  )}

                  {/* Transform Handles Bounding Box (Canva style 8 points + circular rotation handle) */}
                  {isSelected && !el.locked && (
                    <>
                      {/* Rotation Handle (Positioned right below the bounding box) */}
                      <div
                        onPointerDown={(e) => handlePointerDown(e, 'rotate')}
                        className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-6 h-6 bg-white border border-[#0284C7] rounded-full flex items-center justify-center cursor-grab shadow-md hover:bg-sky-50 z-30 transition-transform active:scale-95"
                        title="Drag to rotate"
                      >
                        <RotateCw className="w-3 h-3 text-[#0284C7]" />
                      </div>
                      <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-0.5 h-4 bg-[#0284C7] pointer-events-none" />

                      {/* 4 Corner Handles (Circles) */}
                      <div
                        onPointerDown={(e) => handlePointerDown(e, 'nw')}
                        className="absolute -top-2 -left-2 w-3.5 h-3.5 bg-white border-2 border-[#0284C7] rounded-full cursor-nwse-resize shadow-xs hover:bg-[#0284C7] z-30"
                      />
                      <div
                        onPointerDown={(e) => handlePointerDown(e, 'ne')}
                        className="absolute -top-2 -right-2 w-3.5 h-3.5 bg-white border-2 border-[#0284C7] rounded-full cursor-nesw-resize shadow-xs hover:bg-[#0284C7] z-30"
                      />
                      <div
                        onPointerDown={(e) => handlePointerDown(e, 'se')}
                        className="absolute -bottom-2 -right-2 w-3.5 h-3.5 bg-white border-2 border-[#0284C7] rounded-full cursor-nwse-resize shadow-xs hover:bg-[#0284C7] z-30"
                      />
                      <div
                        onPointerDown={(e) => handlePointerDown(e, 'sw')}
                        className="absolute -bottom-2 -left-2 w-3.5 h-3.5 bg-white border-2 border-[#0284C7] rounded-full cursor-nesw-resize shadow-xs hover:bg-[#0284C7] z-30"
                      />

                      {/* 4 Side Midpoint Handles (Pills) */}
                      <div
                        onPointerDown={(e) => handlePointerDown(e, 'n')}
                        className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-5 h-2 bg-white border-2 border-[#0284C7] cursor-ns-resize shadow-xs z-30 rounded-full"
                      />
                      <div
                        onPointerDown={(e) => handlePointerDown(e, 's')}
                        className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-5 h-2 bg-white border-2 border-[#0284C7] cursor-ns-resize shadow-xs z-30 rounded-full"
                      />
                      <div
                        onPointerDown={(e) => handlePointerDown(e, 'w')}
                        className="absolute top-1/2 -left-1.5 -translate-y-1/2 w-2 h-5 bg-white border-2 border-[#0284C7] cursor-ew-resize shadow-xs z-30 rounded-full"
                      />
                      <div
                        onPointerDown={(e) => handlePointerDown(e, 'e')}
                        className="absolute top-1/2 -right-1.5 -translate-y-1/2 w-2 h-5 bg-white border-2 border-[#0284C7] cursor-ew-resize shadow-xs z-30 rounded-full"
                      />
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Clean Canva-Style Bottom Zoom & Canvas Dock */}
      <div className="h-11 min-h-[44px] bg-white border-t border-[#e5ebf4] px-2 sm:px-4 flex items-center justify-between text-xs select-none shrink-0 z-20 shadow-xs overflow-x-auto whitespace-nowrap scrollbar-none gap-2 sm:gap-3">
        {/* Left Side: Canvas Specs & Selected Element Badge */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="px-3 py-1 bg-[#f4f7fc] border border-[#e5ebf4] rounded-xl text-[#0c1a30] font-mono text-[11px] font-semibold flex items-center gap-1.5 shrink-0 whitespace-nowrap">
            <span className="w-1.5 h-1.5 rounded-full bg-[#1877e0] shrink-0" />
            <span>{page.size} {page.orientation === 'landscape' ? 'Landscape' : 'Portrait'}</span>
            <span className="text-[#66748c]">({width} × {height}px)</span>
          </div>

          {selectedElement && (
            <div className="flex items-center gap-1.5 px-3 py-1 bg-sky-50 border border-sky-200 rounded-xl text-[#1877e0] text-[11px] font-bold shrink-0 whitespace-nowrap">
              <span className="truncate max-w-[140px]">{selectedElement.name}</span>
            </div>
          )}
        </div>

        {/* Right Side: Grid, Snap, Zoom Slider & Fit */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Grid toggle */}
          {onToggleGrid && (
            <button
              onClick={onToggleGrid}
              className={`p-1.5 rounded-xl border transition-all cursor-pointer ${
                showGrid 
                  ? 'bg-[#0a1f44] text-[#2ea6ff] border-[#0a1f44] shadow-xs' 
                  : 'bg-[#f4f7fc] text-slate-600 border-[#e5ebf4] hover:bg-slate-100'
              }`}
              title="Toggle Grid Lines"
            >
              <Grid3X3 className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Snap toggle */}
          {onToggleSnap && (
            <button
              onClick={onToggleSnap}
              className={`p-1.5 rounded-xl border transition-all cursor-pointer ${
                snapToGrid 
                  ? 'bg-[#0a1f44] text-[#2ea6ff] border-[#0a1f44] shadow-xs' 
                  : 'bg-[#f4f7fc] text-slate-600 border-[#e5ebf4] hover:bg-slate-100'
              }`}
              title="Toggle Snap to Grid"
            >
              <Magnet className="w-3.5 h-3.5" />
            </button>
          )}

          <div className="h-4 w-px bg-slate-200 mx-0.5 hidden sm:block shrink-0" />

          {/* Zoom Slider Controls */}
          {onZoomChange && (
            <div className="flex items-center gap-1.5 bg-[#f4f7fc] px-2 py-1 rounded-xl border border-[#e5ebf4] shrink-0">
              <button
                onClick={() => onZoomChange(Math.max(0.3, zoom - 0.1))}
                className="p-1 hover:bg-white text-slate-600 rounded-lg cursor-pointer transition-colors"
                title="Zoom Out"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>

              <input
                type="range"
                min="0.3"
                max="2.0"
                step="0.05"
                value={zoom}
                onChange={(e) => onZoomChange(parseFloat(e.target.value))}
                className="w-16 sm:w-24 accent-[#1877e0] cursor-pointer h-1.5 bg-slate-300 rounded-lg appearance-none"
              />

              <button
                onClick={() => onZoomChange(Math.min(2.0, zoom + 0.1))}
                className="p-1 hover:bg-white text-slate-600 rounded-lg cursor-pointer transition-colors"
                title="Zoom In"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>

              <span className="font-mono text-[11px] font-bold text-[#0c1a30] w-9 text-center select-none">
                {Math.round(zoom * 100)}%
              </span>
            </div>
          )}

          {/* Fit to screen */}
          {onFitZoom && (
            <button
              onClick={onFitZoom}
              className="p-1.5 px-2.5 bg-[#f4f7fc] hover:bg-slate-100 text-[#0c1a30] rounded-xl border border-[#e5ebf4] font-bold text-xs flex items-center gap-1 cursor-pointer transition-all shadow-xs shrink-0"
              title="Fit to Screen"
            >
              <Maximize2 className="w-3.5 h-3.5 text-[#1877e0]" />
              <span className="hidden sm:inline text-[11px]">Fit</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
