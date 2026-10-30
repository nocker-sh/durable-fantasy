import { MONSTER_KINDS } from "#/world/core/monsters"
import { spawnOf } from "#/world/core/spawn-of"
import { about } from "#/world/core/wild/about"
import { fighting } from "#/world/core/wild/fighting"
import { hpOf } from "#/world/core/wild/hp-of"
import type { HitResult, WildState } from "#/world/core/wild/types"

type Props = Readonly<{ state: WildState; id: string; damage: number; now: number; player: string }>

/** A miss still starts the fight; only its owner may strike until the claim expires. */
export function hit(props: Props): HitResult {
  const spawn = spawnOf(props.id)
  if (!spawn || !about(props.state, props.id, props.now)) return { state: props.state, hp: 0, beaten: false, refused: true, reason: "TARGET_GONE" }
  const other = fighting(props.state, props.id, props.now)
  if (other && other !== props.player) return { state: props.state, hp: hpOf(props.state, props.id, props.now), beaten: false, refused: true, reason: "TAKEN" }

  const hp = Math.max(0, hpOf(props.state, props.id, props.now) - props.damage)
  const by = { ...props.state.by }
  if (hp > 0) return { state: { ...props.state, hp: { ...props.state.hp, [props.id]: hp }, by: { ...by, [props.id]: { player: props.player, at: props.now } } }, hp, beaten: false, refused: false }
  const rest = { ...props.state.hp }
  delete rest[props.id]
  delete by[props.id]

  return { state: { hp: rest, by, back: { ...props.state.back, [props.id]: props.now + MONSTER_KINDS[spawn.kind].respawn * 1000 } }, hp: 0, beaten: true, refused: false }
}
