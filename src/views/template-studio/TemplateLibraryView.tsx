import React, { useState, useMemo } from 'react';
import { 
  Plus, 
  Search, 
  Sparkles, 
  Palette, 
  Layers, 
  Layout, 
  Filter, 
  CheckCircle2, 
  Clock, 
  SlidersHorizontal,
  ArrowRight,
  Eye,
  Copy,
  Trash2,
  FileSpreadsheet,
  X
} from 'lucide-react';
import { 
  StudioDesignSchema, 
  TemplateCategory, 
  PageOrientation, 
  PrebuiltTemplatePreset 
} from '../../types/templateStudio';
import { Organisation, CertificateTemplate } from '../../types';
import { 
  PREBUILT_TEMPLATES_CATALOG, 
  DEFAULT_DEMO_DATA, 
  legacyTemplateToDesignSchema 
} from '../../utils/templatePresets';
import { VectorCertificatePreview } from './components/VectorCertificatePreview';
import { CreateBlankModal } from './modals/CreateBlankModal';

interface TemplateLibraryViewProps {
  currentOrg: Organisation;
  templates: CertificateTemplate[];
  savedSchemas: StudioDesignSchema[];
  onOpenEditorWithSchema: (schema: StudioDesignSchema) => void;
  onOpenPreviewModal: (schema: StudioDesignSchema) => void;
  onDeleteSavedSchema?: (schemaId: string) => void;
  onUseForIssuance?: (templateId: string) => void;
}

const CATEGORIES: Array<TemplateCategory | 'All'> = [
  'All',
  'Academic',
  'Course Completion',
  'Training',
  'Professional',
  'Corporate',
  'Achievement',
  'Participation',
  'Internship',
  'Workshop',
  'Appreciation',
  'Cloud & AI',
  'Cybersecurity'
];

export const TemplateLibraryView: React.FC<TemplateLibraryViewProps> = ({
  currentOrg,
  templates,
  savedSchemas,
  onOpenEditorWithSchema,
  onOpenPreviewModal,
  onDeleteSavedSchema,
  onUseForIssuance
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<TemplateCategory | 'All'>('All');
  const [selectedOrientation, setSelectedOrientation] = useState<PageOrientation | 'All'>('All');
  const [isCreateBlankOpen, setIsCreateBlankOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'custom' | 'catalog'>('all');

  // Combine custom schemas for current institution strictly (Isolated & Confidential) + standard presets
  const allLibraryItems = useMemo(() => {
    const seenIds = new Set<string>();

    // 1. My institution's private saved customized templates
    const myCustomItems = (savedSchemas || [])
      .filter(s => {
        if (!s) return false;
        const sOrgId = s.organisationId;
        const isThisOrg = Boolean(sOrgId && sOrgId === currentOrg?.id);
        if (isThisOrg && s.id && !seenIds.has(s.id)) {
          seenIds.add(s.id);
          return true;
        }
        return false;
      })
      .map(s => ({
        id: s.id || `schema-${Math.random()}`,
        schema: s,
        isCustom: true,
        isMyOrg: true,
        organisationName: s.organisationName || currentOrg?.name || 'My Institution',
        name: s.name || 'Untitled Template',
        category: s.category || 'Course Completion',
        orientation: s.page?.orientation || 'landscape',
        pageSize: s.page?.size || 'A4',
        version: s.version || 1,
        status: s.status || 'PUBLISHED'
      }));

    // 2. Base Prebuilt Presets (Sanitized system vector templates)
    const basePresets = PREBUILT_TEMPLATES_CATALOG
      .filter(p => !seenIds.has(p.id))
      .map(p => ({
        id: p.id,
        schema: p.schema,
        isCustom: false,
        isMyOrg: false,
        organisationName: 'iCertiX Vector Library',
        name: p.name || 'Library Template',
        category: p.category || 'Academic',
        orientation: p.schema.page?.orientation || 'landscape',
        pageSize: p.schema.page?.size || 'A4',
        version: p.schema.version || 1,
        status: p.schema.status || 'PUBLISHED'
      }));

    return [...myCustomItems, ...basePresets];
  }, [savedSchemas, currentOrg?.id]);

  // Filter items
  const filteredItems = useMemo(() => {
    return allLibraryItems.filter(item => {
      // Tab filter
      if (activeTab === 'custom' && !item.isCustom) return false;
      if (activeTab === 'catalog' && item.isCustom) return false;

      // Category filter
      if (selectedCategory !== 'All' && item.category !== selectedCategory) {
        return false;
      }

      // Orientation filter
      if (selectedOrientation !== 'All' && item.orientation !== selectedOrientation) {
        return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.trim().toLowerCase();
        const matchesName = (item.name || '').toLowerCase().includes(q);
        const matchesCat = (item.category || '').toLowerCase().includes(q);
        const matchesOrg = (item.organisationName || '').toLowerCase().includes(q);
        return matchesName || matchesCat || matchesOrg;
      }

      return true;
    });
  }, [allLibraryItems, activeTab, selectedCategory, selectedOrientation, searchQuery]);

  const handleDuplicate = (schema: StudioDesignSchema) => {
    const duplicated: StudioDesignSchema = {
      ...schema,
      id: `DSG-${Date.now().toString().slice(-6)}`,
      templateId: `TPL-${Date.now().toString().slice(-4)}`,
      name: `${schema.name} (Copy)`,
      version: 1,
      status: 'DRAFT',
      meta: {
        ...schema.meta,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    };
    onOpenEditorWithSchema(duplicated);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Banner / Studio Header */}
      <div className="icx-card p-6 sm:p-8 rounded-3xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-sky-50 text-[#1877e0] border border-sky-100 flex items-center justify-center shadow-xs">
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold font-sora text-[#0c1a30] tracking-tight">
                Certificate Templates
              </h1>
              <p className="text-xs text-[#66748c] mt-0.5">
                Create a professional certificate using a ready-made design or start from a blank canvas.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsCreateBlankOpen(true)}
            className="btn-primary-gradient px-4 py-2.5 text-xs font-bold flex items-center gap-2 shadow-xs cursor-pointer rounded-full"
          >
            <Plus className="w-4 h-4" />
            <span>Create from Blank</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="icx-card p-4 rounded-2xl space-y-3.5">
        {/* Search input & Tab Toggles */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search templates by title, style..."
              className="w-full pl-10 pr-9 py-2 bg-[#f4f7fc] border border-[#e5ebf4] rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:outline-none focus:border-[#2ea6ff] transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 p-0.5 rounded-full hover:bg-slate-200 cursor-pointer"
                title="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end flex-wrap">
            <div className="flex items-center bg-[#f4f7fc] p-1 rounded-2xl border border-[#e5ebf4] text-xs">
              <button
                onClick={() => setActiveTab('all')}
                className={`px-3 py-1.5 font-bold text-[11px] rounded-xl transition-all cursor-pointer ${
                  activeTab === 'all' ? 'bg-[#0a1f44] text-[#2ea6ff] shadow-xs' : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                }`}
              >
                All Templates ({allLibraryItems.length})
              </button>
              <button
                onClick={() => setActiveTab('custom')}
                className={`px-3 py-1.5 font-bold text-[11px] rounded-xl transition-all cursor-pointer ${
                  activeTab === 'custom' ? 'bg-[#0a1f44] text-[#2ea6ff] shadow-xs' : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                }`}
              >
                {currentOrg.code || currentOrg.name} Private ({allLibraryItems.filter(i => i.isCustom).length})
              </button>
              <button
                onClick={() => setActiveTab('catalog')}
                className={`px-3 py-1.5 font-bold text-[11px] rounded-xl transition-all cursor-pointer ${
                  activeTab === 'catalog' ? 'bg-[#0a1f44] text-[#2ea6ff] shadow-xs' : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                }`}
              >
                Standard Presets ({PREBUILT_TEMPLATES_CATALOG.length})
              </button>
            </div>

            {/* Orientation Filter */}
            <select
              value={selectedOrientation}
              onChange={(e) => setSelectedOrientation(e.target.value as any)}
              className="px-3 py-2 bg-[#f4f7fc] border border-[#e5ebf4] rounded-xl text-xs font-semibold text-slate-700 focus:bg-white focus:outline-none focus:border-[#2ea6ff]"
            >
              <option value="All">All Orientations</option>
              <option value="landscape">Landscape</option>
              <option value="portrait">Portrait</option>
            </select>
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 font-bold text-[11px] whitespace-nowrap transition-all cursor-pointer rounded-full border ${
                selectedCategory === cat
                  ? 'bg-[#0a1f44] text-[#2ea6ff] border-[#0a1f44] shadow-xs'
                  : 'bg-[#f4f7fc] text-slate-600 border-[#e5ebf4] hover:bg-white hover:text-slate-900'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Template Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Create From Blank Hero Card */}
        <div 
          onClick={() => setIsCreateBlankOpen(true)}
          className="icx-card rounded-3xl border-2 border-dashed border-slate-300 hover:border-[#2ea6ff] p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-all hover:shadow-lg min-h-[340px] group"
        >
          <div className="w-14 h-14 rounded-2xl bg-sky-50 group-hover:bg-[#2ea6ff] text-[#1877e0] group-hover:text-[#051427] flex items-center justify-center transition-all mb-3.5 shadow-xs">
            <Plus className="w-7 h-7" />
          </div>
          <h3 className="font-sora font-bold text-[#0c1a30] text-base mb-1">
            Create from Blank Canvas
          </h3>
          <p className="text-xs text-[#66748c] max-w-xs mb-4">
            Start with a fresh parchment. Choose your page size, orientation, and build with dynamic fields & seals.
          </p>
          <span className="btn-primary-gradient px-4 py-2 text-xs font-bold rounded-full shadow-xs">
            Start Blank Canvas
          </span>
        </div>

        {/* Empty Search Result State */}
        {filteredItems.length === 0 && (
          <div className="col-span-1 md:col-span-1 lg:col-span-2 icx-card p-8 rounded-3xl border border-[#e5ebf4] flex flex-col items-center justify-center text-center min-h-[340px]">
            <div className="w-12 h-12 rounded-2xl bg-sky-50 text-[#1877e0] border border-sky-100 flex items-center justify-center mb-3">
              <Search className="w-5 h-5" />
            </div>
            <h4 className="font-sora font-bold text-[#0c1a30] text-sm">No templates matching "{searchQuery}"</h4>
            <p className="text-xs text-[#66748c] mt-1 max-w-sm">
              We couldn't find any designs with that keyword. Try searching another term or clear your search.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('All');
                setSelectedOrientation('All');
                setActiveTab('all');
              }}
              className="mt-4 btn-pill-ghost px-4 py-1.5 text-xs font-bold text-[#1877e0] border-sky-200 hover:bg-sky-50 rounded-full cursor-pointer"
            >
              Reset Search & Filters
            </button>
          </div>
        )}

        {/* Filtered Template Cards */}
        {filteredItems.map((item) => {
          const isLandscape = item.orientation === 'landscape';
          const previewScale = isLandscape ? 0.28 : 0.24;

          return (
            <div
              key={item.id}
              className="icx-card rounded-3xl border border-[#e5ebf4] hover:border-[#2ea6ff]/60 shadow-sm hover:shadow-xl transition-all flex flex-col group overflow-hidden"
            >
              {/* Thumbnail Container */}
              <div 
                onClick={() => onOpenEditorWithSchema(item.schema)}
                className="relative bg-slate-50/80 p-4 flex items-center justify-center cursor-pointer border-b border-[#e5ebf4] overflow-hidden h-52 group-hover:bg-sky-50/40 transition-colors"
              >
                {/* Scaled Preview */}
                <div className="transform scale-90 sm:scale-100 transition-transform group-hover:scale-105 duration-200 pointer-events-none drop-shadow-md">
                  <VectorCertificatePreview
                    schema={item.schema}
                    demoData={DEFAULT_DEMO_DATA}
                    scale={previewScale}
                    previewMode={true}
                  />
                </div>

                {/* Hover Quick Action Overlay */}
                <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2.5 backdrop-blur-2xs">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenEditorWithSchema(item.schema);
                    }}
                    className="btn-primary-gradient px-4 py-2 text-xs font-bold rounded-full flex items-center gap-1.5 shadow-md cursor-pointer transition-transform transform active:scale-95"
                  >
                    <Palette className="w-3.5 h-3.5" />
                    <span>Open Editor</span>
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenPreviewModal(item.schema);
                    }}
                    className="p-2.5 bg-white/90 hover:bg-white text-slate-800 rounded-full shadow-md cursor-pointer transition-all hover:scale-105"
                    title="Fullscreen Preview"
                  >
                    <Eye className="w-4 h-4 text-[#0c1a30]" />
                  </button>
                </div>

                {/* Status & Version Pill */}
                <div className="absolute top-3 right-3 flex items-center gap-1.5">
                  <span className={`px-2.5 py-0.5 text-[10px] font-mono font-bold uppercase rounded-full shadow-xs ${
                    item.status === 'PUBLISHED'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-amber-500 text-white'
                  }`}>
                    v{item.version}.0 {item.status}
                  </span>
                </div>

                {/* Category Badge */}
                <div className="absolute top-3 left-3">
                  <span className="px-2.5 py-0.5 bg-[#0c1a30]/85 text-white text-[10px] font-mono font-bold uppercase rounded-full backdrop-blur-xs">
                    {item.category}
                  </span>
                </div>
              </div>

              {/* Template Card Details */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="font-bold text-[#0c1a30] font-sora text-sm truncate group-hover:text-[#1877e0] transition-colors" title={item.name}>
                      {item.name}
                    </h4>
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-[#66748c] font-mono mt-1">
                    <span className="capitalize">{item.orientation}</span>
                    <span>•</span>
                    <span>{item.pageSize}</span>
                    <span>•</span>
                    <span>{item.schema.elements.length} dynamic elements</span>
                  </div>

                  {item.isCustom && (
                    <div className="mt-2.5 p-2 bg-sky-50/90 border border-sky-100 rounded-xl text-[10px] text-sky-950 flex items-center justify-between gap-1">
                      <span className="font-semibold truncate">
                        Customized & Published by <strong className="text-[#1877e0] font-bold">{item.organisationName}</strong>
                      </span>
                      {item.isMyOrg ? (
                        <span className="px-2 py-0.5 bg-[#1877e0] text-white font-mono text-[9px] font-bold rounded-full shrink-0">
                          {currentOrg.code}
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 bg-slate-200 text-slate-700 font-mono text-[9px] font-bold rounded-full shrink-0">
                          Network
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Action Button Strip */}
                <div className="pt-3 border-t border-[#e5ebf4] flex items-center justify-between gap-2">
                  <button
                    onClick={() => handleDuplicate(item.schema)}
                    className="p-1.5 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-lg text-xs font-medium flex items-center gap-1 transition-colors cursor-pointer"
                    title="Duplicate as new draft"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span className="text-[10px] hidden sm:inline">Duplicate</span>
                  </button>

                  <div className="flex items-center gap-2 ml-auto">
                    <button
                      onClick={() => onOpenPreviewModal(item.schema)}
                      className="btn-pill-ghost px-3 py-1.5 text-xs font-semibold rounded-full border-slate-200 hover:bg-slate-100 cursor-pointer"
                    >
                      Preview
                    </button>
                    {onUseForIssuance && (
                      <button
                        onClick={() => onUseForIssuance(item.schema.templateId || item.schema.id)}
                        className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-full shadow-xs transition-colors flex items-center gap-1 cursor-pointer"
                        title="Select this template and open certificate issuance engine"
                      >
                        <span>Issue</span>
                      </button>
                    )}
                    <button
                      onClick={() => onOpenEditorWithSchema(item.schema)}
                      className="btn-primary-gradient px-4 py-1.5 text-xs font-bold rounded-full text-[#051427] flex items-center gap-1.5 shadow-xs cursor-pointer"
                    >
                      <span>Edit</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Blank Certificate Modal */}
      <CreateBlankModal
        currentOrg={currentOrg}
        isOpen={isCreateBlankOpen}
        onClose={() => setIsCreateBlankOpen(false)}
        onCreate={(schema) => onOpenEditorWithSchema(schema)}
      />
    </div>
  );
};
