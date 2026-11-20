// When the editor may save. Kept free of React and Firebase so it can be tested (tests/editor.test.ts).

// "loadFailed": the circuit in ?id= couldn't be opened (offline, no access…). Nothing on
// screen matches what's stored, so saving must stay off – it would create a new, empty
// circuit and point the address bar at it, losing the way back to the real one.
export type SaveStatus = "loading" | "loadFailed" | "new" | "unsaved" | "saving" | "saved" | "error";

// Saving is only safe once we know what's stored: not while loading, not after a failed load.
// (savedSnapshot is null in exactly those cases; the status is checked too so the Save button,
// which only sees the status, agrees with the hook.)
export const canSave = (status: SaveStatus, savedSnapshot: string | null) =>
  savedSnapshot !== null && status !== "loading" && status !== "loadFailed"

// For the leave-page warning: only real edits since the last load or save count
export const hasUnsavedChanges = (current: string, savedSnapshot: string | null) =>
  savedSnapshot !== null && current !== savedSnapshot

// Plain-English messages for the status strip – no database jargon
export const describeSaveError = (error: unknown) => {
  const code = (error as { code?: string })?.code
  if (code === "unavailable") return "You seem to be offline. Your changes will save when you reconnect."
  return "We couldn't save this circuit. Check your connection, or sign out and back in."
}

export const describeLoadError = (error: unknown) => {
  const code = (error as { code?: string })?.code
  if (code === "unavailable") return "You seem to be offline, so this circuit couldn't be opened. Reload the page when you're back online."
  return "We couldn't open this circuit. Check your connection and reload the page."
}
