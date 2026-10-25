import type { Rect } from "./types.ts"

const WALL = 0.25

const DIV = 0.12

/** room to stand in front of the door inside */
const DOORWAY = { w: 1.1, d: 1.2 }

const STAIR = { w: 0.9, d: 2.6, front: 0.8 }

const overlap = (a: Rect, b: Rect, m = 0) => a.x0 < b.x1 + m && b.x0 < a.x1 + m && a.z0 < b.z1 + m && b.z0 < a.z1 + m

const inside = (a: Rect, r: Rect) => a.x0 >= r.x0 - 1e-6 && a.x1 <= r.x1 + 1e-6 && a.z0 >= r.z0 - 1e-6 && a.z1 <= r.z1 + 1e-6

const rect = (x: number, z: number, w: number, d: number): Rect => ({ x0: x - w / 2, z0: z - d / 2, x1: x + w / 2, z1: z + d / 2 })

const centre = (r: Rect): [number, number] => [(r.x0 + r.x1) / 2, (r.z0 + r.z1) / 2]

export { WALL, DIV, DOORWAY, STAIR, overlap, inside, rect, centre }
