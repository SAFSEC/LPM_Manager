import { useState, useCallback, useEffect, useRef } from 'react';
import { unwrapIpc, IpcError } from '@/lib/ipc';
import type { AnlageMeta, RunDetail, BewertungWert, AntwortState } from '@/types/checkliste';

type Phase = 'auswahl' | 'run';

interface UseChecklisteReturn {
  phase: Phase;
  anlagen: AnlageMeta[];
  laufendeRunIds: Record<string, number>;
  currentDetail: RunDetail | null;
  antwortStates: Record<string, AntwortState>;
  loading: boolean;
  abschliessenLoading: boolean;
  kiGenerating: boolean;
  kiStreamText: string;
  error: string | null;
  startOrLoadRun: (anlageId: string, runId?: number) => Promise<void>;
  backToAuswahl: () => void;
  handleBewertungChange: (frageId: string, bewertung: BewertungWert) => void;
  handleKommentarChange: (frageId: string, kommentar: string) => void;
  handleKommentarBlur: (frageId: string) => void;
  handleAbschliessen: () => Promise<void>;
  handleKiGenerate: () => Promise<void>;
}

function patchState(
  prev: Record<string, AntwortState>,
  frageId: string,
  patch: Partial<AntwortState>
): Record<string, AntwortState> {
  const existing = prev[frageId];
  const merged: AntwortState = {
    bewertung: patch.bewertung !== undefined ? patch.bewertung : (existing?.bewertung ?? null),
    kommentar: patch.kommentar !== undefined ? patch.kommentar : (existing?.kommentar ?? ''),
    saving: patch.saving !== undefined ? patch.saving : (existing?.saving ?? false),
  };
  return { ...prev, [frageId]: merged };
}

function buildInitialStates(detail: RunDetail): Record<string, AntwortState> {
  const states: Record<string, AntwortState> = {};
  for (const frage of detail.anlage.fragen) {
    const antwort = detail.antworten.find((a) => a.frageId === frage.frageId);
    states[frage.frageId] = {
      bewertung: (antwort?.bewertung as BewertungWert | null) ?? null,
      kommentar: antwort?.kommentar ?? '',
      saving: false,
    };
  }
  return states;
}

function buildZusammenfassungPrompt(detail: RunDetail, states: Record<string, AntwortState>): string {
  const findings: string[] = [];
  for (const frage of detail.anlage.fragen) {
    const s = states[frage.frageId];
    if (s?.bewertung === 'instabil' || s?.bewertung === 'eingeschraenkt') {
      const bewLabel = s.bewertung === 'instabil' ? 'INSTABIL' : 'EINGESCHRÄNKT';
      const komm = s.kommentar ? ` (Kommentar: ${s.kommentar})` : '';
      findings.push(`- [${bewLabel}] ${frage.abschnitt}: ${frage.frageText}${komm}`);
    }
  }

  const instabilCount = Object.values(states).filter((s) => s.bewertung === 'instabil').length;
  const eingeschraenktCount = Object.values(states).filter((s) => s.bewertung === 'eingeschraenkt').length;
  const gesamtbewertung =
    instabilCount > 0 ? 'kritisch' : eingeschraenktCount > 0 ? 'gemischt' : 'stabil';

  return [
    `Erstelle eine professionelle Management-Zusammenfassung für folgende LPM-Prüfung:`,
    ``,
    `ANLAGE: ${detail.anlage.anlageId} – ${detail.anlage.name}`,
    `GESAMTBEWERTUNG: ${gesamtbewertung}`,
    ``,
    `FINDINGS (${findings.length} identifizierte Schwachstellen):`,
    findings.length > 0 ? findings.join('\n') : '- Keine kritischen Findings',
    ``,
    `Erstelle:`,
    `1. Management-Zusammenfassung (3–5 Sätze, Führungsebene)`,
    `2. Priorisierte Handlungsempfehlungen (nach Dringlichkeit)`,
    `3. Positiv-Fazit (was funktioniert bereits gut)`,
    ``,
    `Ton: professionell, sachlich, lösungsorientiert.`,
  ].join('\n');
}

export function useCheckliste(mandantId: string | null): UseChecklisteReturn {
  const [phase, setPhase] = useState<Phase>('auswahl');
  const [anlagen, setAnlagen] = useState<AnlageMeta[]>([]);
  const [laufendeRunIds, setLaufendeRunIds] = useState<Record<string, number>>({});
  const [currentDetail, setCurrentDetail] = useState<RunDetail | null>(null);
  const [antwortStates, setAntwortStates] = useState<Record<string, AntwortState>>({});
  const [loading, setLoading] = useState(false);
  const [abschliessenLoading, setAbschliessenLoading] = useState(false);
  const [kiGenerating, setKiGenerating] = useState(false);
  const [kiStreamText, setKiStreamText] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Refs to avoid stale closures in async operations
  const currentDetailRef = useRef<RunDetail | null>(null);
  const antwortStatesRef = useRef<Record<string, AntwortState>>({});
  const saveTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  useEffect(() => {
    currentDetailRef.current = currentDetail;
  }, [currentDetail]);

  useEffect(() => {
    antwortStatesRef.current = antwortStates;
  }, [antwortStates]);

  const refreshRuns = useCallback(async (mid: string) => {
    try {
      const res = await window.lpm.checklisten.runsVonMandant({ mandant_id: mid });
      const runs = unwrapIpc(res) as Array<{ anlageId: string; id: number; status: string }>;
      const laufend: Record<string, number> = {};
      for (const r of runs) {
        if (r.status === 'in_bearbeitung' || r.status === 'offen') {
          if (!laufend[r.anlageId]) laufend[r.anlageId] = r.id;
        }
      }
      setLaufendeRunIds(laufend);
    } catch {
      // Non-critical
    }
  }, []);

  useEffect(() => {
    if (!mandantId) return;
    let cancelled = false;
    setLoading(true);
    Promise.all([
      window.lpm.checklisten.anlagenListe().then((res) => {
        if (!cancelled) setAnlagen(unwrapIpc(res) as AnlageMeta[]);
      }),
      refreshRuns(mandantId),
    ])
      .catch((err: unknown) => {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Fehler beim Laden');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [mandantId, refreshRuns]);

  const startOrLoadRun = useCallback(
    async (anlageId: string, runId?: number) => {
      if (!mandantId) { setError('Kein Mandant ausgewählt'); return; }
      setLoading(true);
      setError(null);
      try {
        let detail: RunDetail;
        if (runId) {
          detail = unwrapIpc(await window.lpm.checklisten.runLaden({ run_id: runId })) as RunDetail;
        } else {
          detail = unwrapIpc(
            await window.lpm.checklisten.runStarten({ mandant_id: mandantId, anlage_id: anlageId })
          ) as RunDetail;
        }
        setCurrentDetail(detail);
        const states = buildInitialStates(detail);
        setAntwortStates(states);
        antwortStatesRef.current = states;
        currentDetailRef.current = detail;
        if (detail.run.kiZusammenfassung) setKiStreamText(detail.run.kiZusammenfassung);
        else setKiStreamText('');
        setPhase('run');
        if (!runId) void refreshRuns(mandantId);
      } catch (err) {
        setError(err instanceof IpcError ? err.message : 'Fehler beim Starten der Prüfung');
      } finally {
        setLoading(false);
      }
    },
    [mandantId, refreshRuns]
  );

  const backToAuswahl = useCallback(() => {
    setPhase('auswahl');
    setCurrentDetail(null);
    setAntwortStates({});
    setKiStreamText('');
  }, []);

  const saveAntwortInternal = useCallback(async (frageId: string) => {
    const detail = currentDetailRef.current;
    const s = antwortStatesRef.current[frageId];
    if (!detail || !mandantId || !s) return;
    const frage = detail.anlage.fragen.find((f) => f.frageId === frageId);
    if (!frage) return;

    setAntwortStates((prev) => patchState(prev, frageId, { saving: true }));
    try {
      await window.lpm.checklisten.antwortSpeichern({
        run_id: detail.run.id,
        mandant_id: mandantId,
        frage_id: frageId,
        abschnitt: frage.abschnitt,
        frage_text: frage.frageText,
        bewertung: s.bewertung,
        kommentar: s.kommentar || null,
      });
    } catch {
      // Silent – next save will retry
    } finally {
      setAntwortStates((prev) => patchState(prev, frageId, { saving: false }));
    }
  }, [mandantId]);

  const handleBewertungChange = useCallback((frageId: string, bewertung: BewertungWert) => {
    setAntwortStates((prev) => {
      const next = patchState(prev, frageId, { bewertung });
      antwortStatesRef.current = next;
      return next;
    });
    if (saveTimers.current[frageId]) clearTimeout(saveTimers.current[frageId]);
    saveTimers.current[frageId] = setTimeout(() => { void saveAntwortInternal(frageId); }, 500);
  }, [saveAntwortInternal]);

  const handleKommentarChange = useCallback((frageId: string, kommentar: string) => {
    setAntwortStates((prev) => {
      const next = patchState(prev, frageId, { kommentar });
      antwortStatesRef.current = next;
      return next;
    });
  }, []);

  const handleKommentarBlur = useCallback((frageId: string) => {
    void saveAntwortInternal(frageId);
  }, [saveAntwortInternal]);

  const handleAbschliessen = useCallback(async () => {
    const detail = currentDetailRef.current;
    if (!detail) return;
    setAbschliessenLoading(true);
    try {
      const updated = unwrapIpc(
        await window.lpm.checklisten.runAbschliessen({ run_id: detail.run.id })
      ) as RunDetail;
      setCurrentDetail(updated);
      currentDetailRef.current = updated;
      const states = buildInitialStates(updated);
      setAntwortStates(states);
      antwortStatesRef.current = states;
      if (mandantId) void refreshRuns(mandantId);
    } catch (err) {
      setError(err instanceof IpcError ? err.message : 'Fehler beim Abschließen');
    } finally {
      setAbschliessenLoading(false);
    }
  }, [mandantId, refreshRuns]);

  const handleKiGenerate = useCallback(async () => {
    const detail = currentDetailRef.current;
    const states = antwortStatesRef.current;
    if (!detail || !mandantId) return;

    setKiGenerating(true);
    setKiStreamText('');

    const prompt = buildZusammenfassungPrompt(detail, states);
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
            setKiStreamText(streamedText);
          }
        });

        window.lpm.ki
          .anfrage({ useCase: 'ZUSAMMENFASSUNG', prompt })
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

      // Persist result
      const saved = unwrapIpc(
        await window.lpm.checklisten.kiSpeichern({
          run_id: detail.run.id,
          ki_zusammenfassung: streamedText,
          ki_adapter: 'ollama',
        })
      ) as RunDetail;

      setCurrentDetail(saved);
      currentDetailRef.current = saved;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'KI-Zusammenfassung fehlgeschlagen');
    } finally {
      setKiGenerating(false);
    }
  }, [mandantId]);

  return {
    phase,
    anlagen,
    laufendeRunIds,
    currentDetail,
    antwortStates,
    loading,
    abschliessenLoading,
    kiGenerating,
    kiStreamText,
    error,
    startOrLoadRun,
    backToAuswahl,
    handleBewertungChange,
    handleKommentarChange,
    handleKommentarBlur,
    handleAbschliessen,
    handleKiGenerate,
  };
}
