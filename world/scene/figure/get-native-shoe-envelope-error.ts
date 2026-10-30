import { cuboidTranslationHits } from "#/lib/engine/cuboid-translation-hits"
import type { Cuboid } from "#/lib/engine/cuboid-subtraction"
import type { getNativeEasedShoeEnvelopes } from "#/world/scene/figure/get-native-eased-shoe-envelopes"
type Props = Readonly<{ shoes: Exclude<ReturnType<typeof getNativeEasedShoeEnvelopes>, Error>; boxes: readonly Cuboid[]; ceiling: number }>

/** A whole-cycle shoe enclosure carries its exact nonnegative lift floor guarantee; all fixed and relatively moving obstacles still block it. */
export function getNativeShoeEnvelopeError(props: Props): Error | null {
  if (![props.shoes.rootY, props.ceiling].every(Number.isFinite) || props.ceiling <= 0 || props.shoes.boxes.length !== 2) return new Error("Invalid shoe envelope room")
  if (props.boxes.some((box) => ![box.x0, box.x1, box.z0, box.z1, box.bottom, box.top].every(Number.isFinite) || box.x0 >= box.x1 || box.z0 >= box.z1 || box.bottom >= box.top))
    return new Error("Invalid shoe envelope obstacle")

  for (const shoe of props.shoes.boxes) {
    if (![shoe.x0, shoe.x1, shoe.z0, shoe.z1, shoe.bottom, shoe.top].every(Number.isFinite) || shoe.x0 >= shoe.x1 || shoe.z0 >= shoe.z1 || shoe.bottom >= shoe.top)
      return new Error("Invalid native shoe envelope bounds")
    if (shoe.bottom + props.shoes.rootY < -1e-9 || shoe.top + props.shoes.rootY > props.ceiling) return new Error("Native shoe envelope leaves the floor or ceiling")
    if (props.boxes.some((box) => cuboidTranslationHits({ relative: shoe, from: [0, 0, 0], to: [0, 0, 0], obstacle: box, tolerance: 1e-12 })))
      return new Error("Native shoe envelope intersects a solid")
  }

  return null
}
