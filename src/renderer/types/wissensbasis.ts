export interface Kapitel {
  id: string;
  titel: string;
  kurzinhalt: string;
  schluesselkonzepte: string[];
  module: string[];
  anlagen: string[];
}

export interface PraxisStory {
  id: string;
  titel: string;
  branche: string;
  kurzinhalt: string;
  lernpunkte: string[];
}

export interface Modul {
  id: string;
  titel: string;
  kurzinhalt: string;
  schluesselkonzepte: string[];
}

export interface AnlageRef {
  id: string;
  titel: string;
  kapitelRef?: string;
}

export interface FormularRef {
  id: string;
  titel: string;
}

export interface GlossarEintrag {
  begriff: string;
  definition: string;
}

export interface BuchTeil {
  id: string;
  titel: string;
  beschreibung: string;
  kapitel?: Kapitel[];
  stories?: PraxisStory[];
  module?: Modul[];
  anlagen?: AnlageRef[];
  formulare?: FormularRef[];
}

export interface BuchDaten {
  buch: { titel: string; autor: string; verlag: string; seiten: number };
  teile: BuchTeil[];
  glossar: GlossarEintrag[];
}

export type NavigationsTyp =
  | { typ: 'overview' }
  | { typ: 'teil'; teilId: string }
  | { typ: 'kapitel'; id: string }
  | { typ: 'story'; id: string }
  | { typ: 'modul'; id: string }
  | { typ: 'anlage'; id: string }
  | { typ: 'glossar' };
