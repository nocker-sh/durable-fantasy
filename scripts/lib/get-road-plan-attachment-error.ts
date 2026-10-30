import { z } from "zod"
import { segmentRectDistance } from "#/lib/engine/segment-rect-distance"
import { getStockLockRoadAttachmentError } from "#/scripts/lib/get-stock-lock-road-attachment-error"
import type { mapRoadPlanSchema } from "#/scripts/lib/map-road-plan-schema"
import type { Road } from "#/world/maps/layout-types"
import type { SettingDocument } from "#/scripts/lib/setting-document"
type Attachment = z.infer<typeof mapRoadPlanSchema>["changes"][number]["start"]
type Props = Readonly<{
  attachment: Attachment
  point: readonly [number, number]
  original: readonly [number, number]
  roadIndex: number
  roads: readonly Road[]
  documents: ReadonlyMap<string, SettingDocument>
  map: string
}>
const approachesSchema = z.object({ approaches: z.array(z.object({ points_tiles: z.array(z.tuple([z.number(), z.number()])).min(2) })) })

/** Reattached branches must really meet a planned road or the reviewed doorway approach, not merely name one. */
export function getRoadPlanAttachmentError(props: Props): Error | null {
  const attachment = props.attachment,
    point = props.point
  if (attachment.kind === "preserved") {
    if (point[0] !== props.original[0] || point[1] !== props.original[1]) return new Error("Road plan moves a preserved endpoint")
    return null
  }
  if (attachment.kind === "road") {
    const target = props.roads[attachment.source_index]
    if (
      !target ||
      attachment.source_index === props.roadIndex ||
      !target.pts.slice(1).some((end, index) => segmentRectDistance([point[0], point[1], point[0], point[1]], target.pts[index], end) < 1e-8)
    )
      return new Error("Road plan endpoint has no matching junction")
    return null
  }
  if (attachment.kind === "stock_lock") return getStockLockRoadAttachmentError({ facility: props.documents.get(attachment.facility) ?? null, point, map: props.map, roadIndex: props.roadIndex })
  const building = props.documents.get(attachment.building),
    site = approachesSchema.safeParse(building?.site_plan)
  if (
    building?.kind !== "buildings" ||
    building.map !== props.map ||
    !site.success ||
    !site.data.approaches.some((approach) => approach.points_tiles.at(-1)?.every((value, index) => Math.abs(value - point[index]) < 1e-8))
  )
    return new Error("Road plan endpoint has no building approach")

  return null
}
