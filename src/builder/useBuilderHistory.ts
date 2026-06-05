"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useBuilderStore } from "@coltorapps/builder-react";
import { builderStoreEventsNames, type Schema } from "@coltorapps/builder";
import { formBuilder } from "@/src/builder/form-builder";
import { createHistory, type HistoryStore } from "@/src/builder/history";

type FormSchema = Schema<typeof formBuilder>;

const DEBOUNCE_MS = 300;

export interface UseBuilderHistoryResult {
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

export function useBuilderHistory(): UseBuilderHistoryResult {
  const builderStore = useBuilderStore(formBuilder);
  const [history] = useState<HistoryStore<FormSchema>>(() =>
    createHistory<FormSchema>(builderStore.getSchema()),
  );

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const applyingRef = useRef(false);
  const [counts, setCounts] = useState({ past: 0, future: 0 });
  const refresh = useCallback(() => {
    setCounts(history.size());
  }, [history]);

  useEffect(() => {
    const flush = () => {
      if (applyingRef.current) return;
      history.snapshot(builderStore.getSchema());
      refresh();
    };

    return builderStore.subscribe((_data, events) => {
      const setDataEvent = events.find(
        (e) => e.name === builderStoreEventsNames.DataSet,
      );
      if (setDataEvent) {
        applyingRef.current = false;
        return;
      }
      const interesting = events.some(
        (e) =>
          e.name === builderStoreEventsNames.SchemaUpdated ||
          e.name === builderStoreEventsNames.EntityAdded ||
          e.name === builderStoreEventsNames.EntityUpdated ||
          e.name === builderStoreEventsNames.EntityDeleted ||
          e.name === builderStoreEventsNames.EntityCloned ||
          e.name === builderStoreEventsNames.EntityAttributeUpdated ||
          e.name === builderStoreEventsNames.RootUpdated,
      );
      if (!interesting) return;

      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(flush, DEBOUNCE_MS);
    });
  }, [builderStore, history, refresh]);

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  const undo = useCallback(() => {
    const prev = history.undo();
    if (prev) {
      applyingRef.current = true;
      builderStore.setData({
        schema: prev,
        entitiesAttributesErrors: {},
        schemaError: undefined,
      });
      refresh();
    }
  }, [builderStore, history, refresh]);

  const redo = useCallback(() => {
    const next = history.redo();
    if (next) {
      applyingRef.current = true;
      builderStore.setData({
        schema: next,
        entitiesAttributesErrors: {},
        schemaError: undefined,
      });
      refresh();
    }
  }, [builderStore, history, refresh]);

  return {
    undo,
    redo,
    canUndo: counts.past > 0,
    canRedo: counts.future > 0,
  };
}
