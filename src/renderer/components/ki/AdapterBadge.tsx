import type { KiModus } from '@/hooks/useKiModus';

interface AdapterBadgeProps {
  modus: KiModus;
  compact?: boolean;
}

export function AdapterBadge({ modus, compact = false }: AdapterBadgeProps): JSX.Element {
  const isLocal = modus === 'lokal';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium ${
        isLocal
          ? 'border-green-200 bg-green-50 text-green-800'
          : 'border-amber-200 bg-amber-50 text-amber-900'
      }`}
      title={isLocal ? 'KI läuft lokal über Ollama' : 'Mindestens ein Use-Case nutzt externe KI'}
    >
      <span aria-hidden>{isLocal ? '🟢' : '🟡'}</span>
      {compact ? (isLocal ? 'Lokal' : 'Extern') : isLocal ? 'Ollama lokal' : 'Extern'}
    </span>
  );
}
