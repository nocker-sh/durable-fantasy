import "#/world/scene/runtime/grid"
import { WR } from "#/world/scene/world"
import type { V2 } from "#/world/scene/construction/registry"
import type { Cell } from "#/world/scene/runtime/types"

export const cellOf = (p: V2): Cell => [Math.floor(p[0] * WR), Math.floor(p[1] * WR)]
