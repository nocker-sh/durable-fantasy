import { quarterTurnRect } from "#/lib/engine/quarter-turn-rect"
import type { LayoutBox } from "#/lib/engine/get-box-layout-error"
import type { getTablewareInventory } from "#/scripts/lib/get-tableware-inventory"
import type { tablePlaceSettingsSchema } from "#/scripts/lib/table-place-settings-schema"
import type { SettingDocument } from "#/scripts/lib/setting-document"
import type { z } from "zod"
type Inventory = Exclude<ReturnType<typeof getTablewareInventory>, Error>
type Props = { inventory: Inventory; plan: z.infer<typeof tablePlaceSettingsSchema>; documents: ReadonlyMap<string, SettingDocument> }

/** Assign the inventory once, preserving each owner's physical object and its upright or flat use. */
export function getPlaceSettingBoxes(props: Props): readonly LayoutBox[] | Error {
  const places = props.plan.places,
    seats = props.inventory.meal.seats
  if (
    places.length !== seats.length ||
    new Set(places.map((place) => place.resident)).size !== seats.length ||
    seats.some((seat) => !places.some((place) => place.resident === seat.resident && place.chair === seat.chair))
  )
    return new Error("Tabletop settings do not match every assigned diner")
  const ids = places.flatMap((place) => place.items.map((item) => item.id))
  if (ids.length !== props.inventory.items.length || new Set(ids).size !== ids.length) return new Error("Meal tableware is missing or assigned more than once")
  const boxes: LayoutBox[] = []
  for (const place of places) {
    const owner = props.documents.get(place.resident)
    if (owner?.kind !== "residents") return new Error("Tabletop diner is unavailable")
    for (const assigned of place.items) {
      const item = props.inventory.items.find((candidate) => candidate.id === assigned.id)
      if (!item || item.owner !== owner.title) return new Error("Tabletop object does not belong to its diner")
      if ((item.kind !== "spoon" && assigned.orientation !== "upright") || (item.kind === "spoon" && assigned.orientation !== "flat")) return new Error("Tabletop object has an unsuitable orientation")
      const footprint = quarterTurnRect({ bounds: { x0: 0, z0: 0, x1: item.width_m, z1: item.depth_m }, turn: assigned.quarter_turns })
      boxes.push({ id: item.id, origin: [assigned.position_m[0], 0, assigned.position_m[1]], size: [footprint.x1 - footprint.x0, item.height_m, footprint.z1 - footprint.z0] })
    }
  }

  return boxes
}
