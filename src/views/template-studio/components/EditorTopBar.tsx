import React from 'react';
import { 
  ArrowLeft, 
  Undo2, 
  Redo2, 
  Eye, 
  Sparkles, 
  Save, 
  Send
} from 'lucide-react';
import { StudioDesignSchema } from '../../../types/templateStudio';

interface EditorTopBarProps {
  schema: StudioDesignSchema;
  onUpdateSchemaName: (name: string) => void;
  onBackToLibrary: () => void;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  previewMode: boolean;
  onTogglePreviewMode: () => void;
  onSaveDraft: () => void;
  onOpenPublishModal: () => void;
  onOpenTestModal: () => void;
  hasUnsavedChanges: boolean;
}

export const EditorTopBar: React.FC<EditorTopBarProps> = ({
  schema,
  onUpdateSchemaName,
  onBackToLibrary,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  previewMode,
  onTogglePreviewMode,
  onSaveDraft,
  onOpenPublishModal,
  onOpenTestModal,
  hasUnsavedChanges
}) => {
  return (
    <div className="h-12 bg-gradient-to-r from-[#050e20] via-[#0a1f44] to-[#0e2a5c] text-white border-b border-[#0e2a5c] px-2 sm:px-4 flex items-center justify-between gap-1.5 sm:gap-3 z-30 select-none shadow-md shrink-0 w-full overflow-hidden">
      {/* Left section: Back button & Template Title */}
      <div className="flex items-center gap-1.5 sm:gap-2.5 min-w-0 shrink">
        <button
          onClick={onBackToLibrary}
          className="h-8 px-2 sm:px-2.5 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors flex items-center gap-1 cursor-pointer text-xs font-bold shrink-0 whitespace-nowrap"
          title="Back to Template Library"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span className="hidden md:inline">Templates</span>
        </button>

        <div className="h-4 w-px bg-white/20 shrink-0 hidden sm:block" />

        {/* Template Title Input */}
        <div className="flex items-center gap-1.5 min-w-0">
          <input
            type="text"
            value={schema.name}
            onChange={(e) => onUpdateSchemaName(e.target.value)}
            className="bg-transparent hover:bg-white/10 focus:bg-white/15 px-1.5 sm:px-2 py-1 text-xs sm:text-sm font-bold font-sora text-white border border-transparent focus:border-[#2ea6ff] rounded-lg w-[85px] xs:w-[110px] sm:w-[150px] md:w-[200px] lg:w-[240px] truncate transition-all outline-none"
            title="Click to edit template title"
          />

          {/* Status & Version Pill */}
          <span className={`px-1.5 py-0.5 text-[9px] font-mono font-bold uppercase tracking-wider rounded-full shrink-0 shadow-xs hidden lg:inline-block ${
            schema.status === 'PUBLISHED'
              ? 'bg-emerald-600 text-white border border-emerald-400/40'
              : 'bg-amber-500 text-slate-950 border border-amber-300'
          }`}>
            v{schema.version}.0 {schema.status}
          </span>
        </div>
      </div>

      {/* Center Section: History (Undo/Redo) & Preview Mode */}
      <div className="flex items-center gap-1 sm:gap-2 shrink-0">
        {/* Undo / Redo */}
        <div className="flex items-center bg-white/10 p-0.5 rounded-full border border-white/15 shrink-0">
          <button
            onClick={onUndo}
            disabled={!canUndo}
            className={`w-6 sm:w-7 h-6 sm:h-7 flex items-center justify-center rounded-full transition-colors ${
              canUndo ? 'text-white hover:bg-white/20 cursor-pointer' : 'text-slate-400 cursor-not-allowed opacity-40'
            }`}
            title="Undo (Ctrl+Z)"
          >
            <Undo2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onRedo}
            disabled={!canRedo}
            className={`w-6 sm:w-7 h-6 sm:h-7 flex items-center justify-center rounded-full transition-colors ${
              canRedo ? 'text-white hover:bg-white/20 cursor-pointer' : 'text-slate-400 cursor-not-allowed opacity-40'
            }`}
            title="Redo (Ctrl+Y)"
          >
            <Redo2 className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Live Preview Toggle */}
        <button
          onClick={onTogglePreviewMode}
          className={`h-8 px-2 sm:px-2.5 text-xs font-bold rounded-full transition-all cursor-pointer flex items-center gap-1.5 border shadow-xs shrink-0 whitespace-nowrap ${
            previewMode
              ? 'bg-[#1877e0] border-sky-400 text-white'
              : 'bg-white/10 border-white/20 text-slate-200 hover:bg-white/20'
          }`}
          title="Toggle between Candidate Demo Data and Template Token keys"
        >
          <span className={`w-2 h-2 rounded-full ${previewMode ? 'bg-emerald-400' : 'bg-slate-400'}`} />
          <Eye className="w-3.5 h-3.5" />
          <span className="hidden lg:inline">{previewMode ? 'Preview Data' : 'Token Mode'}</span>
          <span className="hidden sm:inline lg:hidden">{previewMode ? 'Preview' : 'Tokens'}</span>
        </button>
      </div>

      {/* Right Section: Actions (Test Sample, Save Draft, Publish) */}
      <div className="flex items-center gap-1 sm:gap-2 shrink-0">
        {/* Test Certificate Simulation */}
        <button
          onClick={onOpenTestModal}
          className="h-8 px-2.5 text-xs font-semibold bg-white/10 text-white border border-white/20 hover:bg-white/20 hover:text-white items-center gap-1.5 rounded-full cursor-pointer hidden xl:flex transition-colors shrink-0 whitespace-nowrap"
          title="Generate Realistic Test Certificate"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>Test Sample</span>
        </button>

        {/* Save Draft */}
        <button
          onClick={onSaveDraft}
          className={`h-8 px-2 sm:px-3 text-xs font-bold rounded-full flex items-center gap-1 sm:gap-1.5 transition-all cursor-pointer border shrink-0 whitespace-nowrap ${
            hasUnsavedChanges
              ? 'bg-amber-500 hover:bg-amber-600 text-slate-950 border-amber-400 shadow-md'
              : 'bg-white/10 hover:bg-white/20 text-white border-white/20'
          }`}
          title="Save current changes as draft"
        >
          {hasUnsavedChanges && (
            <span className="w-1.5 h-1.5 rounded-full bg-slate-950 inline-block" />
          )}
          <Save className="w-3.5 h-3.5" />
          <span className="hidden md:inline">Save Draft</span>
          <span className="hidden sm:inline md:hidden">Save</span>
        </button>

        {/* Publish Version */}
        <button
          onClick={onOpenPublishModal}
          className="h-8 btn-primary-gradient px-2.5 sm:px-3.5 text-xs font-bold rounded-full flex items-center gap-1 sm:gap-1.5 shadow-md cursor-pointer text-[#051427] hover:brightness-110 transition-all shrink-0 whitespace-nowrap"
          title="Publish immutable template version"
        >
          <Send className="w-3.5 h-3.5" />
          <span className="hidden xs:inline">Publish</span>
        </button>
      </div>
    </div>
  );
};
