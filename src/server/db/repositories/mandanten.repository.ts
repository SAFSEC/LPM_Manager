import { eq } from 'drizzle-orm';
import { randomUUID } from 'node:crypto';
import type { Mandant, MandantCreate, MandantUpdate } from '../../mandanten/types';
import { getDb } from '../client';
import { lpmMandanten } from '../schema';

function nowIso(): string {
  return new Date().toISOString();
}

function rowToMandant(row: typeof lpmMandanten.$inferSelect): Mandant {
  return {
    mandant_id: row.mandantId,
    name: row.name,
    standort: row.standort,
    ansprechpartner: row.ansprechpartner,
    branche: row.branche,
    notizen: row.notizen,
    aktiv: row.aktiv === 1,
    erstellt_am: row.erstelltAm,
    geaendert_am: row.geaendertAm,
  };
}

export function listMandanten(mitArchiviert = false): Mandant[] {
  const rows = getDb().select().from(lpmMandanten).all();
  const filtered = mitArchiviert ? rows : rows.filter((row) => row.aktiv === 1);
  return filtered
    .map(rowToMandant)
    .sort((a, b) => a.name.localeCompare(b.name, 'de'));
}

export function getMandantById(mandantId: string): Mandant | undefined {
  const row = getDb()
    .select()
    .from(lpmMandanten)
    .where(eq(lpmMandanten.mandantId, mandantId))
    .get();
  return row ? rowToMandant(row) : undefined;
}

export function createMandant(input: MandantCreate): Mandant {
  const ts = nowIso();
  const mandantId = randomUUID();
  getDb()
    .insert(lpmMandanten)
    .values({
      mandantId,
      name: input.name.trim(),
      standort: input.standort?.trim() || null,
      ansprechpartner: input.ansprechpartner?.trim() || null,
      branche: input.branche?.trim() || null,
      notizen: input.notizen?.trim() || null,
      aktiv: 1,
      erstelltAm: ts,
      geaendertAm: ts,
    })
    .run();

  const created = getMandantById(mandantId);
  if (!created) {
    throw new Error('Mandant konnte nach Anlage nicht geladen werden');
  }
  return created;
}

function toDbNullable(value: string | null): string | null {
  if (value === null) {
    return null;
  }
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

export function updateMandant(input: MandantUpdate): Mandant {
  const existing = getMandantById(input.mandant_id);
  if (!existing) {
    throw new Error('Mandant nicht gefunden');
  }
  if (!existing.aktiv) {
    throw new Error('Archivierte Mandanten können nicht bearbeitet werden');
  }

  const ts = nowIso();
  getDb()
    .update(lpmMandanten)
    .set({
      name: input.name.trim(),
      standort: toDbNullable(input.standort),
      ansprechpartner: toDbNullable(input.ansprechpartner),
      branche: toDbNullable(input.branche),
      notizen: toDbNullable(input.notizen),
      geaendertAm: ts,
    })
    .where(eq(lpmMandanten.mandantId, input.mandant_id))
    .run();

  const updated = getMandantById(input.mandant_id);
  if (!updated) {
    throw new Error('Mandant konnte nach Aktualisierung nicht geladen werden');
  }
  return updated;
}

export function archivierenMandant(mandantId: string): void {
  const existing = getMandantById(mandantId);
  if (!existing) {
    throw new Error('Mandant nicht gefunden');
  }
  if (!existing.aktiv) {
    return;
  }

  getDb()
    .update(lpmMandanten)
    .set({ aktiv: 0, geaendertAm: nowIso() })
    .where(eq(lpmMandanten.mandantId, mandantId))
    .run();
}
