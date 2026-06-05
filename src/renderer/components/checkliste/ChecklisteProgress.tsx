interface ChecklisteProgressProps {
  beantwortet: number;
  gesamt: number;
  findings: number;
}

export function ChecklisteProgress({ beantwortet, gesamt, findings }: ChecklisteProgressProps): JSX.Element {
  const prozent = gesamt > 0 ? Math.round((beantwortet / gesamt) * 100) : 0;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-slate-700">
          {beantwortet} / {gesamt} Fragen bewertet
        </span>
        <span className="font-semibold text-primary">{prozent}%</span>
      </div>
      <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-200">
        <div
          className="h-full rounded-full bg-primary transition-all duration-300"
          style={{ width: `${prozent}%` }}
        />
      </div>
      {findings > 0 && (
        <p className="text-xs text-red-600">
          {findings} Finding{findings !== 1 ? 's' : ''} (instabil / eingeschränkt)
        </p>
      )}
    </div>
  );
}
