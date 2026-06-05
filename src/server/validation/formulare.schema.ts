import { z } from 'zod';

export const formularSpeichernSchema = z.object({
  mandant_id: z.string().min(1, 'Mandant-ID fehlt'),
  formular_id: z.string().min(1, 'Formular-ID fehlt'),
  felder: z.record(z.string(), z.string()),
  id: z.number().int().optional(),
});

export const formularLadenSchema = z.object({
  id: z.number().int().positive('Ungültige Formular-ID'),
});

export const formulareVonMandantSchema = z.object({
  mandant_id: z.string().min(1, 'Mandant-ID fehlt'),
});

export const formularFinalisierenSchema = z.object({
  id: z.number().int().positive('Ungültige Formular-ID'),
});

export type FormularSpeichernInput = z.infer<typeof formularSpeichernSchema>;
export type FormularLadenInput = z.infer<typeof formularLadenSchema>;
export type FormulareVonMandantInput = z.infer<typeof formulareVonMandantSchema>;
export type FormularFinalisierenInput = z.infer<typeof formularFinalisierenSchema>;
