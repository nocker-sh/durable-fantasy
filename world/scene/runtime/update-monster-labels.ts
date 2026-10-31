import { MONSTER_KINDS } from "#/world/core/monsters"
import { updateMonsterHealth } from "#/world/scene/update-monster-health"
import type { MonsterView } from "#/world/scene/monsters"
import type { Walker } from "#/world/scene/runtime/walker"
import type { PendingAction } from "#/world/scene/runtime/action-target"
import type { SceneLabelProjection } from "#/world/scene/runtime/scene-label-projection"

type LabeledMonster = Pick<MonsterView, "spawn" | "pos" | "body" | "hp" | "hpBar" | "hpWidth" | "label" | "groundHeight">
type Props = Readonly<{
  monsters: ReadonlyArray<LabeledMonster>
  me: Pick<Walker, "pos">
  action: Pick<PendingAction<unknown>, "fighting">
  place: SceneLabelProjection["place"]
}>

/** 表示中の対象の戦闘・負傷・近さで名前を出し、非表示でも HP の表示状態を同期する。 */
export function updateMonsterLabels(props: Props): void {
  for (const monster of props.monsters) {
    const kind = MONSTER_KINDS[monster.spawn.kind]
    const show = monster.body.visible && (monster.spawn.id === props.action.fighting || monster.hp < kind.hp || Math.hypot(monster.pos[0] - props.me.pos[0], monster.pos[1] - props.me.pos[1]) < 4)
    updateMonsterHealth(monster)
    props.place({ element: monster.label, visible: show, pos: monster.pos, height: 0.55, ground: monster.groundHeight, offset: 2 })
  }
}
