import type { MonsterView } from "#/world/scene/monsters"
import type { Walker } from "#/world/scene/runtime/walker"
import type { SceneHitLabels } from "#/world/scene/runtime/scene-hit-labels"
import type { HitKind, MonsterStrike } from "#/world/scene/runtime/combat-feedback-types"

type CombatMonster = Pick<MonsterView, "spawn" | "hp" | "back" | "pos">
type DamageWalker = Pick<Walker, "pos"> & { fig: { readonly height: number } }
type Props<M> = Readonly<{
  monsters: ReadonlyArray<M>
  me: DamageWalker
  remotes: ReadonlyMap<string, DamageWalker>
  labels: Pick<SceneHitLabels, "show">
  defeated(monster: M): void
}>

/** サーバーの命中結果で描画状態を更新し、倒れた対象の終了と命中表示を順に通知する。 */
export class SceneCombatFeedback<M extends CombatMonster> {
  constructor(private readonly props: Props<M>) {
    Object.freeze(this)
  }

  readonly setWild = (states: Readonly<Record<string, { hp: number; back: number }>>): void => {
    for (const monster of this.props.monsters) {
      const state = states[monster.spawn.id]
      if (!state) continue
      monster.hp = state.hp
      monster.back = state.back
    }
  }

  readonly struck = (input: MonsterStrike): void => {
    const monster = this.props.monsters.find((entry) => entry.spawn.id === input.id)
    if (!monster) return
    if (input.hp >= 0) monster.hp = input.hp
    if (input.back) monster.back = input.back
    if (input.hp === 0) this.props.defeated(monster)
    this.props.labels.show({ kind: input.kind, text: input.kind === "miss" ? "ミス" : String(input.damage), pos: monster.pos, height: 0.5 })
  }

  readonly hurt = (who: string, kind: HitKind, damage: number): void => {
    const walker = who === "me" ? this.props.me : this.props.remotes.get(who)
    if (!walker) return
    this.props.labels.show({ kind: kind === "miss" ? "miss" : "taken", text: kind === "miss" ? "かわした" : String(damage), pos: walker.pos, height: walker.fig.height * 0.9 })
  }
}
