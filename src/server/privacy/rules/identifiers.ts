import type { PrivacyRule, LpmTokenPrefix } from '../types';

export const identifierRules: PrivacyRule[] = [
  {
    fieldName: 'name',
    category: 'direct_identifier',
    action: 'pseudonymize',
    description: 'Mandantenname wird pseudonymisiert',
  },
  {
    fieldName: 'ansprechpartner',
    category: 'direct_identifier',
    action: 'pseudonymize',
    description: 'Ansprechpartner wird pseudonymisiert',
  },
];

export const FIELD_TOKEN_PREFIX: Record<string, LpmTokenPrefix> = {
  name: 'MANDANT',
  ansprechpartner: 'PERSON',
};

export const SANITIZE_FIELDS = ['kommentar', 'notizen'] as const;
