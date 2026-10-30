import type { Rect } from "./segment-distance-types"

export const pointRectDistance = (x: number, z: number, rect: Rect) => Math.hypot(Math.max(rect[0] - x, 0, x - rect[2]), Math.max(rect[1] - z, 0, z - rect[3]))
