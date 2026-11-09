import type { V2 } from "#/world/scene/construction/registry"
import type { HouseDef } from "#/world/town/house-types"
import type { Side } from "#/world/scene/dressing"
import { doorPoint } from "#/world/scene/helpers/dressing/door-point"

/** Spots along the outside of one wall, `off` tiles out, keeping clear of the door. */
type Props = {
  h: HouseDef
  side: Side
  off: number
  step?: number
}

export function along(props: Props): V2[] {
  const step = props.step === undefined ? 0.55 : props.step

  const out: V2[] = []
  const door = doorPoint(props.h)
  const x0State = [props.h.x0, props.h.x1, props.h.z0, props.h.z1],
    x0 = x0State[0],
    x1 = x0State[1],
    z0 = x0State[2],
    z1 = x0State[3]
  const run = props.side === "n" || props.side === "s" ? [x0 + 0.35, x1 - 0.35] : [z0 + 0.35, z1 - 0.35]
  for (const t = { value: run[0] }; t.value <= run[1]; t.value += step) {
    const p: V2 = props.side === "s" ? [t.value, z1 + props.off] : props.side === "n" ? [t.value, z0 - props.off] : props.side === "e" ? [x1 + props.off, t.value] : [x0 - props.off, t.value]
    if (Math.hypot(p[0] - door[0], p[1] - door[1]) < 1.4) continue
    out.push(p)
  }
  return out
}
