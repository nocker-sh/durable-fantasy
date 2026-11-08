import { STAT_NAME } from "#/world/core/growth-rules"
import { GATHER_SKILL_NAME } from "#/world/core/items/kinds"
import type { Skill } from "#/world/core/items/kinds"

export const needsText = (needs: Partial<Record<string, number>>) =>
  Object.entries(needs)
    .map((entry) => {
      const k = entry[0]
      const n = entry[1]
      return `${STAT_NAME[k as keyof typeof STAT_NAME] ?? GATHER_SKILL_NAME[k as Skill] ?? k}${n}`
    })
    .join(" ")
