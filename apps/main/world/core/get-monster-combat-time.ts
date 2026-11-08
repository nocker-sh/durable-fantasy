import type { CreatureHealth } from "#/world/core/wild/types"

type Props = Readonly<{ combat: CreatureHealth["combat"]; now: number }>

/** 戦闘中は最初の一撃の位置を使い、占有が切れた時刻から通常の移動へ戻す。 */
export function getMonsterCombatTime(props: Props): number {
  return props.combat && props.now < props.combat.until ? props.combat.at : props.now
}
