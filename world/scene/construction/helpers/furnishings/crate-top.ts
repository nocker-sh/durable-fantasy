import { M } from "#/world/scene/construction/materials"
import { Kit } from "#/world/scene/construction/kit"

export const crateTop = (k: Kit, y: number) => k.box({ side: M.sack, top: M.sack, u0: -0.15, y0: y, v0: -0.12, u1: 0.15, y1: y + 0.22, v1: 0.12 })
