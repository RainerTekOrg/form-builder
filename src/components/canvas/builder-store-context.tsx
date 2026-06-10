"use client";

import { createContext, useContext } from "react";
import type { BuilderStore } from "@coltorapps/builder";
import { formBuilder } from "@/src/builder/form-builder";

const BuilderStoreContext = createContext<BuilderStore<typeof formBuilder> | null>(null);

export function useBuilderStoreCtx(): BuilderStore<typeof formBuilder> | null {
  return useContext(BuilderStoreContext);
}

export function BuilderStoreProvider({
  store,
  children,
}: {
  store: BuilderStore<typeof formBuilder>;
  children: React.ReactNode;
}) {
  return (
    <BuilderStoreContext.Provider value={store}>
      {children}
    </BuilderStoreContext.Provider>
  );
}
