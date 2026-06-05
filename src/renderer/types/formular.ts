export type FeldTyp = 'text' | 'textarea' | 'date' | 'time' | 'select' | 'number';

export interface FeldDefinition {
  id: string;
  label: string;
  typ: FeldTyp;
  pflichtfeld?: boolean;
  optionen?: string[];
  platzhalter?: string;
  breite?: 'halb' | 'voll';
  gruppe?: string;
}

export interface FormularDefinition {
  formularId: string;
  name: string;
  beschreibung: string;
  felder: FeldDefinition[];
}

export interface FormularRow {
  id: number;
  mandantId: string;
  formularId: string;
  formularName: string;
  felder: Record<string, string>;
  status: 'entwurf' | 'final';
  erstelltAm: string;
  geaendertAm: string;
}
