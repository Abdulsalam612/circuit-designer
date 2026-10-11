import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  type Timestamp,
} from 'firebase/firestore';
import { firestore } from '@/firebase';
import type { CircuitComponent, CircuitLayout, Wire } from '@/types/circuit';
import { COMPONENT_DEFS } from './components';

// Circuits are stored per user: users/{uid}/circuits/{circuitId}
//   { name, components, wires, createdAt, updatedAt }

export const DEFAULT_CIRCUIT_NAME = 'Untitled circuit';

export interface CircuitSummary {
  id: string;
  name: string;
  updatedAt: Date | null;
  componentCount: number;
}

const circuitsOf = (uid: string) => collection(firestore, 'users', uid, 'circuits');
const circuitDoc = (uid: string, id: string) => doc(firestore, 'users', uid, 'circuits', id);

// Firestore rejects fields set to undefined; a JSON round trip drops them
const toStorable = (layout: CircuitLayout) => JSON.parse(JSON.stringify(layout)) as CircuitLayout;

const isNum = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v);

// Checks data read from Firestore or an imported file, keeping only well-formed
// components and wires. Returns null if it doesn't look like a circuit at all.
export const parseLayout = (data: unknown): CircuitLayout | null => {
  if (!data || typeof data !== 'object') return null;
  const { components, wires } = data as { components?: unknown; wires?: unknown };
  if (!Array.isArray(components) || !Array.isArray(wires)) return null;

  const validComponents = components.filter((c): c is CircuitComponent =>
    !!c && typeof c.id === 'string' && c.type in COMPONENT_DEFS &&
    isNum(c.x) && isNum(c.y) && isNum(c.rotation) &&
    (c.value === undefined || isNum(c.value)) &&
    (c.closed === undefined || typeof c.closed === 'boolean')
  );
  const validWires = wires.filter((w): w is Wire =>
    !!w && typeof w.id === 'string' && isNum(w.x1) && isNum(w.y1) && isNum(w.x2) && isNum(w.y2) &&
    (w.x1 === w.x2 || w.y1 === w.y2)
  );
  return { components: validComponents, wires: validWires };
};

export const createCircuit = async (uid: string, name: string, layout: CircuitLayout) => {
  const ref = await addDoc(circuitsOf(uid), {
    name,
    ...toStorable(layout),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
};

export const saveCircuit = (uid: string, id: string, name: string, layout: CircuitLayout) =>
  updateDoc(circuitDoc(uid, id), { name, ...toStorable(layout), updatedAt: serverTimestamp() });

export const loadCircuit = async (uid: string, id: string) => {
  const snap = await getDoc(circuitDoc(uid, id));
  if (!snap.exists()) return null;
  const data = snap.data();
  const layout = parseLayout(data);
  if (!layout) return null;
  return { name: typeof data.name === 'string' ? data.name : DEFAULT_CIRCUIT_NAME, layout };
};

export const listCircuits = async (uid: string): Promise<CircuitSummary[]> => {
  const snap = await getDocs(query(circuitsOf(uid), orderBy('updatedAt', 'desc')));
  return snap.docs.map(d => {
    const data = d.data();
    return {
      id: d.id,
      name: typeof data.name === 'string' ? data.name : DEFAULT_CIRCUIT_NAME,
      updatedAt: (data.updatedAt as Timestamp | null)?.toDate?.() ?? null,
      componentCount: Array.isArray(data.components) ? data.components.length : 0,
    };
  });
};

export const renameCircuit = (uid: string, id: string, name: string) =>
  updateDoc(circuitDoc(uid, id), { name, updatedAt: serverTimestamp() });

export const deleteCircuit = (uid: string, id: string) => deleteDoc(circuitDoc(uid, id));

export const duplicateCircuit = async (uid: string, id: string) => {
  const original = await loadCircuit(uid, id);
  if (!original) throw new Error('Circuit not found');
  return createCircuit(uid, `${original.name} (copy)`, original.layout);
};

// ---- File import / export ----

export const CIRCUIT_FILE_FORMAT = 'cirkit-circuit';

export const circuitToJson = (name: string, layout: CircuitLayout) =>
  JSON.stringify({ format: CIRCUIT_FILE_FORMAT, version: 1, name, ...toStorable(layout) }, null, 2);

export const circuitFromJson = (text: string): { name: string; layout: CircuitLayout } | null => {
  try {
    const data = JSON.parse(text);
    const layout = parseLayout(data);
    if (!layout) return null;
    return { name: typeof data.name === 'string' ? data.name : DEFAULT_CIRCUIT_NAME, layout };
  } catch {
    return null;
  }
};
