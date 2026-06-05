import type { PrivacyCheckResult } from './types';
import { classifyData } from './classifier';
import { isExternalAdapter } from './dataFlowControl';
import { pseudonymizeFields } from './pseudonymizer';
import { sanitizeFields } from './sanitizer';
import { writeAuditEntry } from './auditLog';
import { secureLog } from './secureLogger';

export { initPrivacyVault, tokenize, detokenize, detokenizeAll, closeVault, getVaultFilePath } from './tokenVault';
export type { PrivacyCheckResult, PrivacyAuditEntry } from './types';

function emptyResult(data: Record<string, string>): PrivacyCheckResult {
  return {
    passed: true,
    processedData: { ...data },
    removedFields: [],
    pseudonymizedFields: [],
    generalizedFields: [],
    appliedRules: [],
    originalData: data,
  };
}

export function privacyFilter(
  data: Record<string, string>,
  adapter: string
): PrivacyCheckResult {
  if (!isExternalAdapter(adapter)) {
    return emptyResult(data);
  }

  const classified = classifyData(data);
  const fieldsToRemove: string[] = [];
  const fieldsToPseudonymize: string[] = [];
  const fieldsToSanitize: string[] = [];
  const appliedRules: string[] = [];

  for (const field of classified) {
    switch (field.action) {
      case 'remove':
        fieldsToRemove.push(field.fieldName);
        appliedRules.push(`${field.fieldName}: remove`);
        break;
      case 'pseudonymize':
        fieldsToPseudonymize.push(field.fieldName);
        appliedRules.push(`${field.fieldName}: pseudonymize`);
        break;
      case 'sanitize':
        fieldsToSanitize.push(field.fieldName);
        appliedRules.push(`${field.fieldName}: sanitize`);
        break;
      case 'pass':
      case 'generalize':
        break;
      default: {
        const _exhaustive: never = field.action;
        void _exhaustive;
      }
    }
  }

  let processedData = { ...data };

  for (const field of fieldsToRemove) {
    delete processedData[field];
  }

  processedData = pseudonymizeFields(processedData, fieldsToPseudonymize);

  const { data: sanitizedData, allRemovedPatterns } = sanitizeFields(
    processedData,
    fieldsToSanitize
  );
  processedData = sanitizedData;

  if (allRemovedPatterns.length > 0) {
    appliedRules.push(...allRemovedPatterns);
  }

  const blockOnFail = (process.env.PRIVACY_BLOCK_ON_FAIL ?? 'true').toLowerCase() === 'true';
  const passed = !blockOnFail || fieldsToRemove.length === 0;

  writeAuditEntry({
    prozess: 'privacyFilter',
    adapter,
    angewendeteRegeln: appliedRules,
    felderEntfernt: fieldsToRemove,
    felderPseudonymisiert: fieldsToPseudonymize,
    felderGeneralisiert: [],
    checkBestanden: passed,
  });

  secureLog.info(
    `Privacy-Filter (${adapter}): ${fieldsToPseudonymize.length} pseudonymisiert, ` +
      `${fieldsToSanitize.length} sanitized`
  );

  return {
    passed,
    processedData,
    removedFields: fieldsToRemove,
    pseudonymizedFields: fieldsToPseudonymize,
    generalizedFields: [],
    appliedRules,
    originalData: data,
  };
}
