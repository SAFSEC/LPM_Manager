import { ZodError } from 'zod';

export interface IpcSuccess<T> {
  success: true;
  data: T;
}

export interface IpcFailure {
  success: false;
  error: string;
}

export type IpcResult<T> = IpcSuccess<T> | IpcFailure;

export function ipcOk<T>(data: T): IpcSuccess<T> {
  return { success: true, data };
}

export function ipcErr(error: string): IpcFailure {
  return { success: false, error };
}

function formatZodError(err: ZodError): string {
  const first = err.issues[0];
  if (!first) {
    return 'Eingabe ungültig';
  }
  const field = first.path.length > 0 ? String(first.path[0]) : 'Eingabe';
  const labels: Record<string, string> = {
    name: 'Name',
    standort: 'Standort',
    ansprechpartner: 'Ansprechpartner',
    branche: 'Branche',
    notizen: 'Notizen',
    mandant_id: 'Mandanten-ID',
  };
  const label = labels[field] ?? field;
  return `${label}: ${first.message}`;
}

export function ipcFromError(err: unknown): IpcFailure {
  if (err instanceof ZodError) {
    return ipcErr(formatZodError(err));
  }
  const message = err instanceof Error ? err.message : 'Unbekannter Fehler';
  return ipcErr(message);
}

export const NOT_IMPLEMENTED = 'Funktion wird in einer späteren Phase implementiert.';
