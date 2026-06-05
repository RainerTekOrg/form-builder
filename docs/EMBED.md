# Embedding the Form Builder

> How the LIMS host page embeds and communicates with `forms.manne.work`.

The form builder has two modes:

1. **Build mode** (default) — for form authors. Drag-drop, edit attributes, save schemas.
2. **Fill mode** (`?mode=fill`) — for end-users. Render a saved schema as a fillable form, capture submitted values.

## Quick Start — Build Mode

```html
<iframe
  id="formBuilder"
  src="https://forms.manne.work"
  width="100%"
  height="600"
  style="border: none; border-radius: 8px;"
  title="Form Builder"
></iframe>

<script>
  const iframe = document.getElementById("formBuilder");

  // 1. Load an existing form for editing
  function loadForm(payload) {
    iframe.contentWindow.postMessage(
      { type: "LOAD_FORM", payload },
      "https://forms.manne.work",
    );
  }

  // 2. Listen for save events
  window.addEventListener("message", (event) => {
    if (event.origin !== "https://forms.manne.work") return;

    if (event.data.type === "FORM_SAVED") {
      const { schema, uiSchema, title } = event.data.payload;
      console.log("Form saved:", title, schema, uiSchema);
      // Store in your backend, render with your own renderer, etc.
    }
  });

  // 3. Optionally load a group
  function loadGroup(payload) {
    iframe.contentWindow.postMessage(
      {
        type: "LOAD_GROUP",
        payload: {
          ...payload,
          groupId: "grp_customer",
          version: 3,
        },
      },
      "https://forms.manne.work",
    );
  }
</script>
```

## Quick Start — Fill Mode

To render a saved form for an end-user to fill out, embed the builder in fill mode. The LIMS posts a `LOAD_FILL` message with the saved schema; the user fills the form and clicks Submit; the builder posts `FORM_FILLED` with the values.

```html
<iframe
  id="formFiller"
  src="https://forms.manne.work/?mode=fill"
  width="100%"
  height="600"
  style="border: none; border-radius: 8px;"
  title="Form"
></iframe>

<script>
  const filler = document.getElementById("formFiller");

  // 1. Tell the filler what form to render, with optional pre-filled values
  function openForm(recordId, savedSchema, savedUiSchema) {
    filler.contentWindow.postMessage(
      {
        type: "LOAD_FILL",
        payload: {
          title: "Sampling Record",                // optional
          schema: savedSchema,
          uiSchema: savedUiSchema,
          defaults: {                              // optional
            "sampling_date": "2024-01-15",
            "logged_in_user": "alice@lims"
          },
        },
      },
      "https://forms.manne.work",
    );
  }

  // 2. Listen for submit / cancel
  window.addEventListener("message", (event) => {
    if (event.origin !== "https://forms.manne.work") return;

    if (event.data.type === "FORM_FILLED") {
      const { values, schema, uiSchema } = event.data.payload;
      // Persist `values` against the LIMS record keyed by recordId
      console.log("Form submitted:", values);
    }

    if (event.data.type === "FILL_CANCELLED") {
      // Close your modal or hide the iframe
      console.log("User cancelled the fill");
    }
  });
</script>
```

The end-user sees a clean fillable form — no palette, no properties panel, no drag-drop. Required fields are marked with `*`; the Submit button is disabled until all required fields are valid.

## Message Protocol

### Inbound (host → builder)

| Type | Payload | Description |
|------|---------|-------------|
| `LOAD_FORM` | `{ title?, schema: JsonSchema, uiSchema: UiSchema }` | Build mode: populate builder with an existing form |
| `LOAD_GROUP` | `{ schema, uiSchema, groupId, version }` | Build mode: stage a reusable field-set in the palette |
| `LOAD_FILL` | `{ title?, schema, uiSchema, defaults? }` | Fill mode: render a saved form for an end-user to fill |

### Outbound (builder → host)

| Type | Payload | Description |
|------|---------|-------------|
| `FORM_SAVED` | `{ title?, schema, uiSchema }` | Build mode: user clicked Save; emit the final contract |
| `FORM_FILLED` | `{ values, schema, uiSchema }` | Fill mode: user clicked Submit; emit the captured values |
| `FILL_CANCELLED` | (no payload) | Fill mode: user clicked Cancel |
| `ERROR` | `{ code: string, message: string }` | Something went wrong (e.g. malformed LOAD_FORM/LOAD_FILL) |

## Defaults (Fill Mode)

The optional `defaults` map in `LOAD_FILL` pre-fills form fields. Keys are matched in this order:

1. `x-coltorapps-key` in the uiSchema entry (canonical, namespaced)
2. Property name in `schema.properties` (fallback)

Unknown keys are silently ignored. This is useful for:
- Pre-filling the logged-in user's name in a "Submitted by" field
- Pre-filling today's date in a `sampling_date` field
- Carrying over a record ID into a hidden metadata field

## Security

- **Origin validation:** the builder only accepts messages from origins listed in `NEXT_PUBLIC_ALLOWED_ORIGINS` (comma-separated env var).
- **CSP:** `frame-ancestors` restricts which domains can iframe the builder.
- Always verify `event.origin` on both sides.

## Environment Variables

| Variable | Example | Purpose |
|----------|---------|---------|
| `NEXT_PUBLIC_ALLOWED_ORIGINS` | `https://lims.manne.work,http://localhost:5173` | postMessage origin allowlist |

## Development

```bash
# Start the builder
pnpm dev

# Build mode
open http://localhost:3000

# Fill mode
open http://localhost:3000/?mode=fill

# Open the test host to simulate the LIMS
open http://localhost:3000/test-host.html
```

The test host lets you load presets and inspect `FORM_SAVED` messages interactively.

