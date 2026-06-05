const INJECTION_PATTERNS: RegExp[] = [
  /ignoriere\s+alle\s+vorherigen\s+anweisungen/i,
  /ignore\s+all\s+previous\s+instructions/i,
  /du\s+bist\s+jetzt\s+(ein|eine|ein neuer)/i,
  /system\s*:\s*neue\s+anweisung/i,
  /\[SYSTEM\]/i,
  /\[INST\]/i,
  /<\|system\|>/i,
  /forget\s+(everything|all)\s+(above|before)/i,
  /new\s+instructions?\s*:/i,
  /override\s+(previous|all)\s+instructions/i,
];

const MAX_PROMPT_LENGTH = 8000;

export function sanitizePromptInput(text: string): string {
  let sanitized = text;

  for (const pattern of INJECTION_PATTERNS) {
    if (pattern.test(sanitized)) {
      sanitized = sanitized.replace(pattern, '[ENTFERNT]');
    }
  }

  return sanitized.substring(0, MAX_PROMPT_LENGTH);
}

export function containsInjectionPattern(text: string): boolean {
  return INJECTION_PATTERNS.some((pattern) => pattern.test(text));
}
