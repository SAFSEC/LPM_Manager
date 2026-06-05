import Database from 'better-sqlite3';
import { drizzle, type BetterSQLite3Database } from 'drizzle-orm/better-sqlite3';
import fs from 'node:fs';
import path from 'node:path';
import * as schema from './schema';
import { runMigrations } from './migrate';

let sqlite: Database.Database | null = null;
let db: BetterSQLite3Database<typeof schema> | null = null;
let mainDbPath = '';
let tokensDbPath = '';

export function initDatabase(userDataPath: string): void {
  fs.mkdirSync(userDataPath, { recursive: true });
  mainDbPath = path.join(userDataPath, 'main.db');
  tokensDbPath = path.join(userDataPath, 'tokens.db');

  sqlite = new Database(mainDbPath);
  sqlite.pragma('journal_mode = WAL');
  sqlite.pragma('foreign_keys = ON');

  runMigrations(sqlite);
  db = drizzle(sqlite, { schema });
}

export function getDb(): BetterSQLite3Database<typeof schema> {
  if (!db) {
    throw new Error('Datenbank nicht initialisiert');
  }
  return db;
}

export function getSqlite(): Database.Database {
  if (!sqlite) {
    throw new Error('Datenbank nicht initialisiert');
  }
  return sqlite;
}

export function getDbPaths(): { mainDb: string; tokensDb: string } {
  if (!mainDbPath || !tokensDbPath) {
    throw new Error('Datenbankpfade nicht gesetzt');
  }
  return { mainDb: mainDbPath, tokensDb: tokensDbPath };
}

export function setTokensDbPath(filePath: string): void {
  tokensDbPath = filePath;
}
