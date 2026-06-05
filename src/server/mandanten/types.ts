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
