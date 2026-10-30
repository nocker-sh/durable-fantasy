import type { Cuboid } from "#/lib/engine/cuboid-subtraction"
import type { StorageRoomSection } from "#/world/town/certify-storage-translation"
type Props = Readonly<{ parts: readonly Cuboid[]; section: Pick<StorageRoomSection, "bounds" | "ceiling"> }>

/** Straight rigid motion stays inside a rectangular room when both endpoint assemblies fit; missing or nonfinite geometry is not evidence. */
export function getCabinetRoomBoundsError(props: Props): Error | null {
  const bounds = props.section.bounds,
    ceiling = props.section.ceiling
  if (!props.parts.length || ![bounds.x0, bounds.x1, bounds.z0, bounds.z1, ceiling].every(Number.isFinite) || bounds.x0 >= bounds.x1 || bounds.z0 >= bounds.z1 || ceiling <= 0)
    return new Error("Missing cabinet room bounds")

  for (const part of props.parts) {
    if (![part.x0, part.x1, part.z0, part.z1, part.bottom, part.top].every(Number.isFinite) || part.x0 >= part.x1 || part.z0 >= part.z1 || part.bottom >= part.top)
      return new Error("Invalid cabinet part bounds")
    if (part.x0 < bounds.x0 || part.x1 > bounds.x1 || part.z0 < bounds.z0 || part.z1 > bounds.z1 || part.bottom < 0 || part.top > ceiling)
      return new Error("Raised cabinet hardware leaves the room section")
  }

  return null
}
