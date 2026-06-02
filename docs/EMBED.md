# Embedding the Form Builder

> How the LIMS host page embeds and communicates with `forms.manne.work`.

## Quick Start

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
      const { schema, uiSchema } = event.data.payload;
      console.log("Form saved:", schema, uiSchema);
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

## Message Protocol

### Inbound (host → builder)

| Type | Payload | Description |
|------|---------|-------------|
| `LOAD_FORM` | `{ schema: JsonSchema, uiSchema: UiSchema }` | Populate builder with an existing form |
| `LOAD_GROUP` | `{ schema, uiSchema, groupId, version }` | Stage a reusable field-set in the palette |

### Outbound (builder → host)

| Type | Payload | Description |
|------|---------|-------------|
| `FORM_SAVED` | `{ schema: JsonSchema, uiSchema: UiSchema }` | User clicked Save; emit the final contract |
| `ERROR` | `{ code: string, message: string }` | Something went wrong |

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

# Open the test host to simulate the LIMS
open http://localhost:3000/test-host.html
```

The test host lets you load presets and inspect `FORM_SAVED` messages interactively.
