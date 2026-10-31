import { checkedVector3 } from "#/lib/engine/checked-vector3"
import type { Vector3 } from "#/lib/engine/vector3-types"

type Props = Readonly<{ origin: Vector3; width: number; depth: number; quarterTurns: number }>

/** 原点は回転後の平面外接矩形の最小点と床の高さ。長さの単位は呼び出し側で統一する。 */
export class SpatialFrame {
  constructor(private readonly props: Props) {
    if (!Number.isFinite(props.width) || !Number.isFinite(props.depth) || props.width <= 0 || props.depth <= 0) throw new RangeError("Invalid spatial frame dimensions")
    if (![0, 1, 2, 3].includes(props.quarterTurns)) throw new RangeError("Invalid spatial frame rotation")
    checkedVector3(props.origin, "Invalid spatial frame origin")
    const farX = props.origin[0] + this.size[0],
      farZ = props.origin[2] + this.size[1]
    if (!Number.isFinite(farX) || !Number.isFinite(farZ) || farX <= props.origin[0] || farZ <= props.origin[2]) throw new RangeError("Invalid spatial frame extent")
    const origin: Vector3 = [props.origin[0], props.origin[1], props.origin[2]]
    this.props = Object.freeze({ ...props, origin: Object.freeze(origin) })
    Object.freeze(this)
  }

  get size(): readonly [number, number] {
    if (this.props.quarterTurns % 2) return [this.props.depth, this.props.width]
    return [this.props.width, this.props.depth]
  }

  toWorld(point: Vector3): Vector3 {
    checkedVector3(point, "Invalid spatial frame point")
    const rotated = this.rotatePoint(point)
    return checkedVector3([this.props.origin[0] + rotated[0], this.props.origin[1] + point[1], this.props.origin[2] + rotated[2]], "Unbounded spatial frame position")
  }

  toLocal(point: Vector3): Vector3 {
    checkedVector3(point, "Invalid spatial frame point")
    return checkedVector3(this.unrotatePoint(point), "Unbounded spatial frame local position")
  }

  private unrotatePoint(point: Vector3): Vector3 {
    const x = point[0] - this.props.origin[0]
    const y = point[1] - this.props.origin[1]
    const z = point[2] - this.props.origin[2]
    if (this.props.quarterTurns === 1) return [this.props.width - z, y, x]
    if (this.props.quarterTurns === 2) return [this.props.width - x, y, this.props.depth - z]
    if (this.props.quarterTurns === 3) return [z, y, this.props.depth - x]
    return [x, y, z]
  }

  direction(vector: Vector3): Vector3 {
    checkedVector3(vector, "Invalid spatial frame direction")
    if (this.props.quarterTurns === 1) return [vector[2] + 0, vector[1], -vector[0] + 0]
    if (this.props.quarterTurns === 2) return [-vector[0] + 0, vector[1], -vector[2] + 0]
    if (this.props.quarterTurns === 3) return [-vector[2] + 0, vector[1], vector[0] + 0]
    return [vector[0] + 0, vector[1], vector[2] + 0]
  }

  private rotatePoint(point: Vector3): Vector3 {
    if (this.props.quarterTurns === 1) return [point[2], point[1], this.props.width - point[0]]
    if (this.props.quarterTurns === 2) return [this.props.width - point[0], point[1], this.props.depth - point[2]]
    if (this.props.quarterTurns === 3) return [this.props.depth - point[2], point[1], point[0]]
    return point
  }
}
