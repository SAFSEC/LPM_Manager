import { z } from 'zod';

export const einstellungSaveSchema = z.object({
  schluessel: z.string().min(1).max(128),
  wert: z.string().max(8192),
});

export type EinstellungSave = z.infer<typeof einstellungSaveSchema>;
