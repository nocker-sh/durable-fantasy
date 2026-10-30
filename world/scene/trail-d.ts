import { ensureFields } from "#/world/scene/ensure-fields"
import { trailField } from "#/world/scene/world"

export const trailD = (x: number, z: number) => {
  ensureFields()
  return trailField.sample(x, z)
}
