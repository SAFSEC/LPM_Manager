import { useState, useCallback, useEffect } from 'react';
import type { NavigationsTyp } from '@/types/wissensbasis';

interface KiState {
  loading: boolean;
  text: string;
  tiefe: 'kurz' | 'ausfuehrlich';
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

  useEffect(() => {
    window.lpm.ki.onChunk((chunk) => {
      const c = chunk as { text?: string; done?: boolean; error?: string };
      if (c.error) {
        setKiState((s) => ({ ...s, loading: false }));
        setKiError(c.error ?? 'KI-Fehler');
        return;
      }
      if (c.text) {
        setKiState((s) => ({ ...s, text: s.text + c.text }));
      }
      if (c.done) {
        setKiState((s) => ({ ...s, loading: false }));
      }
    });
    return () => {
      window.lpm.ki.offChunk();
    };
  }, []);

  const erklaeren = useCallback(
    async (titel: string, tiefe: 'kurz' | 'ausfuehrlich') => {
      setKiState({ loading: true, text: '', tiefe });
      setKiError(null);

      try {
        await window.lpm.ki.anfrage({
          useCase: 'ERKLAERUNG',
          prompt: titel,
          tiefe,
        });
      } catch {
        setKiState((s) => ({ ...s, loading: false }));
        setKiError('KI-Anfrage fehlgeschlagen');
      }
    },
    []
  );

  const kiZuruecksetzen = useCallback(() => {
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
