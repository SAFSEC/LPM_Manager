import type Database from 'better-sqlite3';

const SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS lpm_mandanten (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  mandant_id TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  standort TEXT,
  ansprechpartner TEXT,
  branche TEXT,
  notizen TEXT,
  aktiv INTEGER NOT NULL DEFAULT 1,
  erstellt_am TEXT NOT NULL,
  geaendert_am TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS lpm_checklisten_runs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  mandant_id TEXT NOT NULL,
  anlage_id TEXT NOT NULL,
  anlage_name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'offen',
  ki_zusammenfassung TEXT,
  ki_adapter TEXT,
  erstellt_am TEXT NOT NULL,
  geaendert_am TEXT NOT NULL,
  abgeschlossen_am TEXT,
  FOREIGN KEY (mandant_id) REFERENCES lpm_mandanten(mandant_id)
);

CREATE TABLE IF NOT EXISTS lpm_checklisten_antworten (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  mandant_id TEXT NOT NULL,
  run_id INTEGER NOT NULL,
  frage_id TEXT NOT NULL,
  abschnitt TEXT NOT NULL,
  frage_text TEXT NOT NULL,
  bewertung TEXT,
  kommentar TEXT,
  ist_finding INTEGER NOT NULL DEFAULT 0,
  erstellt_am TEXT NOT NULL,
  geaendert_am TEXT NOT NULL,
  FOREIGN KEY (run_id) REFERENCES lpm_checklisten_runs(id)
);

CREATE TABLE IF NOT EXISTS lpm_formulare (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  mandant_id TEXT NOT NULL,
  formular_id TEXT NOT NULL,
  formular_name TEXT NOT NULL,
  felder TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'entwurf',
  erstellt_am TEXT NOT NULL,
  geaendert_am TEXT NOT NULL,
  FOREIGN KEY (mandant_id) REFERENCES lpm_mandanten(mandant_id)
);

CREATE TABLE IF NOT EXISTS lpm_exporte (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  mandant_id TEXT NOT NULL,
  typ TEXT NOT NULL,
  referenz_id INTEGER NOT NULL,
  format TEXT NOT NULL,
  dateiname TEXT NOT NULL,
  dateipfad TEXT NOT NULL,
  erstellt_am TEXT NOT NULL,
  FOREIGN KEY (mandant_id) REFERENCES lpm_mandanten(mandant_id)
);

CREATE TABLE IF NOT EXISTS lpm_ki_audit (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  mandant_id TEXT NOT NULL,
  use_case TEXT NOT NULL,
  adapter TEXT NOT NULL,
  modell TEXT,
  token_input INTEGER,
  token_output INTEGER,
  dauer_ms INTEGER,
  erfolg INTEGER NOT NULL DEFAULT 1,
  erstellt_am TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS lpm_einstellungen (
  schluessel TEXT PRIMARY KEY,
  wert TEXT NOT NULL,
  geaendert_am TEXT NOT NULL
);
`;

export function runMigrations(sqlite: Database.Database): void {
  sqlite.exec(SCHEMA_SQL);
}
