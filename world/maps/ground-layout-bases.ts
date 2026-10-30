import { OFF, OFF_LINE, OFF_POINT } from "#/world/maps/empty-layout-features"
import type { Layout } from "#/world/maps/layout-types"

export const GROUND_LAYOUT_BASE: Omit<Layout, "roads" | "plaza" | "plazaR" | "town" | "seed"> = {
  river: OFF_LINE,
  riverHW: 1.6,
  embanked: [0, 48],
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
  relief: [0.6, 1.4],
}

export const OPEN_GROUND_LAYOUT_BASE: Omit<Layout, "roads" | "seed" | "relief" | "biome" | "shape" | "fog"> = {
  river: OFF_LINE,
  riverHW: 1.6,
  embanked: [0, 48],
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
  town: [24, 24, 2, 2],
}
