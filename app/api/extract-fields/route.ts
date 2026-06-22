/**
 * POST /api/extract-fields — multipart { file: <pdf>, provider?: "anthropic"|"openai" }
 * Returns { title?, fields[], provider, model }.
 *
 * Runs on the Node runtime (SDKs + PDF parsing). Origin-gated by
 * NEXT_PUBLIC_ALLOWED_ORIGINS (same list the postMessage bridge uses).
 */
import { extractFields } from '@/src/lib/pdf-extract';

export const runtime = 'nodejs';
export const maxDuration = 60;

const MAX_BYTES = 15 * 1024 * 1024;

const ALLOWED = (process.env.NEXT_PUBLIC_ALLOWED_ORIGINS ?? '')
  .split(/[\s,]+/)
  .map((s) => s.trim())
  .filter(Boolean);

function originAllowed(origin: string): boolean {
  if (ALLOWED.length === 0) return true; // dev: allow all
  if (!origin) return true; // same-origin requests omit Origin
  return ALLOWED.some((pat) => {
    if (pat === '*' || pat === origin) return true;
    try {
      const u = new URL(origin);
      if (pat.startsWith('https://*.')) return u.protocol === 'https:' && u.hostname.endsWith('.' + pat.slice('https://*.'.length));
      if (pat.startsWith('http://*.')) return u.protocol === 'http:' && u.hostname.endsWith('.' + pat.slice('http://*.'.length));
      if (pat.includes('*')) {
        const re = new RegExp('^' + pat.replace(/[.+?^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*') + '$');
        return re.test(origin);
      }
    } catch {
      /* fall through */
    }
    return false;
  });
}

export async function POST(request: Request) {
  const origin = request.headers.get('origin') ?? '';
  if (!originAllowed(origin)) {
    return Response.json({ error: 'forbidden_origin' }, { status: 403 });
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return Response.json({ error: 'invalid_form_data' }, { status: 400 });
  }

  const file = form.get('file');
  if (!(file instanceof File)) return Response.json({ error: 'no_file' }, { status: 400 });
  if (file.type && file.type !== 'application/pdf') {
    return Response.json({ error: 'not_pdf', message: 'Upload a PDF file.' }, { status: 415 });
  }
  if (file.size > MAX_BYTES) {
    return Response.json({ error: 'too_large', message: 'PDF exceeds 15 MB.' }, { status: 413 });
  }

  const provider = (form.get('provider') as string) || undefined;
  const buf = Buffer.from(await file.arrayBuffer());

  try {
    const result = await extractFields(buf, provider);
    return Response.json(result, { status: 200 });
  } catch (e) {
    return Response.json(
      { error: 'extract_failed', message: e instanceof Error ? e.message : String(e) },
      { status: 502 },
    );
  }
}
