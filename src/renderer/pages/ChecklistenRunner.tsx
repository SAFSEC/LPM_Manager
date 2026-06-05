import { useMandant } from '@/context/MandantContext';
import { useCheckliste } from '@/hooks/useCheckliste';
import { AnlagenAuswahl } from '@/components/checkliste/AnlagenAuswahl';
import { RunView } from '@/components/checkliste/RunView';

export default function ChecklistenRunner(): JSX.Element {
  const { activeMandant } = useMandant();
  const {
    phase,
    anlagen,
    laufendeRunIds,
    currentDetail,
    antwortStates,
    loading,
    abschliessenLoading,
    kiGenerating,
    kiStreamText,
    error,
    startOrLoadRun,
    backToAuswahl,
    handleBewertungChange,
    handleKommentarChange,
    handleKommentarBlur,
    handleAbschliessen,
    handleKiGenerate,
  } = useCheckliste(activeMandant?.mandant_id ?? null);

  if (!activeMandant) {
    return (
      <div className="flex h-40 items-center justify-center rounded-lg border border-dashed border-slate-300">
        <p className="text-slate-500">Bitte zuerst einen Mandanten auswählen.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {phase === 'auswahl' && (
        <>
          <div>
            <h2 className="text-2xl font-semibold text-slate-900">Checklisten</h2>
            <p className="mt-1 text-sm text-slate-600">
              18 Anlagen für{' '}
              <span className="font-medium text-primary">{activeMandant.name}</span>
              {' '}– Anlage auswählen und Prüfung starten.
            </p>
          </div>

          {error && (
            <div className="rounded-md bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {loading ? (
            <div className="flex h-40 items-center justify-center text-slate-500">
              Checklisten werden geladen…
            </div>
          ) : (
            <AnlagenAuswahl
              anlagen={anlagen}
              laufendeRunIds={laufendeRunIds}
              onStart={(anlageId) => void startOrLoadRun(anlageId)}
              onWeiter={(runId) => void startOrLoadRun('', runId)}
            />
          )}
        </>
      )}

      {phase === 'run' && currentDetail && (
        <>
          {error && (
            <div className="rounded-md bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}
          <RunView
            detail={currentDetail}
            antwortStates={antwortStates}
            kiStreamText={kiStreamText}
            kiGenerating={kiGenerating}
            onBewertungChange={handleBewertungChange}
            onKommentarChange={handleKommentarChange}
            onKommentarBlur={handleKommentarBlur}
            onAbschliessen={() => void handleAbschliessen()}
            onKiGenerate={() => void handleKiGenerate()}
            abschliessenLoading={abschliessenLoading}
            onBack={backToAuswahl}
          />
        </>
      )}
    </div>
  );
}
