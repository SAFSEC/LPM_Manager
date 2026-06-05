import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const lpmMandanten = sqliteTable('lpm_mandanten', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  mandantId: text('mandant_id').notNull().unique(),
  name: text('name').notNull(),
  standort: text('standort'),
  ansprechpartner: text('ansprechpartner'),
  branche: text('branche'),
  notizen: text('notizen'),
  aktiv: integer('aktiv').notNull().default(1),
  erstelltAm: text('erstellt_am').notNull(),
  geaendertAm: text('geaendert_am').notNull(),
});

export const lpmChecklistenRuns = sqliteTable('lpm_checklisten_runs', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  mandantId: text('mandant_id').notNull(),
  anlageId: text('anlage_id').notNull(),
  anlageName: text('anlage_name').notNull(),
  status: text('status').notNull().default('offen'),
  kiZusammenfassung: text('ki_zusammenfassung'),
  kiAdapter: text('ki_adapter'),
  erstelltAm: text('erstellt_am').notNull(),
  geaendertAm: text('geaendert_am').notNull(),
  abgeschlossenAm: text('abgeschlossen_am'),
});

export const lpmChecklistenAntworten = sqliteTable('lpm_checklisten_antworten', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  mandantId: text('mandant_id').notNull(),
  runId: integer('run_id').notNull(),
  frageId: text('frage_id').notNull(),
  abschnitt: text('abschnitt').notNull(),
  frageText: text('frage_text').notNull(),
  bewertung: text('bewertung'),
  kommentar: text('kommentar'),
  istFinding: integer('ist_finding').notNull().default(0),
  erstelltAm: text('erstellt_am').notNull(),
  geaendertAm: text('geaendert_am').notNull(),
});

export const lpmFormulare = sqliteTable('lpm_formulare', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  mandantId: text('mandant_id').notNull(),
  formularId: text('formular_id').notNull(),
  formularName: text('formular_name').notNull(),
  felder: text('felder').notNull(),
  status: text('status').notNull().default('entwurf'),
  erstelltAm: text('erstellt_am').notNull(),
  geaendertAm: text('geaendert_am').notNull(),
});

export const lpmExporte = sqliteTable('lpm_exporte', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  mandantId: text('mandant_id').notNull(),
  typ: text('typ').notNull(),
  referenzId: integer('referenz_id').notNull(),
  format: text('format').notNull(),
  dateiname: text('dateiname').notNull(),
  dateipfad: text('dateipfad').notNull(),
  erstelltAm: text('erstellt_am').notNull(),
});

export const lpmKiAudit = sqliteTable('lpm_ki_audit', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  mandantId: text('mandant_id').notNull(),
  useCase: text('use_case').notNull(),
  adapter: text('adapter').notNull(),
  modell: text('modell'),
  tokenInput: integer('token_input'),
  tokenOutput: integer('token_output'),
  dauerMs: integer('dauer_ms'),
  erfolg: integer('erfolg').notNull().default(1),
  erstelltAm: text('erstellt_am').notNull(),
});

export const lpmEinstellungen = sqliteTable('lpm_einstellungen', {
  schluessel: text('schluessel').primaryKey(),
  wert: text('wert').notNull(),
  geaendertAm: text('geaendert_am').notNull(),
});
