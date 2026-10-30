import "#/world/scene/runtime/grid"
import { WR } from "#/world/scene/world"
import type { V2 } from "#/world/scene/construction/registry"
import type { Cell } from "#/world/scene/runtime/types"

export const center = (c: Cell): V2 => [(c[0] + 0.5) / WR, (c[1] + 0.5) / WR]
