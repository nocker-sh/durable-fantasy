import { getV2PlayerBase } from "#/world/core/get-v2-player-base"
import { addItem } from "#/world/core/add-item"
import { ITEMS } from "#/world/core/items/catalog"
import { SLOTS } from "#/world/core/items/kinds"
import { unmet } from "#/world/core/unmet"
import { derive } from "#/world/core/derive"
import type { PlayerState } from "#/world/core/player-types"
import type { v2Schema } from "#/world/core/player-schema"
import type { z } from "zod"
type Props = z.infer<typeof v2Schema>

/** 条件を満たせなくなった装備は、袋へ収まる場合だけ外して保存を移行する。 */
export function fromV2(saved: Props): PlayerState {
  const converted = { player: getV2PlayerBase(saved) }
  for (const slot of SLOTS) {
    const item = converted.player.equipment[slot]
    if (!item || !unmet(ITEMS[item].equip?.needs, converted.player).length) continue
    const bag = addItem({ bag: converted.player.bag, item, count: 1 })
    if (bag) converted.player = { ...converted.player, bag, equipment: { ...converted.player.equipment, [slot]: null } }
  }
  const derived = derive(converted.player)

  return { ...converted.player, hp: Math.min(converted.player.hp, derived.maxHp), sp: Math.min(converted.player.sp, derived.maxSp) }
}
