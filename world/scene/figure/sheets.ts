import { PixBuf } from "../pix"
import { type Anim, FRAMES } from "./animation.ts"
import type { Look, Item } from "./look.ts"
import { FW, FH, renderFrame } from "./render.ts"

export interface Sheet {
  buf: PixBuf
  cols: number
  rows: Record<string, number>
  anims: Anim[]
}

/** Render all views of the given animations into one atlas: row = anim*8 + view, column = frame. */
export function buildSheet(L: Look, anims: Anim[], items: Partial<Record<Anim, Item>>, defItem: Item): Sheet {
  const cols = Math.max(...anims.map((a) => FRAMES[a]))
  const buf = new PixBuf(cols * FW, anims.length * 8 * FH)
  const rows: Record<string, number> = {}
  anims.forEach((a, ai) => {
    rows[a] = ai * 8
    for (let v = 0; v < 8; v++)
      for (let f = 0; f < FRAMES[a]; f++) {
        const it = a in items ? items[a]! : defItem
        renderFrame(L, a, f, v, it, buf, f * FW, (ai * 8 + v) * FH)
      }
  })
  return { buf, cols, rows, anims }
}

/** One direction of one animation: frames laid out left to right. */
export function buildSheetStrip(L: Look, anim: Anim, item: Item, view: number): PixBuf {
  const n = FRAMES[anim]
  const buf = new PixBuf(n * FW, FH)
  for (let f = 0; f < n; f++) renderFrame(L, anim, f, view, item, buf, f * FW, 0)
  return buf
}
