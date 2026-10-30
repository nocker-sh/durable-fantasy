import { computeFields } from "#/world/scene/helpers/world/compute-fields"
import { fieldsReady } from "#/world/scene/world"

/** Initialize only the selected layout, including callers using the default map directly. */
export function ensureFields() {
  if (fieldsReady.value) return
  // Height shaping samples the road field while it is being computed.
  fieldsReady.value = true
  try {
    computeFields()
  } catch (error) {
    fieldsReady.value = false
    throw error
  }
}
