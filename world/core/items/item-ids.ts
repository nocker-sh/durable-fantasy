import { ITEMS } from "#/world/core/items/catalog"
import { isItemId } from "#/world/core/items/is-item-id"

export const ITEM_IDS = Object.keys(ITEMS).filter(isItemId)
