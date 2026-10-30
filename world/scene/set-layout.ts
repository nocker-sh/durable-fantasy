import type { Layout } from "#/world/maps/layout"
import { layout, F, PLAZA_H, fieldsReady, FIELD_CACHE, walkSurfaces, blocked, blockedBy } from "#/world/scene/world"
import { ensureFields } from "#/world/scene/ensure-fields"
import { fieldsNow } from "#/world/scene/fields-now"

export function setLayout(l: Layout) {
  if (l === layout.value && fieldsReady.value) return
  walkSurfaces.length = 0
  layout.value = l
  const known = FIELD_CACHE.get(l)
  if (known) {
    F.h.set(known.h)
    F.river.set(known.river)
    F.road.set(known.road)
    F.roadKind.set(known.roadKind)
    F.trail.set(known.trail ?? new Float32Array(F.trail.length).fill(1e9))
    PLAZA_H.value = known.plazaH
    fieldsReady.value = true
  } else {
    fieldsReady.value = false
    ensureFields()
    FIELD_CACHE.set(l, fieldsNow())
  }
  blocked.fill(0)
  blockedBy.clear()
}
