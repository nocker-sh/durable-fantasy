import { smooth } from "#/lib/engine/smooth"
export const terraced = (x: number, z: number, edges: readonly number[], step: number, rampX: number, rampW: number, seed: number) => {
  const ramp = smooth(rampW + 1, rampW, Math.abs(x - rampX))
  let h = 0
  edges.forEach((e, k) => {
    const at = e + Math.sin(x * 0.45 + k * 1.7 + seed) * 0.6
    const half = 0.16 + ramp * 1.6
    h += step * smooth(at - half, at + half, z)
  })
  return h
}
