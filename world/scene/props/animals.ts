import { colorMat } from "../gfx"
import { M } from "../build"
import { blockCircle } from "../world"
import type { Thing } from "./types.ts"
import { y0, tin, ash, furGrey, furGinger, furBlack } from "./materials.ts"

const animalsThings: Readonly<Record<string, Thing>> = {
  birdcage: {
    name: "軒の鳥かご",
    group: "生き物",
    wall: "hang",
    r: 0,
    build: (gb, x, z) => {
      const y = y0(x, z)
      gb.box(tin, null, x - 0.12, y + 1.5, z - 0.12, x + 0.12, y + 1.52, z + 0.12, 1)
      for (const [sx, sz] of [
        [-1, -1],
        [1, -1],
        [-1, 1],
        [1, 1],
      ])
        gb.box(tin, null, x + sx * 0.11 - 0.01, y + 1.52, z + sz * 0.11 - 0.01, x + sx * 0.11 + 0.01, y + 1.8, z + sz * 0.11 + 0.01, 1)
      gb.box(tin, ash, x - 0.13, y + 1.8, z - 0.13, x + 0.13, y + 1.83, z + 0.13, 1)
      gb.box(colorMat(0xd8b84a), null, x - 0.04, y + 1.56, z - 0.03, x + 0.04, y + 1.64, z + 0.03, 1)
    },
  },
  "bird-feeder": {
    name: "小鳥の餌台",
    group: "生き物",
    r: 0.15,
    build: (gb, x, z) => {
      const y = y0(x, z)
      gb.box(M.woodV, null, x - 0.025, y, z - 0.025, x + 0.025, y + 1.1, z + 0.025, 1)
      gb.box(M.wood, ash, x - 0.16, y + 1.1, z - 0.16, x + 0.16, y + 1.14, z + 0.16, 1)
      gb.box(M.woodDark, M.woodDark, x - 0.18, y + 1.3, z - 0.18, x + 0.18, y + 1.34, z + 0.18, 1)
      blockCircle(x, z, 0.1)
    },
  },
  cat: {
    name: "丸くなった猫",
    group: "生き物",
    r: 0,
    build: (gb, x, z, seed) => {
      const y = y0(x, z)
      const fur = [furGrey, furGinger, furBlack][seed % 3]
      gb.cyl(fur, fur, x, z, y, y + 0.1, 0.13, 0.12, 8, 1)
      gb.box(fur, fur, x + 0.06, y + 0.06, z - 0.05, x + 0.15, y + 0.15, z + 0.04, 1)
      gb.box(fur, null, x + 0.08, y + 0.15, z - 0.04, x + 0.1, y + 0.18, z - 0.02, 1)
      gb.box(fur, null, x + 0.12, y + 0.15, z - 0.04, x + 0.14, y + 0.18, z - 0.02, 1)
    },
  },
}

export { animalsThings }
