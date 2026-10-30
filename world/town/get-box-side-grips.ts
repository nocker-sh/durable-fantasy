import { quarterTurnPoint } from "../../lib/engine/quarter-turn-point"
import type { Point3 } from "../../lib/engine/cuboid-motion-types"
import type { StorageBoxPart } from "#/world/town/storage-box-types"
type Props = { parts: ReadonlyArray<StorageBoxPart>; height: number; turn: 0 | 1 | 2 | 3; palmRadius: number }
/** Palms approach the near rim corners from outside; their centres stay one native palm radius beyond the side faces. */
export function getBoxSideGrips(props: Props): Record<"l" | "r", Point3> | Error {
  const bottom = props.parts.find((part) => part.part === "bottom"),
    sides = props.parts.filter((part) => part.part === "side")
  if (!bottom || sides.length !== 4 || !Number.isFinite(props.height) || props.height < 0 || !Number.isFinite(props.palmRadius) || props.palmRadius <= 0)
    return new Error("Box grip needs an open box and native palm radius")

  const across = quarterTurnPoint(1, 0, props.turn),
    forward = quarterTurnPoint(0, 1, props.turn)
  const halfX = (bottom.x1 - bottom.x0) / 2,
    halfZ = (bottom.z1 - bottom.z0) / 2
  const nearX = (bottom.x0 + bottom.x1) / 2 - forward[0] * halfX,
    nearZ = (bottom.z0 + bottom.z1) / 2 - forward[1] * halfZ
  const rim = Math.max(...sides.map((part) => part.y1)) + props.height
  const dx = across[0] * (halfX + props.palmRadius),
    dz = across[1] * (halfZ + props.palmRadius)
  if (![nearX, nearZ, rim, dx, dz].every(Number.isFinite)) return new Error("Invalid box grip geometry")
  return { l: [nearX + dx, rim, nearZ + dz], r: [nearX - dx, rim, nearZ - dz] }
}
