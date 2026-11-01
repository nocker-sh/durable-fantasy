import { MAPS } from "#/world/maps"

/** 野外へ出る道のりで減るスタミナ。町と屋内の行き来では減らない（game-system.md §3.6）。 */
export function travelStamina(destination: string): number {
  return MAPS[destination]?.kind === "field" ? 4 : 0
}
