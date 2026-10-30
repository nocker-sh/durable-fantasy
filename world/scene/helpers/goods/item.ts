import { RAMPS } from "#/world/scene/pix"
import { Rng } from "#/lib/engine/random"
import { PixelBuffer as PixBuf } from "#/lib/graphics/pixel-buffer"
import { hash2 } from "#/lib/engine/hash2"
import { FR } from "#/world/scene/goods"
import { shade } from "#/world/scene/helpers/goods/shade"
import { blob } from "#/world/scene/helpers/goods/blob"

type Props = {
  b: PixBuf
  kind: string
  cx: number
  cy: number
  rng: Rng
}

export function item(props: Props) {
  switch (props.kind) {
    case "apple":
    case "appleG": {
      const r = 3.2 + props.rng.next() * 0.8
      blob({ b: props.b, cx: props.cx, cy: props.cy, rx: r, ry: r * 0.92, ramp: FR[props.kind] })
      props.b.set({ x: Math.round(props.cx), y: Math.round(props.cy - r), color: RAMPS.timber[1] })
      if (props.rng.next() < 0.3) props.b.set({ x: Math.round(props.cx + 1), y: Math.round(props.cy - r - 1), color: FR.leafG[3] })
      if (props.kind === "apple" && props.rng.next() < 0.5) props.b.set({ x: Math.round(props.cx - 1), y: Math.round(props.cy + 1), color: FR.appleG[3] })
      break
    }
    case "pear":
      blob({ b: props.b, cx: props.cx, cy: props.cy + 1, rx: 3.2, ry: 3, ramp: FR.pear })
      blob({ b: props.b, cx: props.cx - 0.3, cy: props.cy - 2.2, rx: 2, ry: 2, ramp: FR.pear, spec: false })
      props.b.set({ x: Math.round(props.cx), y: Math.round(props.cy - 5), color: RAMPS.timber[1] })
      break
    case "plum":
      blob({ b: props.b, cx: props.cx, cy: props.cy, rx: 2.6, ry: 2.9, ramp: FR.plum })
      break
    case "onion":
      blob({ b: props.b, cx: props.cx, cy: props.cy, rx: 3.4, ry: 3, ramp: FR.onion })
      props.b.set({ x: Math.round(props.cx), y: Math.round(props.cy - 3), color: FR.onion[1] })
      props.b.set({ x: Math.round(props.cx), y: Math.round(props.cy - 4), color: FR.onion[3] })
      break
    case "turnip":
      blob({ b: props.b, cx: props.cx, cy: props.cy, rx: 3.4, ry: 3.2, ramp: FR.turnip })
      for (const x = { value: -3 }; x.value <= 3; x.value++)
        for (const y = { value: -3 }; y.value <= -1; y.value++)
          if (x.value * x.value + (y.value + 1) * 3 < 8 && props.b.alpha(Math.round(props.cx + x.value), Math.round(props.cy + y.value)))
            props.b.set({ x: Math.round(props.cx + x.value), y: Math.round(props.cy + y.value), color: shade({ ramp: FR.plum, l: 0.5 - x.value * 0.05, x: x.value, y: y.value }) })
      props.b.set({ x: Math.round(props.cx), y: Math.round(props.cy - 4), color: FR.leafG[3] })
      props.b.set({ x: Math.round(props.cx - 1), y: Math.round(props.cy - 5), color: FR.leafG[2] })
      props.b.set({ x: Math.round(props.cx + 1), y: Math.round(props.cy - 5), color: FR.leafG[4] })
      break
    case "cabbage": {
      blob({ b: props.b, cx: props.cx, cy: props.cy, rx: 6, ry: 5.2, ramp: FR.cabbage, spec: false })
      for (const k = { value: -1 }; k.value <= 1; k.value++)
        for (const t = { value: 0 }; t.value < 5; t.value++)
          props.b.set({ x: Math.round(props.cx + k.value * 3 + t.value * 0.4 * k.value), y: Math.round(props.cy - 3 + t.value), color: FR.cabbage[4] })
      for (const x = { value: -6 }; x.value <= 6; x.value++)
        if (Math.abs(x.value) > 3) props.b.set({ x: Math.round(props.cx + x.value), y: Math.round(props.cy - 2 + Math.abs(x.value) * 0.3), color: FR.cabbage[1] })
      break
    }
    case "egg":
      blob({ b: props.b, cx: props.cx, cy: props.cy, rx: 2.2, ry: 2.8, ramp: FR.egg })
      break
    case "grape":
      for (const k = { value: 0 }; k.value < 9; k.value++) {
        const row = k.value < 4 ? 0 : k.value < 7 ? 1 : 2,
          col = k.value < 4 ? k.value : k.value < 7 ? k.value - 4 : k.value - 7
        blob({ b: props.b, cx: props.cx - (3 - row) * 1.4 + col * 2.8 + row * 0.2, cy: props.cy - 3 + row * 2.6, rx: 1.6, ry: 1.6, ramp: FR.grape, spec: true, base: 0.6 })
      }
      props.b.set({ x: Math.round(props.cx), y: Math.round(props.cy - 5), color: RAMPS.timber[2] })
      props.b.set({ x: Math.round(props.cx + 1), y: Math.round(props.cy - 6), color: FR.leafG[3] })
      props.b.set({ x: Math.round(props.cx + 2), y: Math.round(props.cy - 6), color: FR.leafG[4] })
      break
    case "carrot": {
      const ang = (props.rng.next() - 0.5) * 0.6
      for (const t = { value: 0 }; t.value < 11; t.value++) {
        const w = 2.2 * (1 - t.value / 13)
        const x = props.cx + Math.sin(ang) * t.value,
          y = props.cy - 4 + Math.cos(ang) * t.value
        for (const d = { value: -w }; d.value <= w; d.value += 1)
          props.b.set({
            x: Math.round(x + d.value),
            y: Math.round(y),
            color: shade({ ramp: FR.carrot, l: 0.6 - d.value * 0.15 - (t.value % 3 === 0 ? 0.15 : 0), x: Math.round(x + d.value), y: Math.round(y) }),
          })
      }
      for (const k = { value: -2 }; k.value <= 2; k.value++)
        for (const t = { value: 1 }; t.value < 5; t.value++)
          props.b.set({ x: Math.round(props.cx + k.value * 0.8 - Math.sin(ang) * t.value), y: Math.round(props.cy - 4 - t.value), color: FR.leafG[2 + ((k.value + t.value) & 1)] })
      break
    }
    case "bread": {
      blob({ b: props.b, cx: props.cx, cy: props.cy, rx: 7, ry: 3.6, ramp: FR.bread, spec: false, base: 0.62 })
      for (const k = { value: -2 }; k.value <= 2; k.value++)
        for (const t = { value: 0 }; t.value < 3; t.value++)
          props.b.set({ x: Math.round(props.cx + k.value * 2.6 + t.value), y: Math.round(props.cy - 2 + t.value * 0.6), color: FR.bread[k.value % 2 ? 4 : 1] })
      break
    }
    case "roll":
      blob({ b: props.b, cx: props.cx, cy: props.cy, rx: 3.2, ry: 2.6, ramp: FR.bread, spec: true, base: 0.62 })
      break
    case "cheese": {
      // wheel seen from the side
      for (const y = { value: -3 }; y.value <= 3; y.value++)
        for (const x = { value: -8 }; x.value <= 8; x.value++) {
          const top = y.value < -1
          const e = Math.abs(x.value) / 8.5
          if (e > 1) continue
          props.b.set({
            x: Math.round(props.cx + x.value),
            y: Math.round(props.cy + y.value),
            color: top ? shade({ ramp: FR.cheese, l: 0.8 - e * 0.2, x: x.value, y: y.value }) : shade({ ramp: FR.rind, l: 0.8 - (x.value + 8) / 18 - (y.value > 2 ? 0.3 : 0), x: x.value, y: y.value }),
          })
        }
      if (props.rng.next() < 0.4)
        for (const y = { value: -3 }; y.value <= 3; y.value++)
          for (const x = { value: 2 }; x.value <= 8; x.value++)
            if (x.value - 2 < y.value + 3)
              props.b.set({
                x: Math.round(props.cx + x.value),
                y: Math.round(props.cy + y.value),
                color: shade({ ramp: FR.cheese, l: 0.65 + (hash2(x.value, y.value, 1) > 0.85 ? -0.4 : 0), x: x.value, y: y.value }),
              })
      break
    }
    case "fish":
    case "trout":
    case "herring": {
      const ramp = FR[props.kind]
      for (const x = { value: -9 }; x.value <= 9; x.value++) {
        const w = x.value > 6 ? (x.value - 6) * 1.1 : 2.6 * Math.cos((((x.value + 1) / 12) * Math.PI) / 1.2)
        for (const y = { value: -w }; y.value <= w; y.value++) {
          const yy = Math.round(props.cy + y.value),
            xx = Math.round(props.cx + x.value)
          const l = { value: 0.72 - (y.value / 5) * 0.45 - (Math.abs(y.value) > w - 1 ? 0.25 : 0) }
          if (Math.abs(y.value) < 0.6 && x.value < 6) l.value += 0.12
          props.b.set({ x: xx, y: yy, color: shade({ ramp: ramp, l: l.value, x: xx, y: yy }) })
        }
      }
      props.b.set({ x: Math.round(props.cx - 7), y: Math.round(props.cy - 1), color: RAMPS.iron[0] })
      props.b.set({ x: Math.round(props.cx - 6), y: Math.round(props.cy - 1), color: ramp[4] })
      for (const k = { value: 0 }; k.value < 3; k.value++) props.b.set({ x: Math.round(props.cx + k.value - 1), y: Math.round(props.cy - 3 - (k.value === 1 ? 1 : 0)), color: ramp[1] })
      break
    }
    case "jug": {
      const ramp = props.rng.next() < 0.5 ? FR.clay : FR.jar
      for (const y = { value: -9 }; y.value <= 7; y.value++) {
        const t = (y.value + 9) / 16
        const w = y.value < -6 ? 1.8 : 2 + Math.sin(t * Math.PI) * 3.6
        for (const x = { value: -w }; x.value <= w; x.value++) {
          const xx = Math.round(props.cx + x.value),
            yy = Math.round(props.cy + y.value)
          props.b.set({ x: xx, y: yy, color: shade({ ramp: ramp, l: 0.62 - (x.value / w) * 0.35 + (y.value === -9 ? 0.2 : 0) - (y.value > 5 ? 0.2 : 0), x: xx, y: yy }) })
        }
      }
      for (const y = { value: -7 }; y.value <= -1; y.value++) props.b.set({ x: Math.round(props.cx + 5 + (y.value > -6 && y.value < -2 ? 1 : 0)), y: Math.round(props.cy + y.value), color: ramp[1] })
      for (const x = { value: -4 }; x.value <= 4; x.value++) props.b.set({ x: Math.round(props.cx + x.value), y: Math.round(props.cy - 2), color: ramp[4] })
      break
    }
  }
}
