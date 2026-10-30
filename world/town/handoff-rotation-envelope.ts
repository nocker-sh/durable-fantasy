import { rectangleFace } from "#/lib/engine/rectangle-face"
import type { RectangleSide } from "#/lib/engine/rectangle-face"
import type { Cuboid } from "#/lib/engine/cuboid-subtraction"
import type { HandoffOrientation } from "#/world/town/hearth-handoff"
import { handoffEnvelope } from "#/world/town/handoff-envelope"

type Props = {
  front: RectangleSide
  width: number
  thickness: number
  length: number
  gripFromBlade: number
  from: HandoffOrientation
  to: HandoffOrientation
  tilt?: number
}

/** Conservative whole quarter-turn bounds about the fixed grip, including the tool's thickness. */
export function handoffRotationEnvelope(props: Props): Cuboid {
  const tilt = props.tilt === undefined ? 0 : props.tilt

  if (props.from === "carry_vertical" && props.to === "work_vertical") {
    const radius = Math.hypot(props.width, props.thickness) / 2
    return { x0: -radius, z0: -radius, x1: radius, z1: radius, bottom: -props.gripFromBlade, top: props.length - props.gripFromBlade }
  }
  if (props.from === "work_horizontal" && props.to === "work_sloped") {
    const far = props.gripFromBlade,
      tail = props.length - far,
      h = props.thickness / 2
    if (!Number.isFinite(tilt) || tilt < 0 || tilt >= Math.PI / 2) throw new Error("Invalid handoff tilt")
    const max = (cosine: number, sine: number) => {
      const t = Math.min(tilt, Math.atan2(sine, cosine))
      return cosine * Math.cos(t) + sine * Math.sin(t)
    }
    const box = handoffEnvelope({
        front: props.front,
        width: props.width,
        thickness: props.thickness,
        length: props.length,
        gripFromBlade: far,
        orientation: "work_sloped",
        carried: { x0: 0, z0: 0, x1: 0, z1: 0 },
        tilt: tilt,
      }),
      normal = rectangleFace({ x: 0, z: 0, width: 1, depth: 1, side: props.front }).outward,
      nx = normal[0],
      nz = normal[1]
    if (nx) {
      box.x0 = nx > 0 ? -max(far, h) : -max(tail, h)
      box.x1 = nx > 0 ? max(tail, h) : max(far, h)
    } else {
      box.z0 = nz > 0 ? -max(far, h) : -max(tail, h)
      box.z1 = nz > 0 ? max(tail, h) : max(far, h)
    }
    return { ...box, bottom: -max(h, far), top: max(h, tail) }
  }
  if (props.from !== "work_vertical" || props.to !== "work_horizontal") throw new Error("Handoff uses an undesigned rotation")
  const far = Math.hypot(props.gripFromBlade, props.thickness / 2),
    tail = Math.hypot(props.length - props.gripFromBlade, props.thickness / 2)
  const box = handoffEnvelope({
    front: props.front,
    width: props.width,
    thickness: props.thickness,
    length: props.length,
    gripFromBlade: props.gripFromBlade,
    orientation: "work_horizontal",
    carried: { x0: 0, z0: 0, x1: 0, z1: 0 },
  })
  const normal = rectangleFace({ x: 0, z: 0, width: 1, depth: 1, side: props.front }).outward,
    nx = normal[0],
    nz = normal[1]
  if (nx) {
    box.x0 = nx > 0 ? -far : -tail
    box.x1 = nx > 0 ? tail : far
  } else {
    box.z0 = nz > 0 ? -far : -tail
    box.z1 = nz > 0 ? tail : far
  }
  return { ...box, bottom: -far, top: tail }
}
