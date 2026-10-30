import { createFrontAccessPlanFrame } from "#/scripts/lib/create-front-access-plan-frame"
import { getFrontAccessStorageLayoutError } from "#/scripts/lib/get-front-access-storage-layout-error"
import { getFrontAccessStorageReview } from "#/scripts/lib/get-front-access-storage-review"
import { getFrontAccessStorageRoomError } from "#/scripts/lib/get-front-access-storage-room-error"
import { getFrontAccessApproachError } from "#/scripts/lib/get-front-access-approach-error"
import { getFrontAccessHandleError } from "#/scripts/lib/get-front-access-handle-error"
import { getFrontAccessHandleStepError } from "#/scripts/lib/get-front-access-handle-step-error"
import { getFrontAccessHandlePlan } from "#/scripts/lib/get-front-access-handle-plan"
import type { SettingDocument } from "#/scripts/lib/setting-document"
type Props = Parameters<typeof getFrontAccessStorageLayoutError>[0] & { building: SettingDocument | undefined }

/** An alternative changes the furniture, never the identity or folded size of the owner's existing belongings. */
export function getFrontAccessStorageError(props: Props): Error | null {
  const packing = props.slot.packing,
    source = packing?.front_access
  if (!source) return null
  const layout = getFrontAccessStorageLayoutError(props)
  if (layout) return layout
  for (const piece of source.objects) {
    const original = packing?.objects.find((candidate) => candidate.id === piece.id)
    if (
      !original ||
      piece.size_m[1] !== original.size_m[1] ||
      ![
        [original.size_m[0], original.size_m[2]],
        [original.size_m[2], original.size_m[0]],
      ].some((size) => size[0] === piece.size_m[0] && size[1] === piece.size_m[2])
    )
      return new Error("Front-access alternative changes an owned parcel")
  }
  const review = getFrontAccessStorageReview({ slot: props.slot, cell: props.room.grid?.cell_m ?? NaN })
  if (review instanceof Error) return review
  const room = getFrontAccessStorageRoomError({ ...props, review })
  if (room) return room
  const shared = { ...props, prepared: createFrontAccessPlanFrame(props) }
  if (source.spare_blanket || source.spare_pillow_cover) {
    const spare = getFrontAccessHandlePlan(shared)
    if (spare instanceof Error) return spare
  }
  return getFrontAccessApproachError(shared) ?? getFrontAccessHandleError(shared) ?? getFrontAccessHandleStepError(shared)
}
