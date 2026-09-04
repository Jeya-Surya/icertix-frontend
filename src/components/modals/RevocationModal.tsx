import React, { useState } from 'react';
import { 
  AlertTriangle, 
  X, 
  Ban, 
  ShieldAlert, 
  Lock
} from 'lucide-react';
import { Credential } from '../../types';

interface RevocationModalProps {
  credential: Credential | null;
  onClose: () => void;
  onConfirmRevoke: (credId: string, reason: string) => void;
}

export const RevocationModal: React.FC<RevocationModalProps> = ({
  credential,
  onClose,
  onConfirmRevoke
}) => {
  const [reasonCategory, setReasonCategory] = useState('Administrative Correction');
  const [customReason, setCustomReason] = useState('');

  if (!credential) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalReason = customReason.trim() 
      ? `${reasonCategory}: ${customReason.trim()}`
      : reasonCategory;
    onConfirmRevoke(credential.id, finalReason);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-white max-w-lg w-full border border-[#e5ebf4] shadow-2xl rounded-3xl p-6 sm:p-7 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#e5ebf4] pb-3">
          <div className="flex items-center gap-2 text-rose-600">
            <ShieldAlert className="w-5 h-5" />
            <h3 className="font-sora font-bold text-base text-[#0c1a30]">
              Revoke Official Credential
            </h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Warning Box */}
        <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-800 space-y-1">
          <div className="font-bold flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4 text-rose-600" />
            <span>Irreversible Cryptographic Revocation</span>
          </div>
          <p className="leading-relaxed font-jakarta">
            Revoking this credential will update the Certificate Revocation List (CRL). The Public Verifier will immediately report this credential as REVOKED.
          </p>
        </div>

        {/* Target Details */}
        <div className="p-3.5 bg-[#f4f7fc] border border-[#e5ebf4] rounded-2xl text-xs font-mono space-y-1">
          <div className="flex justify-between">
            <span className="text-slate-500">Recipient:</span>
            <span className="font-bold text-[#0c1a30]">{credential.recipient.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Credential ID:</span>
            <span className="font-bold text-[#1877e0]">{credential.credentialId}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Title:</span>
            <span className="text-[#42506a] truncate max-w-xs">{credential.title}</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          <div>
            <label className="block text-[#42506a] font-mono uppercase text-[11px] font-bold mb-1">Reason Category *</label>
            <select
              value={reasonCategory}
              onChange={(e) => setReasonCategory(e.target.value)}
              className="w-full p-2.5 bg-[#f4f7fc] border border-[#e5ebf4] rounded-xl font-semibold text-slate-900 focus:outline-none focus:border-rose-500"
            >
              <option value="Administrative Correction">Administrative Correction / Duplicate Record</option>
              <option value="Academic Standards Non-completion">Academic Standards / Requirements Non-completion</option>
              <option value="Honor Code Violation">Honor Code / Academic Integrity Violation</option>
              <option value="Identity / Registration Discrepancy">Identity or Registration Discrepancy</option>
              <option value="Issued in Error">Issued in Error</option>
            </select>
          </div>

          <div>
            <label className="block text-[#42506a] font-mono uppercase text-[11px] font-bold mb-1">Specific Justification Notes</label>
            <textarea
              rows={2}
              value={customReason}
              onChange={(e) => setCustomReason(e.target.value)}
              placeholder="e.g. Audit identified clerical grade recalculation on record #982."
              className="w-full p-2.5 bg-[#f4f7fc] border border-[#e5ebf4] rounded-xl text-slate-900 focus:outline-none focus:border-rose-500 font-jakarta"
            />
          </div>

          <div className="pt-3 border-t border-[#e5ebf4] flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="btn-pill-ghost px-4 py-2 text-xs font-semibold cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-full font-bold text-xs flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
            >
              <Ban className="w-4 h-4" />
              <span>Confirm Revocation</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
