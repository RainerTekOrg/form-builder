"use client";

import { createContext, useContext } from "react";

export interface AddFieldContextValue {
  addField: (parentId: string | null, entityName: string, label: string) => void;
  allowedFieldTypes?: string[];
}

const AddFieldContext = createContext<AddFieldContextValue | null>(null);

export function useAddFieldCtx(): AddFieldContextValue {
  const ctx = useContext(AddFieldContext);
  if (!ctx) {
    throw new Error("useAddFieldCtx must be used within an AddFieldProvider");
  }
  return ctx;
}

export function useAddField(): AddFieldContextValue["addField"] {
  return useAddFieldCtx().addField;
}

export function useAllowedFieldTypes(): string[] | undefined {
  return useAddFieldCtx().allowedFieldTypes;
}

export function AddFieldProvider({
  children,
  onAddField,
  allowedFieldTypes,
}: {
  children: React.ReactNode;
  onAddField: AddFieldContextValue["addField"];
  allowedFieldTypes?: string[];
}) {
  return (
    <AddFieldContext.Provider value={{ addField: onAddField, allowedFieldTypes }}>
      {children}
    </AddFieldContext.Provider>
  );
}
