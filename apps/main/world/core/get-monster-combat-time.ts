import { getRunShift } from "#/world/core/get-run-shift"
import type { CreatureHealth } from "#/world/core/wild/types"

type Props = Readonly<{ combat: CreatureHealth["combat"]; run?: CreatureHealth["run"]; now: number }>

/** 戦闘中は最初の一撃の位置を使い、占有が切れた時刻から通常の移動へ戻す。逃げるだけの生き物は、逃げた分だけ先の時刻を使う。 */
export function getMonsterCombatTime(props: Props): number {
  if (props.combat && props.now < props.combat.until) return props.combat.at
  return props.now + getRunShift(props.run, props.now)
}
