import { describe, expect, it } from "vite-plus/test"
import { PixelBuffer as PixBuf } from "#/lib/graphics/pixel-buffer"
import { ANIMS } from "#/world/scene/figure/animation"
import { EYE_DARK, FH, FW, eyesDrawn } from "#/world/scene/figure/render"
import { renderFrame } from "#/world/scene/figure/render-frame"
import type { Look } from "#/world/scene/figure/look"
import { RESIDENTS, RESIDENT_LOOKS } from "#/world/town/residents"

const dark = (b: PixBuf, x: number, y: number) => {
  const k = (y * b.w + x) * 4
  return b.data[k + 3] > 0 && b.data[k] === EYE_DARK[0] && b.data[k + 1] === EYE_DARK[1] && b.data[k + 2] === EYE_DARK[2]
}

function frame(look: Look, view: number, f: number, item: (typeof RESIDENTS)[number]["item"]) {
  const b = new PixBuf(FW, FH)
  renderFrame({ L: look, anim: "idle", f: f, view: view, item: item, out: b, ox: 0, oy: 0 })
  return b
}

/** The eye-dark marks, as groups of pixels touching each other (corners count). */
function marks(b: PixBuf): number {
  const seen = new Set<number>()
  let n = 0
  for (let y = 0; y < FH; y++)
    for (let x = 0; x < FW; x++) {
      if (!dark(b, x, y) || seen.has(y * FW + x)) continue
      n++
      const todo = [[x, y]]
      seen.add(y * FW + x)
      while (todo.length) {
        const [cx, cy] = todo.pop()!
        for (let dy = -1; dy <= 1; dy++)
          for (let dx = -1; dx <= 1; dx++) {
            const nx = cx + dx,
              ny = cy + dy
            if (nx < 0 || ny < 0 || nx >= FW || ny >= FH || seen.has(ny * FW + nx) || !dark(b, nx, ny)) continue
            seen.add(ny * FW + nx)
            todo.push([nx, ny])
          }
      }
    }
  return n
}

describe("the T eyes never touch", () => {
  const blinkFrame = (ANIMS.idle.blink as number[])[0]
  for (const [i, r] of RESIDENTS.entries()) {
    it(`${r.name}: from all eight sides, open and closed, the two bars keep a pixel between them`, () => {
      const look = RESIDENT_LOOKS[i]
      for (let view = 0; view < 8; view++) {
        for (const f of [0, blinkFrame]) {
          const drawn = marks(frame({ ...look, eyeStyle: "t" }, view, f, r.item))
          expect(drawn, `view ${view} frame ${f}`).toBe(eyesDrawn.count)
        }
      }
    }, 30_000)
  }
})
