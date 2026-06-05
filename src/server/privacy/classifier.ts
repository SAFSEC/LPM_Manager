import type { ClassifiedField } from './types';
import { getActionForField, getCategoryForField } from './ruleEngine';

export function classifyField(fieldName: string, value: string): ClassifiedField {
  return {
    fieldName,
    value,
    category: getCategoryForField(fieldName),
    action: getActionForField(fieldName),
  };
}

export function classifyData(data: Record<string, string>): ClassifiedField[] {
  return Object.entries(data).map(([fieldName, value]) =>
    classifyField(fieldName, String(value))
  );
}
