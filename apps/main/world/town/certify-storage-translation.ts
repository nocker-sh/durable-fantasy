import { cuboidTranslationHits } from "#/lib/engine/cuboid-translation-hits"
import { type Point3 } from "#/lib/engine/cuboid-motion-types"
import type { Cuboid } from "#/lib/engine/cuboid-subtraction"
import type { Rectangle } from "#/lib/engine/rectangle-subtraction"
import type { StorageBoxPart } from "#/world/town/storage-box-types"
export type StorageRoomSection = { bounds: Rectangle; ceiling: number; obstacles: readonly Cuboid[] }
type Props = { parts: readonly StorageBoxPart[]; from: Point3; to: Point3; section: StorageRoomSection; name: string }
const EPS = 1e-9
/** Exact sweeps of the rendered parts; endpoint containment proves the whole straight translation fits. */
export function certifyStorageTranslation(props: Props): Error | null {
  const section = props.section,
    bounds = section.bounds
  if (![bounds.x0, bounds.x1, bounds.z0, bounds.z1, section.ceiling].every(Number.isFinite) || bounds.x0 >= bounds.x1 || bounds.z0 >= bounds.z1 || section.ceiling <= 0)
    return new Error(`Invalid ${props.name.toLowerCase()} room section`)

  const boxes = props.parts.map((part) => ({ x0: part.x0, x1: part.x1, z0: part.z0, z1: part.z1, bottom: part.y0, top: part.y1 }))
  const isValid = (box: Cuboid) => [box.x0, box.x1, box.z0, box.z1, box.bottom, box.top].every(Number.isFinite) && box.x0 < box.x1 && box.z0 < box.z1 && box.bottom < box.top
  if (!props.parts.length || [...boxes, ...section.obstacles].some((box) => !isValid(box)) || ![...props.from, ...props.to].every(Number.isFinite))
    return new Error(`Invalid ${props.name.toLowerCase()} movement geometry`)

  for (const box of boxes) {
    for (const offset of [props.from, props.to])
      if (
        box.x0 + offset[0] < bounds.x0 - EPS ||
        box.x1 + offset[0] > bounds.x1 + EPS ||
        box.z0 + offset[2] < bounds.z0 - EPS ||
        box.z1 + offset[2] > bounds.z1 + EPS ||
        box.bottom + offset[1] < -EPS ||
        box.top + offset[1] > section.ceiling + EPS
      )
        return new Error(`${props.name} movement leaves its room section`)
    if (section.obstacles.some((obstacle) => cuboidTranslationHits({ relative: box, from: props.from, to: props.to, obstacle: obstacle, tolerance: EPS })))
      return new Error(`${props.name} movement intersects an obstacle`)
  }
  return null
}
