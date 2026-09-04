import React, { useState } from 'react';
import { 
  Palette, 
  Layout, 
  Type, 
  QrCode, 
  Award, 
  Check, 
  Save, 
  Eye, 
  Sparkles, 
  Sliders, 
  Layers, 
  ShieldCheck,
  CheckCircle2,
  RefreshCw,
  Plus
} from 'lucide-react';
import { Organisation, CertificateTemplate, TemplateTheme } from '../../types';
import { QrCodeSvg, IcertixSeal } from '../../components/common';

interface TemplateDesignerViewProps {
  currentOrg: Organisation;
  templates: CertificateTemplate[];
  onSaveTemplate: (template: CertificateTemplate) => void;
  onUseTemplateForIssuance: (templateId: string) => void;
}

export const TemplateDesignerView: React.FC<TemplateDesignerViewProps> = ({
  currentOrg,
  templates,
  onSaveTemplate,
  onUseTemplateForIssuance
}) => {
  const orgTemplates = templates.filter(t => t.organisationId === currentOrg.id);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(
    orgTemplates[0]?.id || templates[0]?.id || 'TPL-001'
  );

  const currentTemplate = templates.find(t => t.id === selectedTemplateId) || templates[0];

  // Editable Form State
  const [name, setName] = useState(currentTemplate.name);
  const [theme, setTheme] = useState<TemplateTheme>(currentTemplate.theme);
  const [orientation, setOrientation] = useState<'landscape' | 'portrait'>(currentTemplate.orientation);
  const [primaryColor, setPrimaryColor] = useState(currentTemplate.primaryColor);
  const [secondaryColor, setSecondaryColor] = useState(currentTemplate.secondaryColor);
  const [fontFamily, setFontFamily] = useState(currentTemplate.fontFamily);
  const [showQrCode, setShowQrCode] = useState(currentTemplate.showQrCode);
  const [showScore, setShowScore] = useState(currentTemplate.showScore);
  const [showGrade, setShowGrade] = useState(currentTemplate.showGrade);
  const [showSignatures, setShowSignatures] = useState(currentTemplate.showSignatures);
  const [showBadge, setShowBadge] = useState(currentTemplate.showBadge);
  const [customHeading, setCustomHeading] = useState(currentTemplate.customHeading || currentOrg.name);
  const [customSubtitle, setCustomSubtitle] = useState(
    currentTemplate.customSubtitle || 'This is to officially certify that the candidate has successfully completed'
  );
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Sync state when selected template changes
  const handleSelectTemplate = (tpl: CertificateTemplate) => {
    setSelectedTemplateId(tpl.id);
    setName(tpl.name);
    setTheme(tpl.theme);
    setOrientation(tpl.orientation);
    setPrimaryColor(tpl.primaryColor);
    setSecondaryColor(tpl.secondaryColor);
    setFontFamily(tpl.fontFamily);
    setShowQrCode(tpl.showQrCode);
    setShowScore(tpl.showScore);
    setShowGrade(tpl.showGrade);
    setShowSignatures(tpl.showSignatures);
    setShowBadge(tpl.showBadge);
    setCustomHeading(tpl.customHeading || currentOrg.name);
    setCustomSubtitle(tpl.customSubtitle || 'This is to officially certify that');
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: CertificateTemplate = {
      ...currentTemplate,
      name,
      theme,
      orientation,
      primaryColor,
      secondaryColor,
      fontFamily,
      showQrCode,
      showScore,
      showGrade,
      showSignatures,
      showBadge,
      customHeading,
      customSubtitle
    };
    onSaveTemplate(updated);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleCreateNewTemplate = () => {
    const newTpl: CertificateTemplate = {
      id: `TPL-${Date.now().toString().slice(-4)}`,
      organisationId: currentOrg.id,
      name: `Custom Template #${templates.length + 1}`,
      theme: 'modern-minimal',
      orientation: 'landscape',
      primaryColor: '#18181B',
      secondaryColor: '#2563EB',
      fontFamily: 'Sora',
      showQrCode: true,
      showScore: true,
      showGrade: true,
      showSignatures: true,
      showBadge: true,
      customHeading: currentOrg.name,
      customSubtitle: 'By virtue of sovereign authority, this certificate is awarded to',
      isDefault: false
    };
    onSaveTemplate(newTpl);
    handleSelectTemplate(newTpl);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 border border-[#E4E4E7] shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <Palette className="w-5 h-5 text-blue-600" />
            <h1 className="text-lg sm:text-xl font-bold font-sora tracking-tight text-zinc-900">
              Certificate Template Studio
            </h1>
          </div>
          <p className="text-xs text-zinc-500 mt-1">
            WYSIWYG visual designer with dynamic field bindings, custom seal styles, and dynamic QR embedding.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCreateNewTemplate}
            className="px-3.5 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 text-xs font-bold uppercase tracking-wider border border-zinc-300 flex items-center gap-1.5 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>New Template</span>
          </button>
          <button
            onClick={() => onUseTemplateForIssuance(currentTemplate.id)}
            className="px-4 py-2 bg-[#2563EB] hover:bg-blue-700 text-white text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-xs transition-colors"
          >
            <Award className="w-4 h-4" />
            <span>Use in Issuance Batch</span>
          </button>
        </div>
      </div>

      {/* Main Studio Split Layout: Controls on Left, WYSIWYG Live Canvas on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Template Selection & Properties (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Template Selector Cards */}
          <div className="bg-white p-4 border border-[#E4E4E7] shadow-xs space-y-2">
            <label className="text-[11px] font-mono font-bold uppercase tracking-wider text-zinc-500 block">
              Active Templates for {currentOrg.name}
            </label>
            <div className="grid grid-cols-2 gap-2">
              {orgTemplates.map((t) => (
                <button
                  key={t.id}
                  onClick={() => handleSelectTemplate(t)}
                  className={`p-2.5 text-left border transition-all text-xs ${
                    t.id === selectedTemplateId
                      ? 'border-blue-600 bg-blue-50/50 shadow-xs'
                      : 'border-zinc-200 hover:border-zinc-300 bg-zinc-50/50'
                  }`}
                >
                  <div className="font-bold text-zinc-900 truncate">{t.name}</div>
                  <div className="text-[10px] text-zinc-500 font-mono mt-0.5 uppercase">{t.theme}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Configuration Form */}
          <form onSubmit={handleSave} className="bg-white p-5 border border-[#E4E4E7] shadow-xs space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
              <span className="font-sora font-bold text-zinc-900 text-sm">
                Design Configuration
              </span>
              <button
                type="submit"
                className="px-3 py-1.5 bg-[#18181B] hover:bg-black text-white font-bold uppercase tracking-wider text-[11px] flex items-center gap-1.5 transition-colors"
              >
                {savedSuccess ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Save className="w-3.5 h-3.5" />}
                <span>{savedSuccess ? 'Saved!' : 'Save Template'}</span>
              </button>
            </div>

            {/* Template Name */}
            <div>
              <label className="block text-zinc-700 font-semibold mb-1">Template Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-2 bg-zinc-50 border border-zinc-300 text-zinc-900 focus:bg-white focus:outline-none focus:border-blue-600"
              />
            </div>

            {/* Visual Archetype / Theme */}
            <div>
              <label className="block text-zinc-700 font-semibold mb-1">Style Archetype Preset</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'modern-minimal', label: 'Minimalist' },
                  { id: 'classic-diploma', label: 'Diploma' },
                  { id: 'tech-gold', label: 'Tech Gold' },
                  { id: 'emerald-crest', label: 'Emerald Crest' },
                  { id: 'executive-navy', label: 'Navy Elite' }
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setTheme(item.id as TemplateTheme)}
                    className={`p-2 border text-center font-semibold transition-all ${
                      theme === item.id 
                        ? 'border-blue-600 bg-blue-600 text-white shadow-xs' 
                        : 'border-zinc-200 bg-zinc-50 text-zinc-700 hover:bg-zinc-100'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Primary & Secondary Color Palettes */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-zinc-700 font-semibold mb-1">Primary Border</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="w-8 h-8 p-0 border border-zinc-300 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="w-full p-1.5 font-mono text-[11px] bg-zinc-50 border border-zinc-300"
                  />
                </div>
              </div>

              <div>
                <label className="block text-zinc-700 font-semibold mb-1">Accent Accent</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={secondaryColor}
                    onChange={(e) => setSecondaryColor(e.target.value)}
                    className="w-8 h-8 p-0 border border-zinc-300 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={secondaryColor}
                    onChange={(e) => setSecondaryColor(e.target.value)}
                    className="w-full p-1.5 font-mono text-[11px] bg-zinc-50 border border-zinc-300"
                  />
                </div>
              </div>
            </div>

            {/* Typography Font */}
            <div>
              <label className="block text-zinc-700 font-semibold mb-1">Typography Pairing</label>
              <select
                value={fontFamily}
                onChange={(e) => setFontFamily(e.target.value)}
                className="w-full p-2 bg-zinc-50 border border-zinc-300 text-zinc-900 font-semibold"
              >
                <option value="Sora">Sora (Modern Clean Geometric)</option>
                <option value="Georgia">Georgia (Classic Academic Serif)</option>
                <option value="JetBrains Mono">JetBrains Mono (Technical / Engineering)</option>
                <option value="Plus Jakarta Sans">Plus Jakarta Sans (SaaS Refined)</option>
              </select>
            </div>

            {/* Custom Text Fields */}
            <div className="space-y-2">
              <div>
                <label className="block text-zinc-700 font-semibold mb-1">Custom Header Authority</label>
                <input
                  type="text"
                  value={customHeading}
                  onChange={(e) => setCustomHeading(e.target.value)}
                  className="w-full p-2 bg-zinc-50 border border-zinc-300 text-zinc-900"
                  placeholder="e.g. Stanford University"
                />
              </div>

              <div>
                <label className="block text-zinc-700 font-semibold mb-1">Preamble Subtitle</label>
                <textarea
                  rows={2}
                  value={customSubtitle}
                  onChange={(e) => setCustomSubtitle(e.target.value)}
                  className="w-full p-2 bg-zinc-50 border border-zinc-300 text-zinc-900"
                  placeholder="e.g. This is to officially certify that..."
                />
              </div>
            </div>

            {/* Toggleable Elements Checklist */}
            <div className="pt-2 border-t border-zinc-100 space-y-2">
              <label className="block font-bold text-zinc-900 uppercase tracking-wider text-[10px] font-mono">
                Visible Credential Elements
              </label>

              <div className="grid grid-cols-2 gap-2">
                <label className="flex items-center gap-2 p-2 bg-zinc-50 border border-zinc-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showQrCode}
                    onChange={(e) => setShowQrCode(e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                  <span className="font-semibold text-zinc-800">Dynamic QR Code</span>
                </label>

                <label className="flex items-center gap-2 p-2 bg-zinc-50 border border-zinc-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showBadge}
                    onChange={(e) => setShowBadge(e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                  <span className="font-semibold text-zinc-800">Gold/Steel Seal</span>
                </label>

                <label className="flex items-center gap-2 p-2 bg-zinc-50 border border-zinc-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showSignatures}
                    onChange={(e) => setShowSignatures(e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                  <span className="font-semibold text-zinc-800">Signatories</span>
                </label>

                <label className="flex items-center gap-2 p-2 bg-zinc-50 border border-zinc-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showGrade}
                    onChange={(e) => setShowGrade(e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                  <span className="font-semibold text-zinc-800">Distinction / Grade</span>
                </label>
              </div>
            </div>

            {/* Dynamic Tokens Guide */}
            <div className="p-3 bg-zinc-50 border border-zinc-200 text-[10px] font-mono text-zinc-600 space-y-1">
              <span className="font-bold text-zinc-800 block">Dynamic Bound Tokens:</span>
              <div className="flex flex-wrap gap-1.5">
                <span className="bg-white px-1.5 py-0.5 border border-zinc-300">{"{{candidate.name}}"}</span>
                <span className="bg-white px-1.5 py-0.5 border border-zinc-300">{"{{course.name}}"}</span>
                <span className="bg-white px-1.5 py-0.5 border border-zinc-300">{"{{credential.id}}"}</span>
                <span className="bg-white px-1.5 py-0.5 border border-zinc-300">{"{{issueDate}}"}</span>
              </div>
            </div>
          </form>
        </div>

        {/* Right Column: Live WYSIWYG Certificate Canvas Preview (7 cols) */}
        <div className="lg:col-span-7 space-y-3">
          <div className="flex items-center justify-between bg-white p-3 border border-[#E4E4E7]">
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-blue-600" />
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-800 font-mono">
                Live WYSIWYG Certificate Render
              </span>
            </div>
            <span className="text-[11px] text-zinc-500 font-mono">
              Auto-updating preview • High-DPI Vector
            </span>
          </div>

          {/* The Parchment / Canvas Box */}
          <div className="bg-[#E4E4E7]/40 p-4 sm:p-6 border border-[#E4E4E7] shadow-inner overflow-hidden">
            <div 
              className="bg-white p-6 sm:p-8 text-center relative shadow-lg mx-auto transition-all"
              style={{
                borderColor: primaryColor,
                borderWidth: theme === 'classic-diploma' ? '4px' : '2px',
                borderStyle: 'solid',
                fontFamily: fontFamily === 'Georgia' ? 'Georgia, serif' : fontFamily === 'JetBrains Mono' ? 'monospace' : 'sans-serif',
                maxWidth: '700px'
              }}
            >
              {/* Inner Decorative Border */}
              <div 
                className="p-6 border relative"
                style={{ borderColor: `${primaryColor}25` }}
              >
                {/* Background Watermark Shield */}
                <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none">
                  <ShieldCheck className="w-72 h-72 text-zinc-900" />
                </div>

                {/* Top Authority Header */}
                <div className="space-y-1 mb-5">
                  {showBadge && (
                    <div 
                      className="w-12 h-12 mx-auto flex items-center justify-center font-bold text-sm shadow-xs border"
                      style={{ 
                        backgroundColor: primaryColor, 
                        color: secondaryColor,
                        borderColor: secondaryColor 
                      }}
                    >
                      {currentOrg.logo}
                    </div>
                  )}

                  <h2 
                    className="text-lg sm:text-xl font-bold tracking-tight uppercase mt-2"
                    style={{ color: primaryColor }}
                  >
                    {customHeading || currentOrg.name}
                  </h2>

                  <div className="text-[10px] uppercase tracking-widest font-mono font-bold text-zinc-500">
                    {currentOrg.department} • {currentOrg.domain}
                  </div>
                </div>

                {/* Preamble */}
                <div className="text-xs text-zinc-600 max-w-md mx-auto my-3 leading-relaxed">
                  {customSubtitle}
                </div>

                {/* Candidate Name */}
                <div 
                  className="text-xl sm:text-2xl font-bold my-2 py-1 inline-block px-4 border-b-2"
                  style={{ color: primaryColor, borderColor: secondaryColor }}
                >
                  Candidate Full Name
                </div>

                <div className="text-[11px] font-mono text-zinc-500 my-1">
                  Candidate Verification ID: CAND-SU-2026-0891
                </div>

                {/* Conferred Title & Course */}
                <div className="text-xs text-zinc-600 my-3">
                  has satisfactorily completed all academic standards and is conferred this credential for
                </div>

                <div 
                  className="text-sm sm:text-base font-bold my-2 px-4 py-1.5 inline-block border"
                  style={{ 
                    color: secondaryColor, 
                    backgroundColor: `${secondaryColor}10`,
                    borderColor: `${secondaryColor}40`
                  }}
                >
                  Executive Artificial Intelligence Strategy & Architecture
                </div>

                {showGrade && (
                  <div 
                    className="text-xs font-bold italic mt-1"
                    style={{ color: secondaryColor }}
                  >
                    Awarded with High Distinction (GPA: 4.0 / 4.0)
                  </div>
                )}

                {/* Bottom Row: Signatures + Seal + Dynamic QR */}
                <div className="mt-8 pt-4 border-t border-zinc-200 grid grid-cols-3 items-end gap-3 text-left">
                  {/* Left: Signatures */}
                  <div>
                    {showSignatures ? (
                      <div className="space-y-1">
                        <div className="font-serif italic text-xs text-zinc-900 border-b border-zinc-300 pb-0.5">
                          {currentOrg.signatories[0]?.name || 'Dr. Jennifer Widom'}
                        </div>
                        <div className="text-[9px] font-bold text-zinc-800 uppercase">
                          {currentOrg.signatories[0]?.role || 'Dean & Registrar'}
                        </div>
                        <div className="text-[8px] font-mono text-zinc-400">
                          Key: {currentOrg.signatories[0]?.keyId || 'HSM-STANFORD-01'}
                        </div>
                      </div>
                    ) : (
                      <div className="text-[9px] font-mono text-zinc-400">Signatures Omitted</div>
                    )}
                  </div>

                  {/* Center: Official iCertiX Seal */}
                  <div className="text-center">
                    {showBadge && (
                      <div className="flex flex-col items-center justify-center">
                        <IcertixSeal size={58} showGlow={true} />
                      </div>
                    )}
                  </div>

                  {/* Right: Dynamic QR */}
                  <div className="flex flex-col items-end text-right space-y-1">
                    {showQrCode ? (
                      <>
                        <div className="p-1 bg-white border border-zinc-300">
                          <QrCodeSvg value="https://icertix.com/verify/ICX-SAMPLE-PREVIEW" size={48} fgColor={primaryColor} />
                        </div>
                        <span className="text-[8px] font-mono font-bold uppercase tracking-wider" style={{ color: secondaryColor }}>
                          Scan to Verify
                        </span>
                      </>
                    ) : (
                      <span className="text-[8px] font-mono text-zinc-400">QR Code Hidden</span>
                    )}
                  </div>
                </div>

                {/* Footer Digest Line */}
                <div className="mt-4 pt-2 border-t border-zinc-100 flex items-center justify-between text-[8px] font-mono text-zinc-400">
                  <span>SHA-256: 0x8f4c2e91a0b3d68471e9823f4b5a6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b</span>
                  <span>Credential ID: ICX-2026-PREVIEW</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
