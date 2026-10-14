# CirKit – Project Context (handoff for AI assistants)

> **Read this whole file before doing anything.** It is the shared memory for this project:
> what it is, how it's built, every important decision and why, how the owner likes to
> work, and exactly where things were left. **Keep it updated after every task** (§8 status + a §9 session log entry, see AGENTS.md) so any new chat can pick up seamlessly.

Last updated: 14 Oct 2026

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
| **Launch video** (OpenMontage, separate repo, AGPL – not part of CirKit) | `E:\Desketop\Circuit Designer\OpenMontage\projects\cirkit-learn-by-building\` – final in `renders/export/` (78.6s MP4, SRT, thumbnails, YouTube copy); publish stage awaiting owner approval, nothing uploaded |
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
npm test             # solver, unit-parser and lesson checks (tsx): expect "all 41 solver checks passed", "all 26 unit checks passed", "all 155 lesson checks passed", "all 14 wire checks passed"
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
Carrot `#F79824`. Fonts (since 14 Oct 2026): **Unbounded** (headings) + **Lexend** (body) via
`next/font`, see §5.8.

**React and react-dom must always be the exact same version** (an `npm audit fix` once bumped
only `react` → would break at runtime).

---

## 4. Code map

### Pages (`src/app/`)
| Route | File | Notes |
|---|---|---|
| `/` | `page.tsx` | Landing page (sections in `components/landing/`, redesigned 14 Oct 2026) + login/signup/password-reset modals (Firebase). **Signed in:** shows `WelcomeBack` (recent circuits, New circuit, Continue learning) instead of the hero. Opens the login modal when visited as `/?login=1&next=/path`, the signup modal for `/?signup=1`. |
| `/simulation` | `simulation/page.tsx` | **The circuit editor.** Owns the circuit state (undo history), saving, header toolbar, Properties panel, Simulation panel. Loads a circuit from `?id=`. Protected. |
| `/circuits` | `circuits/page.tsx` | "My Circuits": open, rename, duplicate, delete. Back button → `/`. Protected. |
| `/dashboard` | `dashboard/page.tsx` | "Your learning" (redesigned 14 Oct 2026): "Up next" ink card, `StatsPanel`, the course as one panel per level with `LessonPath` (lessons as LEDs on a wire). The placeholder Guides tab and dead Quick actions were removed. Protected. |
| `/profile` | `profile/page.tsx` | **Profile & settings**: overview (avatar, name, email, join date, level/points/lessons), name + preset avatar (saved together), email (verified badge, send verification, change via `verifyBeforeUpdateEmail`), password change, delete account (password in a `ConfirmDialog`). Email/password/delete ask for the current password every time (re-auth). Own login guard (not `useRequireAuth`) so deleting lands on `/`, not the login box. Protected. |
| `/about`, `/privacy`, `/terms` | `about/`, `privacy/`, `terms/page.tsx` | Server components with `metadata` titles, laid out by `InfoPage`. **Privacy must stay true to the code** (no analytics/tracking cookies; Firebase + Vercel are the only processors; self-service delete) – update it if that changes. Owner is **UK-based**; contact email `abdulsalam.sami01@gmail.com` (`CONTACT_EMAIL` in `SiteFooter.tsx`); Terms governed by England & Wales law; Privacy has controller, lawful basis, UK GDPR rights + ICO. Not lawyer-reviewed. |
| `/feedback` | `feedback/page.tsx` | Public feedback form: type (bug/idea/question/other, `?type=`), message (≤2000), optional email (prefilled when signed in), bug reports can include browser + page (`?from=`, same-site paths only; the error page links here). Honeypot field. Saves to Firestore `feedback` via `lib/feedback.ts`; `feedback` rules **published by the owner 14 Oct 2026** (real send confirmed). Owner reads feedback in the Firebase console. |
| `/learn/[lessonId]` | `learn/[lessonId]/page.tsx` | **Lesson viewer** (redesigned 14 Oct 2026: sticky bar with LevelBadge + `StepTrack`, lit-LED "Lesson complete" screen): steps one at a time (read → quiz → build challenge), Next is locked until a quiz is all correct / a challenge's goals are met; Finish saves completion + points; locked lessons show a message. Protected. |
| (404) | `not-found.tsx` | "Open circuit!" page (broken-wire picture, Home/Lessons/Editor). Real 404 status, tab title via React 19 `<title>`. |
| (crash) | `error.tsx`, `global-error.tsx` | `error.tsx`: "Short circuit!" with Try again (`reset`) / Go home, inside the normal layout. `global-error.tsx`: self-contained fallback if the root layout itself crashes (production only; dev shows Next's overlay). |
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
- `ui/` – **design system components** (§5.8): `Button` (variants primary/secondary/glow/
  ghost/danger, sizes sm/md/lg, `href` → Link; `buttonClass()`), `Card` (`card`/`panel`/`ink`/
  `glow`, `interactive`; `cardClass()`), `Badge` (tones), `LevelBadge` (resistor colour code),
  `StatusLed` (done/active/warning/off), `Field` + `inputClass`, `typography.ts` (`heading.*`,
  `text.*`). Style guide: `/design` (`app/design/page.tsx`, development only – 404 in production).
- `landing/` – home page: `LandingSections.tsx` (`Hero`, `HowItWorks`, `Course`, `ForSchools`,
  `FinalCallToAction`; **only true claims** – counts come from the lesson files, unbuilt
  features listed as "In development"), `LiveCircuit.tsx` (hero: a real circuit solved by
  `simulate()`, editor icons + hand-drawn switch, current dots, switch/resistor controls, live
  readout), `heroCircuit.ts` (its layout; checked in `tests/simulation.test.ts`).
- `WelcomeBack.tsx` – signed-in home panel (restyled with the design system).
- `SiteFooter.tsx` – shared footer (landing + info pages): Product / CirKit / Help & legal
  columns, only real links; exports `GITHUB_URL`, `ISSUES_URL`. `InfoPage.tsx` – layout for
  text pages (header, title band, plain h2/p/ul styled via `[&_h2]:` selectors, footer).
- `StatsPanel.tsx` – dashboard stats tiles: lessons, quizzes passed, challenges solved,
  circuits saved, points, time learning. Only real data (replaced the fake "streak" and
  "Level 1 · 50 pts to next level" cards); streaks/levels come back with Stage 6.
- `UserAvatar.tsx` – preset avatar (`lib/avatars.ts`: 8 electronics icons on brand colours,
  ids stored as `avatar` on `users/{uid}` – never rename) or initials on blue.
- `StatusPage.tsx` – shared layout for the 404/error pages (SiteHeader + inline SVG circuit:
  `open` = loose wire ends drawn like the editor's hollow markers, `spark` = short circuit).
- `ConfirmDialog.tsx` – styled replacement for `confirm()` (controlled; Esc/backdrop cancel,
  Cancel focused first; `danger` = red button). Used for Delete on My Circuits.
- `SiteHeader.tsx` – **shared top bar** for home, dashboard, My Circuits and lessons (not the
  editor or kids mode, which keep their own toolbars): logo → `/`, Learn / Circuit Editor /
  My Circuits (signed in only, active link blue), CirKit Kids, account dropdown (initials
  avatar, name/email, links, Log out → `/`), mobile hamburger menu below `md`. Props:
  `sectionLinks` (landing page `#features`/`#education`), `onSignIn`/`onSignUp` (landing opens
  its modals; elsewhere → `/?login=1` / `/?signup=1`), `sticky` (off on lessons, whose own bar sticks).
- `lessons/StepTrack.tsx` – the lesson's steps as icon nodes on a wire in the lesson bar
  (passed = green, current = glowing yellow, upcoming = unlit; wire powered up to current).
- `lessons/LessonPath.tsx` – a level's lessons on a "wire": StatusLed per lesson (done/up next/
  locked), wire segment between two finished lessons is blue ("powered"). Replaced `LessonCard`.
- `lessons/` – `ReadStepView` (renders content blocks), `QuizStepView`, `ChallengeStepView`
  (a mini editor: canvas with `fitContainer`, sidebar limited to the challenge's parts,
  Properties, Run, undo/redo/start again, goal checklist, hints), `ProgressBar`,
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
- `context/ToastContext.tsx` – **toasts**: `ToastProvider` (in `layout.tsx`) + `useToast()` →
  `.success/.error/.info(message)`. Bottom right (bottom centre on phones), auto-dismiss
  3.5/4/6 s (paused on hover), max 4, `role=alert` for errors. **Never use `alert()`** – use this.
- `lib/authErrors.ts` – `friendlyAuthError(error, fallback)`: Firebase Auth codes → plain English.
- `lib/account.ts` – `saveProfile` (Auth displayName + `users/{uid}` name/avatar),
  `sendVerification`, `changeEmail`, `changePassword`, `deleteAccount` (re-auth → delete
  `circuits/*` in batches → user doc → Auth user). `lib/authErrors.ts` also has
  `friendlyAccountError` (wrong current password etc.).
- `context/AuthContext.tsx` – `useAuth` (now also **`profile`**: live `{name, avatar}` from
  `users/{uid}` via `onSnapshot`, used by the header; also copies a changed sign-in email onto
  the doc), and **`useRequireAuth`** (redirects logged-out users
  to `/?login=1&next=<path>`; used by every protected page).
- `firebase.ts` – Firebase init (`auth`, `firestore`).
- `types/lesson.ts` – `Lesson`, steps (`read` / `quiz` / `challenge`), content blocks, `ChallengeGoal`.
- `content/lessons/` – **the course**: one file per lesson + `index.ts` (`LEVELS`, ordered `LESSONS`).
- `lib/lessons.ts` – `getLesson`, `lessonState` (unlock rule), `nextLesson`, `lessonAfter`,
  **`checkChallenge`** (runs `simulate()` and judges each goal, incl. series/parallel detection),
  **`learningStats`** (lessons/quizzes/challenges done + minutes, from completed lesson ids).
- `lib/progress.ts` – `loadProgress`, `completeLesson` (Firestore transaction, awards points once).

### Tests (`tests/`)
`simulation.test.ts` (36 checks: divider, LED+resistor, overload, reversed LED, short, open
switch, capacitor/inductor at DC, series batteries, ground, parallel lamps, two LEDs, weak
battery, wire currents…), `units.test.ts` (26 parse/format checks) and `lessons.test.ts` (155:
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

### 5.8 Design system ("playful but credible", owner-approved 14 Oct 2026)
- Made with the `frontend-design` skill after a critique found the site dated (Arial, generic
  template look, made-up landing claims). Tokens live in `globals.css` `@theme`; **use token
  classes, never raw hex**: `text-ink`/`text-ink-muted`, `bg-paper` (+ `.bg-grid` 20 px
  engineering grid, same as the editor), `bg-surface`, `border-line`, `bg-signal` (buttons/links;
  `#1A66E8`, a deeper brand blue so white text passes 5.1:1), `bg-glow` (Sunglow, always ink
  text), `bg-carrot` (ink text) / `text-carrot-ink`, `success`, `danger`, `brand`/`celestial`
  (large shapes/icons only). Contrast checked for every pairing (AA).
- Type: `font-display` Unbounded for h1/h2 (tight tracking), `font-sans` Lexend for the rest
  (designed for easier reading – a selling point for schools). `.tabular` for readings instead
  of monospace. Scale in `ui/typography.ts`.
- Principles: tactile (buttons/cards sit on a solid 2–3 px lip and press down), corners grow with
  size (chip 6 / control 10 / card 14 / panel 22), electronics vocabulary as real structure
  (resistor-colour-code level badges, LED status dots), one bold moment per page, sentence case,
  no ALL-CAPS labels, no "→" in button text, motion only on load/interaction, reduced motion
  respected, `:focus-visible` outline everywhere.
- Gotcha: global element styles (body, h1–h3, `:focus-visible`) live in `@layer base` in
  globals.css; unlayered CSS beats every Tailwind utility (e.g. it broke `truncate`).
- Gotcha: `next/font` variables must be on `<html>` (the `@theme` tokens are defined on `:root`);
  on `<body>` the fonts silently fall back to system-ui.
- Rollout: pages still use their old ad-hoc classes until restyled (landing first).

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
- **Windows shell gotchas:** in Git Bash, `ffmpeg`/`ffprobe` (winget install) aren't on PATH –
  run media commands in PowerShell after refreshing PATH:
  `$env:Path = [Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [Environment]::GetEnvironmentVariable("Path","User")`.
  Stop the dev server before `npm run build` (shared `.next/`). `.env.local` (Firebase vars)
  exists locally and is gitignored; never commit it.
- Commits: one commit per logical stage; the owner says "commit/push/deploy" explicitly. After
  deploying, verify the live site really serves the new build (the Vercel alias can lag ~1 min
  after "Deployment has completed").
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
- **14 Oct 2026, Stage 7 website (with Claude), all deployed (master = `a04b4e9`):**
  `3bffa54` shared navbar, toasts, 404/error pages · `a267821` profile & settings ·
  `c2b0479` About/Privacy/Terms + footer · `89f329d` feedback form (+ `feedback` Firestore
  rules, published) · `feb44e0` dashboard stats panel · `a04b4e9` "Up next" phone fix.
- **13–14 Oct 2026 (with Claude):**
  - `abaffc2` Lessons: 12 lessons (Levels 0–2), `/learn/[lessonId]` viewer, quizzes, simulator-checked
    build challenges, dashboard from content files; handoff docs + tests committed. **Deployed.**
  - `977955a` Stage 1 clean-up: Firebase config → env vars (set in Vercel), metadata/OG image,
    README, CircuitJS removed, canvas renamed `CircuitCanvas`. **Deployed.**
  - `ec092fd` Wire editing: hover highlight, drag to move, branch from mid-wire. **Deployed**
    (master = `ec092fd`).
  - Launch video made with OpenMontage (outside the repo; see "Where everything lives").
- The owner's account has a saved circuit **"Lamp test circuit"** (battery, switch, lamp);
  its switch is currently **Open** (owner toggled it) – that's why it shows no flow.

---

## 8. Current status & next steps

**Done:** Stages 0, 1 (clean-up), 2 (editor, incl. wire hover/move/branch), 3 (save/load),
most of 4 (simulation first version), and Stage 5 first version (12 lessons, Levels 0–2) –
**all deployed** (master = editor-wiring = `ec092fd`, 14 Oct 2026). The 6
`NEXT_PUBLIC_FIREBASE_*` vars are set in Vercel (Production + `editor-wiring` preview) and
verified live (config inlined, login redirect works, no console errors). Only open Stage 2
item: starting a wire from an empty grid point (optional). See the Master Checklist.

**Current focus (14 Oct 2026): visual redesign** of the website. Critique done; direction
"playful but credible" approved; design system committed (`e0c8852`); **landing page
redesigned (`7d0c63b`); **dashboard redesigned (`f6719b4`); **lesson pages redesigned**
(not committed). Next: profile, My Circuits, editor chrome (also the challenge workbench's
sidebar/Properties/zoom), auth modals, kids mode, footer. Known: `/play` overflows by ~20 px on phones (pre-existing).

**Suggested next steps (in order):**
1. **Website (Stage 7) – the owner's chosen next focus (14 Oct 2026).** Shared navbar and
   toasts, 404/error pages committed (`3bffa54`, not pushed); **profile page committed (`a267821`, owner tested it signed in – all works). About/Privacy/
   Terms pages + shared footer committed (`c2b0479`). Feedback form committed (`89f329d`). Stats
   panel committed (`feb44e0`), "Up next" phone fix `a04b4e9`. **All of Stage 7 deployed
   14 Oct 2026 (master = editor-wiring = `a04b4e9`).** **Stage 7 is then complete** except the optional items
   (Google sign-in, light/dark theme). Next (owner to choose): Stage 5 follow-ups /
   Stage 6 gamification (real streaks + level-up would feed the stats panel). Older notes: About/Contact/Terms/Privacy,
   feedback form, dashboard stats panel.
2. Stage 5 follow-ups: Guides tab was removed in the redesign (bring guides back as real
   content later, if wanted); level-up from XP (`level` never
   changes, card says "50 pts to next level"); remove `totalLessons` from signup; more levels.
   Owner hasn't yet tried a lesson signed in on the live site (first real points write).
3. **Hook kids mode** (`/kidscircuit`) to the real simulator, or rebuild it on the editor.
4. Simulation extras: capacitor/inductor transients, voltage colouring on wires, optional
   "start a wire from an empty grid point".
5. Gamification/classroom (Stage 6) and pitch (Stage 8: pitch deck, Spark/LEGO Education).
   Launch video is done (see "Where everything lives"); its publish package awaits the owner.

---

## 9. Session log (newest first)

> Rule (see AGENTS.md): after every completed task, add one short entry here and update §8.

- 2026-10-14 – Committed the dashboard (`f6719b4`). **Lesson pages redesign**: lesson bar with
  LevelBadge + new `StepTrack`; Badge for step kind; reading steps (larger body text, tokenised
  callouts with sr-only labels, ink formula card in the display font, part cards, table);
  quiz (tactile options with a radio dot, success/danger marking, `Button`); challenge (panel
  workbench, Run = glow button, goal LEDs off/warning/done, glowing "Challenge complete",
  tokenised hints); lit-LED completion screen; locked/not-found states. Fixed: global base
  styles moved into `@layer base` (they overrode `truncate`). Browser-tested with TEMP fake
  user + stubbed `completeLesson` (restored, no Firebase writes): read → read → quiz (wrong then
  right) → finish screen (+60 points); challenge goals + Run; 375 px header one line. Not
  checked visually: the solved "Challenge complete" card. tsc/lint/tests pass. Not committed.

- 2026-10-14 – Committed the landing page (`7d0c63b`). **Dashboard redesign**: rewrote
  `dashboard/page.tsx` ("Your learning" + editor button, Up next ink card with LevelBadge
  `onDark`, StatsPanel, one panel per level with progress bar and new `LessonPath`); removed the
  placeholder Guides tab (it awarded points for nothing) and dead Quick actions; deleted
  `LessonCard.tsx`; `ProgressBar`, `StatsPanel` moved to tokens; tokenised loading/error state.
  Browser-tested at 1100 and 375 px with TEMP fake user (5 lessons done; restored): states,
  powered wire, links (6 open, 6 locked), screen-reader labels, no sideways scroll.
  tsc/lint/tests pass. Not committed.

- 2026-10-14 – Committed the design system (`e0c8852`). **Landing page redesign**: new
  `components/landing/` (Hero with live simulated circuit, How it works on a "wire", Course
  from the real lesson data with resistor-code level badges, For teachers and schools – ready
  now vs in development, final CTA); removed the made-up stats/claims, old hero art,
  scroll-reveal code and styled-jsx (page.tsx 1044 → 510 lines); header links "How it works" /
  "For schools"; modals use the shared `animate-pop-in`; `WelcomeBack` restyled; hero heading
  size tuned. +5 solver checks for the hero circuit (lit 20.6 mA / dim 1 kΩ / overload 100 Ω /
  open). Browser-tested at 1366 and 375 px: switch by mouse and keyboard, toggle button,
  resistor choices, readout, overload outline, no sideways scroll, login/signup modals, signed-in
  home (TEMP fake user, restored). tsc/lint/tests pass. Not committed.

- 2026-10-14 – **Design system** (owner installed `frontend-design`; direction "playful but
  credible"): tokens in `globals.css` (`@theme`, `.bg-grid`, `.tabular`, focus ring, LED
  animation; removed the Arial override and the starter dark-mode block), fonts Unbounded +
  Lexend in `layout.tsx` (on `<html>` – see §5.8 gotcha), `components/ui/*` (Button, Card,
  Badge, LevelBadge, StatusLed, Field, typography), style guide `/design` (dev only). Contrast
  computed for all pairings (success darkened to `#127436`). Checked in the browser: fonts load,
  style guide renders; no new sideways overflow on /, /about, /feedback, /dashboard, /profile
  at 1366/375 px, editor toolbar still one line (TEMP fake user, restored). tsc/lint/tests pass.
  Existing pages now render in Lexend but aren't restyled yet. Not committed.

- 2026-10-14 – **Visual redesign started (owner: UI looks dated/placeholder).** Recommended
  Anthropic's `frontend-design` plugin (owner to install via the card; not installed yet) +
  the enabled Design plugin. Ran a design critique of landing, signed-in home, dashboard,
  lesson, editor, kids page (TEMP fake user, restored). Key findings: landing has **made-up
  claims** (50,000+ users, 1,000+ schools, 100+ lessons, 98% satisfaction, "Curriculum
  aligned", "multi-user", learning paths "Advanced Components"/"Digital Logic"); hero art is a
  placeholder box; whole site renders in **Arial** (globals.css `body { font-family: Arial }`
  overrides the loaded Geist); white text on Carrot 2.2:1 / Celestial 2.7:1 / Sunglow 1.5:1
  fails contrast; no shared button/card styles. Nothing changed in code yet.

- 2026-10-14 – **Deployed Stage 7.** Committed the "Up next" fix (`a04b4e9`); tsc, 231 tests
  and `npm run build` passed; fast-forwarded `master` to `a04b4e9` and pushed both branches.
  Vercel: "Deployment has completed". Live checks: `/`, `/about`, `/privacy`, `/terms`,
  `/feedback`, `/profile`, `/dashboard` 200, unknown path 404, new About title + footer
  served, `/profile` logged out → login modal, no console errors. This doc update is not
  committed yet.

- 2026-10-14 – Committed the stats panel as `feb44e0`. Fixed the dashboard "Up next" banner on
  phones (title was cut to "Capa…"): title wraps up to 2 lines, "Continue"/"Start" label hidden
  below `sm` (arrow only), tighter padding. `dashboard/page.tsx` only. Tested at 375 px with the
  longest title (2 lines, fully shown, no sideways scroll) and 1366 px (unchanged: one line +
  "Continue"), using TEMP fake user/progress (restored). Not committed.

- 2026-10-14 – Committed the feedback form as `89f329d`. **Stage 7: dashboard stats panel** –
  `components/StatsPanel.tsx`, `learningStats` in `lib/lessons.ts` (+4 checks in
  `tests/lessons.test.ts`, 231 total), `dashboard/page.tsx` (old 4 cards → panel; loads the
  circuit count via `listCircuits`, "–" if it fails). Tested with TEMP fake user/progress/
  circuits (backed up/restored, no "TEMP" left): values cross-checked against the lesson files
  (5 lessons → 5/11 quizzes, 2/6 challenges, 53 min), 6 columns desktop / 2 on phones, refused
  circuit read shows "–". tsc/lint/tests pass. Not committed.

- 2026-10-14 – Owner published the new `firestore.rules`. Sent one real message from the
  local `/feedback` (type "other", signed out, no email, text starts "TEST from Claude…") –
  Firestore accepted it. It's in the `feedback` collection; owner can delete it.

- 2026-10-14 – Committed About/Privacy/Terms as `c2b0479`. **Stage 7: feedback form** –
  `app/feedback/page.tsx`, `lib/feedback.ts`, `firestore.rules` (`feedback/{id}`: create-only
  for anyone, field/size/type/timestamp/uid checks; no reads). Links: footer "Report a problem"
  + "Send feedback", account menu, error page "Report this problem" (`?type=bug&from=`), About;
  Privacy gains "If you send feedback". Tested: a real send is refused with permission-denied
  (rules not yet published → nothing written) and the form shows the email fallback; then with
  a TEMP stubbed send + fake user (backed up/restored, no "TEMP" left): payloads match the rules,
  details toggle, honeypot, prefill, bad `?type`/`?from` ignored, 375 px. Build passes. **Owner
  must publish `firestore.rules`**, then send one real message to confirm. Not committed.

- 2026-10-14 – Owner: based in the UK, contact email abdulsalam.sami01@gmail.com. Added to
  footer ("Contact" mailto), About, Privacy ("Who we are" controller, lawful basis, UK GDPR
  rights, ICO complaint link) and Terms ("Law": England and Wales). Committed with the
  About/Privacy/Terms pages.

- 2026-10-14 – Committed the profile page as `a267821` (owner tested signed in: all works).
  **Stage 7: About / Privacy / Terms** – `app/about`, `app/privacy`, `app/terms`,
  `components/InfoPage.tsx`, `components/SiteFooter.tsx` (landing's footer replaced: dead `#`
  links gone, © year dynamic); signup box Terms/Privacy links → `/terms`, `/privacy` (new tab);
  header shows "About" to signed-out visitors. Checked every internal link (200), external
  policy links (200), titles, 375 px. Owner to review the wording (esp. Privacy "Children" and
  Terms "Responsibility"; contact is GitHub Issues). tsc/lint/227 tests pass. Not committed.

- 2026-10-14 – **Stage 7: profile & settings page** `/profile` – `app/profile/page.tsx`,
  `lib/account.ts`, `lib/avatars.ts`, `components/UserAvatar.tsx`; `AuthContext` gains live
  `profile`; `SiteHeader` shows avatar/name from it + "Profile & settings" link (mobile:
  "Profile"); `ConfirmDialog` gains `children` + `confirmDisabled`. Avatars are presets, not
  uploads (no Firebase Storage needed). Tested with TEMP stubs in AuthContext/account/progress
  (backed up to the scratchpad and restored; no "TEMP" left, no Firebase calls): save
  name+avatar → header updates live, validation, wrong/right password for password/email/
  delete, same-email check, verification toast, delete → `/` + toast, Esc/disabled states,
  375 px. **Not tested against real Firebase** (owner to try). tsc/lint/227 tests pass.
  Earlier the same day: committed navbar/toasts/404 as `3bffa54` (not pushed).

- 2026-10-14 – **Stage 7: 404 and error pages** – `app/not-found.tsx`, `app/error.tsx`,
  `app/global-error.tsx`, `components/StatusPage.tsx`. Tested: unknown URL → 404 status +
  page + tab title, desktop and 375 px; a TEMP crashing route (deleted) → error page under the
  header, Try again re-renders, Go home works. `global-error` only compiled (`npm run build`
  passes), not triggered. Gotcha: `globals.css` still darkens `<body>` in OS dark mode
  (create-next-app leftover) – pages must set their own opaque background. tsc/lint/227 tests
  pass. Not committed.

- 2026-10-14 – **Stage 7: toasts** – `context/ToastContext.tsx` (provider in `layout.tsx`),
  `components/ConfirmDialog.tsx`, `lib/authErrors.ts`, `pop-in` animation in `globals.css`.
  All 5 `alert()`s gone (login/signup errors → friendly toasts, success toasts for sign in /
  sign up / log out); My Circuits: Delete uses the dialog, rename/duplicate/delete show
  success/error toasts. Also fixed: modal backdrops were solid black (`bg-opacity-*` doesn't
  exist in Tailwind 4 → `bg-black/50`); removed the signup `console.error` (it flagged normal
  mistakes as dev-overlay issues). Tested: one failed login + one 3-char-password signup
  (Firebase rejects both, nothing created), and with TEMP fake user + in-memory circuits
  (reverted, `git diff` clean for those files): dialog Esc/backdrop/Cancel/Delete, error toast,
  logout toast survives navigation, auto-dismiss, 375 px layout; fresh tab has no console
  errors. tsc/lint/227 tests pass. Not committed.

- 2026-10-14 – **Stage 7: shared navbar** `src/components/SiteHeader.tsx` (account dropdown,
  mobile hamburger, responsive logo, active link) replaces the separate headers on `/`,
  `/dashboard`, `/circuits`, `/learn/[id]` (page titles moved into the page bodies; landing's
  broken "About" anchor dropped; `/?signup=1` opens signup). tsc/lint/227 tests pass.
  Browser-tested at 1366 px and 375 px, signed out and with a TEMP fake user in
  `AuthContext` + `loadProgress` (reads only, no writes; reverted, `git diff` clean for those
  files): modals, dropdown open/close (outside click, Esc, links), navigation, lesson bar still
  sticky, no horizontal scroll, Log out → `/`, logged-out redirect still works. Not committed.

- 2026-10-14 – Committed and deployed Stage 1 (`977955a`) and Stage 2 wiring (`ec092fd`);
  tests (227 checks), tsc, lint, build all passed first. master fast-forwarded and pushed;
  Vercel deploy succeeded; live site verified (new /opengraph-image 200, Firebase config from
  Vercel env vars present, /dashboard redirects to login, no console errors). This doc update
  is not committed yet.

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
