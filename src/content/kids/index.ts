import type { KidsMission } from '@/types/kids';
import driveToTheFlag from './missions/drive-to-the-flag';

// CirKit Kids missions, in the order they unlock (see docs/kids-mode-mvp.md).
// Adding one: a new file in ./missions and an entry here. Ids are permanent.
export const KIDS_MISSIONS: KidsMission[] = [driveToTheFlag];
