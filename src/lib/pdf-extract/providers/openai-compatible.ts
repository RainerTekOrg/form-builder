/**
 * OpenAI-compatible provider — the low-cost path.
 *
 * Works for OpenAI cloud AND any OpenAI-compatible endpoint (OpenRouter, Ollama,
 * vLLM, LM Studio) — only OPENAI_BASE_URL + OPENAI_MODEL differ. PDFs are sent as
 * extracted text so even text-only / open-source models work.
 *
 *   OpenAI cloud:  OPENAI_API_KEY=sk-...            OPENAI_MODEL=gpt-4o-mini
 *   OpenRouter:    OPENAI_API_KEY=sk-or-...         OPENAI_BASE_URL=https://openrouter.ai/api/v1   OPENAI_MODEL=...
 *   Ollama (local):OPENAI_API_KEY=ollama (ignored)  OPENAI_BASE_URL=http://localhost:11434/v1       OPENAI_MODEL=llama3.1
 */
import OpenAI from 'openai';
import { FIELD_LIST_JSON_SCHEMA, type ExtractResult } from '../types';
import { EXTRACTION_SYSTEM, EXTRACTION_USER } from '../prompt';
import { pdfToText } from '../pdf-text';

export async function extractWithOpenAICompatible(pdf: Buffer): Promise<ExtractResult> {
  const baseURL = process.env.OPENAI_BASE_URL || undefined;
  const apiKey = process.env.OPENAI_API_KEY || 'not-needed'; // local servers ignore it
  const model = process.env.OPENAI_MODEL || 'gpt-4o-mini';
  const client = new OpenAI({ apiKey, baseURL });

  const text = await pdfToText(pdf);
  const messages = [
    { role: 'system' as const, content: EXTRACTION_SYSTEM },
    { role: 'user' as const, content: `${EXTRACTION_USER}\n\n--- DOCUMENT TEXT ---\n${text}` },
  ];

  let content: string | null = null;
  try {
    // Preferred: strict JSON-schema structured output.
    const res = await client.chat.completions.create({
      model,
      messages,
      response_format: {
        type: 'json_schema',
        json_schema: { name: 'form_fields', schema: FIELD_LIST_JSON_SCHEMA, strict: true },
      },
    } as never);
    content = (res as { choices: Array<{ message?: { content?: string } }> }).choices[0]?.message?.content ?? null;
  } catch {
    // Fallback for models without json_schema support (many open models): ask for
    // a JSON object and instruct the shape in the prompt.
    const res = await client.chat.completions.create({
      model,
      messages: [
        messages[0],
        {
          role: 'user' as const,
          content:
            `${messages[1].content}\n\nRespond ONLY with a JSON object of the form ` +
            `{"title": string, "fields": [{"key","label","type","required?","placeholder?","helpText?","section?","options?":[{"value","label"}]}]}.`,
        },
      ],
      response_format: { type: 'json_object' },
    } as never);
    content = (res as { choices: Array<{ message?: { content?: string } }> }).choices[0]?.message?.content ?? null;
  }

  const parsed = JSON.parse(content || '{"fields":[]}');
  return {
    title: parsed.title,
    fields: parsed.fields ?? [],
    provider: baseURL ? 'openai-compatible' : 'openai',
    model,
  };
}
