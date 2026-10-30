import type { Vector2, Vector2Tuple } from "#/lib/engine/vector2-types"
import type { PathAdvance } from "#/lib/engine/path-follower-types"

type Props = Readonly<{ position: Vector2Tuple; point: Vector2; progress: PathAdvance }>

/** Consume coincident waypoints even with no distance left; retain a partial segment for the next update. */
export function advancePathWaypoint(props: Props): boolean {
  const position = props.position
  const progress = props.progress
  const dx = props.point[0] - position[0]
  const dz = props.point[1] - position[1]
  const distance = Math.hypot(dx, dz)
  if (distance === 0) {
    progress.consumed++
    return true
  }
  if (progress.remaining <= 0) return false

  progress.heading = Math.atan2(dx, dz)
  if (distance > progress.remaining) {
    position[0] += (dx / distance) * progress.remaining
    position[1] += (dz / distance) * progress.remaining
    return false
  }
  position[0] = props.point[0]
  position[1] = props.point[1]
  progress.remaining -= distance
  progress.consumed++
  return true
}
