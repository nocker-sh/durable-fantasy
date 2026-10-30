// Capture all buildings, including private homes, from their live dev previews.
// Run with the dev server up: bun scripts/shoot-building-floors.ts [outdir]
import { mkdirSync, writeFileSync } from "node:fs"
import { join } from "node:path"
import { chromium } from "playwright-core"
import { HOUSES } from "#/world/town/houses"
import { floorPlan } from "#/world/town/floorplan/floor-plan"

const base = process.env.BASE ?? "https://durable-fantasy.localhost"
const out = process.argv[2] ?? "public/tmp/interiors"
mkdirSync(out, { recursive: true })
const browser = await chromium.launch({ channel: "chrome", args: ["--disable-http2"] })
const captures: { house: string; name: string; floor: number; light: string; file: string }[] = []
try {
  const page = await browser.newPage({ ignoreHTTPSErrors: true, viewport: { width: 1280, height: 900 } })
  const errors: string[] = []
  page.on("pageerror", (error) => errors.push(error.message))
  for (const house of HOUSES) {
    await page.goto(`${base}/dev/houses/${encodeURIComponent(house.id)}`, { waitUntil: "domcontentloaded" })
    const selector = page.getByLabel("室内の階")
    await selector.waitFor({ timeout: 60_000 })
    for (let floor = 0; floor < floorPlan(house.id).floors; floor++) {
      await selector.selectOption(String(floor))
      for (const light of ["day", "night"] as const) {
        await page.getByLabel("夜の照明").setChecked(light === "night")
        const canvas = page.locator('canvas[data-ready="1"]')
        await canvas.waitFor({ timeout: 30_000 })
        if (errors.length) throw new Error(errors.join("\n"))
        const file = `${house.id}-floor-${floor + 1}-${light}.png`
        await canvas.screenshot({ path: join(out, file) })
        captures.push({ house: house.id, name: house.name, floor: floor + 1, light, file })
      }
    }
    console.log(`${house.id}: ${captures.length} images`)
  }
  writeFileSync(join(out, "manifest.json"), JSON.stringify(captures, null, 2) + "\n")
  console.log(`Saved ${captures.length} images from ${HOUSES.length} buildings to ${out}`)
} finally {
  await browser.close()
}
