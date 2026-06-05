import type { KiAdapter } from '../types';

const DEFAULT_MODEL = 'gpt-4o';
const API_URL = 'https://api.openai.com/v1/chat/completions';

export const openaiAdapter: KiAdapter = {
  id: 'openai',

  async stream(systemPrompt, userPrompt, config, onChunk) {
    if (!config.apiKey) {
      onChunk({ type: 'error', error: 'OpenAI API-Key fehlt. Bitte in den Einstellungen hinterlegen.' });
      return;
    }

    const model = config.modell ?? DEFAULT_MODEL;
    const start = Date.now();

    let response: Response;
    try {
      response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${config.apiKey}`,
        },
        body: JSON.stringify({
          model,
          stream: true,
          stream_options: { include_usage: true },
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
          ],
        }),
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Verbindungsfehler';
      onChunk({ type: 'error', error: `OpenAI nicht erreichbar: ${msg}` });
      return;
    }

    if (!response.ok) {
      const body = await response.text().catch(() => '');
      onChunk({ type: 'error', error: `OpenAI Fehler: HTTP ${response.status} ${body}` });
      return;
    }

    if (!response.body) {
      onChunk({ type: 'error', error: 'OpenAI: Kein Response-Body' });
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
          if (data === '[DONE]') continue;

          let parsed: Record<string, unknown>;
          try {
            parsed = JSON.parse(data) as Record<string, unknown>;
          } catch {
            continue;
          }

          const choices = parsed['choices'] as Array<Record<string, unknown>> | undefined;
          const delta = choices?.[0]?.['delta'] as Record<string, unknown> | undefined;
          const text = typeof delta?.['content'] === 'string' ? delta['content'] : '';
          if (text) onChunk({ type: 'chunk', text });

          const usage = parsed['usage'] as Record<string, unknown> | undefined;
          if (usage) {
            inputTokens = typeof usage['prompt_tokens'] === 'number' ? usage['prompt_tokens'] : 0;
            outputTokens = typeof usage['completion_tokens'] === 'number' ? usage['completion_tokens'] : 0;
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
      adapter: 'openai',
      modell: model,
    });
  },

  async testConnection(config) {
    if (!config.apiKey) return { ok: false, info: 'API-Key fehlt' };
    try {
      const res = await fetch('https://api.openai.com/v1/models', {
        headers: { Authorization: `Bearer ${config.apiKey}` },
        signal: AbortSignal.timeout(8000),
      });
      if (!res.ok) return { ok: false, info: `HTTP ${res.status}` };
      return { ok: true, info: 'OpenAI API erreichbar' };
    } catch (err) {
      return { ok: false, info: err instanceof Error ? err.message : 'Fehler' };
    }
  },
};
