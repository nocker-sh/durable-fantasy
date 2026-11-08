import { GATHER_SKILL_NAME } from "#/world/core/items/kinds"

/** A life skill's level going up, as a note after the event's own . */
export function lifeUp(e: { skill: keyof typeof GATHER_SKILL_NAME; level: number; up: boolean }): string {
  if (!e.up) return ""
  return ` ${GATHER_SKILL_NAME[e.skill]}の腕が Lv ${e.level} に上がった。`
}
