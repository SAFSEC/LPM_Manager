const LOCAL_ADAPTERS = new Set(['ollama', 'lokal', 'local']);

export function isExternalAdapter(adapter: string): boolean {
  return !LOCAL_ADAPTERS.has(adapter.toLowerCase());
}
