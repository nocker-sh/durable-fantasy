import { getHotWaterPouringReview } from "#/scripts/lib/get-hot-water-pouring-review"
import { RESIDENTS, RESIDENT_LOOKS } from "#/world/town/residents"
import type { HotWaterReviewInput as Props, HotWaterFrameContext } from "#/scripts/lib/hot-water-frame-types"

/** 保持と注湯が同じ部屋・器・杯・身体の定義を使う。 */
export function getHotWaterFrameContext(props: Props): HotWaterFrameContext | Error {
  const review = getHotWaterPouringReview({ room: props.room, plan: props.definition.plan, profile: props.definition.profile })
  if (review instanceof Error) return review
  const actor = props.documents.get(props.definition.plan.operator)
  const look = RESIDENT_LOOKS[RESIDENTS.findIndex((resident) => resident.name === actor?.title)]
  if (!look || !props.room.grid) return new Error("Pouring review has no native operator")
  return { room: props.room, definition: props.definition, review, look }
}
