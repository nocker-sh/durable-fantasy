import { nativeArmSurfaces } from "#/world/scene/figure/native-arm-surfaces"
import { createBodyContext } from "#/world/scene/figure/context"
import { toCarrierWorldPoint } from "#/world/scene/figure/to-carrier-world-point"
import { segmentCuboidDistance } from "#/lib/engine/segment-cuboid-distance"
import type { Look } from "#/world/scene/figure/look"
import type { Skel } from "#/world/scene/rig"
import type { StorageBoxPart } from "#/world/town/storage-box-types"
type Props = { look: Look; skeleton: Skel; rootY: number; turn: 0 | 1 | 2 | 3; body: readonly [number, number]; parts: ReadonlyArray<StorageBoxPart>; height: number }
/** Upper arm, forearm and uncut cuff capsules conservatively enclose the sleeves. Palm and finger contact remain separate. */
export function getBoxArmClearanceError(props: Props): Error | null {
  const scale = createBodyContext(props.look, props.skeleton, null).S,
    sides: ReadonlyArray<"l" | "r"> = ["l", "r"]
  for (const side of sides) {
    const shape = nativeArmSurfaces({ scale: scale, shoulder: props.skeleton.p[`upperarm_${side}`], elbow: props.skeleton.p[`lowerarm_${side}`], wrist: props.skeleton.p[`hand_${side}`] })
    for (const capsule of [...shape.arm.capsuleBounds().slice(0, 2), ...shape.uncutCuff.capsuleBounds()]) {
      const from = toCarrierWorldPoint({ point: capsule.a, body: props.body, rootY: props.rootY, turn: props.turn }),
        to = toCarrierWorldPoint({ point: capsule.b, body: props.body, rootY: props.rootY, turn: props.turn })
      for (const part of props.parts) {
        const box = { x0: part.x0, x1: part.x1, z0: part.z0, z1: part.z1, bottom: part.y0 + props.height, top: part.y1 + props.height }
        if (segmentCuboidDistance(box, from, to) < capsule.r - 1e-9) return new Error(`Native carrier ${side} arm or cuff clearance is unresolved`)
      }
    }
  }
  return null
}
