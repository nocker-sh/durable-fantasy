import type { WorkSurfaceSpec } from "#/world/town/room-fixtures"

/** Keep the top, leg sections and knee space in the same units before constructing their shared solid parts. */
export function scaleWorkSurface(surface: WorkSurfaceSpec, scale: number): WorkSurfaceSpec {
  if (!Number.isFinite(scale) || scale <= 0) throw new Error("Invalid work surface scale")

  return { height: surface.height * scale, thickness: surface.thickness * scale, legWidth: surface.legWidth * scale, legInset: surface.legInset * scale, kneeClearance: surface.kneeClearance * scale }
}
