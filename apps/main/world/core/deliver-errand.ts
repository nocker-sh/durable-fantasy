import type { Errand } from "#/world/core/errand-types"

type Props = Omit<Extract<Errand, { kind: "deliver" }>, "kind">

/** 依頼元・届け先と荷物を必ず持つ配達の定義を作る。 */
export function deliverErrand(props: Props): Errand {
  return { id: props.id, from: props.from, kind: "deliver", to: props.to, parcel: props.parcel, ask: props.ask, thanks: props.thanks, gold: props.gold }
}
