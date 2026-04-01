export interface Template {
  id: string;
  title: string;
  template: string;
}

export interface CurrentWork {
  id: string | null;
  title: string;
  template: string;
}

export const WILDCARDS = [
  '{{firstName}}',
  '{{lastName}}',
  '{{fullName}}',
  '{{companyName}}',
  '{{position}}',
  '{{headline}}',
  '{{location}}',
  '{{msgFirstName}}',
  '{{msgLastName}}',
  '{{msgFullName}}'
];

export const MAX_TEMPLATES = 20;
export const MAX_CHAR_LIMIT = 300;
