import { z } from 'zod';

export const mandantCreateSchema = z.object({
  name: z.string().min(1, 'Name ist erforderlich').max(200),
  standort: z.string().max(2000).optional(),
  ansprechpartner: z.string().max(2000).optional(),
  branche: z.string().max(2000).optional(),
  notizen: z.string().max(8000).optional(),
});

export const mandantUpdateSchema = z.object({
  mandant_id: z.string().uuid('Ungültige Mandanten-ID'),
  name: z.string().min(1, 'Name ist erforderlich').max(200),
  standort: z.string().max(2000).nullable(),
  ansprechpartner: z.string().max(2000).nullable(),
  branche: z.string().max(2000).nullable(),
  notizen: z.string().max(8000).nullable(),
});

export const mandantArchivierenSchema = z.object({
  mandant_id: z.string().uuid('Ungültige Mandanten-ID'),
});

export type MandantCreateInput = z.infer<typeof mandantCreateSchema>;
export type MandantUpdateInput = z.infer<typeof mandantUpdateSchema>;
