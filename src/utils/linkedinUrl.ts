/**
 * iCertiX — LinkedIn 1-Click Certification URL Helper
 * 
 * Generates the official LinkedIn "Add to Profile" URL pre-populated with
 * credential details, issuing authority, certificate ID, and verification URL.
 */

export interface LinkedInCertificationParams {
  name: string;
  issuerName: string;
  issueDate?: string;
  expiryDate?: string;
  credentialId?: string;
  verificationUrl?: string;
}

export function generateLinkedInUrl(params: LinkedInCertificationParams): string {
  const baseUrl = 'https://www.linkedin.com/profile/add';
  const queryParams = new URLSearchParams();

  queryParams.set('startTask', 'CERTIFICATION_NAME');
  queryParams.set('name', params.name || 'Professional Credential');
  queryParams.set('organizationName', params.issuerName || 'Academic Institution');

  if (params.issueDate) {
    try {
      const date = new Date(params.issueDate);
      if (!isNaN(date.getTime())) {
        queryParams.set('issueYear', date.getFullYear().toString());
        queryParams.set('issueMonth', (date.getMonth() + 1).toString());
      }
    } catch {}
  }

  if (params.expiryDate) {
    try {
      const exp = new Date(params.expiryDate);
      if (!isNaN(exp.getTime())) {
        queryParams.set('expirationYear', exp.getFullYear().toString());
        queryParams.set('expirationMonth', (exp.getMonth() + 1).toString());
      }
    } catch {}
  }

  if (params.credentialId) {
    queryParams.set('certId', params.credentialId);
  }

  if (params.verificationUrl) {
    queryParams.set('certUrl', params.verificationUrl);
  }

  return `${baseUrl}?${queryParams.toString()}`;
}
