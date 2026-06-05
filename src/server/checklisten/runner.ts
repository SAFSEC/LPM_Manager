import { getAnlage, getAnlagenMeta } from './catalog';
import type { ChecklisteAnlageMeta, RunMitAntworten, AntwortSaveInput } from './types';
import {
  createRun,
  getRunById,
  getAntwortenByRun,
  upsertAntwort,
  updateRunStatus,
  abschliessenRun,
  updateRunKi,
  getRunsByMandant,
} from '../db/repositories/checklisten.repository';

export function getAlleAnlagenMeta(): ChecklisteAnlageMeta[] {
  return getAnlagenMeta();
}

export function starteRun(mandantId: string, anlageId: string): RunMitAntworten {
  const anlage = getAnlage(anlageId);
  if (!anlage) {
    throw new Error(`Anlage ${anlageId} nicht im Katalog gefunden`);
  }
  const run = createRun(mandantId, anlageId, anlage.name);
  updateRunStatus(run.id, 'in_bearbeitung');
  run.status = 'in_bearbeitung';
  return { run, anlage, antworten: [] };
}

export function ladeRun(runId: number): RunMitAntworten {
  const run = getRunById(runId);
  if (!run) {
    throw new Error('Checklisten-Durchlauf nicht gefunden');
  }
  const anlage = getAnlage(run.anlageId);
  if (!anlage) {
    throw new Error(`Anlage ${run.anlageId} nicht mehr im Katalog`);
  }
  const antworten = getAntwortenByRun(runId);
  return { run, anlage, antworten };
}

export function speichereAntwort(input: AntwortSaveInput): ReturnType<typeof upsertAntwort> {
  const run = getRunById(input.runId);
  if (!run) {
    throw new Error('Checklisten-Durchlauf nicht gefunden');
  }
  if (run.status === 'abgeschlossen') {
    throw new Error('Abgeschlossene Durchläufe können nicht mehr bearbeitet werden');
  }
  return upsertAntwort(input);
}

export function schliesseRunAb(
  runId: number,
  kiZusammenfassung: string | null = null,
  kiAdapter: string | null = null
): RunMitAntworten {
  const run = getRunById(runId);
  if (!run) {
    throw new Error('Checklisten-Durchlauf nicht gefunden');
  }
  abschliessenRun(runId, kiZusammenfassung, kiAdapter);
  return ladeRun(runId);
}

export function getRunsVonMandant(mandantId: string) {
  return getRunsByMandant(mandantId);
}

export function speichereKiErgebnis(runId: number, kiZusammenfassung: string, kiAdapter: string | null): RunMitAntworten {
  const run = getRunById(runId);
  if (!run) throw new Error('Checklisten-Durchlauf nicht gefunden');
  updateRunKi(runId, kiZusammenfassung, kiAdapter);
  return ladeRun(runId);
}
