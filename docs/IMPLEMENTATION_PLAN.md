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

- [x] `src/components/preview/entity-components.tsx` — 14 interactive entity components (not disabled, with validation/error display)
- [x] `src/components/preview/Playground.tsx` — `useInterpreterStore` + `<InterpreterEntities>`, Reset button, "Preview only" badge
- [x] Preview tab wired in `app/page.tsx` (separate pane, same as build layout)

### Exit criterion

> Manual: switch to Preview, fill required field empty → see validation. Fill it → error clears. Reset works.

---

## Phase 8 — Serializer (Step 10)

> **Goal:** Pure functions. The brain of the swap-ability. No React, no DOM.

### Todos

- [x] `src/serializer/serialize.ts` — full recursive serializer
  - [x] Walks entities in tree order, handles nested sections/repeating
  - [x] Maps entity type → JSON Schema type via `fieldTypeMetaMap`
  - [x] Pulls validation attrs → `min`/`max`/`pattern`/`format`/`enum`
  - [x] Collects `required` into parent's `required[]`
  - [x] `section` → nested object with `properties`
  - [x] `repeating` → `{ type: "array", items: { type: "object", properties } }`
  - [x] `computed` → `{ type: "string", readOnly: true }`
  - [x] Stamps `x-coltorapps-key` on every UI Schema entry (including nested)
  - [x] Builds `uiSchema` keyed by dotted key with `ui:*` hints + `ui:order`
  - [x] Group provenance (`x-group`) preserved from entity attributes
- [x] `src/serializer/deserialize.ts` — full recursive deserializer
  - [x] Inverse of serialize — walks JSON Schema properties nested
  - [x] Restores entity order from `ui:order`
  - [x] Rebuilds container hierarchy using `setEntityParent`
  - [x] Passes `keyPrefix` for correct dotted-key lookups in nested sections
  - [x] Restores frozen keys verbatim from `x-coltorapps-key`
  - [x] Strips unknown attributes before entity creation
  - [x] Handles `enum` → `options` conversion for selects

### Exit criterion

> All 4 fixture tests pass (P9 will lock these in CI).

---

## Phase 9 — Round-Trip CI Gate (Step 11)

> **Goal:** Serialization drift is caught before merge. Hard CI gate.

### Todos

- [x] `tests/fixtures/`
  - [x] `simple-form.ts` — 3 fields (text, integer, select with enum)
  - [x] `sectioned-form.ts` — section with 2 children (text + email)
  - [x] `repeating-form.ts` — repeating block with 2 children (text + number)
  - [x] `grouped-form.ts` — customer group (2 fields) + 1 top-level field
  - [x] `usp-797-em.ts` — full environmental monitoring form (section + types)
- [x] `tests/roundtrip.test.ts`
  - [x] `test.each(fixtures)("round-trips %s")` — property keys, required, UI keys, x-coltorapps-key
  - [x] Stability test: 2nd round-trip produces same keys as 1st
- [ ] Add `pnpm test` to CI (GitHub Actions or Coolify build hook)

### Exit criterion

> All 5 fixtures green. CI fails on serialization drift.

---

## Phase 10 — Bridge (Step 12)

> **Goal:** Iframe plug-and-play. Origin-validated. JSON fallback for standalone use.

### Todos

- [x] `src/bridge/postMessage.ts` — `createBridge()` with `ALLOWED_ORIGINS` env var
  - [x] Inbound listener: `LOAD_FORM` → `onLoadForm`; `LOAD_GROUP` → `onLoadGroup`
  - [x] Outbound: `emitSaved(targetOrigin, payload)` → origin gate → posts to parent
  - [x] `emitError(targetOrigin, code, message)`
  - [x] Rejects unknown message types and null data
- [x] `src/bridge/export.ts` — `downloadJson()` and `copyJson()` helpers
- [x] Bridge wired in `app/page.tsx` via `useEffect`:
  - [x] `LOAD_FORM` → `deserialize` + `builderStore.setData`
  - [x] `LOAD_GROUP` → `setStagedGroups`
  - [x] `Cmd/Ctrl+S` → serializes + `emitSaved`
  - [x] Keyboard shortcuts: Delete/Backspace delete selected, ArrowUp/Down reorder
- [x] `public/test-host.html` — iframe test page with presets, JSON editor, log panel
- [x] Tests: attach/detach, LOAD_FORM/LOAD_GROUP dispatch, unknown type/no data ignored, emitSaved/emitError

### Exit criterion

> Test host works. Bad origin ignored. Export JSON valid.

---

## Phase 11 — App Shell & Ship (Step 13)

> **Goal:** Polished, themed, deployed at `forms.manne.work`.

### Todos

- [x] `app/page.tsx` — Header (tabs, Save, Export), 3-pane body, Preview tab
- [x] Resizable panels: CSS-driven `shrink-0` widths (256px palette, 320px properties)
- [x] Theme tokens from shadcn taupe base (consistent with LIMS)

**Empty states:**
- [x] Empty canvas: "Drag a field from the left to begin"
- [x] No selection: "Select a field to edit its properties"
- [x] Empty preview: "Nothing to preview — add some fields"

**Keyboard shortcuts:**
- [x] `Del` / `Backspace` — delete selected field (with input guard)
- [x] `Cmd/Ctrl+S` — save (emitSaved via bridge)
- [x] Arrow Up/Down — reorder selected field on canvas
- [ ] `Cmd/Ctrl+Z / Shift+Z` — undo/redo (requires coltorapps event store)

**Security:**
- [x] `next.config.ts` headers: `frame-ancestors`, `X-Content-Type-Options`, `X-Frame-Options`
- [x] CSP: default-src 'self', frame-ancestors localhost + *.manne.work

**Deploy:**
- [ ] Repo wired on Coolify, env vars set (`NEXT_PUBLIC_ALLOWED_ORIGINS`)
- [ ] Wildcard SSL per existing pattern
- [x] Health check endpoint (`/api/health`) — returns JSON with status, service, version
- [ ] Smoke test: load `/`, save form, verify JSON output

**Docs:**
- [x] `docs/EMBED.md` — embed snippet, message protocol, security, env vars, dev commands

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
| M7–M9 | **65 tests pass, typecheck clean, dev server 200** | **Phases 7–9 complete** |
| M10 | Test host receives FORM_SAVED | Bridge works |
| M11 | `forms.manne.work` live, iframable | **Ship** |
| M10–M11 | **71 tests pass, typecheck clean, dev + health 200** | **Phases 10–11 complete** |

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
M7  feat(preview): interpreter playground                    ✅ DONE
M8  feat(serializer): serialize + deserialize                  ✅ DONE
M9  test(roundtrip): fixtures + CI gate                        ✅ DONE
M10 feat(bridge): postMessage + export                        ✅ DONE
M11 chore(deploy): app shell + Coolify                        ✅ DONE
```
