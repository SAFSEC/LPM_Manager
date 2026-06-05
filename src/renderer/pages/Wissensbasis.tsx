import buchDaten from '../../../assets/buchinhalt/kapitel.json';
import type { BuchDaten } from '@/types/wissensbasis';
import { useWissensbasis } from '@/hooks/useWissensbasis';
import { BuchNavigator } from '@/components/wissensbasis/BuchNavigator';
import { InhaltAnzeige } from '@/components/wissensbasis/InhaltAnzeige';
import { GlossarSeite } from '@/components/wissensbasis/GlossarSeite';

const buch = buchDaten as BuchDaten;

export default function Wissensbasis(): JSX.Element {
  const {
    navigation,
    navigiereTo,
    kiLoading,
    kiText,
    kiTiefe,
    kiError,
    erklaeren,
    kiZuruecksetzen,
  } = useWissensbasis();

  return (
    <div className="flex h-full gap-0 overflow-hidden -mx-6 -my-6">
      <aside className="w-64 flex-shrink-0 overflow-y-auto border-r border-slate-200 bg-white">
        <BuchNavigator
          buch={buch}
          navigation={navigation}
          onNavigate={navigiereTo}
        />
      </aside>

      <main className="flex-1 overflow-y-auto px-6 py-6">
        {navigation.typ === 'glossar' ? (
          <GlossarSeite eintraege={buch.glossar} />
        ) : (
          <InhaltAnzeige
            buch={buch}
            navigation={navigation}
            kiLoading={kiLoading}
            kiText={kiText}
            kiTiefe={kiTiefe}
            kiError={kiError}
            onErklaeren={erklaeren}
            onKiZuruecksetzen={kiZuruecksetzen}
            onNavigate={navigiereTo}
          />
        )}
      </main>
    </div>
  );
}
