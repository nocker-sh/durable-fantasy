import { GN } from "#/world/maps/ground/rules"
import type { GroundFieldBuffers } from "#/world/maps/ground/ground-field-types"

/** Each generator or active scene owns its samples independently. */
export function createGroundFieldBuffers(): GroundFieldBuffers {
  return { h: new Float32Array(GN * GN), river: new Float32Array(GN * GN), road: new Float32Array(GN * GN), trail: new Float32Array(GN * GN), roadKind: new Uint8Array(GN * GN) }
}
