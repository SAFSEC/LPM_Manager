export type KiUseCase = 'ERKLAERUNG' | 'ZUSAMMENFASSUNG' | 'EMPFEHLUNG' | 'RISIKO';

export type KiAdapterId = 'ollama' | 'anthropic' | 'openai' | 'gemini' | 'openrouter';

export interface KiAnfrage {
  useCase: KiUseCase;
  prompt: string;
  adapter?: KiAdapterId;
  mandantId?: string;
}

export interface KiStreamChunk {
  type: 'chunk' | 'done' | 'error';
  text?: string;
  error?: string;
  tokenInput?: number;
  tokenOutput?: number;
  dauerMs?: number;
  adapter?: KiAdapterId;
  modell?: string;
}

export interface KiAdapterConfig {
  apiKey?: string;
  baseUrl?: string;
  modell?: string;
}

export interface KiAdapter {
  id: KiAdapterId;
  stream(
    systemPrompt: string,
    userPrompt: string,
    config: KiAdapterConfig,
    onChunk: (chunk: KiStreamChunk) => void
  ): Promise<void>;
  testConnection(config: KiAdapterConfig): Promise<{ ok: boolean; info?: string }>;
}
