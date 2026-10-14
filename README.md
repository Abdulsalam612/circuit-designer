# CirKit

**Build, simulate and learn electronics in the browser.** CirKit is a drag-and-drop circuit
editor with a live simulator, plus guided lessons that teach electronics from scratch and
check your circuits as you build them.

**Live site:** https://circuit-designer-abdulsalam612s-projects.vercel.app

## Features

- **Circuit editor:** drag batteries, resistors, LEDs, lamps, switches, capacitors, inductors
  and ground onto a snapping grid; draw wires by dragging from a part's end; wires follow parts
  when you move or rotate them. Multi-select, undo/redo, editable values with SI prefixes
  (`4.7k`, `4k7`, `10u`…).
- **Live DC simulation:** press **Run** to see LEDs and lamps glow, current flowing along the
  wires, voltage/current/power readings, and warnings for short circuits, open circuits,
  reversed or overloaded LEDs.
- **Lessons:** Levels 0–2 (intro to electricity, basic components, series & parallel) with
  reading, quizzes and build challenges marked by the simulator. Progress and points are
  saved to your account.
- **My Circuits:** circuits autosave to your account; rename, duplicate, delete, import and
  export as JSON.
- **Kids mode** (`/play`): a simplified, playful builder (early version).

## Tech stack

Next.js 15 (App Router) · React 19 · TypeScript · Tailwind CSS 4 · Firebase Auth + Firestore ·
Konva (canvas) · interact.js (drag and drop). The circuit solver is CirKit's own (nodal
analysis), in `src/lib/simulation.ts`.

## Getting started

Requires Node.js 18.18 or newer.

```bash
npm install
cp .env.example .env.local   # then fill in your Firebase web app config
npm run dev                  # http://localhost:3000
```

### Environment variables

The Firebase web config comes from `NEXT_PUBLIC_FIREBASE_*` variables (listed in
`.env.example`). Find the values in the Firebase console under **Project settings → Your apps
→ Web app**. When deploying (e.g. on Vercel), add the same variables to the project's
environment variables. The app stops with a clear error if any are missing.

Firestore security rules are in `firestore.rules`: each user can only read and write their own
profile and circuits.

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Development server |
| `npm test` | Solver, unit-parsing and lesson checks |
| `npx tsc --noEmit` | Type-check |
| `npm run lint` | ESLint |
| `npm run build` | Production build |

## Project layout

```
src/
  app/                 Pages: / (home), /simulation (editor), /circuits, /dashboard, /learn/[lessonId], /play
  components/          CircuitCanvas (the editor canvas), sidebar, properties panel, lessons/
  content/lessons/     The course: one file per lesson, plus index.ts (levels and order)
  lib/                 Grid, wires, editing, simulation, lessons, progress, Firestore storage
  hooks/, context/     Undo history, saving, auth
  types/               Circuit and lesson types
tests/                 npm test
```

To add a lesson, create a file in `src/content/lessons/` and add it to `LESSONS` in
`src/content/lessons/index.ts`.

## Author

Abdulsalam Sami ([@Abdulsalam612](https://github.com/Abdulsalam612))
