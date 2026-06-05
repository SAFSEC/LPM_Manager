import { contextBridge, ipcRenderer } from 'electron/renderer';

type IpcResult<T> = { success: boolean; data?: T; error?: string };

function sanitize(value: unknown): unknown {
  if (value === null || value === undefined) return null;
  if (Array.isArray(value)) return value.map(sanitize);
  if (typeof value === 'object') {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      if (v !== undefined) out[k] = sanitize(v);
    }
    return out;
  }
  return value;
}

async function invoke<T>(channel: string, payload?: unknown): Promise<IpcResult<T>> {
  return ipcRenderer.invoke(channel, payload !== undefined ? sanitize(payload) : payload) as Promise<IpcResult<T>>;
}

const lpm = {
  mandanten: {
    liste: (input?: { mit_archiviert?: boolean }) =>
      invoke<unknown[]>('mandanten:liste', input),
    erstellen: (input: unknown) => invoke<unknown>('mandanten:erstellen', input),
    aktualisieren: (input: unknown) => invoke<unknown>('mandanten:aktualisieren', input),
    archivieren: (input: { mandant_id: string }) =>
      invoke<void>('mandanten:archivieren', input),
  },
  checklisten: {
    anlagenListe: () => invoke<unknown[]>('checklisten:anlagen-liste'),
    runStarten: (input: { mandant_id: string; anlage_id: string }) =>
      invoke<unknown>('checklisten:run-starten', input),
    runLaden: (input: { run_id: number }) => invoke<unknown>('checklisten:run-laden', input),
    antwortSpeichern: (input: unknown) =>
      invoke<unknown>('checklisten:antwort-speichern', input),
    runAbschliessen: (input: { run_id: number }) =>
      invoke<unknown>('checklisten:run-abschliessen', input),
    runsVonMandant: (input: { mandant_id: string }) =>
      invoke<unknown[]>('checklisten:runs-von-mandant', input),
    kiSpeichern: (input: { run_id: number; ki_zusammenfassung: string; ki_adapter: string | null }) =>
      invoke<unknown>('checklisten:ki-speichern', input),
  },
  formulare: {
    katalog: () => invoke<unknown[]>('formulare:katalog'),
    laden: (input: { id: number }) => invoke<unknown>('formulare:laden', input),
    speichern: (input: unknown) => invoke<unknown>('formulare:speichern', input),
    vonMandant: (input: { mandant_id: string }) =>
      invoke<unknown[]>('formulare:von-mandant', input),
    finalisieren: (input: { id: number }) => invoke<unknown>('formulare:finalisieren', input),
    loeschen: (input: { id: number; mandant_id: string }) =>
      invoke<void>('formulare:loeschen', input),
  },
  ki: {
    anfrage: (input: unknown) => invoke<{ streamId: string }>('ki:anfrage', input),
    adapterTesten: (input: { adapter: string }) =>
      invoke<{ ok: boolean; info?: string }>('ki:adapter-testen', input),
    onChunk: (callback: (chunk: unknown) => void) => {
      ipcRenderer.on('ki:stream-chunk', (_event: unknown, chunk: unknown) => callback(chunk));
    },
    offChunk: () => {
      ipcRenderer.removeAllListeners('ki:stream-chunk');
    },
  },
  export: {
    word: (input: unknown) => invoke<{ dateiname: string; dateipfad: string }>('export:word', input),
    pdf: (input: unknown) => invoke<{ dateiname: string; dateipfad: string }>('export:pdf', input),
    liste: (input: { mandant_id: string }) => invoke<unknown[]>('export:liste', input),
    dateiOeffnen: (input: { dateipfad: string }) => invoke<void>('export:datei-oeffnen', input),
    ordnerOeffnen: () => invoke<void>('export:ordner-oeffnen'),
  },
  einstellungen: {
    laden: () => invoke<Record<string, string>>('einstellungen:laden'),
    speichern: (input: { schluessel: string; wert: string }) =>
      invoke<void>('einstellungen:speichern', input),
  },
  system: {
    getDbPaths: () =>
      invoke<{ mainDb: string; tokensDb: string }>('system:get-db-paths'),
  },
} as const;

contextBridge.exposeInMainWorld('lpm', lpm);
