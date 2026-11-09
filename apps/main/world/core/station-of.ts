import { STATION_RULES } from "#/world/core/crafting-rules"

/** 実行時の共通設備を識別子で引く。 */
export function stationOf(id: string) {
  return STATION_RULES.find((station) => station.id === id)
}
