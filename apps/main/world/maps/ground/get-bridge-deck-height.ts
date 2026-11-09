import { lerp } from "#/lib/engine/lerp"
import type { Rect } from "#/world/maps/layout-types"
import type { HeightSampler } from "#/world/maps/ground/types"

type Props = Readonly<{ x: number; bridge: Readonly<Rect>; groundHeight: HeightSampler }>

/** Banks belong to this bridge's centreline; the arch and end offsets match its drawn deck. */
export function getBridgeDeckHeight(props: Props): number {
  const bridge = props.bridge,
    z = (bridge.z0 + bridge.z1) / 2,
    ha = props.groundHeight(bridge.x0 - 0.2, z),
    hb = props.groundHeight(bridge.x1 + 0.2, z),
    t = (props.x - bridge.x0) / (bridge.x1 - bridge.x0)
  return lerp(ha, hb, t) + Math.sin(Math.PI * Math.min(1, Math.max(0, t))) * 0.35 + 0.04
}
