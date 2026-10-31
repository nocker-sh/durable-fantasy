import { normalizeVector3 } from "#/lib/engine/normalize-vector3"
import { subtractVector3 } from "#/lib/engine/subtract-vector3"
import { addVector3 } from "#/lib/engine/add-vector3"
import { scaleVector3 } from "#/lib/engine/scale-vector3"
import type { Footwear } from "#/world/scene/figure/footing"
import type { Vector3 } from "#/lib/engine/vector3-types"
import type { Look } from "#/world/scene/figure/look"

type Props = Readonly<{ foot: Vector3; ball: Vector3; kind: NonNullable<Look["footwear"]>; scale: number }>

/** 描画と接地が同じ踵・爪先・半径を使い、元の靴底の上下差を保つ。 */
export function getShoeCapsule(props: Props): Footwear["l"] {
  const forward = normalizeVector3(subtractVector3(props.ball, props.foot))
  const heel = addVector3(props.foot, scaleVector3(forward, -0.02 * props.scale))
  const toe = addVector3(props.ball, scaleVector3(forward, (props.kind === "clogs" ? 0.075 : 0.065) * props.scale))
  const radius = props.kind === "shoes" || props.kind === "wraps" ? 0.068 : 0.078
  return { a: [heel[0], heel[1] - 0.004, heel[2]], b: toe, r: radius * props.scale }
}
