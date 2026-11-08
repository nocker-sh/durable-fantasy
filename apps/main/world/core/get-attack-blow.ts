import { MONSTER_KINDS } from "#/world/core/monsters"
import { artSwing } from "#/world/core/art-swing"
import { swing } from "#/world/core/swing"
import type { Derived } from "#/world/core/stats-types"
import type { OffensiveEffect } from "#/world/core/skill-types"
import type { Fighter, Random } from "#/world/core/combat-types"

type Props = Readonly<{ stats: Derived; art: OffensiveEffect | null; monsterKind: string; random: Random }>

/** 攻撃の乱数は受付後に使い、通常攻撃と技で同じ防御値を予約先へ渡す。 */
export function getAttackBlow(props: Props) {
  const kind = MONSTER_KINDS[props.monsterKind]
  const target = { atk: 0, def: kind.def, hit: 0, flee: kind.flee, crit: 0 }
  const stats = props.stats
  const defense: Fighter = { atk: stats.atk, def: stats.def, hit: stats.hit, flee: stats.flee, crit: stats.crit }
  if (props.art) return { defense, blow: artSwing({ art: props.art, stats: stats.stats, attacker: defense, target, random: props.random }) }
  return { defense, blow: swing(defense, target, props.random) }
}
