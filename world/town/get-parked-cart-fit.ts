import { PARKED_CART_SHAPE } from "#/world/town/parked-cart-shape"

/** Rotate the whole cart towards the long axis and scale uniformly, preserving round wheels and the complete shaft reservation. */
export function getParkedCartFit(size: readonly [number, number]) {
  if (!size.every((value) => Number.isFinite(value) && value > 0)) return new Error("Invalid parked cart footprint")
  const scale = Math.min(Math.min(...size) / PARKED_CART_SHAPE.width, Math.max(...size) / PARKED_CART_SHAPE.length),
    fit = { scale, turn: 0 }
  if (!Number.isFinite(Math.fround(scale)) || Math.fround(scale) <= 0) return new Error("Unbounded parked cart scale")
  if (size[0] > size[1]) fit.turn = Math.PI / 2

  return fit
}
