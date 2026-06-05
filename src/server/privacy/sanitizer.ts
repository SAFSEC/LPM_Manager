const PII_PATTERNS: Array<{ pattern: RegExp; replacement: string; label: string }> = [
  {
    pattern: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
    replacement: '[EMAIL_ENTFERNT]',
    label: 'E-Mail-Adresse',
  },
  {
    pattern: /(\+?\d{1,3}[-.\s]?)?\(?\d{2,5}\)?[-.\s]?\d{3,10}[-.\s]?\d{0,10}/g,
    replacement: '[TELEFON_ENTFERNT]',
    label: 'Telefonnummer',
  },
  {
    pattern: /\b(Herr|Frau|Hr\.|Fr\.)\s+[A-ZÄÖÜ][a-zäöüß]+(\s+[A-ZÄÖÜ][a-zäöüß]+)?\b/g,
    replacement: '[NAME_ENTFERNT]',
    label: 'Personenname mit Anrede',
  },
];

export interface SanitizeResult {
  sanitized: string;
  removedPatterns: string[];
}

export function sanitizeText(text: string): SanitizeResult {
  if (!text || text.trim() === '') {
    return { sanitized: text, removedPatterns: [] };
  }

  let sanitized = text;
  const removedPatterns: string[] = [];

  for (const { pattern, replacement, label } of PII_PATTERNS) {
    pattern.lastIndex = 0;
    if (pattern.test(sanitized)) {
      removedPatterns.push(label);
      pattern.lastIndex = 0;
      sanitized = sanitized.replace(pattern, replacement);
    }
  }

  return { sanitized, removedPatterns };
}

export function sanitizeFields(
  data: Record<string, string>,
  fields: string[]
): { data: Record<string, string>; allRemovedPatterns: string[] } {
  const result = { ...data };
  const allRemovedPatterns: string[] = [];

  for (const field of fields) {
    if (result[field] !== undefined && result[field] !== null) {
      const { sanitized, removedPatterns } = sanitizeText(String(result[field]));
      result[field] = sanitized;
      allRemovedPatterns.push(...removedPatterns.map((p) => `${field}: ${p}`));
    }
  }

  return { data: result, allRemovedPatterns };
}
