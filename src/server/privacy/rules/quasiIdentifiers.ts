import type { PrivacyRule } from '../types';

export const quasiIdentifierRules: PrivacyRule[] = [
  {
    fieldName: 'branche',
    category: 'quasi_identifier',
    action: 'pass',
    description: 'Branche bleibt unverändert (LPM leicht)',
  },
  {
    fieldName: 'standort',
    category: 'quasi_identifier',
    action: 'pass',
    description: 'Standort bleibt unverändert (zu allgemein)',
  },
];
