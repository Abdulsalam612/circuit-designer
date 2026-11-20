// Checks the editor's save rules and pan/zoom maths. Run with: npm test
import { canSave, describeLoadError, describeSaveError, hasUnsavedChanges } from '../src/components/editor/saveRules';
import { clampPan, fitView, zoomAt } from '../src/components/editor/view';

let fails = 0;
let count = 0;
const check = (name: string, ok: boolean, detail?: unknown) => {
  count++;
  if (!ok) { fails++; console.log('FAIL', name, detail ?? ''); }
};
const near = (a: number, b: number) => Math.abs(a - b) < 1e-9;

// Saving: never while loading or after a failed load (that once created an empty circuit
// and replaced ?id=), always after a successful load or for a new circuit
check('no save while loading', !canSave('loading', null));
check('no save after a failed load', !canSave('loadFailed', null));
check('no save with no snapshot', !canSave('new', null));
check('save a new circuit', canSave('new', '{}'));
check('save after load', canSave('saved', '{}'));
check('retry after a save error', canSave('error', '{}'));
check('queue while saving', canSave('saving', '{}'));

// Leave-page warning
check('no warning after a failed load', !hasUnsavedChanges('{"a":1}', null));
check('no warning when unchanged', !hasUnsavedChanges('{}', '{}'));
check('warning after an edit', hasUnsavedChanges('{"a":1}', '{}'));

// Messages stay plain English
for (const code of ['permission-denied', 'unavailable', 'internal', undefined]) {
  const messages = [describeSaveError({ code }), describeLoadError({ code })];
  check(`no jargon for ${code}`, messages.every(m => !/firestore|rules|permission/i.test(m)), messages);
}

// Panning stops at the grid edge
const view = { width: 800, height: 600 };
const extent = 2000;
check('pan inside is unchanged', JSON.stringify(clampPan({ x: 100, y: -50 }, 1, view, extent)) === JSON.stringify({ x: 100, y: -50 }));
const far = clampPan({ x: 5000, y: -5000 }, 1, view, extent);
check('pan clamps to grid edge', far.x === 2000 && far.y === 600 - 2000, far);
const tiny = clampPan({ x: 0, y: 0 }, 0.1, view, extent);
check('grid smaller than view is centred', tiny.x === 400 && tiny.y === 300, tiny);

// Fit centres the boxes and shows them all
check('fit with nothing', fitView([], view) === null);
const fit = fitView([{ x0: 0, y0: 0, x1: 400, y1: 100 }, { x0: 600, y0: 200, x1: 700, y1: 300 }], view)!;
check('fit scale', near(fit.scale, (800 - 96) / 700), fit);
check('fit centred x', near(fit.pos.x + 350 * fit.scale, 400), fit);
check('fit centred y', near(fit.pos.y + 150 * fit.scale, 300), fit);
const one = fitView([{ x0: 0, y0: 0, x1: 20, y1: 20 }], view)!;
check('fit caps zoom at 2x', one.scale === 2, one);

// Zoom keeps the point under the mouse still
const z = zoomAt({ x: 30, y: 40 }, 1, 2, { x: 200, y: 100 });
check('zoom scale', z.scale === 2, z);
check('zoom keeps point', near((200 - z.pos.x) / z.scale, 170) && near((100 - z.pos.y) / z.scale, 60), z);
check('zoom clamps', zoomAt({ x: 0, y: 0 }, 4.8, 2, { x: 0, y: 0 }).scale === 5);

console.log(fails === 0 ? `all ${count} editor checks passed` : `${fails} failures`);
if (fails > 0) process.exitCode = 1;
