import { WR, WN } from "#/world/maps/ground/rules"

const STEP_SPEED = 2.4

// world units per second along grid cells
const CELL = 1 / WR

/** residents closer than this show their name */
const NAME_RANGE = 6

if (WN !== 96) throw new Error("protocol.ts GRID must match the walk grid")

export { STEP_SPEED, CELL, NAME_RANGE }
