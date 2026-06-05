import type { BuchDaten, NavigationsTyp } from '@/types/wissensbasis';
import { KiErklaerPanel } from './KiErklaerPanel';

interface InhaltAnzeigeProps {
  buch: BuchDaten;
  navigation: NavigationsTyp;
  kiLoading: boolean;
  kiText: string;
  kiTiefe: 'kurz' | 'ausfuehrlich';
  kiError: string | null;
  onErklaeren: (titel: string, tiefe: 'kurz' | 'ausfuehrlich') => void;
  onKiZuruecksetzen: () => void;
  onNavigate: (nav: NavigationsTyp) => void;
}

export function InhaltAnzeige({
  buch,
  navigation,
  kiLoading,
  kiText,
  kiTiefe,
  kiError,
  onErklaeren,
  onKiZuruecksetzen,
  onNavigate,
}: InhaltAnzeigeProps): JSX.Element {
  if (navigation.typ === 'overview') {
    return <OverviewAnzeige buch={buch} onNavigate={onNavigate} />;
  }

  if (navigation.typ === 'teil') {
    const teil = buch.teile.find((t) => t.id === navigation.teilId);
    if (!teil) return <NichtGefunden />;
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold text-[#1e3a5f]">{teil.titel}</h1>
        <p className="text-slate-600">{teil.beschreibung}</p>
        <div className="grid gap-3">
          {teil.kapitel?.map((k) => (
            <KachelItem
              key={k.id}
              id={k.id}
              titel={k.titel}
              kurzinhalt={k.kurzinhalt.slice(0, 120) + '…'}
              onClick={() => onNavigate({ typ: 'kapitel', id: k.id })}
            />
          ))}
          {teil.stories?.map((s) => (
            <KachelItem
              key={s.id}
              id={s.id}
              titel={s.titel}
              kurzinhalt={s.kurzinhalt.slice(0, 120) + '…'}
              onClick={() => onNavigate({ typ: 'story', id: s.id })}
            />
          ))}
          {teil.module?.map((m) => (
            <KachelItem
              key={m.id}
              id={m.id}
              titel={m.titel}
              kurzinhalt={m.kurzinhalt.slice(0, 120) + '…'}
              onClick={() => onNavigate({ typ: 'modul', id: m.id })}
            />
          ))}
        </div>
      </div>
    );
  }

  if (navigation.typ === 'kapitel') {
    const kapitel = buch.teile
      .flatMap((t) => t.kapitel ?? [])
      .find((k) => k.id === navigation.id);
    if (!kapitel) return <NichtGefunden />;
    return (
      <div className="space-y-5">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wide text-[#d4a017]">Teil I – Fachtheorie</span>
          <h1 className="mt-1 text-2xl font-bold text-[#1e3a5f]">{kapitel.titel}</h1>
        </div>
        <p className="leading-relaxed text-slate-700">{kapitel.kurzinhalt}</p>
        {kapitel.schluesselkonzepte.length > 0 && (
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
            <h3 className="mb-2 text-sm font-semibold text-[#1e3a5f]">Schlüsselkonzepte</h3>
            <ul className="space-y-1">
              {kapitel.schluesselkonzepte.map((k) => (
                <li key={k} className="flex items-start gap-2 text-sm text-slate-700">
                  <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[#d4a017]" />
                  {k}
                </li>
              ))}
            </ul>
          </div>
        )}
        {(kapitel.module.length > 0 || kapitel.anlagen.length > 0) && (
          <div className="flex gap-4 flex-wrap">
            {kapitel.module.length > 0 && (
              <div className="text-xs text-slate-500">
                <span className="font-semibold text-[#1e3a5f]">Operative Module:</span>{' '}
                {kapitel.module.join(', ')}
              </div>
            )}
            {kapitel.anlagen.length > 0 && (
              <div className="text-xs text-slate-500">
                <span className="font-semibold text-[#1e3a5f]">Zugehörige Anlagen:</span>{' '}
                {kapitel.anlagen.join(', ')}
              </div>
            )}
          </div>
        )}
        <KiErklaerPanel
          titel={kapitel.titel}
          loading={kiLoading}
          text={kiText}
          tiefe={kiTiefe}
          error={kiError}
          onErklaeren={(t) => onErklaeren(kapitel.titel, t)}
          onZuruecksetzen={onKiZuruecksetzen}
        />
      </div>
    );
  }

  if (navigation.typ === 'story') {
    const story = buch.teile
      .flatMap((t) => t.stories ?? [])
      .find((s) => s.id === navigation.id);
    if (!story) return <NichtGefunden />;
    return (
      <div className="space-y-5">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wide text-[#d4a017]">Teil II – Praxis-Story</span>
          <h1 className="mt-1 text-2xl font-bold text-[#1e3a5f]">{story.titel}</h1>
          <p className="mt-1 text-sm text-slate-500">Branche: {story.branche}</p>
        </div>
        <p className="leading-relaxed text-slate-700">{story.kurzinhalt}</p>
        {story.lernpunkte.length > 0 && (
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
            <h3 className="mb-2 text-sm font-semibold text-amber-800">Lernpunkte aus dieser Story</h3>
            <ul className="space-y-1">
              {story.lernpunkte.map((l) => (
                <li key={l} className="flex items-start gap-2 text-sm text-amber-900">
                  <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-amber-500" />
                  {l}
                </li>
              ))}
            </ul>
          </div>
        )}
        <KiErklaerPanel
          titel={story.titel + ' – ' + story.branche}
          loading={kiLoading}
          text={kiText}
          tiefe={kiTiefe}
          error={kiError}
          onErklaeren={(t) => onErklaeren(story.titel, t)}
          onZuruecksetzen={onKiZuruecksetzen}
        />
      </div>
    );
  }

  if (navigation.typ === 'modul') {
    const modul = buch.teile
      .flatMap((t) => t.module ?? [])
      .find((m) => m.id === navigation.id);
    if (!modul) return <NichtGefunden />;
    return (
      <div className="space-y-5">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wide text-[#d4a017]">Teil III – Operatives Modul</span>
          <h1 className="mt-1 text-2xl font-bold text-[#1e3a5f]">{modul.titel}</h1>
        </div>
        <p className="leading-relaxed text-slate-700">{modul.kurzinhalt}</p>
        {modul.schluesselkonzepte.length > 0 && (
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
            <h3 className="mb-2 text-sm font-semibold text-[#1e3a5f]">Schlüsselkonzepte</h3>
            <ul className="space-y-1">
              {modul.schluesselkonzepte.map((k) => (
                <li key={k} className="flex items-start gap-2 text-sm text-slate-700">
                  <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[#d4a017]" />
                  {k}
                </li>
              ))}
            </ul>
          </div>
        )}
        <KiErklaerPanel
          titel={modul.titel}
          loading={kiLoading}
          text={kiText}
          tiefe={kiTiefe}
          error={kiError}
          onErklaeren={(t) => onErklaeren(modul.titel, t)}
          onZuruecksetzen={onKiZuruecksetzen}
        />
      </div>
    );
  }

  if (navigation.typ === 'anlage') {
    const anlage = buch.teile
      .flatMap((t) => t.anlagen ?? [])
      .find((a) => a.id === navigation.id);
    if (!anlage) return <NichtGefunden />;
    return (
      <div className="space-y-5">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wide text-[#d4a017]">Teil V – Audit-Checkliste</span>
          <h1 className="mt-1 text-2xl font-bold text-[#1e3a5f]">{anlage.titel}</h1>
        </div>
        <div className="rounded-lg border border-blue-100 bg-blue-50 px-4 py-3">
          <p className="text-sm text-[#1e3a5f]">
            Diese Anlage ist als interaktive Checkliste in der App verfügbar.
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Gehe zu <strong>Checklisten</strong> um eine Prüfung mit dieser Anlage durchzuführen.
          </p>
        </div>
        <KiErklaerPanel
          titel={anlage.titel}
          loading={kiLoading}
          text={kiText}
          tiefe={kiTiefe}
          error={kiError}
          onErklaeren={(t) => onErklaeren(anlage.titel, t)}
          onZuruecksetzen={onKiZuruecksetzen}
        />
      </div>
    );
  }

  return <NichtGefunden />;
}

function OverviewAnzeige({ buch, onNavigate }: { buch: BuchDaten; onNavigate: (nav: NavigationsTyp) => void }): JSX.Element {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#1e3a5f]">{buch.buch.titel}</h1>
        <p className="mt-1 text-sm text-slate-500">
          {buch.buch.autor} · {buch.buch.verlag} · {buch.buch.seiten} Seiten
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {buch.teile.map((teil) => (
          <button
            key={teil.id}
            onClick={() => onNavigate({ typ: 'teil', teilId: teil.id })}
            className="rounded-xl border border-slate-200 bg-white p-4 text-left shadow-sm hover:border-[#1e3a5f] hover:shadow-md transition-all"
          >
            <p className="text-xs font-bold uppercase tracking-wide text-[#d4a017]">{teil.id.replace('teil-', 'Teil ')}</p>
            <p className="mt-1 text-sm font-semibold text-[#1e3a5f] leading-snug">{teil.titel.replace(/^Teil [IVX]+ – /, '')}</p>
            <p className="mt-1 text-xs text-slate-400 line-clamp-2">{teil.beschreibung}</p>
          </button>
        ))}
        <button
          onClick={() => onNavigate({ typ: 'glossar' })}
          className="rounded-xl border border-slate-200 bg-white p-4 text-left shadow-sm hover:border-[#1e3a5f] hover:shadow-md transition-all"
        >
          <p className="text-xs font-bold uppercase tracking-wide text-[#d4a017]">Anhang</p>
          <p className="mt-1 text-sm font-semibold text-[#1e3a5f]">Glossar</p>
          <p className="mt-1 text-xs text-slate-400">{buch.glossar.length} Fachbegriffe mit Definitionen</p>
        </button>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Fachkapitel', wert: String(buch.teile[0]?.kapitel?.length ?? 0), sub: 'Teil I' },
          { label: 'Praxis-Stories', wert: String(buch.teile[1]?.stories?.length ?? 0), sub: 'Teil II' },
          { label: 'Arbeitsmodule', wert: String(buch.teile[2]?.module?.length ?? 0), sub: 'Teil III' },
        ].map((stat) => (
          <div key={stat.label} className="rounded-lg border border-slate-100 bg-slate-50 p-3 text-center">
            <p className="text-2xl font-bold text-[#1e3a5f]">{stat.wert}</p>
            <p className="text-xs font-semibold text-slate-700">{stat.label}</p>
            <p className="text-xs text-slate-400">{stat.sub}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function KachelItem({ id, titel, kurzinhalt, onClick }: { id: string; titel: string; kurzinhalt: string; onClick: () => void }): JSX.Element {
  return (
    <button
      onClick={onClick}
      className="flex items-start gap-3 rounded-lg border border-slate-100 bg-white p-4 text-left hover:border-[#1e3a5f] hover:shadow-sm transition-all"
    >
      <span className="flex h-8 w-14 flex-shrink-0 items-center justify-center rounded bg-[#1e3a5f] text-xs font-bold text-white">
        {id}
      </span>
      <div className="min-w-0">
        <p className="font-semibold text-slate-800 text-sm leading-snug">{titel}</p>
        <p className="mt-0.5 text-xs text-slate-500">{kurzinhalt}</p>
      </div>
    </button>
  );
}

function NichtGefunden(): JSX.Element {
  return <p className="text-slate-500">Inhalt nicht gefunden.</p>;
}
