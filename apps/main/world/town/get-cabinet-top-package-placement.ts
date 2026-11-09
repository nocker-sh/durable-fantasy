import { getBoxLayoutError } from "#/lib/engine/get-box-layout-error"
import { cuboidTranslationHits } from "#/lib/engine/cuboid-translation-hits"
import type { StorageRoomSection } from "#/world/town/certify-storage-translation"
type Props = Readonly<{
  id: string
  origin: readonly [number, number, number]
  size: readonly [number, number, number]
  clearance: number
  bounds: Readonly<{ x0: number; x1: number; z0: number; z1: number; top: number }>
  section: StorageRoomSection
}>

/** A nominal package rests directly on the cabinet; available volume alone does not certify an actual folded textile. */
export function getCabinetTopPackagePlacement(props: Props) {
  const bounds = props.bounds,
    origin = props.origin,
    size = props.size,
    gap = props.clearance
  const layout = getBoxLayoutError({ size: [bounds.x1 - bounds.x0, props.section.ceiling - bounds.top, bounds.z1 - bounds.z0], boxes: [{ id: props.id, origin, size }], gap })
  if (layout) return layout
  if (origin[1] !== 0) return new Error("Cabinet-top package needs direct support")
  if (
    origin[0] < gap ||
    origin[2] < gap ||
    origin[0] + size[0] > bounds.x1 - bounds.x0 - gap ||
    origin[2] + size[2] > bounds.z1 - bounds.z0 - gap ||
    size[1] > props.section.ceiling - bounds.top - gap
  )
    return new Error("Cabinet-top package lacks edge or ceiling clearance")
  const box = { x0: bounds.x0 + origin[0], x1: bounds.x0 + origin[0] + size[0], bottom: bounds.top, top: bounds.top + size[1], z0: bounds.z0 + origin[2], z1: bounds.z0 + origin[2] + size[2] }
  if (props.section.obstacles.some((obstacle) => cuboidTranslationHits({ relative: box, from: [0, 0, 0], to: [0, 0, 0], obstacle: obstacle })))
    return new Error("Cabinet-top package intersects the room")

  return box
}
