import { parkedCartDepartureSchema } from "#/scripts/lib/parked-cart-departure-schema"
import { z } from "zod"
import { doorLeafGeometrySchema } from "#/scripts/lib/door-leaf-geometry-schema"
import { getParkedCartFit } from "#/world/town/get-parked-cart-fit"
import { PARKED_CART_SHAPE } from "#/world/town/parked-cart-shape"
import { getCargoDoorFrames } from "#/scripts/lib/get-cargo-door-frames"
import { getRoomOpenDoorPanels } from "#/scripts/lib/get-room-open-door-panels"
import type { SettingDocument } from "#/scripts/lib/setting-document"

/** Resolve the actual cart reservation and fitted doors before testing motion; do not invent a smaller travelling cart. */
export function getParkedCartDepartureContext(room: SettingDocument) {
  const parsed = parkedCartDepartureSchema.safeParse(room.parked_cart_departure),
    grid = room.grid
  if (!parsed.success || !grid || room.kind !== "rooms" || room.design_gate === "通過") return new Error("Invalid proposed cart departure")
  const plan = parsed.data,
    cart = room.furniture?.find((piece) => piece.symbol === plan.furniture),
    frames = getCargoDoorFrames(room),
    panels = getRoomOpenDoorPanels(room)
  const leaves = z.array(doorLeafGeometrySchema).safeParse(room.door_leaves)
  if (!leaves.success || leaves.data.some((leaf) => leaf.thickness_m === undefined || leaf.fittings === undefined)) return new Error("Cart departure needs complete fitted panels")
  if (!cart || cart.role !== "parked_cart" || cart.runtime_kind !== "parked-cart" || !cart.maintainers?.includes(plan.operator)) return new Error("Cart departure has no maintained cart")
  if (frames instanceof Error) return frames
  if (panels instanceof Error) return panels
  const size: readonly [number, number] = [cart.rect[2] * grid.cell_m, cart.rect[3] * grid.cell_m],
    fit = getParkedCartFit(size)
  if (fit instanceof Error) return fit
  if (fit.turn !== 0) return new Error("Reverse departure requires north-facing shafts")
  const halfWidth = (PARKED_CART_SHAPE.width * fit.scale) / 2,
    halfLength = (PARKED_CART_SHAPE.length * fit.scale) / 2
  const relative: readonly [number, number, number, number] = [-halfWidth, -halfLength, halfWidth, halfLength]
  const origin: readonly [number, number] = [(cart.rect[0] + cart.rect[2] / 2) * grid.cell_m, (cart.rect[1] + cart.rect[3] / 2) * grid.cell_m]

  return { grid, plan, cart, relative, origin, obstacles: [...frames, ...panels], operatorOffset: halfLength + plan.body_radius_m + plan.handling_gap_m }
}
