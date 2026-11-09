import { ITEMS } from "#/world/core/items/catalog"
import type { Errand } from "#/world/core/errand-types"

/** リストに表示する作業と相手の短い名前を返す。 */
export function errandLabel(errand: Errand): string {
  // a lost thing is looked for somewhere: say where, as the asker did
  if (errand.kind === "bring" && errand.find) return `${errand.find.place}で${ITEMS[errand.wants.item].name}を探して${errand.from}へ`
  if (errand.kind === "bring") return `${errand.from}に${ITEMS[errand.wants.item].name}×${errand.wants.count}`

  return `${errand.from}の${errand.parcel}を${errand.to}へ`
}
