// Pan and zoom maths for the circuit board. Kept free of React and Konva so it can be tested
// (tests/editor.test.ts).

export interface Size { width: number; height: number }
export interface ViewPoint { x: number; y: number }
export interface Bounds { x0: number; y0: number; x1: number; y1: number }

export const MIN_SCALE = 0.1
export const MAX_SCALE = 5

// Where the stage may sit so the grid (−extent..extent canvas units) always fills the view:
// you can't pan off into blank space. If the whole grid is smaller than the view (zoomed far
// out), it is centred instead.
export const clampPan = (pos: ViewPoint, scale: number, view: Size, extent: number): ViewPoint => {
  const axis = (value: number, length: number) => {
    const half = extent * scale
    if (length >= half * 2) return length / 2
    return Math.min(half, Math.max(length - half, value))
  }
  return { x: axis(pos.x, view.width), y: axis(pos.y, view.height) }
}

// Scale and position that show every box with a margin, centred in the view; null when there
// is nothing to fit. Never zooms in past 2× (one small part shouldn't fill the screen).
export const fitView = (boxes: Bounds[], view: Size, margin = 48): { scale: number; pos: ViewPoint } | null => {
  if (boxes.length === 0 || view.width <= 0 || view.height <= 0) return null
  const x0 = Math.min(...boxes.map(b => b.x0))
  const y0 = Math.min(...boxes.map(b => b.y0))
  const x1 = Math.max(...boxes.map(b => b.x1))
  const y1 = Math.max(...boxes.map(b => b.y1))
  const fit = Math.min(
    (view.width - margin * 2) / Math.max(x1 - x0, 1),
    (view.height - margin * 2) / Math.max(y1 - y0, 1),
  )
  const scale = Math.min(2, Math.max(MIN_SCALE, fit))
  return {
    scale,
    pos: { x: view.width / 2 - ((x0 + x1) / 2) * scale, y: view.height / 2 - ((y0 + y1) / 2) * scale },
  }
}

// Zoom by `factor` about a screen point (the mouse), keeping the canvas point under it still
export const zoomAt = (pos: ViewPoint, scale: number, factor: number, at: ViewPoint) => {
  const next = Math.min(MAX_SCALE, Math.max(MIN_SCALE, scale * factor))
  const canvasX = (at.x - pos.x) / scale
  const canvasY = (at.y - pos.y) / scale
  return { scale: next, pos: { x: at.x - canvasX * next, y: at.y - canvasY * next } }
}
