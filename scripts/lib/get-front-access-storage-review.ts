import { getSlidingCabinetPlan } from "#/world/town/get-sliding-cabinet-plan"
import { getBoxLayoutError } from "#/lib/engine/get-box-layout-error"
import { getFrontAccessStorageRetrievalError } from "#/scripts/lib/get-front-access-storage-retrieval-error"
import type { personalStorageSchema } from "#/scripts/lib/personal-storage-schema"
import type { SlidingCabinetSpec } from "#/world/town/sliding-cabinet-types"
import type { z } from "zod"
type Props = Readonly<{ slot: z.infer<typeof personalStorageSchema>[number]; cell: number }>

/** The alternative reuses the owner's exact parcels, rotating footprints rather than inventing smaller belongings. */
export function getFrontAccessStorageReview(props: Props) {
  const source = props.slot.packing?.front_access
  if (!source || !Number.isFinite(props.cell) || props.cell <= 0) return new Error("Missing front-access storage dimensions")
  const r = source.rect,
    spec: SlidingCabinetSpec = {
      bounds: { x0: r[0] * props.cell, x1: (r[0] + r[2]) * props.cell, z0: r[1] * props.cell, z1: (r[1] + r[3]) * props.cell, bottom: 0, top: source.top_m },
      storageFloor: source.storage_floor_m,
      board: source.board_m,
      legWidth: source.leg_width_m,
      panel: source.panel_m,
      guide: source.guide_m,
      overlap: source.overlap_m,
      rearTravel: source.rear_travel_m,
      pull: {
        bottom: source.pull.bottom_m,
        height: source.pull.height_m,
        width: source.pull.width_m,
        fromMeeting: source.pull.from_meeting_m,
        southFromMeeting: source.pull.south_from_meeting_m,
        southWidth: source.pull.south_width_m,
      },
    }
  const empty = getSlidingCabinetPlan({ spec, contents: [] })
  if (empty instanceof Error) return empty
  const c = empty.cavity,
    objects = source.objects.map((piece) => ({ id: piece.id, origin: piece.position_m, size: piece.size_m }))
  const layout = getBoxLayoutError({ size: [c.x1 - c.x0, c.top - c.bottom, c.z1 - c.z0], boxes: objects, gap: props.slot.packing?.clearance_m ?? 0 })
  if (layout) return layout
  if (objects.some((piece) => piece.origin[1] !== 0)) return new Error("Front-access belongings need direct shelf support")
  const contents = objects.map((piece) => ({
    x0: c.x0 + piece.origin[0],
    x1: c.x0 + piece.origin[0] + piece.size[0],
    bottom: c.bottom + piece.origin[1],
    top: c.bottom + piece.origin[1] + piece.size[1],
    z0: c.z0 + piece.origin[2],
    z1: c.z0 + piece.origin[2] + piece.size[2],
  }))
  const plan = getSlidingCabinetPlan({ spec, contents })
  if (plan instanceof Error) return plan
  const retrieval = getFrontAccessStorageRetrievalError({ spec, plan, contents, clearance: props.slot.packing?.clearance_m ?? 0 })
  if (retrieval) return retrieval

  return { ...plan, spec, contents }
}
