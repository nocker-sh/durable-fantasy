import { cuboidStationaryHits } from "#/lib/engine/cuboid-stationary-hits"
import type { Cuboid } from "#/lib/engine/cuboid-subtraction"
import type { Point3 } from "#/lib/engine/cuboid-motion-types"
type Props = Readonly<{ relative: Cuboid; from: Point3; to: Point3; obstacle: Cuboid; tolerance?: number }>

/** Positive-volume collision during translation; touching faces remain separate. */
export function cuboidTranslationHits(props: Props): boolean {
  if (props.to[0] - props.from[0] === 0 && props.to[1] - props.from[1] === 0 && props.to[2] - props.from[2] === 0) return cuboidStationaryHits(props)
  const interval = { near: 0, far: 1 }
  const tolerance = props.tolerance ?? 0
  const low = [props.obstacle.x0 - props.relative.x1 + tolerance, props.obstacle.bottom - props.relative.top + tolerance, props.obstacle.z0 - props.relative.z1 + tolerance]
  const high = [props.obstacle.x1 - props.relative.x0 - tolerance, props.obstacle.top - props.relative.bottom - tolerance, props.obstacle.z1 - props.relative.z0 - tolerance]
  for (const axis of [0, 1, 2]) {
    const delta = props.to[axis] - props.from[axis]
    if (low[axis] >= high[axis]) return false
    if (delta === 0) {
      if (props.from[axis] <= low[axis] || props.from[axis] >= high[axis]) return false
      continue
    }
    const first = (low[axis] - props.from[axis]) / delta
    const second = (high[axis] - props.from[axis]) / delta
    interval.near = Math.max(interval.near, Math.min(first, second))
    interval.far = Math.min(interval.far, Math.max(first, second))
  }
  return interval.near < interval.far
}
