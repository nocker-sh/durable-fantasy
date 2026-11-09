import { hash2 } from "#/lib/engine/hash2"
import { vnoise } from "#/lib/engine/vnoise"

/** How far a point of the salt flat is from the nearest crack between the crust's plates (0 on the crack). */
export function saltCrack(x: number, z: number): number {
  const s = 2.4
  const wx = x + (vnoise({ x, y: z, scale: 0.4, seed: 158 }) - 0.5) * 1.4
  const wz = z + (vnoise({ x, y: z, scale: 0.4, seed: 159 }) - 0.5) * 1.4
  const cx = Math.floor(wx / s)
  const cz = Math.floor(wz / s)
  const near = { a: 1e9, b: 1e9 }
  for (let j = -1; j <= 1; j++)
    for (let i = -1; i <= 1; i++) {
      const px = (cx + i + 0.15 + hash2(cx + i, cz + j, 160) * 0.7) * s
      const pz = (cz + j + 0.15 + hash2(cx + i, cz + j, 161) * 0.7) * s
      const d = Math.hypot(wx - px, wz - pz)
      if (d < near.a) {
        near.b = near.a
        near.a = d
      } else if (d < near.b) near.b = d
    }
  return (near.b - near.a) / s
}
