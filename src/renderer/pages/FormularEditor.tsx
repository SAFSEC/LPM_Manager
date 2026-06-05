import { useMandant } from '@/context/MandantContext';
import { useFormular } from '@/hooks/useFormular';
import { FormularAuswahl } from '@/components/formulare/FormularAuswahl';
import { FormularFormView } from '@/components/formulare/FormularFormView';

export default function FormularEditor(): JSX.Element {
  const { activeMandant } = useMandant();
  const mandantId = activeMandant?.mandant_id ?? null;

  const {
    phase,
    katalog,
    katalogLoading,
    gespeicherteFormulare,
    listLoading,
    selectedFormular,
    currentRow,
    felder,
    finalisiereLoading,
    exportWordLoading,
    exportPdfLoading,
    letzterExport,
    error,
    neuesFormular,
    vorhandenesBestehend,
    zurueck,
    feldAendern,
    finalisieren,
    exportWord,
    exportPdf,
    dateiOeffnen,
    loeschen,
  } = useFormular(mandantId);

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
            <h2 className="text-2xl font-semibold text-slate-900">Formulare</h2>
            <p className="mt-1 text-sm text-slate-600">
              7 LPM-Formulare für{' '}
              <span className="font-medium text-[#1e3a5f]">{activeMandant.name}</span>
            </p>
          </div>

          {error && (
            <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {katalogLoading ? (
            <div className="flex h-40 items-center justify-center text-slate-500">
              Formulare werden geladen…
            </div>
          ) : (
            <FormularAuswahl
              katalog={katalog}
              gespeicherte={gespeicherteFormulare}
              loading={listLoading}
              onNeu={neuesFormular}
              onOeffnen={(row) => void vorhandenesBestehend(row)}
              onLoeschen={(id) => void loeschen(id)}
            />
          )}
        </>
      )}

      {phase === 'editor' && selectedFormular && (
        <FormularFormView
          definition={selectedFormular}
          currentRow={currentRow}
          felder={felder}
          finalisiereLoading={finalisiereLoading}
          exportWordLoading={exportWordLoading}
          exportPdfLoading={exportPdfLoading}
          letzterExport={letzterExport}
          error={error}
          onFeldChange={feldAendern}
          onFinalisieren={() => void finalisieren()}
          onExportWord={() => void exportWord()}
          onExportPdf={() => void exportPdf()}
          onDateiOeffnen={(pfad) => void dateiOeffnen(pfad)}
          onBack={zurueck}
        />
      )}
    </div>
  );
}
