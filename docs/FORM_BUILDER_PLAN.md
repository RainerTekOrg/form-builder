# Form Builder Microservice — Detailed Plan

**Goal:** a standalone, stateless, no-auth app (`forms.manne.work`) that renders a drag-and-drop form builder and returns a **JSON Schema + UI Schema** payload to the host (LIMS) via iframe `postMessage`, with an export-JSON fallback. Built on `@coltorapps/builder` + `@coltorapps/builder-react`, shadcn/ui, and dnd-kit.

**Out of scope:** storage, versioning, the LIMS renderer, the report editor, PDF. Those are later phases. This service only authors and emits.

---

## 0. Mental model of coltorapps (so the code below makes sense)

coltorapps gives you three core factories and a React layer:

- **`createAttribute`** — a field's prop (label, required, options…). Atomic, reusable. Has a Zod `validate`.
- **`createEntity`** — a field type (textField, selectField…). Composes attributes + its own value `validate`.
- **`createBuilder`** — the set of entities your builder allows.
- **React store:** `useBuilderStore(builder)` holds the working schema. `schema.root` is the ordered array of top-level entity IDs. Store methods: `addEntity`, `setEntityIndex`, `setEntityParent`, `unsetEntityParent`, `setEntityAttribute`, `deleteEntity`.
- **`<BuilderEntities>`** renders the entities by mapping entity name → your React component (made with `createEntityComponent`). `<BuilderEntityAttributes>` + `createAttributeComponent` render the properties panel.
- **Interpreter store** (`useInterpreterStore`, `<InterpreterEntities>`) renders a *fillable* version — you'll use this for the in-builder **preview/playground only**. (The real LIMS runtime renderer is a later phase and lives in the LIMS, not here.)

Key point: coltorapps' schema is its **own native format**. Your job in this project is to wrap it in a UI and write the **serializer** that converts native ⇄ standard JSON Schema + UI Schema. That serializer is the whole reason this service stays swappable.

---

## 1. Project structure

```
forms-builder/
├─ src/
│  ├─ contract/
│  │  ├─ types.ts              # JSON Schema + UI Schema TS types (the output contract)
│  │  └─ field-types.ts        # canonical field-type catalog (enum + metadata)
│  ├─ builder/
│  │  ├─ attributes/           # coltorapps attributes (label, key, required, …)
│  │  │  ├─ label.ts
│  │  │  ├─ key.ts
│  │  │  ├─ required.ts
│  │  │  ├─ options.ts
│  │  │  ├─ validation.ts
│  │  │  └─ index.ts
│  │  ├─ entities/             # coltorapps entities (textField, selectField, …)
│  │  │  ├─ text-field.ts
│  │  │  ├─ number-field.ts
│  │  │  ├─ select-field.ts
│  │  │  ├─ … (one per field type)
│  │  │  └─ index.ts
│  │  └─ form-builder.ts       # createBuilder({ entities })
│  ├─ components/
│  │  ├─ entities/             # shadcn render components per entity (createEntityComponent)
│  │  ├─ attributes/           # shadcn render components per attribute (createAttributeComponent)
│  │  ├─ canvas/
│  │  │  ├─ FormBuilder.tsx    # the dnd canvas (from coltorapps drag-drop guide)
│  │  │  ├─ Palette.tsx        # left sidebar: draggable field-type placeholders
│  │  │  ├─ PropertiesPanel.tsx# right sidebar: selected entity's attributes
│  │  │  └─ DndItem.tsx        # sortable wrapper
│  │  └─ preview/
│  │     └─ Playground.tsx     # interpreter-store fillable preview (throwaway)
│  ├─ serializer/
│  │  ├─ serialize.ts          # coltorapps schema  -> { schema, uiSchema }
│  │  ├─ deserialize.ts        # { schema, uiSchema } -> coltorapps schema
│  │  ├─ key.ts                # frozen-key generation + collision handling
│  │  └─ groups.ts             # group expansion (embed-with-provenance)
│  ├─ bridge/
│  │  ├─ postMessage.ts        # LOAD_FORM in, FORM_SAVED out, origin validation
│  │  └─ export.ts             # download/copy JSON fallback
│  ├─ app/                     # Next.js routes (or Vite entry)
│  │  └─ page.tsx              # mounts FormBuilder + Palette + PropertiesPanel + Playground
│  └─ lib/                     # utils, shadcn setup
├─ tests/
│  └─ roundtrip.test.ts        # deserialize(serialize(x)) === x  (CI gate)
└─ …
```

---

## 2. Step-by-step build order

Each step has a clear exit criterion. Build in this order — later steps depend on earlier ones.

### Step 1 — The output contract (`src/contract/`)

Define the TypeScript types for what leaves the service. This is the fixed target; write it before any builder code.

- `field-types.ts`: the catalog enum — `text, textarea, number, integer, select, multiselect, boolean, date, datetime, file, signature, section, repeating, computed`. Plus per-type metadata (which JSON Schema type it maps to, which UI widget).
- `types.ts`: `JsonSchema` (subset you support: `type`, `properties`, `required`, `enum`, `items`, `minimum`, `maximum`, `minLength`, `maxLength`, `pattern`, `format`) and `UiSchema` (`ui:label`, `ui:widget`, `ui:help`, `ui:placeholder`, `ui:order`, `ui:section`, `ui:hidden`, `ui:condition`, `ui:unit`, `x-coltorapps-key`, `x-group` provenance).

**Exit:** types compile; a hand-written example `{ schema, uiSchema }` for a 3-field form typechecks.

### Step 2 — Attributes (`src/builder/attributes/`)

Reusable props, each with a Zod `validate`.

```ts
// key.ts — the immutable identifier
import { z } from "zod";
import { createAttribute } from "@coltorapps/builder";

export const keyAttribute = createAttribute({
  name: "key",
  validate(value) {
    return z.string().regex(/^[a-z][a-z0-9_]*$/).parse(value);
  },
});
```

```ts
// label.ts
export const labelAttribute = createAttribute({
  name: "label",
  validate(value) { return z.string().min(1).parse(value); },
});
```

Also: `required` (boolean), `helpText` (string opt), `placeholder` (string opt), `options` (array of `{value,label}` for selects), `validation` (object: min/max/pattern/etc.), `unit` (string opt), `condition` (show/hide rule object).

**Exit:** all attributes export and their Zod validators pass/fail correctly in a unit test.

### Step 3 — Entities (`src/builder/entities/`)

One per field type, composing the relevant attributes.

```ts
// text-field.ts
import { z } from "zod";
import { createEntity } from "@coltorapps/builder";
import { labelAttribute, keyAttribute, requiredAttribute,
         placeholderAttribute, helpTextAttribute, validationAttribute } from "../attributes";

export const textFieldEntity = createEntity({
  name: "textField",
  attributes: [labelAttribute, keyAttribute, requiredAttribute,
               placeholderAttribute, helpTextAttribute, validationAttribute],
  validate(value) { return z.string().optional().parse(value); },
});
```

Repeat for: `numberField`, `integerField`, `selectField` (+options), `multiSelectField`, `booleanField`, `dateField`, `datetimeField`, `textareaField`, `fileField` (value = object-key string), `signatureField`, `sectionEntity` (container), `repeatingEntity` (array container), `computedField` (carries a formula attribute; value derived, not input).

`section`, `repeating`, and `group` are **container** entities — they hold child entities via coltorapps' parent/child API (`setEntityParent`).

**Exit:** `createBuilder({ entities: [...] })` compiles with the full set.

### Step 4 — The builder definition (`src/builder/form-builder.ts`)

```ts
import { createBuilder } from "@coltorapps/builder";
import * as e from "./entities";

export const formBuilder = createBuilder({
  entities: [
    e.textFieldEntity, e.numberFieldEntity, e.integerFieldEntity,
    e.selectFieldEntity, e.multiSelectFieldEntity, e.booleanFieldEntity,
    e.dateFieldEntity, e.datetimeFieldEntity, e.textareaFieldEntity,
    e.fileFieldEntity, e.signatureFieldEntity, e.sectionEntity,
    e.repeatingEntity, e.computedFieldEntity,
  ],
});
```

**Exit:** importing `formBuilder` typechecks.

### Step 5 — Frozen-key logic (`src/serializer/key.ts`)

The single most important rule: keys are generated once and never change.

- On entity creation, derive `key` from the label: slugify → snake_case → ensure unique within the form (append `_2`, `_3` on collision).
- After creation, the key is read-only in the UI (show it greyed in the properties panel). Label edits never touch it.
- For grouped fields, namespace: `customer.company_name`.

```ts
export function generateKey(label: string, existingKeys: Set<string>): string {
  let base = label.toLowerCase().trim()
    .replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "") || "field";
  if (!/^[a-z]/.test(base)) base = "f_" + base;
  let key = base, i = 2;
  while (existingKeys.has(key)) key = `${base}_${i++}`;
  return key;
}
```

**Exit:** unit test — same label twice yields `x` and `x_2`; key survives a label rename.

### Step 6 — Entity & attribute render components (`src/components/`)

Use `createEntityComponent` and `createAttributeComponent` to bind coltorapps entities to your shadcn UI.

```tsx
// components/entities/TextFieldEntity.tsx
import { createEntityComponent } from "@coltorapps/builder-react";
import { textFieldEntity } from "@/builder/entities/text-field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const TextFieldEntity = createEntityComponent(textFieldEntity, (props) => (
  <div className="space-y-1.5">
    <Label>{props.entity.attributes.label}{props.entity.attributes.required && " *"}</Label>
    <Input placeholder={props.entity.attributes.placeholder} disabled />
    {props.entity.attributes.helpText && (
      <p className="text-sm text-muted-foreground">{props.entity.attributes.helpText}</p>
    )}
  </div>
));
```

```tsx
// components/attributes/LabelAttribute.tsx
import { createAttributeComponent } from "@coltorapps/builder-react";
import { labelAttribute } from "@/builder/attributes/label";
import { Input } from "@/components/ui/input";

export const LabelAttribute = createAttributeComponent(labelAttribute, (props) => (
  <Input
    value={props.attribute.value ?? ""}
    onChange={(ev) => props.setValue(ev.target.value)}
  />
));
```

One entity component per field type, one attribute component per attribute. In the canvas these render as non-interactive previews; in the playground (Step 9) the interpreter makes them interactive.

**Exit:** each entity renders its shadcn preview; editing an attribute in the panel updates the canvas.

### Step 7 — The canvas (`src/components/canvas/FormBuilder.tsx`)

Straight from the coltorapps drag-drop guide, extended with palette + properties.

- `const builderStore = useBuilderStore(formBuilder)`.
- Read `schema.root` via `useBuilderStoreData(builderStore, (events) => events.some(e => e.name === "RootUpdated"))`.
- `<DndContext onDragEnd>` → on drop, compute new index and call `builderStore.setEntityIndex(activeId, index)`.
- `<BuilderEntities builderStore={builderStore} components={{ textField: TextFieldEntity, ... }}>` wrapping each in `<DndItem>`.
- **Palette** (`Palette.tsx`): draggable placeholders; on drop into canvas call `builderStore.addEntity({ type, attributes: { label, key: generateKey(...) }, index })`.
- **Properties panel** (`PropertiesPanel.tsx`): track selected entity id in local state; render `<BuilderEntityAttributes>` for it.
- **Containers:** for `section`/`repeating`, use `setEntityParent`/`unsetEntityParent` to nest. (The guide notes drag-drop within one level; nesting needs the parent methods.)

**Exit:** drag a text field from palette → it appears on canvas → reorder it → edit its label in the panel → key stays frozen.

### Step 8 — Groups / composition (`src/serializer/groups.ts`)

Embed-with-provenance. A group is a saved field-set the host passes in.

- A `group` palette item, when dropped, **expands** into its constituent entities (copied), each namespaced `groupKey.fieldKey`, and tagged `x-group: { sourceGroupId, sourceGroupVersion }` in the UI Schema.
- The group's source `{ schema, uiSchema }` comes in via `LOAD_GROUP` postMessage (the LIMS owns the group library; this service just expands what it's handed).
- No live link — once expanded, the fields are part of the form. (Update propagation is a LIMS concern in a later phase.)

**Exit:** load a 2-field group, drop it, see two namespaced, provenance-tagged fields on the canvas.

### Step 9 — Playground / preview (`src/components/preview/Playground.tsx`)

Throwaway fillable preview using the interpreter store. **Never persists anywhere.**

- `const interpreter = useInterpreterStore(formBuilder, builderStore.schema)`.
- `<InterpreterEntities interpreterStore={interpreter} components={{...interactive versions...}}>`.
- Show live validation; a "reset" button clears it.

**Exit:** toggle to preview, fill fields, see validation fire; data goes nowhere.

### Step 10 — The serializer (`src/serializer/serialize.ts` + `deserialize.ts`)

The brain. Pure functions, no UI.

- `serialize(coltorappsSchema) → { schema, uiSchema }`:
  - Walk entities in `root` order. For each, map entity type → JSON Schema type (`field-types.ts`), pull validation attributes into JSON Schema constraints, push presentation attributes (label, widget, help, order, unit, condition) into UI Schema keyed by `key`.
  - `required` fields collect into the parent object's `required[]`.
  - `section` → nested object; `repeating` → `{ type: "array", items: {...} }`.
  - Preserve `key` as the property name and stamp `x-coltorapps-key` so deserialize can rebuild.
- `deserialize({ schema, uiSchema }) → coltorappsSchema`: the exact inverse — rebuild entities with their attributes from the JSON Schema constraints + UI Schema hints, restoring frozen keys.

**Exit:** Step 11's round-trip test passes.

### Step 11 — Round-trip CI gate (`tests/roundtrip.test.ts`)

```ts
test.each(fixtures)("round-trips %s", (fixture) => {
  const native = deserialize(serialize(fixture));
  expect(native).toEqual(fixture);          // structural equality
});
```

Fixtures: a simple 3-field form, one with a section, one with a repeating group, one with a customer-details group, the full USP 797 EM form. Make this block CI.

**Exit:** all fixtures green; PRs can't merge if serialization drifts.

### Step 12 — The bridge (`src/bridge/postMessage.ts` + `export.ts`)

The plug-and-play handshake. **Origin validation is mandatory** (no auth means origin is your only guard).

```ts
const ALLOWED_ORIGINS = (import.meta.env.VITE_ALLOWED_ORIGINS ?? "").split(",");

// Inbound: host sends an existing form to edit, or a group to expand
window.addEventListener("message", (e) => {
  if (!ALLOWED_ORIGINS.includes(e.origin)) return;     // hard gate
  switch (e.data?.type) {
    case "LOAD_FORM":  loadForm(deserialize(e.data.payload)); break;
    case "LOAD_GROUP": stageGroup(e.data.payload); break;
  }
});

// Outbound: on save/publish
export function emitSaved(targetOrigin: string, builderSchema) {
  if (!ALLOWED_ORIGINS.includes(targetOrigin)) throw new Error("bad origin");
  const payload = serialize(builderSchema);            // { schema, uiSchema }
  window.parent.postMessage({ type: "FORM_SAVED", payload }, targetOrigin);
}
```

- Configure `ALLOWED_ORIGINS` per environment (LIMS staging + prod origins).
- `export.ts`: a "Download JSON" / "Copy JSON" button emitting the same `{ schema, uiSchema }` — the standalone fallback so the service works without a host.

**Exit:** open the builder inside a test parent page, click save, parent receives `FORM_SAVED` with valid `{schema,uiSchema}`; a foreign origin is ignored.

### Step 13 — App shell & deploy

- `app/page.tsx`: three-pane layout — Palette | FormBuilder canvas | PropertiesPanel, with a Preview tab and Save/Export buttons in a header.
- Read theme tokens so it visually matches your LIMS shadcn setup.
- Deploy on Coolify at `forms.manne.work` (sibling to `editor.manne.work`), wildcard SSL per your existing pattern.
- Set frame-ancestors CSP to your LIMS origins so it can only be iframed by you.

**Exit:** `forms.manne.work` loads, builds a form, and posts it back to a LIMS page embedding it.

---

## 3. The contract emitted (reference example)

A two-field form (one in a customer group) serializes to roughly:

```jsonc
// schema (data contract)
{
  "type": "object",
  "properties": {
    "customer.company_name": { "type": "string", "minLength": 1 },
    "cfu_count":             { "type": "integer", "minimum": 0 }
  },
  "required": ["customer.company_name", "cfu_count"]
}
// uiSchema (presentation)
{
  "customer.company_name": {
    "ui:label": "Company Name", "ui:widget": "text",
    "ui:order": 1, "x-group": { "sourceGroupId": "grp_customer", "sourceGroupVersion": 3 }
  },
  "cfu_count": {
    "ui:label": "CFU Count (per plate)", "ui:widget": "number",
    "ui:order": 2, "ui:unit": "CFU", "ui:help": "Raw count before dilution"
  }
}
```

This is the only thing the LIMS stores. Everything downstream (renderer, report bindings, PDF) consumes exactly this.

---

## 4. Definition of done

1. `forms.manne.work` runs standalone and embedded.
2. Full field-type catalog draggable, configurable, reorderable.
3. Frozen keys, with namespaced group expansion + provenance.
4. Live playground preview that never persists.
5. Serializer + deserializer with a green round-trip CI gate.
6. `postMessage` save (origin-validated) + JSON export fallback.
7. Emits valid standard JSON Schema + UI Schema — verified against fixtures.

---

## 5. Pitfalls to avoid

- **Don't let coltorapps' native schema leak past the serializer.** Nothing outside `src/builder` and `src/serializer` should import coltorapps types. Renderer/host see only `{schema,uiSchema}`.
- **Don't skip the round-trip test.** It's what catches serializer drift before it corrupts stored forms.
- **Don't allow key edits.** The instant a user can rename a key, every binding and every stored record is at risk.
- **Don't use `postMessage(..., "*")`.** Always a specific allowed origin.
- **Don't add storage or auth here.** The service stays stateless; the LIMS owns persistence and versioning. Keeping it dumb is what makes it reusable.
- coltorapps is pre-1.0 (v0.2.4) — pin the exact version; verify any hook names above against the live docs before relying on them.
