import { ensureFields } from "#/world/scene/ensure-fields"
import { riverField } from "#/world/scene/world"

export const riverD = (x: number, z: number) => {
  ensureFields()
  return riverField.sample(x, z)
}
