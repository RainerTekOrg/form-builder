import { describe, it, expect } from "vitest";
import { formBuilder } from "@/src/builder/form-builder";
import { createBuilderStore } from "@coltorapps/builder";

describe("formBuilder", () => {
  it("instantiates without error", () => {
    expect(formBuilder).toBeDefined();
    expect(formBuilder.entities).toHaveLength(14);
  });

  it("creates a store without error", () => {
    const store = createBuilderStore(formBuilder);
    expect(store).toBeDefined();
    const schema = store.getSchema();
    expect(schema.root).toEqual([]);
    expect(schema.entities).toEqual({});
  });

  it("adds an entity to the store", () => {
    const store = createBuilderStore(formBuilder);
    const entity = store.addEntity({
      type: "textField",
      attributes: { label: "Name", key: "name", required: true },
    });
    expect(entity.id).toBeTruthy();
    expect(entity.type).toBe("textField");
    const schema = store.getSchema();
    expect(schema.root).toContain(entity.id);
    expect(schema.entities[entity.id]).toBeDefined();
  });

  it("adds entity at specified position", () => {
    const store = createBuilderStore(formBuilder);
    const e1 = store.addEntity({
      type: "textField",
      attributes: { label: "First", key: "first", required: false },
    });
    const e2 = store.addEntity({
      type: "textField",
      attributes: { label: "Second", key: "second", required: false },
    });
    const e3 = store.addEntity({
      type: "textField",
      attributes: { label: "Inserted", key: "inserted", required: false },
      index: 1,
    });
    const schema = store.getSchema();
    expect(schema.root[0]).toBe(e1.id);
    expect(schema.root[1]).toBe(e3.id);
    expect(schema.root[2]).toBe(e2.id);
  });

  it("deletes an entity", () => {
    const store = createBuilderStore(formBuilder);
    const entity = store.addEntity({
      type: "textField",
      attributes: { label: "Name", key: "name", required: false },
    });
    expect(store.getSchema().root).toHaveLength(1);
    store.deleteEntity(entity.id);
    expect(store.getSchema().root).toHaveLength(0);
  });

  it("sets entity attribute", () => {
    const store = createBuilderStore(formBuilder);
    const entity = store.addEntity({
      type: "textField",
      attributes: { label: "Name", key: "name", required: false },
    });
    store.setEntityAttribute(entity.id, "label", "Full Name");
    const updated = store.getEntity(entity.id);
    expect(updated?.attributes["label"]).toBe("Full Name");
  });

  it("sets entity parent", () => {
    const store = createBuilderStore(formBuilder);
    const section = store.addEntity({
      type: "section",
      attributes: { label: "Section", key: "section", required: false },
    });
    const child = store.addEntity({
      type: "textField",
      attributes: { label: "Name", key: "name", required: false },
    });
    store.setEntityParent(child.id, section.id);
    const sectionEntity = store.getEntity(section.id);
    expect(sectionEntity?.children).toContain(child.id);
  });

  it("unset entity parent", () => {
    const store = createBuilderStore(formBuilder);
    const section = store.addEntity({
      type: "section",
      attributes: { label: "Section", key: "section", required: false },
    });
    const child = store.addEntity({
      type: "textField",
      attributes: { label: "Name", key: "name", required: false },
    });
    store.setEntityParent(child.id, section.id);
    store.unsetEntityParent(child.id);
    const sectionEntity = store.getEntity(section.id);
    expect(sectionEntity?.children ?? []).toHaveLength(0);
  });

  it("moves child to root after unset", () => {
    const store = createBuilderStore(formBuilder);
    const section = store.addEntity({
      type: "section",
      attributes: { label: "Section", key: "section", required: false },
    });
    const child = store.addEntity({
      type: "textField",
      attributes: { label: "Name", key: "name", required: false },
    });
    store.setEntityParent(child.id, section.id);
    expect(store.getEntity(child.id)?.parentId).toBe(section.id);
    store.unsetEntityParent(child.id);
    expect(store.getEntity(child.id)?.parentId).toBeUndefined();
  });

  it("entity attribute validation catches invalid key", async () => {
    const store = createBuilderStore(formBuilder);
    const entity = store.addEntity({
      type: "textField",
      attributes: { label: "Name", key: "Invalid Key!", required: false },
    });
    await store.validateEntityAttribute(entity.id, "key");
    const errors = store.getEntitiesAttributesErrors();
    expect(errors[entity.id]?.["key"]).toBeDefined();
  });
});
