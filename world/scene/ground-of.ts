import { PixelBuffer as PixBuf } from "#/lib/graphics/pixel-buffer"
import { memory } from "#/world/scene/ground"
import { obtain } from "#/world/scene/helpers/ground/obtain"

/** The ground of a map; only the map being entered is retained after loading. */
export function groundOf(map: string): Promise<PixBuf> {
  const p = { value: memory.get(map) }
  if (!p.value) {
    memory.clear()
    p.value = obtain(map, true)
    memory.set(map, p.value)
    void p.value.catch(() => {
      if (memory.get(map) === p.value) memory.delete(map)
    })
  }
  return p.value
}
