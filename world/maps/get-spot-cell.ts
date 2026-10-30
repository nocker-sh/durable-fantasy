import type { Cell } from "#/world/maps/types"
import type { Spot } from "#/world/town/routines"

type Props = Readonly<{ spot: Spot; places: Readonly<Record<string, Cell>> | null }>

/** 名前付きの場所だけ地図の表を使い、直接指定されたセル・タイルはその座標を保つ。 */
export function getSpotCell(props: Props): Cell | null {
  if ("cell" in props.spot) return props.spot.cell
  if ("tile" in props.spot) return [Math.floor(props.spot.tile[0] * 2), Math.floor(props.spot.tile[1] * 2)]
  return props.places?.[props.spot.place] ?? null
}
