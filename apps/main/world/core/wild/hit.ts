import { COUNTER_INTERVAL, MONSTER_KINDS } from "#/world/core/monsters"
import { spawnOf } from "#/world/core/spawn-of"
import { about } from "#/world/core/wild/about"
import { countersDue } from "#/world/core/wild/counters-due"
import { fightOf } from "#/world/core/wild/fight-of"
import { hpOf } from "#/world/core/wild/hp-of"
import { getRunShift } from "#/world/core/get-run-shift"
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
    const timing = countersDue({ fight, now: props.now, interval: kind.interval ?? COUNTER_INTERVAL })
    const next = { player: props.player, started: fight?.started ?? fight?.at ?? props.now, at: props.now, ...(props.party ? { party: props.party } : {}), next: timing.next }
    // a creature that does not strike back bolts: what it already ran stays, and it runs on from now (get-run-shift.ts)
    const run = kind.atk > 0 ? props.state.run : { ...props.state.run, [props.id]: { base: getRunShift(props.state.run?.[props.id], props.now), start: props.now } }
    return {
      state: { ...props.state, hp: { ...props.state.hp, [props.id]: hp }, by: { ...by, [props.id]: next }, ...(run ? { run } : {}) },
      hp,
      beaten: false,
      counters: kind.atk > 0 ? timing.counters : 0,
      refused: false,
    }
  }
  const rest = { ...props.state.hp }
  delete rest[props.id]
  delete by[props.id]
  // it comes back fresh, out of sight, so nothing it ran is kept
  const run = props.state.run ? { ...props.state.run } : undefined
  if (run) delete run[props.id]

  return { state: { hp: rest, by, ...(run ? { run } : {}), back: { ...props.state.back, [props.id]: props.now + kind.respawn * 1000 } }, hp: 0, beaten: true, counters: 0, refused: false }
}
