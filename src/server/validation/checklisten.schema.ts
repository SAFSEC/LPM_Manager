import { z } from 'zod';

export const runStartenSchema = z.object({
  mandant_id: z.string().uuid('Ungültige Mandanten-ID'),
  anlage_id: z.string().min(1).max(10),
});

export const runLadenSchema = z.object({
  run_id: z.number().int().positive(),
});

export const runAbschliessenSchema = z.object({
  run_id: z.number().int().positive(),
});

export const runsVonMandantSchema = z.object({
  mandant_id: z.string().uuid('Ungültige Mandanten-ID'),
});

const BEWERTUNGEN = ['stabil', 'eingeschraenkt', 'instabil', 'na'] as const;

export const antwortSpeichernSchema = z.object({
  run_id: z.number().int().positive(),
  mandant_id: z.string().uuid('Ungültige Mandanten-ID'),
  frage_id: z.string().min(1).max(50),
  abschnitt: z.string().min(1).max(200),
  frage_text: z.string().min(1).max(2000),
  bewertung: z.enum(BEWERTUNGEN).nullable(),
  kommentar: z.string().max(5000).nullable(),
});

export const kiSpeichernSchema = z.object({
  run_id: z.number().int().positive(),
  ki_zusammenfassung: z.string().max(20000),
  ki_adapter: z.string().max(50).nullable(),
});

export type RunStartenInput = z.infer<typeof runStartenSchema>;
export type AntwortSpeichernInput = z.infer<typeof antwortSpeichernSchema>;
export type KiSpeichernInput = z.infer<typeof kiSpeichernSchema>;
