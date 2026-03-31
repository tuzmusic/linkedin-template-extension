import { wildcards } from './wildcards.config.js';

export function fillTemplate(template, data) {
  let filled = template;

  // Build wildcards object from enabled config
  const wildcardValues = {};

  wildcards.forEach(w => {
    if (w.enabled) {
      const value = data[w.key];
      // Handle null values for msg* fields
      if (w.key.startsWith('msg') && value === null) {
        wildcardValues[`{{${w.key}}}`] = 'NULL';
      } else {
        wildcardValues[`{{${w.key}}}`] = value;
      }
    }
  });

  // Replace all enabled wildcards
  for (const [wildcard, value] of Object.entries(wildcardValues)) {
    filled = filled.replace(new RegExp(wildcard, 'g'), value || '');
  }

  return filled;
}
