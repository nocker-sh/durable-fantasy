import { ITEMS } from "#/world/core/items/catalog"
import type { ItemId } from "#/world/core/items/catalog"

/** 腹にたまらず HP か SP を戻す品は薬として扱い、次の薬まで待ち時間を共有する。 */
export function isMedicine(item: ItemId): boolean {
  const use = ITEMS[item].use
  if (!use || (use.full ?? 0) > 0) return false
  return (use.hp ?? 0) > 0 || (use.sp ?? 0) > 0
}
