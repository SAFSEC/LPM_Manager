import { privacyFilter } from '../privacy/index';
import { systemPrompt } from '../skills/system';
import { resolveAdapter, getAdapter, getAdapterConfig } from './router';
import { logKiAudit } from '../db/repositories/ki-audit.repository';
import type { KiAnfrage, KiStreamChunk, KiAdapterId } from './types';

export type { KiAnfrage, KiStreamChunk, KiAdapterId };
export { getAllAdapterIds, getAdapterConfig } from './router';
export type { KiUseCase } from './types';

export async function sendKiAnfrage(
  anfrage: KiAnfrage,
  onChunk: (chunk: KiStreamChunk) => void
): Promise<void> {
  const adapter = resolveAdapter(anfrage.useCase, anfrage.adapter);
  const config = getAdapterConfig(adapter.id);

  const mandantId = anfrage.mandantId ?? 'unbekannt';

  let userPrompt = anfrage.prompt;

  if (adapter.id !== 'ollama') {
    const filtered = privacyFilter({ prompt: anfrage.prompt }, adapter.id);
    if (!filtered.passed) {
      onChunk({ type: 'error', error: 'Privacy-Filter: Anfrage enthält schützenswerte Daten die nicht gesendet werden dürfen.' });
      return;
    }
    userPrompt = filtered.processedData['prompt'] ?? anfrage.prompt;
  }

  const sys = systemPrompt();
  let finalChunk: KiStreamChunk | null = null;
  let hasError = false;

  await adapter.stream(sys, userPrompt, config, (chunk) => {
    if (chunk.type === 'done') finalChunk = chunk;
    if (chunk.type === 'error') hasError = true;
    onChunk(chunk);
  });

  logKiAudit({
    mandantId,
    useCase: anfrage.useCase,
    adapter: adapter.id,
    modell: finalChunk?.['modell'] as string | undefined,
    tokenInput: finalChunk?.['tokenInput'] as number | undefined,
    tokenOutput: finalChunk?.['tokenOutput'] as number | undefined,
    dauerMs: finalChunk?.['dauerMs'] as number | undefined,
    erfolg: !hasError,
  });
}

export async function testeAdapter(
  adapterId: KiAdapterId
): Promise<{ ok: boolean; info?: string }> {
  const adapter = getAdapter(adapterId);
  const config = getAdapterConfig(adapterId);
  return adapter.testConnection(config);
}
