import { getDb } from '../client';
import { lpmKiAudit } from '../schema';
import type { KiAdapterId, KiUseCase } from '../../ki/types';

export interface KiAuditEintrag {
  mandantId: string;
  useCase: KiUseCase;
  adapter: KiAdapterId;
  modell?: string;
  tokenInput?: number;
  tokenOutput?: number;
  dauerMs?: number;
  erfolg: boolean;
}

export function logKiAudit(eintrag: KiAuditEintrag): void {
  getDb()
    .insert(lpmKiAudit)
    .values({
      mandantId: eintrag.mandantId,
      useCase: eintrag.useCase,
      adapter: eintrag.adapter,
      modell: eintrag.modell ?? null,
      tokenInput: eintrag.tokenInput ?? null,
      tokenOutput: eintrag.tokenOutput ?? null,
      dauerMs: eintrag.dauerMs ?? null,
      erfolg: eintrag.erfolg ? 1 : 0,
      erstelltAm: new Date().toISOString(),
    })
    .run();
}
