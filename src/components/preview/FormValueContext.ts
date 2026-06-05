"use client";

import { createContext, useContext } from "react";

export interface FormValueContextValue {
  getFieldValue: (fieldKey: string) => unknown;
}

const FormValueContext = createContext<FormValueContextValue | null>(null);

export function useFormValues(): FormValueContextValue {
  const ctx = useContext(FormValueContext);
  if (!ctx) {
    return { getFieldValue: () => undefined };
  }
  return ctx;
}

export default FormValueContext;
