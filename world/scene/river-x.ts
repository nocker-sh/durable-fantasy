import { riverX0 } from "#/world/maps/layout"
import { layout } from "#/world/scene/world"

export function riverX(z: number): number {
  return riverX0(z, layout.value.river)
}
