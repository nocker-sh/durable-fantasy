import type { Cuboid } from "#/lib/engine/cuboid-subtraction"
import type { Point3 } from "#/lib/engine/cuboid-motion-types"
type Props = Readonly<{ relative: Cuboid; from: Point3; obstacle: Cuboid; tolerance?: number }>

/** Keep the translation query's strict face policy at a fixed finite reference point. */
export function cuboidStationaryHits(props: Props): boolean {
  if (!props.from.every(Number.isFinite)) return false
  const tolerance = props.tolerance ?? 0
  const lowX = props.obstacle.x0 - props.relative.x1 + tolerance
  const lowY = props.obstacle.bottom - props.relative.top + tolerance
  const lowZ = props.obstacle.z0 - props.relative.z1 + tolerance
  const highX = props.obstacle.x1 - props.relative.x0 - tolerance
  const highY = props.obstacle.top - props.relative.bottom - tolerance
  const highZ = props.obstacle.z1 - props.relative.z0 - tolerance
  if (lowX >= highX || props.from[0] <= lowX || props.from[0] >= highX) return false
  if (lowY >= highY || props.from[1] <= lowY || props.from[1] >= highY) return false
  if (lowZ >= highZ || props.from[2] <= lowZ || props.from[2] >= highZ) return false
  return true
}
