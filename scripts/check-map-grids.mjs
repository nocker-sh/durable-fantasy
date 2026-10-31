// Compare every published outdoor cell with an actual rendered scene; this does not test server travel.
import { chromium } from "playwright-core"
import { readFile } from "node:fs/promises"
import { MAP_EXPORT_IDS } from "#/scripts/lib/map-export-ids"
import { readRuntimeModuleUrl } from "#resources/scripts/lib/read-runtime-module-url"

const base = process.env.BASE ?? "https://durable-fantasy.localhost"
const requested = process.argv.slice(2)
const maps = requested.length ? requested : MAP_EXPORT_IDS
const browser = await chromium.launch({ channel: "chrome", args: ["--disable-http2"] })
const errors = []
try {
  for (const map of maps) {
    const context = await browser.newContext({ ignoreHTTPSErrors: true, viewport: { width: 1280, height: 800 } })
    try {
      const page = await context.newPage()
      page.on("pageerror", (error) => errors.push(error.message))
      await page.addInitScript(() => performance.setResourceTimingBufferSize(20000))
      await page.goto(new URL(`/dev/view?map=${encodeURIComponent(map)}&time=12:00&ui=0`, base).href)
      await page.waitForFunction(() => document.body.dataset.ready === "1", null, { timeout: 180000 })
      const modules = await Promise.all(["/world/scene/world", "/world/scene/runtime/definitions"].map((path) => readRuntimeModuleUrl(page, path)))
      const expected = JSON.parse(await readFile(new URL(`../world/maps/${map}.json`, import.meta.url), "utf8"))
      const result = await page.evaluate(
        async (input) => {
          const world = await import(input.modules[0])
          const definitions = await import(input.modules[1])
          if (world.layout.value !== definitions.MAP_SCENES[input.map].layout) throw Error(`Rendered a different map: ${input.map}`)
          if (world.WN !== input.expected.size) throw Error(`Grid dimensions differ: ${input.map}`)
          const mismatches = []
          for (let z = 0; z < world.WN; z++)
            for (let x = 0; x < world.WN; x++) {
              if (Boolean(world.blocked[z * world.WN + x]) !== (input.expected.rows[z][x] === "#")) mismatches.push([x, z])
            }
          if (mismatches.length) throw Error(`Rendered grid differs: ${input.map}; ${mismatches.length} cells; ${JSON.stringify(mismatches.slice(0, 10))}`)
          return { map: input.map, cells: world.WN * world.WN }
        },
        { modules, expected, map },
      )
      console.log(JSON.stringify(result))
    } finally {
      await context.close()
    }
  }
  if (errors.length) throw Error(errors.join("\n"))
} finally {
  await browser.close()
}
