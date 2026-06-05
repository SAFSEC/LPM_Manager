import type { BuchDaten, NavigationsTyp } from '@/types/wissensbasis';

interface BuchNavigatorProps {
  buch: BuchDaten;
  navigation: NavigationsTyp;
  onNavigate: (nav: NavigationsTyp) => void;
}

export function BuchNavigator({ buch, navigation, onNavigate }: BuchNavigatorProps): JSX.Element {
  const aktiv = (nav: NavigationsTyp): boolean => JSON.stringify(navigation) === JSON.stringify(nav);

  return (
    <nav className="flex h-full flex-col overflow-y-auto">
      <div className="border-b border-slate-100 p-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Buchinhalt</p>
      </div>

      <div className="flex-1 overflow-y-auto py-2">
        <NavItem
          label="Übersicht"
          aktiv={aktiv({ typ: 'overview' })}
          onClick={() => onNavigate({ typ: 'overview' })}
          icon="📖"
        />

        {buch.teile.map((teil) => (
          <div key={teil.id} className="mt-1">
            <NavGruppe
              label={teil.titel}
              aktiv={aktiv({ typ: 'teil', teilId: teil.id })}
              onClick={() => onNavigate({ typ: 'teil', teilId: teil.id })}
            />

            {teil.kapitel?.map((k) => (
              <NavItem
                key={k.id}
                label={k.id + ' – ' + k.titel.replace(/^Kapitel \d+ – /, '')}
                aktiv={aktiv({ typ: 'kapitel', id: k.id })}
                onClick={() => onNavigate({ typ: 'kapitel', id: k.id })}
                indent
              />
            ))}

            {teil.stories?.map((s) => (
              <NavItem
                key={s.id}
                label={s.id + ' – ' + s.titel.replace(/^Story \d+ – /, '')}
                aktiv={aktiv({ typ: 'story', id: s.id })}
                onClick={() => onNavigate({ typ: 'story', id: s.id })}
                indent
              />
            ))}

            {teil.module?.map((m) => (
              <NavItem
                key={m.id}
                label={m.id + ' – ' + m.titel.replace(/^M\d+ – /, '')}
                aktiv={aktiv({ typ: 'modul', id: m.id })}
                onClick={() => onNavigate({ typ: 'modul', id: m.id })}
                indent
              />
            ))}

            {teil.anlagen?.map((a) => (
              <NavItem
                key={a.id}
                label={a.titel}
                aktiv={aktiv({ typ: 'anlage', id: a.id })}
                onClick={() => onNavigate({ typ: 'anlage', id: a.id })}
                indent
              />
            ))}
          </div>
        ))}

        <div className="mt-2 border-t border-slate-100 pt-2">
          <NavItem
            label="Glossar"
            aktiv={aktiv({ typ: 'glossar' })}
            onClick={() => onNavigate({ typ: 'glossar' })}
            icon="📚"
          />
        </div>
      </div>
    </nav>
  );
}

function NavGruppe({
  label,
  aktiv,
  onClick,
}: {
  label: string;
  aktiv: boolean;
  onClick: () => void;
}): JSX.Element {
  return (
    <button
      onClick={onClick}
      className={`w-full px-3 py-1.5 text-left text-xs font-bold uppercase tracking-wide transition-colors ${
        aktiv ? 'bg-[#1e3a5f] text-white' : 'text-[#1e3a5f] hover:bg-blue-50'
      }`}
    >
      {label}
    </button>
  );
}

function NavItem({
  label,
  aktiv,
  onClick,
  icon,
  indent = false,
}: {
  label: string;
  aktiv: boolean;
  onClick: () => void;
  icon?: string;
  indent?: boolean;
}): JSX.Element {
  return (
    <button
      onClick={onClick}
      className={`flex w-full items-start gap-1.5 px-3 py-1.5 text-left text-xs transition-colors ${
        indent ? 'pl-5' : ''
      } ${
        aktiv
          ? 'bg-[#1e3a5f] font-semibold text-white'
          : 'text-slate-700 hover:bg-slate-100 hover:text-[#1e3a5f]'
      }`}
    >
      {icon && <span className="flex-shrink-0">{icon}</span>}
      <span className="leading-snug">{label}</span>
    </button>
  );
}
