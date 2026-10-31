import type { AuthoredStairSource } from "#/scripts/lib/authored-plan-types"
import type { AuthoredPlan } from "#/world/town/floorplan/authored-types"

type Props = Readonly<{ section: AuthoredStairSource; plan: AuthoredPlan }>
const axes: Readonly<Record<"x" | "y", "x" | "z">> = { x: "x", y: "z" }

/** Stair positions and slab thickness come from the same exported rooms and validated floor levels. */
export function compileAuthoredStairSection(props: Props): AuthoredPlan["stairSections"][number] {
  const section = props.section,
    plan = props.plan
  const lower = plan.rooms.find((room) => room.id === section.lower_room),
    upper = plan.rooms.find((room) => room.id === section.upper_room)
  const piece = lower?.furniture.find((furniture) => furniture.symbol === section.furniture)
  const lowerLevel = plan.floorLevels.find((level) => level.floor === lower?.floor),
    upperLevel = plan.floorLevels.find((level) => level.floor === upper?.floor)
  if (!lower || !upper || !piece || !lowerLevel || !upperLevel) throw new Error("Stair section lacks its rooms, furniture or elevations")
  const rect = piece.rect,
    scale = plan.cellM
  return {
    id: `${lower.id}/${piece.symbol}`,
    lowerFloor: lower.floor,
    upperFloor: upper.floor,
    x0: (lower.origin[0] + rect[0]) * scale,
    z0: (lower.origin[1] + rect[1]) * scale,
    x1: (lower.origin[0] + rect[0] + rect[2]) * scale,
    z1: (lower.origin[1] + rect[1] + rect[3]) * scale,
    height: upperLevel.elevation - lowerLevel.elevation,
    slabThickness: upperLevel.elevation - lowerLevel.ceiling,
    risers: section.risers,
    going: section.going_m,
    axis: axes[section.axis],
    lowerEnd: section.lower_end,
    landing: section.landing_depth_m,
    clearWidth: section.clear_width_m,
    railInset: section.rail_inset_m,
    openingLength: section.opening_length_m,
  }
}
