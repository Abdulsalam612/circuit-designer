import type { KidsMission } from '@/types/kids';
import makeItGo from './missions/make-it-go';
import faster from './missions/faster';
import lightsOn from './missions/lights-on';
import backwards from './missions/backwards';
import gentleBreeze from './missions/gentle-breeze';
import driveToTheFlag from './missions/drive-to-the-flag';

// CirKit Kids missions in order (see docs/kids-mode-mvp.md): Part 1 builds circuits with
// snap pieces, Part 2 adds the hub and block code. Adding one: a new file in ./missions and an
// entry here. Ids are permanent.
export const KIDS_MISSIONS: KidsMission[] = [makeItGo, faster, lightsOn, backwards, gentleBreeze, driveToTheFlag];

export const CIRCUIT_MISSIONS = KIDS_MISSIONS.filter(m => m.kind === 'circuit');
export const CODE_MISSIONS = KIDS_MISSIONS.filter(m => m.kind === 'code');
