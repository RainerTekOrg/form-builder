# PDF → form-field extraction

Upload a PDF (an existing form or lab report) and get back a structured list of
form fields, ready to inject into the builder via `builderStore.addEntity(...)`.

A single Claude/OpenAI **API call** with structured output — not an MCP server.
Provider is pluggable for cost control.

## Endpoint

`POST /api/extract-fields` — multipart `{ file: <pdf>, provider?: "anthropic" | "openai" }`
→ `{ title?, fields: ExtractedField[], provider, model }`

Origin-gated by `NEXT_PUBLIC_ALLOWED_ORIGINS`. Node runtime. 15 MB cap.

## Install (one-time)

```bash
npm i @anthropic-ai/sdk openai pdf-parse
npm i -D @types/pdf-parse
```

## Providers & env

Pick the default with `PDF_EXTRACT_PROVIDER` (or pass `provider` per request).

**`anthropic`** — Claude, native PDF, best quality (default):
```
PDF_EXTRACT_PROVIDER=anthropic
ANTHROPIC_API_KEY=sk-ant-...
ANTHROPIC_MODEL=claude-opus-4-8        # optional override
```

**`openai`** — OpenAI-compatible, the low-cost path. PDFs are sent as extracted
text, so it also works with OpenRouter and local/open models. Point it anywhere
OpenAI-compatible by setting `OPENAI_BASE_URL`:
```
PDF_EXTRACT_PROVIDER=openai
OPENAI_API_KEY=sk-...                   # cloud OpenAI
OPENAI_MODEL=gpt-4o-mini                # set to your chosen model

# OpenRouter (gateway to many cheap + open models):
#   OPENAI_API_KEY=sk-or-...
#   OPENAI_BASE_URL=https://openrouter.ai/api/v1
#   OPENAI_MODEL=meta-llama/llama-3.1-8b-instruct   (example)

# Ollama (local, free):
#   OPENAI_API_KEY=ollama               (ignored by Ollama)
#   OPENAI_BASE_URL=http://localhost:11434/v1
#   OPENAI_MODEL=llama3.1
```

> The OpenAI-compatible adapter tries strict `json_schema` output first and
> falls back to `json_object` for models that don't support strict schemas.

## Files

- `types.ts` — `ExtractedField` + the shared JSON schema
- `prompt.ts` — extraction instructions
- `providers/anthropic.ts` — Claude (native PDF)
- `providers/openai-compatible.ts` — OpenAI / OpenRouter / Ollama (text)
- `pdf-text.ts` — PDF → text (for the text path)
- `normalize.ts` — safe snake_case keys, valid types, options
- `index.ts` — `extractFields(pdf, provider?)` dispatch
