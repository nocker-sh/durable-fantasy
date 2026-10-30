import type { Vector3Tuple as V3 } from "#/lib/engine/vector3-types"
import { subtractVector3 as sub } from "#/lib/engine/subtract-vector3"
import { dotVector3 as dot } from "#/lib/engine/dot-vector3"

// An SDF given in its own frame (X, Y, Z unit axes at c), bounded by a sphere of radius r
type Props = {
  c: V3
  X: V3
  Y: V3
  Z: V3
  f: (x: number, y: number, z: number) => number
  r: number
}

export function frameSd(props: Props) {
  const sd = (p: V3) => {
    const o = sub(p, props.c)
    return props.f(dot(o, props.X), dot(o, props.Y), dot(o, props.Z))
  }
  const loc = (p: V3): V3 => {
    const o = sub(p, props.c)
    return [dot(o, props.X), dot(o, props.Y), dot(o, props.Z)]
  }
  return { sd, loc, c: props.c, r: props.r }
}
