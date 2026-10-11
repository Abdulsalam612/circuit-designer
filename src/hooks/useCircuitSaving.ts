"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { CircuitLayout } from "@/types/circuit";
import { createCircuit, loadCircuit, saveCircuit } from "@/lib/circuitStore";

export type SaveStatus = "loading" | "new" | "unsaved" | "saving" | "saved" | "error";

// Wait this long after the last change before saving automatically
const AUTOSAVE_DELAY_MS = 1500;

const snapshot = (name: string, layout: CircuitLayout) => JSON.stringify({ name, layout });

const describeError = (error: unknown) => {
  const code = (error as { code?: string })?.code;
  if (code === "permission-denied") return "Not allowed to save. Check the Firestore security rules (see firestore.rules).";
  if (code === "unavailable") return "You appear to be offline. Changes will save when you reconnect.";
  return error instanceof Error ? error.message : "Something went wrong while saving.";
};

interface Options {
  uid: string | null;
  name: string;
  layout: CircuitLayout;
  // Called once a saved circuit has been loaded
  onLoaded: (name: string, layout: CircuitLayout) => void;
}

// Loads the circuit named in the URL (?id=...) and keeps it saved to Firestore: changes
// are saved automatically shortly after editing stops, or straight away with save().
// A new circuit isn't stored until it has something in it.
export const useCircuitSaving = ({ uid, name, layout, onLoaded }: Options) => {
  const [circuitId, setCircuitId] = useState<string | null>(null);
  const [status, setStatus] = useState<SaveStatus>("loading");
  const [error, setError] = useState<string | null>(null);

  // What's currently stored, to tell whether there are unsaved changes
  const savedSnapshot = useRef<string | null>(null);
  const circuitIdRef = useRef<string | null>(null);
  const latest = useRef({ name, layout });
  latest.current = { name, layout };
  const inFlight = useRef<Promise<void> | null>(null);
  const onLoadedRef = useRef(onLoaded);
  onLoadedRef.current = onLoaded;

  // Load once the user is known
  useEffect(() => {
    if (!uid) return;
    const id = new URLSearchParams(window.location.search).get("id");
    if (!id) {
      savedSnapshot.current = snapshot(latest.current.name, latest.current.layout);
      setStatus("new");
      return;
    }
    let cancelled = false;
    loadCircuit(uid, id)
      .then(result => {
        if (cancelled) return;
        if (!result) {
          // Start a fresh circuit instead
          window.history.replaceState(null, "", window.location.pathname);
          savedSnapshot.current = snapshot(latest.current.name, latest.current.layout);
          setError("That circuit doesn't exist or was deleted, so this is a new one.");
          setStatus("new");
          return;
        }
        circuitIdRef.current = id;
        setCircuitId(id);
        savedSnapshot.current = snapshot(result.name, result.layout);
        onLoadedRef.current(result.name, result.layout);
        setStatus("saved");
      })
      .catch(e => {
        if (cancelled) return;
        setError(describeError(e));
        setStatus("error");
      });
    return () => { cancelled = true; };
  }, [uid]);

  const save = useCallback(async () => {
    if (!uid) return;
    // One save at a time; a save requested meanwhile runs after it with the latest state
    while (inFlight.current) await inFlight.current;

    const { name: currentName, layout: currentLayout } = latest.current;
    const snap = snapshot(currentName, currentLayout);
    if (snap === savedSnapshot.current) {
      setStatus(circuitIdRef.current ? "saved" : "new");
      return;
    }

    setStatus("saving");
    const run = (async () => {
      try {
        if (circuitIdRef.current) {
          await saveCircuit(uid, circuitIdRef.current, currentName, currentLayout);
        } else {
          const id = await createCircuit(uid, currentName, currentLayout);
          circuitIdRef.current = id;
          setCircuitId(id);
          // Put the id in the address bar so a reload reopens this circuit
          window.history.replaceState(null, "", `?id=${id}`);
        }
        savedSnapshot.current = snap;
        setError(null);
        const changedSince = snapshot(latest.current.name, latest.current.layout) !== snap;
        setStatus(changedSince ? "unsaved" : "saved");
      } catch (e) {
        setError(describeError(e));
        setStatus("error");
      }
    })();
    inFlight.current = run;
    await run;
    inFlight.current = null;
  }, [uid]);

  // Autosave after edits
  useEffect(() => {
    // Not while loading, nor after a failed load (saving then could create a duplicate)
    if (!uid || status === "loading" || savedSnapshot.current === null) return;
    if (snapshot(name, layout) === savedSnapshot.current) return;
    if (status !== "saving" && status !== "error") setStatus("unsaved");
    const timer = setTimeout(save, AUTOSAVE_DELAY_MS);
    return () => clearTimeout(timer);
  }, [uid, name, layout, status, save]);

  // Warn before leaving with changes that haven't been saved yet
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (snapshot(latest.current.name, latest.current.layout) !== savedSnapshot.current) {
        e.preventDefault();
      }
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, []);

  return { circuitId, status, error, save };
};
