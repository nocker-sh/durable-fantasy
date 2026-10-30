import { ITEMS } from "#/world/core/items/catalog"
import type { ItemId } from "#/world/core/items/catalog"

/** "イルムガルトの回復薬", or the plain name for things nobody in particular made. */
export function displayName(item: ItemId, by?: string): string {
  return ITEMS[item].made && by ? `${by}の${ITEMS[item].name}` : ITEMS[item].name
}
