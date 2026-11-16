import type * as THREE from "three"
import { GeometryBuilder as GB } from "#/lib/graphics/geometry-builder"

type Props = {
  root: THREE.Group
  at: readonly [number, number, number]
  /** tilt about x, heading about y, roll about z, in radians; the heading is applied last */
  turn?: readonly [number, number, number]
  build: (gb: GB) => void
}

/**
 * A part built about its own origin and then set down turned and tilted: how a leaning post, a
 * fallen beam or a toppled stone is placed.
 */
export function piece(props: Props): THREE.Group {
  const gb = new GB()
  props.build(gb)
  const g = gb.build()
  g.position.set(props.at[0], props.at[1], props.at[2])
  if (props.turn) g.rotation.set(props.turn[0], props.turn[1], props.turn[2], "YXZ")
  props.root.add(g)
  return g
}
