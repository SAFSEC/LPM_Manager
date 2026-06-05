import { getEinstellung } from '../db/repositories/einstellungen.repository';
import { ollamaAdapter } from './adapters/ollama.adapter';
import { anthropicAdapter } from './adapters/anthropic.adapter';
import { openaiAdapter } from './adapters/openai.adapter';
import { geminiAdapter } from './adapters/gemini.adapter';
import { openrouterAdapter } from './adapters/openrouter.adapter';
import type { KiAdapter, KiAdapterId, KiUseCase } from './types';

export { KiUseCase };

const ADAPTERS: Record<KiAdapterId, KiAdapter> = {
  ollama: ollamaAdapter,
  anthropic: anthropicAdapter,
  openai: openaiAdapter,
  gemini: geminiAdapter,
  openrouter: openrouterAdapter,
};

const USE_CASE_DEFAULTS: Record<KiUseCase, KiAdapterId> = {
  ERKLAERUNG: 'ollama',
  ZUSAMMENFASSUNG: 'ollama',
  EMPFEHLUNG: 'ollama',
  RISIKO: 'anthropic',
};

function isValidAdapterId(id: string): id is KiAdapterId {
  return id in ADAPTERS;
}

export function resolveAdapter(useCase: KiUseCase, override?: string): KiAdapter {
  if (override && isValidAdapterId(override)) {
    return ADAPTERS[override];
  }

  const settingKey = `ki.adapter.${useCase.toLowerCase()}`;
  const fromDb = getEinstellung(settingKey);
  if (fromDb && isValidAdapterId(fromDb)) {
    return ADAPTERS[fromDb];
  }

  return ADAPTERS[USE_CASE_DEFAULTS[useCase]];
}

export function getAdapter(id: KiAdapterId): KiAdapter {
  return ADAPTERS[id];
}

export function getAllAdapterIds(): KiAdapterId[] {
  return Object.keys(ADAPTERS) as KiAdapterId[];
}

export function getAdapterConfig(adapterId: KiAdapterId): {
  apiKey?: string;
  baseUrl?: string;
  modell?: string;
} {
  return {
    apiKey: getEinstellung(`ki.apikey.${adapterId}`),
    baseUrl: getEinstellung(`ki.baseurl.${adapterId}`),
    modell: getEinstellung(`ki.modell.${adapterId}`),
  };
}
