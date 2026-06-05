export type DataCategory =
  | 'direct_identifier'
  | 'quasi_identifier'
  | 'sensitive_freetext'
  | 'technical_data'
  | 'public_data';

export type PrivacyAction =
  | 'remove'
  | 'pseudonymize'
  | 'generalize'
  | 'pass'
  | 'sanitize';

export interface PrivacyRule {
  fieldName: string;
  category: DataCategory;
  action: PrivacyAction;
  description: string;
}

export interface ClassifiedField {
  fieldName: string;
  value: string;
  category: DataCategory;
  action: PrivacyAction;
}

export interface PrivacyCheckResult {
  passed: boolean;
  processedData: Record<string, string>;
  removedFields: string[];
  pseudonymizedFields: string[];
  generalizedFields: string[];
  appliedRules: string[];
  originalData: Record<string, string>;
}

export type LpmTokenPrefix = 'MANDANT' | 'PERSON';

export interface PrivacyAuditEntry {
  prozess: string;
  adapter: string;
  angewendeteRegeln: string[];
  felderEntfernt: string[];
  felderPseudonymisiert: string[];
  felderGeneralisiert: string[];
  checkBestanden: boolean;
}
