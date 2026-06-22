/**
 * Anthropic (Claude) provider — highest-quality path.
 * Sends the PDF natively as a document block + structured output. Default model
 * claude-opus-4-8 (override with ANTHROPIC_MODEL).
 */
import Anthropic from '@anthropic-ai/sdk';
import { FIELD_LIST_JSON_SCHEMA, type ExtractResult } from '../types';
import { EXTRACTION_SYSTEM, EXTRACTION_USER } from '../prompt';

export async function extractWithAnthropic(pdf: Buffer): Promise<ExtractResult> {
  const model = process.env.ANTHROPIC_MODEL || 'claude-opus-4-8';
  const client = new Anthropic(); // reads ANTHROPIC_API_KEY

  // output_config may be newer than the installed SDK's types — build loosely.
  const params = {
    model,
    max_tokens: 8000,
    system: EXTRACTION_SYSTEM,
    output_config: { format: { type: 'json_schema', schema: FIELD_LIST_JSON_SCHEMA } },
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'document',
            source: { type: 'base64', media_type: 'application/pdf', data: pdf.toString('base64') },
          },
          { type: 'text', text: EXTRACTION_USER },
        ],
      },
    ],
  };

  const res = await client.messages.create(params as never);
  const block = (res.content as Array<{ type: string; text?: string }>).find(
    (b) => b.type === 'text',
  );
  const parsed = JSON.parse(block?.text || '{"fields":[]}');
  return { title: parsed.title, fields: parsed.fields ?? [], provider: 'anthropic', model };
}
