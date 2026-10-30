import { ensureFields } from "#/world/scene/ensure-fields"
import { heightField } from "#/world/scene/world"

export const groundH = (x: number, z: number) => {
  ensureFields()
  return heightField.sample(x, z)
}
