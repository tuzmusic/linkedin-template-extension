export interface Template {
  id: string;
  title: string;
  template: string;
  /** Max characters; null means no limit */
  char_limit: number | null;
  created_at?: string;
  updated_at?: string;
}

export type SortField = 'title' | 'created_at' | 'updated_at';
export type SortDir = 'asc' | 'desc';
export interface SortConfig {
  field: SortField;
  dir: SortDir;
}

export interface CurrentWork {
  id: string | null;
  title: string;
  template: string;
  char_limit: number | null;
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
export const DEFAULT_CHAR_LIMIT = 300;
