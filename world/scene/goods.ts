import type { RGB } from "#/lib/graphics/pixel-types"
import { R } from "#/world/scene/helpers/goods/r"

export const GPPU = 64

export const FR: Record<string, RGB[]> = {
  apple: R(["#3a1424", "#6e2030", "#a8323a", "#d0543e", "#ec9060"]),
  appleG: R(["#2a3420", "#4a5a28", "#76862e", "#a4b040", "#d4d878"]),
  pear: R(["#3a3420", "#6a6428", "#a29a36", "#cfc254", "#ece08c"]),
  plum: R(["#1e1428", "#3a2244", "#5a3462", "#7c4e80", "#a07aa8"]),
  onion: R(["#4a2a20", "#7a4a2a", "#a8703a", "#cc9a58", "#ead0a0"]),
  turnip: R(["#4a2a44", "#7a4a6c", "#c8a8b8", "#e8dcd8", "#fbf6f0"]),
  cabbage: R(["#1e3428", "#2e4e34", "#4a7040", "#74984e", "#a8c272"]),
  egg: R(["#6a5a4a", "#a0907a", "#cebea4", "#e8dcc4", "#fbf4e4"]),
  bread: R(["#3e2418", "#6a3e22", "#9c6430", "#c88e46", "#e6b66a"]),
  cheese: R(["#5a4020", "#9a7430", "#d0a844", "#ecca6a", "#f8e6a4"]),
  rind: R(["#3e2a1c", "#6a4628", "#94683a"]),
  fish: R(["#262c3a", "#465068", "#727e92", "#a8b2bc", "#e2e8e8"]),
  trout: R(["#2a2a26", "#4a5038", "#7a8250", "#b0a874", "#e8dcb0"]),
  herring: R(["#1e2632", "#34465a", "#5c7488", "#9cb0bc", "#eef2f2"]),
  carrot: R(["#5a2414", "#963c1c", "#cc6224", "#ec8a34", "#f8b464"]),
  grape: R(["#1a1430", "#2e2450", "#4a3a72", "#6c5a94", "#9a8ab8"]),
  clay: R(["#3a2420", "#6a3a2a", "#9a5a3a", "#c07a4c", "#dca070"]),
  jar: R(["#22303a", "#344c56", "#4c6e72", "#6e948a", "#a2bea8"]),
  garlic: R(["#6a5a5a", "#a09090", "#ccc0b8", "#ece4dc", "#fcf8f2"]),
  sausage: R(["#2e1418", "#5a2424", "#843a32", "#a85a42", "#c87e5a"]),
  leafG: R(["#1e2e22", "#2e4a2e", "#46683a", "#68884a", "#94aa62"]),
}
