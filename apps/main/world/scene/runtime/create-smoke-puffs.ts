import type { Vector3 } from "three"
import type { SmokePuff } from "#/world/scene/runtime/scene-smoke-types"

/** 煙突の順と元の位置の参照を保ち、一斉に生まれない粒の位相を割り当てる。 */
export function createSmokePuffs(origins: ReadonlyArray<Vector3>): ReadonlyArray<SmokePuff> {
  return origins.flatMap((origin, index) => Array.from({ length: 7 }, (_, offset) => ({ age: (offset / 7) * 4.5 + index, life: 4.5, origin, driftX: 0.15 + (index % 3) * 0.05 })))
}
