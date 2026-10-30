import { smooth } from "#/lib/engine/smooth"
import { lerp } from "#/lib/engine/lerp"
import type { RoadPath } from "#/world/scene/world"
import { layout, PLAZA_H, roadField } from "#/world/scene/world"
import { inRect } from "#/world/scene/in-rect"
import { baseH } from "#/world/scene/helpers/world/base-h"
import { segRoad } from "#/world/scene/helpers/world/seg-road"

type Props = {
  x: number
  z: number
  dr: number
  roads: readonly RoadPath[]
}

export function computeH(props: Props): number {
  const h = { value: baseH(props.x, props.z, layout.value) }
  // plaza flattened
  const dp = Math.hypot(props.x - layout.value.plaza[0], props.z - layout.value.plaza[1])
  h.value = lerp(PLAZA_H.value, h.value, smooth(layout.value.plazaR, layout.value.plazaR + 3, dp))
  // terrace
  const T = layout.value.terrace
  if (inRect({ x: props.x, z: props.z, r: T })) h.value = T.h + (h.value - 0.1) * 0.25
  // stairs ramp under the step meshes
  const S = layout.value.stairs
  if (props.x >= S.x0 && props.x < S.x1 && props.z >= S.z0 && props.z <= S.z1) {
    const t = (props.z - S.z0) / (S.z1 - S.z0)
    h.value = lerp(T.h, baseH(props.x, S.z1 + 0.1, layout.value), t)
  }
  // river: embankments inside town, natural banks outside
  const e0State = layout.value.embanked,
    e0 = e0State[0],
    e1 = e0State[1]
  const townRiver = smooth(e0, e0 + 4, props.z) * (1 - smooth(e1 - 4, e1, props.z))
  const slope = lerp(2.2, 0.06, townRiver)
  const bed = -1.55 + Math.min(1, (props.dr / layout.value.riverHW) ** 2) * 0.35
  if (props.dr < layout.value.riverHW) h.value = bed
  else if (props.dr < layout.value.riverHW + slope) {
    const t = smooth(0, 1, (props.dr - layout.value.riverHW) / slope)
    h.value = lerp(-1.2, h.value, t)
  }
  // lavoir ledge and its stairs
  const L = layout.value.lavoir
  if (inRect({ x: props.x, z: props.z, r: L }) && props.dr >= layout.value.riverHW - 0.02) h.value = L.h
  const LS = layout.value.lavStairs
  if (inRect({ x: props.x, z: props.z, r: LS })) {
    const t = (props.z - LS.z0) / (LS.z1 - LS.z0)
    h.value = lerp(L.h, baseH(props.x, LS.z1 + 0.1, layout.value), t)
  }
  if (layout.value.shape) {
    // roads stay walkable: the landform eases off near them
    const rd = Math.max(0, segRoad(props.x, props.z, props.roads))
    h.value = lerp(h.value, layout.value.shape({ x: props.x, z: props.z, h: h.value, roadD: roadField.sample(props.x, props.z) }), smooth(0.4, 2.2, rd))
  }
  return h.value
}
