import { getCarrierTranslationError } from "#/world/scene/figure/get-carrier-translation-error"
import { certifyStorageTranslation, type StorageRoomSection } from "#/world/town/certify-storage-translation"
import type { AshReceiving } from "#/scripts/lib/ash-receiving-schema"
import type { StorageBoxPart } from "#/world/town/storage-box-types"
import type { Point3 } from "../../lib/engine/cuboid-motion-types"
type Carrier = Omit<Parameters<typeof getCarrierTranslationError>[0], "body" | "destination" | "section">
type Props = { carrier: Carrier; parts: ReadonlyArray<StorageBoxPart>; height: number; receiving: AshReceiving; section: StorageRoomSection; carrierSection: StorageRoomSection }
/** A fixed-pose spatial candidate only: translate box and body together without adopting the old width-only carrying route. */
export function getAshTransportError(props: Props): Error | null {
  const path = props.receiving.transport_candidate.body_path_m,
    origin = props.receiving.grip_candidate.body_m,
    staging = props.receiving.approach.poses.at(-1)
  if (path.length < 2 || !staging || Math.hypot(path[0][0] - origin[0], path[0][1] - origin[1]) > 1e-9 || Math.hypot(path.at(-1)![0] - staging[0], path.at(-1)![1] - staging[1]) > 1e-9)
    return new Error("Native box transport does not join its grip candidate to staging")
  for (const index of path.keys()) {
    if (index === 0) continue
    const a = path[index - 1],
      b = path[index]
    if (Math.hypot(b[0] - a[0], b[1] - a[1]) < 1e-9) return new Error("Native box transport has an empty segment")
    const carrierError = getCarrierTranslationError({ ...props.carrier, body: a, destination: b, section: props.carrierSection })
    if (carrierError) return carrierError
    const from: Point3 = [a[0] - origin[0], props.height, a[1] - origin[1]],
      to: Point3 = [b[0] - origin[0], props.height, b[1] - origin[1]]
    const boxError = certifyStorageTranslation({ parts: props.parts, from, to, section: props.section, name: "Held ash box" })
    if (boxError) return boxError
  }
  return null
}
