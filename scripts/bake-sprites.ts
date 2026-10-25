// Bake the town residents' sprites: every anim they play from all 8 views, one strip per file
// (public/tmp/sprites/<resident>-<anim>-<view>.webp) plus sprites.json. Residents never
// change looks, so the game loads these instead of rendering them.
//
// The strips are drawn by the game's own renderer inside Chromium (the dev server must be
// running), so they match what the browser would draw pixel for pixel; Node's maths differs in
// the last bits and flips a few shading pixels. Run after changing the renderer or a resident:
//   bun scripts/bake-sprites.ts [dev server URL] [--resume]
// Needs cwebp on PATH and a Playwright Chromium (npx playwright-core install chromium).
import { execFileSync } from "node:child_process"
import { existsSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs"
import { availableParallelism, tmpdir } from "node:os"
import { join } from "node:path"
import { chromium } from "playwright-core"
import { FH, FRAMES, FW } from "../world/scene/figure.ts"
import { RESIDENTS, RESIDENT_ANIMS, RESIDENT_LOOKS } from "../world/town/residents.ts"
import { stripFile, type SpriteManifest } from "../world/scene/baked.ts"
import { MAPS } from "../world/maps/index.ts"
import { lookKey } from "../world/scene/sprite-key.ts"

const args = process.argv.slice(2)
/** --resume keeps strips already baked (after an interrupted run) */
const resume = args.includes("--resume")
/** --only=名前,名前 re-bakes just those residents, keeping everyone else's strips */
const only = args
  .find((a) => a.startsWith("--only="))
  ?.slice(7)
  .split(",")
const URL = args.find((a) => !a.startsWith("--")) ?? "https://durable-fantasy.localhost/"
const OUT = join(import.meta.dirname, "..", "public", MAPS.phanthiet.assets.sprites)
const PAGES = Math.max(1, availableParallelism() - 2)

type Job = { resident: number; anim: string; view: number }
const jobs: Job[] = []
RESIDENTS.forEach((r, resident) => {
  if (only && !only.includes(r.name)) return
  RESIDENT_ANIMS.forEach((anim) => {
    for (let view = 0; view < 8; view++) jobs.push({ resident, anim, view })
  })
})

if (!resume && !only) rmSync(OUT, { recursive: true, force: true })
mkdirSync(OUT, { recursive: true })
const tmp = mkdtempSync(join(tmpdir(), "bake-"))
const started = Date.now()
const browser = await chromium.launch()
let done = 0
await Promise.all(
  Array.from({ length: PAGES }, async (_, p) => {
    // a context per page, so each renders in its own process
    const page = await (await browser.newContext({ ignoreHTTPSErrors: true })).newPage()
    // a blank page on the dev server's origin, so its modules can be imported
    await page.route("**/__bake", (route) => route.fulfill({ contentType: "text/html", body: "<!doctype html>" }))
    await page.goto(new globalThis.URL("/__bake", URL).href)
    for (const job of jobs.filter((_, i) => i % PAGES === p)) {
      if (resume && existsSync(join(OUT, stripFile(job.resident, job.anim, job.view)))) {
        done++
        continue
      }
      const png = await page.evaluate(async ({ resident, anim, view }) => {
        const people = await import("/world/scene/figure.ts")
        const residents = await import("/world/town/residents.ts")
        const strip = people.buildSheetStrip(residents.RESIDENT_LOOKS[resident], anim, residents.RESIDENTS[resident].item, view)
        const canvas = new OffscreenCanvas(strip.w, strip.h)
        canvas.getContext("2d")!.putImageData(new ImageData(strip.data, strip.w, strip.h), 0, 0)
        const blob = await canvas.convertToBlob({ type: "image/png" })
        return Array.from(new Uint8Array(await blob.arrayBuffer()))
      }, job)
      const file = join(tmp, `${p}.png`)
      writeFileSync(file, Buffer.from(png))
      execFileSync("cwebp", ["-quiet", "-lossless", "-z", "9", "-exact", file, "-o", join(OUT, stripFile(job.resident, job.anim, job.view))])
      if (++done % 50 === 0) console.log(`${done}/${jobs.length}`)
    }
  }),
)
await browser.close()
rmSync(tmp, { recursive: true, force: true })

const manifest: SpriteManifest = {
  frame: [FW, FH],
  residents: RESIDENTS.map((r, i) => ({
    name: r.name,
    key: lookKey(RESIDENT_LOOKS[i], r.item),
    anims: Object.fromEntries(RESIDENT_ANIMS.map((a) => [a, FRAMES[a]])),
  })),
}
writeFileSync(join(OUT, "sprites.json"), JSON.stringify(manifest))
console.log(`baked ${jobs.length} strips in ${((Date.now() - started) / 1000).toFixed(1)}s`)
