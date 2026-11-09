import type * as THREE from "three"
import { GeometryBuilder as GB } from "#/lib/graphics/geometry-builder"
import type { WoodId } from "#/world/scene/construction/furnishings"
import { wood } from "#/world/scene/construction/wood"
import { furnish } from "#/world/scene/construction/furnish"

/** The piece on its own on flat ground, for the dev pages: at the size the plans give it (m), in the given wood. */
type Props = {
  name: string
  size: { w: number; d: number }
  woodId: WoodId
  seed?: number
}

export function furnishingAt(props: Props) {
  const seed = props.seed === undefined ? 1 : props.seed

  return (root: THREE.Group, x: number, z: number) => {
    const gb = new GB()
    furnish({ gb: gb, name: props.name, spot: { x, z, w: props.size.w, d: props.size.d, y: 0, face: 0 }, w: wood(props.woodId), seed: seed })
    root.add(gb.build())
  }
}
