import type { WorkSurfaceSpec } from "../../world/town/room-fixtures"

export function workSurface(value: unknown, width: number, depth: number): WorkSurfaceSpec {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("Missing work surface dimensions")
  const source = value as Record<string, unknown>
  const keys = ["height_m", "thickness_m", "leg_width_m", "leg_inset_m", "knee_clearance_m"]
  if (!keys.every((key) => typeof source[key] === "number" && Number.isFinite(source[key]) && Number(source[key]) > 0)) throw new Error("Invalid work surface dimensions")
  const surface = {
    height: Number(source.height_m),
    thickness: Number(source.thickness_m),
    legWidth: Number(source.leg_width_m),
    legInset: Number(source.leg_inset_m),
    kneeClearance: Number(source.knee_clearance_m),
  }
  if (
    ![width, depth].every((value) => Number.isFinite(value) && value > 0) ||
    surface.thickness >= surface.height ||
    surface.legInset < surface.legWidth / 2 ||
    2 * surface.legInset + surface.legWidth >= Math.min(width, depth)
  )
    throw new Error("Invalid work surface dimensions")
  return surface
}
