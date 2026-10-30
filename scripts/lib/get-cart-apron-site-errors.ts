import { parkedCartDepartureSchema } from "#/scripts/lib/parked-cart-departure-schema"
import { getRoomSiteRectangle } from "#/scripts/lib/get-room-site-rectangle"
import { getOutdoorReservationErrors } from "#/scripts/lib/get-outdoor-reservation-errors"
import type { SettingDocument } from "#/scripts/lib/setting-document"
type Props = Readonly<{ room: SettingDocument; documents: ReadonlyMap<string, SettingDocument>; metresPerTile: number; ground: Omit<Parameters<typeof getOutdoorReservationErrors>[0], "bounds"> }>

/** A site proposal must reserve the cart apron as well as the walls; a missing site remains explicitly unassigned. */
export function getCartApronSiteErrors(props: Props): readonly string[] {
  if (props.room.parked_cart_departure === undefined) return []
  const parsed = parkedCartDepartureSchema.safeParse(props.room.parked_cart_departure),
    building = props.documents.get(String(props.room.building))
  if (!parsed.success || building?.kind !== "buildings") return ["Cart apron has no valid building or departure plan"]
  if (building.site_plan === undefined) return []
  const bounds = getRoomSiteRectangle({ building, room: props.room, rect: parsed.data.exterior_apron.rect_m, metresPerTile: props.metresPerTile })
  if (bounds instanceof Error) return [bounds.message]

  return getOutdoorReservationErrors({ ...props.ground, bounds })
}
