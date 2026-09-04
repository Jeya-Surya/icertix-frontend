import { 
  StudioDesignSchema, 
  PrebuiltTemplatePreset, 
  DemoCandidateData, 
  PageSize, 
  PageOrientation,
  StudioElement 
} from '../types/templateStudio';
import { CertificateTemplate, Organisation } from '../types';

export const PAGE_SIZES: Record<PageSize, { landscape: { width: number; height: number }; portrait: { width: number; height: number } }> = {
  A4: {
    landscape: { width: 1000, height: 707 },
    portrait: { width: 707, height: 1000 }
  },
  A5: {
    landscape: { width: 707, height: 500 },
    portrait: { width: 500, height: 707 }
  },
  Letter: {
    landscape: { width: 1000, height: 773 },
    portrait: { width: 773, height: 1000 }
  },
  Custom: {
    landscape: { width: 1000, height: 700 },
    portrait: { width: 700, height: 1000 }
  }
};

export const DEFAULT_DEMO_DATA: DemoCandidateData = {
  candidateName: 'Rahul Kumar',
  candidateId: 'CAND-SU-2026-0891',
  candidateEmail: 'rahul.kumar@stanford.alumni.edu',
  courseName: 'Executive AI & Deep Learning Strategy',
  courseCode: 'CS-AI-890',
  department: 'Department of Computer Science & Engineering',
  duration: '12 Weeks (120 Hours Intensive)',
  certificateNumber: 'CERT-2026-000412',
  credentialId: 'ICX-2026-A81F92',
  issueDate: '31 August 2026',
  completionDate: '28 August 2026',
  expiryDate: 'Lifetime Verifiable',
  score: '94 / 100',
  grade: 'Awarded with High Honors (Distinction A+)',
  orgName: 'Stanford Center for Professional Development',
  orgDepartment: 'School of Engineering & Applied Cryptography',
  orgDomain: 'scpd.stanford.edu',
  orgLogo: 'SU',
  signatory1Name: 'Dr. Jennifer Widom',
  signatory1Role: 'Dean of Engineering & Frederick E. Terman Professor',
  signatory1Key: 'HSM-STANFORD-ECDSA-01',
  signatory2Name: 'Prof. Andrew Ng',
  signatory2Role: 'Adjunct Professor & AI Lab Director',
  verificationQr: 'https://icertix.com/verify/ICX-2026-A81F92',
  verificationUrl: 'https://icertix.com/verify/ICX-2026-A81F92',
  hashDigest: '0x8f4c2e91a0b3d68471e9823f4b5a6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b'
};

// Generate standard blank schema
export function createBlankDesignSchema(
  org: Organisation,
  pageSize: PageSize = 'A4',
  orientation: PageOrientation = 'landscape',
  bgColor = '#FFFFFF'
): StudioDesignSchema {
  const dimensions = PAGE_SIZES[pageSize][orientation];
  const templateId = `TPL-BLANK-${Date.now().toString().slice(-4)}`;

  return {
    id: `DSG-${Date.now().toString().slice(-6)}`,
    templateId,
    name: 'Untitled Custom Certificate',
    version: 1,
    status: 'DRAFT',
    category: 'Achievement',
    page: {
      size: pageSize,
      orientation,
      width: dimensions.width,
      height: dimensions.height
    },
    background: {
      type: 'color',
      value: bgColor,
      opacity: 100
    },
    elements: [
      // Outer border frame
      {
        id: 'el-border-01',
        name: 'Certificate Border',
        type: 'shape',
        shapeType: 'rectangle',
        x: 30,
        y: 30,
        width: dimensions.width - 60,
        height: dimensions.height - 60,
        fill: 'transparent',
        stroke: '#0A2540',
        strokeWidth: 3,
        strokeStyle: 'solid',
        borderRadius: 4,
        zIndex: 1,
        locked: false
      },
      // Header Org Name
      {
        id: 'el-org-name',
        name: 'Organisation Name',
        type: 'dynamic-field',
        fieldKey: 'orgName',
        text: org.name,
        fallbackText: org.name,
        x: 100,
        y: 80,
        width: dimensions.width - 200,
        height: 40,
        fontFamily: 'Cinzel',
        fontSize: 26,
        fontWeight: '700',
        color: '#0A2540',
        textAlign: 'center',
        textTransform: 'uppercase',
        zIndex: 10
      },
      // Preamble
      {
        id: 'el-preamble',
        name: 'Preamble',
        type: 'text',
        text: 'This is to officially certify that',
        x: 150,
        y: 170,
        width: dimensions.width - 300,
        height: 30,
        fontFamily: 'Playfair Display',
        fontSize: 16,
        fontStyle: 'italic',
        color: '#64748B',
        textAlign: 'center',
        zIndex: 11
      },
      // Candidate Name
      {
        id: 'el-candidate-name',
        name: 'Candidate Name',
        type: 'dynamic-field',
        fieldKey: 'candidateName',
        fallbackText: 'Candidate Full Name',
        x: 100,
        y: 220,
        width: dimensions.width - 200,
        height: 60,
        fontFamily: 'Playfair Display',
        fontSize: 38,
        fontWeight: '700',
        color: '#0A2540',
        textAlign: 'center',
        zIndex: 12
      },
      // Course Intro
      {
        id: 'el-course-intro',
        name: 'Course Intro',
        type: 'text',
        text: 'has successfully completed the prescribed curriculum and assessment requirements for',
        x: 120,
        y: 300,
        width: dimensions.width - 240,
        height: 35,
        fontFamily: 'Plus Jakarta Sans',
        fontSize: 14,
        color: '#475569',
        textAlign: 'center',
        zIndex: 13
      },
      // Course Name
      {
        id: 'el-course-name',
        name: 'Course Name',
        type: 'dynamic-field',
        fieldKey: 'courseName',
        fallbackText: 'Advanced Certification Title',
        x: 100,
        y: 350,
        width: dimensions.width - 200,
        height: 48,
        fontFamily: 'Sora',
        fontSize: 22,
        fontWeight: '700',
        color: '#0284C7',
        textAlign: 'center',
        zIndex: 14
      },
      // Signatory
      {
        id: 'el-signatory',
        name: 'Signatory Block',
        type: 'signature',
        signatureType: 'calligraphy',
        signatoryIndex: 0,
        x: 100,
        y: dimensions.height - 170,
        width: 240,
        height: 70,
        zIndex: 20
      },
      // Seal
      {
        id: 'el-seal',
        name: 'Official iCertiX Seal',
        type: 'seal',
        sealType: 'gold-crest',
        x: dimensions.width / 2 - 35,
        y: dimensions.height - 180,
        width: 70,
        height: 70,
        zIndex: 21
      },
      // QR Code
      {
        id: 'el-qr',
        name: 'Verification QR Code',
        type: 'qr',
        fieldKey: 'verificationQr',
        x: dimensions.width - 200,
        y: dimensions.height - 175,
        width: 75,
        height: 75,
        qrFgColor: '#0A2540',
        qrBgColor: '#FFFFFF',
        qrShowLabel: true,
        zIndex: 22
      },
      // Verification ID footer
      {
        id: 'el-cred-id',
        name: 'Credential ID',
        type: 'dynamic-field',
        fieldKey: 'credentialId',
        prefix: 'Credential ID: ',
        fallbackText: 'ICX-2026-XXXXXX',
        x: 100,
        y: dimensions.height - 65,
        width: dimensions.width - 200,
        height: 20,
        fontFamily: 'JetBrains Mono',
        fontSize: 11,
        color: '#94A3B8',
        textAlign: 'center',
        zIndex: 25
      }
    ],
    meta: {
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      author: org.name,
      description: 'Blank canvas custom template'
    }
  };
}

// Convert legacy CertificateTemplate to StudioDesignSchema
export function legacyTemplateToDesignSchema(
  tpl: CertificateTemplate,
  org?: Organisation
): StudioDesignSchema {
  const isPortrait = tpl.orientation === 'portrait';
  const width = isPortrait ? 707 : 1000;
  const height = isPortrait ? 1000 : 707;
  const primary = tpl.primaryColor || '#0A2540';
  const secondary = tpl.secondaryColor || '#0284C7';
  const font = tpl.fontFamily || 'Sora';
  const orgName = tpl.customHeading || org?.name || 'Academic Institution';

  const elements: StudioElement[] = [
    // Outer Frame
    {
      id: 'bg-frame-01',
      name: 'Outer Border Frame',
      type: 'shape',
      shapeType: 'rectangle',
      x: 25,
      y: 25,
      width: width - 50,
      height: height - 50,
      fill: 'transparent',
      stroke: primary,
      strokeWidth: tpl.theme === 'classic-diploma' ? 4 : 2,
      strokeStyle: 'solid',
      zIndex: 1
    },
    // Inner Accent Border
    {
      id: 'bg-frame-02',
      name: 'Inner Accent Frame',
      type: 'shape',
      shapeType: 'rectangle',
      x: 35,
      y: 35,
      width: width - 70,
      height: height - 70,
      fill: 'transparent',
      stroke: `${secondary}40`,
      strokeWidth: 1,
      strokeStyle: 'solid',
      zIndex: 2
    },
    // Authority Logo Badge
    {
      id: 'el-org-logo',
      name: 'Institution Crest Badge',
      type: 'shape',
      shapeType: 'circle',
      x: width / 2 - 28,
      y: 60,
      width: 56,
      height: 56,
      fill: primary,
      stroke: secondary,
      strokeWidth: 2,
      zIndex: 10
    },
    // Authority Text
    {
      id: 'el-org-heading',
      name: 'Issuing Authority Name',
      type: 'dynamic-field',
      fieldKey: 'orgName',
      text: orgName,
      fallbackText: orgName,
      x: 80,
      y: 125,
      width: width - 160,
      height: 38,
      fontFamily: font === 'Georgia' ? 'Cinzel' : font,
      fontSize: 24,
      fontWeight: '800',
      color: primary,
      textAlign: 'center',
      textTransform: 'uppercase',
      letterSpacing: 2,
      zIndex: 11
    },
    // Department Subhead
    {
      id: 'el-org-dept',
      name: 'Department & Authority Subhead',
      type: 'dynamic-field',
      fieldKey: 'orgDepartment',
      fallbackText: org?.department || 'Executive Continuing Education',
      x: 100,
      y: 165,
      width: width - 200,
      height: 24,
      fontFamily: 'JetBrains Mono',
      fontSize: 10,
      fontWeight: '600',
      color: '#64748B',
      textAlign: 'center',
      textTransform: 'uppercase',
      letterSpacing: 3,
      zIndex: 12
    },
    // Preamble Subtitle
    {
      id: 'el-preamble',
      name: 'Preamble Statement',
      type: 'text',
      text: tpl.customSubtitle || 'This is to officially certify that the candidate has satisfactorily completed',
      x: 120,
      y: 200,
      width: width - 240,
      height: 30,
      fontFamily: font === 'Georgia' ? 'Playfair Display' : 'Plus Jakarta Sans',
      fontSize: 14,
      fontStyle: font === 'Georgia' ? 'italic' : 'normal',
      color: '#475569',
      textAlign: 'center',
      lineHeight: 1.4,
      zIndex: 13
    },
    // Candidate Name
    {
      id: 'el-candidate-name',
      name: 'Candidate Name',
      type: 'dynamic-field',
      fieldKey: 'candidateName',
      fallbackText: 'Candidate Full Name',
      x: 80,
      y: 245,
      width: width - 160,
      height: 55,
      fontFamily: font === 'Georgia' ? 'Playfair Display' : 'Sora',
      fontSize: 34,
      fontWeight: '700',
      color: primary,
      textAlign: 'center',
      zIndex: 14
    },
    // Candidate ID Subhead
    {
      id: 'el-candidate-id',
      name: 'Candidate ID Tag',
      type: 'dynamic-field',
      fieldKey: 'candidateId',
      prefix: 'Candidate Verification ID: ',
      fallbackText: 'CAND-2026-0891',
      x: 100,
      y: 305,
      width: width - 200,
      height: 20,
      fontFamily: 'JetBrains Mono',
      fontSize: 10,
      color: '#64748B',
      textAlign: 'center',
      zIndex: 15
    },
    // Conferred Text
    {
      id: 'el-conferred',
      name: 'Conferred Text',
      type: 'text',
      text: 'has demonstrated technical mastery and fulfilled all requirements for the professional award of',
      x: 100,
      y: 335,
      width: width - 200,
      height: 26,
      fontFamily: 'Plus Jakarta Sans',
      fontSize: 12,
      color: '#64748B',
      textAlign: 'center',
      zIndex: 16
    },
    // Course Name Pill / Box
    {
      id: 'el-course-box',
      name: 'Course Title Box',
      type: 'shape',
      shapeType: 'rounded-rectangle',
      x: width / 2 - 280,
      y: 370,
      width: 560,
      height: 48,
      fill: `${secondary}0D`,
      stroke: `${secondary}40`,
      strokeWidth: 1,
      borderRadius: 4,
      zIndex: 17
    },
    // Course Name Dynamic Field
    {
      id: 'el-course-name',
      name: 'Course Title',
      type: 'dynamic-field',
      fieldKey: 'courseName',
      fallbackText: 'Executive AI & Deep Learning Strategy',
      x: width / 2 - 270,
      y: 378,
      width: 540,
      height: 32,
      fontFamily: font,
      fontSize: 18,
      fontWeight: '700',
      color: secondary,
      textAlign: 'center',
      zIndex: 18
    }
  ];

  // Optional Grade
  if (tpl.showGrade) {
    elements.push({
      id: 'el-grade',
      name: 'Distinction / Grade',
      type: 'dynamic-field',
      fieldKey: 'grade',
      fallbackText: 'Awarded with High Honors (Distinction A+)',
      x: 100,
      y: 430,
      width: width - 200,
      height: 24,
      fontFamily: 'Playfair Display',
      fontSize: 13,
      fontStyle: 'italic',
      fontWeight: '600',
      color: secondary,
      textAlign: 'center',
      zIndex: 19
    });
  }

  // Signatory
  if (tpl.showSignatures) {
    elements.push({
      id: 'el-signature-01',
      name: 'Dean Signature Line',
      type: 'signature',
      signatureType: 'calligraphy',
      signatoryIndex: 0,
      x: 90,
      y: height - 165,
      width: 220,
      height: 65,
      zIndex: 20
    });
  }

  // Seal
  if (tpl.showBadge) {
    elements.push({
      id: 'el-seal-badge',
      name: 'iCertiX Sovereign Seal',
      type: 'seal',
      sealType: tpl.theme === 'tech-gold' ? 'gold-crest' : tpl.theme === 'emerald-crest' ? 'emerald-sovereign' : 'minimal-icertix',
      x: width / 2 - 35,
      y: height - 170,
      width: 70,
      height: 70,
      zIndex: 21
    });
  }

  // QR Code (Mandatory verification element on every certificate)
  elements.push({
    id: 'el-qr-code',
    name: 'Verification QR',
    type: 'qr',
    fieldKey: 'verificationQr',
    x: width - 175,
    y: height - 170,
    width: 70,
    height: 70,
    qrFgColor: primary,
    qrBgColor: '#FFFFFF',
    qrShowLabel: true,
    zIndex: 22
  });

  // Cryptographic Footer Digest
  elements.push({
    id: 'el-crypto-footer',
    name: 'Crypto Digest Footer',
    type: 'dynamic-field',
    fieldKey: 'hashDigest',
    prefix: 'SHA-256 Vector Digest: ',
    fallbackText: '0x8f4c2e91a0b3d68471e9823f4b5a6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b',
    x: 60,
    y: height - 50,
    width: width - 120,
    height: 18,
    fontFamily: 'JetBrains Mono',
    fontSize: 9,
    color: '#94A3B8',
    textAlign: 'center',
    zIndex: 25
  });

  return {
    id: `DSG-${tpl.id}`,
    templateId: tpl.id,
    name: tpl.name,
    version: tpl.currentVersion || 1,
    status: 'PUBLISHED',
    category: tpl.theme === 'classic-diploma' ? 'Academic' : tpl.theme === 'tech-gold' ? 'Achievement' : 'Course Completion',
    page: {
      size: 'A4',
      orientation: tpl.orientation,
      width,
      height
    },
    background: {
      type: 'color',
      value: '#FFFFFF',
      opacity: 100
    },
    elements,
    meta: {
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      publishedAt: new Date().toISOString(),
      author: orgName,
      description: `Default ${tpl.name} layout`
    }
  };
}

// Convert StudioDesignSchema back to legacy CertificateTemplate
export function designSchemaToLegacyTemplate(
  schema: StudioDesignSchema,
  organisationId: string
): CertificateTemplate {
  // Extract primary & secondary colors from dominant elements
  let primaryColor = '#0A2540';
  let secondaryColor = '#0284C7';
  let fontFamily = 'Sora';
  let customHeading = '';
  let customSubtitle = '';
  let showQrCode = false;
  let showGrade = false;
  let showSignatures = false;
  let showBadge = false;

  schema.elements.forEach(el => {
    if (el.type === 'qr') showQrCode = true;
    if (el.type === 'seal') showBadge = true;
    if (el.type === 'signature') showSignatures = true;
    if (el.fieldKey === 'grade') showGrade = true;
    if (el.fieldKey === 'orgName' && el.text) customHeading = el.text;
    if (el.id === 'el-preamble' && el.text) customSubtitle = el.text;
    if (el.color && el.fieldKey === 'candidateName') primaryColor = el.color;
    if (el.color && el.fieldKey === 'courseName') secondaryColor = el.color;
    if (el.fontFamily && el.fieldKey === 'candidateName') fontFamily = el.fontFamily;
  });

  return {
    id: schema.templateId || schema.id || `TPL_${Date.now().toString().slice(-4)}`,
    organisationId,
    name: schema.name,
    theme: 'modern-minimal',
    orientation: schema.page.orientation,
    primaryColor,
    secondaryColor,
    fontFamily,
    showQrCode,
    showScore: true,
    showGrade,
    showSignatures,
    showBadge,
    customHeading: customHeading || undefined,
    customSubtitle: customSubtitle || undefined,
    currentVersion: schema.version,
    latestVersionId: schema.id,
    schema: schema
  };
}

// 12 Professional Pre-Built Templates Catalog
export const PREBUILT_TEMPLATES_CATALOG: PrebuiltTemplatePreset[] = [
  {
    id: 'PRESET-ACADEMIC-DIPLOMA',
    name: 'Classic Academic Degree & Diploma',
    description: 'Gold foil ornate framing, traditional serif typography, dual HSM registrar signatures, and central sovereign seal.',
    category: 'Academic',
    thumbnailTheme: 'classic-diploma',
    orientation: 'landscape',
    pageSize: 'A4',
    badgeColor: '#8C1515',
    primaryColor: '#8C1515',
    secondaryColor: '#D97706',
    schema: {
      id: 'DSG-PRESET-01',
      templateId: 'PRESET-ACADEMIC-DIPLOMA',
      name: 'Classic Academic Degree & Diploma',
      version: 1,
      status: 'PUBLISHED',
      category: 'Academic',
      page: { width: 1000, height: 707, size: 'A4', orientation: 'landscape' },
      background: { type: 'color', value: '#FCFAF7', patternType: 'parchment-texture', opacity: 100 },
      elements: [
        {
          id: 'p1-border-outer',
          name: 'Diploma Double Border',
          type: 'shape',
          shapeType: 'rectangle',
          x: 25,
          y: 25,
          width: 950,
          height: 657,
          fill: 'transparent',
          stroke: '#8C1515',
          strokeWidth: 4,
          zIndex: 1
        },
        {
          id: 'p1-border-inner',
          name: 'Gold Inner Accent',
          type: 'shape',
          shapeType: 'rectangle',
          x: 35,
          y: 35,
          width: 930,
          height: 637,
          fill: 'transparent',
          stroke: '#D97706',
          strokeWidth: 1.5,
          zIndex: 2
        },
        {
          id: 'p1-org-name',
          name: 'University Authority',
          type: 'dynamic-field',
          fieldKey: 'orgName',
          text: 'STANFORD UNIVERSITY',
          fallbackText: 'STANFORD UNIVERSITY',
          x: 100,
          y: 65,
          width: 800,
          height: 42,
          fontFamily: 'Cinzel',
          fontSize: 28,
          fontWeight: '900',
          color: '#8C1515',
          textAlign: 'center',
          letterSpacing: 3,
          zIndex: 10
        },
        {
          id: 'p1-dept',
          name: 'Department Header',
          type: 'dynamic-field',
          fieldKey: 'orgDepartment',
          fallbackText: 'Board of Trustees & Faculty of the School of Engineering',
          x: 100,
          y: 112,
          width: 800,
          height: 22,
          fontFamily: 'JetBrains Mono',
          fontSize: 11,
          fontWeight: '600',
          color: '#78350F',
          textAlign: 'center',
          textTransform: 'uppercase',
          letterSpacing: 2,
          zIndex: 11
        },
        {
          id: 'p1-preamble',
          name: 'Conferral Preamble',
          type: 'text',
          text: 'Be it known that by the sovereign academic authority vested in the Faculty and Provost',
          x: 120,
          y: 155,
          width: 760,
          height: 28,
          fontFamily: 'Playfair Display',
          fontSize: 15,
          fontStyle: 'italic',
          color: '#451A03',
          textAlign: 'center',
          zIndex: 12
        },
        {
          id: 'p1-cand-name',
          name: 'Candidate Full Name',
          type: 'dynamic-field',
          fieldKey: 'candidateName',
          fallbackText: 'Rahul Kumar',
          x: 80,
          y: 195,
          width: 840,
          height: 62,
          fontFamily: 'Playfair Display',
          fontSize: 40,
          fontWeight: '700',
          color: '#8C1515',
          textAlign: 'center',
          textDecoration: 'underline',
          zIndex: 13
        },
        {
          id: 'p1-reason',
          name: 'Degree Reason',
          type: 'text',
          text: 'has successfully completed all prescribed courses of study and is hereby admitted to the Honors Credential in',
          x: 100,
          y: 275,
          width: 800,
          height: 26,
          fontFamily: 'Plus Jakarta Sans',
          fontSize: 13,
          color: '#52525B',
          textAlign: 'center',
          zIndex: 14
        },
        {
          id: 'p1-course',
          name: 'Course & Degree Title',
          type: 'dynamic-field',
          fieldKey: 'courseName',
          fallbackText: 'Executive AI & Deep Learning Strategy',
          x: 80,
          y: 310,
          width: 840,
          height: 45,
          fontFamily: 'Cinzel',
          fontSize: 22,
          fontWeight: '700',
          color: '#B45309',
          textAlign: 'center',
          zIndex: 15
        },
        {
          id: 'p1-grade',
          name: 'Distinction & Honors',
          type: 'dynamic-field',
          fieldKey: 'grade',
          fallbackText: 'Awarded with Highest Distinction • GPA 4.0',
          x: 100,
          y: 365,
          width: 800,
          height: 24,
          fontFamily: 'Playfair Display',
          fontSize: 14,
          fontStyle: 'italic',
          color: '#8C1515',
          textAlign: 'center',
          zIndex: 16
        },
        {
          id: 'p1-sig1',
          name: 'Dean Signature',
          type: 'signature',
          signatureType: 'calligraphy',
          signatoryIndex: 0,
          x: 80,
          y: 520,
          width: 240,
          height: 70,
          zIndex: 20
        },
        {
          id: 'p1-seal',
          name: 'University Sovereign Gold Crest',
          type: 'seal',
          sealType: 'gold-crest',
          x: 465,
          y: 505,
          width: 70,
          height: 70,
          zIndex: 21
        },
        {
          id: 'p1-qr',
          name: 'Cryptographic QR',
          type: 'qr',
          fieldKey: 'verificationQr',
          x: 830,
          y: 505,
          width: 75,
          height: 75,
          qrFgColor: '#8C1515',
          qrBgColor: '#FFFFFF',
          qrShowLabel: true,
          zIndex: 22
        },
        {
          id: 'p1-digest',
          name: 'Cryptographic Proof',
          type: 'dynamic-field',
          fieldKey: 'hashDigest',
          prefix: 'HSM Signature Digest: ',
          fallbackText: '0x8f4c2e91a0b3d68471e9823f4b5a6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b',
          x: 50,
          y: 655,
          width: 900,
          height: 18,
          fontFamily: 'JetBrains Mono',
          fontSize: 9,
          color: '#9CA3AF',
          textAlign: 'center',
          zIndex: 25
        }
      ],
      meta: {
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        author: 'Stanford University Design Board',
        tags: ['academic', 'diploma', 'gold-seal']
      }
    }
  },
  {
    id: 'PRESET-TECH-MINIMALIST',
    name: 'Executive Tech & Modern Minimalist',
    description: 'Clean high-contrast layout, geometric Sora typography, cyan accent bars, and contemporary data layout.',
    category: 'Course Completion',
    thumbnailTheme: 'modern-minimal',
    orientation: 'landscape',
    pageSize: 'A4',
    badgeColor: '#0284C7',
    primaryColor: '#0A2540',
    secondaryColor: '#0284C7',
    schema: {
      id: 'DSG-PRESET-02',
      templateId: 'PRESET-TECH-MINIMALIST',
      name: 'Executive Tech & Modern Minimalist',
      version: 1,
      status: 'PUBLISHED',
      category: 'Course Completion',
      page: { width: 1000, height: 707, size: 'A4', orientation: 'landscape' },
      background: { type: 'color', value: '#FFFFFF', opacity: 100 },
      elements: [
        {
          id: 'p2-top-bar',
          name: 'Accent Header Bar',
          type: 'shape',
          shapeType: 'rectangle',
          x: 0,
          y: 0,
          width: 1000,
          height: 12,
          fill: '#0284C7',
          zIndex: 1
        },
        {
          id: 'p2-bottom-bar',
          name: 'Accent Footer Bar',
          type: 'shape',
          shapeType: 'rectangle',
          x: 0,
          y: 695,
          width: 1000,
          height: 12,
          fill: '#0A2540',
          zIndex: 1
        },
        {
          id: 'p2-org',
          name: 'Organisation Header',
          type: 'dynamic-field',
          fieldKey: 'orgName',
          text: 'iCertiX Academy of Cloud Computing',
          fallbackText: 'iCertiX Academy of Cloud Computing',
          x: 80,
          y: 60,
          width: 840,
          height: 36,
          fontFamily: 'Sora',
          fontSize: 24,
          fontWeight: '800',
          color: '#0A2540',
          textAlign: 'left',
          zIndex: 10
        },
        {
          id: 'p2-title',
          name: 'Certificate Subtitle',
          type: 'text',
          text: 'OFFICIAL CERTIFICATE OF COURSE COMPLETION',
          x: 80,
          y: 105,
          width: 840,
          height: 22,
          fontFamily: 'JetBrains Mono',
          fontSize: 11,
          fontWeight: '700',
          color: '#0284C7',
          letterSpacing: 2,
          zIndex: 11
        },
        {
          id: 'p2-divider-1',
          name: 'Section Divider',
          type: 'shape',
          shapeType: 'line',
          x: 80,
          y: 140,
          width: 840,
          height: 2,
          stroke: '#E2E8F0',
          strokeWidth: 2,
          zIndex: 5
        },
        {
          id: 'p2-preamble',
          name: 'Conferral Preamble',
          type: 'text',
          text: 'This certificate verifies that the individual named below has successfully met all curriculum milestones and rigorous practical lab evaluations:',
          x: 80,
          y: 165,
          width: 840,
          height: 35,
          fontFamily: 'Plus Jakarta Sans',
          fontSize: 14,
          color: '#64748B',
          textAlign: 'left',
          zIndex: 12
        },
        {
          id: 'p2-cand-name',
          name: 'Candidate Name',
          type: 'dynamic-field',
          fieldKey: 'candidateName',
          fallbackText: 'Rahul Kumar',
          x: 80,
          y: 215,
          width: 840,
          height: 52,
          fontFamily: 'Sora',
          fontSize: 36,
          fontWeight: '800',
          color: '#0A2540',
          textAlign: 'left',
          zIndex: 13
        },
        {
          id: 'p2-course-box',
          name: 'Course Spec Box',
          type: 'shape',
          shapeType: 'rounded-rectangle',
          x: 80,
          y: 285,
          width: 840,
          height: 90,
          fill: '#F8FAFC',
          stroke: '#E2E8F0',
          strokeWidth: 1,
          borderRadius: 8,
          zIndex: 6
        },
        {
          id: 'p2-course-name',
          name: 'Course Title',
          type: 'dynamic-field',
          fieldKey: 'courseName',
          fallbackText: 'Executive AI & Deep Learning Strategy',
          x: 105,
          y: 300,
          width: 790,
          height: 30,
          fontFamily: 'Sora',
          fontSize: 20,
          fontWeight: '700',
          color: '#0284C7',
          zIndex: 14
        },
        {
          id: 'p2-course-details',
          name: 'Course Duration & Department',
          type: 'dynamic-field',
          fieldKey: 'duration',
          prefix: 'Program Scope: ',
          fallbackText: '12 Weeks (120 Hours Intensive)',
          x: 105,
          y: 338,
          width: 790,
          height: 22,
          fontFamily: 'Plus Jakarta Sans',
          fontSize: 12,
          color: '#64748B',
          zIndex: 15
        },
        {
          id: 'p2-sig',
          name: 'Director Signature',
          type: 'signature',
          signatureType: 'calligraphy',
          signatoryIndex: 0,
          x: 80,
          y: 490,
          width: 240,
          height: 65,
          zIndex: 20
        },
        {
          id: 'p2-seal',
          name: 'Verified Hologram Seal',
          type: 'seal',
          sealType: 'minimal-icertix',
          x: 460,
          y: 480,
          width: 70,
          height: 70,
          zIndex: 21
        },
        {
          id: 'p2-qr',
          name: 'Verification QR',
          type: 'qr',
          fieldKey: 'verificationQr',
          x: 835,
          y: 480,
          width: 75,
          height: 75,
          qrFgColor: '#0A2540',
          qrBgColor: '#FFFFFF',
          qrShowLabel: true,
          zIndex: 22
        }
      ],
      meta: {
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        author: 'iCertiX Design System',
        tags: ['modern', 'minimal', 'tech', 'clean']
      }
    }
  },
  {
    id: 'PRESET-MIT-GOLD',
    name: 'MIT Tech Gold Distinction Award',
    description: 'Dark obsidian background, metallic gold accents, cryptographic seal, and technical achievement styling.',
    category: 'Achievement',
    thumbnailTheme: 'tech-gold',
    orientation: 'landscape',
    pageSize: 'A4',
    badgeColor: '#F59E0B',
    primaryColor: '#09090B',
    secondaryColor: '#F59E0B',
    schema: {
      id: 'DSG-PRESET-03',
      templateId: 'PRESET-MIT-GOLD',
      name: 'MIT Tech Gold Distinction Award',
      version: 1,
      status: 'PUBLISHED',
      category: 'Achievement',
      page: { width: 1000, height: 707, size: 'A4', orientation: 'landscape' },
      background: { type: 'color', value: '#09090B', opacity: 100 },
      elements: [
        {
          id: 'p3-gold-frame',
          name: 'Gold Border Frame',
          type: 'shape',
          shapeType: 'rectangle',
          x: 30,
          y: 30,
          width: 940,
          height: 647,
          fill: 'transparent',
          stroke: '#F59E0B',
          strokeWidth: 2.5,
          borderRadius: 4,
          zIndex: 1
        },
        {
          id: 'p3-inner-frame',
          name: 'Inner Obsidian Border',
          type: 'shape',
          shapeType: 'rectangle',
          x: 40,
          y: 40,
          width: 920,
          height: 627,
          fill: 'transparent',
          stroke: '#27272A',
          strokeWidth: 1,
          zIndex: 2
        },
        {
          id: 'p3-org',
          name: 'Institute Header',
          type: 'dynamic-field',
          fieldKey: 'orgName',
          text: 'MASSACHUSETTS INSTITUTE OF TECHNOLOGY',
          fallbackText: 'MASSACHUSETTS INSTITUTE OF TECHNOLOGY',
          x: 80,
          y: 70,
          width: 840,
          height: 38,
          fontFamily: 'Cinzel',
          fontSize: 24,
          fontWeight: '900',
          color: '#F59E0B',
          textAlign: 'center',
          letterSpacing: 4,
          zIndex: 10
        },
        {
          id: 'p3-sub',
          name: 'Award Subtitle',
          type: 'text',
          text: 'PROFESSIONAL CREDENTIAL OF TECHNICAL MASTERY',
          x: 80,
          y: 115,
          width: 840,
          height: 22,
          fontFamily: 'JetBrains Mono',
          fontSize: 11,
          fontWeight: '700',
          color: '#A1A1AA',
          textAlign: 'center',
          letterSpacing: 3,
          zIndex: 11
        },
        {
          id: 'p3-preamble',
          name: 'Preamble',
          type: 'text',
          text: 'In recognition of outstanding technical contribution and research excellence, this credential is conferred upon',
          x: 100,
          y: 165,
          width: 800,
          height: 30,
          fontFamily: 'Plus Jakarta Sans',
          fontSize: 14,
          color: '#D4D4D8',
          textAlign: 'center',
          zIndex: 12
        },
        {
          id: 'p3-cand-name',
          name: 'Candidate Name',
          type: 'dynamic-field',
          fieldKey: 'candidateName',
          fallbackText: 'Rahul Kumar',
          x: 80,
          y: 210,
          width: 840,
          height: 55,
          fontFamily: 'Cinzel',
          fontSize: 38,
          fontWeight: '800',
          color: '#FFFFFF',
          textAlign: 'center',
          zIndex: 13
        },
        {
          id: 'p3-course',
          name: 'Course / Track',
          type: 'dynamic-field',
          fieldKey: 'courseName',
          fallbackText: 'Quantum Computing & Post-Quantum Cryptography',
          x: 80,
          y: 295,
          width: 840,
          height: 40,
          fontFamily: 'Sora',
          fontSize: 22,
          fontWeight: '700',
          color: '#F59E0B',
          textAlign: 'center',
          zIndex: 14
        },
        {
          id: 'p3-grade',
          name: 'Grade Distinction',
          type: 'dynamic-field',
          fieldKey: 'grade',
          fallbackText: 'Summa Cum Laude (Top 1% Class Rank)',
          x: 100,
          y: 350,
          width: 800,
          height: 24,
          fontFamily: 'JetBrains Mono',
          fontSize: 13,
          color: '#E4E4E7',
          textAlign: 'center',
          zIndex: 15
        },
        {
          id: 'p3-sig',
          name: 'Faculty Signature',
          type: 'signature',
          signatureType: 'hsm-digital',
          signatoryIndex: 0,
          x: 90,
          y: 505,
          width: 240,
          height: 70,
          color: '#FFFFFF',
          zIndex: 20
        },
        {
          id: 'p3-seal',
          name: 'Gold Crest Seal',
          type: 'seal',
          sealType: 'gold-crest',
          x: 465,
          y: 495,
          width: 70,
          height: 70,
          zIndex: 21
        },
        {
          id: 'p3-qr',
          name: 'Verification QR',
          type: 'qr',
          fieldKey: 'verificationQr',
          x: 830,
          y: 495,
          width: 75,
          height: 75,
          qrFgColor: '#09090B',
          qrBgColor: '#F59E0B',
          qrShowLabel: true,
          zIndex: 22
        }
      ],
      meta: {
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        author: 'MIT EECS Board',
        tags: ['dark', 'gold', 'achievement', 'quantum']
      }
    }
  },
  {
    id: 'PRESET-OXFORD-CREST',
    name: 'Oxford Sovereign Crest Fellowship',
    description: 'Deep navy and emerald heraldic styling, traditional academic authority, and formal sovereign stamps.',
    category: 'Professional',
    thumbnailTheme: 'emerald-crest',
    orientation: 'landscape',
    pageSize: 'A4',
    badgeColor: '#059669',
    primaryColor: '#002147',
    secondaryColor: '#059669',
    schema: {
      id: 'DSG-PRESET-04',
      templateId: 'PRESET-OXFORD-CREST',
      name: 'Oxford Sovereign Crest Fellowship',
      version: 1,
      status: 'PUBLISHED',
      category: 'Professional',
      page: { width: 1000, height: 707, size: 'A4', orientation: 'landscape' },
      background: { type: 'color', value: '#F8FAFC', opacity: 100 },
      elements: [
        {
          id: 'p4-navy-border',
          name: 'Navy Outer Border',
          type: 'shape',
          shapeType: 'rectangle',
          x: 25,
          y: 25,
          width: 950,
          height: 657,
          fill: 'transparent',
          stroke: '#002147',
          strokeWidth: 4,
          zIndex: 1
        },
        {
          id: 'p4-emerald-border',
          name: 'Emerald Inner Border',
          type: 'shape',
          shapeType: 'rectangle',
          x: 35,
          y: 35,
          width: 930,
          height: 637,
          fill: 'transparent',
          stroke: '#059669',
          strokeWidth: 1.5,
          zIndex: 2
        },
        {
          id: 'p4-org',
          name: 'University of Oxford',
          type: 'dynamic-field',
          fieldKey: 'orgName',
          text: 'UNIVERSITY OF OXFORD',
          fallbackText: 'UNIVERSITY OF OXFORD',
          x: 80,
          y: 65,
          width: 840,
          height: 40,
          fontFamily: 'Cinzel',
          fontSize: 26,
          fontWeight: '900',
          color: '#002147',
          textAlign: 'center',
          letterSpacing: 4,
          zIndex: 10
        },
        {
          id: 'p4-dept',
          name: 'Department Header',
          type: 'dynamic-field',
          fieldKey: 'orgDepartment',
          fallbackText: 'Department of Computer Science & Advanced Information Security',
          x: 80,
          y: 110,
          width: 840,
          height: 22,
          fontFamily: 'JetBrains Mono',
          fontSize: 10,
          fontWeight: '600',
          color: '#059669',
          textAlign: 'center',
          letterSpacing: 2,
          zIndex: 11
        },
        {
          id: 'p4-preamble',
          name: 'Preamble',
          type: 'text',
          text: 'By resolution of the Board of Examiners and Sovereign Fellowship Council, this credential is conferred on',
          x: 100,
          y: 155,
          width: 800,
          height: 28,
          fontFamily: 'Playfair Display',
          fontSize: 14,
          fontStyle: 'italic',
          color: '#334155',
          textAlign: 'center',
          zIndex: 12
        },
        {
          id: 'p4-cand-name',
          name: 'Candidate Name',
          type: 'dynamic-field',
          fieldKey: 'candidateName',
          fallbackText: 'Rahul Kumar',
          x: 80,
          y: 195,
          width: 840,
          height: 60,
          fontFamily: 'Playfair Display',
          fontSize: 38,
          fontWeight: '700',
          color: '#002147',
          textAlign: 'center',
          zIndex: 13
        },
        {
          id: 'p4-course',
          name: 'Course Title',
          type: 'dynamic-field',
          fieldKey: 'courseName',
          fallbackText: 'Cybersecurity Governance & Information Security Leadership',
          x: 80,
          y: 290,
          width: 840,
          height: 42,
          fontFamily: 'Cinzel',
          fontSize: 20,
          fontWeight: '700',
          color: '#059669',
          textAlign: 'center',
          zIndex: 14
        },
        {
          id: 'p4-sig',
          name: 'Dean Signature',
          type: 'signature',
          signatureType: 'calligraphy',
          signatoryIndex: 0,
          x: 80,
          y: 505,
          width: 240,
          height: 70,
          zIndex: 20
        },
        {
          id: 'p4-seal',
          name: 'Emerald Sovereign Crest',
          type: 'seal',
          sealType: 'emerald-sovereign',
          x: 465,
          y: 495,
          width: 70,
          height: 70,
          zIndex: 21
        },
        {
          id: 'p4-qr',
          name: 'Verification QR',
          type: 'qr',
          fieldKey: 'verificationQr',
          x: 830,
          y: 495,
          width: 75,
          height: 75,
          qrFgColor: '#002147',
          qrBgColor: '#FFFFFF',
          qrShowLabel: true,
          zIndex: 22
        }
      ],
      meta: {
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        author: 'University of Oxford Faculty',
        tags: ['academic', 'emerald', 'sovereign', 'leadership']
      }
    }
  },
  {
    id: 'PRESET-CLOUD-AI',
    name: 'Cloud & AI Professional Certification',
    description: 'Designed for AWS / Cloud / DevOps / AI certifications with verified badges and technical competence details.',
    category: 'Cloud & AI',
    thumbnailTheme: 'modern-minimal',
    orientation: 'landscape',
    pageSize: 'A4',
    badgeColor: '#FF9900',
    primaryColor: '#232F3E',
    secondaryColor: '#FF9900',
    schema: {
      id: 'DSG-PRESET-05',
      templateId: 'PRESET-CLOUD-AI',
      name: 'Cloud & AI Professional Certification',
      version: 1,
      status: 'PUBLISHED',
      category: 'Cloud & AI',
      page: { width: 1000, height: 707, size: 'A4', orientation: 'landscape' },
      background: { type: 'color', value: '#FFFFFF', opacity: 100 },
      elements: [
        {
          id: 'p5-accent-side',
          name: 'Left Accent Stripe',
          type: 'shape',
          shapeType: 'rectangle',
          x: 0,
          y: 0,
          width: 24,
          height: 707,
          fill: '#FF9900',
          zIndex: 1
        },
        {
          id: 'p5-org',
          name: 'Issuer Title',
          type: 'dynamic-field',
          fieldKey: 'orgName',
          text: 'Amazon Web Services Training & Certification',
          fallbackText: 'Amazon Web Services Training & Certification',
          x: 70,
          y: 60,
          width: 860,
          height: 34,
          fontFamily: 'Sora',
          fontSize: 22,
          fontWeight: '800',
          color: '#232F3E',
          textAlign: 'left',
          zIndex: 10
        },
        {
          id: 'p5-subhead',
          name: 'Subhead Badge',
          type: 'text',
          text: 'INDUSTRY STANDARD CLOUD ARCHITECT CREDENTIAL',
          x: 70,
          y: 100,
          width: 860,
          height: 20,
          fontFamily: 'JetBrains Mono',
          fontSize: 10,
          fontWeight: '700',
          color: '#FF9900',
          letterSpacing: 2,
          zIndex: 11
        },
        {
          id: 'p5-cand-name',
          name: 'Candidate Full Name',
          type: 'dynamic-field',
          fieldKey: 'candidateName',
          fallbackText: 'Rahul Kumar',
          x: 70,
          y: 180,
          width: 860,
          height: 50,
          fontFamily: 'Sora',
          fontSize: 36,
          fontWeight: '800',
          color: '#232F3E',
          textAlign: 'left',
          zIndex: 13
        },
        {
          id: 'p5-course-name',
          name: 'Course Title',
          type: 'dynamic-field',
          fieldKey: 'courseName',
          fallbackText: 'AWS Certified Solutions Architect - Professional',
          x: 70,
          y: 260,
          width: 860,
          height: 40,
          fontFamily: 'Sora',
          fontSize: 22,
          fontWeight: '700',
          color: '#FF9900',
          zIndex: 14
        },
        {
          id: 'p5-score-badge',
          name: 'Validation Score',
          type: 'dynamic-field',
          fieldKey: 'score',
          prefix: 'Validated Examination Score: ',
          fallbackText: '940 / 1000 (Pass)',
          x: 70,
          y: 310,
          width: 860,
          height: 24,
          fontFamily: 'JetBrains Mono',
          fontSize: 12,
          color: '#64748B',
          zIndex: 15
        },
        {
          id: 'p5-sig',
          name: 'Signatory',
          type: 'signature',
          signatureType: 'hsm-digital',
          signatoryIndex: 0,
          x: 70,
          y: 490,
          width: 240,
          height: 65,
          zIndex: 20
        },
        {
          id: 'p5-qr',
          name: 'Verification QR',
          type: 'qr',
          fieldKey: 'verificationQr',
          x: 840,
          y: 480,
          width: 80,
          height: 80,
          qrFgColor: '#232F3E',
          qrBgColor: '#FFFFFF',
          qrShowLabel: true,
          zIndex: 22
        }
      ],
      meta: {
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        author: 'AWS Training & Certification',
        tags: ['cloud', 'aws', 'devops', 'architecture']
      }
    }
  },
  {
    id: 'PRESET-CORPORATE-EXECUTIVE',
    name: 'Corporate Leadership & Executive Excellence',
    description: 'Refined corporate executive certificate with charcoal typography and platinum border trim.',
    category: 'Corporate',
    thumbnailTheme: 'executive-navy',
    orientation: 'landscape',
    pageSize: 'A4',
    badgeColor: '#1E293B',
    primaryColor: '#0F172A',
    secondaryColor: '#475569',
    schema: {
      id: 'DSG-PRESET-06',
      templateId: 'PRESET-CORPORATE-EXECUTIVE',
      name: 'Corporate Leadership & Executive Excellence',
      version: 1,
      status: 'PUBLISHED',
      category: 'Corporate',
      page: { width: 1000, height: 707, size: 'A4', orientation: 'landscape' },
      background: { type: 'color', value: '#FFFFFF', opacity: 100 },
      elements: [
        {
          id: 'p6-border',
          name: 'Corporate Frame',
          type: 'shape',
          shapeType: 'rectangle',
          x: 30,
          y: 30,
          width: 940,
          height: 647,
          fill: 'transparent',
          stroke: '#0F172A',
          strokeWidth: 3,
          zIndex: 1
        },
        {
          id: 'p6-org',
          name: 'Company Authority',
          type: 'dynamic-field',
          fieldKey: 'orgName',
          text: 'Global Enterprise Leadership Institute',
          fallbackText: 'Global Enterprise Leadership Institute',
          x: 80,
          y: 70,
          width: 840,
          height: 38,
          fontFamily: 'Montserrat',
          fontSize: 24,
          fontWeight: '800',
          color: '#0F172A',
          textAlign: 'center',
          letterSpacing: 2,
          zIndex: 10
        },
        {
          id: 'p6-preamble',
          name: 'Preamble',
          type: 'text',
          text: 'In recognition of outstanding corporate governance, strategic thinking, and leadership execution, awarded to',
          x: 100,
          y: 150,
          width: 800,
          height: 30,
          fontFamily: 'Plus Jakarta Sans',
          fontSize: 14,
          color: '#64748B',
          textAlign: 'center',
          zIndex: 12
        },
        {
          id: 'p6-cand-name',
          name: 'Executive Name',
          type: 'dynamic-field',
          fieldKey: 'candidateName',
          fallbackText: 'Rahul Kumar',
          x: 80,
          y: 200,
          width: 840,
          height: 55,
          fontFamily: 'Montserrat',
          fontSize: 36,
          fontWeight: '700',
          color: '#0F172A',
          textAlign: 'center',
          zIndex: 13
        },
        {
          id: 'p6-course',
          name: 'Leadership Program',
          type: 'dynamic-field',
          fieldKey: 'courseName',
          fallbackText: 'Strategic Global Management & Boardroom Leadership',
          x: 80,
          y: 285,
          width: 840,
          height: 40,
          fontFamily: 'Sora',
          fontSize: 20,
          fontWeight: '700',
          color: '#334155',
          textAlign: 'center',
          zIndex: 14
        },
        {
          id: 'p6-sig',
          name: 'Board Chair Signature',
          type: 'signature',
          signatureType: 'calligraphy',
          signatoryIndex: 0,
          x: 80,
          y: 505,
          width: 240,
          height: 65,
          zIndex: 20
        },
        {
          id: 'p6-seal',
          name: 'Corporate Seal',
          type: 'seal',
          sealType: 'corporate-blue',
          x: 465,
          y: 495,
          width: 70,
          height: 70,
          zIndex: 21
        },
        {
          id: 'p6-qr',
          name: 'Verification QR',
          type: 'qr',
          fieldKey: 'verificationQr',
          x: 830,
          y: 495,
          width: 75,
          height: 75,
          qrFgColor: '#0F172A',
          qrBgColor: '#FFFFFF',
          qrShowLabel: true,
          zIndex: 22
        }
      ],
      meta: {
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        author: 'Executive Education Board',
        tags: ['corporate', 'leadership', 'executive']
      }
    }
  },
  {
    id: 'PRESET-INTERNSHIP-HONORS',
    name: 'Internship & Fellowship Honors',
    description: 'Clean certificate layout tailored for university interns, apprenticeships, and summer fellowship programs.',
    category: 'Internship',
    thumbnailTheme: 'modern-minimal',
    orientation: 'landscape',
    pageSize: 'A4',
    badgeColor: '#0D9488',
    primaryColor: '#115E59',
    secondaryColor: '#0D9488',
    schema: {
      id: 'DSG-PRESET-07',
      templateId: 'PRESET-INTERNSHIP-HONORS',
      name: 'Internship & Fellowship Honors',
      version: 1,
      status: 'PUBLISHED',
      category: 'Internship',
      page: { width: 1000, height: 707, size: 'A4', orientation: 'landscape' },
      background: { type: 'color', value: '#F0FDFA', opacity: 100 },
      elements: [
        {
          id: 'p7-border',
          name: 'Teal Border',
          type: 'shape',
          shapeType: 'rectangle',
          x: 25,
          y: 25,
          width: 950,
          height: 657,
          fill: 'transparent',
          stroke: '#0D9488',
          strokeWidth: 2.5,
          borderRadius: 6,
          zIndex: 1
        },
        {
          id: 'p7-org',
          name: 'Host Organisation',
          type: 'dynamic-field',
          fieldKey: 'orgName',
          text: 'Google DeepMind Research Fellowship',
          fallbackText: 'Google DeepMind Research Fellowship',
          x: 80,
          y: 65,
          width: 840,
          height: 38,
          fontFamily: 'Sora',
          fontSize: 24,
          fontWeight: '800',
          color: '#115E59',
          textAlign: 'center',
          zIndex: 10
        },
        {
          id: 'p7-title',
          name: 'Certificate Title',
          type: 'text',
          text: 'CERTIFICATE OF INTERNSHIP & RESEARCH EXCELLENCE',
          x: 80,
          y: 110,
          width: 840,
          height: 22,
          fontFamily: 'JetBrains Mono',
          fontSize: 11,
          fontWeight: '700',
          color: '#0D9488',
          textAlign: 'center',
          letterSpacing: 2,
          zIndex: 11
        },
        {
          id: 'p7-cand-name',
          name: 'Intern Name',
          type: 'dynamic-field',
          fieldKey: 'candidateName',
          fallbackText: 'Rahul Kumar',
          x: 80,
          y: 195,
          width: 840,
          height: 55,
          fontFamily: 'Sora',
          fontSize: 36,
          fontWeight: '700',
          color: '#115E59',
          textAlign: 'center',
          zIndex: 13
        },
        {
          id: 'p7-course',
          name: 'Department & Project Track',
          type: 'dynamic-field',
          fieldKey: 'courseName',
          fallbackText: 'Autonomous Agentic Systems & Model Alignment',
          x: 80,
          y: 280,
          width: 840,
          height: 38,
          fontFamily: 'Plus Jakarta Sans',
          fontSize: 18,
          fontWeight: '700',
          color: '#0F766E',
          textAlign: 'center',
          zIndex: 14
        },
        {
          id: 'p7-sig',
          name: 'Mentor Signature',
          type: 'signature',
          signatureType: 'calligraphy',
          signatoryIndex: 0,
          x: 80,
          y: 505,
          width: 240,
          height: 65,
          zIndex: 20
        },
        {
          id: 'p7-seal',
          name: 'Verified Seal',
          type: 'seal',
          sealType: 'minimal-icertix',
          x: 465,
          y: 495,
          width: 70,
          height: 70,
          zIndex: 21
        },
        {
          id: 'p7-qr',
          name: 'Verification QR',
          type: 'qr',
          fieldKey: 'verificationQr',
          x: 830,
          y: 495,
          width: 75,
          height: 75,
          qrFgColor: '#115E59',
          qrBgColor: '#FFFFFF',
          qrShowLabel: true,
          zIndex: 22
        }
      ],
      meta: {
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        author: 'Research Fellowship Office',
        tags: ['internship', 'fellowship', 'research', 'teal']
      }
    }
  },
  {
    id: 'PRESET-WORKSHOP-PARTICIPATION',
    name: 'Professional Workshop & Masterclass',
    description: 'Warm modern layout for workshops, bootcamps, and executive seminar participation.',
    category: 'Workshop',
    thumbnailTheme: 'modern-minimal',
    orientation: 'landscape',
    pageSize: 'A4',
    badgeColor: '#7C3AED',
    primaryColor: '#4C1D95',
    secondaryColor: '#7C3AED',
    schema: {
      id: 'DSG-PRESET-08',
      templateId: 'PRESET-WORKSHOP-PARTICIPATION',
      name: 'Professional Workshop & Masterclass',
      version: 1,
      status: 'PUBLISHED',
      category: 'Workshop',
      page: { width: 1000, height: 707, size: 'A4', orientation: 'landscape' },
      background: { type: 'color', value: '#FAF5FF', opacity: 100 },
      elements: [
        {
          id: 'p8-border',
          name: 'Violet Border',
          type: 'shape',
          shapeType: 'rounded-rectangle',
          x: 25,
          y: 25,
          width: 950,
          height: 657,
          fill: 'transparent',
          stroke: '#7C3AED',
          strokeWidth: 2,
          borderRadius: 8,
          zIndex: 1
        },
        {
          id: 'p8-org',
          name: 'Institute Header',
          type: 'dynamic-field',
          fieldKey: 'orgName',
          text: 'Global AI Engineering Institute',
          fallbackText: 'Global AI Engineering Institute',
          x: 80,
          y: 65,
          width: 840,
          height: 38,
          fontFamily: 'Sora',
          fontSize: 24,
          fontWeight: '800',
          color: '#4C1D95',
          textAlign: 'center',
          zIndex: 10
        },
        {
          id: 'p8-title',
          name: 'Certificate of Attendance',
          type: 'text',
          text: 'CERTIFICATE OF ACTIVE PARTICIPATION',
          x: 80,
          y: 110,
          width: 840,
          height: 22,
          fontFamily: 'JetBrains Mono',
          fontSize: 11,
          fontWeight: '700',
          color: '#7C3AED',
          textAlign: 'center',
          letterSpacing: 2,
          zIndex: 11
        },
        {
          id: 'p8-cand-name',
          name: 'Participant Name',
          type: 'dynamic-field',
          fieldKey: 'candidateName',
          fallbackText: 'Rahul Kumar',
          x: 80,
          y: 195,
          width: 840,
          height: 55,
          fontFamily: 'Sora',
          fontSize: 36,
          fontWeight: '700',
          color: '#4C1D95',
          textAlign: 'center',
          zIndex: 13
        },
        {
          id: 'p8-course',
          name: 'Workshop Title',
          type: 'dynamic-field',
          fieldKey: 'courseName',
          fallbackText: 'Hands-On LLM Fine-Tuning & Multi-Agent Architecture Masterclass',
          x: 80,
          y: 280,
          width: 840,
          height: 38,
          fontFamily: 'Plus Jakarta Sans',
          fontSize: 18,
          fontWeight: '700',
          color: '#6D28D9',
          textAlign: 'center',
          zIndex: 14
        },
        {
          id: 'p8-sig',
          name: 'Lead Instructor',
          type: 'signature',
          signatureType: 'calligraphy',
          signatoryIndex: 0,
          x: 80,
          y: 505,
          width: 240,
          height: 65,
          zIndex: 20
        },
        {
          id: 'p8-seal',
          name: 'Silver Hologram',
          type: 'seal',
          sealType: 'silver-hologram',
          x: 465,
          y: 495,
          width: 70,
          height: 70,
          zIndex: 21
        },
        {
          id: 'p8-qr',
          name: 'Verification QR',
          type: 'qr',
          fieldKey: 'verificationQr',
          x: 830,
          y: 495,
          width: 75,
          height: 75,
          qrFgColor: '#4C1D95',
          qrBgColor: '#FFFFFF',
          qrShowLabel: true,
          zIndex: 22
        }
      ],
      meta: {
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        author: 'Masterclass Organizing Committee',
        tags: ['workshop', 'masterclass', 'hands-on', 'purple']
      }
    }
  }
];
