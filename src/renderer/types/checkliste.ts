export type BewertungWert = 'stabil' | 'eingeschraenkt' | 'instabil' | 'na';

export interface AnlageMeta {
  anlageId: string;
  name: string;
  beschreibung: string;
  anzahlFragen: number;
}

export interface ChecklisteFrage {
  frageId: string;
  abschnitt: string;
  frageText: string;
}

export interface ChecklisteAnlage {
  anlageId: string;
  name: string;
  beschreibung: string;
  fragen: ChecklisteFrage[];
}

export interface ChecklisteAntwort {
  id: number;
  frageId: string;
  abschnitt: string;
  frageText: string;
  bewertung: string | null;
  kommentar: string | null;
  istFinding: number;
}

export interface ChecklisteRun {
  id: number;
  mandantId: string;
  anlageId: string;
  anlageName: string;
  status: string;
  kiZusammenfassung: string | null;
  kiAdapter: string | null;
  erstelltAm: string;
  geaendertAm: string;
  abgeschlossenAm: string | null;
}

export interface RunDetail {
  run: ChecklisteRun;
  anlage: ChecklisteAnlage;
  antworten: ChecklisteAntwort[];
}

export interface AntwortState {
  bewertung: BewertungWert | null;
  kommentar: string;
  saving: boolean;
}

export function bewertungLabel(b: BewertungWert | null): string {
  if (!b) return '–';
  const map: Record<BewertungWert, string> = {
    stabil: 'Stabil',
    eingeschraenkt: 'Eingeschränkt',
    instabil: 'Instabil',
    na: 'N/A',
  };
  return map[b];
}

export function isFinding(b: BewertungWert | null): boolean {
  return b === 'instabil' || b === 'eingeschraenkt';
}
