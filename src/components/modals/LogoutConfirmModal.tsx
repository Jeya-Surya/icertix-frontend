import React from 'react';
import { LogOut, X, AlertTriangle, Shield } from 'lucide-react';
import { AuthUser } from '../../types';

interface LogoutConfirmModalProps {
  isOpen: boolean;
  currentUser: AuthUser | null;
  onConfirm: () => void;
  onCancel: () => void;
}

export const LogoutConfirmModal: React.FC<LogoutConfirmModalProps> = ({
  isOpen,
  currentUser,
  onConfirm,
  onCancel
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-white max-w-md w-full border border-slate-200 shadow-2xl rounded-3xl p-6 space-y-4 animate-scaleUp">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center shrink-0">
              <LogOut className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-sora font-bold text-base text-[#0c1a30]">
                Sign Out Confirmation
              </h3>
              <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                End active session & securely lock workspace
              </p>
            </div>
          </div>
          <button
            onClick={onCancel}
            className="p-1 text-slate-400 hover:text-slate-700 rounded-lg transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Card */}
        {currentUser && (
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#0a1f44] text-[#2ea6ff] font-bold text-xs font-sora flex items-center justify-center shrink-0">
              {currentUser.name ? currentUser.name.slice(0, 2).toUpperCase() : 'US'}
            </div>
            <div className="min-w-0 flex-1 text-xs">
              <div className="font-bold text-[#0c1a30] truncate">{currentUser.name}</div>
              <div className="text-[11px] text-slate-500 font-mono truncate">{currentUser.email}</div>
            </div>
            <span className="px-2 py-0.5 bg-sky-100 text-[#1877e0] font-mono text-[10px] font-bold rounded-full">
              {currentUser.role}
            </span>
          </div>
        )}

        {/* Description Warning */}
        <div className="text-xs text-slate-600 space-y-2 leading-relaxed">
          <p>
            Are you sure you want to sign out of your iCertiX workspace? Any unsaved certificate draft edits will be closed.
          </p>
          <div className="flex items-center gap-2 text-[11px] text-amber-700 bg-amber-50 border border-amber-200 p-2.5 rounded-xl font-mono">
            <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600" />
            <span>You will need your security credentials to sign back in.</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-2 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onCancel}
            className="btn-pill-ghost px-4 py-2 text-xs font-semibold cursor-pointer"
          >
            Stay Signed In
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Yes, Sign Out</span>
          </button>
        </div>
      </div>
    </div>
  );
};
