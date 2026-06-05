import { eq } from 'drizzle-orm';
import { getDb } from '../client';
import { lpmExporte } from '../schema';
import type { ExportRecord } from '../../export/types';

function nowIso(): string {
  return new Date().toISOString();
}

function rowToRecord(row: typeof lpmExporte.$inferSelect): ExportRecord {
  return {
    id: row.id,
    mandantId: row.mandantId,
    typ: row.typ,
    referenzId: row.referenzId,
    format: row.format,
    dateiname: row.dateiname,
    dateipfad: row.dateipfad,
    erstelltAm: row.erstelltAm,
  };
}

export function createExportRecord(input: {
  mandantId: string;
  typ: string;
  referenzId: number;
  format: string;
  dateiname: string;
  dateipfad: string;
}): ExportRecord {
  const ts = nowIso();
  const result = getDb()
    .insert(lpmExporte)
    .values({
      mandantId: input.mandantId,
      typ: input.typ,
      referenzId: input.referenzId,
      format: input.format,
      dateiname: input.dateiname,
      dateipfad: input.dateipfad,
      erstelltAm: ts,
    })
    .returning()
    .get();
  return rowToRecord(result);
}

export function getExporteByMandant(mandantId: string): ExportRecord[] {
  return getDb()
    .select()
    .from(lpmExporte)
    .where(eq(lpmExporte.mandantId, mandantId))
    .all()
    .map(rowToRecord)
    .sort((a, b) => b.erstelltAm.localeCompare(a.erstelltAm));
}
