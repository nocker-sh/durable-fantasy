import { PixelBuffer as PixBuf } from "#/lib/graphics/pixel-buffer"
import { pick } from "#/world/scene/pick"
import { hash2 } from "#/lib/engine/hash2"
import { vnoise } from "#/lib/engine/vnoise"

type Props = {
  light: number
  seed: number
}

/**
 * Iron plate left out for two hundred years: rust in blotches, darker where the wet runs down from
 * the seams, the plates' edges and rivets still showing, a flake of the old paint here and there.
 */
export function rustTex(props: Props): PixBuf {
  const b = new PixBuf(64, 64)
  b.fill((x, y) => {
    const fine = hash2(x, y, props.seed + 1)
    // the paint the engine wore, left in patches the rust has not eaten yet
    if (vnoise({ x: x, y: y, scale: 0.06, seed: props.seed + 5 }) > 0.74 && fine > 0.3) return pick({ ramp: "engine", b: 0.3 + fine * 0.25, x: x, y: y })
    const blotch = vnoise({ x: x, y: y, scale: 0.09, seed: props.seed }) - 0.5
    const run = hash2(x >> 1, y >> 5, props.seed + 2) > 0.78 ? -0.14 * (1 - (y % 32) / 32) : 0
    const seam = y % 32 === 0 || x % 32 === 0 ? -0.3 : 0
    const rivet = (y % 32 === 3 || x % 32 === 3) && (x + y) % 8 === 3 ? 0.28 : 0
    return pick({ ramp: "rust", b: props.light + blotch * 0.5 + (fine - 0.5) * 0.16 + run + seam + rivet, x: x, y: y })
  })
  return b
}
