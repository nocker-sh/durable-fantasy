import { layout, walkSurfaces, blocked } from "#/world/scene/world"
import { N, WATER_Y, WR, WN } from "#/world/maps/ground/rules"
import { inRect } from "#/lib/engine/in-rect"
import { groundH } from "#/world/scene/ground-h"

export function initWalk() {
  walkSurfaces.length = 0
  const d = 0.5 / WR
  for (const j = { value: 0 }; j.value < WN; j.value++)
    for (const i = { value: 0 }; i.value < WN; i.value++) {
      const x = (i.value + 0.5) / WR,
        z = (j.value + 0.5) / WR
      const b = { value: 0 }
      if (x < 1 || z < 1 || x > N - 1 || z > N - 1) b.value = 1
      const onBridge = inRect({ x: x, z: z, r: layout.value.bridge, pad: -0.1 })
      const onStairs = inRect({ x: x, z: z, r: layout.value.stairs, pad: 0 }) || inRect({ x: x, z: z, r: layout.value.lavStairs })
      if (!onBridge) {
        const h = groundH(x, z)
        if (h < WATER_Y + 0.12) b.value = 1
        if (!onStairs) {
          const hs = [groundH(x + d, z), groundH(x - d, z), groundH(x, z + d), groundH(x, z - d)]
          for (const q of hs) if (Math.abs(q - h) > 0.22) b.value = 1
        }
      }
      if (inRect({ x: x, z: z, r: layout.value.bridge }) && (z < layout.value.bridge.z0 + 0.3 || z > layout.value.bridge.z1 - 0.3)) b.value = 1 // parapets
      blocked[j.value * WN + i.value] = b.value
    }
}
