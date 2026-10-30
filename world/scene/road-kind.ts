import { FR, GN, F } from "#/world/scene/world"
import { ensureFields } from "#/world/scene/ensure-fields"

export function roadKind(x: number, z: number): number {
  ensureFields()
  const i = Math.round(Math.min(GN - 1, Math.max(0, x * FR))),
    j = Math.round(Math.min(GN - 1, Math.max(0, z * FR)))
  return F.roadKind[j * GN + i]
}
