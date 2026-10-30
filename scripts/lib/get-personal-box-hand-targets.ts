import type { StorageBoxPart } from "#/world/town/storage-box-types"
import type { Point3 } from "../../lib/engine/cuboid-motion-types"
import { getStorageLidBridge } from "#/world/town/get-storage-lid-bridge"
type Props = { parts: readonly StorageBoxPart[]; target: "west_edge" | "lid_handle"; halfSpan: number }

/** Native palms target the actual wood at the selected state, rather than an independently raised invisible point. */
export function getPersonalBoxHandTargets(props: Props): readonly Point3[] | Error {
  if (!Number.isFinite(props.halfSpan) || props.halfSpan <= 0) return new Error("Invalid personal box hand span")
  const lid = props.parts.find((part) => part.part === "lid")
  if (!lid) return new Error("Personal box has no physical lid")
  if (props.target === "west_edge") {
    if (props.halfSpan * 2 >= lid.z1 - lid.z0) return new Error("Personal box hand targets leave the lid edge")
    return [-props.halfSpan, props.halfSpan].map((offset): Point3 => [lid.x0, (lid.y0 + lid.y1) / 2, (lid.z0 + lid.z1) / 2 + offset])
  }
  const bridge = getStorageLidBridge(props.parts)
  if (!bridge || bridge.z1 - bridge.z0 <= bridge.x1 - bridge.x0 || props.halfSpan * 2 >= bridge.z1 - bridge.z0) return new Error("Personal box has no matching wooden hand bridge")

  return [-props.halfSpan, props.halfSpan].map((offset): Point3 => [(bridge.x0 + bridge.x1) / 2, (bridge.y0 + bridge.y1) / 2, (bridge.z0 + bridge.z1) / 2 + offset])
}
