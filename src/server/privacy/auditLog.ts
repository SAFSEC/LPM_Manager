import type { PrivacyAuditEntry } from './types';
import { secureLog } from './secureLogger';

export function writeAuditEntry(entry: PrivacyAuditEntry): void {
  secureLog.info(
    `Audit ${entry.prozess} | Adapter: ${entry.adapter} | ` +
      `Pseudonymisiert: ${entry.felderPseudonymisiert.length} | ` +
      `Entfernt: ${entry.felderEntfernt.length} | OK: ${entry.checkBestanden}`
  );
}
