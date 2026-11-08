import { getNearestPolylineX } from "#/lib/engine/get-nearest-polyline-x"
import { layout } from "#/world/scene/world"

export function riverX(z: number): number {
  return getNearestPolylineX(z, layout.value.river)
}
