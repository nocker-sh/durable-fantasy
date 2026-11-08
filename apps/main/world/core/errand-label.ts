import { ITEMS } from "#/world/core/items/catalog"
import type { Errand } from "#/world/core/errand-types"

/** リストに表示する作業と相手の短い名前を返す。 */
export function errandLabel(errand: Errand): string {
  if (errand.kind === "bring") return `${errand.from}に${ITEMS[errand.wants.item].name}×${errand.wants.count}`

  return `${errand.from}の${errand.parcel}を${errand.to}へ`
}
