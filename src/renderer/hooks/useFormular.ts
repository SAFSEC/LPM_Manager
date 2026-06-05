import { useState, useCallback, useEffect, useRef } from 'react';
import { unwrapIpc, IpcError } from '@/lib/ipc';
import type { FormularDefinition, FormularRow } from '@/types/formular';

type Phase = 'auswahl' | 'editor';

interface FormularState {
  phase: Phase;
  katalog: FormularDefinition[];
  katalogLoading: boolean;
  gespeicherteFormulare: FormularRow[];
  listLoading: boolean;
  selectedFormular: FormularDefinition | null;
  currentRow: FormularRow | null;
  felder: Record<string, string>;
  saveLoading: boolean;
  finalisiereLoading: boolean;
  exportWordLoading: boolean;
  exportPdfLoading: boolean;
  letzterExport: { dateiname: string; dateipfad: string } | null;
  error: string | null;
}

const initial: FormularState = {
  phase: 'auswahl',
  katalog: [],
  katalogLoading: false,
  gespeicherteFormulare: [],
  listLoading: false,
  selectedFormular: null,
  currentRow: null,
  felder: {},
  saveLoading: false,
  finalisiereLoading: false,
  exportWordLoading: false,
  exportPdfLoading: false,
  letzterExport: null,
  error: null,
};

export function useFormular(mandantId: string | null) {
  const [state, setState] = useState<FormularState>(initial);
  const autoSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const currentRowRef = useRef<FormularRow | null>(null);
  const mandantIdRef = useRef<string | null>(null);

  currentRowRef.current = state.currentRow;
  mandantIdRef.current = mandantId;

  const ladeKatalog = useCallback(async () => {
    setState((s) => ({ ...s, katalogLoading: true, error: null }));
    try {
      const res = await window.lpm.formulare.katalog();
      const data = unwrapIpc(res) as FormularDefinition[];
      setState((s) => ({ ...s, katalog: data, katalogLoading: false }));
    } catch (err) {
      const msg = err instanceof IpcError ? err.message : 'Katalog konnte nicht geladen werden';
      setState((s) => ({ ...s, katalogLoading: false, error: msg }));
    }
  }, []);

  const ladeGespeicherte = useCallback(async () => {
    if (!mandantId) {
      setState((s) => ({ ...s, gespeicherteFormulare: [] }));
      return;
    }
    setState((s) => ({ ...s, listLoading: true }));
    try {
      const res = await window.lpm.formulare.vonMandant({ mandant_id: mandantId });
      const data = unwrapIpc(res) as FormularRow[];
      setState((s) => ({ ...s, gespeicherteFormulare: data, listLoading: false }));
    } catch {
      setState((s) => ({ ...s, listLoading: false, gespeicherteFormulare: [] }));
    }
  }, [mandantId]);

  useEffect(() => {
    void ladeKatalog();
  }, [ladeKatalog]);

  useEffect(() => {
    void ladeGespeicherte();
    setState((s) => ({ ...s, phase: 'auswahl', selectedFormular: null, currentRow: null, felder: {}, letzterExport: null }));
  }, [ladeGespeicherte, mandantId]);

  const neuesFormular = useCallback((definition: FormularDefinition) => {
    setState((s) => ({
      ...s,
      phase: 'editor',
      selectedFormular: definition,
      currentRow: null,
      felder: {},
      letzterExport: null,
      error: null,
    }));
  }, []);

  const vorhandenesBestehend = useCallback(async (row: FormularRow) => {
    const katalogItem = state.katalog.find((k) => k.formularId === row.formularId);
    if (!katalogItem) return;
    setState((s) => ({
      ...s,
      phase: 'editor',
      selectedFormular: katalogItem,
      currentRow: row,
      felder: { ...row.felder },
      letzterExport: null,
      error: null,
    }));
  }, [state.katalog]);

  const zurueck = useCallback(() => {
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    setState((s) => ({
      ...s,
      phase: 'auswahl',
      selectedFormular: null,
      currentRow: null,
      felder: {},
      letzterExport: null,
      error: null,
    }));
    void ladeGespeicherte();
  }, [ladeGespeicherte]);

  const speichernSofort = useCallback(async (felder: Record<string, string>): Promise<FormularRow | null> => {
    const mid = mandantIdRef.current;
    const def = state.selectedFormular;
    const row = currentRowRef.current;
    if (!mid || !def) return null;

    try {
      const res = await window.lpm.formulare.speichern({
        mandant_id: mid,
        formular_id: def.formularId,
        felder,
        id: row?.id,
      });
      const saved = unwrapIpc(res) as FormularRow;
      currentRowRef.current = saved;
      setState((s) => ({ ...s, currentRow: saved, saveLoading: false }));
      return saved;
    } catch (err) {
      const msg = err instanceof IpcError ? err.message : 'Speichern fehlgeschlagen';
      setState((s) => ({ ...s, saveLoading: false, error: msg }));
      return null;
    }
  }, [state.selectedFormular]);

  const feldAendern = useCallback((feldId: string, wert: string) => {
    setState((s) => {
      const neueFelder = { ...s.felder, [feldId]: wert };

      if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
      autoSaveTimer.current = setTimeout(() => {
        void speichernSofort(neueFelder);
      }, 800);

      return { ...s, felder: neueFelder };
    });
  }, [speichernSofort]);

  const finalisieren = useCallback(async () => {
    const row = currentRowRef.current;
    const felder = state.felder;
    if (!row && !mandantIdRef.current) return;

    setState((s) => ({ ...s, finalisiereLoading: true }));
    try {
      let aktuell = row;
      if (!aktuell) {
        aktuell = await speichernSofort(felder);
      }
      if (!aktuell) return;

      const res = await window.lpm.formulare.finalisieren({ id: aktuell.id });
      const updated = unwrapIpc(res) as FormularRow;
      currentRowRef.current = updated;
      setState((s) => ({ ...s, currentRow: updated, finalisiereLoading: false }));
      void ladeGespeicherte();
    } catch (err) {
      const msg = err instanceof IpcError ? err.message : 'Finalisieren fehlgeschlagen';
      setState((s) => ({ ...s, finalisiereLoading: false, error: msg }));
    }
  }, [state.felder, speichernSofort, ladeGespeicherte]);

  const exportWord = useCallback(async () => {
    const mid = mandantIdRef.current;
    let row = currentRowRef.current;
    if (!mid) return;

    setState((s) => ({ ...s, exportWordLoading: true, error: null, letzterExport: null }));
    try {
      if (!row) {
        row = await speichernSofort(state.felder);
      }
      if (!row) return;

      const res = await window.lpm.export.word({
        typ: 'formular',
        referenz_id: row.id,
        mandant_id: mid,
      });
      const data = unwrapIpc(res) as { dateiname: string; dateipfad: string };
      setState((s) => ({ ...s, exportWordLoading: false, letzterExport: data }));
    } catch (err) {
      const msg = err instanceof IpcError ? err.message : 'Word-Export fehlgeschlagen';
      setState((s) => ({ ...s, exportWordLoading: false, error: msg }));
    }
  }, [state.felder, speichernSofort]);

  const exportPdf = useCallback(async () => {
    const mid = mandantIdRef.current;
    let row = currentRowRef.current;
    if (!mid) return;

    setState((s) => ({ ...s, exportPdfLoading: true, error: null, letzterExport: null }));
    try {
      if (!row) {
        row = await speichernSofort(state.felder);
      }
      if (!row) return;

      const res = await window.lpm.export.pdf({
        typ: 'formular',
        referenz_id: row.id,
        mandant_id: mid,
      });
      const data = unwrapIpc(res) as { dateiname: string; dateipfad: string };
      setState((s) => ({ ...s, exportPdfLoading: false, letzterExport: data }));
    } catch (err) {
      const msg = err instanceof IpcError ? err.message : 'PDF-Export fehlgeschlagen';
      setState((s) => ({ ...s, exportPdfLoading: false, error: msg }));
    }
  }, [state.felder, speichernSofort]);

  const dateiOeffnen = useCallback(async (dateipfad: string) => {
    try {
      await window.lpm.export.dateiOeffnen({ dateipfad });
    } catch {
      // ignore
    }
  }, []);

  const loeschen = useCallback(async (id: number) => {
    const mid = mandantIdRef.current;
    if (!mid) return;
    try {
      await window.lpm.formulare.loeschen({ id, mandant_id: mid });
      void ladeGespeicherte();
    } catch {
      // ignore
    }
  }, [ladeGespeicherte]);

  return {
    ...state,
    neuesFormular,
    vorhandenesBestehend,
    zurueck,
    feldAendern,
    finalisieren,
    exportWord,
    exportPdf,
    dateiOeffnen,
    loeschen,
    ladeGespeicherte,
  };
}
