import { blocked, blockedBy } from "#/world/scene/world"
import { WR, WN } from "#/world/maps/ground/rules"
import { who } from "#/world/scene/helpers/world/who"

export function blockCircle(x: number, z: number, r: number) {
  const by = who()
  for (const j = { value: Math.floor((z - r) * WR) }; j.value <= Math.ceil((z + r) * WR); j.value++)
    for (const i = { value: Math.floor((x - r) * WR) }; i.value <= Math.ceil((x + r) * WR); i.value++) {
      const cx = (i.value + 0.5) / WR,
        cz = (j.value + 0.5) / WR
      if (Math.hypot(cx - x, cz - z) < r && i.value >= 0 && j.value >= 0 && i.value < WN && j.value < WN) {
        blocked[j.value * WN + i.value] = 1
        if (by) blockedBy.set(j.value * WN + i.value, by)
      }
    }
}
