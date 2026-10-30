import type { StorageBoxBounds } from "#/world/town/storage-box-types"
import type { Cuboid } from "#/lib/engine/cuboid-subtraction"

export const storageBoxCuboid = (p: StorageBoxBounds): Cuboid => ({ x0: p.x0, x1: p.x1, z0: p.z0, z1: p.z1, bottom: p.y0, top: p.y1 })
