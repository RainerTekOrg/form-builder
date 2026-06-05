# Form Builder Microservice — Feature & Capability Specification

**What this is:** the definitive spec of what the form builder service must do, how each capability behaves, and what it must produce. Use it as the checklist to audit the built project and to drive remaining implementation.

**One-line definition:** A standalone, stateless, no-auth web app that lets a non-technical user visually assemble a form, and emits a portable **JSON Schema + UI Schema** describing that form. It stores nothing and authenticates no one — the host application (LIMS) owns persistence, versioning, and auth.

---

## 1. Product principles (the non-negotiables)

| # | Principle | Why it matters |
|---|---|---|
| P1 | **Stateless** — no database, no persistence of its own | Keeps it reusable across LIMS, QMS, CCV, any project |
| P2 | **No auth** — relies on the host; guarded only by origin checks | Simplicity; the host already authenticates the user |
| P3 | **JSON in, JSON out** — consumes and emits standard JSON Schema + UI Schema | The portable contract; makes the builder swappable |
| P4 | **coltorapps native never leaks** — only the serializer sees it | Lets you replace coltorapps later without touching stored data |
| P5 | **Frozen keys** — a field's `key` is generated once, never editable | Report bindings and stored record data depend on stable keys |
| P6 | **Embeddable** — runs inside the host via iframe + postMessage, also standalone | Plug-and-play integration |

---

## 2. Capabilities (what the user can do)

### 2.1 Field types (the catalog)

The builder must offer all of these as draggable field types:

| Field type | User sees | JSON Schema output | Notes |
|---|---|---|---|
| Text | single-line input | `string` | min/max length, regex pattern |
| Textarea | multi-line input | `string` | + `ui:widget: textarea` |
| Number | numeric input | `number` | min, max, step, unit |
| Integer | whole-number input | `integer` | min, max |
| Select | dropdown (single) | `string` + `enum` | options = {value, label} |
| Multi-select | multi-choice | `array` + `items.enum` | min/max selections |
| Boolean | checkbox/switch | `boolean` | |
| Date | date picker | `string` + `format: date` | min/max date |
| Datetime | date + time picker | `string` + `format: date-time` | |
| File | file upload | `string` (object key) | stores a reference, not the blob |
| Signature | e-signature capture | `string` (object key) | captures who/when/meaning metadata |
| Section | grouping container | nested `object` | holds child fields; layout only |
| Repeating group | add/remove rows | `array` + `items.object` | **critical** — e.g. multiple plate readings |
| Computed | read-only derived value | derived | value from a formula; not user input |

### 2.2 Per-field configuration (attributes)

For each field the user can set, via a properties panel:

- **Label** (editable freely)
- **Key** (auto-generated, shown read-only)
- **Required** (yes/no)
- **Help text / description**
- **Placeholder**
- **Default value**
- **Validation:** min/max, min/max length, regex pattern, allowed values
- **Unit** (for numbers — e.g. CFU, mL, °C)
- **Options** (for select/multi-select — value + label pairs, reorderable)
- **Conditional visibility:** show/hide this field based on another field's value (e.g. show `media_lot` only when `media_type = TSA`)

### 2.3 Form-level capabilities

- **Drag to add** a field from the palette onto the canvas.
- **Drag to reorder** fields.
- **Nest** fields into sections and repeating groups.
- **Select a field** to edit its attributes in the properties panel.
- **Delete a field** (with confirmation).
- **Sections** for visual grouping and multi-step layout.
- **Live preview / playground** — switch to a fillable view to test the form with throwaway data (never persisted), with validation firing as it would for a real user.

### 2.4 Groups (reusable field-sets / composition)

- A **group** is a pre-built field-set (e.g. "Customer/Company Details") the host passes into the builder.
- Dropping a group onto the canvas **expands** it into its constituent fields (embed-with-provenance):
  - Each field's key is namespaced: `customer.company_name`.
  - Each carries provenance: `x-group: { sourceGroupId, sourceGroupVersion }`.
  - No live link — once expanded, fields are part of the form. (Propagating group updates is a host concern, not the builder's.)
- The builder does not store groups; it expands whatever the host hands it via `LOAD_GROUP`.

### 2.5 Frozen-key behavior (explicit)

- On field creation, the key is derived from the label (slugified, snake_case) and made unique within the form (`company_name`, `company_name_2`).
- After creation the key is **immutable** — surfaced read-only in the properties panel so report authors know what to bind to.
- Renaming a label changes only the label; the key never moves.
- Group fields are namespaced with the group key as prefix.

---

## 3. Inputs & outputs (the contract)

### 3.1 What the builder receives (from the host)

Via origin-validated `postMessage`:

| Message | Payload | Effect |
|---|---|---|
| `LOAD_FORM` | `{ schema, uiSchema }` | Loads an existing form for editing (deserializes to native) |
| `LOAD_GROUP` | `{ groupId, version, schema, uiSchema }` | Stages a group available to drop |
| `SET_CONFIG` | `{ allowedFieldTypes?, theme? }` | Optional: restrict field types, set theme |

### 3.2 What the builder emits (to the host)

| Message | Payload | When |
|---|---|---|
| `FORM_SAVED` | `{ schema, uiSchema }` | User clicks Save/Publish |
| `BUILDER_READY` | `{}` | On mount (host knows it can send `LOAD_FORM`) |
| `DIRTY_STATE` | `{ isDirty: boolean }` | On edit (host can warn on unsaved exit) |

Plus an **export fallback** (Download JSON / Copy JSON) emitting the same `{ schema, uiSchema }` for standalone use.

### 3.3 Output shape (the only thing that leaves)

- **`schema`** — standard JSON Schema: data shape + validation only (`type`, `properties`, `required`, `enum`, `items`, numeric/length/pattern constraints, `format`).
- **`uiSchema`** — presentation only: `ui:label`, `ui:widget`, `ui:help`, `ui:placeholder`, `ui:order`, `ui:section`, `ui:hidden`, `ui:condition`, `ui:unit`, plus `x-coltorapps-key` (round-trip) and `x-group` (provenance).
- Keys are the JSON Schema property names and are stable forever.

---

## 4. Non-functional requirements

- **Performance:** authoring is interactive (<16ms drag feedback); the service is a client-side SPA, no server round-trips for editing.
- **Security:** every inbound/outbound `postMessage` validates `event.origin` against an allowlist; never `"*"`. CSP `frame-ancestors` restricts who can embed it.
- **Theming:** matches the host's shadcn/Tailwind tokens so the embed feels native.
- **Accessibility:** keyboard-navigable canvas and panels, labelled inputs (enterprise buyers expect WCAG AA).
- **Portability:** zero host-specific logic; integrates into any project via the same handshake.
- **Versioning of the lib:** coltorapps pinned (pre-1.0); the serializer isolates that risk.

---

## 5. Explicit non-goals (what the builder must NOT do)

- ❌ Store forms or records (host's job)
- ❌ Authenticate users (host's job)
- ❌ Version forms (host stamps versions on save)
- ❌ Render the production data-entry form (that's the host's runtime renderer — a separate library)
- ❌ Generate PDFs or hold report templates (the editor + PDF service do that)
- ❌ Manage the group library (host owns it; builder only expands what it's given)
- ❌ Expose CRUD APIs (it's stateless; postMessage + export is the entire interface)

> If the audit finds any of these implemented inside the builder, that's scope creep to pull back out — not a missing feature.

---

## 6. Audit checklist (use this against the built codebase)

Mark each ✅ present / ⚠️ partial / ❌ missing:

**Field types**
- [ ] All 14 field types in §2.1 available and draggable
- [ ] Repeating group supports add/remove/reorder rows
- [ ] Section nesting works
- [ ] Computed field with a formula mechanism

**Configuration**
- [ ] Properties panel edits all attributes in §2.2
- [ ] Conditional visibility rules
- [ ] Options editor for select/multi-select (reorderable)

**Keys**
- [ ] Auto-generated on creation, unique within form
- [ ] Read-only after creation (no rename path anywhere)
- [ ] Group namespacing (`group.field`)

**Canvas / UX**
- [ ] Drag from palette to add
- [ ] Drag to reorder
- [ ] Select-to-edit
- [ ] Delete with confirm
- [ ] Live playground preview (throwaway, never persists)
- [ ] Dirty-state tracking

**Groups**
- [ ] `LOAD_GROUP` handling
- [ ] Expansion with namespacing + `x-group` provenance

**Contract / serializer**
- [ ] `serialize(native) → { schema, uiSchema }`
- [ ] `deserialize({ schema, uiSchema }) → native`
- [ ] Round-trip test as a CI gate
- [ ] Output is standard JSON Schema (validates with AJV)

**Bridge**
- [ ] `BUILDER_READY` on mount
- [ ] `LOAD_FORM` inbound (origin-validated)
- [ ] `FORM_SAVED` outbound (origin-validated)
- [ ] Origin allowlist enforced (no `"*"`)
- [ ] Export/Copy JSON fallback

**Non-functional**
- [ ] Theme matches host
- [ ] Keyboard accessible
- [ ] CSP `frame-ancestors` set
- [ ] coltorapps version pinned

**Scope hygiene**
- [ ] No storage, no auth, no CRUD APIs, no versioning inside the builder

---

## 7. Likely gaps to expect in a first build

Based on the typical state of a freshly scaffolded builder, the parts most often missing or stubbed:

1. **The serializer / deserializer** — the hardest and most-skipped piece; without it there's no usable output.
2. **The round-trip test** — rarely written first, but it's the correctness guarantee.
3. **The postMessage bridge** — easy to forget when developing standalone; this is the "no APIs" observation likely pointing here.
4. **Frozen-key enforcement** — often a label is captured but the key isn't generated/locked.
5. **Groups expansion + provenance** — the composition feature is non-trivial and usually deferred.
6. **Conditional visibility & computed fields** — commonly stubbed.
7. **Repeating groups** — often the last field type implemented.

The "no APIs" you noticed is expected and correct — this service has none by design. What replaces APIs is the **postMessage bridge + serializer** (§3, §6). If those are present and the round-trip test passes, the builder is functionally complete even with zero HTTP endpoints.
