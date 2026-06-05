import { useState } from 'react';
import type { GlossarEintrag } from '@/types/wissensbasis';

interface GlossarSeiteProps {
  eintraege: GlossarEintrag[];
}

export function GlossarSeite({ eintraege }: GlossarSeiteProps): JSX.Element {
  const [suche, setSuche] = useState('');

  const gefiltert = suche.trim()
    ? eintraege.filter(
        (e) =>
          e.begriff.toLowerCase().includes(suche.toLowerCase()) ||
          e.definition.toLowerCase().includes(suche.toLowerCase())
      )
    : eintraege;

  const sortiert = [...gefiltert].sort((a, b) => a.begriff.localeCompare(b.begriff, 'de'));

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-[#1e3a5f]">Glossar</h1>
        <p className="mt-1 text-sm text-slate-500">
          {eintraege.length} Fachbegriffe aus dem Bereich Loss Prevention Management
        </p>
      </div>

      <input
        type="text"
        value={suche}
        onChange={(e) => setSuche(e.target.value)}
        placeholder="Begriff oder Definition suchen…"
        className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm focus:border-[#1e3a5f] focus:outline-none focus:ring-1 focus:ring-[#1e3a5f]"
      />

      {gefiltert.length === 0 ? (
        <p className="text-sm text-slate-400 italic">Keine Einträge gefunden.</p>
      ) : (
        <div className="space-y-2">
          {sortiert.map((e) => (
            <GlossarEintragItem key={e.begriff} eintrag={e} suchbegriff={suche} />
          ))}
        </div>
      )}
    </div>
  );
}

function GlossarEintragItem({
  eintrag,
  suchbegriff,
}: {
  eintrag: GlossarEintrag;
  suchbegriff: string;
}): JSX.Element {
  const highlight = (text: string): React.ReactNode => {
    if (!suchbegriff.trim()) return text;
    const regex = new RegExp(`(${suchbegriff.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);
    return parts.map((part, i) =>
      regex.test(part) ? (
        <mark key={i} className="bg-yellow-100 text-yellow-900">
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  return (
    <div className="rounded-lg border border-slate-100 bg-white p-4 hover:border-slate-200 transition-colors">
      <p className="font-semibold text-[#1e3a5f] text-sm">{highlight(eintrag.begriff)}</p>
      <p className="mt-1 text-sm text-slate-600 leading-relaxed">{highlight(eintrag.definition)}</p>
    </div>
  );
}
