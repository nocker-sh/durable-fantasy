import { MONSTER_MIN_MOVE_MS, MONSTER_MOVE_MS_PER_TILE, MONSTER_MOVE_PERIOD_MS } from "#/world/core/monster-motion-rules"
import type { MonsterRoute } from "#/world/core/get-monster-route"
type Props = { route: MonsterRoute; into: number }
/** Finish each route before the next clock segment, including detours longer than the original straight line. */
export function getMonsterRoutePosition(props: Props) {
  const duration = Math.min(MONSTER_MOVE_PERIOD_MS, Math.max(MONSTER_MIN_MOVE_MS, props.route.distance * MONSTER_MOVE_MS_PER_TILE)),
    fraction = Math.max(0, Math.min(1, props.into / duration))
  const last = props.route.points[props.route.points.length - 1]
  if (fraction === 1 || props.route.distance === 0) return { x: last[0], z: last[1], moving: false }
  const budget = props.route.distance * fraction,
    cursor = { consumed: 0 }
  for (const index of props.route.lengths.keys()) {
    const length = props.route.lengths[index]
    if (length > 0 && cursor.consumed + length >= budget) {
      const k = (budget - cursor.consumed) / length,
        from = props.route.points[index],
        to = props.route.points[index + 1]
      return { x: from[0] + (to[0] - from[0]) * k, z: from[1] + (to[1] - from[1]) * k, moving: fraction < 1 }
    }
    cursor.consumed += length
  }
  return { x: last[0], z: last[1], moving: false }
}
