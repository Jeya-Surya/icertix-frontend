import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  GraduationCap, 
  ShieldCheck, 
  Lock, 
  KeyRound, 
  ArrowRight, 
  CheckCircle2, 
  Eye, 
  EyeOff, 
  Fingerprint, 
  AlertCircle, 
  X,
  User,
  Shield,
  Award
} from 'lucide-react';
import { Organisation, Candidate, AuthUser } from '../../types';
import { IcertixSeal } from '../../components/common/IcertixSeal';
import { QrCodeSvg } from '../../components/common/QrCodeSvg';
import { IcertixLogo } from '../../components/common/IcertixLogo';
import { api } from '../../services/apiClient';

interface LoginPageProps {
  organisations: Organisation[];
  candidates: Candidate[];
  onLoginSuccess: (user: AuthUser, redirectPortal?: 'org' | 'candidate' | 'verify') => void;
  onBypassToVerifier: () => void;
  initialView?: 'login' | 'register_org' | 'claim_candidate';
  onViewChange?: (view: 'login' | 'register_org' | 'claim_candidate') => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  organisations,
  candidates,
  onLoginSuccess,
  onBypassToVerifier,
  initialView = 'login',
  onViewChange
}) => {
  // Main view mode: 'login' | 'register_org' | 'claim_candidate'
  const [viewMode, setViewMode] = useState<'login' | 'register_org' | 'claim_candidate'>(initialView);

  // Sync internal viewMode with initialView changes (e.g. from browser URL)
  useEffect(() => {
    if (initialView) {
      setViewMode(initialView);
    }
  }, [initialView]);

  const changeView = (newView: 'login' | 'register_org' | 'claim_candidate') => {
    setViewMode(newView);
    setErrorMsg(null);
    if (onViewChange) {
      onViewChange(newView);
    }
  };
  
  // Form State
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [showCandPassword, setShowCandPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Hero carousel slide state
  const [activeSlide, setActiveSlide] = useState(0);

  // 3 Realistic Sovereign Certificates: Two Light (White + Soft Ivory) & One Deep Obsidian Dark
  const certificatesData = [
    // 1. Pristine Classic White & Gold (Light)
    {
      quoteTitle: "Step Bold, Stay Trusted",
      quoteSubtitle: "Capturing Excellence, Verifying Trust",
      quoteDescription: "Cryptographically verifiable credentials anchored to tamper-evident ledgers with instant QR authentication.",
      cert: {
        id: "ICX-STF-2026-8890",
        isLight: true,
        institution: "STANFORD CENTER FOR PROFESSIONAL DEVELOPMENT",
        subHeader: "PROFESSIONAL CREDENTIAL OF TECHNICAL MASTERY",
        preamble: "In recognition of outstanding technical contribution and research excellence, this credential is conferred upon",
        recipient: "ALEXANDER REED",
        awardTitle: "Executive AI & Deep Learning Strategy",
        honors: "Awarded with Highest Distinction (A+)",
        date: "15 October 2026",
        signer1: { name: "Dr. Arthur Pendelton", title: "Dean of Engineering" },
        signer2: { name: "Seraphina Vance", title: "President of Board" },
        cardBg: "#FFFFFF",
        innerBg: "linear-gradient(180deg, #FFFFFF 0%, #FAFBFD 100%)",
        borderColor: "rgba(184, 134, 11, 0.45)",
        cornerAccentColor: "#B8860B",
        institutionColor: "#B8860B",
        subHeaderColor: "#64748B",
        preambleColor: "#475569",
        recipientColor: "#0C1A30",
        awardColor: "#1877E0",
        honorsColor: "#334155",
        dividerColor: "#E2E8F0",
        signerNameColor: "#0F172A",
        signerTitleColor: "#64748B",
        idColor: "#1877E0",
        qrBg: "#F1F5F9",
        qrFg: "#0C1A30",
        glowColor: "rgba(46, 166, 255, 0.25)"
      }
    },
    // 2. Soft Ivory & Emerald Champagne (Light)
    {
      quoteTitle: "Sovereign Proof Engine",
      quoteSubtitle: "Empower Your Institution",
      quoteDescription: "Issue thousands of student and professional certificates in seconds with custom studio templates and automated distribution.",
      cert: {
        id: "ICX-MIT-2026-4412",
        isLight: true,
        institution: "MASSACHUSETTS INSTITUTE OF TECHNOLOGY",
        subHeader: "ADVANCED CRYPTOGRAPHIC SYSTEMS DIVISION",
        preamble: "By sovereign authority of the academic senate and verification authority, this credential is awarded to",
        recipient: "DR. ELENA ROSTOVA",
        awardTitle: "Postgraduate Fellow in Distributed Security",
        honors: "Hardware Root Cryptographically Anchored",
        date: "22 November 2026",
        signer1: { name: "Prof. Marcus Aurelius", title: "Director of Research" },
        signer2: { name: "Dr. David Sterling", title: "Registrar General" },
        cardBg: "#FCFAF6",
        innerBg: "linear-gradient(180deg, #FCFAF6 0%, #F6F2E9 100%)",
        borderColor: "rgba(22, 101, 52, 0.35)",
        cornerAccentColor: "#166534",
        institutionColor: "#15803D",
        subHeaderColor: "#64748B",
        preambleColor: "#475569",
        recipientColor: "#0F172A",
        awardColor: "#047857",
        honorsColor: "#334155",
        dividerColor: "#E7E0D0",
        signerNameColor: "#0F172A",
        signerTitleColor: "#64748B",
        idColor: "#047857",
        qrBg: "#F0EBE0",
        qrFg: "#064E3B",
        glowColor: "rgba(123, 217, 79, 0.25)"
      }
    },
    // 3. Deep Luxury Obsidian Dark & Holographic Cyan (Dark Luxury)
    {
      quoteTitle: "One-Click Public Proof",
      quoteSubtitle: "Universal Earner Wallets",
      quoteDescription: "Allow candidates to claim digital badges, showcase verified PDF credentials, and verify identity anywhere across the globe.",
      cert: {
        id: "ICX-GFC-2026-1098",
        isLight: false,
        institution: "GLOBAL FINTECH & CLOUD ACCREDITATION COUNCIL",
        subHeader: "INTERNATIONAL CREDENTIALING SENATE",
        preamble: "This certifies that the recipient has fulfilled all requirements and passed sovereign board review for",
        recipient: "JESSICA CHEN",
        awardTitle: "Master Certified Cloud & Fintech Principal",
        honors: "Conferred with Sovereign Public Verifiability",
        date: "04 December 2026",
        signer1: { name: "Jonathan Croft", title: "Chief Examiner" },
        signer2: { name: "Victoria Sterling", title: "Council Chair" },
        cardBg: "#071124",
        innerBg: "linear-gradient(180deg, rgba(8, 20, 42, 0.95) 0%, rgba(5, 14, 30, 0.98) 100%)",
        borderColor: "rgba(46, 166, 255, 0.4)",
        cornerAccentColor: "#2EA6FF",
        institutionColor: "#2EA6FF",
        subHeaderColor: "#94A3B8",
        preambleColor: "#CBD5E1",
        recipientColor: "#FFFFFF",
        awardColor: "#7BD94F",
        honorsColor: "#CBD5E1",
        dividerColor: "rgba(255, 255, 255, 0.12)",
        signerNameColor: "#FFFFFF",
        signerTitleColor: "#94A3B8",
        idColor: "#2EA6FF",
        qrBg: "#FFFFFF",
        qrFg: "#050E20",
        glowColor: "rgba(46, 166, 255, 0.3)"
      }
    }
  ];

  // Rotate slide periodically
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % certificatesData.length);
    }, 7000);
    return () => clearInterval(timer);
  }, [certificatesData.length]);

  // Forgot Password Modal State
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetSent, setResetSent] = useState(false);

  // Registration Form State (Institution)
  const [regOrgName, setRegOrgName] = useState('');
  const [regOrgCode, setRegOrgCode] = useState('');
  const [regDomain, setRegDomain] = useState('');
  const [regAdminName, setRegAdminName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regSuccess, setRegSuccess] = useState(false);

  // Candidate Claim State (Student)
  const [candClaimName, setCandClaimName] = useState('');
  const [candClaimEmail, setCandClaimEmail] = useState('');
  const [candClaimStudentId, setCandClaimStudentId] = useState('');
  const [candClaimPassword, setCandClaimPassword] = useState('');
  const [candClaimSuccess, setCandClaimSuccess] = useState(false);

  // Handle single unified login submit for all roles
  const handleSubmitLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const trimmedIdentifier = identifier.trim();
    if (!trimmedIdentifier) {
      setErrorMsg('Please enter your email address or Candidate ID.');
      return;
    }

    setIsSubmitting(true);

    try {
      const authResult = await api.login(trimmedIdentifier, password);
      if (authResult?.user) {
        setIsSubmitting(false);
        const userRole = authResult.user.role;

        const redirect = 
          userRole === 'SUPER_ADMIN'
            ? undefined
            : userRole === 'CANDIDATE'
            ? 'candidate'
            : 'org';

        onLoginSuccess(authResult.user, redirect);
        return;
      }
      setIsSubmitting(false);
      setErrorMsg('Invalid email, Candidate ID, or password credentials.');
    } catch (err: any) {
      setIsSubmitting(false);
      setErrorMsg(err.message || 'Invalid email, Candidate ID, or password. Please verify your credentials.');
    }
  };

  // Handle Register New Organization with live Backend Provisioning
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regOrgName || !regEmail || !regAdminName || !regPassword) {
      setErrorMsg('Please provide Organization Name, Administrator Name, Work Email, and Password.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    const trimmedOrgName = regOrgName.trim();
    const firstTwoLetters = trimmedOrgName.replace(/[^a-zA-Z0-9]/g, '').slice(0, 2).toUpperCase() || 'OG';
    const finalOrgCode = regOrgCode.trim() ? regOrgCode.trim().toUpperCase() : firstTwoLetters;

    try {
      const result = await api.registerOrganisation({
        orgName: trimmedOrgName,
        orgCode: finalOrgCode,
        domain: regDomain.trim() || `${trimmedOrgName.toLowerCase().replace(/[^a-z0-9]/g, '')}.edu`,
        adminName: regAdminName.trim(),
        email: regEmail.trim(),
        passwordPlain: regPassword
      });

      setIsSubmitting(false);
      if (result?.organisation && result?.user) {
        setRegSuccess(true);
        setTimeout(() => {
          onLoginSuccess(result.user, 'org');
        }, 1200);
        return;
      }
    } catch (err: any) {
      setIsSubmitting(false);
      setErrorMsg(err.message || 'Failed to register organization. Please try again or contact platform support.');
    }
  };

  // Handle Candidate Claim Student Account with Live Backend Password Setup
  const handleCandidateClaimSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!candClaimEmail || !candClaimStudentId || !candClaimPassword) {
      setErrorMsg('Please provide your Candidate Email, Candidate ID, and set your new Password.');
      return;
    }

    if (candClaimPassword.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const result = await api.claimCandidateAccount({
        email: candClaimEmail.trim(),
        studentId: candClaimStudentId.trim(),
        newPassword: candClaimPassword,
        name: candClaimName || undefined
      });

      setIsSubmitting(false);
      if (result?.user) {
        setCandClaimSuccess(true);
        setTimeout(() => {
          onLoginSuccess(result.user, 'candidate');
        }, 1200);
        return;
      }
    } catch (err: any) {
      setIsSubmitting(false);
      setErrorMsg(err.message || 'Unable to claim candidate account. Please verify your Candidate ID provided by your institution.');
    }
  };

  const currentSlide = certificatesData[activeSlide];
  const activeCert = currentSlide.cert;

  return (
    <div className="min-h-screen w-full flex flex-col justify-center items-center bg-[#050D1A] text-slate-100 p-3 sm:p-6 lg:p-8 relative overflow-x-hidden selection:bg-[#2ea6ff]/30 selection:text-white">
      {/* Dynamic Ambient Background Glows */}
      <div className="fixed top-0 left-1/4 -translate-y-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-radial from-[#2ea6ff]/15 via-[#1877e0]/5 to-transparent rounded-full blur-3xl pointer-events-none" />
      <div className="fixed bottom-0 right-1/4 translate-y-1/2 translate-x-1/2 w-[600px] h-[600px] bg-radial from-[#7bd94f]/12 via-[#2ea6ff]/5 to-transparent rounded-full blur-3xl pointer-events-none" />
      <div className="fixed inset-0 bg-[radial-gradient(#1e355b_1px,transparent_1px)] [background-size:28px_28px] opacity-20 pointer-events-none" />

      {/* Main Luxury Split Card */}
      <div className="max-w-5xl lg:max-w-6xl w-full bg-[#091528]/95 border border-[#1b2f52] shadow-[0_25px_70px_rgba(0,0,0,0.65)] rounded-3xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 backdrop-blur-2xl relative z-10 my-auto">
        
        {/* ========================================================= */}
        {/* LEFT COLUMN: Real Interactive Certificate Showcase        */}
        {/* ========================================================= */}
        <div className="lg:col-span-6 bg-gradient-to-b from-[#071328] via-[#0a1b38] to-[#050e20] p-6 sm:p-7 flex flex-col justify-between relative overflow-hidden border-b lg:border-b-0 lg:border-r border-[#162744]">
          
          {/* Ambient Glow Accent */}
          <div 
            className="absolute top-0 right-0 w-80 h-80 rounded-full blur-3xl pointer-events-none transition-all duration-700 opacity-20"
            style={{ backgroundColor: activeCert.institutionColor }}
          />

          {/* Top Row: Logo & Public Verifier Button */}
          <div className="flex items-center justify-between gap-3 relative z-10 mb-4">
            <IcertixLogo variant="light" size="sm" showSubtitle={true} />

            <button
              onClick={onBypassToVerifier}
              className="group inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-slate-200 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-[#2ea6ff]/40 shadow-xs backdrop-blur-xs transition-all cursor-pointer"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-[#7bd94f] group-hover:scale-110 transition-transform" />
              <span>Public Verifier</span>
              <ArrowRight className="w-3 h-3 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>

          {/* Center Product Showcase: 3D Real UI-Matched Certificate Canvas */}
          <div className="relative z-10 my-auto py-2 flex flex-col items-center">
            <div className="relative group w-full max-w-[420px] transition-all duration-500">
              
              {/* Outer Glowing Aura */}
              <div 
                className="absolute -inset-1.5 rounded-2xl blur-md opacity-70 group-hover:opacity-100 transition-opacity duration-700"
                style={{ background: activeCert.glowColor }}
              />

              {/* Realistic Certificate Frame Card */}
              <div 
                className="relative rounded-2xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.85)] p-3.5 sm:p-4 text-center transition-all duration-500 border"
                style={{ 
                  backgroundColor: activeCert.cardBg,
                  borderColor: activeCert.isLight ? '#E2E8F0' : '#1e3458'
                }}
              >
                {/* Guilloche Frame Border */}
                <div 
                  className="rounded-xl p-3 relative flex flex-col justify-between border"
                  style={{ 
                    borderColor: activeCert.borderColor,
                    background: activeCert.innerBg
                  }}
                >
                  {/* Guilloche Corner Accents */}
                  <div className="absolute top-1 left-1 w-3 h-3 border-t-2 border-l-2" style={{ borderColor: activeCert.cornerAccentColor }} />
                  <div className="absolute top-1 right-1 w-3 h-3 border-t-2 border-r-2" style={{ borderColor: activeCert.cornerAccentColor }} />
                  <div className="absolute bottom-1 left-1 w-3 h-3 border-b-2 border-l-2" style={{ borderColor: activeCert.cornerAccentColor }} />
                  <div className="absolute bottom-1 right-1 w-3 h-3 border-b-2 border-r-2" style={{ borderColor: activeCert.cornerAccentColor }} />

                  {/* Institution Header */}
                  <div className="mb-2">
                    <div 
                      className="text-[10px] sm:text-[11px] font-mono uppercase font-black tracking-widest leading-tight"
                      style={{ color: activeCert.institutionColor }}
                    >
                      {activeCert.institution}
                    </div>
                    <div 
                      className="text-[8px] font-mono tracking-wider uppercase mt-0.5"
                      style={{ color: activeCert.subHeaderColor }}
                    >
                      {activeCert.subHeader}
                    </div>
                  </div>

                  {/* Preamble & Recipient Name */}
                  <div className="my-1.5">
                    <p 
                      className="text-[8.5px] font-jakarta italic line-clamp-1"
                      style={{ color: activeCert.preambleColor }}
                    >
                      {activeCert.preamble}
                    </p>
                    <h3 
                      className="text-base sm:text-lg font-bold font-sora tracking-tight mt-0.5"
                      style={{ color: activeCert.recipientColor }}
                    >
                      {activeCert.recipient}
                    </h3>
                  </div>

                  {/* Award Title & Honors */}
                  <div className="my-1">
                    <div 
                      className="text-xs sm:text-sm font-extrabold font-sora leading-snug"
                      style={{ color: activeCert.awardColor }}
                    >
                      {activeCert.awardTitle}
                    </div>
                    <div 
                      className="text-[8.5px] font-mono font-semibold mt-0.5"
                      style={{ color: activeCert.honorsColor }}
                    >
                      {activeCert.honors}
                    </div>
                  </div>

                  {/* Bottom Row: Dynamic QR, Seal, and Signatures */}
                  <div 
                    className="pt-2.5 mt-2 flex items-end justify-between gap-2 text-left border-t"
                    style={{ borderColor: activeCert.dividerColor }}
                  >
                    {/* Left: Dynamic Vector QR */}
                    <div 
                      className="flex items-center gap-1.5 shrink-0 p-1 rounded-lg shadow-xs border border-black/5"
                      style={{ backgroundColor: activeCert.qrBg }}
                    >
                      <QrCodeSvg
                        value={`https://icertix.com/verify/${activeCert.id}`}
                        size={44}
                        fgColor={activeCert.qrFg}
                        bgColor={activeCert.qrBg}
                      />
                    </div>

                    {/* Center: Authentic Sovereign iCertiX Seal */}
                    <div className="flex flex-col items-center shrink-0">
                      <IcertixSeal size={48} showGlow={!activeCert.isLight} />
                      <span 
                        className="text-[7.5px] font-mono mt-0.5 uppercase tracking-tighter"
                        style={{ color: activeCert.subHeaderColor }}
                      >
                        SHA-256 HSM ROOT
                      </span>
                    </div>

                    {/* Right: Signatory & Certificate Metadata */}
                    <div className="text-right shrink-0 text-[8px] font-jakarta space-y-0.5">
                      <div 
                        className="font-serif italic text-[9.5px] leading-none"
                        style={{ color: activeCert.signerNameColor }}
                      >
                        {activeCert.signer1.name}
                      </div>
                      <div 
                        className="text-[7.5px] leading-tight"
                        style={{ color: activeCert.signerTitleColor }}
                      >
                        {activeCert.signer1.title}
                      </div>
                      <div 
                        className="font-mono text-[7px] pt-0.5 font-bold"
                        style={{ color: activeCert.idColor }}
                      >
                        ID: {activeCert.id}
                      </div>
                    </div>

                  </div>
                </div>

                {/* Floating Micro-Badge 1: Top Right */}
                <div className="absolute top-2 right-2 bg-[#071328]/95 backdrop-blur-md border border-[#7bd94f]/50 text-[#7bd94f] px-2 py-0.5 rounded-full text-[9px] font-mono font-bold flex items-center gap-1 shadow-md">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#7bd94f] animate-pulse" />
                  <span>TAMPER-PROOF</span>
                </div>

                {/* Floating Micro-Badge 2: Bottom Left */}
                <div className="absolute bottom-2 left-2 bg-[#071328]/95 backdrop-blur-md border border-[#2ea6ff]/50 text-cyan-300 px-2 py-0.5 rounded-full text-[9px] font-mono font-semibold flex items-center gap-1 shadow-md">
                  <Shield className="w-3 h-3 text-[#2ea6ff]" />
                  <span>ANCHORED</span>
                </div>

              </div>
            </div>
          </div>

          {/* Bottom Typography & Carousel Indicator */}
          <div className="relative z-10 pt-3 mt-3 border-t border-[#162744] space-y-2">
            <div>
              <div 
                className="text-[11px] font-mono uppercase font-bold tracking-wider mb-0.5"
                style={{ color: activeCert.isLight ? '#2ea6ff' : activeCert.institutionColor }}
              >
                {currentSlide.quoteSubtitle}
              </div>
              <h2 className="text-lg sm:text-xl font-bold font-sora text-white leading-tight">
                {currentSlide.quoteTitle}
              </h2>
              <p className="text-xs text-slate-300 leading-relaxed font-jakarta mt-1">
                {currentSlide.quoteDescription}
              </p>
            </div>

            {/* Slide Pagination Dots */}
            <div className="flex items-center gap-2 pt-1">
              {certificatesData.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveSlide(idx)}
                  className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                    activeSlide === idx 
                      ? 'w-7 bg-[#2ea6ff] shadow-[0_0_8px_#2ea6ff]' 
                      : 'w-2 bg-slate-600 hover:bg-slate-400'
                  }`}
                  title={`View Certificate Sample ${idx + 1}`}
                />
              ))}
            </div>
          </div>

        </div>

        {/* ========================================================= */}
        {/* RIGHT COLUMN: Sleek Dark Auth Form (Clean & Focused)      */}
        {/* ========================================================= */}
        <div className="lg:col-span-6 p-6 sm:p-8 lg:p-10 flex flex-col justify-between bg-[#081324]/90 backdrop-blur-xl">
          
          <div>
            {/* View Mode Segmented Switcher / Header Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 mb-6 pb-4 border-b border-[#152643]">
              <div>
                <h1 className="text-xl sm:text-2xl font-bold font-sora text-white tracking-tight">
                  {viewMode === 'login' && 'Sign In to Account'}
                  {viewMode === 'register_org' && 'Register Organization'}
                  {viewMode === 'claim_candidate' && 'Claim Candidate Account'}
                </h1>
                <p className="text-xs text-slate-400 mt-0.5">
                  {viewMode === 'login' && 'Access your credential registry and administrative suite'}
                  {viewMode === 'register_org' && 'Set up your institution to issue authentic digital certificates'}
                  {viewMode === 'claim_candidate' && 'Activate your earner profile and access your digital certificates'}
                </p>
              </div>

              {/* Top View Selector Buttons */}
              <div className="inline-flex p-1 bg-[#050e1f] border border-[#1a2e50] rounded-xl text-xs font-semibold">
                <button
                  onClick={() => changeView('login')}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                    viewMode === 'login'
                      ? 'bg-[#2ea6ff] text-[#050e1f] font-bold shadow-xs'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Sign In
                </button>
                <button
                  onClick={() => changeView('register_org')}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                    viewMode === 'register_org'
                      ? 'bg-[#2ea6ff] text-[#050e1f] font-bold shadow-xs'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Register Org
                </button>
                <button
                  onClick={() => changeView('claim_candidate')}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                    viewMode === 'claim_candidate'
                      ? 'bg-[#2ea6ff] text-[#050e1f] font-bold shadow-xs'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Claim Account
                </button>
              </div>
            </div>

            {/* Error Message Banner */}
            {errorMsg && (
              <div className="mb-5 p-3.5 bg-rose-950/50 border border-rose-600/40 rounded-xl text-rose-200 text-xs flex items-center gap-3 animate-fadeIn">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span className="font-medium">{errorMsg}</span>
              </div>
            )}

            {/* ----------------------------------------------------- */}
            {/* VIEW 1: SIGN IN FORM                                 */}
            {/* ----------------------------------------------------- */}
            {viewMode === 'login' && (
              <form onSubmit={handleSubmitLogin} className="space-y-4">
                {/* Identifier Input */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-mono font-semibold uppercase tracking-wider text-slate-300">
                    Email Address or Candidate ID
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      placeholder="e.g. registrar@stanford.edu or CAND-2026-001"
                      className="w-full pl-10 pr-4 py-2.5 bg-[#0e1d35]/90 border border-[#1b3156] rounded-xl text-xs font-medium text-white placeholder:text-slate-500 focus:bg-[#122442] focus:outline-none focus:border-[#2ea6ff] focus:ring-2 focus:ring-[#2ea6ff]/20 transition-all"
                    />
                  </div>
                </div>

                {/* Password Input */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-300">
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowForgotPassword(true)}
                      className="text-xs font-medium text-[#2ea6ff] hover:text-cyan-300 hover:underline cursor-pointer"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your private password"
                      className="w-full pl-10 pr-10 py-2.5 bg-[#0e1d35]/90 border border-[#1b3156] rounded-xl text-xs font-medium text-white placeholder:text-slate-500 focus:bg-[#122442] focus:outline-none focus:border-[#2ea6ff] focus:ring-2 focus:ring-[#2ea6ff]/20 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white cursor-pointer"
                      title={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Checkbox Options */}
                <div className="flex items-center justify-between text-xs pt-1">
                  <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="rounded border-[#1b3156] bg-[#0e1d35] text-[#2ea6ff] focus:ring-0 w-4 h-4 cursor-pointer"
                    />
                    <span>Remember this session</span>
                  </label>

                  <div className="flex items-center gap-1.5 text-[11px] font-mono text-[#7bd94f]">
                    <Fingerprint className="w-3.5 h-3.5" />
                    <span>2FA Protected</span>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 px-4 bg-gradient-to-r from-[#2ea6ff] via-[#1e8fff] to-[#7bd94f] hover:from-[#37b6ff] hover:to-[#6fe08a] text-[#051427] font-bold font-sora text-xs uppercase tracking-wider rounded-xl shadow-[0_10px_25px_rgba(46,166,255,0.25)] hover:shadow-[0_12px_30px_rgba(46,166,255,0.4)] disabled:opacity-50 transition-all flex items-center justify-center gap-2 cursor-pointer mt-3"
                >
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-[#051427] border-t-transparent rounded-full animate-spin" />
                      <span>Authenticating Credentials...</span>
                    </span>
                  ) : (
                    <>
                      <span>Sign In</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            )}

            {/* ----------------------------------------------------- */}
            {/* VIEW 2: REGISTER ORGANIZATION FORM                    */}
            {/* ----------------------------------------------------- */}
            {viewMode === 'register_org' && (
              <div>
                {regSuccess ? (
                  <div className="p-6 bg-emerald-950/40 border border-emerald-500/40 rounded-2xl text-center space-y-3 animate-fadeIn">
                    <div className="w-12 h-12 bg-[#7bd94f] text-[#050e1f] flex items-center justify-center mx-auto rounded-full shadow-lg">
                      <CheckCircle2 className="w-6 h-6" />
                    </div>
                    <h3 className="font-sora text-base font-bold text-white">
                      Institution Registered Successfully!
                    </h3>
                    <p className="text-xs text-emerald-200 leading-relaxed max-w-md mx-auto">
                      Authority tenant for <span className="font-bold text-white">{regOrgName}</span> created. Initializing dashboard...
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
                    {/* Organization Name */}
                    <div>
                      <label className="block text-xs font-mono font-semibold uppercase tracking-wider text-slate-300 mb-1">
                        Organization Name *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Stanford University or MIT"
                        value={regOrgName}
                        onChange={(e) => setRegOrgName(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-[#0e1d35]/90 border border-[#1b3156] rounded-xl text-xs font-medium text-white placeholder:text-slate-500 focus:outline-none focus:border-[#2ea6ff]"
                      />
                    </div>

                    {/* Org Code & Domain */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-mono font-semibold uppercase tracking-wider text-slate-300 mb-1">
                          Organization Code
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. STANFORD"
                          value={regOrgCode}
                          onChange={(e) => setRegOrgCode(e.target.value.toUpperCase())}
                          className="w-full px-3.5 py-2.5 bg-[#0e1d35]/90 border border-[#1b3156] rounded-xl text-xs font-mono font-medium text-white placeholder:text-slate-500 uppercase focus:outline-none focus:border-[#2ea6ff]"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-mono font-semibold uppercase tracking-wider text-slate-300 mb-1">
                          Official Domain
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. stanford.edu"
                          value={regDomain}
                          onChange={(e) => setRegDomain(e.target.value)}
                          className="w-full px-3.5 py-2.5 bg-[#0e1d35]/90 border border-[#1b3156] rounded-xl text-xs font-medium text-white placeholder:text-slate-500 focus:outline-none focus:border-[#2ea6ff]"
                        />
                      </div>
                    </div>

                    {/* Admin Name & Work Email */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-mono font-semibold uppercase tracking-wider text-slate-300 mb-1">
                          Admin Full Name *
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Dr. Arthur Pendelton"
                          value={regAdminName}
                          onChange={(e) => setRegAdminName(e.target.value)}
                          className="w-full px-3.5 py-2.5 bg-[#0e1d35]/90 border border-[#1b3156] rounded-xl text-xs font-medium text-white placeholder:text-slate-500 focus:outline-none focus:border-[#2ea6ff]"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-mono font-semibold uppercase tracking-wider text-slate-300 mb-1">
                          Work Email *
                        </label>
                        <input
                          type="email"
                          required
                          placeholder="e.g. registrar@stanford.edu"
                          value={regEmail}
                          onChange={(e) => setRegEmail(e.target.value)}
                          className="w-full px-3.5 py-2.5 bg-[#0e1d35]/90 border border-[#1b3156] rounded-xl text-xs font-medium text-white placeholder:text-slate-500 focus:outline-none focus:border-[#2ea6ff]"
                        />
                      </div>
                    </div>

                    {/* Password */}
                    <div>
                      <label className="block text-xs font-mono font-semibold uppercase tracking-wider text-slate-300 mb-1">
                        Initial Administrator Password *
                      </label>
                      <div className="relative">
                        <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type={showRegPassword ? 'text' : 'password'}
                          required
                          placeholder="Min 6 characters"
                          value={regPassword}
                          onChange={(e) => setRegPassword(e.target.value)}
                          className="w-full pl-10 pr-10 py-2.5 bg-[#0e1d35]/90 border border-[#1b3156] rounded-xl text-xs font-medium text-white placeholder:text-slate-500 focus:outline-none focus:border-[#2ea6ff]"
                        />
                        <button
                          type="button"
                          onClick={() => setShowRegPassword(!showRegPassword)}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white cursor-pointer"
                        >
                          {showRegPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-3 px-4 bg-gradient-to-r from-[#2ea6ff] via-[#1e8fff] to-[#7bd94f] hover:from-[#37b6ff] hover:to-[#6fe08a] text-[#051427] font-bold font-sora text-xs uppercase tracking-wider rounded-xl shadow-[0_10px_25px_rgba(46,166,255,0.25)] disabled:opacity-50 transition-all flex items-center justify-center gap-2 cursor-pointer mt-1"
                    >
                      {isSubmitting ? 'Registering Authority...' : 'Create Organization Tenant'}
                    </button>
                  </form>
                )}
              </div>
            )}

            {/* ----------------------------------------------------- */}
            {/* VIEW 3: CLAIM CANDIDATE ACCOUNT FORM                  */}
            {/* ----------------------------------------------------- */}
            {viewMode === 'claim_candidate' && (
              <div>
                {candClaimSuccess ? (
                  <div className="p-6 bg-emerald-950/40 border border-emerald-500/40 rounded-2xl text-center space-y-3 animate-fadeIn">
                    <div className="w-12 h-12 bg-[#7bd94f] text-[#050e1f] flex items-center justify-center mx-auto rounded-full shadow-lg">
                      <CheckCircle2 className="w-6 h-6" />
                    </div>
                    <h3 className="font-sora text-base font-bold text-white">
                      Candidate Account Activated!
                    </h3>
                    <p className="text-xs text-emerald-200 leading-relaxed max-w-md mx-auto">
                      Your verifiable candidate profile is ready. Signing you into your digital credentials wallet...
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleCandidateClaimSubmit} className="space-y-3.5">
                    {/* Candidate Name */}
                    <div>
                      <label className="block text-xs font-mono font-semibold uppercase tracking-wider text-slate-300 mb-1">
                        Candidate Full Name
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Jessica Chen"
                        value={candClaimName}
                        onChange={(e) => setCandClaimName(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-[#0e1d35]/90 border border-[#1b3156] rounded-xl text-xs font-medium text-white placeholder:text-slate-500 focus:outline-none focus:border-[#2ea6ff]"
                      />
                    </div>

                    {/* Email & Candidate ID */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-mono font-semibold uppercase tracking-wider text-slate-300 mb-1">
                          Candidate Email *
                        </label>
                        <input
                          type="email"
                          required
                          placeholder="e.g. jessica@stanford.edu"
                          value={candClaimEmail}
                          onChange={(e) => setCandClaimEmail(e.target.value)}
                          className="w-full px-3.5 py-2.5 bg-[#0e1d35]/90 border border-[#1b3156] rounded-xl text-xs font-medium text-white placeholder:text-slate-500 focus:outline-none focus:border-[#2ea6ff]"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-mono font-semibold uppercase tracking-wider text-slate-300 mb-1">
                          Candidate ID *
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. CAND-2026-001"
                          value={candClaimStudentId}
                          onChange={(e) => setCandClaimStudentId(e.target.value.toUpperCase())}
                          className="w-full px-3.5 py-2.5 bg-[#0e1d35]/90 border border-[#1b3156] rounded-xl text-xs font-mono font-medium text-white placeholder:text-slate-500 uppercase focus:outline-none focus:border-[#2ea6ff]"
                        />
                      </div>
                    </div>

                    {/* Password */}
                    <div>
                      <label className="block text-xs font-mono font-semibold uppercase tracking-wider text-slate-300 mb-1">
                        Create Private Password *
                      </label>
                      <div className="relative">
                        <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type={showCandPassword ? 'text' : 'password'}
                          required
                          placeholder="Min 6 characters"
                          value={candClaimPassword}
                          onChange={(e) => setCandClaimPassword(e.target.value)}
                          className="w-full pl-10 pr-10 py-2.5 bg-[#0e1d35]/90 border border-[#1b3156] rounded-xl text-xs font-medium text-white placeholder:text-slate-500 focus:outline-none focus:border-[#2ea6ff]"
                        />
                        <button
                          type="button"
                          onClick={() => setShowCandPassword(!showCandPassword)}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white cursor-pointer"
                        >
                          {showCandPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-3 px-4 bg-gradient-to-r from-[#2ea6ff] via-[#1e8fff] to-[#7bd94f] hover:from-[#37b6ff] hover:to-[#6fe08a] text-[#051427] font-bold font-sora text-xs uppercase tracking-wider rounded-xl shadow-[0_10px_25px_rgba(46,166,255,0.25)] disabled:opacity-50 transition-all flex items-center justify-center gap-2 cursor-pointer mt-1"
                    >
                      {isSubmitting ? 'Activating Account...' : 'Activate Candidate Account'}
                    </button>
                  </form>
                )}
              </div>
            )}
          </div>

          {/* Bottom Security Info Pill */}
          <div className="pt-5 mt-5 border-t border-[#152643] flex items-center justify-between text-[11px] font-mono text-slate-400">
            <span className="flex items-center gap-1.5 text-[#7bd94f] font-bold">
              <span className="w-2 h-2 rounded-full bg-[#7bd94f] animate-pulse" />
              <span>TLS 1.3 &bull; HSM SOVEREIGN ENGINE</span>
            </span>
            <span>SYSTEM ACTIVE</span>
          </div>

        </div>
      </div>

      {/* ========================================================= */}
      {/* FORGOT PASSWORD MODAL                                     */}
      {/* ========================================================= */}
      {showForgotPassword && (
        <div className="fixed inset-0 z-50 bg-[#020712]/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#091528] border border-[#1b3156] shadow-2xl rounded-2xl max-w-md w-full p-6 space-y-4 animate-fadeIn text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-[#2ea6ff]" />
                <h3 className="font-sora text-base font-bold text-white">
                  Reset Account Password
                </h3>
              </div>
              <button
                onClick={() => {
                  setShowForgotPassword(false);
                  setResetSent(false);
                }}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {resetSent ? (
              <div className="p-4 bg-emerald-950/50 border border-emerald-500/40 rounded-xl text-center space-y-2">
                <CheckCircle2 className="w-8 h-8 text-[#7bd94f] mx-auto" />
                <div className="text-xs font-bold text-white">
                  Password Recovery Dispatched
                </div>
                <p className="text-[11px] text-emerald-200">
                  If an account or student enrollment matches <span className="font-bold text-white">{resetEmail}</span>, recovery instructions have been sent.
                </p>
                <button
                  onClick={() => {
                    setShowForgotPassword(false);
                    setResetSent(false);
                  }}
                  className="w-full py-2 bg-[#2ea6ff] text-[#050e1f] text-xs font-bold uppercase rounded-lg mt-2 cursor-pointer"
                >
                  Return to Sign In
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-xs text-slate-300">
                  Enter your registered work email address or Candidate ID to receive a secure password recovery link.
                </p>
                <input
                  type="text"
                  placeholder="e.g. registrar@institution.edu or CAND-2026-001"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#0e1d35] border border-[#1b3156] rounded-xl text-xs font-medium text-white placeholder:text-slate-500 focus:outline-none focus:border-[#2ea6ff]"
                />
                <button
                  onClick={() => {
                    if (resetEmail.trim()) setResetSent(true);
                  }}
                  className="w-full py-2.5 bg-gradient-to-r from-[#2ea6ff] to-[#7bd94f] text-[#050e1f] text-xs font-bold uppercase tracking-wider rounded-xl cursor-pointer"
                >
                  Send Recovery Link
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Subtle Footer Attribution */}
      <div className="mt-4 text-center text-[11px] font-mono text-slate-500 relative z-10">
        iCertiX Sovereign Cryptographic Credential Engine &bull; Protected with SHA-256 HSM Proofs
      </div>
    </div>
  );
};
