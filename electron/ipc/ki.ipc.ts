import { ipcMain } from 'electron/main';
import type { IpcMainInvokeEvent } from 'electron/main';
import { ipcOk, ipcErr, ipcFromError } from './ipcTypes';
import { sendKiAnfrage, testeAdapter } from '@server/ki/index';
import type { KiAnfrage, KiAdapterId } from '@server/ki/types';
import { log } from '../logger';

interface KiAnfragePayload {
  useCase: string;
  prompt: string;
  adapter?: string;
  mandantId?: string;
}

interface AdapterTestPayload {
  adapter: string;
}

function isKiAnfragePayload(v: unknown): v is KiAnfragePayload {
  if (typeof v !== 'object' || v === null) return false;
  const p = v as Record<string, unknown>;
  return typeof p['useCase'] === 'string' && typeof p['prompt'] === 'string';
}

function isAdapterTestPayload(v: unknown): v is AdapterTestPayload {
  if (typeof v !== 'object' || v === null) return false;
  return typeof (v as Record<string, unknown>)['adapter'] === 'string';
}

const VALID_USE_CASES = new Set(['ERKLAERUNG', 'ZUSAMMENFASSUNG', 'EMPFEHLUNG', 'RISIKO']);
const VALID_ADAPTERS = new Set(['ollama', 'anthropic', 'openai', 'gemini', 'openrouter']);

export function registerKiIpc(): void {
  ipcMain.handle('ki:anfrage', async (event: IpcMainInvokeEvent, payload: unknown) => {
    try {
      if (!isKiAnfragePayload(payload)) {
        return ipcErr('Ungültige KI-Anfrage: useCase und prompt erforderlich.');
      }
      if (!VALID_USE_CASES.has(payload.useCase)) {
        return ipcErr(`Ungültiger Use-Case: ${payload.useCase}`);
      }
      if (payload.adapter && !VALID_ADAPTERS.has(payload.adapter)) {
        return ipcErr(`Ungültiger Adapter: ${payload.adapter}`);
      }

      const anfrage: KiAnfrage = {
        useCase: payload.useCase as KiAnfrage['useCase'],
        prompt: payload.prompt,
        adapter: payload.adapter as KiAdapterId | undefined,
        mandantId: payload.mandantId,
      };

      const streamId = `ki-${Date.now()}`;
      log(`KI-Anfrage: useCase=${anfrage.useCase} adapter=${anfrage.adapter ?? '(default)'}`);

      sendKiAnfrage(anfrage, (chunk: unknown) => {
        const c = chunk as { type?: string; error?: string };
        if (c.type === 'error') {
          log(`KI-Fehler (Stream): ${c.error ?? 'unbekannt'}`);
        }
        if (!event.sender.isDestroyed()) {
          event.sender.send('ki:stream-chunk', chunk);
        }
      }).catch((err: unknown) => {
        const msg = err instanceof Error ? err.message : 'Unbekannter KI-Fehler';
        log(`KI-Fehler (Exception): ${msg}`);
        if (!event.sender.isDestroyed()) {
          event.sender.send('ki:stream-chunk', {
            type: 'error',
            error: msg,
          });
        }
      });

      return ipcOk({ streamId });
    } catch (err) {
      return ipcFromError(err);
    }
  });

  ipcMain.handle('ki:adapter-testen', async (_event: IpcMainInvokeEvent, payload: unknown) => {
    try {
      if (!isAdapterTestPayload(payload)) {
        return ipcErr('Adapter-ID erforderlich.');
      }
      if (!VALID_ADAPTERS.has(payload.adapter)) {
        return ipcErr(`Ungültiger Adapter: ${payload.adapter}`);
      }

      const result = await testeAdapter(payload.adapter as KiAdapterId);
      return ipcOk(result);
    } catch (err) {
      return ipcFromError(err);
    }
  });
}
