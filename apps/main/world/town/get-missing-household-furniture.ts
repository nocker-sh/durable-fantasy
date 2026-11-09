import { ESSENTIALS } from "#/world/town/household-essentials"
import { named } from "#/world/town/get-household-furniture-name"
/** The household essentials a home lacks, by name. */
export function missing(furniture: readonly string[]): string[] {
  return ESSENTIALS.filter((essential) => !furniture.some((f) => essential[1].test(named(f)))).map((essential) => essential[0])
}
