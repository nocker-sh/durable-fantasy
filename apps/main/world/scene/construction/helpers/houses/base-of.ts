import { groundH } from "#/world/scene/ground-h"

// ---------------------------------------------------------------- helpers
type Props = {
  x0: number
  z0: number
  x1: number
  z1: number
}

export function baseOf(props: Props) {
  const hs = [groundH(props.x0, props.z0), groundH(props.x1, props.z0), groundH(props.x0, props.z1), groundH(props.x1, props.z1), groundH((props.x0 + props.x1) / 2, (props.z0 + props.z1) / 2)]
  return { lo: Math.min(...hs), hi: Math.max(...hs) }
}
