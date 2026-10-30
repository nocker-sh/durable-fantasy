import { mapRoadPlanSchema } from "#/scripts/lib/map-road-plan-schema"
import { getRoadPlanAttachmentError } from "#/scripts/lib/get-road-plan-attachment-error"
import type { Road } from "#/world/maps/layout-types"
import type { SettingDocument } from "#/scripts/lib/setting-document"
type Props = Readonly<{ map: SettingDocument; roads: readonly Road[]; documents: ReadonlyMap<string, SettingDocument> }>

/** Apply the whole proposal together, retaining every source road and its width/material; stale source anchors fail closed. */
export function getPlannedMapRoads(props: Props): Road[] | Error {
  const roads = props.roads.map((road) => ({ ...road, pts: road.pts.map((point) => [...point] satisfies [number, number]) }))
  if (props.map.road_plan === undefined) return roads
  const parsed = mapRoadPlanSchema.safeParse(props.map.road_plan),
    seen = new Set<number>()
  if (!parsed.success || props.map.kind !== "maps" || props.map.design_gate === "通過") return new Error("Invalid proposed map roads")
  for (const change of parsed.data.changes) {
    const original = props.roads[change.source_index]
    if (
      !original ||
      seen.has(change.source_index) ||
      !change.source_start.every((value, axis) => value === original.pts[0]?.[axis]) ||
      !change.source_end.every((value, axis) => value === original.pts.at(-1)?.[axis])
    )
      return new Error("Road plan has a duplicate or stale source")
    seen.add(change.source_index)
    if (change.points_tiles.slice(1).some((point, index) => point[0] === change.points_tiles[index][0] && point[1] === change.points_tiles[index][1]))
      return new Error("Road plan has a zero-length segment")
    roads[change.source_index] = { ...original, pts: change.points_tiles }
  }
  for (const change of parsed.data.changes)
    for (const endpoint of [
      { attachment: change.start, point: roads[change.source_index].pts[0], original: change.source_start },
      { attachment: change.end, point: roads[change.source_index].pts[roads[change.source_index].pts.length - 1], original: change.source_end },
    ]) {
      const error = getRoadPlanAttachmentError({ ...endpoint, roadIndex: change.source_index, roads, documents: props.documents, map: props.map.id })
      if (error) return error
    }

  return roads
}
