import { getOutdoorReservationErrors } from "#/scripts/lib/get-outdoor-reservation-errors"
import type { getWindmillYardSiteReview } from "#/scripts/lib/get-windmill-yard-site-review"
type Props = Readonly<{ review: Exclude<ReturnType<typeof getWindmillYardSiteReview>, Error | null>; ground: Omit<Parameters<typeof getOutdoorReservationErrors>[0], "bounds"> }>

/** Preserve complete road and river widths and every other site or retained field; only the study's own footprint is excluded. */
export function getWindmillYardSiteErrors(props: Props): readonly string[] {
  const ownIds = new Set([props.review.footprint.id, ...(props.review.approach?.bounds ?? []).map((_, index) => `${props.review.footprint.id}/approach-${index + 1}`)])
  const obstacles = props.ground.obstacles.filter((obstacle) => !ownIds.has(obstacle.id))
  const errors = [...getOutdoorReservationErrors({ ...props.ground, bounds: props.review.footprint.rect, obstacles })]
  for (const entry of (props.review.approach?.bounds ?? []).entries()) {
    const corridorGround = {
      ...props.ground,
      bounds: entry[1],
      obstacles: entry[0] === 0 ? obstacles : [...obstacles, { id: props.review.footprint.id, rect: props.review.footprint.rect }],
      corridors: props.ground.corridors.filter((corridor) => entry[0] !== (props.review.approach?.bounds.length ?? 0) - 1 || corridor.id !== props.review.approach?.roadId),
    }
    errors.push(...getOutdoorReservationErrors(corridorGround).map((error) => `Approach ${entry[0] + 1}: ${error}`))
  }
  return errors
}
