import type { V2 } from "#/world/scene/construction/registry"
import type { Interior } from "#/world/town/interiors"

export const roomCentre = (it: Interior): V2 => [(it.x0 + it.x1) / 2, (it.z0 + it.z1) / 2]
