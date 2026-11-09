import { SHEEP_SHAPE } from "#/world/town/sheep-shape"
import { LIVESTOCK_GRAZE_PITCH } from "#/world/town/livestock-graze-pitch"
import { getYawPitchBoxRadius } from "#/lib/engine/get-yaw-pitch-box-radius"

/** Includes every yaw and grazing tilt of the native mesh, with outward allowance for Float32 vertex storage; the result remains in scene tiles. */
export function getSheepBodyRadius(scale: number): number | Error {
  if (!Number.isFinite(scale) || scale <= 0) return new Error("Invalid sheep body scale")
  const wool = SHEEP_SHAPE.wool,
    boxes = [...SHEEP_SHAPE.boxes, { position: wool.position, dimensions: wool.scale.map((axis) => axis * wool.radius * 2) }]
  const radii: number[] = []
  for (const box of boxes) {
    const bounds = [
      box.position[0] - box.dimensions[0] / 2,
      box.position[1] - box.dimensions[1] / 2,
      box.position[2] - box.dimensions[2] / 2,
      box.position[0] + box.dimensions[0] / 2,
      box.position[1] + box.dimensions[1] / 2,
      box.position[2] + box.dimensions[2] / 2,
    ] satisfies readonly [number, number, number, number, number, number]
    const radius = getYawPitchBoxRadius({ bounds, maxPitch: LIVESTOCK_GRAZE_PITCH })
    if (radius instanceof Error) return radius
    radii.push(radius)
  }
  const radius = Math.max(...radii) * scale * (1 + 2 ** -22)
  if (!Number.isFinite(radius)) return new Error("Unbounded sheep body radius")

  return radius
}
