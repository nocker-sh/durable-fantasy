import { certifyStorageTranslation, type StorageRoomSection } from "#/world/town/certify-storage-translation"
import type { Point3 } from "#/lib/engine/cuboid-motion-types"
import type { StorageBoxPart } from "#/world/town/storage-box-types"
type Props = { parts: ReadonlyArray<StorageBoxPart>; offsets: ReadonlyArray<Point3>; section: StorageRoomSection; name: string }
/** Check every connected straight segment with the same physical parts and fixed obstacles. */
export function getStoragePathError(props: Props): Error | null {
  if (props.offsets.length < 2) return new Error(`Invalid ${props.name.toLowerCase()} movement geometry`)

  for (const index of props.offsets.keys()) {
    if (index === 0) continue
    const movementError = certifyStorageTranslation({ parts: props.parts, from: props.offsets[index - 1], to: props.offsets[index], section: props.section, name: props.name })
    if (movementError) return movementError
  }
  return null
}
