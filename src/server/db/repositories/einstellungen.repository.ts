import { eq } from 'drizzle-orm';
import { getDb } from '../client';
import { lpmEinstellungen } from '../schema';

function nowIso(): string {
  return new Date().toISOString();
}

export function getEinstellungen(): Record<string, string> {
  const rows = getDb().select().from(lpmEinstellungen).all();
  const result: Record<string, string> = {};
  for (const row of rows) {
    result[row.schluessel] = row.wert;
  }
  return result;
}

export function setEinstellung(schluessel: string, wert: string): void {
  const ts = nowIso();
  getDb()
    .insert(lpmEinstellungen)
    .values({ schluessel, wert, geaendertAm: ts })
    .onConflictDoUpdate({
      target: lpmEinstellungen.schluessel,
      set: { wert, geaendertAm: ts },
    })
    .run();
}

export function getEinstellung(schluessel: string): string | undefined {
  const row = getDb()
    .select()
    .from(lpmEinstellungen)
    .where(eq(lpmEinstellungen.schluessel, schluessel))
    .get();
  return row?.wert;
}
