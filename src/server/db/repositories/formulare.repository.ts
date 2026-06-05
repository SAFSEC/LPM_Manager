import { eq, and } from 'drizzle-orm';
import { getDb } from '../client';
import { lpmFormulare } from '../schema';
import type { FormularRow, FormularSaveInput } from '../../formulare/types';
import { getFormularDefinition } from '../../formulare/catalog';

function nowIso(): string {
  return new Date().toISOString();
}

function rowToFormular(row: typeof lpmFormulare.$inferSelect): FormularRow {
  let felder: Record<string, string> = {};
  try {
    const parsed: unknown = JSON.parse(row.felder);
    if (parsed !== null && typeof parsed === 'object' && !Array.isArray(parsed)) {
      felder = parsed as Record<string, string>;
    }
  } catch {
    felder = {};
  }
  return {
    id: row.id,
    mandantId: row.mandantId,
    formularId: row.formularId,
    formularName: row.formularName,
    felder,
    status: row.status as 'entwurf' | 'final',
    erstelltAm: row.erstelltAm,
    geaendertAm: row.geaendertAm,
  };
}

export function getFormularById(id: number): FormularRow | undefined {
  const row = getDb()
    .select()
    .from(lpmFormulare)
    .where(eq(lpmFormulare.id, id))
    .get();
  return row ? rowToFormular(row) : undefined;
}

export function getFormulareByMandant(mandantId: string): FormularRow[] {
  return getDb()
    .select()
    .from(lpmFormulare)
    .where(eq(lpmFormulare.mandantId, mandantId))
    .all()
    .map(rowToFormular)
    .sort((a, b) => b.geaendertAm.localeCompare(a.geaendertAm));
}

export function getFormulareByMandantAndTyp(mandantId: string, formularId: string): FormularRow[] {
  return getDb()
    .select()
    .from(lpmFormulare)
    .where(
      and(
        eq(lpmFormulare.mandantId, mandantId),
        eq(lpmFormulare.formularId, formularId)
      )
    )
    .all()
    .map(rowToFormular)
    .sort((a, b) => b.geaendertAm.localeCompare(a.geaendertAm));
}

export function upsertFormular(input: FormularSaveInput): FormularRow {
  const ts = nowIso();
  const db = getDb();

  const definition = getFormularDefinition(input.formularId);
  const formularName = definition?.name ?? input.formularId;
  const felderJson = JSON.stringify(input.felder);

  if (input.id !== undefined) {
    const updated = db
      .update(lpmFormulare)
      .set({
        felder: felderJson,
        geaendertAm: ts,
      })
      .where(
        and(
          eq(lpmFormulare.id, input.id),
          eq(lpmFormulare.mandantId, input.mandantId)
        )
      )
      .returning()
      .get();
    return rowToFormular(updated);
  }

  const inserted = db
    .insert(lpmFormulare)
    .values({
      mandantId: input.mandantId,
      formularId: input.formularId,
      formularName,
      felder: felderJson,
      status: 'entwurf',
      erstelltAm: ts,
      geaendertAm: ts,
    })
    .returning()
    .get();
  return rowToFormular(inserted);
}

export function finalisierenFormular(id: number): FormularRow {
  const ts = nowIso();
  const updated = getDb()
    .update(lpmFormulare)
    .set({ status: 'final', geaendertAm: ts })
    .where(eq(lpmFormulare.id, id))
    .returning()
    .get();
  return rowToFormular(updated);
}

export function deleteFormular(id: number, mandantId: string): void {
  getDb()
    .delete(lpmFormulare)
    .where(
      and(
        eq(lpmFormulare.id, id),
        eq(lpmFormulare.mandantId, mandantId)
      )
    )
    .run();
}
