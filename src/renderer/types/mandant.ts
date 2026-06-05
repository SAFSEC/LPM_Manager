export interface Mandant {
  mandant_id: string;
  name: string;
  standort: string | null;
  ansprechpartner: string | null;
  branche: string | null;
  notizen: string | null;
  aktiv: boolean;
  erstellt_am: string;
  geaendert_am: string;
}

export interface MandantCreate {
  name: string;
  standort?: string;
  ansprechpartner?: string;
  branche?: string;
  notizen?: string;
}

export interface MandantUpdate {
  mandant_id: string;
  name: string;
  standort: string | null;
  ansprechpartner: string | null;
  branche: string | null;
  notizen: string | null;
}

export interface MandantFormValues {
  name: string;
  standort: string;
  ansprechpartner: string;
  branche: string;
  notizen: string;
}

export function mandantToFormValues(mandant: Mandant): MandantFormValues {
  return {
    name: mandant.name,
    standort: mandant.standort ?? '',
    ansprechpartner: mandant.ansprechpartner ?? '',
    branche: mandant.branche ?? '',
    notizen: mandant.notizen ?? '',
  };
}

export function formValuesToCreate(values: MandantFormValues): MandantCreate {
  const result: MandantCreate = { name: values.name.trim() };
  const standort = values.standort.trim();
  if (standort.length > 0) result.standort = standort;
  const ansprechpartner = values.ansprechpartner.trim();
  if (ansprechpartner.length > 0) result.ansprechpartner = ansprechpartner;
  const branche = values.branche.trim();
  if (branche.length > 0) result.branche = branche;
  const notizen = values.notizen.trim();
  if (notizen.length > 0) result.notizen = notizen;
  return result;
}

function optionalFieldOrNull(value: string): string | null {
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

export function formValuesToUpdate(
  mandantId: string,
  values: MandantFormValues
): MandantUpdate {
  return {
    mandant_id: mandantId.trim(),
    name: values.name.trim(),
    standort: optionalFieldOrNull(values.standort),
    ansprechpartner: optionalFieldOrNull(values.ansprechpartner),
    branche: optionalFieldOrNull(values.branche),
    notizen: optionalFieldOrNull(values.notizen),
  };
}
