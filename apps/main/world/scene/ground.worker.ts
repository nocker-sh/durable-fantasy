// Paints a band of a map's ground off the main thread (terrain.ts), and sends the pixels back.
import { fieldsNow } from "#/world/scene/fields-now"
import { setLayout } from "#/world/scene/set-layout"
import type { Fields } from "#/world/maps/ground/types"
import { layoutOf } from "#/world/maps/layouts"
import { GROUND_PX } from "#/world/scene/terrain"
import { paintRows } from "#/world/scene/paint-rows"
import { PixelBuffer as PixBuf } from "#/lib/graphics/pixel-buffer"

export type GroundJob = {
  map: string
  y0: number
  y1: number
}
export type GroundDone = {
  y0: number
  data: Uint8ClampedArray<ArrayBuffer>
  /** the plan's fields, from the first band */ fields?: Fields
}

self.onmessage = (event: MessageEvent<GroundJob>) => {
  const mapSource = event.data,
    map = mapSource.map,
    y0 = mapSource.y0,
    y1 = mapSource.y1
  setLayout(layoutOf(map))
  const buf = new PixBuf(GROUND_PX, y1 - y0)
  paintRows(buf, y0, y1)
  const done: GroundDone = { y0, data: buf.data, ...(y0 === 0 ? { fields: fieldsNow() } : {}) }
  ;(self as unknown as Worker).postMessage(done, [buf.data.buffer])
}
