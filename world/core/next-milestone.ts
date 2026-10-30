import { MILESTONES, LIFE_CAP } from "#/world/core/life-rules"

/** The next milestone above a level, if any within the cap. */
export function nextMilestone(level: number): number | null {
  return MILESTONES.find((m) => m > level && m <= LIFE_CAP) ?? null
}
