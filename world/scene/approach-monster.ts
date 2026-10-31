import { isFree } from "#/world/scene/is-free"
import type { Vector2Tuple } from "#/lib/engine/vector2-types"
import type { MonsterView } from "#/world/scene/monsters"

/** Try reachable positions around the creature, preferring the side we come from. */
type Props = {
  m: Pick<MonsterView, "pos">
  from: Vector2Tuple
  reach: number
  tryWalk: (point: Vector2Tuple) => boolean
}

export function approachMonster(props: Props): boolean {
  const ang = Math.atan2(props.from[1] - props.m.pos[1], props.from[0] - props.m.pos[0])
  for (const k = { value: 0 }; k.value < 8; k.value++) {
    const a = ang + (k.value % 2 ? 1 : -1) * Math.ceil(k.value / 2) * (Math.PI / 4)
    const p: Vector2Tuple = [props.m.pos[0] + Math.cos(a) * props.reach * 0.7, props.m.pos[1] + Math.sin(a) * props.reach * 0.7]
    if (isFree(p[0], p[1]) && props.tryWalk(p)) return true
  }
  return false
}
