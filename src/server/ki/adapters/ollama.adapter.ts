import type { KiAdapter } from '../types';

const DEFAULT_URL = 'http://localhost:11434';
const DEFAULT_MODEL = 'llama3.2';

export const ollamaAdapter: KiAdapter = {
  id: 'ollama',

  async stream(systemPrompt, userPrompt, config, onChunk) {
    const baseUrl = config.baseUrl ?? DEFAULT_URL;
    const model = config.modell ?? DEFAULT_MODEL;
    const start = Date.now();

    let response: Response;
    try {
      response = await fetch(`${baseUrl}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model,
          stream: true,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
          ],
        }),
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Verbindungsfehler';
      onChunk({ type: 'error', error: `Ollama nicht erreichbar: ${msg}` });
      return;
    }

    if (!response.ok) {
      onChunk({ type: 'error', error: `Ollama Fehler: HTTP ${response.status}` });
      return;
    }

    if (!response.body) {
      onChunk({ type: 'error', error: 'Ollama: Kein Response-Body' });
      return;
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let tokenInput = 0;
    let tokenOutput = 0;

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const lines = decoder.decode(value, { stream: true }).split('\n');
        for (const line of lines) {
          if (!line.trim()) continue;
          let parsed: Record<string, unknown>;
          try {
            parsed = JSON.parse(line) as Record<string, unknown>;
          } catch {
            continue;
          }

          const message = parsed['message'] as Record<string, unknown> | undefined;
          const text = typeof message?.['content'] === 'string' ? message['content'] : '';
          if (text) onChunk({ type: 'chunk', text });

          if (parsed['done'] === true) {
            const promptTokens = parsed['prompt_eval_count'];
            const evalTokens = parsed['eval_count'];
            tokenInput = typeof promptTokens === 'number' ? promptTokens : 0;
            tokenOutput = typeof evalTokens === 'number' ? evalTokens : 0;
          }
        }
      }
    } finally {
      reader.releaseLock();
    }

    onChunk({
      type: 'done',
      tokenInput,
      tokenOutput,
      dauerMs: Date.now() - start,
      adapter: 'ollama',
      modell: model,
    });
  },

  async testConnection(config) {
    const baseUrl = config.baseUrl ?? DEFAULT_URL;
    try {
      const res = await fetch(`${baseUrl}/api/tags`, { signal: AbortSignal.timeout(5000) });
      if (!res.ok) return { ok: false, info: `HTTP ${res.status}` };
      return { ok: true, info: `Ollama erreichbar (${baseUrl})` };
    } catch (err) {
      return { ok: false, info: err instanceof Error ? err.message : 'Fehler' };
    }
  },
};
