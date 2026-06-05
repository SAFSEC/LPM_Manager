import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { IpcError, unwrapIpc } from '@/lib/ipc';
import type { Mandant, MandantCreate, MandantUpdate } from '@/types/mandant';
import { useToast } from './ToastContext';

const STORAGE_KEY = 'lpm.activeMandantId';

interface MandantContextValue {
  mandanten: Mandant[];
  aktivMandanten: Mandant[];
  loading: boolean;
  activeMandantId: string | null;
  activeMandant: Mandant | null;
  setActiveMandantId: (id: string | null) => void;
  refreshMandanten: (mitArchiviert?: boolean) => Promise<void>;
  createMandant: (input: MandantCreate) => Promise<Mandant>;
  updateMandant: (input: MandantUpdate) => Promise<Mandant>;
  archivierenMandant: (mandantId: string) => Promise<void>;
}

const MandantContext = createContext<MandantContextValue | null>(null);

export function MandantProvider({ children }: { children: ReactNode }): JSX.Element {
  const { showToast } = useToast();
  const [mandanten, setMandanten] = useState<Mandant[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeMandantId, setActiveMandantIdState] = useState<string | null>(() => {
    return localStorage.getItem(STORAGE_KEY);
  });

  const setActiveMandantId = useCallback((id: string | null) => {
    setActiveMandantIdState(id);
    if (id) {
      localStorage.setItem(STORAGE_KEY, id);
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  const refreshMandanten = useCallback(
    async (mitArchiviert = true) => {
      setLoading(true);
      try {
        const result = await window.lpm.mandanten.liste({ mit_archiviert: mitArchiviert });
        const list = unwrapIpc(result) as Mandant[];
        setMandanten(list);
      } catch (err) {
        const message =
          err instanceof IpcError ? err.message : 'Mandanten konnten nicht geladen werden';
        showToast(message);
      } finally {
        setLoading(false);
      }
    },
    [showToast]
  );

  useEffect(() => {
    void refreshMandanten();
  }, [refreshMandanten]);

  useEffect(() => {
    if (!activeMandantId || mandanten.length === 0) {
      return;
    }
    const stillActive = mandanten.find((m) => m.mandant_id === activeMandantId && m.aktiv);
    if (!stillActive) {
      const firstActive = mandanten.find((m) => m.aktiv);
      setActiveMandantId(firstActive?.mandant_id ?? null);
    }
  }, [mandanten, activeMandantId, setActiveMandantId]);

  const createMandant = useCallback(
    async (input: MandantCreate) => {
      try {
        const result = await window.lpm.mandanten.erstellen(input);
        const created = unwrapIpc(result) as Mandant;
        await refreshMandanten();
        setActiveMandantId(created.mandant_id);
        showToast(`Mandant „${created.name}" angelegt`, 'success');
        return created;
      } catch (err) {
        console.error('[createMandant]', err);
        const message =
          err instanceof IpcError
            ? err.message
            : err instanceof Error
              ? err.message
              : typeof err === 'string'
                ? err
                : 'Mandant konnte nicht angelegt werden';
        showToast(message);
        throw new IpcError(message);
      }
    },
    [refreshMandanten, setActiveMandantId, showToast]
  );

  const updateMandant = useCallback(
    async (input: MandantUpdate) => {
      try {
        const result = await window.lpm.mandanten.aktualisieren(input);
        const updated = unwrapIpc(result) as Mandant;
        await refreshMandanten();
        showToast(`Mandant „${updated.name}" gespeichert`, 'success');
        return updated;
      } catch (err) {
        console.error('[updateMandant]', err);
        const message =
          err instanceof IpcError
            ? err.message
            : err instanceof Error
              ? err.message
              : typeof err === 'string'
                ? err
                : 'Mandant konnte nicht gespeichert werden';
        showToast(message);
        throw new IpcError(message);
      }
    },
    [refreshMandanten, showToast]
  );

  const archivierenMandant = useCallback(
    async (mandantId: string) => {
      const result = await window.lpm.mandanten.archivieren({ mandant_id: mandantId });
      unwrapIpc(result);
      if (activeMandantId === mandantId) {
        setActiveMandantId(null);
      }
      await refreshMandanten();
      showToast('Mandant archiviert', 'info');
    },
    [activeMandantId, refreshMandanten, setActiveMandantId, showToast]
  );

  const aktivMandanten = useMemo(() => mandanten.filter((m) => m.aktiv), [mandanten]);

  const activeMandant = useMemo(
    () => aktivMandanten.find((m) => m.mandant_id === activeMandantId) ?? null,
    [aktivMandanten, activeMandantId]
  );

  const value = useMemo(
    () => ({
      mandanten,
      aktivMandanten,
      loading,
      activeMandantId,
      activeMandant,
      setActiveMandantId,
      refreshMandanten,
      createMandant,
      updateMandant,
      archivierenMandant,
    }),
    [
      mandanten,
      aktivMandanten,
      loading,
      activeMandantId,
      activeMandant,
      setActiveMandantId,
      refreshMandanten,
      createMandant,
      updateMandant,
      archivierenMandant,
    ]
  );

  return <MandantContext.Provider value={value}>{children}</MandantContext.Provider>;
}

export function useMandant(): MandantContextValue {
  const ctx = useContext(MandantContext);
  if (!ctx) {
    throw new Error('useMandant muss innerhalb von MandantProvider verwendet werden');
  }
  return ctx;
}
