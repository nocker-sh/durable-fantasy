import type { Group } from "three"
import { parkedCart } from "#/world/scene/construction/parked-cart"
import { groundH } from "#/world/scene/ground-h"
import { SIZES } from "#/world/town/fit"

/** The inspection uses the same empty cart and complete footprint as the interior. */
export function buildParkedCart(root: Group, x: number, z: number): void {
  const size = SIZES.荷車
  if (!size || size === "wall") throw new Error("Missing cart footprint")
  const cart = parkedCart({ at: [x, z], size: [size.w, size.d], floor: groundH(x, z) })
  if (cart instanceof Error) throw cart
  root.add(cart)
}
