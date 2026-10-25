// Paints a band of a map's ground off the main thread (terrain.ts), and sends the pixels back.
import { fieldsNow, setLayout, type Fields } from "./world"
import { layoutOf } from "../maps/layouts.ts"
import { GROUND_PX, paintRows } from "./terrain"
import { PixBuf } from "./pix"

export interface GroundJob {
  map: string
  y0: number
  y1: number
}
export interface GroundDone {
  y0: number
  data: Uint8ClampedArray<ArrayBuffer>
  /** the plan's fields, from the first band */ fields?: Fields
}

self.onmessage = (event: MessageEvent<GroundJob>) => {
  const { map, y0, y1 } = event.data
  setLayout(layoutOf(map))
  const buf = new PixBuf(GROUND_PX, y1 - y0)
  paintRows(buf, y0, y1)
  const done: GroundDone = { y0, data: buf.data, ...(y0 === 0 ? { fields: fieldsNow() } : {}) }
  ;(self as unknown as Worker).postMessage(done, [buf.data.buffer])
}
