# Form Payload Contract

> The `{ schema, uiSchema, title? }` payload that leaves this service via `FORM_SAVED` (build mode) or `FORM_FILLED` (fill mode) postMessage, or `Export JSON` download. This is the **only** contract the LIMS host sees. The coltorapps native schema never crosses the bridge.

## Shape

```ts
interface FormPayload {
  title?: string;        // optional human-readable form name (PR 8.7)
  schema: JsonSchema;    // standard JSON Schema (subset, see below)
  uiSchema: UiSchema;    // presentation hints keyed by property name
}

interface GroupPayload extends FormPayload {
  groupId: string;       // stable identifier of the group in the host
  version: number;       // host's version; lets us evolve groups safely
}
```

## `schema` (JSON Schema subset)

```ts
interface JsonSchema {
  type: "object";
  properties?: Record<string, JsonSchemaProperty>;
  required?: string[];
  $schema?: string;      // optional, host can stamp
}

interface JsonSchemaProperty {
  type: "string" | "number" | "integer" | "boolean" | "object" | "array";
  properties?: Record<string, JsonSchemaProperty>;
  required?: string[];
  items?: JsonSchemaProperty;
  enum?: string[];
  minimum?: number;
  maximum?: number;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  format?: string;        // "date" | "datetime" | "email" | "uri" | ...
  readOnly?: boolean;     // true for `computed` fields
}
```

## `uiSchema` (presentation hints)

```ts
interface UiSchemaEntry {
  "ui:label"?: string;
  "ui:widget"?: string;     // "text" | "textarea" | "number" | "select" | ...
  "ui:help"?: string;
  "ui:placeholder"?: string;
  "ui:order"?: number;      // presenter's render order
  "ui:section"?: string;
  "ui:hidden"?: boolean;
  "ui:condition"?: { field: string; operator: "eq"|"neq"|"gt"|"gte"|"lt"|"lte"|"in"|"nin"|"empty"|"notEmpty"; value: unknown };
  "ui:unit"?: string;
  "ui:options"?: { value: string; label: string }[];
  "x-coltorapps-key"?: string;  // canonical identifier, see below
  "x-group"?: { sourceGroupId: string; sourceGroupVersion: number };
}
```

## The `x-coltorapps-key` rule

Keys are **frozen** — generated once when a field is added, never mutated.

- The property name in `schema.properties` is the **slugified label** (e.g. `full_name`).
- The `x-coltorapps-key` carries the **full canonical key** including any namespacing (e.g. `customer.full_name`).
- On collision (two properties slugify to the same name), the later one is auto-suffixed (`full_name`, `full_name_2`).
- Both the property name AND `x-coltorapps-key` are updated together when a collision is resolved, so they remain consistent for round-tripping.

**Always read `x-coltorapps-key` as the canonical identifier** when binding to host data (e.g. mapping form responses to LIMS records). The property name is human-readable and may collide; `x-coltorapps-key` is guaranteed unique within a form.

For grouped fields, the dotted form is preserved:
- `customer` (group root) → `customer.company_name` (nested field)
- The property name on the nested field's `properties` map is just the leaf (`company_name`)
- The `x-coltorapps-key` is the full dotted form (`customer.company_name`)

## Field type catalog

| Field type  | `widget`     | `jsonType`  | Container? | Computed? |
|-------------|--------------|-------------|------------|-----------|
| `text`      | `text`       | `string`    | no         | no        |
| `textarea`  | `textarea`   | `string`    | no         | no        |
| `number`    | `number`     | `number`    | no         | no        |
| `integer`   | `number`     | `integer`   | no         | no        |
| `select`    | `select`     | `string`    | no         | no        |
| `multiselect` | `multiselect` | `array`   | no         | no        |
| `boolean`   | `checkbox`   | `boolean`   | no         | no        |
| `date`      | `date`       | `string`    | no         | no        |
| `datetime`  | `datetime`   | `string`    | no         | no        |
| `file`      | `file`       | `string`    | no         | no        |
| `signature` | `signature`  | `string`    | no         | no        |
| `section`   | `section`    | `object`    | **yes**    | no        |
| `repeating` | `repeating`  | `array`     | **yes**    | no        |
| `computed`  | `computed`   | `string`    | no         | **yes**   |

## Validation

Constraints are pulled into the JSON Schema property:
- `min` → `minimum`
- `max` → `maximum`
- `minLength` → `minLength`
- `maxLength` → `maxLength`
- `pattern` → `pattern`
- `format` → `format`

`required: true` field's key lands in the parent object's `required: string[]`.

## Message protocol

```ts
type InboundMessage =
  | { type: "LOAD_FORM"; payload: FormPayload }
  | { type: "LOAD_GROUP"; payload: GroupPayload }
  | { type: "LOAD_FILL"; payload: FillPayload };

type OutboundMessage =
  | { type: "FORM_SAVED"; payload: FormPayload }
  | { type: "FORM_FILLED"; payload: FilledPayload }
  | { type: "FILL_CANCELLED" }
  | { type: "ERROR"; code: string; message: string };

interface FillPayload {
  title?: string;
  schema: JsonSchema;
  uiSchema: UiSchema;
  defaults?: Record<string, unknown>;   // pre-fill by x-coltorapps-key, fallback to property name
}

interface FilledPayload {
  values: Record<string, unknown>;       // keyed by property name
  schema: JsonSchema;
  uiSchema: UiSchema;
}
```

`FORM_SAVED` is sent to the **parent origin** captured from the first inbound message. The origin is verified against `NEXT_PUBLIC_ALLOWED_ORIGINS` (comma-separated env var) before any message is processed.

`FORM_FILLED` and `FILL_CANCELLED` are sent to the same captured origin. They are emitted only from fill mode (`?mode=fill`).

`ERROR` codes:
- `INVALID_FORM` — `LOAD_FORM` or `LOAD_FILL` payload failed to deserialize.
- `INVALID_GROUP` — `LOAD_GROUP` payload failed to expand.
- Foreign origin errors are not emitted; the message is silently dropped and a toast is shown to the user.

## Fill Mode

A second mode of the form builder, activated by appending `?mode=fill` to the URL. In fill mode:

- The palette, properties panel, and drag-drop are all hidden.
- The form renders as a fillable playground using the same `useInterpreterStore` infrastructure as the build-mode Preview tab.
- Required fields are derived from `schema.required[]`; the Submit button is disabled until all required fields are valid.
- Pre-filled values can be supplied via the `defaults` map in the `LOAD_FILL` payload.
- On Submit, the builder posts `FORM_FILLED` with the captured values, the schema, and the uiSchema.
- On Cancel, the builder posts `FILL_CANCELLED`.

## Round-trip guarantee

`deserialize(serialize(x))` is byte-identical to `x` for property keys, required arrays, UI Schema keys, and `x-coltorapps-key` values. The `title` field is app-level state, not part of the schema, and is therefore not round-tripped through the serializer — it is preserved by the app layer that composes the final payload.
