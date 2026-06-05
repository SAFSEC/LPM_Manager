import { ipcMain } from 'electron/main';
import { ipcOk, ipcFromError } from './ipcTypes';
import {
  formularSpeichernSchema,
  formularLadenSchema,
  formulareVonMandantSchema,
  formularFinalisierenSchema,
} from '@server/validation/formulare.schema';
import {
  upsertFormular,
  getFormularById,
  getFormulareByMandant,
  finalisierenFormular,
  deleteFormular,
} from '@server/db/repositories/formulare.repository';
import { FORMULARE_KATALOG } from '@server/formulare/catalog';

export function registerFormulareIpc(): void {
  ipcMain.handle('formulare:katalog', () => {
    try {
      return ipcOk(FORMULARE_KATALOG);
    } catch (err) {
      return ipcFromError(err);
    }
  });

  ipcMain.handle('formulare:laden', (_event, raw: unknown) => {
    try {
      const input = formularLadenSchema.parse(raw);
      const formular = getFormularById(input.id);
      if (!formular) {
        return ipcFromError(new Error(`Formular #${input.id} nicht gefunden`));
      }
      return ipcOk(formular);
    } catch (err) {
      console.error('[formulare:laden]', err);
      return ipcFromError(err);
    }
  });

  ipcMain.handle('formulare:speichern', (_event, raw: unknown) => {
    try {
      const input = formularSpeichernSchema.parse(raw);
      const result = upsertFormular({
        mandantId: input.mandant_id,
        formularId: input.formular_id,
        felder: input.felder,
        id: input.id,
      });
      return ipcOk(result);
    } catch (err) {
      console.error('[formulare:speichern]', err);
      return ipcFromError(err);
    }
  });

  ipcMain.handle('formulare:von-mandant', (_event, raw: unknown) => {
    try {
      const input = formulareVonMandantSchema.parse(raw);
      return ipcOk(getFormulareByMandant(input.mandant_id));
    } catch (err) {
      console.error('[formulare:von-mandant]', err);
      return ipcFromError(err);
    }
  });

  ipcMain.handle('formulare:finalisieren', (_event, raw: unknown) => {
    try {
      const input = formularFinalisierenSchema.parse(raw);
      const result = finalisierenFormular(input.id);
      return ipcOk(result);
    } catch (err) {
      console.error('[formulare:finalisieren]', err);
      return ipcFromError(err);
    }
  });

  ipcMain.handle('formulare:loeschen', (_event, raw: unknown) => {
    try {
      const input = raw as { id: number; mandant_id: string };
      if (typeof input.id !== 'number' || typeof input.mandant_id !== 'string') {
        throw new Error('Ungültige Parameter');
      }
      deleteFormular(input.id, input.mandant_id);
      return ipcOk(undefined);
    } catch (err) {
      console.error('[formulare:loeschen]', err);
      return ipcFromError(err);
    }
  });
}
