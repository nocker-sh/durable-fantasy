import type { textileOrdersSchema } from "#/scripts/lib/textile-orders-schema"
import type { SettingDocument } from "#/scripts/lib/setting-document"
import type { z } from "zod"
type Props = Readonly<{ supplier: SettingDocument; order: z.infer<typeof textileOrdersSchema>[number]; documents: ReadonlyMap<string, SettingDocument> }>

/** A spinning allocation names a real work face and its proposed user, without claiming that the machine or time slot is available. */
export function getTextileOrderWorkplaceError(props: Props): Error | null {
  if (props.order.stage !== "spin") return null
  const site = props.order.workplace
  if (!site) return new Error("Spinning order has no matching workplace and operator")
  const room = props.documents.get(site.room),
    supplier = props.supplier
  if (
    room?.kind !== "rooms" ||
    typeof supplier.town !== "string" ||
    !supplier.town ||
    room.town !== supplier.town ||
    supplier.kind !== "residents" ||
    !Array.isArray(room.users) ||
    !room.users.includes(supplier.id)
  )
    return new Error("Spinning order has no matching workplace and operator")
  const equipment = room.furniture?.filter((piece) => piece.symbol === site.furniture)
  if (equipment?.length !== 1 || equipment[0].role !== "spinning_wheel" || !equipment[0].access.length || !equipment[0].use_space?.length)
    return new Error("Spinning order has no dedicated spinning-wheel work face")

  return null
}
