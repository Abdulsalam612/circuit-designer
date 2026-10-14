# CirKit Kids – MVP design

Status: **in progress.** Agreed 14 Oct 2026; **changed to circuits first the same day** (owner:
"what you have done here is coding, not circuits"). Engine, the snap board and missions
"Make it go" (Part 1) and "Drive to the flag" (Part 2) are built.
Clickable mock-up (private, owner's account): https://claude.ai/artifact/EdKQje5512nQxEn2QCbVsA

## 1. Why

LEGO Education works because children **build a real thing, code it, and see the code make it
move**. The build gives the code meaning; the movement makes mistakes visible and fun.

CirKit already has the hard part, a real circuit simulator. CirKit is about **circuits**, so
CirKit Kids starts there, and code comes second:

> **Part 1: Build circuits.** Snap chunky pieces (battery, wires, motor, bulb, switch) onto a
> stud board. The real simulator decides what happens: the motor spins and the car drives only
> when the loop is complete.
>
> **Part 2: Code your machine.** Swap the switch for a hub port and tell it what to do with
> blocks: *Build it → Code it → Watch it go.*

Children learn electricity first (complete loops, switches, series batteries, turning the
battery round), then coding (steps in order, timing, loops, events) on top of circuits they
already understand.

## 2. Who it's for

- **Ages 8–11** (UK Key Stage 2) first. This is where the LEGO comparison is strongest and where
  schools already own BBC micro:bits (phase 2).
- Used on **school tablets and Chromebooks**: touch-first, 44 px+ targets, little reading.
- Teachers: missions map to clear learning goals; class view comes with Stage 6.

## 3. The MVP loop

### Part 1: a circuit mission ("Make it go")

| Step | What the child does | What they learn |
|---|---|---|
| **Pick a mission** | "Make it go": the car has a battery and a motor but nothing joins them | Purpose before tools |
| **Build** | Tap a piece in the tray, then tap where it goes: a wire on a glowing gap between two studs, a part (battery, motor, switch…) on the glowing stud its middle sits on. Tap a placed piece to rotate it, turn it around or take it off; tap a switch to flick it. | Parts, a complete loop |
| **Watch** | Nothing to press: the simulator runs on every change. Current dots flow, the motor spins, the car drives (backwards if the battery is turned round). Goals tick off with LEDs; a short circuit is explained, not just flagged. | Cause and effect, short circuits |

The snap board: studs 40 editor units apart; a wire spans one gap, a part spans two with its
middle stud covered; pieces whose ends meet on a stud connect (the editor's own rule), so a
board becomes a real `CircuitLayout`. The kids' battery is 4.5 V, so one battery runs the
motor at half speed and two in series at full speed. **"Faster!"** (built) starts from the
finished "Make it go" loop: take wires off, add a second battery (full speed) and a switch
(start/stop). A battery facing the wrong way cancels the other out, and the feedback says so.

### Part 2: a code mission ("Drive to the flag")

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
- Mission select in two parts. **Part 1 (circuits):** "Make it go" (complete loop), then
  "Faster!" (two batteries in series), "Lights on" (bulb + switch), "Backwards" (turn the
  battery round). **Part 2 (code):** "Drive to the flag" (sequence, timing), then
  "The blinking lighthouse" (repeat loop), "Make a doorbell tune" (events, buzzer).
- Snap board for circuit missions; workbench with Build / Code / Play for code missions.
- Block set (6–8 blocks): *When Go pressed* (hat), *Motor A forward [speed]*, *Motor A stop*,
  *Wait [s]*, *Light B on/off*, *Beep*, *Repeat [n]* (mission 2), *When button pressed*
  (mission 3).
- Stars per mission (saved to progress like lessons), "Look inside" circuit view.

**Out (later phases)**
- Free wiring with bendy wires and dragging (the full editor is the "graduate" path; the snap
  board is tap-to-place on purpose).
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

### Snap board (Part 1)
- `src/lib/kids/board.ts`: placement rules (`canPlace`, `placementFor`), `boardToLayout`
  (board → real circuit), goal checks (`motor-spins`, `lamp-lit`, `no-short`) and
  `kidsFeedback` (one plain sentence: no battery / short circuit / switch off / not a loop /
  flowing). Tested in `tests/kids-board.test.ts`.
- `src/components/kids/SnapBoard.tsx` (SVG board, every gap and piece a keyboard-reachable
  button) and `CircuitMission.tsx` (tray, piece actions, goals, feedback, car track).
- Circuit missions are data (`kind: 'circuit'`): board size, tray counts, start pieces
  (optionally `fixed`), goals.

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

1. **Engine** – motor + hub models, runner, tests (no UI). *Done.*
2. **Workbench** – `/kids` with Build / Code / Play for "Drive to the flag", Blockly themed. *Done.*
3. **Circuits first** – snap board + "Make it go" and "Faster!"; `/kids` split into Part 1 / Part 2. *Done.*
4. **More missions** – Part 1: "Lights on", "Backwards"; Part 2's build step
   becomes the snap board with a hub port in place of the switch; stars saved to progress;
   retire `/play`, `/kidscircuit`.
5. **Pitch build** – polish, a 60-second demo video (OpenMontage), teacher one-pager.
6. **Phase 2** – micro:bit: run the same blocks on real hardware.

## 7. Pitch notes

- One product from first bulb to real microcontroller: Kids (8–11) → lessons + editor
  (11+) → micro:bit.
- "Learn it safely on screen, then run it on the micro:bit your school already owns."
- Don't use "LEGO" in the product or marketing unless partnering (trademark); "inspired by
  how LEGO Education teaches" is fine in a pitch conversation.

## 8. Open questions

- Car physics: constant speed per % (simple, MVP) or acceleration (more realistic)?
- "End of program turns every port off" switches the light off at once in "Drive to the
  flag"; keep it (simple, safe) or leave ports as the program left them?
- Should older kids get free wiring, or hand over to the full editor?
- Audio narration for non-readers (ages 5–7, a later "Explore" tier)?
