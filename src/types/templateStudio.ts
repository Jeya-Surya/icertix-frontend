import { TemplateTheme, Organisation } from '../types';

export type PageSize = 'A4' | 'A5' | 'Letter' | 'Custom';
export type PageOrientation = 'landscape' | 'portrait';

export interface PageDimensions {
  width: number;
  height: number;
  size: PageSize;
  orientation: PageOrientation;
}

export type ElementType = 
  | 'text' 
  | 'dynamic-field' 
  | 'shape' 
  | 'image' 
  | 'qr' 
  | 'seal' 
  | 'signature' 
  | 'line' 
  | 'frame';

export type DynamicFieldKey = 
  | 'candidateName'
  | 'candidateId'
  | 'candidateEmail'
  | 'courseName'
  | 'courseCode'
  | 'department'
  | 'duration'
  | 'certificateNumber'
  | 'credentialId'
  | 'issueDate'
  | 'completionDate'
  | 'expiryDate'
  | 'score'
  | 'grade'
  | 'orgName'
  | 'orgDepartment'
  | 'orgDomain'
  | 'orgLogo'
  | 'signatory1Name'
  | 'signatory1Role'
  | 'signatory1Key'
  | 'signatory2Name'
  | 'signatory2Role'
  | 'verificationQr'
  | 'verificationUrl'
  | 'hashDigest';

export interface StudioElement {
  id: string;
  name: string;
  type: ElementType;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation?: number; // in degrees (0 - 360)
  opacity?: number;  // 0 - 100
  locked?: boolean;
  hidden?: boolean;
  zIndex: number;

  // Dynamic field association
  isVariable?: boolean;
  customVariableKey?: string;
  fieldKey?: DynamicFieldKey;
  fallbackText?: string;
  prefix?: string;
  suffix?: string;

  // Typography (for text & dynamic fields)
  text?: string;
  fontFamily?: string;
  fontSize?: number;
  fontWeight?: string | number;
  fontStyle?: 'normal' | 'italic';
  textDecoration?: 'none' | 'underline' | 'line-through';
  textAlign?: 'left' | 'center' | 'right' | 'justify';
  color?: string;
  letterSpacing?: number; // px
  lineHeight?: number; // multiplier e.g. 1.2
  textTransform?: 'none' | 'uppercase' | 'capitalize' | 'lowercase';

  // Shapes & Frames
  shapeType?: 'rectangle' | 'rounded-rectangle' | 'circle' | 'line' | 'frame-border' | 'divider' | 'crest-badge';
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  strokeStyle?: 'solid' | 'dashed' | 'dotted' | 'double';
  borderRadius?: number;
  shadow?: {
    enabled: boolean;
    color: string;
    blur: number;
    offsetX: number;
    offsetY: number;
  };

  // Image & QR & Custom Seals
  src?: string;
  aspectRatioPreserved?: boolean;
  sealType?: 'gold-crest' | 'silver-hologram' | 'emerald-sovereign' | 'minimal-icertix' | 'corporate-blue';
  qrFgColor?: string;
  qrBgColor?: string;
  qrShowLabel?: boolean;
  qrLevel?: 'L' | 'M' | 'Q' | 'H';
  qrBorderRadius?: number;

  // Signature specifics
  signatureType?: 'calligraphy' | 'hsm-digital' | 'image' | 'dual-line';
  signatoryIndex?: number; // 0 or 1
}

export interface StudioBackground {
  type: 'color' | 'gradient' | 'pattern' | 'image';
  value: string; // Hex color or CSS gradient or pattern name or image data URL
  gradientDirection?: 'to-r' | 'to-b' | 'to-br' | 'radial';
  gradientEnd?: string;
  patternType?: 'none' | 'security-mesh' | 'parchment-texture' | 'subtle-grid' | 'guilloche-waves';
  opacity?: number;
  imageUrl?: string;
}

export interface StudioDesignSchema {
  id: string;
  templateId: string;
  name: string;
  version: number;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  category: TemplateCategory;
  organisationId?: string;
  organisationName?: string;
  publishedBy?: string;
  customizedBy?: string;
  page: PageDimensions;
  background: StudioBackground;
  elements: StudioElement[];
  meta: {
    createdAt: string;
    updatedAt: string;
    publishedAt?: string;
    publishedBy?: string;
    organisationId?: string;
    organisationName?: string;
    author: string;
    tags?: string[];
    description?: string;
  };
}

export type TemplateCategory = 
  | 'Academic'
  | 'Course Completion'
  | 'Training'
  | 'Professional'
  | 'Corporate'
  | 'Achievement'
  | 'Participation'
  | 'Internship'
  | 'Workshop'
  | 'Appreciation'
  | 'Cybersecurity'
  | 'Cloud & AI';

export interface PrebuiltTemplatePreset {
  id: string;
  name: string;
  description: string;
  category: TemplateCategory;
  thumbnailTheme: TemplateTheme;
  orientation: PageOrientation;
  pageSize: PageSize;
  badgeColor: string;
  primaryColor: string;
  secondaryColor: string;
  schema: StudioDesignSchema;
}

export interface DemoCandidateData {
  candidateName: string;
  candidateId: string;
  candidateEmail: string;
  courseName: string;
  courseCode: string;
  department: string;
  duration: string;
  certificateNumber: string;
  credentialId: string;
  issueDate: string;
  completionDate: string;
  expiryDate: string;
  score: string;
  grade: string;
  orgName: string;
  orgDepartment: string;
  orgDomain: string;
  orgLogo: string;
  signatory1Name: string;
  signatory1Role: string;
  signatory1Key: string;
  signatory2Name: string;
  signatory2Role: string;
  verificationQr: string;
  verificationUrl: string;
  hashDigest: string;
  [key: string]: any;
}
