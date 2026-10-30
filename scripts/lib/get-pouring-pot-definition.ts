import { getPouringPotProfile } from "#/world/town/get-pouring-pot-profile"
import type { hotWaterServiceSchema } from "#/scripts/lib/hot-water-service-schema"
import type { z } from "zod"
type Plan = z.infer<typeof hotWaterServiceSchema>

/** Body, pouring lip, fixed carrying bridge and lid all share the one object's measured definition. */
export function getPouringPotDefinition(plan: Plan) {
  const pot = plan.pot

  return getPouringPotProfile({
    diameter: pot.diameter_m,
    height: pot.height_m,
    baseDiameter: pot.base_diameter_m,
    wall: pot.radial_wall_m,
    bottom: pot.bottom_m,
    fillLine: pot.fill_line_m,
    lipStart: pot.lip_start_m,
    lipLength: pot.lip_length_m,
    lipHalfAngle: (pot.lip_half_angle_degrees * Math.PI) / 180,
    bailHeight: pot.bail_height_m,
    bailForward: pot.bail_forward_m,
    bailSpan: pot.bail_span_m,
    bailRadius: pot.bail_radius_m,
    gripLength: pot.grip_length_m,
    gripRadius: pot.grip_radius_m,
    lidRadius: pot.lid_radius_m,
    lidThickness: pot.lid_thickness_m,
    knobHeight: pot.knob_height_m,
    knobRadius: pot.knob_radius_m,
  })
}
