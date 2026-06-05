import { ipcMain } from 'electron/main';
import { getEinstellungen, setEinstellung } from '@server/db/repositories/einstellungen.repository';
import { einstellungSaveSchema } from '@server/validation/einstellungen.schema';
import { ipcFromError, ipcOk } from './ipcTypes';

export function registerEinstellungenIpc(): void {
  ipcMain.handle('einstellungen:laden', () => {
    try {
      return ipcOk(getEinstellungen());
    } catch (err) {
      return ipcFromError(err);
    }
  });

  ipcMain.handle('einstellungen:speichern', (_event: unknown, raw: unknown) => {
    try {
      const input = einstellungSaveSchema.parse(raw);
      setEinstellung(input.schluessel, input.wert);
      return ipcOk(undefined);
    } catch (err) {
      return ipcFromError(err);
    }
  });
}
