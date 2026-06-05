import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { privacyFilter, initPrivacyVault, closeVault } from '../src/server/privacy/index';

const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'lpm-privacy-test-'));
const tokensDb = path.join(tmpDir, 'tokens.db');

initPrivacyVault(tokensDb);

const result = privacyFilter({ name: 'Musterfirma GmbH' }, 'anthropic');
const token = result.processedData.name ?? '';

const mandantPattern = /^\[MANDANT_[a-f0-9]{8}\]$/;
const mainDbSeparate = !tokensDb.endsWith('main.db');
const tokensExists = fs.existsSync(tokensDb);

closeVault();

if (!mandantPattern.test(token)) {
  console.error('FEHLER: Erwartet [MANDANT_xxxxxxxx], erhalten:', token);
  process.exit(1);
}

if (!tokensExists) {
  console.error('FEHLER: tokens.db wurde nicht angelegt');
  process.exit(1);
}

if (!mainDbSeparate) {
  console.error('FEHLER: Vault-Pfad ungültig');
  process.exit(1);
}

console.log('OK privacyFilter →', token);
console.log('OK tokens.db →', tokensDb);
fs.rmSync(tmpDir, { recursive: true, force: true });
process.exit(0);
