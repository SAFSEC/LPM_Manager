import Database from 'better-sqlite3';
import crypto from 'node:crypto';
import type { LpmTokenPrefix } from './types';
import { getTokenPrefixForField } from './ruleEngine';

let vaultDb: Database.Database | null = null;
let vaultPath = '';

export function initPrivacyVault(filePath: string): void {
  vaultPath = filePath;
  if (vaultDb) {
    vaultDb.close();
    vaultDb = null;
  }
  vaultDb = new Database(filePath);
  vaultDb.pragma('journal_mode = WAL');
  vaultDb.exec(`
    CREATE TABLE IF NOT EXISTS tokens (
      token       TEXT PRIMARY KEY,
      original    TEXT NOT NULL,
      field_name  TEXT NOT NULL,
      created_at  TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE INDEX IF NOT EXISTS idx_tokens_original ON tokens(original, field_name);
  `);
}

function getVaultDb(): Database.Database {
  if (!vaultDb) {
    throw new Error(
      vaultPath
        ? `Token-Vault nicht initialisiert: ${vaultPath}`
        : 'Token-Vault nicht initialisiert'
    );
  }
  return vaultDb;
}

function generateToken(prefix: LpmTokenPrefix): string {
  const id = crypto.randomBytes(4).toString('hex');
  return `[${prefix}_${id}]`;
}

export function tokenize(originalValue: string, fieldName: string): string {
  const db = getVaultDb();
  const prefix = getTokenPrefixForField(fieldName);

  const existing = db
    .prepare('SELECT token FROM tokens WHERE original = ? AND field_name = ?')
    .get(originalValue, fieldName) as { token: string } | undefined;

  if (existing) {
    return existing.token;
  }

  const token = generateToken(prefix);
  db.prepare('INSERT INTO tokens (token, original, field_name) VALUES (?, ?, ?)').run(
    token,
    originalValue,
    fieldName
  );

  return token;
}

export function detokenize(token: string): string | null {
  const db = getVaultDb();
  const row = db.prepare('SELECT original FROM tokens WHERE token = ?').get(token) as
    | { original: string }
    | undefined;
  return row?.original ?? null;
}

export function detokenizeAll(text: string): string {
  const tokenPattern = /\[(MANDANT|PERSON)_[a-f0-9]{8}\]/g;
  const matches = text.match(tokenPattern);
  if (!matches) {
    return text;
  }

  let result = text;
  for (const token of matches) {
    const original = detokenize(token);
    if (original) {
      result = result.split(token).join(original);
    }
  }
  return result;
}

export function getVaultFilePath(): string {
  return vaultPath;
}

export function closeVault(): void {
  if (vaultDb) {
    vaultDb.close();
    vaultDb = null;
  }
}
