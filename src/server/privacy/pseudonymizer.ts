import { tokenize } from './tokenVault';

export function pseudonymizeValue(value: string, fieldName: string): string {
  if (!value || value.trim() === '') {
    return value;
  }
  return tokenize(value, fieldName);
}

export function pseudonymizeFields(
  data: Record<string, string>,
  fields: string[]
): Record<string, string> {
  const result = { ...data };
  for (const field of fields) {
    if (result[field] !== undefined && result[field] !== null) {
      result[field] = pseudonymizeValue(String(result[field]), field);
    }
  }
  return result;
}
