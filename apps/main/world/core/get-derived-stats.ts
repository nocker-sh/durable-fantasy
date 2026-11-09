import { equipmentAttack } from "#/world/core/equipment-attack"
import { MELEE_REACH } from "#/world/core/monsters"
import { scaling } from "#/world/core/scaling"
import { REGEN_HP_SHARE, REGEN_SP_SHARE, UNARMED_DELAY } from "#/world/core/stats-rules"
import type { Equipment } from "#/world/core/items/types"
import type { Stats } from "#/world/core/growth-types"
import type { Build, Derived, EquipmentBonuses } from "#/world/core/stats-types"

type Props = { build: Build; stats: Stats; weapon: Equipment | undefined; armorDefense: number; bonuses: EquipmentBonuses }

/** 補正済みの能力値と個々の装備から、戦闘と生活で共有する値を求める。 */
export function getDerivedStats(props: Props): Derived {
  const maxHp = 20 + props.build.level * 3 + props.stats.vit * 5 + (props.bonuses.maxHp ?? 0)
  const maxSp = 5 + props.build.level + props.stats.mnd * 3 + (props.bonuses.maxSp ?? 0)
  return {
    stats: props.stats,
    maxHp,
    maxSp,
    atk: 1 + (props.build.equipment.weapon ? equipmentAttack(props.build.equipment.weapon, props.build.worn?.weapon?.q) : 0) + scaling(props.weapon, props.stats),
    def: Math.floor(props.stats.vit / 4) + props.armorDefense,
    hit: props.build.level + props.stats.dex,
    flee: props.build.level + Math.floor(props.stats.dex / 2),
    crit: Math.floor(props.stats.dex / 4),
    attackDelay: Math.max(600, (props.weapon?.delay ?? UNARMED_DELAY) - props.stats.dex * 8),
    reach: props.weapon?.reach ?? MELEE_REACH,
    maxWeight: 1800 + props.stats.str * 40,
    // a share of the maximum, so rest keeps pace with growth (game-system.md §3.5)
    regenHp: Math.max(1, Math.floor(maxHp * REGEN_HP_SHARE)),
    regenSp: Math.max(1, Math.floor(maxSp * REGEN_SP_SHARE)),
  }
}
