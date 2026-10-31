import { createGroundFieldBuffers } from "#/world/maps/ground/create-ground-field-buffers"
import { GN, FR, WN } from "#/world/maps/ground/rules"
import type { Fields, WalkSurface } from "#/world/maps/ground/types"
import { ScalarField } from "#/lib/engine/scalar-field"
import { SQUARE_LAYOUT } from "#/world/maps/layout"
import type { Layout } from "#/world/maps/layout-types"
import { baseH } from "#/world/maps/ground/base-h"

export const layout = { value: SQUARE_LAYOUT }

export const F = createGroundFieldBuffers()

export const PLAZA_H = { value: baseH(layout.value.plaza[0], layout.value.plaza[1], layout.value) }

export const fieldsReady = { value: false }

export const FIELD_CACHE = new Map<Layout, Fields>()

export const heightField = new ScalarField({ samples: F.h, size: GN, resolution: FR })

export const riverField = new ScalarField({ samples: F.river, size: GN, resolution: FR })

export const roadField = new ScalarField({ samples: F.road, size: GN, resolution: FR })

export const trailField = new ScalarField({ samples: F.trail, size: GN, resolution: FR })

export const walkSurfaces: WalkSurface[] = []

export const blocked = new Uint8Array(WN * WN)

export const blockedBy = new Map<number, string>()

if (import.meta.env?.DEV && typeof window !== "undefined") (window as unknown as { __blockedBy: typeof blockedBy }).__blockedBy = blockedBy
