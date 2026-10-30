import { z } from "zod"
import { siteTransform } from "#/scripts/lib/site-transform"
import type { SettingDocument } from "#/scripts/lib/setting-document"
type Props = Readonly<{ building: SettingDocument; room: SettingDocument; rect: readonly [number, number, number, number]; metresPerTile: number }>
const buildingSchema = z.object({
  id: z.string(),
  kind: z.literal("buildings"),
  rooms: z.array(z.string()),
  layout: z.object({ cell_m: z.number().positive(), width: z.number().int().positive(), depth: z.number().int().positive() }),
  site_plan: z.object({ origin: z.tuple([z.number(), z.number()]), rotation_quarters: z.number().int().min(0).max(3) }),
})
const roomSchema = z.object({
  id: z.string(),
  kind: z.literal("rooms"),
  building: z.string(),
  floor: z.literal(0),
  origin: z.tuple([z.number().int().nonnegative(), z.number().int().nonnegative()]),
  grid: z.object({ cell_m: z.number().positive() }),
})

/** Project room-local metres, including an exterior reservation, through the building's actual quarter-turn and outdoor scale. */
export function getRoomSiteRectangle(props: Props): readonly [number, number, number, number] | Error {
  const building = buildingSchema.safeParse(props.building),
    room = roomSchema.safeParse(props.room),
    rect = props.rect,
    metres = props.metresPerTile
  if (!building.success || !room.success || ![...rect, metres].every(Number.isFinite) || metres <= 0 || rect[2] <= 0 || rect[3] <= 0) return new Error("Invalid room site rectangle")
  const house = building.data,
    source = room.data
  if (source.building !== house.id || !house.rooms.includes(source.id) || source.grid.cell_m !== house.layout.cell_m) return new Error("Room site rectangle has no matching building frame")
  const transform = siteTransform((house.layout.width * house.layout.cell_m) / metres, (house.layout.depth * house.layout.cell_m) / metres, house.site_plan.rotation_quarters)
  const corners = [rect[0], rect[0] + rect[2]].flatMap((x) =>
    [rect[1], rect[1] + rect[3]].map((y) => transform.point((source.origin[0] * source.grid.cell_m + x) / metres, (source.origin[1] * source.grid.cell_m + y) / metres)),
  )
  const bounds: readonly [number, number, number, number] = [
    house.site_plan.origin[0] + Math.min(...corners.map((point) => point[0])),
    house.site_plan.origin[1] + Math.min(...corners.map((point) => point[1])),
    house.site_plan.origin[0] + Math.max(...corners.map((point) => point[0])),
    house.site_plan.origin[1] + Math.max(...corners.map((point) => point[1])),
  ]
  if (!bounds.every(Number.isFinite) || bounds[0] >= bounds[2] || bounds[1] >= bounds[3]) return new Error("Unbounded room site rectangle")

  return bounds
}
