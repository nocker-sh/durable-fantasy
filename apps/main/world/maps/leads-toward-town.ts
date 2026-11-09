import { MAPS } from "#/world/maps"
import { isOpen } from "#/world/maps/is-open"
import { getStepsToTown } from "#/world/maps/get-steps-to-town"

const steps = getStepsToTown({ maps: MAPS, open: isOpen })

/** 町へ近づく出口か。この道はスタミナが足りなくても断らない（game-system.md §3.6）。 */
export function leadsTowardTown(from: string, to: string): boolean {
  const there = steps.get(to)
  if (there === undefined) return false
  const here = steps.get(from)
  return here === undefined || there < here
}
