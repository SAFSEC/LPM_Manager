/// <reference types="vite/client" />

interface MandantDto {
  mandant_id: string;
  name: string;
  standort: string | null;
  ansprechpartner: string | null;
  branche: string | null;
  notizen: string | null;
  aktiv: boolean;
  erstellt_am: string;
  geaendert_am: string;
}

interface LpmApi {
  mandanten: {
    liste: (input?: { mit_archiviert?: boolean }) => Promise<IpcResult<MandantDto[]>>;
    erstellen: (input: unknown) => Promise<IpcResult<MandantDto>>;
    aktualisieren: (input: unknown) => Promise<IpcResult<MandantDto>>;
    archivieren: (input: { mandant_id: string }) => Promise<IpcResult<void>>;
  };
  checklisten: {
    anlagenListe: () => Promise<IpcResult<unknown[]>>;
    runStarten: (input: { mandant_id: string; anlage_id: string }) => Promise<IpcResult<unknown>>;
    runLaden: (input: { run_id: number }) => Promise<IpcResult<unknown>>;
    antwortSpeichern: (input: unknown) => Promise<IpcResult<unknown>>;
    runAbschliessen: (input: { run_id: number }) => Promise<IpcResult<unknown>>;
    runsVonMandant: (input: { mandant_id: string }) => Promise<IpcResult<unknown[]>>;
    kiSpeichern: (input: { run_id: number; ki_zusammenfassung: string; ki_adapter: string | null }) => Promise<IpcResult<unknown>>;
  };
  formulare: {
    katalog: () => Promise<IpcResult<unknown[]>>;
    laden: (input: { id: number }) => Promise<IpcResult<unknown>>;
    speichern: (input: unknown) => Promise<IpcResult<unknown>>;
    vonMandant: (input: { mandant_id: string }) => Promise<IpcResult<unknown[]>>;
    finalisieren: (input: { id: number }) => Promise<IpcResult<unknown>>;
    loeschen: (input: { id: number; mandant_id: string }) => Promise<IpcResult<void>>;
  };
  ki: {
    anfrage: (input: unknown) => Promise<IpcResult<{ streamId: string }>>;
    adapterTesten: (input: { adapter: string }) => Promise<IpcResult<{ ok: boolean; info?: string }>>;
    onChunk: (callback: (chunk: unknown) => void) => void;
    offChunk: () => void;
  };
  export: {
    word: (input: unknown) => Promise<IpcResult<{ dateiname: string; dateipfad: string }>>;
    pdf: (input: unknown) => Promise<IpcResult<{ dateiname: string; dateipfad: string }>>;
    liste: (input: { mandant_id: string }) => Promise<IpcResult<unknown[]>>;
    dateiOeffnen: (input: { dateipfad: string }) => Promise<IpcResult<void>>;
    ordnerOeffnen: () => Promise<IpcResult<void>>;
  };
  einstellungen: {
    laden: () => Promise<IpcResult<Record<string, string>>>;
    speichern: (input: { schluessel: string; wert: string }) => Promise<IpcResult<void>>;
  };
  system: {
    getDbPaths: () => Promise<IpcResult<{ mainDb: string; tokensDb: string }>>;
  };
}

interface IpcResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

interface Window {
  lpm: LpmApi;
}
