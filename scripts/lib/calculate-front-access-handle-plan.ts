import { getFrontAccessTopStorage } from "#/scripts/lib/get-front-access-top-storage"
import { getFrontAccessStorageReview } from "#/scripts/lib/get-front-access-storage-review"
import { getRoomStorageSection } from "#/scripts/lib/get-room-storage-section"
import { getRaisedCabinetPlan } from "#/world/town/get-raised-cabinet-plan"
import { getFrontAccessStorageRetrievalError } from "#/scripts/lib/get-front-access-storage-retrieval-error"
import { getCabinetRoomBoundsError } from "#/world/town/get-cabinet-room-bounds-error"
import type { RaisedCabinetHandleSpec } from "#/world/town/raised-cabinet-handle-types"
import type { SettingDocument } from "#/scripts/lib/setting-document"
type Props = Omit<Parameters<typeof getFrontAccessStorageReview>[0], "cell"> & Readonly<{ room: SettingDocument; building: SettingDocument | undefined }>

/** The handle alternative keeps the same owner's parcels and suppliers, but uses solid leaves and complete attached hardware. */
export function calculateFrontAccessHandlePlan(props: Props) {
  const source = props.slot.packing?.front_access?.handle_review,
    review = getFrontAccessStorageReview({ slot: props.slot, cell: props.room.grid?.cell_m ?? NaN })
  if (!source || source.operator !== props.slot.resident || review instanceof Error) return new Error("Missing matching raised-handle proposal")
  const handleSource = source.handle
  if (handleSource.north_id !== `${props.slot.id}:front-handle-north` || handleSource.south_id !== `${props.slot.id}:front-handle-south`)
    return new Error("Raised handle belongs to another personal storage")
  const section = getRoomStorageSection(props.room, props.building, ["C", "R"])
  if (section instanceof Error) return section
  const topStorage = getFrontAccessTopStorage({ ...props, spec: review.spec, section })
  if (topStorage instanceof Error) return topStorage
  const topObjects = topStorage.boxes
  const fixedObstacles = [...section.obstacles, ...topObjects],
    handle: RaisedCabinetHandleSpec = {
      northTravel: handleSource.north_travel_m,
      northId: handleSource.north_id,
      southId: handleSource.south_id,
      northFromMeeting: handleSource.north_from_meeting_m,
      southFromMeeting: handleSource.south_from_meeting_m,
      centreY: handleSource.centre_y_m,
      height: handleSource.height_m,
      standOff: handleSource.stand_off_m,
      thickness: handleSource.thickness_m,
    }
  const plan = getRaisedCabinetPlan({ spec: review.spec, handle, obstacles: [...review.contents, ...fixedObstacles] })
  if (plan instanceof Error) return plan
  const retrieval = getFrontAccessStorageRetrievalError({
    spec: review.spec,
    contents: review.contents,
    clearance: props.slot.packing?.clearance_m ?? 0,
    plan: {
      ...plan,
      cavity: review.cavity,
      fixed: [...plan.fixed, ...fixedObstacles],
      closed: { north: plan.closed.north.all, south: plan.closed.south.all },
      open: { north: plan.open.north.all, south: plan.open.south.all },
    },
  })
  if (retrieval) return retrieval
  const room = getCabinetRoomBoundsError({ parts: [...plan.closed.north.all, ...plan.closed.south.all, ...plan.open.north.all, ...plan.open.south.all], section })
  if (room) return room

  return { ...plan, source, handle, spec: review.spec, contents: review.contents, section, spareBlanket: topStorage.spareBlanket, sparePillowCover: topStorage.sparePillowCover, topObjects }
}
