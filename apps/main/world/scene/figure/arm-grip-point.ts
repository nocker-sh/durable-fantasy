import { addVector3 as add } from "#/lib/engine/add-vector3"
import { scaleVector3 as mul } from "#/lib/engine/scale-vector3"
import { normalizeVector3 as norm } from "#/lib/engine/normalize-vector3"
import { subtractVector3 as sub } from "#/lib/engine/subtract-vector3"
import type { Vector3Tuple as V3 } from "#/lib/engine/vector3-types"
import { PALM_GRIP_OFFSET } from "#/world/scene/figure/arm-grip"

export const armGripPoint = (elbow: V3, wrist: V3): V3 => add(wrist, mul(norm(sub(wrist, elbow)), PALM_GRIP_OFFSET))
