// Centralized wildcard configuration
export const wildcards = [
  { key: 'firstName', enabled: true },
  { key: 'lastName', enabled: true },
  { key: 'fullName', enabled: true },
  { key: 'companyName', enabled: true },
  { key: 'company', enabled: true }, // alias
  { key: 'position', enabled: true },
  { key: 'headline', enabled: true },
  { key: 'location', enabled: true },
  { key: 'msgFirstName', enabled: true },
  { key: 'msgLastName', enabled: true },
  { key: 'msgFullName', enabled: true }
];

export function isWildcardEnabled(key) {
  return wildcards.some(w => w.key === key && w.enabled);
}

export function getEnabledWildcards() {
  return wildcards.filter(w => w.enabled);
}
