import { walkDirection } from "#/world/scene/walk-direction"
import { cellOf } from "#/world/scene/runtime/cell-of"
import { center } from "#/world/scene/runtime/center"
import type { V2 } from "#/world/scene/construction/registry"

/** 画面の方向を格子へ回し、斜めの角が塞がれた場合は横、縦の順に滑る候補を作る。 */
export function getHeldWalkCandidates(direction: [number, number], yaw: number, from: V2): V2[] {
  const step = walkDirection(direction, yaw)
  const cell = cellOf(from)
  const offsets: V2[] = step[0] && step[1] ? [step, [step[0], 0], [0, step[1]]] : [step]
  return offsets.map((offset) => center([cell[0] + offset[0], cell[1] + offset[1]]))
}
