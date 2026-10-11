"use client";

import { useCallback, useState } from "react";
import type { CircuitLayout } from "@/types/circuit";

// How many steps Undo can go back
const MAX_HISTORY = 100;

export const EMPTY_LAYOUT: CircuitLayout = { components: [], wires: [] };

interface History {
  past: CircuitLayout[];
  present: CircuitLayout;
  future: CircuitLayout[];
}

// The circuit being edited, with undo/redo. Every change goes through apply(), which
// records one undo step; reset() replaces the circuit (e.g. after loading) and clears
// the history.
export const useCircuitHistory = (initial: CircuitLayout = EMPTY_LAYOUT) => {
  const [history, setHistory] = useState<History>({ past: [], present: initial, future: [] });

  const apply = useCallback((next: CircuitLayout) => {
    setHistory(h => ({
      past: [...h.past, h.present].slice(-MAX_HISTORY),
      present: next,
      future: [],
    }));
  }, []);

  const undo = useCallback(() => {
    setHistory(h => h.past.length === 0 ? h : {
      past: h.past.slice(0, -1),
      present: h.past[h.past.length - 1],
      future: [h.present, ...h.future],
    });
  }, []);

  const redo = useCallback(() => {
    setHistory(h => h.future.length === 0 ? h : {
      past: [...h.past, h.present],
      present: h.future[0],
      future: h.future.slice(1),
    });
  }, []);

  const reset = useCallback((layout: CircuitLayout) => {
    setHistory({ past: [], present: layout, future: [] });
  }, []);

  return {
    layout: history.present,
    apply,
    undo,
    redo,
    reset,
    canUndo: history.past.length > 0,
    canRedo: history.future.length > 0,
  };
};
