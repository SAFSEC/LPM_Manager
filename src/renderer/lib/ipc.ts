interface IpcResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export class IpcError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'IpcError';
  }
}

export function unwrapIpc<T>(result: IpcResult<T>): T {
  if (!result.success) {
    throw new IpcError(result.error ?? 'Unbekannter IPC-Fehler');
  }
  return result.data as T;
}
