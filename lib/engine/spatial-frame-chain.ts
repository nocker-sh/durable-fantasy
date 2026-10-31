import { checkedVector3 } from "#/lib/engine/checked-vector3"
import { SpatialFrame } from "#/lib/engine/spatial-frame"
import type { Vector3 } from "#/lib/engine/vector3-types"

type Props = Readonly<{ frames: readonly SpatialFrame[] }>

/** Frames run from the innermost local space to the outermost; an empty chain preserves root-local metric points. */
export class SpatialFrameChain {
  constructor(private readonly props: Props) {
    const frames = Array.from(props.frames)
    if (frames.some((frame) => !(frame instanceof SpatialFrame))) throw new RangeError("Invalid spatial frame chain")
    this.props = Object.freeze({ frames: Object.freeze(frames) })
    Object.freeze(this)
  }

  toWorld(point: Vector3): Vector3 {
    checkedVector3(point, "Invalid spatial frame chain point")
    const copy: Vector3 = [point[0], point[1], point[2]]
    return this.props.frames.reduce<Vector3>((current, frame) => frame.toWorld(current), copy)
  }

  toLocal(point: Vector3): Vector3 {
    checkedVector3(point, "Invalid spatial frame chain point")
    const copy: Vector3 = [point[0], point[1], point[2]]
    return this.props.frames.reduceRight<Vector3>((current, frame) => frame.toLocal(current), copy)
  }
}
