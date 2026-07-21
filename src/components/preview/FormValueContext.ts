"use client";

import { createContext, useContext } from "react";

/** Minimal schema-entity shape the repeating renderer needs to draw row inputs. */
export interface SchemaEntityLite {
  type: string;
  attributes: Record<string, unknown>;
  children?: string[];
}

export interface FormValueContextValue {
  getFieldValue: (fieldKey: string) => unknown;
  /** Schema entities by id (so a repeating group can find its child field defs). */
  entities: Record<string, SchemaEntityLite>;
}

const FormValueContext = createContext<FormValueContextValue | null>(null);

export function useFormValues(): FormValueContextValue {
  const ctx = useContext(FormValueContext);
  if (!ctx) {
    return { getFieldValue: () => undefined, entities: {} };
  }
  return ctx;
}

export default FormValueContext;
