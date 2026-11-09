import { expect, it } from "vitest"
import { layoutOf } from "#/world/maps/layouts"
import { currentLayout } from "#/world/scene/current-layout"
import { roadD } from "#/world/scene/road-d"
import { setLayout } from "#/world/scene/set-layout"
import { PPU } from "#/world/scene/textures/palette"
import { ashAt } from "#/world/scene/helpers/terrain/ash-at"

/** Share of ashed pixels on the plaza's stones where a road's swept bank would otherwise lie. */
function plazaBankShare(map: string) {
  setLayout(layoutOf(map))
  const layout = currentLayout()
  const count = { bank: 0, ash: 0 }
  const r = layout.plazaR - 0.2
  for (let sy = Math.floor((layout.plaza[1] - r) * PPU); sy < (layout.plaza[1] + r) * PPU; sy++) {
    for (let sx = Math.floor((layout.plaza[0] - r) * PPU); sx < (layout.plaza[0] + r) * PPU; sx++) {
      const x = (sx + 0.5) / PPU,
        z = (sy + 0.5) / PPU
      if (Math.hypot(x - layout.plaza[0], z - layout.plaza[1]) > r) continue
      const d = roadD(x, z)
      if (d < 0.05 || d > 0.25) continue
      count.bank++
      if (ashAt({ x, z, sx, sy })) count.ash++
    }
  }
  return count
}

it.each(["phanthiet", "phanthiet-market", "phanthiet-gate"])("keeps the road banks of ash off the plaza in %s", (map) => {
  const count = plazaBankShare(map)
  expect(count.bank).toBeGreaterThan(0)
  // swept ground keeps the thin film and the odd footprint (k ≤ 0.31); a bank would be near 0.5+
  expect(count.ash / count.bank).toBeLessThan(0.2)
})
