import { useToast } from '@/context/ToastContext';

export function Toast(): JSX.Element | null {
  const { toast, clearToast } = useToast();
  if (!toast) {
    return null;
  }

  const styles =
    toast.type === 'success'
      ? 'border-green-200 bg-green-50 text-green-900'
      : toast.type === 'info'
        ? 'border-blue-200 bg-blue-50 text-blue-900'
        : 'border-red-200 bg-red-50 text-red-900';

  return (
    <div className="pointer-events-none fixed bottom-10 left-1/2 z-50 -translate-x-1/2 px-4">
      <div
        className={`pointer-events-auto flex max-w-lg items-start gap-3 rounded-lg border px-4 py-3 shadow-lg ${styles}`}
        role="alert"
      >
        <p className="flex-1 text-sm">{toast.message}</p>
        <button
          type="button"
          onClick={clearToast}
          className="text-sm opacity-70 hover:opacity-100"
          aria-label="Schließen"
        >
          ×
        </button>
      </div>
    </div>
  );
}
