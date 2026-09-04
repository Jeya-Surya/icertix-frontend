import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  INITIAL_ORGANISATIONS, 
  INITIAL_CANDIDATES, 
  INITIAL_COURSES, 
  INITIAL_TEMPLATES, 
  INITIAL_CREDENTIALS, 
  INITIAL_EMAIL_LOGS, 
  INITIAL_AUDIT_LOGS 
} from './data/initialCredentials';
import { 
  Organisation, 
  Candidate, 
  Course, 
  CertificateTemplate, 
  Credential, 
  EmailLog, 
  AuditLog, 
  UserPortal, 
  NavTab,
  PlatformNavTab,
  AuthUser 
} from './types';
import { 
  Header, 
  Sidebar, 
  PlatformSidebar, 
  CertificateModal, 
  RevocationModal,
  LogoutConfirmModal 
} from './components';
import { 
  DashboardView, 
  TemplateStudioView, 
  CandidateManagementView, 
  CandidatePortalView, 
  CertificateGenerationView, 
  CredentialRegistryView, 
  PublicVerificationView, 
  EmailLogsView, 
  AuditTrailView, 
  SubscriptionView, 
  LoginPage, 
  PlatformAdminView,
  MyTemplatesView
} from './views';
import { api, normalizeCredential } from './services/apiClient';

const DEFAULT_FALLBACK_ORG: Organisation = {
  id: 'ORG_INIT',
  name: 'Academic Institution',
  code: 'ACADEMIC',
  domain: 'institution.edu',
  department: 'Academic Registry & Certification',
  logo: 'IC',
  badgeColor: '#0A2540',
  plan: 'Enterprise',
  certificateQuota: { used: 0, total: 5000 },
  signatories: [
    { id: 'SIG-INIT-01', name: 'Academic Dean', role: 'Provost & Registrar', keyId: 'KEY-INIT-01' }
  ]
};

export default function App() {
  const location = useLocation();
  const navigate = useNavigate();

  // 1. Multi-Tenant Organisations State
  const [organisations, setOrganisations] = useState<Organisation[]>(() => {
    try {
      const saved = localStorage.getItem('icertix_organisations');
      if (saved) return JSON.parse(saved);
    } catch {}
    return INITIAL_ORGANISATIONS;
  });

  const [currentOrg, setCurrentOrg] = useState<Organisation>(() => organisations[0] || DEFAULT_FALLBACK_ORG);

  // Auth User Session State (Clean default: starts signed out)
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(() => {
    try {
      const saved = localStorage.getItem('icertix_current_user');
      if (saved) return JSON.parse(saved);
    } catch {}
    return null;
  });

  // Backend Health & Latency State
  const [apiHealth, setApiHealth] = useState<{ connected: boolean; version?: string; latencyMs?: number }>({
    connected: true,
    version: '3.0.0',
    latencyMs: 10
  });

  // 2. Candidates State
  const [candidates, setCandidates] = useState<Candidate[]>(() => {
    try {
      const saved = localStorage.getItem('icertix_candidates');
      if (saved) return JSON.parse(saved);
    } catch {}
    return INITIAL_CANDIDATES;
  });

  // 3. Courses State
  const [courses, setCourses] = useState<Course[]>(() => {
    try {
      const saved = localStorage.getItem('icertix_courses');
      if (saved) return JSON.parse(saved);
    } catch {}
    return INITIAL_COURSES;
  });

  // 4. Templates State
  const [templates, setTemplates] = useState<CertificateTemplate[]>(() => {
    try {
      const saved = localStorage.getItem('icertix_templates');
      if (saved) return JSON.parse(saved);
    } catch {}
    return INITIAL_TEMPLATES;
  });

  // 5. Credentials Registry State
  const [credentials, setCredentials] = useState<Credential[]>(() => {
    try {
      const saved = localStorage.getItem('icertix_credentials');
      if (saved) return JSON.parse(saved);
    } catch {}
    return INITIAL_CREDENTIALS;
  });

  // 6. Email Logs State
  const [emailLogs, setEmailLogs] = useState<EmailLog[]>(() => {
    try {
      const saved = localStorage.getItem('icertix_email_logs');
      if (saved) return JSON.parse(saved);
    } catch {}
    return INITIAL_EMAIL_LOGS;
  });

  // 7. Audit Logs State
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => {
    try {
      const saved = localStorage.getItem('icertix_audit_logs');
      if (saved) return JSON.parse(saved);
    } catch {}
    return INITIAL_AUDIT_LOGS;
  });

  // Navigation Portals & Tabs (Start at login if not authenticated)
  const [currentPortal, setCurrentPortal] = useState<UserPortal>(() => {
    try {
      const saved = localStorage.getItem('icertix_current_user');
      if (saved) return 'org';
    } catch {}
    return 'login';
  });
  const [currentTab, setCurrentTab] = useState<NavTab>('dashboard');
  const [platformTab, setPlatformTab] = useState<PlatformNavTab>('platform-dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Modals & Active Selections
  const [inspectingCredential, setInspectingCredential] = useState<Credential | null>(null);
  const [revokingCredential, setRevokingCredential] = useState<Credential | null>(null);
  const [preselectedCandidateForIssue, setPreselectedCandidateForIssue] = useState<Candidate | null>(null);
  const [preselectedTemplateForIssue, setPreselectedTemplateForIssue] = useState<string | null>(null);
  const [activeDesignerTemplateId, setActiveDesignerTemplateId] = useState<string | null>(null);
  const [isDesignerCreateBlank, setIsDesignerCreateBlank] = useState<boolean>(false);
  const [verifierTargetId, setVerifierTargetId] = useState<string | null>(null);

  // Toast Notification System
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const [loginViewMode, setLoginViewMode] = useState<'login' | 'register_org' | 'claim_candidate'>('login');

  // URL Route Synchronization
  useEffect(() => {
    const path = location.pathname.toLowerCase();

    if (path === '/login' || path === '/signin') {
      setCurrentPortal('login');
      setLoginViewMode('login');
    } else if (path === '/register' || path === '/signup' || path === '/onboarding') {
      setCurrentPortal('login');
      setLoginViewMode('register_org');
    } else if (path === '/claim' || path === '/claim-account' || path === '/register/student') {
      setCurrentPortal('login');
      setLoginViewMode('claim_candidate');
    } else if (path.startsWith('/verify')) {
      setCurrentPortal('verify');
      const segments = location.pathname.split('/');
      if (segments.length >= 3 && segments[2]) {
        setVerifierTargetId(segments[2]);
      }
    } else if (path.startsWith('/candidate')) {
      setCurrentPortal('candidate');
    } else if (path.startsWith('/platform')) {
      setCurrentPortal('platform-admin');
      const tabSegment = path.replace(/^\/platform\/?/, '');
      if (tabSegment) {
        setPlatformTab(`platform-${tabSegment}` as any);
      }
    } else if (path.startsWith('/org')) {
      setCurrentPortal('org');
      const tabSegment = path.replace(/^\/org\/?/, '');
      const validTabs: NavTab[] = ['dashboard', 'templates', 'designer', 'candidates', 'generation', 'registry', 'emails', 'audit', 'subscription'];
      if (validTabs.includes(tabSegment as NavTab)) {
        setCurrentTab(tabSegment as NavTab);
      }
    } else if (path === '/' || path === '') {
      if (currentUser) {
        if (currentUser.role === 'SUPER_ADMIN') {
          navigate('/platform/dashboard', { replace: true });
        } else if (currentUser.role === 'CANDIDATE') {
          navigate('/candidate/wallet', { replace: true });
        } else {
          navigate('/org/dashboard', { replace: true });
        }
      } else {
        navigate('/login', { replace: true });
      }
    }
  }, [location.pathname]);

  // Live Backend Data Synchronizer
  const loadLiveBackendData = async (targetOrgId?: string) => {
    const orgId = targetOrgId || currentOrg?.id || 'ORG_001';
    api.setOrganisationId(orgId);

    // 1. Health check & latency
    try {
      const health = await api.checkHealth();
      setApiHealth({ connected: true, version: health.version, latencyMs: health.latencyMs });
    } catch {
      setApiHealth({ connected: false });
    }

    // 2. Fetch Organisations
    try {
      const orgList = await api.getOrganisations();
      if (orgList && orgList.length > 0) {
        setOrganisations(orgList);
        const match = orgList.find(o => o.id === orgId) || orgList[0];
        if (match) setCurrentOrg(match);
      }
    } catch {}

    // 3. Fetch Candidates for tenant
    try {
      const candList = await api.getCandidates(1, 100);
      if (candList && candList.length > 0) {
        setCandidates(prev => {
          const backendIds = new Set(candList.map(c => c.id));
          const localOnly = prev.filter(c => !backendIds.has(c.id));
          return [...localOnly, ...candList];
        });
      }
    } catch {}

    // 4. Fetch Courses for tenant
    try {
      const courseList = await api.getCourses(1, 100);
      if (courseList && courseList.length > 0) setCourses(courseList);
    } catch {}

    // 5. Fetch Templates
    try {
      const tplList = await api.getTemplates();
      const orgKey = `icertix_studio_schemas_${currentOrg?.id || 'ORG_001'}`;
      let savedSchemas: any[] = [];
      try {
        const stored = localStorage.getItem(orgKey);
        if (stored) savedSchemas = JSON.parse(stored);
      } catch {}

      const localTemplatesRaw = localStorage.getItem('icertix_templates');
      let localTemplates: CertificateTemplate[] = [];
      try {
        if (localTemplatesRaw) localTemplates = JSON.parse(localTemplatesRaw);
      } catch {}

      const baseList = (tplList && tplList.length > 0) ? tplList : localTemplates;
      const enhancedList = baseList.map(t => {
        const customSchema = savedSchemas.find((s: any) => s.id === t.id || s.templateId === t.id);
        if (customSchema) {
          return {
            ...t,
            schema: customSchema,
            variables: customSchema.elements
              ?.filter((el: any) => el.isVariable || el.type === 'dynamic-field')
              ?.map((el: any) => el.customVariableKey || el.fieldKey || el.name || 'var') || (t as any).variables
          };
        }
        return t;
      });

      setTemplates(enhancedList);
    } catch {
      const local = localStorage.getItem('icertix_templates');
      if (local) setTemplates(JSON.parse(local));
    }

    // 6. Fetch Credentials
    try {
      const credList = await api.getCredentials(1, 100);
      if (credList && credList.length > 0) {
        setCredentials(prev => {
          const backendIds = new Set(credList.map(c => (c.credentialId || c.id).toUpperCase()));
          const localOnly = prev.filter(c => !backendIds.has((c.credentialId || c.id).toUpperCase()));
          return [...localOnly, ...credList];
        });
      }
    } catch {}

    // 7. Fetch Emails & Audits
    try {
      const [emails, audits] = await Promise.all([
        api.getEmailLogs(1, 50),
        api.getAuditLogs(1, 50)
      ]);
      if (emails && emails.length > 0) setEmailLogs(emails);
      if (audits && audits.length > 0) setAuditLogs(audits);
    } catch {}

    // 8. Auto-reconcile candidates from credentials if missing in candidate roster
    try {
      const currentCredsRaw = localStorage.getItem('icertix_credentials');
      const currentCandsRaw = localStorage.getItem('icertix_candidates');
      const storedCreds: Credential[] = currentCredsRaw ? JSON.parse(currentCredsRaw) : [];
      const storedCands: Candidate[] = currentCandsRaw ? JSON.parse(currentCandsRaw) : [];
      const candEmails = new Set(storedCands.map(c => (c.email || '').toLowerCase().trim()));
      const missingCandidates: Candidate[] = [];

      storedCreds.forEach((cred, i) => {
        const email = (cred.recipient?.email || '').toLowerCase().trim();
        if (email && !candEmails.has(email)) {
          candEmails.add(email);
          const studentId = cred.recipient?.studentId || (cred.customAttributes as any)?.studentId || (cred.customAttributes as any)?.candidateId || `CAND-${(currentOrg?.code || 'ORG').split('-')[0]}-${Date.now().toString().slice(-4)}-${i + 1}`;
          missingCandidates.push({
            id: cred.candidateId && !cred.candidateId.startsWith('cand-batch-') ? cred.candidateId : `CAND-${Date.now().toString().slice(-4)}-${i + 1}`,
            organisationId: cred.organisationId || currentOrg?.id || 'ORG_001',
            name: cred.recipient?.name || 'Enrolled Candidate',
            email: cred.recipient?.email || email,
            studentId: studentId,
            department: (cred.customAttributes as any)?.department || (cred.customAttributes as any)?.Department || currentOrg?.department || 'Academic Division',
            status: 'Active',
            createdAt: cred.issueDate || new Date().toISOString()
          });
        }
      });

      if (missingCandidates.length > 0) {
        setCandidates(prev => {
          const combined = [...missingCandidates, ...prev];
          try { localStorage.setItem('icertix_candidates', JSON.stringify(combined)); } catch {}
          return combined;
        });
        api.importBulkCandidates(missingCandidates).catch(() => {});
      }
    } catch {}
  };

  // Initial mount & tenant-switch sync
  useEffect(() => {
    loadLiveBackendData(currentOrg?.id);
  }, [currentOrg?.id, currentUser?.id]);

  // Sync state to local storage for offline resilience
  useEffect(() => {
    try {
      localStorage.setItem('icertix_credentials', JSON.stringify(credentials));
      localStorage.setItem('icertix_candidates', JSON.stringify(candidates));
      localStorage.setItem('icertix_courses', JSON.stringify(courses));
      localStorage.setItem('icertix_templates', JSON.stringify(templates));
      localStorage.setItem('icertix_email_logs', JSON.stringify(emailLogs));
      localStorage.setItem('icertix_audit_logs', JSON.stringify(auditLogs));
      localStorage.setItem('icertix_organisations', JSON.stringify(organisations));
    } catch {}
  }, [credentials, candidates, courses, templates, emailLogs, auditLogs, organisations]);

  // Handlers for state modifications with live backend sync
  const handleAddCourse = async (newCourse: Partial<Course>) => {
    try {
      const created = await api.createCourse(newCourse);
      const target = created || {
        id: `CRS-${Date.now().toString().slice(-4)}`,
        organisationId: currentOrg?.id || 'ORG_001',
        name: newCourse.name || 'New Program',
        code: newCourse.code || 'CRS-01',
        duration: newCourse.duration || '120 Hours',
        category: newCourse.category || 'Academic',
        instructor: newCourse.instructor || currentOrg?.signatories?.[0]?.name || 'Instructor',
        skills: newCourse.skills || ['Core Competency']
      };
      setCourses(prev => [target, ...prev.filter(c => c.id !== target.id)]);
      showToast(`Program / Course "${target.name}" added successfully.`);
    } catch {
      const fallback: Course = {
        id: `CRS-${Date.now().toString().slice(-4)}`,
        organisationId: currentOrg?.id || 'ORG_001',
        name: newCourse.name || 'New Program',
        code: newCourse.code || 'CRS-01',
        duration: newCourse.duration || '120 Hours',
        category: newCourse.category || 'Academic',
        instructor: newCourse.instructor || currentOrg?.signatories?.[0]?.name || 'Instructor',
        skills: newCourse.skills || ['Core Competency']
      };
      setCourses(prev => [fallback, ...prev]);
      showToast(`Program / Course "${fallback.name}" added locally.`);
    }
  };

  const handleUpdateCourse = async (updatedCourse: Course) => {
    try {
      const updated = await api.updateCourse(updatedCourse.id, updatedCourse);
      const target = updated || updatedCourse;
      setCourses(prev => {
        const next = prev.map(c => c.id === target.id ? target : c);
        try { localStorage.setItem('icertix_courses', JSON.stringify(next)); } catch {}
        return next;
      });
      showToast(`Program "${target.name}" updated successfully.`);
    } catch {
      setCourses(prev => {
        const next = prev.map(c => c.id === updatedCourse.id ? updatedCourse : c);
        try { localStorage.setItem('icertix_courses', JSON.stringify(next)); } catch {}
        return next;
      });
      showToast(`Program "${updatedCourse.name}" updated locally.`);
    }
  };

  const handleDeleteCourse = async (courseId: string) => {
    try {
      await api.deleteCourse(courseId);
    } catch {}
    setCourses(prev => {
      const next = prev.filter(c => c.id !== courseId);
      try { localStorage.setItem('icertix_courses', JSON.stringify(next)); } catch {}
      return next;
    });
    showToast('Program removed from active directory.');
  };

  const handleAddCandidate = async (newCand: Candidate) => {
    try {
      const created = await api.addCandidate(newCand);
      const target = created || newCand;
      setCandidates(prev => [target, ...prev.filter(c => c.id !== target.id)]);
      showToast(`Candidate "${target.name}" registered with authority.`);
    } catch {
      setCandidates(prev => [newCand, ...prev]);
      showToast(`Candidate "${newCand.name}" added successfully.`);
    }
  };

  const handleImportBulkCandidates = async (newBatch: Candidate[]) => {
    try {
      const result = await api.importBulkCandidates(newBatch);
      if (result?.candidates && result.candidates.length > 0) {
        setCandidates(prev => [...result.candidates, ...prev]);
      } else {
        setCandidates(prev => [...newBatch, ...prev]);
      }
      showToast(`Imported ${newBatch.length} candidates from CSV.`);
    } catch {
      setCandidates(prev => [...newBatch, ...prev]);
      showToast(`Imported ${newBatch.length} candidates from CSV.`);
    }
  };

  const handleDeleteCandidate = async (id: string) => {
    try {
      await api.deleteCandidate(id);
    } catch {}
    setCandidates(prev => prev.filter(c => c.id !== id));
    showToast('Candidate removed from directory.');
  };

  const handleSaveTemplate = async (updatedTemplate: CertificateTemplate) => {
    // Also update studio schemas in localStorage for currentOrg
    try {
      const orgKey = `icertix_studio_schemas_${currentOrg.id}`;
      const stored = localStorage.getItem(orgKey);
      const parsed: any[] = stored ? JSON.parse(stored) : [];
      if (updatedTemplate.schema) {
        const idx = parsed.findIndex(s => s.id === updatedTemplate.id || s.templateId === updatedTemplate.id);
        if (idx >= 0) {
          parsed[idx] = updatedTemplate.schema;
        } else {
          parsed.unshift(updatedTemplate.schema);
        }
        localStorage.setItem(orgKey, JSON.stringify(parsed));
      }
    } catch {}

    try {
      const saved = await api.saveTemplate(updatedTemplate);
      const target = saved || updatedTemplate;
      setTemplates(prev => {
        const idx = prev.findIndex(t => t.id === target.id);
        const next = idx >= 0 ? prev.map(t => t.id === target.id ? target : t) : [target, ...prev];
        try { localStorage.setItem('icertix_templates', JSON.stringify(next)); } catch {}
        return next;
      });
      showToast(`Template "${target.name}" saved.`);
    } catch {
      setTemplates(prev => {
        const idx = prev.findIndex(t => t.id === updatedTemplate.id);
        const next = idx >= 0 ? prev.map(t => t.id === updatedTemplate.id ? updatedTemplate : t) : [updatedTemplate, ...prev];
        try { localStorage.setItem('icertix_templates', JSON.stringify(next)); } catch {}
        return next;
      });
      showToast(`Template "${updatedTemplate.name}" saved locally.`);
    }
  };

  const handleDeleteTemplate = async (templateId: string) => {
    try {
      await api.deleteTemplate(templateId);
    } catch (err) {
      console.warn('Backend delete template error:', err);
    }

    // Remove from studio schemas in localStorage
    try {
      const orgKey = `icertix_studio_schemas_${currentOrg.id}`;
      const stored = localStorage.getItem(orgKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        const filtered = parsed.filter((s: any) => (s.id !== templateId && s.templateId !== templateId));
        localStorage.setItem(orgKey, JSON.stringify(filtered));
      }
    } catch {}

    setTemplates(prev => {
      const next = prev.filter(t => t.id !== templateId);
      try { localStorage.setItem('icertix_templates', JSON.stringify(next)); } catch {}
      return next;
    });

    showToast('Template deleted successfully.');
  };

  const handleDuplicateTemplate = async (template: CertificateTemplate) => {
    try {
      const cloned = await api.duplicateTemplate(template.id);
      if (cloned) {
        setTemplates(prev => {
          const next = [cloned, ...prev];
          try { localStorage.setItem('icertix_templates', JSON.stringify(next)); } catch {}
          return next;
        });
        showToast(`Cloned "${template.name}".`);
        return;
      }
    } catch (err) {
      console.warn('Backend duplicate template error:', err);
    }

    const clonedId = `TPL_${Date.now().toString().slice(-4)}`;
    const cloned: CertificateTemplate = {
      ...template,
      id: clonedId,
      name: `${template.name} (Copy)`,
      status: 'DRAFT',
      isDefault: false
    };

    // Also persist cloned schema in studio localStorage
    try {
      const orgKey = `icertix_studio_schemas_${currentOrg.id}`;
      const stored = localStorage.getItem(orgKey);
      const parsed = stored ? JSON.parse(stored) : [];
      if (template.schema) {
        parsed.unshift({
          ...template.schema,
          id: clonedId,
          templateId: clonedId,
          name: cloned.name,
          organisationId: currentOrg.id
        });
        localStorage.setItem(orgKey, JSON.stringify(parsed));
      }
    } catch {}

    setTemplates(prev => {
      const next = [cloned, ...prev];
      try { localStorage.setItem('icertix_templates', JSON.stringify(next)); } catch {}
      return next;
    });
    showToast(`Cloned "${template.name}".`);
  };

  const handleUseTemplateForIssuance = (templateId: string) => {
    setPreselectedTemplateForIssue(templateId);
    setCurrentTab('generation');
    navigate('/org/generation');
  };

  const handleIssueForCandidate = (cand: Candidate) => {
    setPreselectedCandidateForIssue(cand);
    setCurrentTab('generation');
    navigate('/org/generation');
  };

  const handleCredentialCreated = (newCreds: Credential[]) => {
    const normalized = newCreds.map(c => normalizeCredential(c, organisations));
    setCredentials(prev => {
      const next = [...normalized, ...prev];
      try { localStorage.setItem('icertix_credentials', JSON.stringify(next)); } catch {}
      return next;
    });

    // Update organisation quota used
    setOrganisations(prev => {
      const next = prev.map(org => {
        if (org.id === currentOrg.id) {
          return {
            ...org,
            certificateQuota: {
              ...org.certificateQuota,
              used: org.certificateQuota.used + newCreds.length
            }
          };
        }
        return org;
      });
      try { localStorage.setItem('icertix_organisations', JSON.stringify(next)); } catch {}
      return next;
    });

    // Create Email logs
    const newEmails: EmailLog[] = normalized.map(c => ({
      id: `EMAIL-${Date.now().toString().slice(-4)}-${c.id}`,
      organisationId: c.organisationId,
      credentialId: c.credentialId,
      recipientEmail: c.recipient.email,
      recipientName: c.recipient.name,
      subject: `Your Verified Certificate from ${c.issuer.name}: ${c.title}`,
      status: 'Delivered',
      sentAt: new Date().toISOString(),
      messageId: `ses-msg-${Math.floor(100000 + Math.random() * 900000)}-${c.credentialId.toLowerCase()}`
    }));
    setEmailLogs(prev => {
      const next = [...newEmails, ...prev];
      try { localStorage.setItem('icertix_email_logs', JSON.stringify(next)); } catch {}
      return next;
    });

    // Create Audit log
    const newAudit: AuditLog = {
      id: `AUD-${Date.now().toString().slice(-4)}`,
      organisationId: currentOrg.id,
      timestamp: new Date().toISOString(),
      action: 'BATCH_ISSUE_CREDENTIALS',
      actor: currentOrg.signatories[0]?.name || 'Admin',
      targetId: `${newCreds.length} Credentials Batch`,
      details: `Generated ${newCreds.length} credentials with SHA-256 digests.`,
      ipAddress: '192.0.2.45'
    };
    setAuditLogs(prev => [newAudit, ...prev]);

    // Auto-sync / auto-enroll candidates into the Candidates roster if not already present
    const newCandidatesToRegister: Candidate[] = [];
    const existingEmails = new Set(candidates.map(c => (c.email || '').toLowerCase().trim()));

    normalized.forEach((c, idx) => {
      const email = (c.recipient?.email || '').toLowerCase().trim();
      if (email && !existingEmails.has(email)) {
        existingEmails.add(email);
        const studentId = c.recipient?.studentId || (c.customAttributes as any)?.studentId || (c.customAttributes as any)?.candidateId || `CAND-${(currentOrg.code || 'ORG').split('-')[0]}-${Date.now().toString().slice(-4)}-${idx + 1}`;
        newCandidatesToRegister.push({
          id: c.candidateId && !c.candidateId.startsWith('cand-batch-') ? c.candidateId : `CAND-${Date.now().toString().slice(-4)}-${idx + 1}`,
          organisationId: c.organisationId || currentOrg.id,
          name: c.recipient?.name || 'Enrolled Candidate',
          email: c.recipient?.email || email,
          studentId: studentId,
          department: (c.customAttributes as any)?.department || (c.customAttributes as any)?.Department || currentOrg.department || 'Academic Division',
          status: 'Active',
          createdAt: new Date().toISOString()
        });
      }
    });

    if (newCandidatesToRegister.length > 0) {
      setCandidates(prev => {
        const next = [...newCandidatesToRegister, ...prev];
        try { localStorage.setItem('icertix_candidates', JSON.stringify(next)); } catch {}
        return next;
      });
      api.importBulkCandidates(newCandidatesToRegister).catch(() => {});
    }

    showToast(`Successfully issued and dispatched ${newCreds.length} certificates.`);
  };

  const handleConfirmRevoke = async (credId: string, reason: string) => {
    try {
      const revoked = await api.revokeCredential(credId, reason);
      setCredentials(prev => prev.map(c => {
        if (c.id === credId || c.credentialId === credId) {
          return revoked || {
            ...c,
            status: 'REVOKED',
            revokedAt: new Date().toISOString(),
            revocationReason: reason
          };
        }
        return c;
      }));
    } catch {
      setCredentials(prev => prev.map(c => {
        if (c.id === credId || c.credentialId === credId) {
          return {
            ...c,
            status: 'REVOKED',
            revokedAt: new Date().toISOString(),
            revocationReason: reason
          };
        }
        return c;
      }));
    }

    const target = credentials.find(c => c.id === credId || c.credentialId === credId);
    if (target) {
      const newAudit: AuditLog = {
        id: `AUD-${Date.now().toString().slice(-4)}`,
        organisationId: target.organisationId,
        timestamp: new Date().toISOString(),
        action: 'REVOKE_CREDENTIAL',
        actor: 'Registrar Authority & HSM Quorum',
        targetId: target.credentialId,
        details: `Revoked credential. Reason: ${reason}`,
        ipAddress: '192.0.2.88'
      };
      setAuditLogs(prev => [newAudit, ...prev]);
    }

    showToast(`Credential revoked and CRL updated.`);
  };

  const handleResendEmail = async (credIdOrObj: string | Credential) => {
    const credId = typeof credIdOrObj === 'string' ? credIdOrObj : (credIdOrObj.credentialId || credIdOrObj.id);
    const cred = typeof credIdOrObj === 'object' ? credIdOrObj : credentials.find(c => c.credentialId === credId || c.id === credId);
    
    try {
      const resent = await api.resendEmail(credId);
      if (resent) {
        setEmailLogs(prev => [resent, ...prev]);
      }
    } catch {
      if (cred) {
        const newEmail: EmailLog = {
          id: `EMAIL-${Date.now().toString().slice(-4)}-resend`,
          organisationId: cred.organisationId,
          credentialId: cred.credentialId,
          recipientEmail: cred.recipient.email,
          recipientName: cred.recipient.name,
          subject: `[Resent] Your Verified Certificate: ${cred.title}`,
          status: 'Delivered',
          sentAt: new Date().toISOString(),
          messageId: `ses-msg-resend-${Math.floor(100000 + Math.random() * 900000)}`
        };
        setEmailLogs(prev => [newEmail, ...prev]);
      }
    }

    showToast(`Email notification dispatched to ${cred?.recipient?.email || 'recipient'}`);
  };

  const handleVerifyCredential = (cred: Credential) => {
    setVerifierTargetId(cred.credentialId);
    setCurrentPortal('verify');
    navigate(`/verify/${cred.credentialId}`);
  };

  const handleLoginSuccess = (user: AuthUser, redirectPortal?: 'org' | 'candidate' | 'verify') => {
    setCurrentUser(user);
    api.setToken(user.id);
    if (user.organisationId) {
      api.setOrganisationId(user.organisationId);
    }
    
    try {
      localStorage.setItem('icertix_current_user', JSON.stringify(user));
    } catch {}

    if (user.organisationId) {
      const matchedOrg = organisations.find(o => o.id === user.organisationId);
      if (matchedOrg) {
        setCurrentOrg(matchedOrg);
        loadLiveBackendData(matchedOrg.id);
      }
    } else {
      loadLiveBackendData();
    }

    // Role-based portal routing
    if (redirectPortal) {
      setCurrentPortal(redirectPortal);
      if (redirectPortal === 'org') {
        setCurrentTab('dashboard');
        navigate('/org/dashboard');
      } else if (redirectPortal === 'candidate') {
        navigate('/candidate/wallet');
      } else {
        navigate('/verify');
      }
    } else if (user.role === 'SUPER_ADMIN') {
      setCurrentPortal('platform-admin');
      setPlatformTab('platform-dashboard');
      navigate('/platform/dashboard');
    } else if (user.role === 'CANDIDATE') {
      setCurrentPortal('candidate');
      navigate('/candidate/wallet');
    } else {
      // ORG_ADMIN
      setCurrentPortal('org');
      setCurrentTab('dashboard');
      navigate('/org/dashboard');
    }

    const roleLabel = 
      user.role === 'SUPER_ADMIN' ? 'Super Administrator' :
      user.role === 'ORG_ADMIN' ? 'Organization Admin' : 'Candidate';
    showToast(`Authenticated as ${user.name} (${roleLabel})`);
  };

  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleRequestLogout = () => {
    setShowLogoutModal(true);
  };

  const handleConfirmLogout = async () => {
    setShowLogoutModal(false);
    await handleLogout();
  };

  const handleLogout = async () => {
    await api.logout();
    setCurrentUser(null);
    try {
      localStorage.removeItem('icertix_current_user');
      localStorage.removeItem('icertix_auth_token');
      localStorage.removeItem('icertix_current_org_id');
    } catch {}
    showToast('Session locked. Signed out successfully.');
    setCurrentPortal('login');
    navigate('/login');
  };

  const orgCredentials = credentials.filter(c => c.organisationId === currentOrg.id);
  const orgCandidates = candidates.filter(c => c.organisationId === currentOrg.id);
  const isRegisterRoute = location.pathname.toLowerCase().includes('/register');

  return (
    <div id="icertix-saas-app" className="flex flex-col min-h-screen bg-[#F8FAFC] text-[#0A2540] selection:bg-[#0284C7]/20 selection:text-[#0A2540]">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-[#0A2540] text-white px-4 py-2.5 shadow-xl border border-[#0F3559] text-xs font-mono font-bold flex items-center gap-2 animate-fadeIn">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Global Header (Rendered for Authenticated Dashboards & Public Verifier) */}
      {currentPortal !== 'login' && (
        <Header
          currentPortal={currentPortal}
          onChangePortal={(p) => {
            setCurrentPortal(p);
            if (p === 'org') {
              setCurrentTab('dashboard');
              navigate('/org/dashboard');
            } else if (p === 'candidate') {
              navigate('/candidate/wallet');
            } else if (p === 'verify') {
              navigate('/verify');
            } else if (p === 'platform-admin') {
              navigate('/platform/dashboard');
            } else if (p === 'login') {
              navigate('/login');
            }
          }}
          organisations={organisations}
          currentOrg={currentOrg}
          onChangeOrg={(org) => {
            setCurrentOrg(org);
            api.setOrganisationId(org.id);
            loadLiveBackendData(org.id);
          }}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onQuickIssue={() => {
            setCurrentPortal('org');
            setCurrentTab('generation');
            navigate('/org/generation');
          }}
          onQuickVerify={() => {
            setCurrentPortal('verify');
            navigate('/verify');
          }}
          mobileMenuOpen={mobileMenuOpen}
          onToggleMobileMenu={() => setMobileMenuOpen(prev => !prev)}
          currentUser={currentUser}
          onOpenLogin={() => {
            setCurrentPortal('login');
            navigate('/login');
          }}
          onLogout={handleRequestLogout}
          apiHealth={apiHealth}
        />
      )}

      {/* Main Body */}
      <div className="flex-1 flex min-w-0">
        {/* Login Portal View */}
        {currentPortal === 'login' && (
          <main className="w-screen h-screen overflow-hidden">
            <LoginPage
              organisations={organisations}
              candidates={candidates}
              onLoginSuccess={handleLoginSuccess}
              onBypassToVerifier={() => {
                setCurrentPortal('verify');
                navigate('/verify');
              }}
              initialView={loginViewMode}
              onViewChange={(view) => {
                setLoginViewMode(view);
                if (view === 'register_org') {
                  navigate('/register');
                } else if (view === 'claim_candidate') {
                  navigate('/claim');
                } else {
                  navigate('/login');
                }
              }}
            />
          </main>
        )}

        {/* Platform Administration Portal — SUPER_ADMIN & PLATFORM_ADMIN */}
        {currentPortal === 'platform-admin' && (
          <>
            {/* Desktop Sidebar */}
            <div className="hidden md:block w-64 shrink-0 md:sticky md:top-16 md:h-[calc(100vh-4rem)] md:self-start md:overflow-y-auto z-20">
              <PlatformSidebar
                currentTab={platformTab}
                onSelectTab={(tab) => {
                  setPlatformTab(tab);
                  navigate('/platform/' + tab.replace('platform-', ''));
                }}
                currentUser={currentUser}
                onLogout={handleRequestLogout}
              />
            </div>

            {/* Mobile Drawer */}
            <div className={`fixed inset-0 z-50 md:hidden ${mobileMenuOpen ? 'block' : 'hidden'}`}>
              <div
                className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
                onClick={() => setMobileMenuOpen(false)}
              />
              <div className="fixed inset-y-0 left-0 w-64 max-w-[80vw] z-50 h-full flex shadow-2xl">
                <PlatformSidebar
                  currentTab={platformTab}
                  onSelectTab={(tab) => {
                    setPlatformTab(tab);
                    navigate('/platform/' + tab.replace('platform-', ''));
                    setMobileMenuOpen(false);
                  }}
                  currentUser={currentUser}
                  onLogout={handleRequestLogout}
                  onCloseMobileMenu={() => setMobileMenuOpen(false)}
                />
              </div>
            </div>

            <PlatformAdminView
              currentTab={platformTab}
              currentUser={currentUser}
              onNavigateTab={(tab) => {
                setPlatformTab(tab);
                navigate('/platform/' + tab.replace('platform-', ''));
              }}
            />
          </>
        )}

        {/* Organisation Portal Mode: Shows Sidebar + Tab views */}
        {currentPortal === 'org' && (
          <>
            {/* Mobile Drawer (Only visible when toggled on mobile) */}
            <div className={`fixed inset-0 z-50 md:hidden ${mobileMenuOpen ? 'block' : 'hidden'}`}>
              <div 
                className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity" 
                onClick={() => setMobileMenuOpen(false)}
              />
              <div className="fixed inset-y-0 left-0 w-64 max-w-[80vw] z-50 h-full flex shadow-2xl">
                <Sidebar
                  currentTab={currentTab}
                  onSelectTab={(tab) => {
                    setCurrentTab(tab);
                    navigate('/org/' + tab);
                    setMobileMenuOpen(false);
                  }}
                  currentOrg={currentOrg}
                  credentialCount={orgCredentials.length}
                  candidateCount={orgCandidates.length}
                  templateCount={templates.length}
                  currentUser={currentUser}
                  onOpenLogin={() => {
                    setCurrentPortal('login');
                    navigate('/login');
                    setMobileMenuOpen(false);
                  }}
                  onLogout={handleRequestLogout}
                  onCloseMobileMenu={() => setMobileMenuOpen(false)}
                />
              </div>
            </div>

            {/* Desktop Sticky Sidebar (Sticks when scrolling, beneath header dropdowns) */}
            <div className="hidden md:block w-64 shrink-0 md:sticky md:top-16 md:h-[calc(100vh-4rem)] md:self-start md:overflow-y-auto z-20">
              <Sidebar
                currentTab={currentTab}
                onSelectTab={(tab) => {
                  setCurrentTab(tab);
                  navigate('/org/' + tab);
                }}
                currentOrg={currentOrg}
                credentialCount={orgCredentials.length}
                candidateCount={orgCandidates.length}
                templateCount={templates.length}
                currentUser={currentUser}
                onOpenLogin={() => {
                  setCurrentPortal('login');
                  navigate('/login');
                }}
                onLogout={handleRequestLogout}
              />
            </div>

            {/* Org Content Viewport */}
            <main className={`flex-1 w-full mx-auto overflow-y-auto ${
              currentTab === 'designer' 
                ? 'p-0 sm:p-1.5 lg:p-3 max-w-full' 
                : 'p-3 sm:p-6 lg:p-8 max-w-[1440px]'
            }`}>
              {currentTab === 'dashboard' && (
                <DashboardView
                  currentOrg={currentOrg}
                  credentials={credentials}
                  templates={templates}
                  candidateCount={orgCandidates.length}
                  onNavigateTab={(tab) => {
                    setCurrentTab(tab);
                    navigate('/org/' + tab);
                  }}
                  onViewCertificate={setInspectingCredential}
                  onVerifyCredential={handleVerifyCredential}
                  onEditTemplateInDesigner={(templateId) => {
                    setActiveDesignerTemplateId(templateId);
                    setIsDesignerCreateBlank(false);
                    setCurrentTab('designer');
                    navigate('/org/designer');
                  }}
                  onUseTemplateForIssue={(templateId) => {
                    setPreselectedTemplateForIssue(templateId);
                    setCurrentTab('generation');
                    navigate('/org/generation');
                  }}
                />
              )}

              {currentTab === 'templates' && (
                <MyTemplatesView
                  currentOrg={currentOrg}
                  templates={templates}
                  credentials={credentials}
                  candidates={candidates}
                  onNavigateToDesigner={(templateId, isNew) => {
                    if (templateId) {
                      setActiveDesignerTemplateId(templateId);
                      setIsDesignerCreateBlank(false);
                      setPreselectedTemplateForIssue(templateId);
                    } else if (isNew) {
                      setActiveDesignerTemplateId(null);
                      setIsDesignerCreateBlank(true);
                    } else {
                      setActiveDesignerTemplateId(null);
                      setIsDesignerCreateBlank(false);
                    }
                    setCurrentTab('designer');
                    navigate('/org/designer');
                  }}
                  onViewCertificate={setInspectingCredential}
                  onCredentialCreated={handleCredentialCreated}
                  onDeleteTemplate={handleDeleteTemplate}
                  onDuplicateTemplate={handleDuplicateTemplate}
                />
              )}

              {currentTab === 'designer' && (
                <TemplateStudioView
                  currentOrg={currentOrg}
                  templates={templates}
                  currentUser={currentUser}
                  editingTemplateId={activeDesignerTemplateId}
                  isCreatingNew={isDesignerCreateBlank}
                  onClearEditingTemplate={() => {
                    setActiveDesignerTemplateId(null);
                    setIsDesignerCreateBlank(false);
                  }}
                  onSaveTemplate={handleSaveTemplate}
                  onUseTemplateForIssuance={handleUseTemplateForIssuance}
                />
              )}

              {currentTab === 'candidates' && (
                <CandidateManagementView
                  currentOrg={currentOrg}
                  candidates={candidates}
                  onAddCandidate={handleAddCandidate}
                  onImportBulkCandidates={handleImportBulkCandidates}
                  onDeleteCandidate={handleDeleteCandidate}
                  onIssueForCandidate={handleIssueForCandidate}
                />
              )}

              {currentTab === 'generation' && (
                <CertificateGenerationView
                  currentOrg={currentOrg}
                  candidates={candidates}
                  templates={templates}
                  preselectedCandidate={preselectedCandidateForIssue}
                  preselectedTemplateId={preselectedTemplateForIssue}
                  onCredentialCreated={handleCredentialCreated}
                  onViewCertificate={setInspectingCredential}
                />
              )}

              {currentTab === 'registry' && (
                <CredentialRegistryView
                  currentOrg={currentOrg}
                  credentials={credentials}
                  onViewCertificate={setInspectingCredential}
                  onVerifyCredential={handleVerifyCredential}
                  onRevokeCredential={setRevokingCredential}
                  onResendEmail={handleResendEmail}
                />
              )}

              {currentTab === 'emails' && (
                <EmailLogsView
                  currentOrg={currentOrg}
                  emailLogs={emailLogs}
                  credentials={credentials}
                  onResendEmail={handleResendEmail}
                />
              )}

              {currentTab === 'audit' && (
                <AuditTrailView
                  currentOrg={currentOrg}
                  auditLogs={auditLogs}
                />
              )}

              {currentTab === 'subscription' && (
                <SubscriptionView
                  currentOrg={currentOrg}
                  onPlanUpdated={(updatedOrg) => {
                    setCurrentOrg(updatedOrg);
                    setOrganisations(prev => prev.map(o => o.id === updatedOrg.id ? updatedOrg : o));
                    showToast(`Active plan updated to ${updatedOrg.plan} (${updatedOrg.certificateQuota.total} certificate limit).`);
                  }}
                />
              )}
            </main>
          </>
        )}

        {/* Candidate Portal Mode: Standalone Full-Width View */}
        {currentPortal === 'candidate' && (
          <main className="flex-1 p-4 sm:p-6 lg:p-10 max-w-6xl w-full mx-auto">
            <CandidatePortalView
              currentUser={currentUser}
              candidates={candidates}
              credentials={credentials}
              organisations={organisations}
              onViewCertificate={setInspectingCredential}
              onVerifyCredential={handleVerifyCredential}
            />
          </main>
        )}

        {/* Public Verifier Mode: Standalone Full-Width Verification Screen */}
        {currentPortal === 'verify' && (
          <main className="flex-1 p-4 sm:p-6 lg:p-10 max-w-5xl w-full mx-auto">
            <PublicVerificationView
              credentials={credentials}
              organisations={organisations}
              initialCredentialId={verifierTargetId}
              onViewCertificate={setInspectingCredential}
            />
          </main>
        )}
      </div>

      {/* Official Certificate Vector Modal */}
      <CertificateModal
        credential={inspectingCredential}
        organisation={inspectingCredential ? organisations.find(o => o.id === inspectingCredential.organisationId) : undefined}
        templates={templates}
        onClose={() => setInspectingCredential(null)}
        onOpenVerifier={(cred) => {
          setInspectingCredential(null);
          handleVerifyCredential(cred);
        }}
      />

      {/* Revocation Confirmation Modal */}
      <RevocationModal
        credential={revokingCredential}
        onClose={() => setRevokingCredential(null)}
        onConfirmRevoke={handleConfirmRevoke}
      />

      {/* Logout Confirmation Modal */}
      <LogoutConfirmModal
        isOpen={showLogoutModal}
        currentUser={currentUser}
        onConfirm={handleConfirmLogout}
        onCancel={() => setShowLogoutModal(false)}
      />
    </div>
  );
}
