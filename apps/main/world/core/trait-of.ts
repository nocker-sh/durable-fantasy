import { MAKERS } from "#/world/core/makers"
import type { ItemId } from "#/world/core/items/catalog"
import type { Trait } from "#/world/core/maker-types"

/** 作り手が定義されている品だけ、その人の癖を返す。 */
export function traitOf(item: ItemId, by: string | undefined): Trait | undefined {
  return by ? MAKERS[by]?.[item] : undefined
}
