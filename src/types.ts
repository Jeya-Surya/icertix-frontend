/**
 * iCertiX — Frontend Type Definitions
 * Aligned with backend shared/types and shared/enums contracts.
 */

export type UserPortal =
  | 'org'
  | 'platform-admin'
  | 'candidate'
  | 'verify'
  | 'login';

export type UserRole =
  | 'SUPER_ADMIN'
  | 'ORG_ADMIN'
  | 'CANDIDATE';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  organisationId?: string;
  candidateId?: string;
  title?: string;
  avatar?: string;
  status?: 'ACTIVE' | 'SUSPENDED';
  twoFactorEnabled?: boolean;
  permissions?: string[];
  lastLogin?: string;
}

/** Org portal tabs */
export type NavTab =
  | 'dashboard'
  | 'templates'
  | 'designer'
  | 'candidates'
  | 'generation'
  | 'registry'
  | 'emails'
  | 'audit'
  | 'subscription';

/** Platform admin tabs (SUPER_ADMIN / PLATFORM_ADMIN) */
export type PlatformNavTab =
  | 'platform-dashboard'
  | 'platform-orgs'
  | 'platform-users'
  | 'platform-credentials'
  | 'platform-audit'
  | 'platform-emails'
  | 'platform-subscriptions'
  | 'platform-analytics'
  | 'platform-settings';

export type CredentialStatus =
  | 'ACTIVE'
  | 'REVOKED'
  | 'EXPIRED'
  | 'SUSPENDED'
  | 'DRAFT'
  | 'INVALID'
  | 'PROCESSING';

export type PlanTier = 'Free' | 'Professional' | 'Enterprise';

export type EmailDeliveryStatus =
  | 'Delivered'
  | 'Opened'
  | 'Queued'
  | 'Bounced'
  | 'Failed'
  | 'Sent';

export type TemplateTheme = 'modern-minimal' | 'classic-diploma' | 'tech-gold' | 'executive-navy' | 'emerald-crest';

export interface Organisation {
  id: string;
  name: string;
  code: string;
  domain: string;
  department: string;
  logo: string;
  badgeColor: string;
  plan: PlanTier;
  status?: 'ACTIVE' | 'SUSPENDED' | 'PENDING';
  certificateQuota: {
    used: number;
    total: number;
  };
  features?: {
    apiAccess: boolean;
    whiteLabel: boolean;
    customDomain: boolean;
    sso: boolean;
    maxTemplates: number;
  };
  signatories: Array<{
    id: string;
    name: string;
    role: string;
    keyId: string;
  }>;
}

export interface Candidate {
  id: string;
  organisationId: string;
  name: string;
  email: string;
  studentId: string;
  department: string;
  status: 'Active' | 'Invited' | 'Completed' | 'Archived';
  avatar?: string;
  enrolledCourseIds?: string[];
  createdAt: string;
  updatedAt?: string;
}

export interface Course {
  id: string;
  organisationId: string;
  name: string;
  code: string;
  duration: string;
  category: string;
  instructor: string;
  skills?: string[];
}

export interface TemplateElement {
  id: string;
  type: 'text' | 'qr' | 'signature' | 'badge' | 'image' | 'date' | 'grade';
  field: string;
  x?: number;
  y?: number;
  fontSize?: number;
  align?: 'left' | 'center' | 'right';
  color?: string;
}

export interface TemplateVersion {
  versionId: string;
  templateId: string;
  versionNumber: number;
  createdAt: string;
  publishedBy: string;
  schema: {
    page: {
      width: number;
      height: number;
      orientation: 'landscape' | 'portrait';
    };
    theme: TemplateTheme;
    primaryColor: string;
    secondaryColor: string;
    fontFamily: string;
    elements: TemplateElement[];
    showQrCode: boolean;
    showScore: boolean;
    showGrade: boolean;
    showSignatures: boolean;
    showBadge: boolean;
    customHeading?: string;
    customSubtitle?: string;
  };
}

export interface CertificateTemplate {
  id: string;
  organisationId: string;
  name: string;
  theme: TemplateTheme;
  orientation: 'landscape' | 'portrait';
  primaryColor: string;
  secondaryColor: string;
  fontFamily: string;
  showQrCode: boolean;
  showScore: boolean;
  showGrade: boolean;
  showSignatures: boolean;
  showBadge: boolean;
  customHeading?: string;
  customSubtitle?: string;
  isDefault?: boolean;
  currentVersion?: number;
  latestVersionId?: string;
  status?: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  schema?: any;
}

export interface Credential {
  id: string;
  credentialId: string; // e.g. ICX-2026-7F8A91C2
  certificateNumber: string; // e.g. CERT-2026-000128
  organisationId: string;
  candidateId: string;
  courseId: string;
  templateId: string;
  templateVersionId?: string;
  designSchema?: any;
  customAttributes?: Record<string, any>;
  
  recipient: {
    name: string;
    email: string;
    studentId: string;
  };
  
  issuer: {
    name: string;
    department: string;
    code: string;
    verifiedDomain: string;
    logo?: string;
  };
  
  title: string;
  courseName: string;
  category: string;
  grade?: string;
  score?: number;
  issueDate: string;
  completionDate?: string;
  expiryDate?: string;
  status: CredentialStatus;
  skills: string[];
  description: string;
  
  crypto: {
    hashAlgorithm?: 'SHA-256';
    sha256Hash: string;
    signatureAlgorithm?: string;
    signatureHex: string;
    algorithm?: string;
    keyId: string;
    blockHeight?: number;
    merkleRoot?: string;
    canonicalPayloadJson?: string;
    signedAt?: string;
  };
  
  pdfKey?: string;
  verificationUrl?: string;

  emailDelivery: {
    status: 'Delivered' | 'Queued' | 'Opened' | 'Failed' | 'Sent' | 'Bounced';
    sentAt: string;
    messageId: string;
  };
  
  signatories: Array<{
    id: string;
    name: string;
    role: string;
    keyId: string;
  }>;
  
  revokedAt?: string;
  revocationReason?: string;
  revocationDetails?: {
    revokedAt: string;
    revokedBy: string;
    reason: string;
    txHash?: string;
  };
}

export interface EmailLog {
  id: string;
  organisationId: string;
  recipientEmail: string;
  recipientName: string;
  credentialId?: string;
  subject: string;
  status: EmailDeliveryStatus;
  sentAt?: string;
  deliveredAt?: string;
  openedAt?: string;
  errorMessage?: string;
  retryCount?: number;
  createdAt?: string;
  messageId?: string; // legacy
  provider?: 'AWS_SES' | 'MOCK_SES_DEV';
}

export interface AuditLog {
  id: string;
  organisationId?: string | null;
  actorId?: string;
  actor: string;
  actorRole?: UserRole;
  action: string;
  targetType?: string;
  targetId?: string;
  details: string;
  metadata?: Record<string, unknown>;
  ipAddress: string;
  userAgent?: string;
  timestamp: string;
}

export interface VerificationCheck {
  id?: string;
  name: string;
  description?: string;
  status?: 'passed' | 'failed' | 'checking' | 'idle';
  passed?: boolean;
  details?: string;
  timestamp?: string;
}

export interface PublicCredentialSummary {
  credentialId: string;
  certificateNumber: string;
  recipientName: string;
  issuerName: string;
  issuerCode: string;
  issuerDomain: string;
  courseName: string;
  title: string;
  category: string;
  grade?: string;
  score?: number;
  issueDate: string;
  completionDate?: string;
  expiryDate?: string;
  status: CredentialStatus;
  skills: string[];
  description: string;
  sha256Hash: string;
  signatureAlgorithm: string;
  keyId: string;
  revokedAt?: string;
  revocationReason?: string;
}

export interface VerificationResult {
  verified: boolean;
  status?: CredentialStatus;
  credential?: PublicCredentialSummary;
  fullCredential?: Credential;
  certificate?: Credential;
  checkedAt: string;
  verifier: string;
  checks: VerificationCheck[];
  tamperedFields?: string[];
  diagnosticMessage: string;
}

export interface PlatformMetrics {
  totalOrganisations: number;
  activeOrganisations: number;
  suspendedOrganisations: number;
  totalUsers: number;
  totalCandidates?: number;
  totalCredentials: number;
  activeCredentials: number;
  revokedCredentials: number;
  verificationSuccessRate: string;
  systemStatus: 'HEALTHY' | 'DEGRADED' | 'OUTAGE';
  recentAudits?: AuditLog[];
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  tier: PlanTier;
  monthlyPriceCents: number;
  annualPriceCents: number;
  certificateQuota: number;
  features: {
    apiAccess: boolean;
    whiteLabel: boolean;
    customDomain: boolean;
    sso: boolean;
    maxTemplates: number;
  };
}

export interface PlatformAnalytics {
  timeframe: string;
  kpis: {
    credentialsIssued: number;
    credentialsIssuedChange: string;
    activeOrganisations: number;
    totalOrganisations: number;
    totalUsers: number;
    newCandidates: number;
    candidatesChange: string;
    verificationRequests: number;
    verificationChange: string;
    emailDeliveryRate: string;
    emailDeliveryChange: string;
    revocations: number;
    revocationsChange: string;
  };
  issuanceTimeline: Array<{ date: string; count: number }>;
  statusBreakdown: {
    active: number;
    revoked: number;
    expired: number;
    draft: number;
    processing: number;
  };
  orgActivity: Array<{
    id: string;
    name: string;
    code: string;
    badgeColor: string;
    quotaUsed: number;
    quotaTotal: number;
    percentage: number;
    status: string;
    plan: string;
  }>;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    requestId?: string;
    details?: unknown;
  } | null;
}

export interface PaginatedResponse<T> {
  items: T[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}
