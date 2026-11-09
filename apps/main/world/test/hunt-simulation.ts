import { apply } from "#/world/core/apply"
import { derive } from "#/world/core/derive"
import { getAttackBlow } from "#/world/core/get-attack-blow"
import { skillOf } from "#/world/core/skill-of"
import { getSkillUnavailableReason } from "#/world/core/get-skill-unavailable-reason"
import { hit } from "#/world/core/wild/hit"
import { emptyWild } from "#/world/core/wild/empty-wild"
import { MONSTER_KINDS, SPAWNS } from "#/world/core/monsters"
import { swing } from "#/world/core/swing"
import type { PlayerState } from "#/world/core/player-types"
import type { SkillId } from "#/world/core/skill-types"
import type { WildState } from "#/world/core/wild/types"

type Props = Readonly<{ player: PlayerState; kind: string; arts: readonly SkillId[]; heal?: boolean; seed: number }>

/** Uses the real payment, damage, counter, regeneration and healing rules; grants no battle rewards. */
export class HuntSimulation {
  private readonly run: { player: PlayerState; wild: WildState; now: number; seed: number; arts: number; heals: number; strikes: number }

  constructor(private readonly props: Props) {
    this.run = { player: structuredClone(props.player), wild: emptyWild(), now: 100000, seed: props.seed, arts: 0, heals: 0, strikes: 0 }
    Object.freeze(this)
  }

  readonly random = (): number => {
    this.run.seed = (Math.imul(this.run.seed, 1664525) + 1013904223) >>> 0
    return this.run.seed / 4294967296
  }

  fight() {
    const spawn = SPAWNS.find((entry) => entry.kind === this.props.kind)
    if (!spawn) throw Error("No spawned opponent")
    const finish = { beaten: false }
    while (!finish.beaten && this.run.player.hp > 0 && this.run.now < 400000) {
      this.heal()
      const blow = this.strike()
      const received = hit({ state: this.run.wild, id: spawn.id, damage: blow.kind === "miss" ? 0 : blow.damage, now: this.run.now, player: "hunter" })
      if (received.refused) throw Error(received.reason)
      this.run.wild = received.state
      finish.beaten = received.beaten
      this.counter(received.counters)
      this.run.now += derive(this.run.player).attackDelay
    }
    return { beaten: finish.beaten, hp: this.run.player.hp, sp: this.run.player.sp, duration: this.run.now - 100000, arts: this.run.arts, heals: this.run.heals, strikes: this.run.strikes }
  }

  private strike() {
    const id = this.props.arts.find((skill) => getSkillUnavailableReason(this.run.player, skill, this.run.now) === null)
    const definition = id ? skillOf(id) : null
    const offensive = definition?.kind === "strike" || definition?.kind === "spell" ? definition : null
    if (id && offensive) {
      const payment = apply(this.run.player, { type: "art", skill: id }, { now: this.run.now })
      if (!payment.ok) throw Error(payment.reason)
      this.run.player = payment.state
      this.run.arts++
    }
    this.run.strikes++
    return getAttackBlow({ stats: derive(this.run.player), art: offensive, monsterKind: this.props.kind, random: this.random }).blow
  }

  private counter(count: number): void {
    const kind = MONSTER_KINDS[this.props.kind]
    for (const index of Array.from({ length: count }).keys()) {
      const blow = swing({ atk: kind.atk, def: kind.def, hit: kind.hit, flee: kind.flee, crit: 0 }, derive(this.run.player), this.random)
      const hurt = apply(this.run.player, { type: "hurt", amount: blow.kind === "miss" ? 0 : blow.damage, by: kind.name }, { now: this.run.now + index })
      if (!hurt.ok) throw Error(hurt.reason)
      this.run.player = hurt.state
      if (this.run.player.hp <= 0) return
    }
  }

  private heal(): void {
    if (!this.props.heal || this.run.player.hp > derive(this.run.player).maxHp * 0.65) return
    const healed = apply(this.run.player, { type: "cast", skill: "first-aid" }, { now: this.run.now })
    if (!healed.ok) return
    this.run.player = healed.state
    this.run.heals++
  }
}
