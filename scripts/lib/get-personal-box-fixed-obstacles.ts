import { getPersonalBoxLidReview } from "#/scripts/lib/get-personal-box-lid-review"
import { getPersonalBoxLidSupport } from "#/scripts/lib/get-personal-box-lid-support"
import { getRoomStorageSection } from "#/scripts/lib/get-room-storage-section"
import { getStorageBoxContentBounds } from "#/world/town/get-storage-box-content-bounds"
type Props = Parameters<typeof getPersonalBoxLidReview>[0]

/** Static and interval checks resolve the same fixed box, parcels, support boards, walls and other furniture. */
export function getPersonalBoxFixedObstacles(props: Props) {
  const review = getPersonalBoxLidReview(props),
    support = getPersonalBoxLidSupport(props),
    plan = props.slot.packing
  if (review instanceof Error) return review
  if (support instanceof Error) return support
  if (!plan) return new Error("Personal box has no measured contents")
  const symbols = [String(props.slot.furniture_symbol)]
  if (support) symbols.push(support.symbol)
  const section = getRoomStorageSection(props.room, props.building, symbols)
  if (section instanceof Error) return section
  const bottom = review.body.find((part) => part.part === "bottom")
  if (!bottom) return new Error("Personal box has no physical bottom")
  const contents = getStorageBoxContentBounds({
    box: { ...bottom, y1: plan.height_m },
    wall: plan.wall_m,
    contents: plan.objects.map((piece) => ({ id: piece.id, origin: piece.position_m, size: piece.size_m })),
  })
  const fixed = review.body.map((part) => ({ x0: part.x0, x1: part.x1, z0: part.z0, z1: part.z1, bottom: part.y0, top: part.y1 }))

  return { ceiling: section.ceiling, obstacles: [...section.obstacles, ...fixed, ...contents, ...(support?.obstacles ?? [])] }
}
