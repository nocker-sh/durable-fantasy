import { getHorizontalBounds } from "#/lib/graphics/ray/get-horizontal-bounds"
import { appendPrimitives } from "#/lib/graphics/ray/append-primitives"
import { getGridRectangleClearanceError } from "#/lib/engine/get-grid-rectangle-clearance-error"
import { getNativeBody } from "#/world/scene/figure/get-native-body"
import type { NativeBodyFrame } from "#/world/scene/figure/native-body-frame-types"
import type { getHeldWaterVesselPose } from "#/world/scene/figure/get-held-water-vessel-pose"
import type { SettingDocument } from "#/scripts/lib/setting-document"
import type { Look } from "#/world/scene/figure/look"
type Props = {
  room: SettingDocument
  symbol: string
  look: Look
  posed: Exclude<ReturnType<typeof getHeldWaterVesselPose>, Error>
  body: readonly [number, number]
  heading: number
  native?: NativeBodyFrame
}

/** Resolve the target slot in 3D separately; all walls and other furniture remain blocked for the complete body and jar envelope. */
export function getWaterPickupFloorError(props: Props): Error | null {
  const grid = props.room.grid
  if (!grid) return new Error("Water pickup has no room grid")
  const body = getNativeBody({ look: props.look, skeleton: props.posed.skeleton, native: props.native })
  if (body instanceof Error) return body
  const primitives = appendPrimitives(body.prims, props.posed.primitives)
  if (primitives instanceof Error) return primitives
  const rect = getHorizontalBounds({ primitives, position: props.body, heading: props.heading, scale: 1 })
  if (rect instanceof Error) return rect

  return getGridRectangleClearanceError({
    rect,
    cellSize: grid.cell_m,
    isCellFree: (cell) => {
      const symbol = grid.rows[cell[1]]?.[cell[0]]
      return symbol === "." || symbol === "D" || symbol === props.symbol
    },
  })
}
