import { emptyNature } from "#/world/core/nature/empty-nature"
import type { NatureRecord } from "#/world/server/nature-record-types"

/** Start the reservation envelope only when no gathering state has been saved. */
export function initialNatureRecord(): NatureRecord {
  return { nature: emptyNature(), serial: 0, jobs: {} }
}
