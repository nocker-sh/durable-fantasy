import { describe, expect, it } from "vite-plus/test"
import { PixBuf } from "./pix.ts"
import { ANIMS, EYE_DARK, FH, FW, eyesDrawn, renderFrame, type Look } from "./figure.ts"
import { RESIDENTS, RESIDENT_LOOKS } from "../town/residents.ts"

const dark = (b: PixBuf, x: number, y: number) => {
  const k = (y * b.w + x) * 4
  return b.data[k + 3] > 0 && b.data[k] === EYE_DARK[0] && b.data[k + 1] === EYE_DARK[1] && b.data[k + 2] === EYE_DARK[2]
}

function frame(look: Look, view: number, f: number, item: (typeof RESIDENTS)[number]["item"]) {
  const b = new PixBuf(FW, FH)
  renderFrame(look, "idle", f, view, item, b, 0, 0)
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
