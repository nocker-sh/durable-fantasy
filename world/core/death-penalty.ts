import { SAFE_LEVEL } from "#/world/core/combat-rules"

/** Experience lost on death: 1% of what the next level needs (none while new to the road, or at the cap). */
export function deathPenalty(level: number, needed: number): number {
  return level <= SAFE_LEVEL || needed === 0 ? 0 : Math.floor(needed / 100)
}
