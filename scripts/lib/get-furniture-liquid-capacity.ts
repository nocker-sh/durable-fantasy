import type { z } from "zod"
import type { rectangularLiquidVesselSchema } from "#/scripts/lib/rectangular-liquid-vessel-schema"
import type { SettingDocument } from "#/scripts/lib/setting-document"
import { getRectangularLiquidCapacity } from "#/world/town/get-rectangular-liquid-capacity"
type Props = Readonly<{ room: SettingDocument; symbol: string; role: string; vessel: z.infer<typeof rectangularLiquidVesselSchema> }>

/** The cavity and its walls must fit the authored footprint; support, lid, material and handling still need their own design. */
export function getFurnitureLiquidCapacity(props: Props) {
  const piece = props.room.furniture?.find((piece) => piece.symbol === props.symbol),
    grid = props.room.grid,
    vessel = props.vessel
  if (!piece || piece.role !== props.role || !grid) return new Error("Liquid vessel has no matching furniture role and grid")
  const capacity = getRectangularLiquidCapacity({
    innerMm: vessel.inner_mm,
    wallMm: vessel.wall_mm,
    bottomMm: vessel.bottom_mm,
    freeboardMm: vessel.freeboard_mm,
    displacementMl: vessel.displacement_ml,
  })
  if (capacity instanceof Error) return capacity
  const widthMm = piece.rect[2] * grid.cell_m * 1000,
    depthMm = piece.rect[3] * grid.cell_m * 1000
  if (![widthMm, depthMm].every((value) => Number.isFinite(value) && value > 0) || capacity.outerMm[0] > widthMm || capacity.outerMm[2] > depthMm)
    return new Error("Liquid vessel walls exceed their furniture footprint")

  return capacity
}
