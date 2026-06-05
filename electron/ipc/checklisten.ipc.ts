import { ipcMain } from 'electron/main';
import {
  getAlleAnlagenMeta,
  starteRun,
  ladeRun,
  speichereAntwort,
  schliesseRunAb,
  getRunsVonMandant,
  speichereKiErgebnis,
} from '@server/checklisten/runner';
import {
  runStartenSchema,
  runLadenSchema,
  runAbschliessenSchema,
  runsVonMandantSchema,
  antwortSpeichernSchema,
  kiSpeichernSchema,
} from '@server/validation/checklisten.schema';
import { ipcFromError, ipcOk } from './ipcTypes';
import type { AntwortSaveInput } from '@server/checklisten/types';

export function registerChecklistenIpc(): void {
  ipcMain.handle('checklisten:anlagen-liste', () => {
    try {
      return ipcOk(getAlleAnlagenMeta());
    } catch (err) {
      return ipcFromError(err);
    }
  });

  ipcMain.handle('checklisten:run-starten', (_event, raw: unknown) => {
    try {
      const input = runStartenSchema.parse(raw);
      const result = starteRun(input.mandant_id, input.anlage_id);
      return ipcOk(serializeRunDetail(result));
    } catch (err) {
      console.error('[checklisten:run-starten]', err);
      return ipcFromError(err);
    }
  });

  ipcMain.handle('checklisten:run-laden', (_event, raw: unknown) => {
    try {
      const input = runLadenSchema.parse(raw);
      const result = ladeRun(input.run_id);
      return ipcOk(serializeRunDetail(result));
    } catch (err) {
      console.error('[checklisten:run-laden]', err);
      return ipcFromError(err);
    }
  });

  ipcMain.handle('checklisten:antwort-speichern', (_event, raw: unknown) => {
    try {
      const input = antwortSpeichernSchema.parse(raw);
      const antwortInput: AntwortSaveInput = {
        runId: input.run_id,
        mandantId: input.mandant_id,
        frageId: input.frage_id,
        abschnitt: input.abschnitt,
        frageText: input.frage_text,
        bewertung: input.bewertung,
        kommentar: input.kommentar,
      };
      const saved = speichereAntwort(antwortInput);
      return ipcOk(saved);
    } catch (err) {
      console.error('[checklisten:antwort-speichern]', err);
      return ipcFromError(err);
    }
  });

  ipcMain.handle('checklisten:run-abschliessen', (_event, raw: unknown) => {
    try {
      const input = runAbschliessenSchema.parse(raw);
      const result = schliesseRunAb(input.run_id);
      return ipcOk(serializeRunDetail(result));
    } catch (err) {
      console.error('[checklisten:run-abschliessen]', err);
      return ipcFromError(err);
    }
  });

  ipcMain.handle('checklisten:runs-von-mandant', (_event, raw: unknown) => {
    try {
      const input = runsVonMandantSchema.parse(raw);
      return ipcOk(getRunsVonMandant(input.mandant_id));
    } catch (err) {
      console.error('[checklisten:runs-von-mandant]', err);
      return ipcFromError(err);
    }
  });

  ipcMain.handle('checklisten:ki-speichern', (_event, raw: unknown) => {
    try {
      const input = kiSpeichernSchema.parse(raw);
      const result = speichereKiErgebnis(input.run_id, input.ki_zusammenfassung, input.ki_adapter);
      return ipcOk(serializeRunDetail(result));
    } catch (err) {
      console.error('[checklisten:ki-speichern]', err);
      return ipcFromError(err);
    }
  });
}

function serializeRunDetail(detail: ReturnType<typeof ladeRun>) {
  return {
    run: detail.run,
    anlage: {
      anlageId: detail.anlage.anlageId,
      name: detail.anlage.name,
      beschreibung: detail.anlage.beschreibung,
      fragen: detail.anlage.fragen,
    },
    antworten: detail.antworten,
  };
}
