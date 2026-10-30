import { GATHER_SKILL_NAME } from "#/world/core/items/kinds"
import { LIFE_CAP, MILESTONES } from "#/world/core/life-rules"

/** A life skill's level going up, as a note after the event's own (a milestone said so). */
export function lifeUp(e: { skill: keyof typeof GATHER_SKILL_NAME; level: number; up: boolean }): string {
  if (!e.up) return ""
  const milestone = MILESTONES.some((milestone) => milestone === e.level) ? "（節目。できることが増えた）" : ""
  return ` ${GATHER_SKILL_NAME[e.skill]}が Lv ${e.level}${e.level >= LIFE_CAP ? "（いまの上限）" : ""}に上がった${milestone}。`
}
