# CirKit – Project Context (handoff for AI assistants)

> **Read this whole file before doing anything.** It is the shared memory for this project:
> what it is, how it's built, every important decision and why, how the owner likes to
> work, and exactly where things were left. **Keep it updated after every task** (§8 status + a §9 session log entry, see AGENTS.md) so any new chat can pick up seamlessly.

Last updated: 13 Oct 2026

---

## 1. What this is

**CirKit** is a web app for learning electronics: a drag-and-drop **circuit editor with a
live simulator**, plus **guided lessons** with progress tracking, and a separate simplified
**kids mode** ("CirKit Kids"). Owner: **Abdulsalam Sami** (GitHub `Abdulsalam612`).
It's a placement/portfolio project; the longer-term idea (from the owner's notes) is to pitch
it in the spirit of **LEGO Education**, talk to **Spark**, and add a **teacher view** of
students' progress, achievements and a leaderboard.

### Where everything lives

| What | Where |
|---|---|
| Git repo (this folder) | `E:\Desketop\Circuit Designer\circuit-designer` |
| GitHub | https://github.com/Abdulsalam612/circuit-designer |
| Live site (Vercel, deploys `master` automatically) | https://circuit-designer-abdulsalam612s-projects.vercel.app |
| Firebase project | `circuitdesigner-4e620` (Auth email/password + Firestore) |
| Owner's planning notes (Obsidian) | `E:\Desketop\Obsidian\Placement\Circuit Project\` |
| **Master roadmap / checklist** | `E:\Desketop\Obsidian\Placement\Circuit Project\Master Checklist.md` |
| Older checklists the master one was built from | `...\Circuit Project\Milestone Checklists\` (Circuit, General Website, Learning), `Notes.md`, `Libraries for circuit interface.md` |

The **Master Checklist** is the source of truth for progress: Stages 0–10, `- [x]` done /
`- [ ] ` open. **Tick items there when you finish them** (the owner asked for this).

The parent folder `E:\Desketop\Circuit Designer\` also contains `.claude/launch.json` (dev
server config for Claude Code's preview) – not part of the repo; the repo also has its own
uncommitted `.claude/launch.json` (preview `cirkit-dev` → `npm run dev`, port 3000). The unused
CircuitJS copies (`circuitjs1/`, `public/circuitjs/`) were deleted on 13 Oct 2026 – we use our
own solver (see §5.6); upstream is github.com/sharpie7/circuitjs1 if ever needed.

---

## 2. Running, testing, deploying

```bash
cd "E:/Desketop/Circuit Designer/circuit-designer"
npm install          # first time
npm run dev          # http://localhost:3000  (first page compile can take ~40 s)
npm test             # solver, unit-parser and lesson checks (tsx): expect "all 36 solver checks passed", "all 26 unit checks passed", "all 151 lesson checks passed"
npx tsc --noEmit     # type-check
npm run lint         # ESLint via next lint (prints a deprecation notice in Next 15.5 – harmless)
npm run build        # production build – run before pushing to master
```

- **Branches:** day-to-day work happens on **`editor-wiring`**; `master` is what Vercel
  deploys. Release = build passes → `git checkout master && git merge --ff-only editor-wiring
  && git push origin master && git checkout editor-wiring`. Currently both point at the same
  commit.
- **Vercel blocks deploys on vulnerable Next.js versions.** That's why Next was upgraded from
  15.3.2 → **15.5.27** (15.3.x is no longer patched). Keep Next patched. Check deploy status
  without logging in: `curl -s https://api.github.com/repos/Abdulsalam612/circuit-designer/commits/<sha>/status`.
- `npm run build` writes to `.next/`, the same folder the dev server uses – **stop the dev
  server before building**, restart after.
- Remaining `npm audit` warnings: `@grpc/grpc-js` (via Firebase – needs Firebase 12 major
  upgrade) and `postcss` (bundled in Next, build-time only). Vercel doesn't block on these.
- **Firebase web config comes from env vars** `NEXT_PUBLIC_FIREBASE_*` (list in `.env.example`;
  real values in the untracked `.env.local`). `src/firebase.ts` throws a clear error if any is
  missing. **The same 6 vars must exist in Vercel (Project → Settings → Environment
  Variables, Production + Preview) before any deploy of this code, or the live site breaks.**
  The values aren't secret (they ship to the browser).
- Firestore security rules are in `firestore.rules` and **are published** (owner did it):
  each user can only read/write `users/{uid}` and `users/{uid}/circuits/*`.

---

## 3. Tech stack

Next.js 15.5 (App Router, all pages are client components) · React 19.3 · TypeScript ·
Tailwind CSS 4 · Firebase 11 (Auth + Firestore) · **Konva / react-konva** for the canvas ·
**interact.js** for dragging parts from the sidebar · lucide-react icons · tsx (tests only).
Brand palette: Gunmetal `#31393C`, Blue `#2176FF`, Celestial `#33A1FD`, Sunglow `#FDCA40`,
Carrot `#F79824`.

**React and react-dom must always be the exact same version** (an `npm audit fix` once bumped
only `react` → would break at runtime).

---

## 4. Code map

### Pages (`src/app/`)
| Route | File | Notes |
|---|---|---|
| `/` | `page.tsx` | Landing page + login/signup/password-reset modals (Firebase). **Signed in:** shows `WelcomeBack` (recent circuits, New circuit, Continue learning) instead of the hero. Opens the login modal when visited as `/?login=1&next=/path`. |
| `/simulation` | `simulation/page.tsx` | **The circuit editor.** Owns the circuit state (undo history), saving, header toolbar, Properties panel, Simulation panel. Loads a circuit from `?id=`. Protected. |
| `/circuits` | `circuits/page.tsx` | "My Circuits": open, rename, duplicate, delete. Back button → `/`. Protected. |
| `/dashboard` | `dashboard/page.tsx` | Learning dashboard: stats, **"Up next"** banner, lessons grouped by level (from `src/content/lessons`), Guides tab (**still placeholder cards hard-coded in the page**). Protected. |
| `/learn/[lessonId]` | `learn/[lessonId]/page.tsx` | **Lesson viewer**: steps one at a time (read → quiz → build challenge), Next is locked until a quiz is all correct / a challenge's goals are met; Finish saves completion + points; locked lessons show a message. Protected. |
| `/play`, `/kidscircuit` | | Kids mode landing + an emoji grid builder (separate, not connected to the simulator yet). |

### Editor components (`src/components/`)
- `CircuitCanvas.tsx` (~900 lines; was `KonvaTestCanvas` until 13 Oct 2026). The whole interactive canvas: grid, pan (right-drag) / zoom (wheel), sidebar
  drop with snapping preview ("ghost"), selection (click, Shift+click, box-select), group
  drag with live wire rerouting, wire drawing, keyboard (R rotate, Delete, Esc), connection
  markers, simulation visuals (glow, warning outlines, hover tooltip, **current-flow
  animation**). Receives `layout` + `onLayoutChange` from the page; never owns circuit state.
- `circuit/CircuitPart.tsx` – draws one part (icon, selection box, value label, battery “+”,
  glow, warning outline). Exports `partSize`, `PART_HEIGHT`, `CIRCUIT_PART_NAME`.
- `CircuitSidebar.tsx` – parts list (from `COMPONENT_DEFS`), draggable via interact.js
  (elements have class `componentItem` + `data-component-type`).
- `PropertiesPanel.tsx` – type, live readings (while simulating), value input with SI prefixes,
  switch Open/Closed, Rotate, Flip direction (polarized parts), position.
- `WelcomeBack.tsx` – signed-in home panel.
- `lessons/` – `ReadStepView` (renders content blocks), `QuizStepView`, `ChallengeStepView`
  (a mini editor: canvas with `fitContainer`, sidebar limited to the challenge's parts,
  Properties, Run, undo/redo/start again, goal checklist, hints), `LessonCard`, `ProgressBar`,
  `RichText` (`**bold**` only).

### Logic (`src/lib/`, `src/hooks/`, `src/types/`)
- `types/circuit.ts` – `CircuitComponent`, `Wire`, `CircuitLayout`, `ComponentType`.
- `lib/components.ts` – **catalog** `COMPONENT_DEFS` (label, length in cells, pin count,
  default rotation, editable value + unit + default, `toggles`, `polarized`), `iconFor`,
  `formatValue` / `parseValue` (SI prefixes, accepts `4.7k`, `4k7`, `10u`, `1e-6`, `10 ohms`).
- `lib/grid.ts` – `GRID_SIZE` (20), `snapToGrid`, `getPartPoints` (pins + body grid points),
  `isSpotFree` (overlap rule).
- `lib/wires.ts` – wire geometry and all connection logic: `routeWire`, `canAddWires`,
  `getConnectionPoints`, `splitWiresAtConnections`, `mergeWires`, `normalizeWires`,
  `isLayoutValid`, **`planMove`** (rerouting when parts move/rotate), `makeId`.
- `lib/editing.ts` – `rotateComponent`, `flipComponent`.
- `lib/simulation.ts` – **DC solver**, readings, warnings, per-wire currents, formatters.
- `lib/circuitStore.ts` – Firestore CRUD for circuits, `parseLayout` (validation), JSON
  import/export (`format: 'cirkit-circuit'`).
- `hooks/useCircuitHistory.ts` – undo/redo (100 steps) around the layout.
- `hooks/useCircuitSaving.ts` – load from `?id=`, autosave (1.5 s debounce), Save/Ctrl+S,
  status, unsaved-changes warning.
- `context/AuthContext.tsx` – `useAuth`, and **`useRequireAuth`** (redirects logged-out users
  to `/?login=1&next=<path>`; used by every protected page).
- `firebase.ts` – Firebase init (`auth`, `firestore`).
- `types/lesson.ts` – `Lesson`, steps (`read` / `quiz` / `challenge`), content blocks, `ChallengeGoal`.
- `content/lessons/` – **the course**: one file per lesson + `index.ts` (`LEVELS`, ordered `LESSONS`).
- `lib/lessons.ts` – `getLesson`, `lessonState` (unlock rule), `nextLesson`, `lessonAfter`,
  **`checkChallenge`** (runs `simulate()` and judges each goal, incl. series/parallel detection).
- `lib/progress.ts` – `loadProgress`, `completeLesson` (Firestore transaction, awards points once).

### Tests (`tests/`)
`simulation.test.ts` (36 checks: divider, LED+resistor, overload, reversed LED, short, open
switch, capacitor/inductor at DC, series batteries, ground, parallel lamps, two LEDs, weak
battery, wire currents…), `units.test.ts` (26 parse/format checks) and `lessons.test.ts` (151:
content validity – unique ids, quiz answers in range, challenge start layouts valid and not
already solved – unlock rules, and each challenge solved/failed by sample circuits). Run
`npm test`, plus `wires.test.ts` (14: wire moves, stretching, refusals, branch points).
**Add a case whenever you change the solver, wire logic or add a challenge.**

---

## 5. Core design decisions (and why) – keep these consistent

### 5.1 Grid and parts
- 20 px snap grid (minor lines) with darker lines every 5 cells; grid drawn as one Konva
  `Shape` on a non-listening layer (cheap, and clicks on empty space hit the stage → deselect /
  start box-select).
- A component's `x, y` is its **centre, always on a grid point**. Parts are `cells` long
  (most 4 = 80 px, ground 2). Cells must be even so both ends stay on grid points through
  rotation. Icons are 100×40 SVGs drawn 2.5:1 (`PART_HEIGHT` 32).
- Rotation is in 90° steps about the centre. Pin order: **pin 0 = the end at the left when
  rotation is 0, pin 1 = the right end**.
- **Overlap rule:** bodies may not overlap anything; lead ends may touch (touching = connected).

### 5.2 Connections – "grid-point connectivity" (decided with the owner)
- **Nothing stores what is connected to what.** Anything whose *ends* share a grid point is
  connected. Wires are plain `{id, x1, y1, x2, y2}`, always horizontal or vertical.
  This avoids stale references entirely, and is exactly what the solver needs (nodes).
- Only **ends** connect; wires crossing mid-segment don't (standard schematic convention).
  `splitWiresAtConnections` cuts a wire wherever an end lands along it (T-junction);
  `mergeWires` rejoins collinear pieces with nothing else at the joint.
  `normalizeWires` = split + merge, run after every change.
- Drawing: drag from a lead end or wire end; diagonal drags become an L.
  Wires may not cross a part body or run along another wire (`canAddWires`).
- Markers: hollow circle = unconnected end, filled dot = junction of 3+.
- **Wire editing (owner's design, 13 Oct 2026):** hover a wire → highlighted (lighter blue,
  3 px) and the cursor shows the drag direction. **Drag a wire** → it moves sideways in grid
  steps (`moveWire` = `planMove` with just that wire moving; along-axis movement ignored);
  attached wires bend/stretch and lead ends get a stub wire, so connections never break;
  refused spots keep the last valid one; one undo step. **Click a wire** → it's selected and a
  small white dot appears at the nearest grid point (`nearestPointOnWire`); **drag from the
  dot** → draws a branch wire, and the clicked wire is split there (T-junction). A press only
  becomes a drag after 4 screen px, so clicks still select. Starting a wire from an empty
  grid point is not implemented (plain drag on empty space = box select).

### 5.3 Moving parts: wires follow (`planMove` in `wires.ts`)
- Wire ends attached to moving parts follow. A wire that's no longer straight bends into an
  L; if that doesn't fit, U/Z detours up to 8 cells around obstacles; alternatively the whole
  run (through plain bends) back to its anchor is redrawn – **whichever uses less wire wins**,
  so moving back straightens wires.
- Bent wires between two parts moved together keep their shape.
- Rerouted wires must not create new connections (no passing through/bending onto other ends).
- Parts touching end-to-end get a wire added when pulled apart (stay connected).
- If nothing fits, the move/rotation is refused (part stays at last valid spot).
- For rotation of a **non-polarized** 2-terminal part, wires may attach to either end
  (whichever routes better). **Battery and LED are `polarized`: never swap ends** – rotating
  keeps each wire on the same terminal; **Flip direction** (half turn, wires stay) is the
  explicit way to reverse them.

### 5.4 Editor state, undo, saving
- The **page** owns `{components, wires}` via `useCircuitHistory`; the canvas calls
  `onLayoutChange` once per user action (a whole group drag = one undo step). Clear and Import
  are undoable.
- Saved per user at `users/{uid}/circuits/{circuitId}` = `{name, components, wires,
  createdAt, updatedAt}`. A new circuit isn't stored until it has content; after the first
  save the URL becomes `/simulation?id=...`. Firestore rejects `undefined`, so layouts are
  JSON round-tripped before saving.
- User profile doc `users/{uid}` (created at signup): name, email, level, xp,
  completedLessons, completedGuides, totalLessons, currentStreak, totalPoints.
  `completedLessons` now holds **lesson id strings** (e.g. `"leds"`); old numeric entries from
  the placeholder cards are ignored (and left in place). `totalLessons` is no longer read – the
  count comes from the content.

### 5.5 Component values
Stored in base SI units in `component.value` (Ω, F, H, V; LED value = forward voltage).
Switch uses `closed: boolean`. Defaults: resistor 1 kΩ, capacitor 1 µF, inductor 1 mH,
battery 9 V, LED 2 V, lamp 100 Ω.

### 5.6 Simulation (own DC solver, chosen over adapting CircuitJS)
`simulate(layout)` in `lib/simulation.ts`:
1. Union-find merges wire-connected points into nodes; all grounds are one 0 V node
   (reference = ground, else the first battery's − end). A tiny GMIN to ground keeps floating
   parts solvable.
2. Models: resistor/lamp = R; battery = source with 0.05 Ω internal resistance (so shorts
   give huge current instead of a singular matrix); closed switch & inductor = 1 mΩ; open
   switch & capacitor = open; LED = off below forward voltage, else Vf + 10 Ω (solved
   iteratively until on/off states agree).
3. Nodal analysis, Gaussian elimination with partial pivoting.
4. Output: per-part readings (voltage pin0−pin1, current pin0→pin1 – battery: current it
   delivers – power, brightness for lamp/LED, LED overloaded > 30 mA), node voltages, **wire
   currents** (from what each part injects; spanning tree per wire group), warnings:
   no battery, short circuit (terminal voltage < 50 % of EMF), open circuit (no battery
   current, suppressed when a dark LED explains it), unconnected ends, LED overloaded /
   reversed / underpowered.
- **Polarity convention:** battery pin 0 = **+** (red “+” drawn there), LED pin 0 = anode.
- UI: **Run** re-solves after every edit (useMemo on layout). LEDs glow red, lamps yellow
  (by brightness); amber dashed outline on parts in a warning; hover tooltip (V/I/P);
  live readings in Properties; Simulation panel lists warnings; **current-flow animation**:
  amber dots move along wires in the direction of conventional current (+ → −), speed
  `min(160, 25 + 30·log10(1 + mA))` px/s, hidden while dragging; pulsing green status dot.
- Not modelled yet: AC/transients (capacitors charging, inductors), kids mode hookup.
- `SimulationResult.pinNodes` (component id → node id per pin) lets lesson checks see the
  circuit's structure.

### 5.7 Lessons (Stage 5)
- **Content is data, kept out of the UI.** Before, 8 placeholder lessons were an array inside
  `dashboard/page.tsx` with no content, and "Start Lesson" just marked them done. Now each
  lesson is a typed file in `src/content/lessons/` (plain JSON-like data: no functions/JSX), so
  it can move to Firestore/a CMS later (e.g. with the Stage 9 admin panel) without touching the
  viewer. Chosen over Firestore for now because content is versioned/reviewed with the code,
  needs no admin UI, and nothing is written to the owner's Firebase.
- Lesson `id`s are permanent (stored in progress). Adding a lesson = new file + add it to
  `LESSONS` in `index.ts`.
- Steps: `read` (blocks: text, list, callout, formula, parts, table), `quiz` (multiple choice,
  must get all right; a wrong answer gets a nudge, not the answer), `challenge` (build in a mini
  editor; optional `start` circuit, e.g. a broken one to fix).
- Challenge goals are **declarative** (`lit`, `uses`, `current` range, `no-warning`, `series`,
  `parallel`) and judged by `checkChallenge` with the real solver. Lit = brightness ≥ 10 %.
  Series = reachable through nodes where exactly two part ends meet; parallel = same two nodes.
  Goals appear after "Check my circuit" and then update live.
- Unlock: strictly in order (first lesson open, each needs the previous). Completed lessons
  stay open for review (no gating, no extra points). Points = `lesson.points`, awarded once.
- Level 0: what-is-electricity, voltage-current-resistance, staying-safe, level-0-quiz.
  Level 1: resistors, capacitors, leds, level-1-quiz. Level 2: series-circuits,
  parallel-circuits, string-lights, fix-the-circuit (12 lessons).

---

## 6. How the owner likes to work (follow this)

- Explain things plainly and concisely; give a clear summary of what was done, what was
  tested, and what's next. Offer a recommendation rather than a long list of options.
- **Test in the browser before saying something works**, and report honestly (including bugs
  found and fixed while testing).
- **Don't commit or deploy unless asked.** When asked to "merge/deploy": run `npm run build`
  first, fast-forward `master`, push, then confirm the Vercel status.
- **Never create test data in the owner's Firebase account unless they ask.** For editor
  testing, temporarily bypass the login guard in `src/app/simulation/page.tsx` so autosave is
  off (replace `useRequireAuth()` with `{ user: null, loading: false }` and disable the
  `if (loading || !user)` early return), test, then **restore it** (`git diff` should show no
  change to that file). Load test circuits via the editor's Import (a JSON file with
  `format: 'cirkit-circuit'`) – in automation, set the hidden `input[type=file]` with a
  `DataTransfer` and dispatch `change`.
- Keep the **Master Checklist** in Obsidian up to date.
- Match the existing code style: comments explain *why*, shared logic lives in `src/lib`,
  small focused helpers, TypeScript strict, no `any`.
- Browser-automation gotchas seen so far: sidebar drag needs real stepped pointer events
  (interact.js); Konva stage is `window.Konva.stages[0]`; a background browser pane pauses
  `requestAnimationFrame` (measure animations with `Konva.Animation.animations[0].frame.time`);
  a drag fired within ~300 ms of a drop can miss because the hit canvas hasn't redrawn.
  If `innerWidth` is 0 the pane is collapsed: set a size with `resize_window` (e.g. 1366×900)
  before testing layout; `computer` `left_click_drag` works for sidebar drops and wire drawing.
- For testing lessons without Firebase: in `learn/[lessonId]/page.tsx` replace `useRequireAuth()`
  with `{ user: null, loading: false }` (progress = empty, Finish saves nothing; to open a later
  lesson also fake `completedLessons`); same idea in `dashboard/page.tsx`. Restore afterwards.

---

## 7. History (what was done, in order)

- **May–Jun 2025 (owner):** Next.js setup, landing page, Firebase auth (signup/login/reset),
  dashboard with Firestore progress/XP, Konva canvas with pan/zoom, sidebar drag (interact.js),
  select/rotate, kids mode pages. Last original commit `6046b43`.
- **11 Oct 2026 (with Claude):**
  - `07a177d` Clean-up (password `console.log` removed, unused deps/configs removed, 5 part
    components merged into `CircuitPart`, shared types), login guard + redirect, deselect fix,
    smooth drag preview, 20 px grid snapping, overlap prevention, wires + Delete.
  - `eabc436` Multi-select (Shift+click, box), group drag, wires follow parts (with detours).
  - `d291a03` Undo/redo, Firestore saving + autosave, My Circuits page, JSON import/export,
    Clear, editable values, LED/lamp/ground parts, signed-in home panel, `firestore.rules`.
  - `46978c9` Next.js 15.5.27 + React 19.3.0 security upgrade (unblocked Vercel). **Deployed.**
  - `59f7f58` DC simulation + battery/LED direction fix (polarized, Flip direction, “+” mark).
  - `988a387` Current-flow animation + pulsing status dot. **Deployed** (master = 988a387).
  - 12 Oct: tests moved into the repo (`npm test`), this context file added.
- The owner's account has a saved circuit **"Lamp test circuit"** (battery, switch, lamp);
  its switch is currently **Open** (owner toggled it) – that's why it shows no flow.

---

## 8. Current status & next steps

**Done:** Stages 0, 2 (editor), 3 (save/load), most of 4 (simulation first version), and
Stage 5 first version (12 lessons, Levels 0–2, viewer, quizzes, simulator-checked challenges) –
committed `abaffc2` and **deployed** (master = editor-wiring = abaffc2). See the Master Checklist for the full picture.

**Stage 1 finished 13 Oct 2026 (not committed yet).** Before deploying it, the owner must add
the 6 `NEXT_PUBLIC_FIREBASE_*` vars in Vercel (see §2).

**Stage 2 wiring finished 13 Oct 2026** (hover highlight, drag-to-move wires, branch from
mid-wire) – not committed yet, together with Stage 1.

**Suggested next steps (in order):**
1. Owner to try the lessons signed in on the live site (first real points write to
   Firestore). Possible follow-ups: Guides tab is still hard-coded placeholders (turn guides into
   content too, or drop the tab); level-up from XP (`level` field never changes, card says
   "50 pts to next level"); remove `totalLessons` from signup; more levels.
2. **Hook kids mode** (`/kidscircuit`) to the real simulator, or rebuild it on the editor with
   a simplified parts set.
3. Simulation extras: capacitor/inductor transients (time stepping), wire hover highlight,
   starting a wire from an empty grid point or mid-wire, voltage colouring on wires.
4. Website (Stage 7): profile/settings page, toasts instead of `alert()`, 404 page,
   mobile menu.
5. Pitch prep (Stage 8): short demo video (build → simulate → lesson).

---

## 9. Session log (newest first)

> Rule (see AGENTS.md): after every completed task, add one short entry here and update §8.

- 2026-10-14 – **Launch/demo video made with OpenMontage** (separate folder
  `E:\Desketop\Circuit Designer\OpenMontage`, AGPL, not part of this repo). Project
  `projects/cirkit-learn-by-building`: hybrid pipeline, real Playwright captures of the local
  dev server + hand-authored HyperFrames graphics, Piper voice en_GB-alan-medium, Pixabay music
  'Playful'. Final: `renders/export/cirkit-learn-by-building-1080p.mp4` (78.6s, 1080p30) +
  SRT, thumbnails, YouTube/LinkedIn copy. Captures used the TEMP login bypass + fake progress
  (backed up and restored, verified each time; no Firebase writes). Publish stage awaiting the
  owner's approval; nothing uploaded. Re-run: `capture/capture-all.ts` (needs the bypass),
  `projects/_scripts/cirkit_*.py`, `hyperframes/build_composition.py`.

- 2026-10-13 – **Stage 2 wiring**: wire hover highlight, drag a wire sideways to move it
  (connections stretch), click a wire → dot → drag to branch (T-junction). `lib/wires.ts`
  (`moveWire`, `nearestPointOnWire`), `components/CircuitCanvas.tsx`, new
  `tests/wires.test.ts` (14 checks, in `npm test`). Browser-tested in the editor with the
  bypass (restored): hover, move + stubs, branch + junction dot, lamp still lit, undo one step
  each, drag into a part refused. Only open Stage 2 item: start a wire from an empty grid point
  (owner's design didn't include it). Not committed (Stage 1 also still uncommitted).

- 2026-10-13 – **Stage 1 finished**: deleted `circuitjs1/` (gitlink + folder) and
  `public/circuitjs/` + unused template SVGs; renamed `KonvaTestCanvas` → `CircuitCanvas`
  (`git mv`); `layout.tsx` uses `metadata` (`metadataBase` = Vercel URL, siteName CirKit) +
  `viewport` exports instead of `<Head>`; generated share image `app/opengraph-image.tsx`
  (+ `twitter-image.tsx`); Firebase config → env vars (`.env.local`, `.env.example`,
  `.gitignore` allows the example); real README. Tests/tsc/lint/build pass; checked built meta
  tags + OG PNG, editor drag-drop with bypass (restored). **Not committed; Vercel env vars not
  set yet** (needed before deploying).

- 2026-10-13 – **Lessons (Stage 5)**: replaced the hard-coded placeholder lessons in the
  dashboard with a content system – `src/types/lesson.ts`, `src/content/lessons/*` (12 lessons,
  Levels 0–2), `src/lib/lessons.ts` (unlock + `checkChallenge`), `src/lib/progress.ts`,
  `src/components/lessons/*`, new route `src/app/learn/[lessonId]/page.tsx`, dashboard rewritten
  (levels, "Up next"). Small changes: `KonvaTestCanvas` `fitContainer` prop, `CircuitSidebar`
  `types` prop, `SimulationResult.pinNodes`. `tests/lessons.test.ts` (151 checks) added to
  `npm test`. Browser-tested with the auth bypass (restored): dashboard, read/quiz/challenge
  steps, live goals, finish → next lesson, redirect when logged out. **Not tested: saving
  points to Firestore while signed in** (needs the owner's account). Committed `abaffc2`
  (with the handoff docs + tests), pushed `editor-wiring` (first push of that branch) and
  `master`; Vercel deploy succeeded, live `/learn/*` checked 200. Gotcha: the live alias kept
  serving the old build for ~1 min after GitHub showed "Deployment has completed".
  `.claude/launch.json` left uncommitted on purpose (local preview config).

- 2026-10-13 – Catch-up session: ticked "Current-flow animation" in the Master Checklist (was
  done in `988a387` but unticked), refreshed its header. Added `.claude/launch.json` inside the
  repo (Claude Code preview `cirkit-dev` → `npm run dev`, port 3000; not committed). Checks
  green: 36 + 26 tests, tsc, lint. Dev server running locally. Nothing half-finished.

- 2026-10-12 – Created this handoff system: PROJECT_CONTEXT.md, AGENTS.md (with the "keep the
  handoff current" rule), CLAUDE.md, GEMINI.md, ../START_HERE.md; moved solver/unit tests into
  `tests/` with `npm test` (tsx dev dependency). Not committed yet. Nothing half-finished.
- 2026-10-11 – Current-flow animation + pulsing status dot (`988a387`), deployed to Vercel.
