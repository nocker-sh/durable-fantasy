import "#/world/scene/runtime/grid"
import type { V2 } from "#/world/scene/construction/registry"
import { center } from "#/world/scene/runtime/center"
import { cellOf } from "#/world/scene/runtime/cell-of"

export const snap = (p: V2): V2 => center(cellOf(p))
