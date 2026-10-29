// DOM-free pixel buffers and palette ramps (the noise is lib/engine/noise.ts).

import { hex, type RGB } from "../../lib/graphics/pixel-buffer.ts"
export { hex, PixelBuffer as PixBuf, type RGB } from "../../lib/graphics/pixel-buffer.ts"
export { Rng } from "../../lib/engine/random.ts"

const RAMPS_HEX: Record<string, string[]> = {
  grass: ["#323d3c", "#3f5240", "#566a45", "#71834c", "#909b58", "#b2b26c"],
  wild: ["#2a3236", "#36433d", "#465741", "#5b6d47", "#76854f"],
  leaf: ["#253038", "#33463e", "#465f42", "#5f7a47", "#7f964f", "#a8b062"],
  leaf2: ["#2a3040", "#38454a", "#4a5e50", "#62785a", "#839468"],
  autumn: ["#3a2c3c", "#6a3f44", "#985a4a", "#c08052", "#dca866"],
  stone: ["#3d3a4a", "#5a5562", "#7a7272", "#9a8f84", "#bbae98", "#d9cbae"],
  sand: ["#4c4452", "#6f6268", "#94837a", "#b6a28a", "#d4c09e", "#ebdcb8"],
  redsand: ["#4a2e32", "#74403c", "#9a5846", "#bc7858", "#d69c78", "#ecc6a6"],
  frost: ["#545c6c", "#78808e", "#9ea6b2", "#c4ccd4", "#e2e8ec", "#f4f8fa"],
  moss: ["#1c2826", "#26362e", "#344832", "#465c38", "#5e7240", "#7a8a4c"],
  needles: ["#261e24", "#3a2c2c", "#523c34", "#6a4e3c", "#826446"],
  dirt: ["#3f3640", "#5a4a4c", "#7a6254", "#987c60", "#b49870"],
  mud: ["#2e2832", "#40353a", "#55453e", "#6b5544", "#82684e"],
  plaster: ["#5a5060", "#857774", "#ad9c8a", "#cdb99c", "#e4d3b2", "#f2e6c8"],
  timber: ["#261e2a", "#3a2c32", "#4f3a3a", "#664b42", "#7e604c"],
  roof: ["#30243a", "#55303e", "#7d3f42", "#a35646", "#c27650", "#d99a62"],
  roof2: ["#2c2838", "#463a44", "#664e4c", "#87685a", "#a8876a", "#c4a67c"],
  roof3: ["#2e2a30", "#4a3a30", "#6e5034", "#93683c", "#b48a4c", "#cfaa66"],
  slate2: ["#1f2a2c", "#2c3c3e", "#3e5452", "#566e68", "#748a80", "#98aa9a"],
  board: ["#2a2024", "#43342e", "#5f4836", "#7b5e42", "#977650", "#b08e62"],
  slate: ["#232638", "#313a52", "#425270", "#5a6e88", "#7c8fa0", "#a4b2b4"],
  thatch: ["#3a3034", "#5e4a3c", "#8a6c46", "#ae8e52", "#cdb064", "#e2cc82"],
  water: ["#1e2840", "#283a5a", "#334f72", "#45698a", "#6a8ea2", "#a6c2c2"],
  wood: ["#2e2430", "#47343a", "#644a44", "#82644e", "#a0805c"],
  // furniture woods and the paints a chest or cupboard is decorated with (scene/construction/furnishings.ts)
  pine: ["#4a3a30", "#76603e", "#a08650", "#c2a866", "#dcc488"],
  oak: ["#2a1c1e", "#4a2e28", "#6e4430", "#8e5e3a", "#ac7a4a"],
  birch: ["#5a5050", "#857a6e", "#ab9e86", "#c9bc9c", "#e0d4b4"],
  walnut: ["#1e1618", "#2e2020", "#45302a", "#5c4232", "#74563e"],
  blackOak: ["#16141a", "#221e24", "#332c30", "#463c3c", "#5a4e48"],
  paintBlue: ["#1c2234", "#2a3650", "#3c5070", "#567092", "#7a92ac"],
  paintRed: ["#2c1418", "#4c2024", "#6e302e", "#904438", "#ac5e48"],
  paintGreen: ["#182420", "#24382e", "#34503e", "#4a6a4e", "#668664"],
  glass: ["#1c2236", "#2a3550", "#3e5068", "#6a7e8c"],
  gold: ["#5a4030", "#9a7440", "#c8a050", "#ead27a"],
  iron: ["#1e1e2a", "#33343f", "#4c4e5a", "#6c707a", "#9aa0a4"],
  // the better metals a weapon is forged in (core/items/weapons.ts)
  steel: ["#1c2230", "#2e3a4e", "#4a5c72", "#7890a6", "#c4d2dc"],
  engine: ["#1a161e", "#2e2630", "#4a3c40", "#7a6458", "#c8a874"],
  fire: ["#5a2030", "#a8402c", "#e07a2c", "#f6b84a", "#fff0a0"],
  // people
  skin1: ["#6a4448", "#9a6658", "#c48e74", "#e0b896", "#f2d4b4"],
  skin2: ["#4e3438", "#7a5048", "#a06e56", "#c08e6c", "#dcb08a"],
  skin3: ["#3a2830", "#5a3c38", "#7a5444", "#986c52", "#b88a66"],
  hBrown: ["#2a1e24", "#46302e", "#664438", "#86603e", "#b08a5a"],
  hBlack: ["#18161e", "#26222c", "#3a3440", "#544a5e", "#7a7488"],
  hBlond: ["#5a4232", "#94703e", "#c4a052", "#e6cc7c", "#fff0b8"],
  hRed: ["#3e1e22", "#6e3228", "#9c4c2c", "#c47038", "#ec9c5c"],
  hGray: ["#48444e", "#787274", "#a49e98", "#d2ccc0", "#f2eee4"],
  cRed: ["#3a1e2a", "#5e2a32", "#86383a", "#a85048", "#c47058"],
  cBlue: ["#1e2236", "#2c3650", "#3e4e6c", "#566c88", "#7a8ea2"],
  cMustard: ["#3e3026", "#6a5232", "#9a7a3e", "#c09a52", "#dcbc6e"],
  cGreen: ["#1e2a26", "#2e3e32", "#43573e", "#5c7250", "#7c8e62"],
  cPlum: ["#26182a", "#3e2638", "#583448", "#6e4a5e", "#8c6876"],
  cBrown: ["#241a1e", "#3c2a28", "#58402e", "#745638", "#927046"],
  // brighter, cuter garment colours
  cRose: ["#4a353a", "#6b4b53", "#8d666c", "#ae8284", "#c69992"],
  cSky: ["#3d3c46", "#515663", "#6a7581", "#88949f", "#a5b0b4"],
  cCream: ["#665a53", "#897d70", "#ac9f8b", "#c7bba6", "#d6cab3"],
  cMint: ["#39403c", "#4c5951", "#667769", "#869885", "#a5b49d"],
  cWine: ["#37282b", "#51343b", "#6d474a", "#8a5d5b", "#a36f65"],
  cHoney: ["#544235", "#735a44", "#937955", "#b29869", "#c6b280"],
  cLilac: ["#3d343d", "#534857", "#6f6173", "#8f8092", "#ac9dab"],
  cLinen: ["#5c5460", "#8a8080", "#b4aa9c", "#d8ceb8", "#f0e8d4"],
  cGray: ["#24242e", "#3a3a46", "#54545e", "#6e6e74", "#8c8a8a"],
  leatherD: ["#1c1418", "#2e2024", "#43302e", "#5a4236", "#725642"],
  leatherR: ["#2c1618", "#4a2422", "#6a382c", "#8a5036", "#a66a44"],
  leatherK: ["#141218", "#1e1c24", "#2c2a34", "#403c46", "#58525a"],
  leather: ["#2a1c20", "#46302c", "#664632", "#86603e", "#a27c50"],
  wool: ["#5a5460", "#8a8484", "#b4aea4", "#d8d2c4", "#f2eee2"],
  pig: ["#6a3e48", "#9a5e62", "#c4867e", "#e0aa9a", "#f2c8b6"],
  hen: ["#5a4a4a", "#8a7a70", "#b4a894", "#dcd2bc", "#f6f0e0"],
  henB: ["#2a1e22", "#4a2e2a", "#784632", "#a0623c", "#c08450"],
  comb: ["#5a1e26", "#962e30", "#c84838"],
  beak: ["#7a5228", "#c09040", "#e8c060"],
}

export const RAMPS: Record<string, RGB[]> = {}
for (const k in RAMPS_HEX) RAMPS[k] = RAMPS_HEX[k].map(hex)

export const OUTLINE: RGB = hex("#221a26")

const B = [
  [0, 8, 2, 10],
  [12, 4, 14, 6],
  [3, 11, 1, 9],
  [15, 7, 13, 5],
]
export function bayer(x: number, y: number): number {
  return B[y & 3][x & 3] / 16 - 0.47
}

export function pick(ramp: string, b: number, x: number, y: number, dither = 0.7): RGB {
  const r = RAMPS[ramp]
  const n = r.length
  const t = Math.min(1, Math.max(0, b)) * (n - 1) + bayer(x, y) * dither
  return r[Math.min(n - 1, Math.max(0, Math.round(t)))]
}

export { hash2, vnoise, fbm } from "../../lib/engine/noise.ts"
