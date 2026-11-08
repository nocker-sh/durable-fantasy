import { ensureFields } from "#/world/scene/ensure-fields"
import { roadField } from "#/world/scene/world"

export const roadD = (x: number, z: number) => {
  ensureFields()
  return roadField.sample(x, z)
}
