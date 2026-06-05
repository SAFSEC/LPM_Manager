import { ipcMain } from 'electron/main';
import {
  archivierenMandant,
  createMandant,
  listMandanten,
  updateMandant,
} from '@server/db/repositories/mandanten.repository';
import {
  mandantArchivierenSchema,
  mandantCreateSchema,
  mandantUpdateSchema,
} from '@server/validation/mandanten.schema';
import { ipcFromError, ipcOk } from './ipcTypes';

export function registerMandantenIpc(): void {
  ipcMain.handle('mandanten:liste', (_event, raw?: unknown) => {
    try {
      const mitArchiviert =
        typeof raw === 'object' &&
        raw !== null &&
        'mit_archiviert' in raw &&
        (raw as { mit_archiviert?: boolean }).mit_archiviert === true;
      return ipcOk(listMandanten(mitArchiviert));
    } catch (err) {
      return ipcFromError(err);
    }
  });

  ipcMain.handle('mandanten:erstellen', (_event, raw: unknown) => {
    try {
      const input = mandantCreateSchema.parse(raw);
      return ipcOk(createMandant(input));
    } catch (err) {
      console.error('[mandanten:erstellen]', err);
      return ipcFromError(err);
    }
  });

  ipcMain.handle('mandanten:aktualisieren', (_event, raw: unknown) => {
    try {
      const input = mandantUpdateSchema.parse(raw);
      return ipcOk(updateMandant(input));
    } catch (err) {
      console.error('[mandanten:aktualisieren]', err, raw);
      return ipcFromError(err);
    }
  });

  ipcMain.handle('mandanten:archivieren', (_event, raw: unknown) => {
    try {
      const input = mandantArchivierenSchema.parse(raw);
      archivierenMandant(input.mandant_id);
      return ipcOk(undefined);
    } catch (err) {
      return ipcFromError(err);
    }
  });
}
