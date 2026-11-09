import { HOUSES } from "#/world/town/houses"
import type { HouseDef } from "#/world/town/house-types"
import type { HouseStyle } from "#/world/town/style"
import { styleOf } from "#/world/town/style-of"
import { lookKey } from "#/world/town/look-key"
import { neighbours } from "#/world/town/neighbours"

const memo: { value: Map<string, HouseStyle> | null } = { value: null }

/** Each building's look: the first that differs from every neighbour already settled (in the table's order). */
export function houseStyle(h: HouseDef): HouseStyle {
  if (!memo.value) {
    const settled = new Map<string, HouseStyle>()
    for (const x of HOUSES) {
      const candidate = { style: styleOf(x, 0) }
      for (const turn of Array.from({ length: 31 }, (_, index) => index + 1)) {
        if (
          !neighbours(x).some((other) => {
            const previous = settled.get(other.id)
            return previous !== undefined && lookKey(previous) === lookKey(candidate.style)
          })
        )
          break
        candidate.style = styleOf(x, turn)
      }
      settled.set(x.id, candidate.style)
    }
    memo.value = settled
  }
  return memo.value.get(h.id) ?? styleOf(h, 0)
}
