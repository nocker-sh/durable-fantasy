import type { StorageBoxBounds, StorageBoxHandle, StorageBoxPart } from "#/world/town/storage-box-types"
type Props = Readonly<{ bounds: StorageBoxBounds; handle: StorageBoxHandle; lidTop: number; lift: number }>

/** Both supports and the bridge use the lid's orientation, offset and vertical lift. */
export function getStorageLidHandleParts(props: Props): StorageBoxPart[] {
  const handle = props.handle,
    bounds = props.bounds,
    sideways = handle.axis === "z"
  const span = handle.span,
    depth = handle.depth,
    height = handle.height,
    thickness = handle.thickness
  const centerX = (bounds.x0 + bounds.x1) / 2 + (handle.offset?.[sideways ? 1 : 0] ?? 0)
  const centerZ = (bounds.z0 + bounds.z1) / 2 + (handle.offset?.[sideways ? 0 : 1] ?? 0)
  const base = props.lidTop + props.lift
  const part = (low: number, high: number, vertical: readonly [number, number]): StorageBoxPart => ({
    part: "lid-handle",
    x0: centerX + (sideways ? -depth / 2 : low),
    x1: centerX + (sideways ? depth / 2 : high),
    z0: centerZ + (sideways ? low : -depth / 2),
    z1: centerZ + (sideways ? high : depth / 2),
    y0: base + vertical[0],
    y1: base + vertical[1],
  })
  return [part(-span / 2, -span / 2 + thickness, [0, height - thickness]), part(span / 2 - thickness, span / 2, [0, height - thickness]), part(-span / 2, span / 2, [height - thickness, height])]
}
