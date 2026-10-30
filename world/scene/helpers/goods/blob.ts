import { PixelBuffer as PixBuf } from "#/lib/graphics/pixel-buffer"
import type { RGB } from "#/lib/graphics/pixel-types"
import { shade } from "#/world/scene/helpers/goods/shade"

/** Shaded ellipse lit from the upper left, with a 1px dark rim on the lower right. */
type Props = {
  b: PixBuf
  cx: number
  cy: number
  rx: number
  ry: number
  ramp: RGB[]
  spec?: boolean
  base?: number
}

export function blob(props: Props) {
  const spec = props.spec === undefined ? true : props.spec
  const base = props.base === undefined ? 0.55 : props.base

  for (const y = { value: Math.floor(props.cy - props.ry - 1) }; y.value <= props.cy + props.ry + 1; y.value++)
    for (const x = { value: Math.floor(props.cx - props.rx - 1) }; x.value <= props.cx + props.rx + 1; x.value++) {
      const nx = (x.value + 0.5 - props.cx) / props.rx,
        ny = (y.value + 0.5 - props.cy) / props.ry
      const d = nx * nx + ny * ny
      if (d > 1) continue
      const nz = Math.sqrt(1 - d)
      const l = { value: base + (-nx * 0.45 - ny * 0.55 + nz * 0.5) * 0.55 }
      if (d > 0.72 && nx + ny > 0.3) l.value = 0
      props.b.set({ x: x.value, y: y.value, color: shade({ ramp: props.ramp, l: l.value, x: x.value, y: y.value }) })
    }
  if (spec && props.rx >= 2) props.b.set({ x: Math.round(props.cx - props.rx * 0.4), y: Math.round(props.cy - props.ry * 0.45), color: props.ramp[props.ramp.length - 1] })
}
