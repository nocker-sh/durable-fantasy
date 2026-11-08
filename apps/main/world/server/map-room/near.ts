import { cellDistance } from "#/world/maps/cell-distance"
import type { Cell } from "#/world/maps/types"
import type { Presence } from "#/world/server/map-room/presence"
import { reachable } from "#/world/server/map-room/reachable"

export const near = (me: Presence, target: Cell, cells: number) => reachable(me).some((c) => cellDistance(c, target) <= cells)
