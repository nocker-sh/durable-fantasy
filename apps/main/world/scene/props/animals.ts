import { createColorMaterial as colorMat } from "#/lib/graphics/create-color-material"
import { M } from "#/world/scene/construction/materials"
import { blockCircle } from "#/world/scene/block-circle"
import type { Thing } from "#/world/scene/props/types"
import { y0 } from "#/world/scene/props/helpers/materials/y0"
import { tin, ash, furGrey, furGinger, furBlack } from "#/world/scene/props/materials"

const animalsThings: Readonly<Record<string, Thing>> = {
  birdcage: {
    name: "軒の鳥かご",
    group: "生き物",
    wall: "hang",
    r: 0,
    build: (inputProps) => {
      const gb = inputProps.builder
      const x = inputProps.x
      const z = inputProps.z

      const y = y0(x, z)
      gb.box({ side: tin, top: null, x0: x - 0.12, y0: y + 1.5, z0: z - 0.12, x1: x + 0.12, y1: y + 1.52, z1: z + 0.12, repeat: 1 })
      for (const entry of [
        [-1, -1],
        [1, -1],
        [-1, 1],
        [1, 1],
      ]) {
        const sx = entry[0]
        const sz = entry[1]
        gb.box({ side: tin, top: null, x0: x + sx * 0.11 - 0.01, y0: y + 1.52, z0: z + sz * 0.11 - 0.01, x1: x + sx * 0.11 + 0.01, y1: y + 1.8, z1: z + sz * 0.11 + 0.01, repeat: 1 })
      }
      gb.box({ side: tin, top: ash, x0: x - 0.13, y0: y + 1.8, z0: z - 0.13, x1: x + 0.13, y1: y + 1.83, z1: z + 0.13, repeat: 1 })
      gb.box({ side: colorMat(0xd8b84a), top: null, x0: x - 0.04, y0: y + 1.56, z0: z - 0.03, x1: x + 0.04, y1: y + 1.64, z1: z + 0.03, repeat: 1 })
    },
  },
  "bird-feeder": {
    name: "小鳥の餌台",
    group: "生き物",
    r: 0.15,
    build: (inputProps) => {
      const gb = inputProps.builder
      const x = inputProps.x
      const z = inputProps.z

      const y = y0(x, z)
      gb.box({ side: M.woodV, top: null, x0: x - 0.025, y0: y, z0: z - 0.025, x1: x + 0.025, y1: y + 1.1, z1: z + 0.025, repeat: 1 })
      gb.box({ side: M.wood, top: ash, x0: x - 0.16, y0: y + 1.1, z0: z - 0.16, x1: x + 0.16, y1: y + 1.14, z1: z + 0.16, repeat: 1 })
      gb.box({ side: M.woodDark, top: M.woodDark, x0: x - 0.18, y0: y + 1.3, z0: z - 0.18, x1: x + 0.18, y1: y + 1.34, z1: z + 0.18, repeat: 1 })
      blockCircle(x, z, 0.1)
    },
  },
  beehives: {
    name: "軒下の蜂の巣箱",
    group: "生き物",
    wall: "hang",
    r: 0,
    build: (inputProps) => {
      const gb = inputProps.builder
      const x = inputProps.x
      const z = inputProps.z
      const along = inputProps.along

      // two straw skeps on a low bench against the wall, out of the house and the coop
      const y = y0(x, z)
      const lState = along ? [0.38, 0.13] : [0.13, 0.38],
        lx = lState[0],
        lz = lState[1]
      gb.box({ side: M.woodDark, top: M.wood, x0: x - lx, y0: y + 0.42, z0: z - lz, x1: x + lx, y1: y + 0.46, z1: z + lz, repeat: 1 })
      for (const s of [-0.3, 0.3])
        gb.box({
          side: M.woodDark,
          top: null,
          x0: x + (along ? s : 0) - 0.04,
          y0: y,
          z0: z + (along ? 0 : s) - 0.04,
          x1: x + (along ? s : 0) + 0.04,
          y1: y + 0.42,
          z1: z + (along ? 0 : s) + 0.04,
          repeat: 1,
        })
      for (const s of [-0.18, 0.18])
        for (const t = { value: 0 }; t.value < 4; t.value++)
          gb.cyl({
            side: M.thatch,
            top: t.value === 3 ? M.thatch : null,
            centerX: x + (along ? s : 0),
            centerZ: z + (along ? 0 : s),
            fromY: y + 0.46 + t.value * 0.08,
            toY: y + 0.54 + t.value * 0.08,
            fromRadius: 0.13 - t.value * 0.025,
            toRadius: 0.12 - t.value * 0.03,
            segments: 9,
            repeat: 1,
          })
    },
  },
  cat: {
    name: "丸くなった猫",
    group: "生き物",
    r: 0,
    build: (inputProps) => {
      const gb = inputProps.builder
      const x = inputProps.x
      const z = inputProps.z
      const seed = inputProps.seed

      const y = y0(x, z)
      const fur = [furGrey, furGinger, furBlack][seed % 3]
      gb.cyl({ side: fur, top: fur, centerX: x, centerZ: z, fromY: y, toY: y + 0.1, fromRadius: 0.13, toRadius: 0.12, segments: 8, repeat: 1 })
      gb.box({ side: fur, top: fur, x0: x + 0.06, y0: y + 0.06, z0: z - 0.05, x1: x + 0.15, y1: y + 0.15, z1: z + 0.04, repeat: 1 })
      gb.box({ side: fur, top: null, x0: x + 0.08, y0: y + 0.15, z0: z - 0.04, x1: x + 0.1, y1: y + 0.18, z1: z - 0.02, repeat: 1 })
      gb.box({ side: fur, top: null, x0: x + 0.12, y0: y + 0.15, z0: z - 0.04, x1: x + 0.14, y1: y + 0.18, z1: z - 0.02, repeat: 1 })
    },
  },
}

export { animalsThings }
