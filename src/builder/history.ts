export interface HistoryStore<T> {
  snapshot(next: T): void;
  undo(): T | null;
  redo(): T | null;
  reset(next: T): void;
  canUndo(): boolean;
  canRedo(): boolean;
  size(): { past: number; future: number };
}

export function createHistory<T>(initial: T, maxDepth = 100): HistoryStore<T> {
  let past: T[] = [];
  let present: T = initial;
  let future: T[] = [];

  return {
    snapshot(next) {
      if (Object.is(next, present)) return;
      past.push(present);
      if (past.length > maxDepth) {
        past = past.slice(past.length - maxDepth);
      }
      present = next;
      future = [];
    },
    undo() {
      if (past.length === 0) return null;
      const prev = past.pop() as T;
      future.push(present);
      present = prev;
      return prev;
    },
    redo() {
      if (future.length === 0) return null;
      const next = future.pop() as T;
      past.push(present);
      present = next;
      return next;
    },
    reset(next) {
      past = [];
      future = [];
      present = next;
    },
    canUndo() {
      return past.length > 0;
    },
    canRedo() {
      return future.length > 0;
    },
    size() {
      return { past: past.length, future: future.length };
    },
  };
}
