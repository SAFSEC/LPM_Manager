import { useEffect, useState } from 'react';
import { IpcError, unwrapIpc } from '@/lib/ipc';

export type KiModus = 'lokal' | 'extern';

const USE_CASES = ['erklaerung', 'zusammenfassung', 'empfehlung', 'risiko'] as const;
const DEFAULTS: Record<(typeof USE_CASES)[number], string> = {
  erklaerung: 'ollama',
  zusammenfassung: 'ollama',
  empfehlung: 'ollama',
  risiko: 'anthropic',
};

function resolveEffectiveAdapter(
  settings: Record<string, string>,
  useCase: (typeof USE_CASES)[number]
): string {
  const fromDb = settings[`ki.adapter.${useCase}`];
  return fromDb ?? DEFAULTS[useCase];
}

export function useKiModus(): { modus: KiModus; loading: boolean } {
  const [modus, setModus] = useState<KiModus>('extern');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load(): Promise<void> {
      try {
        const result = await window.lpm.einstellungen.laden();
        const settings = unwrapIpc(result);
        const adapters = USE_CASES.map((uc) => resolveEffectiveAdapter(settings, uc));
        const allLocal = adapters.every((a) => a === 'ollama');
        if (!cancelled) {
          setModus(allLocal ? 'lokal' : 'extern');
        }
      } catch (err) {
        if (!cancelled) {
          setModus(err instanceof IpcError ? 'extern' : 'extern');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  return { modus, loading };
}
