import { tiltedToolEnvelope } from "#/world/town/tilted-tool-envelope"
import { rectangleFace } from "#/lib/engine/rectangle-face"
import type { RectangleSide } from "#/lib/engine/rectangle-face"
import type { Rectangle } from "#/lib/engine/rectangle-subtraction"
import type { Cuboid } from "#/lib/engine/cuboid-subtraction"
import type { HandoffOrientation } from "#/world/town/hearth-handoff"

type Props = {
  front: RectangleSide
  width: number
  thickness: number
  length: number
  gripFromBlade: number
  orientation: HandoffOrientation
  carried: Rectangle
  tilt?: number
}

export function handoffEnvelope(props: Props): Cuboid {
  const tilt = props.tilt === undefined ? 0 : props.tilt

  if (![props.width, props.thickness, props.length, props.gripFromBlade].every((v) => Number.isFinite(v) && v > 0) || props.gripFromBlade >= props.length)
    throw new Error("Invalid handoff tool dimensions")
  const tail = props.length - props.gripFromBlade
  if (props.orientation === "carry_vertical") return { ...props.carried, bottom: -props.gripFromBlade, top: tail }
  const normal = rectangleFace({ x: 0, z: 0, width: 1, depth: 1, side: props.front }).outward,
    nx = normal[0],
    nz = normal[1]
  const plan = (lo: number, hi: number) => {
    const a = [-nz * (-props.width / 2) + nx * lo, nx * (-props.width / 2) + nz * lo],
      b = [-nz * (props.width / 2) + nx * hi, nx * (props.width / 2) + nz * hi]
    return { x0: Math.min(a[0], b[0]), z0: Math.min(a[1], b[1]), x1: Math.max(a[0], b[0]), z1: Math.max(a[1], b[1]) }
  }
  if (props.orientation === "work_vertical") return { ...plan(-props.thickness / 2, props.thickness / 2), bottom: -props.gripFromBlade, top: tail }
  if (props.orientation === "work_horizontal") return { ...plan(-props.gripFromBlade, tail), bottom: -props.thickness / 2, top: props.thickness / 2 }
  return tiltedToolEnvelope({ front: props.front, width: props.width, thickness: props.thickness, length: props.length, gripFromBlade: props.gripFromBlade, tilt: tilt })
}
