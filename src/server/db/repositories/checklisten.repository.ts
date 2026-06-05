import { eq, and } from 'drizzle-orm';
import { getDb } from '../client';
import { lpmChecklistenRuns, lpmChecklistenAntworten } from '../schema';
import type { ChecklisteRunRow, ChecklisteAntwortRow, AntwortSaveInput } from '../../checklisten/types';

function nowIso(): string {
  return new Date().toISOString();
}

function rowToRun(row: typeof lpmChecklistenRuns.$inferSelect): ChecklisteRunRow {
  return {
    id: row.id,
    mandantId: row.mandantId,
    anlageId: row.anlageId,
    anlageName: row.anlageName,
    status: row.status,
    kiZusammenfassung: row.kiZusammenfassung,
    kiAdapter: row.kiAdapter,
    erstelltAm: row.erstelltAm,
    geaendertAm: row.geaendertAm,
    abgeschlossenAm: row.abgeschlossenAm,
  };
}

function rowToAntwort(row: typeof lpmChecklistenAntworten.$inferSelect): ChecklisteAntwortRow {
  return {
    id: row.id,
    mandantId: row.mandantId,
    runId: row.runId,
    frageId: row.frageId,
    abschnitt: row.abschnitt,
    frageText: row.frageText,
    bewertung: row.bewertung,
    kommentar: row.kommentar,
    istFinding: row.istFinding,
    erstelltAm: row.erstelltAm,
    geaendertAm: row.geaendertAm,
  };
}

export function createRun(mandantId: string, anlageId: string, anlageName: string): ChecklisteRunRow {
  const ts = nowIso();
  const db = getDb();
  const result = db
    .insert(lpmChecklistenRuns)
    .values({
      mandantId,
      anlageId,
      anlageName,
      status: 'offen',
      erstelltAm: ts,
      geaendertAm: ts,
    })
    .returning()
    .get();
  return rowToRun(result);
}

export function getRunById(runId: number): ChecklisteRunRow | undefined {
  const row = getDb()
    .select()
    .from(lpmChecklistenRuns)
    .where(eq(lpmChecklistenRuns.id, runId))
    .get();
  return row ? rowToRun(row) : undefined;
}

export function getRunsByMandant(mandantId: string): ChecklisteRunRow[] {
  return getDb()
    .select()
    .from(lpmChecklistenRuns)
    .where(eq(lpmChecklistenRuns.mandantId, mandantId))
    .all()
    .map(rowToRun)
    .sort((a, b) => b.erstelltAm.localeCompare(a.erstelltAm));
}

export function getAntwortenByRun(runId: number): ChecklisteAntwortRow[] {
  return getDb()
    .select()
    .from(lpmChecklistenAntworten)
    .where(eq(lpmChecklistenAntworten.runId, runId))
    .all()
    .map(rowToAntwort);
}

export function upsertAntwort(input: AntwortSaveInput): ChecklisteAntwortRow {
  const ts = nowIso();
  const db = getDb();
  const istFinding = input.bewertung === 'instabil' || input.bewertung === 'eingeschraenkt' ? 1 : 0;

  const existing = db
    .select()
    .from(lpmChecklistenAntworten)
    .where(
      and(
        eq(lpmChecklistenAntworten.runId, input.runId),
        eq(lpmChecklistenAntworten.frageId, input.frageId)
      )
    )
    .get();

  if (existing) {
    const updated = db
      .update(lpmChecklistenAntworten)
      .set({
        bewertung: input.bewertung,
        kommentar: input.kommentar,
        istFinding,
        geaendertAm: ts,
      })
      .where(eq(lpmChecklistenAntworten.id, existing.id))
      .returning()
      .get();
    return rowToAntwort(updated);
  }

  const inserted = db
    .insert(lpmChecklistenAntworten)
    .values({
      mandantId: input.mandantId,
      runId: input.runId,
      frageId: input.frageId,
      abschnitt: input.abschnitt,
      frageText: input.frageText,
      bewertung: input.bewertung,
      kommentar: input.kommentar,
      istFinding,
      erstelltAm: ts,
      geaendertAm: ts,
    })
    .returning()
    .get();
  return rowToAntwort(inserted);
}

export function updateRunStatus(runId: number, status: string): void {
  getDb()
    .update(lpmChecklistenRuns)
    .set({ status, geaendertAm: nowIso() })
    .where(eq(lpmChecklistenRuns.id, runId))
    .run();
}

export function updateRunKi(runId: number, kiZusammenfassung: string, kiAdapter: string | null): void {
  getDb()
    .update(lpmChecklistenRuns)
    .set({ kiZusammenfassung, kiAdapter, geaendertAm: nowIso() })
    .where(eq(lpmChecklistenRuns.id, runId))
    .run();
}

export function abschliessenRun(runId: number, kiZusammenfassung: string | null, kiAdapter: string | null): void {
  const ts = nowIso();
  getDb()
    .update(lpmChecklistenRuns)
    .set({
      status: 'abgeschlossen',
      kiZusammenfassung,
      kiAdapter,
      abgeschlossenAm: ts,
      geaendertAm: ts,
    })
    .where(eq(lpmChecklistenRuns.id, runId))
    .run();
}
