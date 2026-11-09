import type { ShelfItem, ShelfPart } from "#/world/town/shelf"
/** Upright iron blade rests on its shelf; the narrow handle stays within the declared envelope. */
export function storedToolParts(bounds: ShelfPart, tool: NonNullable<ShelfItem["tool"]>) {
  const x0Source = bounds,
    x0 = x0Source.x0,
    z0 = x0Source.z0,
    x1 = x0Source.x1,
    z1 = x0Source.z1,
    y0 = x0Source.y0,
    y1 = x0Source.y1,
    wSource = tool,
    w = wSource.handleWidth,
    h = wSource.bladeLength
  if (![w, h].every((n) => Number.isFinite(n) && n > 0) || w > Math.min(x1 - x0, z1 - z0) + 1e-9 || h >= y1 - y0) throw new Error("Invalid stored tool dimensions")
  const x = (x0 + x1) / 2,
    z = (z0 + z1) / 2
  return [
    { ...bounds, y1: y0 + h },
    { part: "contents" as const, x0: x - w / 2, z0: z - w / 2, x1: x + w / 2, z1: z + w / 2, y0: y0 + h, y1 },
  ]
}
