import { N, FR, F, GRID_N } from "#/world/scene/world"
import { ensureFields } from "#/world/scene/ensure-fields"

/** Heights for the terrain mesh, at 4 vertices per tile. */
export function meshHeights(res: number): Float32Array {
  ensureFields()
  const n = N * res + 1
  const out = new Float32Array(n * n)
  const step = FR / res
  for (const j = { value: 0 }; j.value < n; j.value++) for (const i = { value: 0 }; i.value < n; i.value++) out[j.value * n + i.value] = F.h[j.value * step * GRID_N + i.value * step]
  return out
}
