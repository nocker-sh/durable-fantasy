import { createGroundFields } from "#/world/maps/ground/create-ground-fields"
import { layout, F, PLAZA_H } from "#/world/scene/world"

/** Copy generated samples into the scene's existing buffers, retaining its field views. */
export function computeFields(): void {
  const fields = createGroundFields(layout.value)
  F.h.set(fields.h)
  F.river.set(fields.river)
  F.road.set(fields.road)
  F.roadKind.set(fields.roadKind)
  F.trail.set(fields.trail)
  PLAZA_H.value = fields.plazaH
}
