import { MIN_PASSAGE_WIDTH_M } from "#/scripts/lib/spatial-rules"
import type { SettingDocument } from "#/scripts/lib/setting-document"
import { segmentRectDistance } from "#/lib/engine/segment-rect-distance"
import { segmentSegmentDistance } from "#/lib/engine/segment-segment-distance"
import { auditBuildingSite } from "#/scripts/lib/audit-building-site"
import { getSiteDoorPose } from "#/scripts/lib/get-site-door-pose"
type House = { id: string; map: string; x0: number; z0: number; x1: number; z1: number }
type Approach = { room: string; door: number[]; width_m: number; points_tiles: number[][] }
type ApproachGround = { map_tiles: number; watercourses: readonly { name: string; points: readonly (readonly number[])[]; half_width: number }[] }
/** Approaches are drawn from the actual rotated doorway, not from the old outdoor door marker. */
type Props = {
  building: SettingDocument
  documents: ReadonlyMap<string, SettingDocument>
  houses: readonly House[]
  metresPerTile: number
  roads: readonly { pts: readonly (readonly number[])[]; w: number }[]
  obstacles?: readonly { id: string; map: string; rect: readonly [number, number, number, number] }[]
  ground?: ApproachGround
}
export function auditSiteApproaches(props: Props): string[] {
  const building = props.building
  const documents = props.documents
  const houses = props.houses
  const metresPerTile = props.metresPerTile
  const roads = props.roads
  const obstacles = props.obstacles === undefined ? [] : props.obstacles
  const ground = props.ground

  const site = building.site_plan as { origin: number[]; rotation_quarters: number; approaches?: Approach[] } | undefined
  const layout = building.layout as { width: number; depth: number; cell_m: number } | undefined
  if (!site || !layout) return []
  if (!Array.isArray(site.approaches)) return building.design_gate === "通過" ? ["Missing doorway approaches"] : []
  const ownBounds = auditBuildingSite({ building: building, houses: [], metresPerTile: metresPerTile, roads: [] }).bounds
  if (!ownBounds) return ["Invalid site transform for approaches"]
  const errors: string[] = [],
    registered = new Set<string>()
  for (const approach of site.approaches) {
    const room = documents.get(approach.room),
      key = `${approach.room}:${approach.door}`
    if (registered.has(key)) errors.push("Duplicate doorway approach")
    registered.add(key)
    const connection = (room?.connections as { door?: number[]; target: string; width_cells?: number }[] | undefined)?.find(
      (c) => c.target === building.map && c.door?.[0] === approach.door?.[0] && c.door?.[1] === approach.door?.[1],
    )
    if (!connection || !room?.grid || room.building !== building.id || room.floor !== 0 || !Array.isArray(room.origin)) {
      errors.push("Approach has no matching ground-floor exterior door")
      continue
    }
    const points = approach.points_tiles,
      routeWidth = approach.width_m / metresPerTile
    if (
      !Number.isFinite(routeWidth) ||
      routeWidth < MIN_PASSAGE_WIDTH_M / metresPerTile ||
      !Array.isArray(points) ||
      points.length < 2 ||
      points.some((p) => !Array.isArray(p) || p.length !== 2 || p.some((n) => !Number.isFinite(n)))
    ) {
      errors.push("Invalid approach width or points")
      continue
    }
    const pose = getSiteDoorPose({
      grid: room.grid,
      room_origin: room.origin as number[],
      door: approach.door,
      span: connection.width_cells ?? 1,
      site_origin: site.origin,
      width_m: layout.width * layout.cell_m,
      depth_m: layout.depth * layout.cell_m,
      rotation_quarters: site.rotation_quarters,
      metres_per_tile: metresPerTile,
    })
    if (!pose) {
      errors.push("Approach has no valid boundary doorway")
      continue
    }
    if (approach.width_m > pose.width_m + 1e-9) errors.push("Approach is wider than its door")
    const doorPointSource = pose,
      doorPoint = doorPointSource.point,
      outward = doorPointSource.outward
    if (Math.hypot(points[0][0] - doorPoint[0], points[0][1] - doorPoint[1]) > 1e-6) errors.push("Approach starts away from its rotated doorway")
    if ((points[1][0] - points[0][0]) * outward[0] + (points[1][1] - points[0][1]) * outward[1] <= 0) errors.push("Approach does not leave the building outward")
    for (let i = 1; i < points.length; i++) {
      if (ground) {
        if (points.slice(i - 1, i + 1).some((p) => p.some((n) => n - routeWidth / 2 < 0 || n + routeWidth / 2 > ground.map_tiles))) errors.push("Approach leaves its map")
        for (const water of ground.watercourses)
          if (water.points.slice(1).some((p, j) => segmentSegmentDistance({ from: points[i - 1], to: points[i], otherFrom: water.points[j], otherTo: p }) < water.half_width + routeWidth / 2))
            errors.push(`Approach crosses watercourse ${water.name}`)
      }
      for (const obstacle of obstacles)
        if (obstacle.map === building.map && segmentRectDistance(obstacle.rect, points[i - 1], points[i]) < routeWidth / 2) errors.push(`Approach crosses ${obstacle.id}`)
      if (i > 1 && segmentRectDistance(ownBounds, points[i - 1], points[i]) < routeWidth / 2) errors.push("Approach returns through its own building")
      for (const house of houses)
        if (`building-${house.id}` !== building.id && `map-${house.map}` === building.map && segmentRectDistance([house.x0, house.z0, house.x1, house.z1], points[i - 1], points[i]) < routeWidth / 2)
          errors.push(`Approach crosses building-${house.id}`)
    }
    const end = points.at(-1)!
    if (!roads.some((road) => road.pts.slice(1).some((point, i) => segmentRectDistance([end[0], end[1], end[0], end[1]], road.pts[i], point) <= road.w))) errors.push("Approach does not meet a road")
  }
  for (const id of (building.rooms ?? []) as string[])
    for (const connection of (documents.get(id)?.connections ?? []) as { target: string; door?: number[] }[])
      if (connection.target === building.map && connection.door && !registered.has(`${id}:${connection.door}`)) errors.push(`${id}: exterior door has no approach`)
  return [...new Set(errors)]
}
