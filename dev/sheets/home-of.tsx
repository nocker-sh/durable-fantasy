import { HOUSES } from "#/world/town/houses"
import { householdOf } from "#/world/town/household-of"

export const homeOf = (name: string) => {
  const hh = householdOf(name)
  return hh ? HOUSES.find((h) => h.household === hh.id) : undefined
}
