import { kitchenWaterCycleSchema } from "#/scripts/lib/kitchen-water-cycle-schema"
import { dishwaterCaptureSchema } from "#/scripts/lib/dishwater-capture-schema"
import { residentProposalSchema } from "#/scripts/lib/resident-proposal-schema"
import type { SettingDocument } from "#/scripts/lib/setting-document"

type Props = Readonly<{ room: SettingDocument; documents: ReadonlyMap<string, SettingDocument> }>

/** The water account belongs to the same household, storage and proposed workday as its retained dishwater. */
export function getKitchenWaterPlanReview(props: Props) {
  const parsed = kitchenWaterCycleSchema.safeParse(props.room.kitchen_water_cycle)
  const capture = dishwaterCaptureSchema.safeParse(props.room.dishwater_capture)
  if (!parsed.success || !capture.success || props.room.kind !== "rooms") return new Error("Invalid kitchen water cycle proposal")

  const plan = parsed.data
  const proposal = residentProposalSchema.safeParse(props.documents.get(plan.operator)?.resident_proposal)
  if (plan.operator !== capture.data.operator || plan.fresh_symbol !== capture.data.fresh_symbol || !proposal.success || !proposal.data.day_plan)
    return new Error("Kitchen water has no matching operator and dishwater account")

  return { plan, capture: capture.data, day: proposal.data.day_plan }
}
