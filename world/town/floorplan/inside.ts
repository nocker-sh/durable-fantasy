import type { Rect } from "#/world/town/floorplan/types"

export const inside = (a: Rect, r: Rect) => a.x0 >= r.x0 - 1e-6 && a.x1 <= r.x1 + 1e-6 && a.z0 >= r.z0 - 1e-6 && a.z1 <= r.z1 + 1e-6
