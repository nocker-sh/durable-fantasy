// Rebuild the browser icon from the game's compass: bun scripts/export-favicon.ts.
import { writeFileSync } from "node:fs"
import { SPRITES } from "../world/art/pixel-art.ts"

const icon = SPRITES.compass
const colors = new Map<string, string[]>()
for (let y = 0; y < icon.h; y++)
  for (let x = 0; x < icon.w; x++) {
    if (!icon.alpha(x, y)) continue
    const color = icon
      .get(x, y)
      .map((value) => value.toString(16).padStart(2, "0"))
      .join("")
    const paths = colors.get(color) ?? []
    paths.push(`M${x} ${y}h1v1h-1z`)
    colors.set(color, paths)
  }
const paths = [...colors].map(([color, pixels]) => `<path fill="#${color}" d="${pixels.join("")}"/>`).join("")
writeFileSync(
  new URL("../public/favicon.svg", import.meta.url),
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${icon.w} ${icon.h}" width="32" height="32" shape-rendering="crispEdges">${paths}</svg>\n`,
)
