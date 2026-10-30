import type { z } from "zod"
import type { windmillYardSchema } from "#/scripts/lib/windmill-yard-schema"
import type { SettingDocument } from "#/scripts/lib/setting-document"
type Props = Readonly<{ document: SettingDocument; plan: z.infer<typeof windmillYardSchema> }>

/** Keep raw grain, finished flour and receiving work outside the reserved machinery enclosure. */
export function getWindmillYardZoneErrors(props: Props): readonly string[] {
  const plan = props.plan,
    roles = [plan.machine, plan.raw_store, plan.flour_store, plan.receiving_table],
    area = plan.enclosure_rect
  const errors: string[] = []
  if (new Set(roles).size !== roles.length) errors.push("Windmill yard roles share one object")
  const covered = props.plan.covered_stores.map((store) => store.symbol)
  if (new Set(covered).size !== 2 || !covered.includes(plan.raw_store) || !covered.includes(plan.flour_store)) errors.push("Grain and flour need distinct covered stores")
  for (const symbol of roles) {
    const furniture = props.document.furniture?.find((piece) => piece.symbol === symbol)
    if (!furniture) {
      errors.push(`Missing windmill yard object ${symbol}`)
      continue
    }
    const rect = furniture.rect
    if (symbol === plan.machine) {
      if (rect[0] <= area[0] || rect[1] <= area[1] || rect[0] + rect[2] >= area[0] + area[2] || rect[1] + rect[3] >= area[1] + area[3]) errors.push("Machine leaves the enclosed reservation")
    } else if (
      [rect, ...(furniture.use_space ?? []).map((space) => space.rect)].some(
        (zone) => zone[0] < area[0] + area[2] && zone[0] + zone[2] > area[0] && zone[1] < area[1] + area[3] && zone[1] + zone[3] > area[1],
      )
    )
      errors.push(`${symbol}: food storage or receiving work enters the machine enclosure`)
  }
  return errors
}
