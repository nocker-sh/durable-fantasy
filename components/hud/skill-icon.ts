import type { ItemId } from "#/world/core/items.ts"
import type { SkillId } from "#/world/core/skills.ts"
import { iconUrl, uiIconUrl } from "#/world/art/icons.ts"
import type { SpriteName } from "#/world/art/pixel-art.ts"

/** How a skill looks on the bar: a picture of its own, or the thing it is done with. */
const SKILL_ICON: Record<SkillId, { ui: SpriteName } | { item: ItemId }> = {
  sit: { ui: "full" },
  "first-aid": { item: "herb" },
  chop: { item: "wood-axe" },
  fell: { item: "log" },
  lunge: { item: "short-sword" },
  hew: { item: "iron-sword" },
  pierce: { item: "dagger" },
  cleave: { item: "hand-axe" },
  thrust: { item: "spear" },
  crush: { item: "mace" },
  aim: { item: "short-bow" },
  mend: { item: "oak-staff" },
  solace: { item: "amber-staff" },
  flare: { item: "small-crystal" },
  ember: { item: "small-crystal" },
  kodama: { item: "oak-staff" },
}
export const skillIconUrl = (id: SkillId) => {
  const i = SKILL_ICON[id]
  return "ui" in i ? uiIconUrl(i.ui, 32) : iconUrl(i.item)
}
