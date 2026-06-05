export type BewertungWert = 'stabil' | 'eingeschraenkt' | 'instabil' | 'na';

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

export interface ChecklisteAnlageMeta {
  anlageId: string;
  name: string;
  beschreibung: string;
  anzahlFragen: number;
}

export interface ChecklisteRunRow {
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

export interface ChecklisteAntwortRow {
  id: number;
  mandantId: string;
  runId: number;
  frageId: string;
  abschnitt: string;
  frageText: string;
  bewertung: string | null;
  kommentar: string | null;
  istFinding: number;
  erstelltAm: string;
  geaendertAm: string;
}

export interface AntwortSaveInput {
  runId: number;
  mandantId: string;
  frageId: string;
  abschnitt: string;
  frageText: string;
  bewertung: BewertungWert | null;
  kommentar: string | null;
}

export interface RunMitAntworten {
  run: ChecklisteRunRow;
  anlage: ChecklisteAnlage;
  antworten: ChecklisteAntwortRow[];
}
