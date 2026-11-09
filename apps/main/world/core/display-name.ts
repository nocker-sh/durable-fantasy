import { ITEMS } from "#/world/core/items/catalog"
import type { ItemId } from "#/world/core/items/catalog"
import { currentMakerName } from "#/world/core/current-maker-name"

/** "イルムガルトの回復薬", or the plain name for things nobody in particular made. */
export function displayName(item: ItemId, by?: string): string {
  // a resident's thing recorded under their former name (an old exchange order, another player's item) shows the name they go by now
  return ITEMS[item].made && by ? `${currentMakerName(item, by)}の${ITEMS[item].name}` : ITEMS[item].name
}
