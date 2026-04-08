import { LinkedInProfileData } from './profile-scraper';

export function fillTemplate(template: string, data: LinkedInProfileData): string {
  let filled = template;

  // Replace all wildcards
  const wildcards: Record<string, string> = {
    '{{firstName}}': data.firstName,
    '{{lastName}}': data.lastName,
    '{{fullName}}': data.fullName,
    '{{companyName}}': data.companyName ?? 'COMPANY_NAME',
    '{{company}}': data.companyName ?? 'COMPANY_NAME', // alias
    '{{position}}': data.position,
    '{{headline}}': data.headline,
    '{{location}}': data.location,
    '{{msgFirstName}}': data.msgFirstName === null ? 'NULL' : data.msgFirstName,
    '{{msgLastName}}': data.msgLastName === null ? 'NULL' : data.msgLastName,
    '{{msgFullName}}': data.msgFullName === null ? 'NULL' : data.msgFullName
  };

  for (const [wildcard, value] of Object.entries(wildcards)) {
    filled = filled.replace(new RegExp(wildcard, 'g'), value || '');
  }

  return filled;
}
