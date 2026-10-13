# Instructions for AI assistants

Before doing anything in this repository, read **[PROJECT_CONTEXT.md](PROJECT_CONTEXT.md)** in full.
It holds everything you need: what CirKit is, how to run/test/deploy it, the code map, the
design decisions you must keep consistent, how the owner likes to work, the history so far,
and the current next steps.

Key rules (details in PROJECT_CONTEXT.md):
- Work on the `editor-wiring` branch; only commit or deploy when the owner asks.
- Before saying something works, run `npx tsc --noEmit`, `npm run lint`, `npm test`, and test in the browser.
- Don't create test data in the owner's Firebase account unless asked.
- Keep the owner's Master Checklist (`E:\Desketop\Obsidian\Placement\Circuit Project\Master Checklist.md`) up to date.

## Rule: keep the handoff current (always, without being asked)

The owner may switch to a new chat or a different tool **at any moment**, with no warning.
So after **every completed task or meaningful change** (not just at the end of a session),
before you reply to say you're done:

1. Add a short entry at the top of **§9 "Session log"** in PROJECT_CONTEXT.md:
   `- YYYY-MM-DD – what was done (1–3 lines), files touched, commit hash if any, anything left half-finished.`
2. Update **§8 "Current status & next steps"** if the status or the next steps changed.
3. If you made a new design decision, learned how the owner wants something done, or hit a
   gotcha, add it to the relevant section (§5 decisions, §6 working style).
4. If you're in the middle of something unfinished, say so in the log entry (what's done,
   what's left, which files) so the next chat can resume it.

Keep entries short and factual. The goal: a brand-new chat that reads PROJECT_CONTEXT.md can
continue exactly where the last one stopped.
