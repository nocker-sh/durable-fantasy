import { hotWaterServiceSchema } from "#/scripts/lib/hot-water-service-schema"
import { getPouringPotDefinition } from "#/scripts/lib/get-pouring-pot-definition"
import { getCookingHearthDefinition } from "#/scripts/lib/get-cooking-hearth-definition"
import { getPouringPotLayout } from "#/world/town/get-pouring-pot-layout"
import type { SettingDocument } from "#/scripts/lib/setting-document"
type Props = { room: SettingDocument; documents: ReadonlyMap<string, SettingDocument> }

/** All positions derive from the actual stove, lid and pot; no second drawing-only set of dimensions exists. */
export function getHotWaterServiceDefinition(props: Props) {
  const parsed = hotWaterServiceSchema.safeParse(props.room.hot_water_service),
    building = props.documents.get(String(props.room.building))
  if (!parsed.success || building?.kind !== "buildings") return new Error("Invalid hot-water service proposal")
  const plan = parsed.data,
    profile = getPouringPotDefinition(plan),
    furniture = props.room.furniture?.find((part) => part.symbol === plan.stove)
  if (profile instanceof Error) return profile
  if (!furniture) return new Error("Hot water has no placed stove")
  const hearth = getCookingHearthDefinition({ ...props, building, furniture })
  if (hearth instanceof Error) return hearth
  const layout = getPouringPotLayout({
    profile,
    stove: hearth.bounds,
    plate: hearth.parts.plate,
    masonry: hearth.parts.masonry,
    shaft: hearth.shaft,
    heating: plan.heating.position_m,
    resting: plan.rest.position_m,
    restArea: plan.rest.rect_m,
  })
  if (layout instanceof Error) return layout

  return { plan, profile, hearth, layout }
}
