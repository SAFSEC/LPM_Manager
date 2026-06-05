import type { DataCategory, PrivacyAction, PrivacyRule, LpmTokenPrefix } from './types';
import { identifierRules } from './rules/identifiers';
import { quasiIdentifierRules } from './rules/quasiIdentifiers';
import { FIELD_TOKEN_PREFIX } from './rules/identifiers';

const allRules: PrivacyRule[] = [...identifierRules, ...quasiIdentifierRules];

const ruleMap = new Map<string, PrivacyRule>();
for (const rule of allRules) {
  ruleMap.set(rule.fieldName, rule);
}

for (const field of ['kommentar', 'notizen'] as const) {
  ruleMap.set(field, {
    fieldName: field,
    category: 'sensitive_freetext',
    action: 'sanitize',
    description: 'Freitext wird auf PII-Muster gescannt',
  });
}

export function getRuleForField(fieldName: string): PrivacyRule | undefined {
  return ruleMap.get(fieldName);
}

export function getActionForField(fieldName: string): PrivacyAction {
  return ruleMap.get(fieldName)?.action ?? 'pass';
}

export function getCategoryForField(fieldName: string): DataCategory {
  return ruleMap.get(fieldName)?.category ?? 'technical_data';
}

export function getTokenPrefixForField(fieldName: string): LpmTokenPrefix {
  return FIELD_TOKEN_PREFIX[fieldName] ?? 'MANDANT';
}

export function getAllRules(): PrivacyRule[] {
  return [...ruleMap.values()];
}
