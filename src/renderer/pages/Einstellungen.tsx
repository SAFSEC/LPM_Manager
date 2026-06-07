import { useEinstellungen } from '@/hooks/useEinstellungen';
import { AdapterKarte } from '@/components/einstellungen/AdapterKarte';

const USE_CASES = [
  { key: 'erklaerung', label: 'Wissensbasis-Erklärung' },
  { key: 'zusammenfassung', label: 'Checklisten-Zusammenfassung' },
  { key: 'empfehlung', label: 'Maßnahmen-Empfehlung' },
  { key: 'risiko', label: 'Risikoeinschätzung' },
] as const;

const ADAPTER_OPTIONS = [
  { value: 'ollama', label: '🟢 Ollama (lokal)' },
  { value: 'anthropic', label: '🤖 Anthropic Claude' },
  { value: 'openai', label: '🤖 OpenAI GPT' },
  { value: 'gemini', label: '🤖 Google Gemini' },
  { value: 'openrouter', label: '🔀 OpenRouter' },
] as const;

const USE_CASE_DEFAULTS: Record<string, string> = {
  erklaerung: 'ollama',
  zusammenfassung: 'ollama',
  empfehlung: 'ollama',
  risiko: 'anthropic',
};

export default function Einstellungen(): JSX.Element {
  const { loading, fehler, get, setSetting, testStatus, adapterTesten } = useEinstellungen();

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <span className="text-gray-500">Einstellungen werden geladen…</span>
      </div>
    );
  }

  if (fehler) {
    return (
      <div className="flex h-full items-center justify-center">
        <span className="text-red-600">{fehler}</span>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto bg-gray-50 p-6">
      <div className="mx-auto max-w-3xl space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-[#1e3a5f]">Einstellungen</h1>
          <p className="mt-1 text-sm text-gray-500">
            KI-Adapter, API-Keys und Verbindungsoptionen konfigurieren
          </p>
        </div>

        {/* KI-Adapter je Aufgabe */}
        <section>
          <h2 className="mb-3 text-base font-semibold text-[#1e3a5f]">KI-Adapter je Aufgabe</h2>
          <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
            {USE_CASES.map(({ key, label }, idx) => (
              <div
                key={key}
                className={`flex items-center justify-between px-4 py-3 ${idx < USE_CASES.length - 1 ? 'border-b border-gray-100' : ''}`}
              >
                <span className="text-sm font-medium text-gray-700">{label}</span>
                <select
                  value={get(`ki.adapter.${key}`, USE_CASE_DEFAULTS[key] ?? 'ollama')}
                  onChange={(e) => setSetting(`ki.adapter.${key}`, e.target.value)}
                  className="rounded border border-gray-300 px-2 py-1 text-sm focus:border-[#1e3a5f] focus:outline-none"
                >
                  {ADAPTER_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>
        </section>

        {/* Ollama (Lokal) */}
        <section>
          <h2 className="mb-3 text-base font-semibold text-[#1e3a5f]">Ollama (Lokal)</h2>
          <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
            <div className="mb-3">
              <label className="mb-1 block text-xs font-medium text-gray-600">
                Ollama-URL{' '}
                <span className="text-gray-400">(Standard: http://localhost:11434)</span>
              </label>
              <input
                type="text"
                value={get('ki.baseurl.ollama', 'http://localhost:11434')}
                onChange={(e) => setSetting('ki.baseurl.ollama', e.target.value)}
                placeholder="http://localhost:11434"
                className="w-full rounded border border-gray-300 px-3 py-1.5 text-sm font-mono focus:border-[#1e3a5f] focus:outline-none"
              />
            </div>
            <div className="mb-3">
              <label className="mb-1 block text-xs font-medium text-gray-600">
                Modell <span className="text-gray-400">(Standard: llama3.2)</span>
              </label>
              <input
                type="text"
                value={get('ki.modell.ollama', '')}
                onChange={(e) => setSetting('ki.modell.ollama', e.target.value)}
                placeholder="llama3.2"
                className="w-full rounded border border-gray-300 px-3 py-1.5 text-sm font-mono focus:border-[#1e3a5f] focus:outline-none"
              />
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => void adapterTesten('ollama')}
                disabled={testStatus.ollama.loading}
                className="rounded bg-[#1e3a5f] px-3 py-1.5 text-xs font-medium text-white hover:bg-[#2a4f7f] disabled:opacity-50"
              >
                {testStatus.ollama.loading ? 'Teste…' : 'Verbindung testen'}
              </button>
              {testStatus.ollama.ok !== undefined && (
                <span
                  className={`text-xs font-medium ${testStatus.ollama.ok ? 'text-green-600' : 'text-red-600'}`}
                >
                  {testStatus.ollama.ok ? '✓ ' : '✗ '}
                  {testStatus.ollama.info ?? (testStatus.ollama.ok ? 'OK' : 'Fehler')}
                </span>
              )}
            </div>
          </div>
        </section>

        {/* Externe Adapter */}
        <section>
          <h2 className="mb-3 text-base font-semibold text-[#1e3a5f]">Externe Adapter</h2>
          <p className="mb-4 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded px-3 py-2">
            ⚠️ Externe Adapter senden Daten an Cloud-Dienste. Der Privacy-Filter pseudonymisiert
            automatisch alle Mandantendaten vor dem Senden.
          </p>
          <div className="space-y-4">
            <AdapterKarte
              adapterId="anthropic"
              label="Anthropic Claude"
              modellPlaceholder="claude-sonnet-4-6"
              apiKey={get('ki.apikey.anthropic', '')}
              modell={get('ki.modell.anthropic', '')}
              testStatus={testStatus.anthropic}
              onApiKeyChange={(v) => setSetting('ki.apikey.anthropic', v)}
              onModellChange={(v) => setSetting('ki.modell.anthropic', v)}
              onTest={() => void adapterTesten('anthropic')}
            />
            <AdapterKarte
              adapterId="openai"
              label="OpenAI GPT"
              modellPlaceholder="gpt-4o"
              apiKey={get('ki.apikey.openai', '')}
              modell={get('ki.modell.openai', '')}
              testStatus={testStatus.openai}
              onApiKeyChange={(v) => setSetting('ki.apikey.openai', v)}
              onModellChange={(v) => setSetting('ki.modell.openai', v)}
              onTest={() => void adapterTesten('openai')}
            />
            <AdapterKarte
              adapterId="gemini"
              label="Google Gemini"
              modellPlaceholder="gemini-2.0-flash"
              apiKey={get('ki.apikey.gemini', '')}
              modell={get('ki.modell.gemini', '')}
              testStatus={testStatus.gemini}
              onApiKeyChange={(v) => setSetting('ki.apikey.gemini', v)}
              onModellChange={(v) => setSetting('ki.modell.gemini', v)}
              onTest={() => void adapterTesten('gemini')}
            />
            <AdapterKarte
              adapterId="openrouter"
              label="OpenRouter"
              modellPlaceholder="anthropic/claude-sonnet-4-6"
              apiKey={get('ki.apikey.openrouter', '')}
              modell={get('ki.modell.openrouter', '')}
              testStatus={testStatus.openrouter}
              onApiKeyChange={(v) => setSetting('ki.apikey.openrouter', v)}
              onModellChange={(v) => setSetting('ki.modell.openrouter', v)}
              onTest={() => void adapterTesten('openrouter')}
            />
          </div>
        </section>
      </div>
    </div>
  );
}
