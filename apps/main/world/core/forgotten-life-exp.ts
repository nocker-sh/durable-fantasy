import { lifeExpAt } from "#/world/core/life-exp-at"
import { lifeLevel } from "#/world/core/life-level"

/** Forget the current level and its partial progress; level zero loses only its progress. */
export function forgottenLifeExp(exp: number): number {
  return lifeExpAt(Math.max(0, lifeLevel(exp) - 1))
}
