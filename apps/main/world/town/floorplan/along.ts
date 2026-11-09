import { DIV } from "#/world/town/floorplan/geometry"
import type { DividerKind, Divider } from "#/world/town/floorplan/types"

type Props = {
  floor: number
  kind: DividerKind
  z0: number
  z1: number
  x: number
  gz: number | null
  gap?: number
}

/** A partition along z at x (from z0 to z1), with a gap. */
export function along(props: Props): Divider[] {
  const gap = props.gap === undefined ? 1.0 : props.gap

  const half = { floor: props.floor, kind: props.kind, x0: props.x - DIV / 2, x1: props.x + DIV / 2 }
  if (props.gz === null) return [{ ...half, z0: props.z0, z1: props.z1 }]
  return [
    { ...half, z0: props.z0, z1: Math.max(props.z0, props.gz - gap / 2) },
    { ...half, z0: Math.min(props.z1, props.gz + gap / 2), z1: props.z1 },
  ].filter((d) => d.z1 - d.z0 > 0.05)
}
