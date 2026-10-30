import type { SlidingCabinetSpec, SlidingCabinetPart } from "#/world/town/sliding-cabinet-types"

/** Fixed boards and six guide lips enclose two separate sliding tracks; the shelf is supported by four real legs. */
export function getSlidingCabinetFrameParts(spec: SlidingCabinetSpec): readonly SlidingCabinetPart[] {
  const b = spec.bounds,
    t = spec.board,
    floor = spec.storageFloor,
    parts: SlidingCabinetPart[] = []
  const box = (bounds: Omit<SlidingCabinetPart, "part" | "leaf">, part: SlidingCabinetPart["part"]) => parts.push({ ...bounds, part, leaf: null })

  box({ x0: b.x0, x1: b.x1, z0: b.z0, z1: b.z1, bottom: floor - t, top: floor }, "frame")
  box({ x0: b.x0, x1: b.x1, z0: b.z0, z1: b.z1, bottom: b.top - t, top: b.top }, "frame")
  box({ x0: b.x0, x1: b.x1, z0: b.z0, z1: b.z0 + t, bottom: floor, top: b.top - t }, "frame")
  box({ x0: b.x0, x1: b.x1, z0: b.z1 - t, z1: b.z1, bottom: floor, top: b.top - t }, "frame")
  box({ x0: b.x1 - t, x1: b.x1, z0: b.z0 + t, z1: b.z1 - t, bottom: floor, top: b.top - t }, "frame")
  for (const x of [b.x0, b.x1 - spec.legWidth])
    for (const z of [b.z0, b.z1 - spec.legWidth]) box({ x0: x, x1: x + spec.legWidth, z0: z, z1: z + spec.legWidth, bottom: b.bottom, top: floor - t }, "leg")
  for (const track of [0, 1, 2]) {
    const x = b.x0 + track * (spec.panel + spec.guide)
    box({ x0: x, x1: x + spec.guide, z0: b.z0 + t, z1: b.z1 - t, bottom: floor, top: floor + spec.guide }, "guide")
    box({ x0: x, x1: x + spec.guide, z0: b.z0 + t, z1: b.z1 - t, bottom: b.top - t - spec.guide, top: b.top - t }, "guide")
  }

  return parts
}
