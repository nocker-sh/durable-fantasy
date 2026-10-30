import { hash2 } from "#/lib/engine/hash2"
import { PPU } from "#/world/scene/textures/palette"
import type { Stamp } from "#/world/scene/terrain"

/** The character a shape puts at a pixel, if any: shapes sit one to a cell of `cell` pixels, where `dense` (0–1, at the cell's place) allows. */
type Props = {
  sx: number
  sy: number
  cell: number
  seed: number
  shapes: Stamp[]
  dense: (x: number, z: number) => number
}

export function stampAt(props: Props): string | null {
  const cx = Math.floor(props.sx / props.cell),
    cy = Math.floor(props.sy / props.cell)
  for (const oy = { value: 0 }; oy.value >= -1; oy.value--)
    for (const ox = { value: 0 }; ox.value >= -1; ox.value--) {
      const gx = cx + ox.value,
        gy = cy + oy.value
      const px = gx * props.cell + Math.floor(hash2(gx, gy, props.seed + 2) * props.cell * 0.6),
        py = gy * props.cell + Math.floor(hash2(gx, gy, props.seed + 3) * props.cell * 0.6)
      const st = props.shapes[Math.min(props.shapes.length - 1, Math.floor(hash2(gx, gy, props.seed + 1) * props.shapes.length))]
      const lx = props.sx - px,
        ly = props.sy - py
      if (lx < 0 || ly < 0 || ly >= st.length || lx >= st[ly].length) continue
      const ch = st[ly][lx]
      if (ch === ".") continue
      if (hash2(gx, gy, props.seed) > props.dense((px + 2) / PPU, (py + 2) / PPU)) continue
      return ch
    }
  return null
}
