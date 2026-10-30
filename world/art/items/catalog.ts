import { hexToRgb as hex } from "#/lib/graphics/hex-to-rgb"
import { type PixelBuffer as PixBuf } from "#/lib/graphics/pixel-buffer"
import { sprite } from "#/world/art/sprite"
import { FLASK, BOWL, CUP } from "#/world/art/items/vessels"
import { k } from "#/world/art/items/palette"
import { r } from "#/world/art/items/r"
import { hexes } from "#/world/art/items/hexes"
import { ramp3 } from "#/world/art/items/ramp3"
import { LEAF, FLOWER, MUSHROOM, NUTS, POTATO, LOGS } from "#/world/art/items/plants"
import { BLOB, HIDE, FUR, FANG, FEATHER, SHELL, BONE, COG, SCRAP, THREAD, CRYSTAL, GLOW, crystalWhite } from "#/world/art/items/materials"
import { LETTER, BELL } from "#/world/art/items/quest"
import { STAFF, BOW, CAPE, NECKLACE, MUFFLER, SCARF, SICKLE, ROD } from "#/world/art/items/equipment"
import { SKEWER, DRIEDFISH, PIE } from "#/world/art/items/food"

export const ITEM_SPRITES: Record<string, PixBuf> = {
  potionR: sprite(FLASK, { k, c: r("wood", 3), g: hex("#cfe0e0"), ...hexes("#f2a08a", "#c8403a", "#7a1e1e") }),
  potionO: sprite(FLASK, { k, c: r("wood", 3), g: hex("#cfe0e0"), ...hexes("#ffd8a0", "#e08a3a", "#8a4a1e") }),
  potionW: sprite(FLASK, { k, c: r("wood", 3), g: hex("#cfe0e0"), ...hexes("#ffffff", "#e0e4ec", "#9098b0") }),
  potionB: sprite(FLASK, { k, c: r("wood", 3), g: hex("#cfe0e0"), ...hexes("#a6c8f0", "#4a7cc8", "#1e3a7a") }),
  herb: sprite(LEAF, { k, b: r("wood", 2), ...ramp3("leaf") }),
  herbB: sprite(LEAF, { k, b: r("wood", 2), ...hexes("#bfe0e8", "#5a9aa8", "#2a4a58") }),
  flower: sprite(FLOWER, { k, y: hex("#f0d070"), g: r("leaf", 3), ...hexes("#f8d0e0", "#d880a8", "#88385a") }),
  mushroom: sprite(MUSHROOM, { k, w: hex("#f4ecd8"), c: hex("#e8dcc0"), ...hexes("#e8a070", "#b85a3a", "#6a2a1e") }),
  jelly: sprite(BLOB, { k, w: hex("#ffffff"), ...hexes("#d8f0a0", "#8cc060", "#4a7a30") }),
  jellyB: sprite(BLOB, { k, w: hex("#ffffff"), ...hexes("#c0e0ff", "#6aa0e0", "#2a5090") }),
  jellyP: sprite(BLOB, { k, w: hex("#ffffff"), ...hexes("#e8c8f0", "#a870c0", "#583070") }),
  jellyR: sprite(BLOB, { k, w: hex("#ffffff"), ...hexes("#ffc8b0", "#e07050", "#8a3020") }),
  fur: sprite(FUR, { k, ...ramp3("cBrown") }),
  furW: sprite(FUR, { k, ...ramp3("wool") }),
  hide: sprite(HIDE, { k, ...hexes("#c9a778", "#987448", "#61482d") }),
  leather: sprite(HIDE, { k, ...hexes("#bd8050", "#89532e", "#51311e") }),
  fang: sprite(FANG, { k, ...hexes("#fffaf0", "#e0d8c0", "#8a8070") }),
  feather: sprite(FEATHER, { k, b: r("wood", 2), ...hexes("#f8f4e8", "#c8c0b0", "#706858") }),
  shell: sprite(SHELL, { k, ...ramp3("cMustard") }),
  bone: sprite(BONE, { k, ...hexes("#fffaf0", "#ded4bc", "#8a8070") }),
  cog: sprite(COG, { k, ...ramp3("iron") }),
  scrap: sprite(SCRAP, { k, ...hexes("#c08850", "#8a5a30", "#4a2e1e") }),
  thread: sprite(THREAD, { k, ...ramp3("wool") }),
  crystal: sprite(CRYSTAL, { k, w: hex("#ffffff"), ...GLOW }),
  crystalW: sprite(CRYSTAL, crystalWhite),
  letter: sprite(LETTER, { k, h: r("plaster", 5), p: r("plaster", 4), s: r("plaster", 2), r: r("cRed", 3) }),
  bell: sprite(BELL, { k, b: r("cRed", 3), ...ramp3("gold") }),
  staff: sprite(STAFF, { k, g: r("gold", 2), G: hex("#8fd0e0"), w: hex("#e8ffff"), m: r("wood", 3), s: r("wood", 1) }),
  bow: sprite(BOW, { k, h: hex("#f4ecd8"), m: r("wood", 3), s: r("wood", 1) }),
  cape: sprite(CAPE, { k, b: r("gold", 2), ...ramp3("cGreen") }),
  necklace: sprite(NECKLACE, { k, b: r("gold", 2), h: hex("#c8e0ff"), G: hex("#6aa0e0"), g: hex("#2a5090") }),
  muffler: sprite(MUFFLER, { k, f: r("cRed", 3), ...ramp3("cRed") }),
  mufflerS: sprite(MUFFLER, { k, f: hex("#f0e8d4"), h: hex("#f0e8d4"), m: r("cBlue", 2), s: r("cBlue", 0) }),
  stole: sprite(FUR, { k, ...ramp3("cBrown") }),
  scarf: sprite(SCARF, { k, g: r("gold", 3), ...ramp3("cPlum") }),
  soup: sprite(BOWL, { k, w: hex("#e8e4dc"), c: hex("#c89a58"), ...ramp3("wood") }),
  stew: sprite(BOWL, { k, w: hex("#e8e4dc"), c: hex("#8a5a34"), ...ramp3("wood") }),
  porridge: sprite(BOWL, { k, w: hex("#e8e4dc"), c: hex("#e8dcc0"), ...ramp3("wood") }),
  fishSoup: sprite(BOWL, { k, w: hex("#e8e4dc"), c: hex("#c8d0c8"), ...ramp3("wood") }),
  greenSoup: sprite(BOWL, { k, w: hex("#e8e4dc"), c: hex("#8aa860"), ...ramp3("wood") }),
  mushStew: sprite(BOWL, { k, w: hex("#e8e4dc"), c: hex("#a87a50"), ...ramp3("cBrown") }),
  cupWine: sprite(CUP, { k, w: hex("#f0e8e0"), c: hex("#8a2a3a"), ...ramp3("wood") }),
  cupTea: sprite(CUP, { k, w: hex("#f0e8e0"), c: hex("#a8a050"), ...ramp3("cMint") }),
  cupMilk: sprite(CUP, { k, w: hex("#f0e8e0"), c: hex("#f4f0e4"), ...ramp3("cBlue") }),
  cupWater: sprite(CUP, { k, w: hex("#f0e8e0"), c: hex("#c8dce4"), ...ramp3("cGray") }),
  nuts: sprite(NUTS, { k, ...hexes("#c08050", "#7a4a2a", "#3e2418") }),
  potato: sprite(POTATO, { k, w: hex("#f0d890"), ...hexes("#c87a8a", "#8a4a5a", "#4a2430") }),
  skewer: sprite(SKEWER, { k, b: r("wood", 3), ...hexes("#e8b070", "#b87038", "#6a3a1e") }),
  driedFish: sprite(DRIEDFISH, { k, w: hex("#ffffff"), b: r("thatch", 3), ...hexes("#d8c8a0", "#a89070", "#5a4a38") }),
  pie: sprite(PIE, { k, c: hex("#a83a3a"), b: hex("#a87038"), ...hexes("#f0d090", "#d8a050", "#8a5a28") }),
  honeyCake: sprite(PIE, { k, c: hex("#f0c040"), b: hex("#a87038"), ...hexes("#f8e0a0", "#e0b060", "#8a6028") }),
  sickle: sprite(SICKLE, { k, b: r("wood", 3), ...ramp3("iron") }),
  rod: sprite(ROD, { k, b: r("wood", 3), m: r("wood", 1), w: hex("#e8e4dc"), r: hex("#c8403a") }),
  log: sprite(LOGS, { k, r: hex("#e0c088"), b: r("wood", 2), ...hexes("#9a7048", "#6a4a2a", "#3a2618") }),
  firewood: sprite(LOGS, { k, r: hex("#e8c890"), b: r("thatch", 2), ...hexes("#b08050", "#7a5030", "#3e2418") }),
  charcoal: sprite(LOGS, { k, r: hex("#7a6a70"), b: r("thatch", 1), ...hexes("#4a4450", "#2a262e", "#141218") }),
  potionG: sprite(FLASK, { k, c: r("wood", 3), g: hex("#cfe0e0"), ...hexes("#c8f0a8", "#6aa848", "#2e5a20") }),
  potionP: sprite(FLASK, { k, c: r("wood", 3), g: hex("#cfe0e0"), ...hexes("#e8c8f0", "#9a5ab8", "#4a2a5a") }),
  potionA: sprite(FLASK, { k, c: r("wood", 3), g: hex("#cfe0e0"), ...hexes("#ffe8a0", "#d8a030", "#7a5018") }),
}
