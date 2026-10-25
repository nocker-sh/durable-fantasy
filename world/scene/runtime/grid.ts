import { WR, WN } from "../world";
import type { V2 } from "../build";
import type { Cell } from "./types.ts";

const STEP_SPEED = 2.4;

// world units per second along grid cells
const CELL = 1 / WR;

/** residents closer than this show their name */
const NAME_RANGE = 6;

if (WN !== 96) throw new Error("protocol.ts GRID must match the walk grid");

const center = (c: Cell): V2 => [(c[0] + 0.5) / WR, (c[1] + 0.5) / WR];

const cellOf = (p: V2): Cell => [Math.floor(p[0] * WR), Math.floor(p[1] * WR)];

const snap = (p: V2): V2 => center(cellOf(p));

export { STEP_SPEED, CELL, NAME_RANGE, center, cellOf, snap };
