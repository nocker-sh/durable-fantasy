import { ITEMS } from "#/world/core/items/catalog"
import type { ItemId } from "#/world/core/items/catalog"
import { currentResidentName } from "#/world/core/current-resident-name"

/** "イルムガルトの回復薬", or the plain name for things nobody in particular made. */
export function displayName(item: ItemId, by?: string): string {
  // a maker recorded under a resident's former name (an old exchange order, another player's item) shows the name they go by now
  return ITEMS[item].made && by ? `${currentResidentName(by)}の${ITEMS[item].name}` : ITEMS[item].name
}
