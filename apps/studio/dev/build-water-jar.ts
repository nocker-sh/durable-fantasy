import type { Group } from "three"
import { waterJar } from "#/world/scene/construction/water-jar"
import { groundH } from "#/world/scene/ground-h"
import { SIZES } from "#/world/town/fit"

/** Inspect the same jar used by the interior, with the existing water-vessel footprint. */
export function buildWaterJar(root: Group, x: number, z: number): void {
  const size = SIZES.水甕
  if (!size || size === "wall") throw new Error("Missing water jar footprint")
  const jar = waterJar({ at: [x, z], size: [size.w, size.d], floor: groundH(x, z) })
  if (jar instanceof Error) throw jar
  root.add(jar)
}
