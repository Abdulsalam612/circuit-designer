# CirKit Kids – MVP design

Status: **proposal, agreed direction 14 Oct 2026, nothing built yet.**
Clickable mock-up (private, owner's account): https://claude.ai/artifact/EdKQje5512nQxEn2QCbVsA

## 1. Why

LEGO Education works because children **build a real thing, code it, and see the code make it
move**. The build gives the code meaning; the movement makes mistakes visible and fun.

CirKit already has the hard part, a real circuit simulator. CirKit Kids puts that same loop on
a tablet:

> **Build it → Code it → Watch it go.**

Children learn electricity (a motor only runs in a complete, powered circuit) **and** coding
(steps in order, timing, loops, events, conditions) at the same time, and every program has a
visible result.

## 2. Who it's for

- **Ages 8–11** (UK Key Stage 2) first. This is where the LEGO comparison is strongest and where
  schools already own BBC micro:bits (phase 2).
- Used on **school tablets and Chromebooks**: touch-first, 44 px+ targets, little reading.
- Teachers: missions map to clear learning goals; class view comes with Stage 6.

## 3. The MVP loop (one mission end to end)

| Step | What the child does | What they learn |
|---|---|---|
| **Pick a mission** | "Drive to the flag": a story and one clear goal | Purpose before tools |
| **1. Build** | Tap parts from the parts box into slots on a car: battery, hub, motor, light. "Look inside" shows the real circuit. | Parts, power, the hub as a tiny computer |
| **2. Code** | Stack blocks under "When Go is pressed": *Motor A forward (50%)*, *Wait (2 s)*, *Light B on*, *Motor A stop*. − / + change values. | Sequence, timing, parameters |
| **3. Play** | Press Go: the car drives, the current block lights up, the hub panel shows motor/light state. Result: on the flag, not far enough, too far, or crashed. | Debugging, cause and effect |

The mock-up's mission is a real puzzle: the default program stops at 40 cm. The flag is at
80 cm, and at 50% the car goes 20 cm/s, so the child must work out "Wait 4 s".
Missing parts give a teaching failure ("The motor needs the battery and the hub").

## 4. MVP scope

**In**
- Route `/kids` (replaces today's `/play` + `/kidscircuit` placeholders, which are emoji
  mock-ups with no real simulation).
- Mission select + workbench with Build / Code / Play.
- **Mission 1 "Drive to the flag"** fully working, plus missions 2–3 if time allows:
  2 "The blinking lighthouse" (repeat loop), 3 "Make a doorbell tune" (events, buzzer).
- Block set (6–8 blocks): *When Go pressed* (hat), *Motor A forward [speed]*, *Motor A stop*,
  *Wait [s]*, *Light B on/off*, *Beep*, *Repeat [n]* (mission 2), *When button pressed*
  (mission 3).
- Stars per mission (saved to progress like lessons), "Look inside" circuit view.

**Out (later phases)**
- Drag-and-drop circuit building with wires (the full editor is the "graduate" path).
- Sensors and `if` (mission 4 "Stop before the river").
- Real hardware (BBC micro:bit over WebUSB/Web Bluetooth) – phase 2.
- Teacher class view, join codes – Stage 6.
- Free-play sandbox.

## 5. How it works (engineering)

### Parts and the hub
- New `ComponentType`s in `src/lib/components.ts` + solver models in `src/lib/simulation.ts`:
  - `motor`: a resistive load; reading gives current → **speed** (like lamp brightness).
  - `hub`: a battery-powered controller with **ports A/B**, each a switch the program
    opens/closes (and, for speed, a duty cycle / scaled output). Modelled as controlled
    switches + the existing battery model, so the circuit stays honest.
  - `buzzer`, later `button` and `lightSensor`.
- Kids builds are **fixed layouts with slots** per mission (data, like lesson challenge
  `start` layouts), so no wiring UI is needed; "Look inside" renders the layout with
  `CircuitThumbnail`-style drawing.

### Blocks
- **Google Blockly** (Apache-2.0, used by most kids' coding tools) with a custom CirKit
  theme (block colours from the design tokens, chunky touch sizes). The mock-up uses simple
  tap-to-add stacks; Blockly gives drag, nesting (repeat) and accessibility for free.
- Programs are stored as JSON (Blockly serialisation), never as code to `eval`.

### Program runner
- `src/lib/kids/runner.ts`: steps the block program on a fixed tick (e.g. 50 ms):
  instant blocks change hub port states; `wait` holds; `repeat` loops.
- Each tick: apply port states to the layout → `simulate()` → motor speed from its reading
  → move the scene (car distance integrates speed). Pure functions, unit-tested with `tsx`
  like the solver (`tests/kids.test.ts`): "default program stops at 40 cm", "wait 4 s
  stops in the flag zone", "no motor → no movement".

### Missions as content
- `src/content/kids/missions/*.ts` (same idea as `src/content/lessons`): story text, build
  slots/layout, allowed blocks, starting program, scene, and **goals checked by the runner**
  (e.g. `{ kind: 'distance', min: 72, max: 88 }`, `{ kind: 'blinks', count: 5 }`).
- Progress: `kidsMissions: { [id]: stars }` on `users/{uid}`; same rules and transaction
  pattern as `completeLesson`.

### Design
- CirKit design system (§5.8 in PROJECT_CONTEXT): same tokens, bigger and rounder for kids
  (radius 14–24, 52–64 px buttons), block colours by kind, Unbounded headings, Lexend body.
- Accessibility: every block and part is a real button; values change with − / + (no tiny
  sliders); results are announced (`role=status`); reduced motion respected.

## 6. Milestones

1. **Engine** – motor + hub models, runner, tests (no UI). *Proves the idea is real.*
2. **Workbench** – `/kids` with Build / Code / Play for mission 1, Blockly themed.
3. **Missions 2–3** + stars saved to progress; retire `/play`, `/kidscircuit`.
4. **Pitch build** – polish, a 60-second demo video (OpenMontage), teacher one-pager.
5. **Phase 2** – micro:bit: run the same blocks on real hardware.

## 7. Pitch notes

- One product from first bulb to real microcontroller: Kids (8–11) → lessons + editor
  (11+) → micro:bit.
- "Learn it safely on screen, then run it on the micro:bit your school already owns."
- Don't use "LEGO" in the product or marketing unless partnering (trademark); "inspired by
  how LEGO Education teaches" is fine in a pitch conversation.

## 8. Open questions

- Car physics: constant speed per % (simple, MVP) or acceleration (more realistic)?
- Should the build step become drag-and-drop with real wires for older kids, or hand over to
  the full editor?
- Audio narration for non-readers (ages 5–7, a later "Explore" tier)?
