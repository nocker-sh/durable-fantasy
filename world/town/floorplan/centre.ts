import type { Rect } from "#/world/town/floorplan/types"

export const centre = (r: Rect): [number, number] => [(r.x0 + r.x1) / 2, (r.z0 + r.z1) / 2]
