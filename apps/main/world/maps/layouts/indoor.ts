import { OFF, OFF_LINE, OFF_POINT } from "#/world/maps/empty-layout-features"
import type { Layout } from "#/world/maps/layout-types"

export const INDOOR: Layout = {
  river: OFF_LINE,
  riverHW: 1.6,
  embanked: [0, 48],
  roads: [],
  plaza: OFF_POINT,
  plazaR: 0,
  terrace: OFF,
  stairs: OFF,
  lavoir: OFF,
  lavStairs: OFF,
  bridge: OFF,
  fields: [],
  pigpen: OFF,
  pasture: OFF,
  graveyard: OFF,
  gardens: [],
  dirtPatches: [],
  town: [24, 24, 40, 40],
  seed: 1,
  relief: [0, 0],
}
