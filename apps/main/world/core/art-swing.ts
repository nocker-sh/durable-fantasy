import { swing } from "#/world/core/swing"
import type { Stats } from "#/world/core/growth-types"
import type { OffensiveEffect } from "#/world/core/skill-types"
import type { Fighter, Random, Swing } from "#/world/core/combat-types"

type Props = { art: OffensiveEffect; stats: Stats; attacker: Fighter; target: Fighter; random: Random }

/** 術は能力値から威力を求め、打撃の戦技は通常攻撃と同じ乱数の順序で判定する。 */
export function artSwing(props: Props): Swing {
  const art = props.art
  if (art.kind === "spell") {
    const attack = art.magic.base + art.magic.per * props.stats[art.magic.stat]
    const raw = attack * (0.9 + props.random() * 0.2) - props.target.def / 2
    return { kind: "hit", damage: Math.max(1, Math.round(raw)) }
  }
  const strong = { ...props.attacker, atk: props.attacker.atk * art.power }

  return swing(art.sure ? { ...strong, crit: 100 } : strong, props.target, props.random)
}
