import type { KiAdapter } from '../types';

const DEFAULT_MODEL = 'claude-sonnet-4-6';
const API_URL = 'https://api.anthropic.com/v1/messages';

export const anthropicAdapter: KiAdapter = {
  id: 'anthropic',

  async stream(systemPrompt, userPrompt, config, onChunk) {
    if (!config.apiKey) {
      onChunk({ type: 'error', error: 'Anthropic API-Key fehlt. Bitte in den Einstellungen hinterlegen.' });
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
          'x-api-key': config.apiKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model,
          max_tokens: 4096,
          stream: true,
          system: systemPrompt,
          messages: [{ role: 'user', content: userPrompt }],
        }),
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Verbindungsfehler';
      onChunk({ type: 'error', error: `Anthropic nicht erreichbar: ${msg}` });
      return;
    }

    if (!response.ok) {
      const body = await response.text().catch(() => '');
      onChunk({ type: 'error', error: `Anthropic Fehler: HTTP ${response.status} ${body}` });
      return;
    }

    if (!response.body) {
      onChunk({ type: 'error', error: 'Anthropic: Kein Response-Body' });
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

          const type = parsed['type'];
          if (type === 'content_block_delta') {
            const delta = parsed['delta'] as Record<string, unknown> | undefined;
            const text = typeof delta?.['text'] === 'string' ? delta['text'] : '';
            if (text) onChunk({ type: 'chunk', text });
          } else if (type === 'message_delta') {
            const usage = parsed['usage'] as Record<string, unknown> | undefined;
            outputTokens = typeof usage?.['output_tokens'] === 'number' ? usage['output_tokens'] : 0;
          } else if (type === 'message_start') {
            const message = parsed['message'] as Record<string, unknown> | undefined;
            const usage = message?.['usage'] as Record<string, unknown> | undefined;
            inputTokens = typeof usage?.['input_tokens'] === 'number' ? usage['input_tokens'] : 0;
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
      adapter: 'anthropic',
      modell: model,
    });
  },

  async testConnection(config) {
    if (!config.apiKey) return { ok: false, info: 'API-Key fehlt' };
    try {
      const res = await fetch('https://api.anthropic.com/v1/models', {
        headers: { 'x-api-key': config.apiKey, 'anthropic-version': '2023-06-01' },
        signal: AbortSignal.timeout(8000),
      });
      if (!res.ok) return { ok: false, info: `HTTP ${res.status}` };
      return { ok: true, info: 'Anthropic API erreichbar' };
    } catch (err) {
      return { ok: false, info: err instanceof Error ? err.message : 'Fehler' };
    }
  },
};
