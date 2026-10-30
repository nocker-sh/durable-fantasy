import { getStoragePathError } from "#/world/town/get-storage-path-error"
import { getStorageClosureError } from "#/world/town/get-storage-closure-error"
import type { Cuboid } from "#/lib/engine/cuboid-subtraction"
import { certifyStorageTranslation } from "#/world/town/certify-storage-translation"
import type { StorageRoomSection } from "#/world/town/certify-storage-translation"
import { storageBoxCuboid } from "#/world/town/storage-box-cuboid"
import type { StorageLidPlan } from "#/world/town/storage-lid"
import { storageLidState } from "#/world/town/storage-lid-state"

/** Endpoint bounds prove room containment; exact box sweeps prove every translation, including reverse movement. */
export function certifyStorageLid(plan: StorageLidPlan, section: StorageRoomSection) {
  const roomSection = section,
    bounds = roomSection.bounds,
    ceiling = roomSection.ceiling,
    obstacles = roomSection.obstacles
  if (![bounds.x0, bounds.x1, bounds.z0, bounds.z1, ceiling].every(Number.isFinite) || bounds.x0 >= bounds.x1 || bounds.z0 >= bounds.z1 || ceiling <= 0) throw new Error("Invalid lid room section")
  const valid = (p: Cuboid) => [p.x0, p.x1, p.z0, p.z1, p.bottom, p.top].every(Number.isFinite) && p.x0 < p.x1 && p.z0 < p.z1 && p.bottom < p.top
  if (
    [...plan.original, ...plan.body, ...plan.cover].some((p) => !valid(storageBoxCuboid(p))) ||
    obstacles.some((p) => !valid(p)) ||
    [plan.lowering, ...plan.offsets].some((p) => !p.every(Number.isFinite)) ||
    plan.offsets.length < 2
  )
    throw new Error("Invalid storage lid movement geometry")
  const closureError = getStorageClosureError({ original: plan.original, closed: storageLidState(plan, 0), lowering: plan.lowering })
  if (closureError) throw closureError
  const loweringError = certifyStorageTranslation({ parts: plan.original, from: [0, 0, 0], to: plan.lowering, section, name: "Storage lid" })
  if (loweringError) throw loweringError
  const fixed = { ...section, obstacles: [...obstacles, ...plan.body.map(storageBoxCuboid)] }
  const movementError = getStoragePathError({ parts: plan.cover, offsets: plan.offsets, section: fixed, name: "Storage lid" })
  if (movementError) throw movementError
  return { pieces: plan.cover.length, segments: plan.offsets.length }
}
