import { getWindmillYardSiteGeometry } from "#/scripts/lib/get-windmill-yard-site-geometry"
import { siteDoorPose } from "#/scripts/lib/site-door"
import { MIN_PASSAGE_WIDTH_M } from "#/scripts/lib/spatial-rules"
import type { z } from "zod"
import type { windmillYardSiteSchema } from "#/scripts/lib/windmill-yard-site-schema"
import type { SettingDocument } from "#/scripts/lib/setting-document"
import type { Road } from "#/world/maps/layout-types"
type Props = Readonly<{ grid: NonNullable<SettingDocument["grid"]>; site: z.infer<typeof windmillYardSiteSchema>; roads: readonly Road[]; metresPerTile: number }>

/** 開口と道路端を実寸で結び、幅全体を農地と障害物の照合へ渡す。 */
export function getWindmillRoadApproach(props: Props) {
  const plan = props.site.approach
  if (!plan) return null
  const geometry = getWindmillYardSiteGeometry(props)
  if (geometry instanceof Error) return geometry
  const road = props.roads[plan.road_index],
    end = road?.pts.at(-1),
    grid = props.grid,
    scale = props.metresPerTile
  if (props.site.rotation_quarters !== 0 || !end || end.some((value, axis) => value !== plan.road_end_tiles[axis]) || !Number.isFinite(road.w) || road.w <= 0)
    return new Error("Invalid mill approach road anchor")
  const door = siteDoorPose({
    grid,
    room_origin: [0, 0],
    door: plan.door,
    span: plan.span_cells,
    site_origin: props.site.origin_tiles,
    width_m: grid.rows[0].length * grid.cell_m,
    depth_m: grid.rows.length * grid.cell_m,
    rotation_quarters: 0,
    metres_per_tile: scale,
  })
  if (!door || door.outward[0] !== 0 || door.outward[1] !== 1 || plan.width_m < MIN_PASSAGE_WIDTH_M || plan.width_m > Math.min(door.width_m, road.w * scale * 2))
    return new Error("Invalid mill approach doorway or width")
  if (end[1] <= door.point[1] || end[0] === door.point[0]) return new Error("Invalid mill approach direction")
  const points = [door.point, [door.point[0], end[1]], end] satisfies readonly (readonly number[])[]
  const half = plan.width_m / scale / 2
  const bounds = points
    .slice(1)
    .map(
      (point, index) =>
        [
          Math.min(points[index][0], point[0]) - half,
          Math.min(points[index][1], point[1]) - half,
          Math.max(points[index][0], point[0]) + half,
          Math.max(points[index][1], point[1]) + half,
        ] satisfies readonly [number, number, number, number],
    )
  if (bounds.some((rect) => !rect.every(Number.isFinite))) return new Error("Unbounded mill approach")
  return { points, bounds, roadId: `road-${plan.road_index + 1}`, widthM: plan.width_m, section: plan.section ?? null }
}
