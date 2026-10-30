import type { Sheet } from "#/dev/sheets/schema"
import { items, itemArt } from "#/dev/sheets/items"
import { npcs, households, houses, relations } from "#/dev/sheets/people"
import { maps, world } from "#/dev/sheets/maps"
import { shops, batches, makers } from "#/dev/sheets/shops"
import { recipes, stations, commissions, errands, nodes } from "#/dev/sheets/crafting"
import { monsters, skills, life } from "#/dev/sheets/combat"
import { objects } from "#/dev/sheets/objects"
import { uiIcons, textures, ramps, parts, presets, motions, anims } from "#/dev/sheets/art"
import { lines, events, messages, flavor } from "#/dev/sheets/dialogue"
import { screens } from "#/dev/sheets/screens"

export const SHEETS: Sheet[] = [
  items,
  npcs,
  households,
  houses,
  maps,
  shops,
  batches,
  makers,
  recipes,
  stations,
  commissions,
  errands,
  monsters,
  nodes,
  skills,
  life,
  objects,
  world,
  uiIcons,
  itemArt,
  textures,
  ramps,
  parts,
  presets,
  motions,
  anims,
  lines,
  relations,
  events,
  messages,
  screens,
  flavor,
]
