import { errandPay } from "#/world/core/errand-pay"
import type { ItemId } from "#/world/core/items/catalog"
import type { Errand } from "#/world/core/errand-types"

type Props = { id: string; from: string; item: ItemId; count: number; ask: string; thanks: string }

/** 仕事で必要な材料を頼む依頼を、共通の報酬の規則から作る。 */
export function bringErrand(props: Props): Errand {
  return { id: props.id, from: props.from, kind: "bring", wants: { item: props.item, count: props.count }, ask: props.ask, thanks: props.thanks, gold: errandPay(props.item, props.count) }
}
