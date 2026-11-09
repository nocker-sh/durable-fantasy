import { SHOPS } from "#/world/core/shops"
import { keeperPresent } from "#/world/maps/keeper-present"
import { npcCell } from "#/world/maps/npc-cell"
import type { Cell, MapDefinition } from "#/world/maps/types"

/** The shop's keepers at their post at `minute` who stand on this map; a keeper off duty elsewhere on it is left out. */
export function keepersOnDuty(map: Pick<MapDefinition, "id">, shopId: keyof typeof SHOPS, minute: number): { name: string; cell: Cell }[] {
  return SHOPS[shopId].keepers.flatMap((name) => {
    if (!keeperPresent(shopId, name, minute)) return []
    const cell = npcCell(map, name, minute)
    return cell ? [{ name, cell }] : []
  })
}
