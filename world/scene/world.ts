import { ScalarField } from "#/lib/engine/scalar-field"
import { SQUARE_LAYOUT } from "#/world/maps/layout"
import type { Layout } from "#/world/maps/layout-types"
import { Polyline } from "#/lib/engine/polyline"
import { baseH } from "#/world/scene/helpers/world/base-h"

export const N = 48

export const FR = 8

export const GN = N * FR + 1

export type RoadPath = { path: Polyline; width: number; kind: number }

export const WATER_Y = -0.95

export const layout = { value: SQUARE_LAYOUT }

export const F = {
  h: new Float32Array(GN * GN),
  river: new Float32Array(GN * GN),
  road: new Float32Array(GN * GN), // signed: distance minus half width, min over roads
  trail: new Float32Array(GN * GN),
  roadKind: new Uint8Array(GN * GN),
}

export const PLAZA_H = { value: baseH(layout.value.plaza[0], layout.value.plaza[1], layout.value) }

export const fieldsReady = { value: false }

/** The height, river and road fields of a ground plan, worked out once (here or in a worker) and kept. */
export type Fields = {
  h: Float32Array
  river: Float32Array
  road: Float32Array
  roadKind: Uint8Array
  trail?: Float32Array
  plazaH: number
}

export const FIELD_CACHE = new Map<Layout, Fields>()

export const heightField = new ScalarField(F.h, GN, FR)

export const riverField = new ScalarField(F.river, GN, FR)

export const roadField = new ScalarField(F.road, GN, FR)

export const trailField = new ScalarField(F.trail, GN, FR)

export const GRID_N = GN

export const walkSurfaces: { rect: readonly [number, number, number, number]; height: number }[] = []

export const WR = 2

export const WN = N * WR

export const blocked = new Uint8Array(WN * WN)

export const blockedBy = new Map<number, string>()

if (import.meta.env?.DEV && typeof window !== "undefined") (window as unknown as { __blockedBy: typeof blockedBy }).__blockedBy = blockedBy
