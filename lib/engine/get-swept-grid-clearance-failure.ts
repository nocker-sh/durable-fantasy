import { segmentRectDistance } from "#/lib/engine/segment-rect-distance"
import { getSweptGridWindow } from "#/lib/engine/get-swept-grid-window"
import type { GridSweepQuery as Props, GridSweepFailure } from "#/lib/engine/grid-sweep-types"

/** 整数の加算と同じ座標を保ち、セルごとの剰余・除算を行の折返しへ置き換える。 */
export function getSweptGridClearanceFailure(props: Props): GridSweepFailure | null {
  const window = getSweptGridWindow(props)
  if (typeof window === "string") return window

  // 負のゼロも、元の座標加算と同じ正のゼロへ揃える。
  const cursor = { x: window.x0 + 0, z: window.z0 + 0 }
  const endX = window.x0 + window.width
  const endZ = window.z0 + window.depth
  while (cursor.z < endZ) {
    const x = cursor.x++
    const z = cursor.z
    if (cursor.x === endX) {
      cursor.x = window.x0 + 0
      cursor.z++
    }
    if (props.isCellFree([x, z])) continue
    if (segmentRectDistance([x * props.cellSize, z * props.cellSize, (x + 1) * props.cellSize, (z + 1) * props.cellSize], props.from, props.to) < props.radius - 1e-9)
      return "Moving footprint intersects a blocked grid cell"
  }
  return null
}
