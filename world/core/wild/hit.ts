import { MONSTER_KINDS } from "#/world/core/monsters"
import { spawnOf } from "#/world/core/spawn-of"
import { about } from "#/world/core/wild/about"
import { countersDue } from "#/world/core/wild/counters-due"
import { fightOf } from "#/world/core/wild/fight-of"
import { hpOf } from "#/world/core/wild/hp-of"
import type { HitResult, WildState } from "#/world/core/wild/types"

type Props = Readonly<{ state: WildState; id: string; damage: number; now: number; player: string; party?: string | null }>

/**
 * A miss still starts the fight; only its holder and the holder's party may strike until the claim
 * expires. The creature's own blows are timed from the start of the fight, not from each strike.
 */
export function hit(props: Props): HitResult {
  const spawn = spawnOf(props.id)
  if (!spawn || !about(props.state, props.id, props.now)) return { state: props.state, hp: 0, beaten: false, counters: 0, refused: true, reason: "TARGET_GONE" }
  const fight = fightOf(props.state, props.id, props.now)
  const mate = !!props.party && fight?.party === props.party
  if (fight && fight.player !== props.player && !mate) return { state: props.state, hp: hpOf(props.state, props.id, props.now), beaten: false, counters: 0, refused: true, reason: "TAKEN" }

  const kind = MONSTER_KINDS[spawn.kind]
  const hp = Math.max(0, hpOf(props.state, props.id, props.now) - props.damage)
  const by = { ...props.state.by }
  if (hp > 0) {
    const timing = countersDue({ fight, now: props.now, interval: kind.interval })
    const next = { player: props.player, at: props.now, ...(props.party ? { party: props.party } : {}), next: timing.next }
    return { state: { ...props.state, hp: { ...props.state.hp, [props.id]: hp }, by: { ...by, [props.id]: next } }, hp, beaten: false, counters: kind.atk > 0 ? timing.counters : 0, refused: false }
  }
  const rest = { ...props.state.hp }
  delete rest[props.id]
  delete by[props.id]

  return { state: { hp: rest, by, back: { ...props.state.back, [props.id]: props.now + kind.respawn * 1000 } }, hp: 0, beaten: true, counters: 0, refused: false }
}
