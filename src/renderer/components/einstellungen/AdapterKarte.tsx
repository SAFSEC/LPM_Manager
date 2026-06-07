import type { KiAdapterId, AdapterTestStatus } from '@/hooks/useEinstellungen';

interface AdapterKarteProps {
  adapterId: KiAdapterId;
  label: string;
  apiKeyLabel?: string;
  modellPlaceholder: string;
  apiKey: string;
  modell: string;
  testStatus: AdapterTestStatus;
  onApiKeyChange: (v: string) => void;
  onModellChange: (v: string) => void;
  onTest: () => void;
}

export function AdapterKarte({
  adapterId,
  label,
  apiKeyLabel = 'API-Key',
  modellPlaceholder,
  apiKey,
  modell,
  testStatus,
  onApiKeyChange,
  onModellChange,
  onTest,
}: AdapterKarteProps): JSX.Element {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center gap-2">
        <span className="font-semibold text-[#1e3a5f]">{label}</span>
        <span className="rounded bg-gray-100 px-2 py-0.5 text-xs font-mono text-gray-500">
          {adapterId}
        </span>
      </div>

      <div className="space-y-3">
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-600">{apiKeyLabel}</label>
          <input
            type="password"
            value={apiKey}
            onChange={(e) => onApiKeyChange(e.target.value)}
            placeholder="sk-..."
            className="w-full rounded border border-gray-300 px-3 py-1.5 text-sm font-mono focus:border-[#1e3a5f] focus:outline-none"
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-gray-600">
            Modell <span className="text-gray-400">(leer = Standard: {modellPlaceholder})</span>
          </label>
          <input
            type="text"
            value={modell}
            onChange={(e) => onModellChange(e.target.value)}
            placeholder={modellPlaceholder}
            className="w-full rounded border border-gray-300 px-3 py-1.5 text-sm font-mono focus:border-[#1e3a5f] focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onTest}
            disabled={testStatus.loading}
            className="rounded bg-[#1e3a5f] px-3 py-1.5 text-xs font-medium text-white hover:bg-[#2a4f7f] disabled:opacity-50"
          >
            {testStatus.loading ? 'Teste…' : 'Verbindung testen'}
          </button>
          {testStatus.ok !== undefined && (
            <span
              className={`text-xs font-medium ${testStatus.ok ? 'text-green-600' : 'text-red-600'}`}
            >
              {testStatus.ok ? '✓ ' : '✗ '}
              {testStatus.info ?? (testStatus.ok ? 'OK' : 'Fehler')}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
