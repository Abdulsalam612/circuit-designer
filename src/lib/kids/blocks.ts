import type { Block, BlockType } from '@/types/kids';

// Converts between our programs (Block[]) and Blockly's saved-workspace JSON. Pure data, no
// Blockly import, so it runs in tests and on the server. The Blockly block definitions that
// match these type names live in components/kids/BlocklyEditor.tsx.

export const BLOCKLY_TYPE: Record<BlockType, string> = {
  motorOn: 'kids_motor_on',
  motorOff: 'kids_motor_off',
  lightOn: 'kids_light_on',
  lightOff: 'kids_light_off',
  wait: 'kids_wait',
  beep: 'kids_beep',
  repeat: 'kids_repeat',
};
export const HAT_TYPE = 'kids_when_go';

const FROM_BLOCKLY = Object.fromEntries(
  Object.entries(BLOCKLY_TYPE).map(([ours, theirs]) => [theirs, ours as BlockType]),
) as Record<string, BlockType>;

// Just the parts of Blockly's JSON format we read and write
export interface SavedBlock {
  type: string;
  id?: string;
  x?: number;
  y?: number;
  deletable?: boolean;
  enabled?: boolean;
  disabledReasons?: string[];
  fields?: Record<string, string | number>;
  inputs?: Record<string, { block?: SavedBlock }>;
  next?: { block?: SavedBlock };
}
export interface SavedWorkspace {
  blocks?: { languageVersion: number; blocks: SavedBlock[] };
}

// ---- Block[] -> Blockly ----

const toSaved = (block: Block): SavedBlock => {
  const type = BLOCKLY_TYPE[block.type];
  switch (block.type) {
    case 'motorOn': return { type, fields: { PORT: block.port, SPEED: String(block.speed) } };
    case 'motorOff':
    case 'lightOn':
    case 'lightOff': return { type, fields: { PORT: block.port } };
    case 'wait': return { type, fields: { SECONDS: block.seconds } };
    case 'beep': return { type };
    case 'repeat': {
      const body = chain(block.body);
      return { type, fields: { TIMES: block.times }, ...(body ? { inputs: { DO: { block: body } } } : {}) };
    }
  }
};

// Links blocks one under the other (Blockly's "next" connections)
const chain = (blocks: Block[]): SavedBlock | undefined => {
  let head: SavedBlock | undefined;
  for (let i = blocks.length - 1; i >= 0; i--) {
    const saved = toSaved(blocks[i]);
    if (head) saved.next = { block: head };
    head = saved;
  }
  return head;
};

// The workspace a mission starts with: the fixed "When Go is pressed" hat with the program under it
export const programToState = (program: Block[]): SavedWorkspace => {
  const body = chain(program);
  return {
    blocks: {
      languageVersion: 0,
      blocks: [{ type: HAT_TYPE, x: 24, y: 24, deletable: false, ...(body ? { next: { block: body } } : {}) }],
    },
  };
};

// ---- Blockly -> Block[] ----

const num = (v: string | number | undefined, fallback: number) => {
  const n = typeof v === 'number' ? v : parseFloat(v ?? '');
  return Number.isFinite(n) ? n : fallback;
};

const isOff = (b: SavedBlock) => b.enabled === false || (b.disabledReasons?.length ?? 0) > 0;

const readChain = (first: SavedBlock | undefined): Block[] => {
  const out: Block[] = [];
  for (let b = first; b; b = b.next?.block) {
    if (isOff(b)) continue;
    const kind = FROM_BLOCKLY[b.type];
    const f = b.fields ?? {};
    const port = String(f.PORT ?? 'A');
    switch (kind) {
      case 'motorOn': out.push({ type: 'motorOn', port, speed: num(f.SPEED, 50) }); break;
      case 'motorOff': out.push({ type: 'motorOff', port }); break;
      case 'lightOn': out.push({ type: 'lightOn', port }); break;
      case 'lightOff': out.push({ type: 'lightOff', port }); break;
      case 'wait': out.push({ type: 'wait', seconds: num(f.SECONDS, 1) }); break;
      case 'beep': out.push({ type: 'beep' }); break;
      case 'repeat': out.push({ type: 'repeat', times: num(f.TIMES, 2), body: readChain(b.inputs?.DO?.block) }); break;
      // Unknown blocks are skipped
    }
  }
  return out;
};

// Only blocks attached under the "When Go is pressed" hat run; loose blocks are ignored
export const stateToProgram = (state: SavedWorkspace): Block[] => {
  const hat = state.blocks?.blocks.find(b => b.type === HAT_TYPE);
  return hat ? readChain(hat.next?.block) : [];
};

// Short words for a block, for the Play screen's step list
export const describeBlock = (block: Exclude<Block, { type: 'repeat' }>): { text: string; kind: 'motor' | 'light' | 'control' | 'sound' } => {
  switch (block.type) {
    case 'motorOn': return { text: `Motor ${block.port} forward ${block.speed}%`, kind: 'motor' };
    case 'motorOff': return { text: `Motor ${block.port} stop`, kind: 'motor' };
    case 'lightOn': return { text: `Light ${block.port} on`, kind: 'light' };
    case 'lightOff': return { text: `Light ${block.port} off`, kind: 'light' };
    case 'wait': return { text: `Wait ${block.seconds} s`, kind: 'control' };
    case 'beep': return { text: 'Beep', kind: 'sound' };
  }
};
