import { PixBuf, pick, hash2, vnoise } from "../pix"

export function plainTex(ramp: string, light: number, noise = 0.12, seed = 6, size = 64): PixBuf {
  const b = new PixBuf(size, size)
  b.fill((x, y) => pick(ramp, light + (vnoise(x, y, 0.1, seed) - 0.5) * noise + (hash2(x, y, seed) - 0.5) * noise * 0.5, x, y))
  return b
}

export function clothStripeTex(a: string, c: string, seed = 7): PixBuf {
  const b = new PixBuf(32, 32)
  b.fill((x, y) => {
    const stripe = Math.floor(x / 4) % 2 === 0
    let v = 0.62 + (vnoise(x, y, 0.15, seed) - 0.5) * 0.2 - (y > 26 ? 0.15 : 0)
    if (y > 28 && x % 4 === 0) return null
    return pick(stripe ? a : c, v, x, y)
  })
  return b
}
