import type { Primitive } from "#/lib/graphics/ray/primitive-types"
import type { Cuboid } from "#/lib/engine/cuboid-subtraction"

/** Native component bounds cover each rendered garment span; touching a support is allowed, entering it is not. */
export function canRestGarmentOnSeat(primitive: Primitive, seat: Cuboid): boolean {
  if (![seat.x0, seat.x1, seat.bottom, seat.top, seat.z0, seat.z1].every(Number.isFinite) || seat.x0 >= seat.x1 || seat.bottom >= seat.top || seat.z0 >= seat.z1) return false
  const bounds = primitive.boxBounds?.()

  return Boolean(
    bounds?.length &&
    bounds.every(
      (box) =>
        [...box.min, ...box.max].every(Number.isFinite) &&
        box.min.every((value, axis) => value <= box.max[axis]) &&
        (box.min[0] >= seat.x1 || box.max[0] <= seat.x0 || box.min[1] >= seat.top || box.max[1] <= seat.bottom || box.min[2] >= seat.z1 || box.max[2] <= seat.z0),
    ),
  )
}
