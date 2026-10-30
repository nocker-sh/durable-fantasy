import { getDinerArmPreparationError } from "#/scripts/lib/get-diner-arm-preparation-error"
import { getDinerObjectReachError } from "#/scripts/lib/get-diner-object-reach-error"
import { getDiningReachSpace } from "#/scripts/lib/get-dining-reach-space"
import { getNativeDiningSeatError } from "#/scripts/lib/get-native-dining-seat-error"
import type { Look } from "#/world/scene/figure/look"
import type { LayoutBox } from "#/lib/engine/get-box-layout-error"
import type { getDiningSeatGeometry } from "#/scripts/lib/get-dining-seat-geometry"
import type { tablePlaceSettingsSchema } from "#/scripts/lib/table-place-settings-schema"
import type { z } from "zod"
type Place = z.infer<typeof tablePlaceSettingsSchema>["places"][number]
type Geometry = Exclude<ReturnType<typeof getDiningSeatGeometry>, Error>
type Props = { look: Look; place: Place; geometry: Geometry; boxes: readonly LayoutBox[]; origin: readonly [number, number] }

/** Keep the same authored space for native withdrawal and above-object ready-pose checks. */
export function getDinerTableReachError(props: Props): Error | null {
  const review = props.place.reach_review
  if (!review) return null
  const seatError = getNativeDiningSeatError(props.look, props.geometry)
  if (seatError) return seatError
  const space = getDiningReachSpace(props.geometry, props.boxes, props.origin)
  if (space instanceof Error) return space
  const preparation = getDinerArmPreparationError({ look: props.look, geometry: props.geometry, review, obstacles: space.obstacles })
  if (preparation) return preparation
  for (const assigned of props.place.items) {
    const box = props.boxes.find((item) => item.id === assigned.id)
    if (!box) return new Error("Dining reach has no matching tableware")
    const target = [props.origin[0] + box.origin[0] + box.size[0] / 2, space.height + box.size[1] + review.hover_above_m, props.origin[1] + box.origin[2] + box.size[2] / 2] satisfies [
      number,
      number,
      number,
    ]
    const error = getDinerObjectReachError({ look: props.look, place: props.geometry.place, target, review, obstacles: space.obstacles })
    if (error) return new Error(`${assigned.id}: ${error.message}`, { cause: error })
  }

  return null
}
