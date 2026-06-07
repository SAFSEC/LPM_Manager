import { useState, useEffect, useCallback, useRef } from 'react';

export type KiAdapterId = 'ollama' | 'anthropic' | 'openai' | 'gemini' | 'openrouter';

export interface AdapterTestStatus {
  loading: boolean;
  ok?: boolean;
  info?: string;
}

const ADAPTER_IDS: KiAdapterId[] = ['ollama', 'anthropic', 'openai', 'gemini', 'openrouter'];

function initialTestStatus(): Record<KiAdapterId, AdapterTestStatus> {
  return Object.fromEntries(ADAPTER_IDS.map((id) => [id, { loading: false }])) as Record<
    KiAdapterId,
    AdapterTestStatus
  >;
}

export function useEinstellungen() {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [fehler, setFehler] = useState<string | null>(null);
  const [testStatus, setTestStatus] = useState<Record<KiAdapterId, AdapterTestStatus>>(
    initialTestStatus
  );
  const saveTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  useEffect(() => {
    void window.lpm.einstellungen.laden().then((res) => {
      if (res.success && res.data) {
        setSettings(res.data as Record<string, string>);
      } else {
        setFehler((res.error as string | undefined) ?? 'Einstellungen konnten nicht geladen werden');
      }
      setLoading(false);
    });
  }, []);

  const setSetting = useCallback((schluessel: string, wert: string) => {
    setSettings((prev) => ({ ...prev, [schluessel]: wert }));
    clearTimeout(saveTimers.current[schluessel]);
    saveTimers.current[schluessel] = setTimeout(() => {
      void window.lpm.einstellungen.speichern({ schluessel, wert });
    }, 700);
  }, []);

  const adapterTesten = useCallback(async (adapter: KiAdapterId) => {
    setTestStatus((prev) => ({ ...prev, [adapter]: { loading: true } }));
    const res = await window.lpm.ki.adapterTesten({ adapter });
    const data = res.data as { ok: boolean; info?: string } | undefined;
    setTestStatus((prev) => ({
      ...prev,
      [adapter]: {
        loading: false,
        ok: res.success ? (data?.ok ?? false) : false,
        info: data?.info ?? (res.error as string | undefined),
      },
    }));
  }, []);

  const get = useCallback(
    (key: string, fallback = '') => settings[key] ?? fallback,
    [settings]
  );

  return { settings, loading, fehler, setSetting, get, testStatus, adapterTesten };
}
