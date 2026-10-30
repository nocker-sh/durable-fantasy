import { z } from "zod"
import { townDistrictPlanSchema } from "#/scripts/lib/town-district-plan-schema"
import { residentDayPlanSchema } from "#/world/town/resident-day-plan-schema"
const text = z.string().min(1),
  symbol = z.string().length(1)

/** Identity and daily intent precede runtime art and schedules; this proposal never certifies the unresolved day. */
export const residentProposalSchema = z.object({
  scope: z.literal("unimplemented_town_household"),
  status: z.literal("proposed"),
  home_district: symbol,
  work_district: symbol,
  work_district_role: townDistrictPlanSchema.shape.districts.element.shape.role,
  appearance_design: z.object({ silhouette: text, face_and_hair: text, clothing: text, neck_wrap: text, work_equipment: text }),
  day_intent: z.object({ sleep: text, food: text, water: text, work: text, sanitation: text, laundry: text, rest: text }),
  day_plan: residentDayPlanSchema.optional(),
  pending: z.array(text).min(1),
})
