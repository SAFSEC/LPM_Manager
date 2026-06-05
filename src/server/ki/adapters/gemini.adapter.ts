import type { KiAdapter } from '../types';

const DEFAULT_MODEL = 'gemini-2.0-flash';

export const geminiAdapter: KiAdapter = {
  id: 'gemini',

  async stream(systemPrompt, userPrompt, config, onChunk) {
    if (!config.apiKey) {
      onChunk({ type: 'error', error: 'Gemini API-Key fehlt. Bitte in den Einstellungen hinterlegen.' });
      return;
    }

    const model = config.modell ?? DEFAULT_MODEL;
    const start = Date.now();
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:streamGenerateContent?alt=sse&key=${config.apiKey}`;

    let response: Response;
    try {
      response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: systemPrompt }] },
          contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
          generationConfig: { maxOutputTokens: 4096 },
        }),
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Verbindungsfehler';
      onChunk({ type: 'error', error: `Gemini nicht erreichbar: ${msg}` });
      return;
    }

    if (!response.ok) {
      const body = await response.text().catch(() => '');
      onChunk({ type: 'error', error: `Gemini Fehler: HTTP ${response.status} ${body}` });
      return;
    }

    if (!response.body) {
      onChunk({ type: 'error', error: 'Gemini: Kein Response-Body' });
      return;
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let inputTokens = 0;
    let outputTokens = 0;
    let buffer = '';

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() ?? '';

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          const data = line.slice(6).trim();

          let parsed: Record<string, unknown>;
          try {
            parsed = JSON.parse(data) as Record<string, unknown>;
          } catch {
            continue;
          }

          const candidates = parsed['candidates'] as Array<Record<string, unknown>> | undefined;
          const content = candidates?.[0]?.['content'] as Record<string, unknown> | undefined;
          const parts = content?.['parts'] as Array<Record<string, unknown>> | undefined;
          const text = typeof parts?.[0]?.['text'] === 'string' ? parts[0]['text'] : '';
          if (text) onChunk({ type: 'chunk', text });

          const usageMetadata = parsed['usageMetadata'] as Record<string, unknown> | undefined;
          if (usageMetadata) {
            inputTokens = typeof usageMetadata['promptTokenCount'] === 'number' ? usageMetadata['promptTokenCount'] : 0;
            outputTokens = typeof usageMetadata['candidatesTokenCount'] === 'number' ? usageMetadata['candidatesTokenCount'] : 0;
          }
        }
      }
    } finally {
      reader.releaseLock();
    }

    onChunk({
      type: 'done',
      tokenInput: inputTokens,
      tokenOutput: outputTokens,
      dauerMs: Date.now() - start,
      adapter: 'gemini',
      modell: model,
    });
  },

  async testConnection(config) {
    if (!config.apiKey) return { ok: false, info: 'API-Key fehlt' };
    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models?key=${config.apiKey}`,
        { signal: AbortSignal.timeout(8000) }
      );
      if (!res.ok) return { ok: false, info: `HTTP ${res.status}` };
      return { ok: true, info: 'Gemini API erreichbar' };
    } catch (err) {
      return { ok: false, info: err instanceof Error ? err.message : 'Fehler' };
    }
  },
};
