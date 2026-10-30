import { z } from "zod"
import { districtReservationSchema } from "#/scripts/lib/district-reservation-schema"
import { MIN_PASSAGE_WIDTH_M } from "#/scripts/lib/spatial-rules"
import type { townDistrictPlanSchema } from "#/scripts/lib/town-district-plan-schema"
import type { SettingDocument } from "#/scripts/lib/setting-document"
const sizeSchema = z.object({ cell_m: z.number().positive(), width: z.number().int().positive().safe(), depth: z.number().int().positive().safe() })
type Props = Readonly<{ building: SettingDocument; townId: string; plan: z.infer<typeof townDistrictPlanSchema> }>

/** The complete floor rectangle and its clear perimeter consume land together; neither may spill into another district or a road. */
export function getBuildingDistrictReservation(props: Props) {
  const building = props.building
  if (building.district_reservation === undefined && (building.proposed_district === undefined || building.layout === undefined)) return null
  const reservation = districtReservationSchema.safeParse(building.district_reservation),
    size = sizeSchema.safeParse(building.layout),
    district = props.plan.districts.find((district) => district.symbol === building.proposed_district)
  if (building.kind !== "buildings" || building.town !== props.townId || !reservation.success || !size.success || !district) return new Error("Invalid building district reservation")
  if (building.design_gate === "通過") return new Error("Unplaced district reservation cannot clear the building gate")
  const offset = reservation.data.at_m,
    clearance = reservation.data.clearance_m,
    width = size.data.width * size.data.cell_m,
    depth = size.data.depth * size.data.cell_m
  const bounds = [offset[0] - clearance, offset[1] - clearance, offset[0] + width + clearance, offset[1] + depth + clearance] satisfies readonly [number, number, number, number]
  const available = [district.rect[2] * props.plan.cell_m, district.rect[3] * props.plan.cell_m]
  if (
    ![...bounds, ...available].every(Number.isFinite) ||
    bounds[2] <= bounds[0] ||
    bounds[3] <= bounds[1] ||
    clearance < MIN_PASSAGE_WIDTH_M ||
    bounds[0] < 0 ||
    bounds[1] < 0 ||
    bounds[2] > available[0] ||
    bounds[3] > available[1]
  )
    return new Error("Building and clear perimeter exceed their district reservation")

  return { id: building.id, district: district.symbol, bounds }
}
