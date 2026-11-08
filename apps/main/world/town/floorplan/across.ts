import { DIV } from "#/world/town/floorplan/geometry"
import type { DividerKind, Divider } from "#/world/town/floorplan/types"

type Props = {
  floor: number
  kind: DividerKind
  x0: number
  x1: number
  z: number
  gx: number | null
  gap?: number
}

/** A partition across x at depth z (from x0 to x1), with a gap of `gap` metres centred on `gx`. */
export function across(props: Props): Divider[] {
  const gap = props.gap === undefined ? 1.0 : props.gap

  const half = { floor: props.floor, kind: props.kind, z0: props.z - DIV / 2, z1: props.z + DIV / 2 }
  if (props.gx === null) return [{ ...half, x0: props.x0, x1: props.x1 }]
  return [
    { ...half, x0: props.x0, x1: Math.max(props.x0, props.gx - gap / 2) },
    { ...half, x0: Math.min(props.x1, props.gx + gap / 2), x1: props.x1 },
  ].filter((d) => d.x1 - d.x0 > 0.05)
}
