import { rectangleFace } from "#/lib/engine/rectangle-face"
import type { RectangleSide } from "#/lib/engine/rectangle-face"

type Props = {
  front: RectangleSide
  width: number
  thickness: number
  length: number
  gripFromBlade: number
  tilt: number
}

export function tiltedToolEnvelope(props: Props) {
  if (
    ![props.width, props.thickness, props.length, props.gripFromBlade, props.tilt].every(Number.isFinite) ||
    Math.min(props.width, props.thickness, props.length, props.gripFromBlade) <= 0 ||
    props.gripFromBlade >= props.length ||
    props.tilt < 0 ||
    props.tilt >= Math.PI / 2
  )
    throw new Error("Invalid tilted tool dimensions")
  const normal = rectangleFace({ x: 0, z: 0, width: 1, depth: 1, side: props.front }).outward,
    nx = normal[0],
    nz = normal[1],
    c = Math.cos(props.tilt),
    s = Math.sin(props.tilt),
    h = props.thickness / 2,
    tail = props.length - props.gripFromBlade,
    lo = -props.gripFromBlade * c - h * s,
    hi = tail * c + h * s
  const a = [-nz * (-props.width / 2) + nx * lo, nx * (-props.width / 2) + nz * lo],
    b = [-nz * (props.width / 2) + nx * hi, nx * (props.width / 2) + nz * hi]
  return { x0: Math.min(a[0], b[0]), z0: Math.min(a[1], b[1]), x1: Math.max(a[0], b[0]), z1: Math.max(a[1], b[1]), bottom: -props.gripFromBlade * s - h * c, top: tail * s + h * c }
}
