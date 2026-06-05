import { z } from 'zod';

const EXPORT_TYPEN = ['checkliste', 'formular'] as const;

export const exportWordSchema = z.object({
  typ: z.enum(EXPORT_TYPEN),
  referenz_id: z.number().int().positive(),
  mandant_id: z.string().uuid('Ungültige Mandanten-ID'),
});

export const exportPdfSchema = exportWordSchema;

export const exportListeSchema = z.object({
  mandant_id: z.string().uuid('Ungültige Mandanten-ID'),
});

export type ExportWordInput = z.infer<typeof exportWordSchema>;
export type ExportListeInput = z.infer<typeof exportListeSchema>;
