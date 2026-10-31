import { getNativeFootwear } from "#/world/scene/figure/get-native-footwear"
import { groundFootwear } from "#/world/scene/figure/footing"
import type { Look } from "#/world/scene/figure/look"
import type { Skel } from "#/world/scene/rig"
import type { Cuboid } from "#/lib/engine/cuboid-subtraction"
type Props = Readonly<{ look: Look; native: Skel; stride: number; lift: number }>

/** The solved ankle and ball translate together: eased offsets stay within ±stride horizontally and [0,lift] vertically, with the prepared sole on the floor. */
export function getNativeEasedShoeEnvelopes(props: Props) {
  if (![props.stride, props.lift].every((value) => Number.isFinite(value) && value > 0)) return new Error("Invalid eased shoe envelope")
  const shoes = getNativeFootwear(props.look, props.native),
    ground = groundFootwear(shoes),
    boxes: Cuboid[] = []

  for (const side of ["l", "r"] satisfies ("l" | "r")[]) {
    const shoe = shoes[side],
      foot = ground.feet.find((entry) => entry.side === side)
    if (!foot || ![...shoe.a, ...shoe.b, shoe.r, foot.clearance].every(Number.isFinite) || shoe.r <= 0) return new Error("Missing native shoe envelope")
    const padding = 1e-12 * (1 + Math.max(...shoe.a.map(Math.abs), ...shoe.b.map(Math.abs)) + shoe.r + props.stride + props.lift + foot.clearance)
    const box = {
      x0: Math.min(shoe.a[0], shoe.b[0]) - shoe.r - props.stride - padding,
      x1: Math.max(shoe.a[0], shoe.b[0]) + shoe.r + props.stride + padding,
      bottom: Math.min(shoe.a[1], shoe.b[1]) - shoe.r - foot.clearance - padding,
      top: Math.max(shoe.a[1], shoe.b[1]) + shoe.r - foot.clearance + props.lift + padding,
      z0: Math.min(shoe.a[2], shoe.b[2]) - shoe.r - padding,
      z1: Math.max(shoe.a[2], shoe.b[2]) + shoe.r + padding,
    }
    if (!Object.values(box).every(Number.isFinite)) return new Error("Unbounded native shoe envelope")
    boxes.push(box)
  }

  return { boxes, rootY: ground.rootY }
}
