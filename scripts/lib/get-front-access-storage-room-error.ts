import { getRoomStorageSection } from "#/scripts/lib/get-room-storage-section"
import { cuboidTranslationHits } from "#/lib/engine/cuboid-translation-hits"
import type { SettingDocument } from "#/scripts/lib/setting-document"
import type { getFrontAccessStorageReview } from "#/scripts/lib/get-front-access-storage-review"
type Props = Readonly<{ room: SettingDocument; building: SettingDocument | undefined; review: Exclude<ReturnType<typeof getFrontAccessStorageReview>, Error> }>

/** Replacement storage retains the actual room ceiling and unrelated furniture; an unknown roof or beam remains outside this certificate. */
export function getFrontAccessStorageRoomError(props: Props): Error | null {
  const section = getRoomStorageSection(props.room, props.building, ["C", "R"])
  if (section instanceof Error) return section
  const box = props.review.spec.bounds,
    bounds = section.bounds
  if (box.x0 < bounds.x0 || box.x1 > bounds.x1 || box.z0 < bounds.z0 || box.z1 > bounds.z1 || box.bottom < 0 || box.top > section.ceiling)
    return new Error("Front-access storage leaves the checked room section")
  if (section.obstacles.some((obstacle) => cuboidTranslationHits({ relative: box, from: [0, 0, 0], to: [0, 0, 0], obstacle: obstacle, tolerance: 1e-12 })))
    return new Error("Front-access storage intersects unrelated room furniture or walls")

  return null
}
