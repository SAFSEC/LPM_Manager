import type { Mandant } from '../mandanten/types';
import type { ChecklisteRunRow, ChecklisteAntwortRow } from '../checklisten/types';

export interface ChecklisteExportData {
  mandant: Mandant;
  run: ChecklisteRunRow;
  antworten: ChecklisteAntwortRow[];
  kiZusammenfassung: string | null;
}

export interface ExportRecord {
  id: number;
  mandantId: string;
  typ: string;
  referenzId: number;
  format: string;
  dateiname: string;
  dateipfad: string;
  erstelltAm: string;
}

export interface AbschnittStat {
  abschnitt: string;
  gesamt: number;
  stabil: number;
  eingeschraenkt: number;
  instabil: number;
  na: number;
}
