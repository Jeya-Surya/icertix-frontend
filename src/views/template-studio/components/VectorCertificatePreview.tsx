import React from 'react';
import { StudioDesignSchema, DemoCandidateData, StudioElement } from '../../../types/templateStudio';
import { QrCodeSvg, IcertixSeal } from '../../../components/common';
import { ShieldCheck, Award, Lock } from 'lucide-react';

interface VectorCertificatePreviewProps {
  schema: StudioDesignSchema;
  demoData?: DemoCandidateData;
  scale?: number;
  previewMode?: boolean; // if true, uses demo data instead of field tokens
  interactive?: boolean;
  selectedElementId?: string | null;
  onSelectElement?: (elementId: string) => void;
  showGrid?: boolean;
  gridSize?: number;
}

export const VectorCertificatePreview: React.FC<VectorCertificatePreviewProps> = ({
  schema,
  demoData,
  scale = 1,
  previewMode = true,
  interactive = false,
  selectedElementId = null,
  onSelectElement,
  showGrid = false,
  gridSize = 20
}) => {
  if (!schema || !schema.page) {
    return <div className="p-6 text-xs text-slate-400 font-mono text-center">Loading template preview...</div>;
  }

  const page = schema.page || { width: 842, height: 595, orientation: 'landscape', size: 'A4' };
  const background = schema.background || { type: 'color', value: '#FFFFFF' };
  const elements = schema.elements || [];
  const width = page.width || 842;
  const height = page.height || 595;

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

    // 2. Normalized clean key match (case-insensitive & stripped spaces/underscores)
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

  // Resolve dynamic field value
  const resolveFieldValue = (el: StudioElement): string => {
    const isVar = el.isVariable || el.type === 'dynamic-field';
    const rawText = el.text || '';

    // If in Design Mode (not previewMode), show {{variableName}} token tag only if it's a dynamic variable
    if (!previewMode) {
      if (isVar) {
        const varKey = (el.customVariableKey || el.fieldKey || el.name || 'variable').trim();
        return `{{${varKey}}}`;
      }
      return rawText;
    }

    // A. Check for explicit template placeholders like {{credits}} or {{candidateName}} inside any text
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

    // C. Pure Static Text -> REMAINS STRICTLY STATIC (Never overwritten by data)
    return rawText;
  };

  // Sort elements by zIndex
  const sortedElements = [...elements].sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0));

  return (
    <div
      className="relative bg-white shadow-2xl transition-all select-none overflow-hidden mx-auto"
      style={{
        width: `${width * scale}px`,
        height: `${height * scale}px`,
        minWidth: `${width * scale}px`,
        minHeight: `${height * scale}px`,
        transformOrigin: 'top left'
      }}
    >
      {/* Inner Scaled Canvas Root Container */}
      <div
        className="absolute inset-0"
        style={{
          width: `${width}px`,
          height: `${height}px`,
          transform: `scale(${scale})`,
          transformOrigin: 'top left',
          backgroundColor: background.value || '#FFFFFF'
        }}
      >
        {/* Background Pattern / Texture Overlay */}
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

        {background.patternType === 'security-mesh' && (
          <div 
            className="absolute inset-0 pointer-events-none opacity-10"
            style={{
              backgroundImage: `repeating-linear-gradient(45deg, #0A2540 0, #0A2540 1px, transparent 0, transparent 15px)`
            }}
          />
        )}

        {/* Optional Studio Grid Overlay */}
        {showGrid && (
          <div
            className="absolute inset-0 pointer-events-none z-30"
            style={{
              backgroundImage: `linear-gradient(to right, rgba(2, 132, 199, 0.15) 1px, transparent 1px), linear-gradient(to bottom, rgba(2, 132, 199, 0.15) 1px, transparent 1px)`,
              backgroundSize: `${gridSize}px ${gridSize}px`
            }}
          />
        )}

        {/* Center Watermark Crest */}
        <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none z-0">
          <ShieldCheck style={{ width: `${Math.min(width, height) * 0.45}px`, height: `${Math.min(width, height) * 0.45}px` }} />
        </div>

        {/* Render Vector Elements */}
        {sortedElements.map((el) => {
          if (el.hidden) return null;

          const isSelected = selectedElementId === el.id;
          const isInteractive = interactive;

          return (
            <div
              key={el.id}
              onClick={(e) => {
                if (isInteractive && onSelectElement) {
                  e.stopPropagation();
                  onSelectElement(el.id);
                }
              }}
              className={`absolute transition-all ${
                isInteractive ? 'cursor-move' : ''
              } ${
                isSelected && isInteractive 
                  ? 'ring-2 ring-[#0284C7] ring-offset-1 z-50' 
                  : ''
              }`}
              style={{
                left: `${el.x}px`,
                top: `${el.y}px`,
                width: `${el.width}px`,
                height: `${el.height}px`,
                transform: el.rotation ? `rotate(${el.rotation}deg)` : undefined,
                opacity: el.opacity !== undefined ? el.opacity / 100 : 1,
                zIndex: el.zIndex || 1,
                pointerEvents: isInteractive ? 'auto' : 'none'
              }}
            >
              {/* Type: Text or Dynamic Field */}
              {(el.type === 'text' || el.type === 'dynamic-field') && (
                <div
                  className="w-full h-full flex flex-col justify-center overflow-hidden"
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
                  <span className="truncate w-full block">
                    {resolveFieldValue(el)}
                  </span>
                </div>
              )}

              {/* Type: Shape */}
              {el.type === 'shape' && (
                <div
                  className="w-full h-full"
                  style={{
                    backgroundColor: el.fill || 'transparent',
                    borderColor: el.stroke || 'transparent',
                    borderWidth: el.strokeWidth !== undefined ? `${el.strokeWidth}px` : undefined,
                    borderStyle: el.strokeStyle || (el.stroke ? 'solid' : 'none'),
                    borderRadius: el.shapeType === 'circle' ? '9999px' : el.borderRadius ? `${el.borderRadius}px` : '0px'
                  }}
                />
              )}

              {/* Type: Line / Divider */}
              {el.type === 'line' && (
                <div
                  className="w-full h-full flex items-center justify-center"
                >
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

              {/* Type: Official Seal */}
              {el.type === 'seal' && (
                <div className="w-full h-full flex items-center justify-center">
                  <IcertixSeal 
                    size={Math.min(el.width, el.height)} 
                    showGlow={false} 
                  />
                </div>
              )}

              {/* Type: Dynamic QR Code */}
              {el.type === 'qr' && (
                <div className="w-full h-full flex flex-col items-center justify-center p-1 bg-white border border-slate-300 shadow-2xs">
                  <QrCodeSvg 
                    value={demoData?.verificationQr || demoData?.verificationUrl || (demoData?.credentialId ? `${window.location.origin}/verify/${demoData.credentialId}` : `${window.location.origin}/verify/ICX-2026-DEMO`)} 
                    size={Math.min(el.width, el.height) - 12}
                    fgColor={el.qrFgColor || '#0A2540'} 
                    bgColor={el.qrBgColor || '#FFFFFF'}
                    level={el.qrLevel || 'M'}
                  />
                  {el.qrShowLabel && (
                    <span 
                      className="text-[7px] font-mono font-bold uppercase tracking-wider text-slate-500 mt-0.5"
                    >
                      Scan to Verify
                    </span>
                  )}
                </div>
              )}

              {/* Type: Signature Line */}
              {el.type === 'signature' && (
                <div className="w-full h-full flex flex-col justify-end text-left font-sans">
                  <div 
                    className="italic text-base font-serif border-b border-slate-400 pb-1 text-slate-900"
                    style={{ fontFamily: 'Alex Brush, Great Vibes, Georgia, serif', fontSize: '22px' }}
                  >
                    {demoData?.signatory1Name || 'Dr. Jennifer Widom'}
                  </div>
                  <div className="text-[10px] font-bold text-slate-800 uppercase tracking-wider mt-1 font-mono">
                    {demoData?.signatory1Role || 'Dean & Registrar'}
                  </div>
                  <div className="text-[8px] font-mono text-slate-400">
                    Key: {demoData?.signatory1Key || 'HSM-STANFORD-ECDSA-01'}
                  </div>
                </div>
              )}

              {/* Type: Image */}
              {el.type === 'image' && el.src && (
                <img 
                  src={el.src} 
                  alt={el.name} 
                  className="w-full h-full object-contain"
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
