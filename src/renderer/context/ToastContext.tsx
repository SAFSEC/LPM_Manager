import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

interface ToastState {
  message: string;
  type: 'error' | 'success' | 'info';
}

interface ToastContextValue {
  toast: ToastState | null;
  showToast: (message: string, type?: ToastState['type']) => void;
  clearToast: () => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: ReactNode }): JSX.Element {
  const [toast, setToast] = useState<ToastState | null>(null);

  const showToast = useCallback((message: string, type: ToastState['type'] = 'error') => {
    setToast({ message, type });
    window.setTimeout(() => setToast(null), 5000);
  }, []);

  const clearToast = useCallback(() => setToast(null), []);

  const value = useMemo(
    () => ({ toast, showToast, clearToast }),
    [toast, showToast, clearToast]
  );

  return <ToastContext.Provider value={value}>{children}</ToastContext.Provider>;
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('useToast muss innerhalb von ToastProvider verwendet werden');
  }
  return ctx;
}
