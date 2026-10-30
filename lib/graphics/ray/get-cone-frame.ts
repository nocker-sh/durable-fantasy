import { createConeFrame } from "#/lib/graphics/ray/create-cone-frame"
import type { ConeFrame, ConeEndpoints as Props } from "#/lib/graphics/ray/cone-frame-types"
import type { Vector3 } from "#/lib/engine/vector3-types"

type CachedFrame = Readonly<{ start: Vector3; end: Vector3; frame: ConeFrame }>
const frames = new WeakMap<Props, CachedFrame>()

/** 図形を変更せずに共用し、所有者が端点を編集した場合は座標系を作り直す。 */
export function getConeFrame(primitive: Props): ConeFrame {
  const cached = frames.get(primitive)
  if (
    cached &&
    Object.is(cached.start[0], primitive.a[0]) &&
    Object.is(cached.start[1], primitive.a[1]) &&
    Object.is(cached.start[2], primitive.a[2]) &&
    Object.is(cached.end[0], primitive.b[0]) &&
    Object.is(cached.end[1], primitive.b[1]) &&
    Object.is(cached.end[2], primitive.b[2])
  )
    return cached.frame

  const frame = createConeFrame(primitive)
  frames.set(primitive, { start: [...primitive.a], end: [...primitive.b], frame })
  return frame
}
