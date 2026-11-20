# CirKit site review – 20 November 2026

Five independent reviewers (subagents) looked at the whole site, ticket by ticket, from 27
screenshots (laptop 1280 px, tablet 745 px, phone 375 px; local dev build of master `7bc43bf`)
plus the source code:

- **Code** – logic and implementation (bugs, data loss, security, performance)
- **Visual** – visual design and front-end (hierarchy, layout, consistency)
- **Ease** – ease of use (first-time users, kids 8–11, flows, wording)
- **Size** – affordance and click targets (what's clickable, sizes, WCAG 2.2 target size)
- **Colour** – colour theory and contrast (WCAG ratios, colour-blind safety, meaning)

**Status (22 Nov 2026): batches 1–5 applied; batches 6–7 open.**

Fixes below are suggestions with each reviewer's estimated score gain
(+n) and effort (S small / M medium / L large). File references are as of `7bc43bf`.

## Scorecard (out of 10)

| Ticket | Code | Visual | Ease | Size | Colour | **Average** |
|---|---|---|---|---|---|---|
| T1 Landing | 8.5 | 7.5 | 7 | 7.5 | 8 | **7.7** |
| T2 Sign-in dialogs | 6.5 | 8.5 | 5.5 | 7 | 6.5 | **6.8** |
| T3 Dashboard | 7.5 | 7 | 7.5 | 7.5 | 7.5 | **7.4** |
| T4 Lessons | 7.5 | 7.5 | 7 | 7 | 8 | **7.4** |
| T5 Circuit editor | 6.5 | 4 | 4.5 | 4.5 | 7 | **5.3** |
| T6 My Circuits | 7 | 7 | 8 | 5.5 | 7.5 | **7.0** |
| T7 Profile | 7.5 | 7.5 | 7.5 | 7.5 | 6 | **7.2** |
| T8 Kids mission map | 9 | 8.5 | 7 | 8.5 | 8 | **8.2** |
| T9 Kids circuit missions | 8 | 7 | 7 | 6 | 7.5 | **7.1** |
| T10 Kids code mission | 7 | 6 | 6.5 | 6 | 6.5 | **6.4** |
| T11 Feedback / 404 / info | 8 | 8 | 8 | 8 | 7 | **7.8** |
| T12 Site-wide (header, footer, nav) | 6.5 | 6.5 | 6.5 | 6.5 | 7 | **6.6** |
| **Overall** | | | | | | **7.1** |

## Fixes, grouped into batches (best gain for effort first)

### Batch 1 – Sign-up flow (T1, T2) · S–M · about +2.5
- Every signed-out "start" button (hero, "See all lessons", footer Lessons/Editor/My Circuits)
  goes to an account-only page → login box headed "Welcome back". Open **sign-up** instead,
  remembering the destination (`/?signup=1&next=…`); add "Free account needed to save your
  progress" under the hero buttons. (Ease)
- `handleSignup` never goes to `redirectAfterLogin` (app/page.tsx:99-133) → push it after sign-up. (Ease)
- When `next` is set, the login heading should be "Sign in to continue" (page.tsx:185). (Ease)
- Sign-in has no busy state (page.tsx:72/207); errors only as a 6 s toast → spinner + inline
  `role="alert"` error; backdrop click shouldn't discard typing (page.tsx:323). (Ease, Code)
- Sign-up partial failure: once the account exists, name/profile-doc steps must be non-fatal
  (page.tsx:109-122), else "Sign up failed" then "email already in use". (Code)
- `next=` loses the query string (AuthContext.tsx:82, profile:43) → include `location.search`. (Code)
- Sign-up doc writes stale fields (`xp: 1`, `totalLessons: 12`, client `createdAt`) → clean up. (Code)

### Batch 2 – Circuit editor safety and small screens (T5) · S · about +3
- **Data-loss bug:** after a failed load, Save/Ctrl+S creates a new empty circuit and replaces
  `?id=` (useCircuitSaving.ts:82/100, simulation/page.tsx:139/225) → return early while loading
  or when `savedSnapshot` is null; disable Save. (Code, high)
- Phones: below `md` show "The editor needs a bigger screen – try a tablet or computer" with a
  link to Lessons; don't send phone users to the editor from the landing CTA. (Visual, Ease)
- On-screen **Remove part** button in Properties (deleting needs the Delete key today,
  PropertiesPanel.tsx:79). (Ease)
- Toolbar: icons 36×32 with 2 px gaps and labels only from `xl` → min 40 px, `gap-1`, labels from
  `lg`; Clear gets a trash icon and moves away from Save (simulation/page.tsx:59,196-231). (Size, Ease)
- Zoom buttons 29×28 → `h-9 min-w-9` (CircuitCanvas.tsx:81); help "Hide" 16 px → `py-1.5 text-sm`. (Size)
- Canvas size hard-coded `innerWidth - 360` (CircuitCanvas.tsx:340) but panels are 560 px → use
  `fitContainer` (fixes "Fit", pan limits and the hidden strip under Properties). (Code, Ease)
- Plain-English save errors – no "Firestore security rules" (useCircuitSaving.ts:17, circuits/page.tsx:46). (Ease)
- Wheel/resize effect re-binds every pan/zoom frame (CircuitCanvas.tsx:398) → refs + stable deps. (Code)

### Batch 3 – Colour tokens and contrast (all tickets) · S · about +3 spread
- `--color-ink-faint` #8A959A → **#67727A** (placeholders, lesson numbers, "Empty circuit":
  3.07 → 4.92:1). (Colour)
- New `--color-line-input` **#7F8C9D** for input borders, option cards, tray/part buttons
  (1.77 / 1.32 → 3.42:1, Field.tsx:6). (Colour)
- Disabled buttons: drop 50 % opacity; `bg-line text-ink-muted` (2.15 → 4.48:1, Button.tsx:13);
  add a reason ("Change something to save", "Write a message first"). (Colour, Size)
- Focus outline in glow on ink/success surfaces (2.86 → 7.69:1, globals.css:87). (Colour)
- Default avatar #33A1FD → #1A66E8 (white "S" 2.74 → 5.11:1, UserAvatar.tsx:21); avatar presets
  bulb #F79824→#C2410C, battery #16A34A→#15803D, radio #0891B2→#0E7490 (lib/avatars.ts). (Colour)
- Stats tiles: one icon colour (`text-ink-muted`) instead of 5 hues (StatsPanel.tsx:33-42);
  completed path segments in `bg-success` (LessonPath, StepTrack.tsx:37). (Colour, Visual)

### Batch 4 – Kids mode (T8–T10) · S · about +5 spread
- Narrow screens: one-line **goal strip above the board** (title + first unmet goal); mission
  title visible at all widths (KidsTopBar.tsx:41). (Visual, Ease)
- Piece actions `size="sm"` (36 px) → `"lg"` (52 px) (CircuitMission.tsx:136-168); "Need a hint?"
  and a 48 px "← Missions" button instead of 20 px grey links. (Size)
- "Start again" wipes instantly with no undo → confirm "Start again? Your pieces go back in the
  box." Yes/No (or Undo). Same for lesson challenge reset (ChallengeStepView.tsx:105). (Ease)
- "No short circuit" goal is ticked before anything is built, and is jargon → hide until relevant
  or reword. (Ease)
- Blockly: event #8A6400 → ink #31393C; sound #7C3AED → #BE185D (motor/sound ΔE 1.6 for
  deuteranopes) (BlocklyEditor.tsx:13-17); `startScale` 0.9 → 1.15. (Colour, Size, Visual)
- Code step: mission card **first** below `lg`, sticky "Try it on the track"
  (kids/[missionId]/page.tsx:55-80); simpler brief ("Your car drives 20 cm every second. How many
  seconds should it drive?"). (Visual, Ease)
- Build step: "goes here" slots look tappable but are divs → real buttons; reposition for the new
  car; flatten the "Hub" label (BuildStep.tsx:92-108). (Size, Visual)
- KidsTopBar wraps on tablets (`flex-wrap`, KidsTopBar.tsx:38). (Visual)
- Play step "Your program" box shows 2 of 5 blocks → let it grow. (Visual, Ease)
- Tray empty parts `opacity-40` → `opacity-60` (2.18 → 3.59:1). (Colour)
- Phone tap areas: stud r 30 → 38, gap strip 52 → 70 (SnapBoard.tsx:106,124,144); flatten empty
  studs so only targets look tappable. (Size)
- Kids 404 (`app/kids/not-found.tsx`); move "Back to CirKit" to a "For grown-ups" footer link. (Ease)
- Nested empty `repeat` blocks can freeze the tab (program.ts:105-119) → cap work, add a test. (Code)

### Batch 5 – Site-wide polish (T12, T3, T6, T1) · S · about +3 spread
- Header/footer containers don't line up with pages (SiteHeader.tsx:102, SiteFooter.tsx:45) →
  `mx-auto max-w-6xl px-5 sm:px-8`. (Visual, +1)
- One wordmark component (header, footer, Kids). (Visual)
- Nav links 24 px tall → `px-3 py-2.5` (SiteHeader.tsx:113/118); quieter CirKit Kids button. (Size)
- One name for the learning page: **"Lessons"** everywhere (nav "Learn", "Your learning",
  "Learning dashboard"…). Feedback link in the mobile menu; Lessons link in the editor top bar. (Ease)
- `cardClass` adds the raised lip only when interactive (Card.tsx:13-22) – static stat tiles,
  level cards and teacher cards stop looking like buttons. (Size)
- Dashboard: 3 stat tiles instead of 6; "Open My Circuits" link is 16 px tall (StatsPanel.tsx:40);
  Try again button when progress fails. (Visual, Size, Ease)
- My Circuits: visible **Open** button; icon buttons 32 → 40 px; Delete spaced from Duplicate;
  drop "00:00" times (circuits/page.tsx:26,156-180). (Size, Visual)
- Landing: full-width hero buttons on phones; lesson chips are links or plainly flat
  (LandingSections.tsx:29-32,133). (Visual, Size)
- Retire `/play` and `/kidscircuit` (still built, reachable, off-system). (All)

### Batch 6 – Medium items · M
- Firestore rules: schema for `users/{uid}` (clients can set their own points today) and rate
  limiting / App Check for `feedback` (firestore.rules:13,21). (Code, +1.5)
- Security headers in next.config.ts. (Code)
- Import validation: `Object.hasOwn`, rotation/value checks, unique ids, tests (circuitStore.ts:42-58). (Code)
- Lessons: remember the step and passed steps within a lesson; error + retry instead of "locked"
  when progress fails to load (learn page:87). (Ease, Code)
- Kids: save stars per mission (localStorage) and show ✓ and stars on the map. (Ease)
- Editor on tablets: Properties as a bottom sheet, parts as an icon rail below `lg`. (Visual)
- Dashboard / WelcomeBack: count + `limit(3)` queries instead of downloading every circuit. (Code)
- Two-tab overwrite protection for circuits (rev check). (Code)

### Batch 7 – Large items · L
- **Touch support in the editor** and lesson build challenges (pointer events, one-finger pan,
  pinch zoom, tap-to-wire). Mouse-only today (CircuitCanvas.tsx:427,572,612,884,944) – likely
  broken on school tablets; confirm on a real iPad first. (Ease, +2.5)
- "Read to me" audio for Kids briefs and helper messages (speechSynthesis). (Ease)
- Illustrations for "How CirKit works", "For teachers" and lesson read steps. (Visual)
