import React, { useState } from 'react';
import { 
  X, 
  Send, 
  History, 
  ShieldCheck, 
  Check, 
  GitBranch, 
  AlertCircle,
  FileCheck2,
  Lock
} from 'lucide-react';
import { StudioDesignSchema } from '../../../types/templateStudio';

interface PublishVersionModalProps {
  schema: StudioDesignSchema;
  isOpen: boolean;
  onClose: () => void;
  onConfirmPublish: (versionIncrement: boolean, changelog: string) => void;
}

export const PublishVersionModal: React.FC<PublishVersionModalProps> = ({
  schema,
  isOpen,
  onClose,
  onConfirmPublish
}) => {
  const [changelog, setChangelog] = useState('Updated typography, aligned seal, and verified dynamic field tokens.');
  const [versionAction, setVersionAction] = useState<'publish-current' | 'bump-version'>('publish-current');

  if (!isOpen) return null;

  const currentVersion = schema.version || 1;
  const isAlreadyPublished = schema.status === 'PUBLISHED';

  const handlePublish = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirmPublish(versionAction === 'bump-version' || isAlreadyPublished, changelog);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-fadeIn">
      <div className="bg-white max-w-lg w-full border border-slate-300 shadow-2xl rounded-2xl sm:rounded-3xl overflow-hidden flex flex-col my-auto max-h-[92vh] text-xs">
        {/* Header */}
        <div className="bg-[#0A2540] text-white px-4 sm:px-6 py-3.5 sm:py-4 flex items-center justify-between border-b border-[#0F3559] shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#0284C7] flex items-center justify-center text-white shrink-0">
              <Send className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold font-sora">Publish Template Version</h2>
              <p className="text-[11px] sm:text-xs text-slate-300">Set baseline design for batch certificate issuance</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Form */}
        <form onSubmit={handlePublish} className="p-4 sm:p-6 space-y-4 sm:space-y-5 overflow-y-auto">
          {/* Explanation Banner on Certificate Immutability */}
          <div className="p-3.5 bg-sky-50 border border-sky-200 flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-[#0284C7] shrink-0 mt-0.5" />
            <div className="text-slate-700 space-y-1">
              <div className="font-bold text-[#0A2540] text-xs">
                Cryptographic Template Versioning
              </div>
              <p className="text-[11px] leading-relaxed text-slate-600">
                When you issue certificates, candidates receive credentials permanently linked to this specific template version snapshot. Future design revisions will never distort previously issued certificates.
              </p>
            </div>
          </div>

          {/* Version Selection */}
          <div>
            <label className="block text-slate-700 font-bold uppercase tracking-wider text-[11px] mb-2 font-mono">
              Select Publish Target
            </label>

            <div className="space-y-2">
              <label className={`p-3 border flex items-center gap-3 cursor-pointer transition-all ${
                versionAction === 'publish-current' 
                  ? 'border-[#0284C7] bg-sky-50/70 ring-1 ring-[#0284C7]' 
                  : 'border-slate-200 hover:bg-slate-50'
              }`}>
                <input
                  type="radio"
                  name="versionTarget"
                  checked={versionAction === 'publish-current'}
                  onChange={() => setVersionAction('publish-current')}
                  className="text-[#0284C7]"
                />
                <div className="flex-1">
                  <div className="font-bold text-slate-900 flex items-center justify-between">
                    <span>Publish Version {currentVersion}.0 (Official Baseline)</span>
                    <span className="text-[9px] font-mono bg-emerald-100 text-emerald-800 px-1.5 py-0.5 font-bold uppercase">
                      Recommended
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">
                    Make this design immediately available across Certificate Generation & Registry workflows.
                  </div>
                </div>
              </label>

              <label className={`p-3 border flex items-center gap-3 cursor-pointer transition-all ${
                versionAction === 'bump-version' 
                  ? 'border-[#0284C7] bg-sky-50/70 ring-1 ring-[#0284C7]' 
                  : 'border-slate-200 hover:bg-slate-50'
              }`}>
                <input
                  type="radio"
                  name="versionTarget"
                  checked={versionAction === 'bump-version'}
                  onChange={() => setVersionAction('bump-version')}
                  className="text-[#0284C7]"
                />
                <div className="flex-1">
                  <div className="font-bold text-slate-900">
                    Publish as New Major Release (Version {currentVersion + 1}.0)
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">
                    Fork into a new version while preserving Version {currentVersion}.0 in the archives.
                  </div>
                </div>
              </label>
            </div>
          </div>

          {/* Changelog input */}
          <div>
            <label className="block text-slate-700 font-bold uppercase tracking-wider text-[11px] mb-1 font-mono">
              Version Changelog & Release Notes
            </label>
            <textarea
              rows={3}
              value={changelog}
              onChange={(e) => setChangelog(e.target.value)}
              placeholder="e.g. Updated typography to Cinzel, added gold sovereign crest, verified QR code positioning."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 font-medium text-slate-900 focus:bg-white focus:outline-none focus:border-[#0284C7]"
            />
          </div>

          {/* Actions */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold uppercase tracking-wider text-[11px] transition-colors"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="px-6 py-2.5 bg-[#0284C7] hover:bg-[#0369A1] text-white font-bold uppercase tracking-wider text-xs flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>Publish Template</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
