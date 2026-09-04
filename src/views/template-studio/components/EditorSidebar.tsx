import React, { useState } from 'react';
import { 
  Layout, 
  Shapes, 
  Database, 
  Palette, 
  Layers, 
  Image as ImageIcon,
  Type, 
  Plus, 
  QrCode, 
  Award, 
  FileSignature, 
  ShieldCheck, 
  Lock, 
  Unlock, 
  Eye, 
  EyeOff, 
  Trash2, 
  Copy, 
  ChevronUp, 
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Search,
  Upload,
  Link2,
  Sliders,
  Braces,
  Square,
  Circle,
  Minus,
  Shield,
  Star,
  Bookmark,
  Maximize2,
  Stamp,
  Hash
} from 'lucide-react';
import { 
  StudioElement, 
  StudioDesignSchema, 
  DynamicFieldKey, 
  ElementType 
} from '../../../types/templateStudio';
import { PREBUILT_TEMPLATES_CATALOG, DEFAULT_DEMO_DATA } from '../../../utils/templatePresets';
import { VectorCertificatePreview } from './VectorCertificatePreview';

interface EditorSidebarProps {
  schema: StudioDesignSchema;
  selectedElementId: string | null;
  onSelectElement: (id: string | null) => void;
  onAddElement: (element: StudioElement) => void;
  onUpdateElement: (element: StudioElement) => void;
  onDeleteElement: (id: string) => void;
  onReorderElements: (newElements: StudioElement[]) => void;
  onUpdateBackground: (bg: any) => void;
  onApplyTemplatePreset: (presetSchema: StudioDesignSchema) => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

type SidebarTab = 'text' | 'elements' | 'fields' | 'templates' | 'uploads' | 'background' | 'layers';

export const EditorSidebar: React.FC<EditorSidebarProps> = ({
  schema,
  selectedElementId,
  onSelectElement,
  onAddElement,
  onUpdateElement,
  onDeleteElement,
  onReorderElements,
  onUpdateBackground,
  onApplyTemplatePreset,
  isCollapsed = false,
  onToggleCollapse
}) => {
  const [activeTab, setActiveTab] = useState<SidebarTab>('text');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [customImageUrl, setCustomImageUrl] = useState('');

  const isDrawerVisible = !isCollapsed && drawerOpen;

  const handleTabClick = (tabId: SidebarTab) => {
    if (activeTab === tabId && isDrawerVisible) {
      setDrawerOpen(false);
    } else {
      setActiveTab(tabId);
      setDrawerOpen(true);
      if (isCollapsed && onToggleCollapse) {
        onToggleCollapse();
      }
    }
  };

  // Helper for text insertions
  const handleInsertText = (preset: 'custom' | 'heading' | 'subheading' | 'body' | 'calligraphy') => {
    const textConfig = {
      custom: {
        name: 'Text Box',
        text: 'Type your custom text here',
        fontSize: 18,
        fontFamily: 'Plus Jakarta Sans',
        fontWeight: '500',
        fontStyle: 'normal' as const,
        color: '#0A2540',
        width: 450,
        height: 40
      },
      heading: {
        name: 'Certificate Heading',
        text: 'CERTIFICATE OF ACHIEVEMENT',
        fontSize: 28,
        fontFamily: 'Cinzel',
        fontWeight: 'bold',
        fontStyle: 'normal' as const,
        color: '#0A2540',
        width: 600,
        height: 48
      },
      subheading: {
        name: 'Subheading Text',
        text: 'This is to officially certify that',
        fontSize: 16,
        fontFamily: 'Playfair Display',
        fontStyle: 'italic' as const,
        fontWeight: 'normal',
        color: '#475569',
        width: 500,
        height: 36
      },
      body: {
        name: 'Description Paragraph',
        text: 'has successfully completed the curriculum and fulfilled all sovereign academic requirements.',
        fontSize: 14,
        fontFamily: 'Plus Jakarta Sans',
        fontStyle: 'normal' as const,
        color: '#334155',
        width: 650,
        height: 50
      },
      calligraphy: {
        name: 'Signature Calligraphy',
        text: 'Prof. Arthur Pendelton',
        fontSize: 26,
        fontFamily: 'Alex Brush',
        fontStyle: 'normal' as const,
        color: '#0A2540',
        width: 280,
        height: 45
      }
    }[preset];

    const newEl: StudioElement = {
      id: `el-text-${Date.now().toString().slice(-4)}`,
      name: textConfig.name,
      type: 'text',
      x: Math.round((schema.page.width - textConfig.width) / 2),
      y: 200,
      textAlign: 'center',
      zIndex: schema.elements.length + 1,
      ...textConfig
    };

    onAddElement(newEl);
    onSelectElement(newEl.id);
  };

  // Helper for dynamic fields
  const handleInsertDynamicField = (
    fieldKey: DynamicFieldKey, 
    label: string, 
    defaultSize: number = 18, 
    defaultFont: string = 'Plus Jakarta Sans',
    defaultColor: string = '#0A2540'
  ) => {
    const newEl: StudioElement = {
      id: `el-${fieldKey}-${Date.now().toString().slice(-4)}`,
      name: label,
      type: 'dynamic-field',
      fieldKey,
      fallbackText: label,
      x: Math.round((schema.page.width - 340) / 2),
      y: 260,
      width: 340,
      height: defaultSize + 20,
      fontFamily: defaultFont,
      fontSize: defaultSize,
      fontWeight: '600',
      color: defaultColor,
      textAlign: 'center',
      zIndex: schema.elements.length + 1
    };

    onAddElement(newEl);
    onSelectElement(newEl.id);
  };

  // Helper for shapes and certificate graphics
  const handleInsertShape = (
    shapeType: 
      | 'rectangle' 
      | 'circle' 
      | 'rounded-box' 
      | 'badge-pill' 
      | 'line' 
      | 'gold-line' 
      | 'thick-bar' 
      | 'dashed-line' 
      | 'frame-border' 
      | 'frame-gold' 
      | 'frame-inset'
      | 'security-stamp'
  ) => {
    let width = 200;
    let height = 100;
    let strokeWidth = 2;
    let fill = '#F8FAFC';
    let stroke = '#0A2540';
    let borderRadius = 0;
    let strokeStyle: 'solid' | 'dashed' | 'dotted' = 'solid';
    let name = 'Shape Element';

    if (shapeType === 'frame-border') {
      name = 'Classical Outer Border Frame';
      width = schema.page.width - 60;
      height = schema.page.height - 60;
      fill = 'transparent';
      stroke = '#0A2540';
      strokeWidth = 3;
    } else if (shapeType === 'frame-gold') {
      name = 'Gold Guilloche Inset Border';
      width = schema.page.width - 80;
      height = schema.page.height - 80;
      fill = 'transparent';
      stroke = '#D97706';
      strokeWidth = 2;
    } else if (shapeType === 'frame-inset') {
      name = 'Dual Inset Margin Frame';
      width = schema.page.width - 100;
      height = schema.page.height - 100;
      fill = 'transparent';
      stroke = '#CBD5E1';
      strokeWidth = 1.5;
    } else if (shapeType === 'gold-line') {
      name = 'Gold Diplomatic Line';
      width = 400;
      height = 2;
      fill = '#D97706';
      stroke = '#D97706';
      strokeWidth = 0;
    } else if (shapeType === 'thick-bar') {
      name = 'Royal Navy Divider Bar';
      width = 300;
      height = 4;
      fill = '#0A2540';
      stroke = '#0A2540';
      strokeWidth = 0;
    } else if (shapeType === 'dashed-line') {
      name = 'Dashed Boundary Line';
      width = 350;
      height = 2;
      fill = 'transparent';
      stroke = '#94A3B8';
      strokeWidth = 2;
      strokeStyle = 'dashed';
    } else if (shapeType === 'line') {
      name = 'Thin Divider Line';
      width = 300;
      height = 2;
      fill = '#64748B';
      stroke = '#64748B';
      strokeWidth = 0;
    } else if (shapeType === 'circle') {
      name = 'Circle Emblem Base';
      width = 90;
      height = 90;
      fill = '#F1F5F9';
      stroke = '#0A2540';
      borderRadius = 9999;
    } else if (shapeType === 'rounded-box') {
      name = 'Rounded Container Panel';
      width = 400;
      height = 120;
      fill = '#F8FAFC';
      stroke = '#E2E8F0';
      strokeWidth = 1.5;
      borderRadius = 16;
    } else if (shapeType === 'badge-pill') {
      name = 'Status Badge Pill';
      width = 180;
      height = 36;
      fill = '#EFF6FF';
      stroke = '#93C5FD';
      strokeWidth = 1;
      borderRadius = 9999;
    } else if (shapeType === 'security-stamp') {
      name = 'Security Verification Stamp';
      width = 130;
      height = 130;
      fill = 'transparent';
      stroke = '#0284C7';
      strokeWidth = 2;
      borderRadius = 9999;
      strokeStyle = 'dashed';
    }

    const newEl: StudioElement = {
      id: `el-shape-${Date.now().toString().slice(-4)}`,
      name,
      type: shapeType.startsWith('line') || shapeType === 'gold-line' || shapeType === 'thick-bar' || shapeType === 'dashed-line'
        ? 'line' 
        : shapeType.startsWith('frame') 
          ? 'frame' 
          : 'shape',
      shapeType: shapeType as any,
      x: shapeType.startsWith('frame') ? 30 : Math.round((schema.page.width - width) / 2),
      y: shapeType.startsWith('frame') ? 30 : Math.round((schema.page.height - height) / 2),
      width,
      height,
      fill,
      stroke,
      strokeWidth,
      borderRadius,
      strokeStyle,
      zIndex: shapeType.startsWith('frame') ? 1 : schema.elements.length + 1
    };

    onAddElement(newEl);
    onSelectElement(newEl.id);
  };

  // Helper for signatures
  const handleInsertSignature = () => {
    const newEl: StudioElement = {
      id: `el-sig-${Date.now().toString().slice(-4)}`,
      name: 'Signatory Line',
      type: 'signature',
      signatureType: 'calligraphy',
      signatoryIndex: 0,
      x: 100,
      y: schema.page.height - 150,
      width: 220,
      height: 70,
      zIndex: schema.elements.length + 1
    };

    onAddElement(newEl);
    onSelectElement(newEl.id);
  };

  // Helper for QR code
  const handleInsertQr = () => {
    const newEl: StudioElement = {
      id: `el-qr-${Date.now().toString().slice(-4)}`,
      name: 'Dynamic Verification QR',
      type: 'qr',
      x: 60,
      y: schema.page.height - 160,
      width: 85,
      height: 85,
      zIndex: schema.elements.length + 1
    };

    onAddElement(newEl);
    onSelectElement(newEl.id);
  };

  // Helper for custom image
  const handleInsertImage = (src: string, altName: string = 'Custom Logo') => {
    const newEl: StudioElement = {
      id: `el-img-${Date.now().toString().slice(-4)}`,
      name: altName,
      type: 'image',
      src,
      x: Math.round((schema.page.width - 120) / 2),
      y: 60,
      width: 100,
      height: 100,
      zIndex: schema.elements.length + 1
    };

    onAddElement(newEl);
    onSelectElement(newEl.id);
    setCustomImageUrl('');
  };

  // HTML5 Drag Start payload handler
  const handleDragStart = (e: React.DragEvent, type: ElementType | 'dynamic-field' | 'text-preset', data: any) => {
    e.dataTransfer.setData('application/json', JSON.stringify({ type, data }));
  };

  const DYNAMIC_FIELDS_LIST = [
    { key: 'candidateName' as DynamicFieldKey, label: 'Student Full Name', category: 'Candidate', defaultSize: 26, defaultFont: 'Playfair Display', defaultColor: '#0A2540' },
    { key: 'candidateId' as DynamicFieldKey, label: 'Student ID / Reg No', category: 'Candidate', defaultSize: 13, defaultFont: 'JetBrains Mono', defaultColor: '#475569' },
    { key: 'candidateEmail' as DynamicFieldKey, label: 'Candidate Email', category: 'Candidate', defaultSize: 12, defaultFont: 'Plus Jakarta Sans', defaultColor: '#64748B' },
    { key: 'courseName' as DynamicFieldKey, label: 'Course / Degree Title', category: 'Course', defaultSize: 20, defaultFont: 'Cinzel', defaultColor: '#1877E0' },
    { key: 'courseCode' as DynamicFieldKey, label: 'Course Code', category: 'Course', defaultSize: 13, defaultFont: 'JetBrains Mono', defaultColor: '#475569' },
    { key: 'department' as DynamicFieldKey, label: 'Department / Faculty', category: 'Course', defaultSize: 14, defaultFont: 'Plus Jakarta Sans', defaultColor: '#475569' },
    { key: 'duration' as DynamicFieldKey, label: 'Course Duration', category: 'Course', defaultSize: 13, defaultFont: 'Plus Jakarta Sans', defaultColor: '#64748B' },
    { key: 'certificateNumber' as DynamicFieldKey, label: 'Certificate Serial No', category: 'Certificate', defaultSize: 12, defaultFont: 'JetBrains Mono', defaultColor: '#475569' },
    { key: 'credentialId' as DynamicFieldKey, label: 'Credential ID', category: 'Certificate', defaultSize: 12, defaultFont: 'JetBrains Mono', defaultColor: '#475569' },
    { key: 'issueDate' as DynamicFieldKey, label: 'Date of Issuance', category: 'Certificate', defaultSize: 13, defaultFont: 'Plus Jakarta Sans', defaultColor: '#475569' },
    { key: 'completionDate' as DynamicFieldKey, label: 'Completion Date', category: 'Certificate', defaultSize: 13, defaultFont: 'Plus Jakarta Sans', defaultColor: '#475569' },
    { key: 'score' as DynamicFieldKey, label: 'Final Score (%)', category: 'Certificate', defaultSize: 14, defaultFont: 'Plus Jakarta Sans', defaultColor: '#059669' },
    { key: 'grade' as DynamicFieldKey, label: 'Grade / Honors', category: 'Certificate', defaultSize: 15, defaultFont: 'Plus Jakarta Sans', defaultColor: '#D97706' },
    { key: 'orgName' as DynamicFieldKey, label: 'Issuing Institution', category: 'Authority', defaultSize: 22, defaultFont: 'Cinzel', defaultColor: '#0A2540' },
    { key: 'orgDepartment' as DynamicFieldKey, label: 'Academic Board', category: 'Authority', defaultSize: 14, defaultFont: 'Plus Jakarta Sans', defaultColor: '#475569' },
    { key: 'signatory1Name' as DynamicFieldKey, label: 'Signatory Name', category: 'Authority', defaultSize: 14, defaultFont: 'Alex Brush', defaultColor: '#0A2540' },
    { key: 'signatory1Role' as DynamicFieldKey, label: 'Signatory Title', category: 'Authority', defaultSize: 12, defaultFont: 'Plus Jakarta Sans', defaultColor: '#64748B' },
    { key: 'verificationUrl' as DynamicFieldKey, label: 'Verification URL', category: 'Verification', defaultSize: 11, defaultFont: 'JetBrains Mono', defaultColor: '#1877E0' },
    { key: 'hashDigest' as DynamicFieldKey, label: 'Cryptographic Hash', category: 'Verification', defaultSize: 10, defaultFont: 'JetBrains Mono', defaultColor: '#64748B' }
  ];

  const filteredFields = DYNAMIC_FIELDS_LIST.filter(f => 
    f.label.toLowerCase().includes(searchQuery.toLowerCase()) || 
    f.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
    f.key.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex h-full select-none z-30 shrink-0">
      {/* Left Icon Rail (Canva style tab strip) - ALWAYS VISIBLE */}
      <div className="w-[54px] sm:w-[72px] bg-gradient-to-b from-[#050e20] via-[#0a1f44] to-[#071733] border-r border-[#0e2a5c] flex flex-col items-center py-2 sm:py-3.5 space-y-1 sm:space-y-2 shrink-0 shadow-xs overflow-y-auto scrollbar-none">
        <div className="flex flex-col items-center space-y-1 sm:space-y-2">
          {[
            { id: 'templates', label: 'Layouts', icon: Layout },
            { id: 'text', label: 'Text', icon: Type },
            { id: 'elements', label: 'Elements', icon: Shapes },
            { id: 'fields', label: 'Fields', icon: Database },
            { id: 'uploads', label: 'Uploads', icon: Upload },
            { id: 'background', label: 'Canvas', icon: Palette },
            { id: 'layers', label: 'Layers', icon: Layers }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id && drawerOpen;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabClick(tab.id as SidebarTab)}
                className={`w-11 sm:w-14 py-2 sm:py-2.5 flex flex-col items-center justify-center rounded-xl sm:rounded-2xl transition-all cursor-pointer ${
                  isActive 
                    ? 'bg-[#1877e0] text-white shadow-md' 
                    : 'text-slate-400 hover:text-white hover:bg-white/10'
                }`}
                title={`${tab.label} (Click to open)`}
              >
                <Icon className="w-3.5 sm:w-4 h-3.5 sm:h-4 mb-0.5 sm:mb-1" />
                <span className="text-[9px] sm:text-[10px] font-bold tracking-tight">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* When Drawer is Collapsed -> Show Slim Vertical Strip (Matching Image 1) */}
      {!drawerOpen && (
        <div 
          onClick={() => setDrawerOpen(true)}
          className="w-8 sm:w-10 bg-white border-r border-[#e5ebf4] flex flex-col items-center py-3 sm:py-4 hover:bg-sky-50 text-slate-500 hover:text-[#1877e0] cursor-pointer transition-all shadow-xs shrink-0 select-none group"
          title="Expand Tools Drawer"
        >
          <ChevronRight className="w-3.5 sm:w-4 h-3.5 sm:h-4 mb-2 sm:mb-3 text-slate-400 group-hover:text-[#1877e0] group-hover:translate-x-0.5 transition-transform" />
          <Shapes className="w-3.5 sm:w-4 h-3.5 sm:h-4 mb-2 text-slate-400 group-hover:text-[#1877e0]" />
          <span className="text-[9px] sm:text-[10px] font-mono font-bold tracking-widest uppercase [writing-mode:vertical-lr] text-slate-500 group-hover:text-[#1877e0] mt-1 sm:mt-2">
            DRAWER
          </span>
        </div>
      )}

      {/* Main Drawer Panel - Expands when open */}
      {drawerOpen && (
        <div className="w-[220px] sm:w-[280px] flex-1 flex flex-col h-full overflow-hidden bg-[#fbfcfe] border-r border-[#e5ebf4] animate-fadeIn shadow-xs">
          {/* TAB 1: DYNAMIC DATA FIELDS */}
          {activeTab === 'fields' && (
            <div className="flex-1 flex flex-col p-4 overflow-y-auto space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-bold font-sora text-[#0c1a30] uppercase tracking-wider">
                    <Database className="w-4 h-4 text-[#1877e0]" />
                    <span>Dynamic Data Fields</span>
                  </div>
                  <p className="text-[11px] text-[#66748c] mt-0.5">
                    Click or drag any candidate data token directly onto the canvas.
                  </p>
                </div>
                <button
                  onClick={() => setDrawerOpen(false)}
                  className="p-1.5 bg-slate-100 hover:bg-sky-50 text-slate-500 hover:text-[#1877e0] border border-slate-200 hover:border-sky-300 rounded-xl cursor-pointer transition-all shadow-xs shrink-0"
                  title="Collapse Panel"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
              </div>

              {/* Search Input */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search candidate fields..."
                  className="w-full pl-9 pr-3 py-2 bg-[#f4f7fc] border border-[#e5ebf4] rounded-xl text-xs font-medium focus:bg-white focus:outline-none focus:border-[#2ea6ff] text-[#0c1a30]"
                />
              </div>

              {/* Grouped Field Chips */}
              <div className="space-y-3.5">
                {['Candidate', 'Course', 'Certificate', 'Authority', 'Verification'].map((cat) => {
                  const group = filteredFields.filter(f => f.category === cat);
                  if (group.length === 0) return null;

                  return (
                    <div key={cat} className="space-y-1.5">
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#66748c] block">
                        {cat} Tokens
                      </span>
                      <div className="grid grid-cols-1 gap-2">
                        {group.map((item) => (
                          <div
                            key={item.key}
                            draggable
                            onDragStart={(e) => handleDragStart(e, 'dynamic-field', item)}
                            onClick={() => handleInsertDynamicField(item.key, item.label, item.defaultSize, item.defaultFont, item.defaultColor)}
                            className="p-3 bg-white border border-[#e5ebf4] hover:border-[#2ea6ff] hover:bg-sky-50/40 rounded-2xl flex items-center justify-between group cursor-grab active:cursor-grabbing transition-all shadow-xs"
                            title="Drag to canvas or click to insert"
                          >
                            <div>
                              <div className="font-bold text-[#0c1a30] text-xs">
                                {item.label}
                              </div>
                              <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                                {`{{${item.key}}}`}
                              </div>
                            </div>
                            <button 
                              className="p-1.5 bg-[#f4f7fc] group-hover:bg-[#1877e0] group-hover:text-white text-slate-500 rounded-xl transition-colors cursor-pointer"
                              title="Add to canvas"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB: DEDICATED TEXT & TYPOGRAPHY */}
          {activeTab === 'text' && (
            <div className="flex-1 flex flex-col p-4 overflow-y-auto space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-bold font-sora text-[#0c1a30] uppercase tracking-wider">
                    <Type className="w-4 h-4 text-[#1877e0]" />
                    <span>Text & Typography</span>
                  </div>
                  <p className="text-[11px] text-[#66748c] mt-0.5">
                    Click or drag text boxes and styles onto your certificate.
                  </p>
                </div>
                <button
                  onClick={() => setDrawerOpen(false)}
                  className="p-1.5 bg-slate-100 hover:bg-sky-50 text-slate-500 hover:text-[#1877e0] border border-slate-200 hover:border-sky-300 rounded-xl cursor-pointer transition-all shadow-xs shrink-0"
                  title="Collapse Panel"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
              </div>

              {/* Primary "Add a Text Box" Action */}
              <button
                onClick={() => handleInsertText('custom')}
                className="w-full py-3 px-4 bg-gradient-to-r from-[#0284C7] to-[#0369A1] hover:brightness-110 text-white font-bold text-xs rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add a Text Box</span>
              </button>

              {/* Typography Presets */}
              <div className="space-y-1.5 pt-1">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#66748c] block">
                  Default Text Styles
                </span>
                <div className="grid grid-cols-1 gap-2">
                  {[
                    { id: 'heading', title: 'Add a Heading', sub: 'Cinzel Diplomatic Display', style: 'font-serif font-black tracking-wide text-sm' },
                    { id: 'subheading', title: 'Add a Subheading', sub: 'Playfair Display Italic', style: 'font-serif italic text-xs' },
                    { id: 'body', title: 'Add Body Text', sub: 'Plus Jakarta Sans Paragraph', style: 'text-xs text-slate-600' },
                    { id: 'calligraphy', title: 'Add Signature / Cursive', sub: 'Alex Brush Cursive', style: 'text-sm italic font-serif' }
                  ].map(item => (
                    <div
                      key={item.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, 'text-preset', { preset: item.id })}
                      onClick={() => handleInsertText(item.id as any)}
                      className="p-3 bg-white border border-[#e5ebf4] hover:border-[#2ea6ff] hover:bg-sky-50/30 rounded-2xl flex items-center justify-between group cursor-grab active:cursor-grabbing transition-all shadow-xs"
                      title="Drag to canvas or click to insert"
                    >
                      <div>
                        <div className={`text-[#0c1a30] ${item.style}`}>{item.title}</div>
                        <div className="text-[10px] text-slate-400 font-mono mt-0.5">{item.sub}</div>
                      </div>
                      <Plus className="w-4 h-4 text-slate-400 group-hover:text-[#1877e0]" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: ELEMENTS & GRAPHICS & SHAPES (NO TEXT DUPLICATION) */}
          {activeTab === 'elements' && (
            <div className="flex-1 flex flex-col p-4 overflow-y-auto space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-bold font-sora text-[#0c1a30] uppercase tracking-wider">
                    <Shapes className="w-4 h-4 text-[#1877e0]" />
                    <span>Certificate Elements</span>
                  </div>
                  <p className="text-[11px] text-[#66748c] mt-0.5">
                    Click or drag shapes, borders, lines, seals, and security stamps.
                  </p>
                </div>
                <button
                  onClick={() => setDrawerOpen(false)}
                  className="p-1.5 bg-slate-100 hover:bg-sky-50 text-slate-500 hover:text-[#1877e0] border border-slate-200 hover:border-sky-300 rounded-xl cursor-pointer transition-all shadow-xs shrink-0"
                  title="Collapse Panel"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
              </div>

              {/* 1. Geometric Shapes & Panels */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#66748c] block">
                  Geometric Shapes & Panels
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <div
                    draggable
                    onDragStart={(e) => handleDragStart(e, 'shape', { shapeType: 'rectangle' })}
                    onClick={() => handleInsertShape('rectangle')}
                    className="p-3 bg-white border border-[#e5ebf4] hover:border-[#2ea6ff] hover:bg-sky-50/40 rounded-2xl flex flex-col items-center text-center transition-all cursor-grab active:cursor-grabbing shadow-xs group"
                    title="Drag to canvas or click to insert"
                  >
                    <div className="w-10 h-7 bg-slate-100 border border-slate-300 rounded-md mb-1.5 group-hover:border-[#1877e0]" />
                    <span className="text-[11px] font-bold text-[#0c1a30]">Rectangle Panel</span>
                  </div>

                  <div
                    draggable
                    onDragStart={(e) => handleDragStart(e, 'shape', { shapeType: 'circle' })}
                    onClick={() => handleInsertShape('circle')}
                    className="p-3 bg-white border border-[#e5ebf4] hover:border-[#2ea6ff] hover:bg-sky-50/40 rounded-2xl flex flex-col items-center text-center transition-all cursor-grab active:cursor-grabbing shadow-xs group"
                    title="Drag to canvas or click to insert"
                  >
                    <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-300 mb-1.5 group-hover:border-[#1877e0]" />
                    <span className="text-[11px] font-bold text-[#0c1a30]">Circle Emblem</span>
                  </div>

                  <div
                    draggable
                    onDragStart={(e) => handleDragStart(e, 'shape', { shapeType: 'rounded-box' })}
                    onClick={() => handleInsertShape('rounded-box')}
                    className="p-3 bg-white border border-[#e5ebf4] hover:border-[#2ea6ff] hover:bg-sky-50/40 rounded-2xl flex flex-col items-center text-center transition-all cursor-grab active:cursor-grabbing shadow-xs group"
                    title="Drag to canvas or click to insert"
                  >
                    <div className="w-10 h-6 bg-slate-50 border border-slate-300 rounded-xl mb-1.5 group-hover:border-[#1877e0]" />
                    <span className="text-[11px] font-bold text-[#0c1a30]">Rounded Card</span>
                  </div>

                  <div
                    draggable
                    onDragStart={(e) => handleDragStart(e, 'shape', { shapeType: 'badge-pill' })}
                    onClick={() => handleInsertShape('badge-pill')}
                    className="p-3 bg-white border border-[#e5ebf4] hover:border-[#2ea6ff] hover:bg-sky-50/40 rounded-2xl flex flex-col items-center text-center transition-all cursor-grab active:cursor-grabbing shadow-xs group"
                    title="Drag to canvas or click to insert"
                  >
                    <div className="w-10 h-4 bg-sky-100 border border-sky-300 rounded-full mb-2.5 group-hover:border-[#1877e0]" />
                    <span className="text-[11px] font-bold text-[#0c1a30]">Badge Pill</span>
                  </div>
                </div>
              </div>

              {/* 2. Dividers & Decorative Lines */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#66748c] block">
                  Dividers & Accent Lines
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <div
                    draggable
                    onDragStart={(e) => handleDragStart(e, 'shape', { shapeType: 'gold-line' })}
                    onClick={() => handleInsertShape('gold-line')}
                    className="p-2.5 bg-white border border-[#e5ebf4] hover:border-[#2ea6ff] hover:bg-sky-50/40 rounded-2xl flex flex-col items-center text-center transition-all cursor-grab active:cursor-grabbing shadow-xs"
                    title="Drag to canvas or click to insert"
                  >
                    <div className="w-full h-1 bg-amber-500 rounded-full my-3" />
                    <span className="text-[10px] font-bold text-[#0c1a30]">Gold Diplomatic Line</span>
                  </div>

                  <div
                    draggable
                    onDragStart={(e) => handleDragStart(e, 'shape', { shapeType: 'thick-bar' })}
                    onClick={() => handleInsertShape('thick-bar')}
                    className="p-2.5 bg-white border border-[#e5ebf4] hover:border-[#2ea6ff] hover:bg-sky-50/40 rounded-2xl flex flex-col items-center text-center transition-all cursor-grab active:cursor-grabbing shadow-xs"
                    title="Drag to canvas or click to insert"
                  >
                    <div className="w-full h-1.5 bg-[#0A2540] rounded-full my-2.5" />
                    <span className="text-[10px] font-bold text-[#0c1a30]">Royal Navy Bar</span>
                  </div>

                  <div
                    draggable
                    onDragStart={(e) => handleDragStart(e, 'shape', { shapeType: 'line' })}
                    onClick={() => handleInsertShape('line')}
                    className="p-2.5 bg-white border border-[#e5ebf4] hover:border-[#2ea6ff] hover:bg-sky-50/40 rounded-2xl flex flex-col items-center text-center transition-all cursor-grab active:cursor-grabbing shadow-xs"
                    title="Drag to canvas or click to insert"
                  >
                    <div className="w-full h-0.5 bg-slate-400 my-3" />
                    <span className="text-[10px] font-bold text-[#0c1a30]">Thin Slate Line</span>
                  </div>

                  <div
                    draggable
                    onDragStart={(e) => handleDragStart(e, 'shape', { shapeType: 'dashed-line' })}
                    onClick={() => handleInsertShape('dashed-line')}
                    className="p-2.5 bg-white border border-[#e5ebf4] hover:border-[#2ea6ff] hover:bg-sky-50/40 rounded-2xl flex flex-col items-center text-center transition-all cursor-grab active:cursor-grabbing shadow-xs"
                    title="Drag to canvas or click to insert"
                  >
                    <div className="w-full h-0.5 border-b border-dashed border-slate-400 my-3" />
                    <span className="text-[10px] font-bold text-[#0c1a30]">Dashed Boundary</span>
                  </div>
                </div>
              </div>

              {/* 3. Certificate Borders & Frames */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#66748c] block">
                  Certificate Borders & Frames
                </span>
                <div className="grid grid-cols-3 gap-2">
                  <div
                    draggable
                    onDragStart={(e) => handleDragStart(e, 'shape', { shapeType: 'frame-border' })}
                    onClick={() => handleInsertShape('frame-border')}
                    className="p-2.5 bg-white border border-[#e5ebf4] hover:border-[#2ea6ff] rounded-2xl flex flex-col items-center text-center transition-all cursor-grab active:cursor-grabbing shadow-xs"
                    title="Drag to canvas or click to insert"
                  >
                    <div className="w-8 h-6 border-2 border-slate-900 rounded-xs mb-1.5" />
                    <span className="text-[10px] font-bold text-[#0c1a30]">Outer Frame</span>
                  </div>

                  <div
                    draggable
                    onDragStart={(e) => handleDragStart(e, 'shape', { shapeType: 'frame-gold' })}
                    onClick={() => handleInsertShape('frame-gold')}
                    className="p-2.5 bg-white border border-[#e5ebf4] hover:border-[#2ea6ff] rounded-2xl flex flex-col items-center text-center transition-all cursor-grab active:cursor-grabbing shadow-xs"
                    title="Drag to canvas or click to insert"
                  >
                    <div className="w-8 h-6 border-2 border-amber-500 rounded-xs mb-1.5" />
                    <span className="text-[10px] font-bold text-[#0c1a30]">Gold Inset</span>
                  </div>

                  <div
                    draggable
                    onDragStart={(e) => handleDragStart(e, 'shape', { shapeType: 'frame-inset' })}
                    onClick={() => handleInsertShape('frame-inset')}
                    className="p-2.5 bg-white border border-[#e5ebf4] hover:border-[#2ea6ff] rounded-2xl flex flex-col items-center text-center transition-all cursor-grab active:cursor-grabbing shadow-xs"
                    title="Drag to canvas or click to insert"
                  >
                    <div className="w-8 h-6 border border-slate-300 rounded-xs mb-1.5" />
                    <span className="text-[10px] font-bold text-[#0c1a30]">Dual Margin</span>
                  </div>
                </div>
              </div>

              {/* 4. Signatures & Security Stamps */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#66748c] block">
                  Signatures & Verification
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <div
                    draggable
                    onDragStart={(e) => handleDragStart(e, 'signature', {})}
                    onClick={handleInsertSignature}
                    className="p-2.5 bg-white border border-[#e5ebf4] hover:border-[#2ea6ff] hover:bg-sky-50/40 rounded-2xl flex flex-col items-center text-center transition-all cursor-grab active:cursor-grabbing shadow-xs"
                    title="Drag to canvas or click to insert"
                  >
                    <FileSignature className="w-5 h-5 text-slate-700 mb-1" />
                    <span className="text-[10px] font-bold text-[#0c1a30]">Signatory Line</span>
                  </div>

                  <div
                    draggable
                    onDragStart={(e) => handleDragStart(e, 'shape', { shapeType: 'security-stamp' })}
                    onClick={() => handleInsertShape('security-stamp')}
                    className="p-2.5 bg-white border border-[#e5ebf4] hover:border-[#2ea6ff] hover:bg-sky-50/40 rounded-2xl flex flex-col items-center text-center transition-all cursor-grab active:cursor-grabbing shadow-xs"
                    title="Drag to canvas or click to insert"
                  >
                    <ShieldCheck className="w-5 h-5 text-[#0284C7] mb-1" />
                    <span className="text-[10px] font-bold text-[#0c1a30]">Security Stamp</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: PRE-BUILT TEMPLATES & LAYOUTS */}
          {activeTab === 'templates' && (
            <div className="flex-1 flex flex-col p-4 overflow-y-auto space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-bold font-sora text-[#0c1a30] uppercase tracking-wider">
                    <Layout className="w-4 h-4 text-[#1877e0]" />
                    <span>Certificate Layouts</span>
                  </div>
                  <p className="text-[11px] text-[#66748c] mt-0.5">
                    Click any layout to apply its verified visual hierarchy and typography.
                  </p>
                </div>
                <button
                  onClick={() => setDrawerOpen(false)}
                  className="p-1.5 bg-slate-100 hover:bg-sky-50 text-slate-500 hover:text-[#1877e0] border border-slate-200 hover:border-sky-300 rounded-xl cursor-pointer transition-all shadow-xs shrink-0"
                  title="Collapse Panel"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 gap-3">
                {PREBUILT_TEMPLATES_CATALOG.map((preset) => (
                  <div
                    key={preset.id}
                    onClick={() => onApplyTemplatePreset(preset.schema)}
                    className="bg-white border border-[#e5ebf4] hover:border-[#2ea6ff] hover:shadow-md transition-all cursor-pointer overflow-hidden group rounded-2xl"
                  >
                    <div className="aspect-[1.414/1] bg-slate-100 relative overflow-hidden flex items-center justify-center p-2">
                      <VectorCertificatePreview 
                        schema={preset.schema} 
                        demoData={DEFAULT_DEMO_DATA}
                        scale={0.24}
                      />
                      <div className="absolute inset-0 bg-[#0a1f44]/0 group-hover:bg-[#0a1f44]/40 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                        <span className="btn-primary-gradient px-3 py-1.5 text-xs font-bold rounded-full shadow-lg text-[#051427]">
                          Apply Layout
                        </span>
                      </div>
                    </div>
                    <div className="p-3 bg-white border-t border-[#e5ebf4]">
                      <div className="font-bold text-[#0c1a30] text-xs">{preset.name}</div>
                      <div className="text-[10px] text-[#66748c] line-clamp-1 mt-0.5">{preset.description}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: UPLOADS & LOGOS */}
          {activeTab === 'uploads' && (
            <div className="flex-1 flex flex-col p-4 overflow-y-auto space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-bold font-sora text-[#0c1a30] uppercase tracking-wider">
                    <Upload className="w-4 h-4 text-[#1877e0]" />
                    <span>Media & Custom Logos</span>
                  </div>
                  <p className="text-[11px] text-[#66748c] mt-0.5">
                    Upload university crests, institution logos, and signatory scans.
                  </p>
                </div>
                <button
                  onClick={() => setDrawerOpen(false)}
                  className="p-1.5 bg-slate-100 hover:bg-sky-50 text-slate-500 hover:text-[#1877e0] border border-slate-200 hover:border-sky-300 rounded-xl cursor-pointer transition-all shadow-xs shrink-0"
                  title="Collapse Panel"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
              </div>

              {/* Direct Image URL input - FIXED STACK LAYOUT */}
              <div className="space-y-2 bg-white p-3.5 border border-[#e5ebf4] rounded-2xl">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#66748c] block">
                  Add Image from URL
                </span>
                <div className="flex flex-col gap-2">
                  <input
                    type="text"
                    placeholder="https://example.com/logo.png"
                    value={customImageUrl}
                    onChange={(e) => setCustomImageUrl(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-[#e5ebf4] rounded-xl focus:outline-none focus:border-[#2ea6ff] bg-[#f8fafc]"
                  />
                  <button
                    onClick={() => handleInsertImage(customImageUrl)}
                    disabled={!customImageUrl}
                    className={`w-full py-2 text-xs font-bold rounded-xl cursor-pointer transition-all ${
                      customImageUrl ? 'btn-primary-gradient text-[#051427]' : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                    }`}
                  >
                    Insert Image
                  </button>
                </div>
              </div>

              {/* Local File Upload */}
              <label className="border-2 border-dashed border-[#e5ebf4] hover:border-[#2ea6ff] bg-white p-5 rounded-2xl flex flex-col items-center justify-center text-center cursor-pointer transition-all group">
                <Upload className="w-6 h-6 text-slate-400 group-hover:text-[#1877e0] mb-2 transition-colors" />
                <span className="text-xs font-bold text-[#0c1a30]">Upload Institution Logo</span>
                <span className="text-[10px] text-slate-400 mt-0.5">PNG, SVG or JPG supported</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = (event) => {
                        if (event.target?.result) {
                          handleInsertImage(event.target.result as string, file.name);
                        }
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                />
              </label>
            </div>
          )}

          {/* TAB 5: CANVAS & BACKGROUND */}
          {activeTab === 'background' && (
            <div className="flex-1 flex flex-col p-4 overflow-y-auto space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-bold font-sora text-[#0c1a30] uppercase tracking-wider">
                    <Palette className="w-4 h-4 text-[#1877e0]" />
                    <span>Canvas Properties</span>
                  </div>
                  <p className="text-[11px] text-[#66748c] mt-0.5">
                    Customize canvas dimensions, background parchment, and textures.
                  </p>
                </div>
                <button
                  onClick={() => setDrawerOpen(false)}
                  className="p-1.5 bg-slate-100 hover:bg-sky-50 text-slate-500 hover:text-[#1877e0] border border-slate-200 hover:border-sky-300 rounded-xl cursor-pointer transition-all shadow-xs shrink-0"
                  title="Collapse Panel"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
              </div>

              {/* Background Color Swatches */}
              <div className="space-y-2">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#66748c] block">
                  Background Palette
                </span>
                <div className="grid grid-cols-6 gap-2">
                  {['#FFFFFF', '#FBF8F3', '#FFFDF5', '#F8FAFC', '#0A2540', '#0F172A', '#1E293B', '#1E1B4B', '#FEF3C7', '#E0F2FE', '#F0FDF4', '#FAF5FF'].map(c => (
                    <button
                      key={c}
                      onClick={() => onUpdateBackground({ ...schema.background, value: c })}
                      className={`w-7 h-7 border rounded-lg cursor-pointer hover:scale-105 transition-transform ${
                        schema.background.value === c ? 'border-[#1877e0] ring-2 ring-[#1877e0]' : 'border-slate-200'
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>

              {/* Parchment Texture */}
              <div className="space-y-2">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#66748c] block">
                  Security Paper Texture
                </span>
                <button
                  onClick={() => onUpdateBackground({
                    ...schema.background,
                    patternType: schema.background.patternType === 'parchment-texture' ? 'none' : 'parchment-texture'
                  })}
                  className={`w-full p-3 border rounded-2xl text-xs font-bold flex items-center justify-between cursor-pointer transition-all ${
                    schema.background.patternType === 'parchment-texture'
                      ? 'bg-amber-50 border-amber-300 text-amber-900 shadow-xs'
                      : 'bg-white border-[#e5ebf4] text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <span>Parchment Security Paper</span>
                  <span className="text-[10px] font-mono bg-white px-2 py-0.5 rounded-full border border-amber-200">
                    {schema.background.patternType === 'parchment-texture' ? 'ACTIVE' : 'OFF'}
                  </span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 6: LAYERS STACK */}
          {activeTab === 'layers' && (
            <div className="flex-1 flex flex-col p-4 overflow-y-auto space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-bold font-sora text-[#0c1a30] uppercase tracking-wider">
                    <Layers className="w-4 h-4 text-[#1877e0]" />
                    <span>Layers ({schema.elements.length})</span>
                  </div>
                  <p className="text-[11px] text-[#66748c] mt-0.5">
                    Manage visual layer hierarchy and visibility toggles.
                  </p>
                </div>
                <button
                  onClick={() => setDrawerOpen(false)}
                  className="p-1.5 bg-slate-100 hover:bg-sky-50 text-slate-500 hover:text-[#1877e0] border border-slate-200 hover:border-sky-300 rounded-xl cursor-pointer transition-all shadow-xs shrink-0"
                  title="Collapse Panel"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-2">
                {[...schema.elements].reverse().map((el) => {
                  const isSelected = selectedElementId === el.id;
                  const isTextLike = el.type === 'text' || el.type === 'dynamic-field';
                  const isVar = el.isVariable || el.type === 'dynamic-field';
                  const varKey = el.customVariableKey || el.fieldKey || el.name || 'var';

                  return (
                    <div
                      key={el.id}
                      onClick={() => onSelectElement(el.id)}
                      className={`p-2.5 border flex flex-col gap-1.5 text-xs cursor-pointer transition-all rounded-xl ${
                        isSelected 
                          ? 'bg-sky-50/80 border-[#0284C7] shadow-xs ring-1 ring-[#0284C7]/20' 
                          : 'bg-white border-[#e5ebf4] hover:bg-slate-50 text-[#0c1a30]'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 min-w-0">
                          <div className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 ${
                            isVar 
                              ? 'bg-sky-100 text-[#0284C7]' 
                              : el.type === 'text'
                              ? 'bg-slate-100 text-slate-600'
                              : 'bg-amber-100 text-amber-700'
                          }`}>
                            {isVar ? (
                              <Braces className="w-3 h-3" />
                            ) : el.type === 'text' ? (
                              <Type className="w-3 h-3" />
                            ) : el.type === 'qr' ? (
                              <QrCode className="w-3 h-3" />
                            ) : el.type === 'seal' ? (
                              <Award className="w-3 h-3" />
                            ) : el.type === 'signature' ? (
                              <FileSignature className="w-3 h-3" />
                            ) : (
                              <Shapes className="w-3 h-3" />
                            )}
                          </div>
                          <span className="truncate max-w-[130px] font-bold text-slate-800 text-[11px]">
                            {el.name || el.type}
                          </span>
                        </div>

                        {/* Action buttons */}
                        <div className="flex items-center gap-1 shrink-0">
                          {/* Variable Toggle Button */}
                          {isTextLike && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                const nextIsVar = !isVar;
                                onUpdateElement({
                                  ...el,
                                  isVariable: nextIsVar,
                                  type: nextIsVar ? 'dynamic-field' : 'text',
                                  customVariableKey: nextIsVar ? (el.customVariableKey || el.fieldKey || el.name || 'custom_field') : undefined,
                                  fallbackText: el.fallbackText || el.text
                                });
                              }}
                              className={`px-1.5 py-0.5 rounded-md text-[10px] font-mono font-bold transition-colors cursor-pointer ${
                                isVar 
                                  ? 'bg-sky-500 text-white shadow-xs' 
                                  : 'bg-slate-100 hover:bg-sky-100 text-slate-500 hover:text-[#0284C7]'
                              }`}
                              title={isVar ? 'Dynamic Variable (Click to make static text)' : 'Static Text (Click to make dynamic variable)'}
                            >
                              {isVar ? '{x}' : '+{x}'}
                            </button>
                          )}

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onUpdateElement({ ...el, hidden: !el.hidden });
                            }}
                            className="p-1 hover:bg-slate-100 text-slate-400 rounded-md transition-colors"
                            title={el.hidden ? 'Show layer' : 'Hide layer'}
                          >
                            {el.hidden ? <EyeOff className="w-3.5 h-3.5 text-rose-500" /> : <Eye className="w-3.5 h-3.5" />}
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onUpdateElement({ ...el, locked: !el.locked });
                            }}
                            className="p-1 hover:bg-slate-100 text-slate-400 rounded-md transition-colors cursor-pointer"
                            title={el.locked ? 'Unlock layer' : 'Lock layer'}
                          >
                            {el.locked ? <Lock className="w-3.5 h-3.5 text-amber-600" /> : <Unlock className="w-3.5 h-3.5" />}
                          </button>

                          {(el.type === 'seal' || el.type === 'qr') ? (
                            <span
                              className="p-1 text-[#0284C7] bg-sky-50 rounded-md border border-sky-200"
                              title={`iCertiX Sovereign Verification ${el.type === 'seal' ? 'Badge' : 'QR Code'} is mandatory on all certificates and cannot be removed`}
                            >
                              <ShieldCheck className="w-3.5 h-3.5 text-[#0284C7]" />
                            </span>
                          ) : (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onDeleteElement(el.id);
                              }}
                              className="p-1 hover:bg-rose-50 text-slate-400 hover:text-rose-500 rounded-md transition-colors cursor-pointer"
                              title="Delete layer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Sub-pill indicator */}
                      <div className="flex items-center justify-between text-[10px] font-mono">
                        {isVar ? (
                          <span className="px-1.5 py-0.5 bg-sky-100/90 text-[#0284C7] font-bold rounded-md truncate max-w-[200px]">
                            `{`{{${varKey}}}`}`
                          </span>
                        ) : isTextLike ? (
                          <span className="text-slate-400 truncate max-w-[200px]">
                            Constant: "{el.text?.slice(0, 20) || 'empty'}"
                          </span>
                        ) : (
                          <span className="text-slate-400 uppercase text-[9px]">
                            {el.type}
                          </span>
                        )}
                        <span className="text-slate-400 text-[9px]">z-{el.zIndex || 1}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
