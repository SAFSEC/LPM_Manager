import type { ExportRecord } from '@/hooks/useExport';

interface ExportHistoryTableProps {
  records: ExportRecord[];
  onOeffnen: (dateipfad: string) => void;
}

export function ExportHistoryTable({ records, onOeffnen }: ExportHistoryTableProps): JSX.Element {
  if (records.length === 0) {
    return (
      <p className="py-4 text-center text-sm text-slate-400">
        Noch keine Exporte vorhanden.
      </p>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-slate-100">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-100 bg-slate-50">
            <th className="px-4 py-2 text-left text-xs font-semibold text-slate-500">Dateiname</th>
            <th className="px-4 py-2 text-left text-xs font-semibold text-slate-500">Format</th>
            <th className="px-4 py-2 text-left text-xs font-semibold text-slate-500">Erstellt</th>
            <th className="px-4 py-2 text-right text-xs font-semibold text-slate-500"></th>
          </tr>
        </thead>
        <tbody>
          {records.map((rec) => (
            <tr key={rec.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50 transition-colors">
              <td className="max-w-xs truncate px-4 py-2 font-mono text-xs text-slate-700">
                {rec.dateiname}
              </td>
              <td className="px-4 py-2">
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-semibold uppercase ${
                    rec.format === 'pdf'
                      ? 'bg-red-100 text-red-700'
                      : 'bg-blue-100 text-blue-700'
                  }`}
                >
                  {rec.format}
                </span>
              </td>
              <td className="px-4 py-2 text-xs text-slate-500">
                {new Date(rec.erstelltAm).toLocaleString('de-DE', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </td>
              <td className="px-4 py-2 text-right">
                <button
                  onClick={() => onOeffnen(rec.dateipfad)}
                  className="text-xs text-[#1e3a5f] hover:underline"
                >
                  Öffnen
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
