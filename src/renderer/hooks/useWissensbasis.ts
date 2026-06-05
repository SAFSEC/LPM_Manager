import { useState, useCallback } from 'react';
import type { NavigationsTyp } from '@/types/wissensbasis';

interface KiState {
  loading: boolean;
  text: string;
  tiefe: 'kurz' | 'ausfuehrlich';
}

function erklaerungPrompt(titel: string, tiefe: 'kurz' | 'ausfuehrlich'): string {
  return `Erkläre den folgenden Abschnitt aus dem Buch "Loss Prevention Management und das Insider-Risiko":

ABSCHNITT: ${titel}
TIEFE: ${tiefe === 'kurz' ? 'Kurze Zusammenfassung (3–5 Sätze)' : 'Ausführliche Erklärung mit Praxisbezug'}

Antworte strukturiert und praxisnah.`.trim();
}

export function useWissensbasis() {
  const [navigation, setNavigation] = useState<NavigationsTyp>({ typ: 'overview' });
  const [kiState, setKiState] = useState<KiState>({ loading: false, text: '', tiefe: 'kurz' });
  const [kiError, setKiError] = useState<string | null>(null);

  const navigiereTo = useCallback((nav: NavigationsTyp) => {
    setNavigation(nav);
    setKiState({ loading: false, text: '', tiefe: 'kurz' });
    setKiError(null);
  }, []);

  const erklaeren = useCallback(async (titel: string, tiefe: 'kurz' | 'ausfuehrlich') => {
    setKiState({ loading: true, text: '', tiefe });
    setKiError(null);

    const prompt = erklaerungPrompt(titel, tiefe);
    let streamedText = '';

    try {
      await new Promise<void>((resolve, reject) => {
        window.lpm.ki.onChunk((raw) => {
          const chunk = raw as { type?: string; text?: string; error?: string };
          if (chunk.type === 'error') {
            window.lpm.ki.offChunk();
            reject(new Error(chunk.error ?? 'KI-Fehler'));
          } else if (chunk.type === 'done') {
            window.lpm.ki.offChunk();
            resolve();
          } else if (chunk.text) {
            streamedText += chunk.text;
            setKiState((s) => ({ ...s, text: streamedText }));
          }
        });

        window.lpm.ki
          .anfrage({ useCase: 'ERKLAERUNG', prompt })
          .then((res) => {
            if (!res.success) {
              window.lpm.ki.offChunk();
              reject(new Error(res.error ?? 'KI-Anfrage fehlgeschlagen'));
            }
          })
          .catch((err: unknown) => {
            window.lpm.ki.offChunk();
            reject(err instanceof Error ? err : new Error('KI-Fehler'));
          });
      });
    } catch (err) {
      setKiError(err instanceof Error ? err.message : 'KI-Erklärung fehlgeschlagen');
    } finally {
      setKiState((s) => ({ ...s, loading: false }));
    }
  }, []);

  const kiZuruecksetzen = useCallback(() => {
    window.lpm.ki.offChunk();
    setKiState({ loading: false, text: '', tiefe: 'kurz' });
    setKiError(null);
  }, []);

  return {
    navigation,
    navigiereTo,
    kiLoading: kiState.loading,
    kiText: kiState.text,
    kiTiefe: kiState.tiefe,
    kiError,
    erklaeren,
    kiZuruecksetzen,
  };
}
