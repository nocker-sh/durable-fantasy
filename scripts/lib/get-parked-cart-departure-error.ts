import { getParkedCartDepartureContext } from "#/scripts/lib/get-parked-cart-departure-context"
import { getCartDepartureReservationError } from "#/scripts/lib/get-cart-departure-reservation-error"
import { getCartDepartureSegmentError } from "#/scripts/lib/get-cart-departure-segment-error"
import type { SettingDocument } from "#/scripts/lib/setting-document"

/** This verifies only the declared empty reverse reservation, never the unassigned site, lifting force or a live cart routine. */
export function getParkedCartDepartureError(room: SettingDocument, documents: ReadonlyMap<string, SettingDocument>): Error | null {
  if (room.parked_cart_departure === undefined) return null
  const context = getParkedCartDepartureContext(room)
  if (context instanceof Error) return context
  const reservationError = getCartDepartureReservationError({ room, documents, context })
  if (reservationError) return reservationError
  for (const index of context.plan.points_m.keys()) {
    if (index === 0) continue
    const error = getCartDepartureSegmentError({ context, from: context.plan.points_m[index - 1], to: context.plan.points_m[index] })
    if (error) return error
  }

  return null
}
