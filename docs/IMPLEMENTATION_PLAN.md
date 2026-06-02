# Form Builder — Implementation Plan

> Companion to `docs/FORM_BUILDER_PLAN.md`. Breaks the 13-step plan into **phases**, **milestones**, and **todos** for progress tracking.

---

## Guiding Principles

1. **Contract first.** The output (`{ schema, uiSchema }`) is fixed before any builder code.
2. **Pure functions at the core.** The serializer is a pure module — testable, swappable, no React.
3. **coltorapps never leaks.** Only `src/builder/` and `src/serializer/` import coltorapps types.
4. **Round-trip is the contract.** `deserialize(serialize(x)) === x` is the CI gate.
5. **Stateless service.** No DB, no auth, no versioning.
6. **Frozen keys.** Generated once, never mutated. Ever.

---

## Phase Overview

| Phase | Steps | Milestone | Output |
|-------|-------|-----------|--------|
| **P0. Scaffold** | prep | Bootable app | `forms.manne.work` stub running |
| **P1. Contract** | 1 | Type-safe output shape | `src/contract/*` compiles |
| **P2. Schema engine** | 2, 3, 4 | Builder can hold fields | `formBuilder` instantiates |
| **P3. Frozen keys** | 5 | Keys generated & locked | Unit test green |
| **P4. UI bindings** | 6 | Fields render & edit | Canvas shows fields live |
| **P5. Canvas** | 7 | Drag-drop works | Full UX in builder |
| **P6. Groups** | 8 | Groups expand | Namespaced fields with provenance |
| **P7. Preview** | 9 | Fillable playground | Validate before save |
| **P8. Serializer** | 10 | Native ⇄ JSON Schema | Pure functions ready |
| **P9. CI gate** | 11 | Round-trip green | PRs blocked on drift |
| **P10. Bridge** | 12 | Iframe handshake | `postMessage` save/export |
| **P11. Shell & ship** | 13 | Production deploy | Live at `forms.manne.work` |

---

## Phase 0 — Scaffold

> **Goal:** A running Next.js app with shadcn + coltorapps deps, ready to build on.

### Todos

- [x] Verify Next.js 16 boots (`pnpm dev`)
- [x] Replace starter `app/page.tsx` with a 3-pane placeholder layout (Palette / Canvas / Properties)
- [x] Add shadcn components: `Input`, `Label`, `Textarea`, `Select`, `Checkbox`, `Tabs`, `Separator`, `Card`, `Tooltip`, `DropdownMenu`, `Dialog`, `ScrollArea`, `Badge`, `Switch`
- [ ] Add `@hookform/resolvers` + `react-hook-form` (used inside attribute components)
- [ ] Configure `next.config.ts` with CSP `frame-ancestors` placeholder (real values added in P11)
- [x] Set up `tests/` directory with vitest config

### Exit criterion

> App runs at `localhost:3000`. 3-pane placeholder visible. Vitest runs `pnpm test`.

---

## Phase 1 — Output Contract (Step 1)

> **Goal:** Define the fixed shape that leaves this service. Lock it before any builder code.

### Todos

- [x] Create `src/contract/field-types.ts`
  - [x] `FieldType` const array: `text`, `textarea`, `number`, `integer`, `select`, `multiselect`, `boolean`, `date`, `datetime`, `file`, `signature`, `section`, `repeating`, `computed`
  - [x] Per-type metadata table: `{ jsonType, widget, defaultAttrs, isContainer, isComputed }`
- [x] Create `src/contract/types.ts`
  - [x] `JsonSchema` subset: `type`, `properties`, `required[]`, `enum`, `items`, `minimum`/`maximum`, `minLength`/`maxLength`, `pattern`, `format`, `readOnly`
  - [x] `UiSchema` keys: `ui:label`, `ui:widget`, `ui:help`, `ui:placeholder`, `ui:order`, `ui:section`, `ui:hidden`, `ui:condition`, `ui:unit`, `ui:options`, plus custom `x-coltorapps-key`, `x-group`
  - [x] `FormPayload = { schema: JsonSchema; uiSchema: UiSchema }`
  - [x] `GroupPayload = FormPayload & { groupId, version }`
  - [x] `InboundMessage` / `OutboundMessage` discriminated unions
- [x] Write `src/contract/example.ts` — a 3-field sample (text, integer, select)
- [x] Add test: example compiles, `JSON.stringify` round-trips losslessly, message types discriminate

### Exit criterion

> `pnpm typecheck` clean. Example test passes.

---

## Phase 2 — Schema Engine (Steps 2, 3, 4)

> **Goal:** coltorapps can model every field type the catalog supports.

### Todos

**Attributes (`src/builder/attributes/`):**
- [x] `key.ts` — `/^[a-z][a-z0-9_]*$/`
- [x] `label.ts` — `z.string().min(1)`
- [x] `required.ts` — `z.boolean().optional()`
- [x] `placeholder.ts` — `z.string().optional()`
- [x] `helpText.ts` — `z.string().optional()`
- [x] `options.ts` — `z.array(z.object({ value, label }))`
- [x] `validation.ts` — rules: `min | max | pattern | minLength | maxLength | format`
- [x] `unit.ts` — `z.string().optional()`
- [x] `condition.ts` — show/hide rule object
- [x] `formula.ts` — for `computedField`
- [x] `index.ts` barrel

**Entities (`src/builder/entities/`):**
- [x] `text-field.ts`, `textarea-field.ts`
- [x] `number-field.ts`, `integer-field.ts`
- [x] `select-field.ts`, `multiselect-field.ts`
- [x] `boolean-field.ts`
- [x] `date-field.ts`, `datetime-field.ts`
- [x] `file-field.ts`, `signature-field.ts`
- [x] `section-entity.ts` (container with `childrenAllowed: true`)
- [x] `repeating-entity.ts` (array container with `childrenAllowed: true`)
- [x] `computed-field-entity.ts` (with `shouldBeProcessed: false`)
- [x] `index.ts` barrel

**Builder:**
- [x] `src/builder/form-builder.ts` — `createBuilder({ entities: [14 entities] })`

**Tests:**
- [x] Each attribute Zod pass/fail (10 attributes, 30+ cases)
- [x] Builder compiles; store CRUD operations (add, delete, setAttribute, parent/child)

### Exit criterion

> `pnpm test` green for all attribute validators. Builder instantiates without runtime errors.

---

## Phase 3 — Frozen Keys (Step 5)

> **Goal:** Keys generated once, collision-safe, namespaced, immutable.

### Todos

- [x] `src/serializer/key.ts`
  - [x] `generateKey(label, existingKeys)` — slugify → snake_case → `f_` prefix if starts non-alpha → collision loop `x, x_2, x_3, ...`
  - [x] `namespaceKey(parentKey, childKey)` → `parentKey.childKey`
  - [x] `flattenKeys(schema): Set<string>` for collision checks
  - [x] `KEY_REGEX` exported, shared with attribute validator
- [x] Tests:
  - [x] Collision: `"Full Name"` twice yields `full_name`, `full_name_2`
  - [x] Rename resilience: key generated, then label changed, key unchanged
  - [x] Namespace: parent `customer`, child `name` → `customer.name`
  - [x] Invalid label `"123 abc"` → `f_123_abc`
  - [x] Empty label → `field`
  - [x] Flatten keys traverses children recursively

### Exit criterion

> All key tests pass.

---

## Phase 4 — UI Bindings (Step 6)

> **Goal:** Each entity & attribute has a shadcn component. Canvas shows the field; panel edits its attributes.

### Todos

**Entity render components (consolidated in `src/components/entities/entity-components.tsx`):**
- [x] 14 entity components: textField, textareaField, numberField, integerField, selectField, multiSelectField, booleanField, dateField, datetimeField, fileField, signatureField, section (container), repeating (container), computedField
- [x] Each renders disabled shadcn preview with label, placeholder, help text, required indicator

**Attribute render components (`src/components/attributes/`):**
- [x] `KeyAttribute.tsx` — greyed, read-only, copy button
- [x] `LabelAttribute.tsx`, `PlaceholderAttribute.tsx`, `HelpTextAttribute.tsx`
- [x] `RequiredAttribute.tsx` (Switch)
- [x] `OptionsAttribute.tsx` — list editor with add/remove/reorder
- [x] `ValidationAttribute.tsx` — conditional min/max/pattern/format fields with add/remove
- [x] `UnitAttribute.tsx`, `ConditionAttribute.tsx` (toggle + field picker)
- [x] `FormulaAttribute.tsx` (computed only) with formula syntax hint
- [x] `entity-attributes.tsx` — per-entity composition mapping with dividers
- [x] `index.ts` barrel

**Shared:**
- [x] `src/components/ui/required-indicator.tsx` — `*` next to label
- [x] `src/components/ui/field-card.tsx` — wraps each entity on canvas with hover/delete actions, drag handle

**Tests:**
- [ ] Render: each entity component renders without error given sample props (pending testing-library setup)

### Exit criterion

> Static render of a hand-built schema shows all field types. Attribute edits propagate to canvas.

---

## Phase 5 — Canvas (Step 7)

> **Goal:** Real drag-drop UX. Drop from palette → appears on canvas → reorder → edit → key stays frozen.

### Todos

**Store wiring:**
- [x] `src/components/canvas/useBuilderSetup.ts` — `useBuilderStore(formBuilder)`, selection state, addEntity/deleteEntity/moveEntity
- [x] Track `selectedEntityId` in local state

**Palette (`src/components/canvas/Palette.tsx`):**
- [x] Grouped field types (Inputs, Choice, Date/Time, Media, Layout, Special)
- [x] Draggable items via `useDraggable` (dnd-kit, id prefixed "palette-{type}")
- [x] Search/filter with text input
- [x] "Group" section for staged groups (from P6)

**Canvas (`src/components/canvas/FormBuilder.tsx`):**
- [x] `DndContext` + `SortableContext` with `verticalListSortingStrategy`
- [x] `useDroppable` empty-state placeholder ("Drag a field from the left to begin")
- [x] `<BuilderEntities>` wrapping entities in `<DndItem>` via render prop
- [x] `onDragEnd` → `addEntity` (from palette) or `setEntityIndex` (reorder)
- [x] Click entity → set `selectedEntityId`
- [x] `DragOverlay` for palette items showing "Add {type} field"
- [x] PointerSensor with 5px activation distance

**Properties panel (`src/components/canvas/PropertiesPanel.tsx`):**
- [x] Nothing selected: empty state ("Select a field to edit its properties")
- [x] Selected: `<BuilderEntityAttributes>` for selected entity
- [x] Header: type badge + delete button with confirmation dialog
- [x] Delete confirmation warns if entity has children
- [ ] Keyboard shortcuts (Cmd+Z, Arrow Up/Down, Del)

**DndItem wrapper (`src/components/canvas/DndItem.tsx`):**
- [x] `useSortable` integration with `FieldCard`
- [x] Drag handle, selected ring, hover state, delete action via `FieldCard`

### Exit criterion

> Manual: drag Text Field from palette, drop, reorder, edit label in panel — works end to end. Key frozen.

---

## Phase 6 — Groups / Composition (Step 8)

> **Goal:** A group palette item expands into its constituent fields, namespaced, with provenance.

### Todos

- [x] `src/serializer/groups.ts`
  - [x] `expandGroup(group, parentKey?): Entity[]` — maps JSON Schema → entity types + attributes
  - [x] Namespacing: each field's `key` becomes `parentKey.fieldKey`
  - [x] Enum values mapped to options array
  - [x] `mapJsonTypeToEntityType` helper with widget-based heuristic
- [x] `src/bridge/postMessage.ts` — `createBridge()` with `LOAD_FORM`/`LOAD_GROUP` handlers, origin validation, `emitSaved`/`emitError`
- [x] `src/bridge/export.ts` — `downloadJson()` and `copyJson()` helpers
- [x] Palette: `stagedGroups` prop renders a "Groups" section
- [x] `app/page.tsx`: staged group state integrated with expandGroup flow
- [x] Tests:
  - [x] 2-field flat group → 2 entities (textField, integerField)
  - [x] Namespacing with parentKey → `customer.company_name`
  - [x] JSON Schema type → entity type mapping (4 variants)
  - [x] Enum values → options conversion
  - [x] Empty group → empty array
  - [x] Bridge attaches/cleans up message listener

### Exit criterion

> Manual: load a group via postMessage, drop on canvas, see namespaced + tagged fields.

---

## Phase 7 — Playground / Preview (Step 9)

> **Goal:** Throwaway fillable preview. Never persists.

### Todos

- [ ] `src/components/preview/Playground.tsx`
  - [ ] Tabs: Build | Preview
  - [ ] `useInterpreterStore(formBuilder, builderStore.schema)`
  - [ ] `<InterpreterEntities>` with interactive component map
  - [ ] Reset button that clears all values
  - [ ] Banner: "Preview only — data is not saved"
- [ ] Make entity components responsive to interpreter mode OR provide a separate interactive component map
- [ ] Tests:
  - [ ] Interpreter store mounts without error
  - [ ] Reset clears state

### Exit criterion

> Manual: switch to Preview, fill required field empty → see validation. Fill it → error clears. Reset works.

---

## Phase 8 — Serializer (Step 10)

> **Goal:** Pure functions. The brain of the swap-ability. No React, no DOM.

### Todos

**`src/serializer/serialize.ts`:**
- [ ] Walk entities in `root` order
- [ ] Map entity type → JSON Schema type (from `field-types.ts`)
- [ ] Pull validation attrs → `min`/`max`/`pattern`/`format`/`enum`/...
- [ ] Collect `required` into parent's `required[]`
- [ ] `section` → nested object
- [ ] `repeating` → `{ type: "array", items: { ... } }`
- [ ] `computed` → emit `readOnly: true` + `x-formula`
- [ ] Stamp `x-coltorapps-key` per property
- [ ] Build `uiSchema` keyed by `key` with `ui:*` hints + `ui:order`
- [ ] Group provenance (`x-group`) preserved

**`src/serializer/deserialize.ts`:**
- [ ] Inverse of serialize
- [ ] Restore entity order from `ui:order`
- [ ] Rebuild container hierarchy (section/repeating) by walking nested objects
- [ ] Restore frozen keys verbatim (never regenerate from label)

**`src/serializer/serialize.ts` helpers:**
- [ ] `entityTypeToJsonSchema(entity)` — mapping table
- [ ] `buildUiSchemaFor(entity)` — presentation extraction
- [ ] `sortByOrder<T>(items, order)`

**Tests:**
- [ ] Simple 3-field form round-trips
- [ ] Nested section round-trips
- [ ] Repeating block round-trips
- [ ] Grouped fields round-trip (provenance preserved)

### Exit criterion

> All 4 fixture tests pass (P9 will lock these in CI).

---

## Phase 9 — Round-Trip CI Gate (Step 11)

> **Goal:** Serialization drift is caught before merge. Hard CI gate.

### Todos

- [ ] `tests/fixtures/`
  - [ ] `simple-form.ts` — 3 fields (text, number, select)
  - [ ] `sectioned-form.ts` — section with 2 children
  - [ ] `repeating-form.ts` — repeating block with 1 child
  - [ ] `grouped-form.ts` — customer group + 2 top-level fields
  - [ ] `usp-797-em.ts` — full environmental monitoring form
- [ ] `tests/roundtrip.test.ts`
  - [ ] `test.each(fixtures)("round-trips %s", deserialize(serialize(x)) === x)`
- [ ] Add `pnpm test` to CI (GitHub Actions or Coolify build hook)
- [ ] Optional: `vitest --coverage` for visibility

### Exit criterion

> All 5 fixtures green. CI fails on serialization drift.

---

## Phase 10 — Bridge (Step 12)

> **Goal:** Iframe plug-and-play. Origin-validated. JSON fallback for standalone use.

### Todos

**`src/bridge/postMessage.ts`:**
- [ ] `ALLOWED_ORIGINS` from `NEXT_PUBLIC_ALLOWED_ORIGINS` (comma-split)
- [ ] Inbound listener: `LOAD_FORM` → `loadForm(deserialize(payload))`; `LOAD_GROUP` → `stageGroup(payload)`
- [ ] Outbound: `emitSaved(targetOrigin, builderSchema)` → origin gate → `window.parent.postMessage({ type: "FORM_SAVED", payload: serialize(schema) }, targetOrigin)`
- [ ] `emitError(targetOrigin, code, message)`
- [ ] Reject any `e.data.type` outside the known union
- [ ] Type-narrow with a runtime Zod schema for inbound payloads

**`src/bridge/export.ts`:**
- [ ] "Download JSON" → blob → object URL → anchor click
- [ ] "Copy JSON" → `navigator.clipboard.writeText` with toast

**Tests:**
- [ ] Inbound: bad origin → handler returns early
- [ ] Inbound: valid `LOAD_FORM` → store populated
- [ ] Outbound: bad target origin → throws
- [ ] Outbound: good origin → posts with correct shape

**Test host (`public/test-host.html`):**
- [ ] Iframe-embed the builder, `LOAD_FORM` on load, log `FORM_SAVED` on receive

### Exit criterion

> Test host works. Bad origin ignored. Export JSON valid.

---

## Phase 11 — App Shell & Ship (Step 13)

> **Goal:** Polished, themed, deployed at `forms.manne.work`.

### Todos

**App shell:**
- [ ] `app/page.tsx`:
  - [ ] Header: logo, tabs (Build | Preview), Save, Export menu
  - [ ] 3-pane body: Palette (left) | Canvas (center) | Properties (right)
  - [ ] Resizable panel dividers (via CSS or library)
- [ ] Theme tokens pulled from LIMS shadcn setup for visual parity

**Empty states:**
- [ ] Empty canvas: "Drag a field from the left to begin"
- [ ] No selection: "Select a field to edit its properties"
- [ ] No group staged: "Group palette item appears here when a group is loaded"

**Keyboard shortcuts:**
- [ ] `Del` / `Backspace` — delete selected
- [ ] `Cmd/Ctrl+S` — save (postMessage or download)
- [ ] `Cmd/Ctrl+Z / Shift+Z` — undo/redo (coltorapps events)
- [ ] Arrow Up/Down — reorder selected

**Security:**
- [ ] `next.config.ts` headers: `frame-ancestors <origins>`, `X-Content-Type-Options: nosniff`

**Deploy:**
- [ ] Repo wired on Coolify, env vars set (`NEXT_PUBLIC_ALLOWED_ORIGINS`)
- [ ] Wildcard SSL per existing pattern
- [ ] Health check endpoint (`/api/health`)
- [ ] Smoke test: load `/`, save form, verify JSON output

**Docs:**
- [ ] `docs/EMBED.md` — embed snippet for LIMS team

### Exit criterion

> `forms.manne.work` live. LIMS can embed and save forms. Round-trip CI green on main.

---

## Cross-Phase UX Concerns

- [ ] Drag handle visible on hover only
- [ ] Selected state: subtle ring + slightly raised card
- [ ] Invalid state: red ring + inline error in properties panel
- [ ] Toasts: save success, copy success, foreign-origin warning
- [ ] Loading skeleton for async operations (group load)
- [ ] A11y: focus-visible styles, `aria-label` on icon buttons, sortable items announce position
- [ ] Responsive: usable down to 1024px (3-pane collapses gracefully)

---

## Milestone Gates

| # | Gate | Validates |
|---|------|-----------|
| M0 | App boots, 3-pane placeholder | Scaffold |
| M1 | Contract compiles, example test | Output shape locked |
| M2 | All attribute Zod tests pass | Schema engine solid |
| M3 | Key tests pass | Key strategy solid |
| M0–M3 | **53 tests pass, typecheck clean, dev server 200** | **Phases 0–3 complete** |
| M4 | Live label edit propagates | UI bindings working |
| M5 | Drag from palette works | Canvas UX complete |
| M6 | Group expansion works | Composition complete |
| M4–M6 | **59 tests pass, typecheck clean, dev server 200** | **Phases 4–6 complete** |
| M7 | Validation fires in preview | Interpretability complete |
| M8 | 4 fixture tests pass | Serializer works |
| M9 | 5 fixtures green, CI runs | **Round-trip CI gate** |
| M10 | Test host receives FORM_SAVED | Bridge works |
| M11 | `forms.manne.work` live, iframable | **Ship** |

---

## Suggested PR Order

```
M0  chore: scaffold (prep)                                   ✅ DONE
M1  feat(contract): types + example                          ✅ DONE
M2  feat(builder): attributes + entities + builder            ✅ DONE
M3  feat(serializer): frozen keys                            ✅ DONE
M4  feat(ui): entity & attribute components                  ✅ DONE
M5  feat(canvas): drag-drop + palette + properties            ✅ DONE
M6  feat(groups): expand + provenance                         ✅ DONE
M7  feat(preview): interpreter playground
M8  feat(serializer): serialize + deserialize
M9  test(roundtrip): fixtures + CI gate
M10 feat(bridge): postMessage + export
M11 chore(deploy): app shell + Coolify
```
