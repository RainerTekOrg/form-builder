# Smoke Test — `forms.manne.work`

> Manual verification checklist for a production deploy. Run after every Coolify redeploy and at least once per release.

## Pre-flight (one-time, on the box)

- [ ] Coolify app points at `main` branch
- [ ] Build pack: `pnpm build` (or `pnpm install --frozen-lockfile && pnpm build`)
- [ ] Start command: `pnpm start`
- [ ] Health-check path: `/api/health`
- [ ] Env vars set in Coolify:
  - `NEXT_PUBLIC_ALLOWED_ORIGINS=https://lims.manne.work,https://forms.manne.work`
- [ ] Wildcard SSL certificate covers `forms.manne.work` (existing `*.manne.work` cert)
- [ ] DNS: `forms.manne.work` → Coolify app

## HTTP checks (curl)

Replace `FORMS` with the deployed host (e.g. `https://forms.manne.work`).

```bash
# 1. App boots
curl -sf -o /dev/null -w "GET /  -> %{http_code}\n" $FORMS/
# Expect: 200

# 2. Health endpoint
curl -sf $FORMS/api/health | jq
# Expect: { "status": "ok", "service": "form-builder", ... }

# 3. CSP header is present
curl -sIf $FORMS/ | grep -i content-security-policy
# Expect: default-src 'self'; frame-ancestors 'self' http://localhost:* https://*.manne.work; ...

# 4. Static assets
curl -sf -o /dev/null -w "GET /favicon.ico -> %{http_code}\n" $FORMS/favicon.ico
# Expect: 200
```

## Iframe / bridge checks (manual in a browser)

Open `https://forms.manne.work/public/test-host.html` (also accessible directly).

- [ ] **LOAD_FORM preset** loads, fields render on canvas, Preview tab shows the form
- [ ] **LOAD_GROUP preset** adds a group to the palette; drag it onto the canvas; fields appear namespaced (e.g. `customer.company_name`)
- [ ] **JSON editor** accepts a hand-written `{ schema, uiSchema }` and renders it
- [ ] **Foreign origin** (`?origin=https://evil.example`) is rejected — log panel shows a warning
- [ ] **Cmd/Ctrl+S** triggers `FORM_SAVED` in the log panel with the round-tripped JSON
- [ ] **Export JSON** downloads a valid file that re-imports cleanly

## Round-trip sanity (CLI)

```bash
# Serialize → deserialize → re-serialize; output must be byte-identical
pnpm vitest run tests/roundtrip.test.ts
# Expect: 5 fixtures passed
```

## CI gate

- [ ] `https://github.com/<org>/form-builder/actions` shows the latest `CI / Build & Test` job as **green**
- [ ] Latest deploy SHA matches a green CI run (Coolify → "Deployment" → commit SHA → matches GitHub Actions run)

## Rollback

- Coolify → form-builder app → "Deployments" → "Rollback" to the previous green deployment
- CI re-runs on `main` push; no manual action needed
