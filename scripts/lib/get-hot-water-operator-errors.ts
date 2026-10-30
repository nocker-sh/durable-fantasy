import { waterHandlingPlanSchema } from "./potable-water-supply-schema"
import type { hotWaterServiceSchema } from "./hot-water-service-schema"
import type { SettingDocument } from "#/scripts/lib/setting-document"
import type { z } from "zod"

type Props = Readonly<{ room: SettingDocument; documents: ReadonlyMap<string, SettingDocument>; plan: z.infer<typeof hotWaterServiceSchema> }>

/** 所有と世帯・荷重の前提を、姿勢の幾何の成立とは別に照合する。 */
export function getHotWaterOperatorErrors(props: Props): readonly string[] {
  const plan = props.plan
  const operator = props.documents.get(plan.operator)
  const dependencies = props.room.design_dependencies
  const handling = waterHandlingPlanSchema.safeParse(operator?.handling_plan)
  const errors: string[] = []
  if (props.documents.get(plan.maker)?.kind !== "residents" || !Array.isArray(dependencies) || ![plan.maker, plan.operator].every((id) => dependencies.includes(id)))
    errors.push("hot-water: Maker or operator prerequisites are missing")
  const isHomeCarrier = operator?.kind === "residents" && Array.isArray(operator.buildings) && operator.buildings.includes(props.room.building)
  if (!isHomeCarrier || !handling.success || plan.empty_mass_kg + plan.fill_ml / 1000 > handling.data.max_hand_load_kg)
    errors.push("hot-water: Loaded pot has no matching home carrier or usable hand-load assumption")
  return errors
}
