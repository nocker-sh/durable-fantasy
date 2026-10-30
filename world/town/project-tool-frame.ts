import type { Point3 } from "#/lib/engine/cuboid-motion-types"
import type { WorkingToolGeometry } from "#/world/town/working-tool"

export function projectToolFrame(axes: WorkingToolGeometry["axes"], point: Point3): Point3 {
  const dot = (a: Point3) => a[0] * point[0] + a[1] * point[1] + a[2] * point[2]
  return [dot(axes[0]), dot(axes[1]), dot(axes[2])]
}
