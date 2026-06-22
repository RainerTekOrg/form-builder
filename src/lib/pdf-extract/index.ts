/**
 * Provider-pluggable PDF → form-field extraction.
 *
 * Provider is chosen per-request, else PDF_EXTRACT_PROVIDER, else "anthropic".
 *   - "anthropic" → Claude (native PDF, highest quality)
 *   - "openai"    → OpenAI-compatible (cheap cloud, OR OpenRouter / Ollama / any
 *                   OpenAI-compatible endpoint for open-source / local models)
 */
import { extractWithAnthropic } from './providers/anthropic';
import { extractWithOpenAICompatible } from './providers/openai-compatible';
import { normalizeFields } from './normalize';
import type { ExtractResult } from './types';

export const PROVIDERS = ['anthropic', 'openai'] as const;
export type ProviderId = (typeof PROVIDERS)[number];

export function resolveProvider(requested?: string): ProviderId {
  const p = (requested || process.env.PDF_EXTRACT_PROVIDER || 'anthropic').toLowerCase();
  return (PROVIDERS as readonly string[]).includes(p) ? (p as ProviderId) : 'anthropic';
}

export async function extractFields(pdf: Buffer, requested?: string): Promise<ExtractResult> {
  const provider = resolveProvider(requested);
  const raw = provider === 'openai' ? await extractWithOpenAICompatible(pdf) : await extractWithAnthropic(pdf);
  return { ...raw, fields: normalizeFields(raw.fields) };
}

export type { ExtractResult, ExtractedField } from './types';
